import type {FastifyInstance} from 'fastify';
import {fromNodeHeaders} from 'better-auth/node';
import pg from 'pg';
import {createHash} from 'node:crypto';
import {auth} from './auth.js';
import {INITIAL_PLATEWORK, WORK_ACTIONS, availableActions, advancePlatework, PlateworkInvalidAction} from '@the-pall/game-core';
import type {PlateworkAction, PlateworkState} from '@the-pall/game-core';

const db = new pg.Pool({connectionString: process.env.DATABASE_URL});
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
type Params = {id: string};
type CharacterState = {origin: string; tutorial_stage: number; tutorial_status: string};
type Payload = {requestId: string; expectedRevision: number; action: PlateworkAction | 'take_work_paper'};

function parseCommand(body: unknown): Payload {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw Error('invalid_body');
  const obj = body as Record<string, unknown>;
  if (Object.keys(obj).sort().join(',') !== 'action,expectedRevision,requestId') throw Error('invalid_fields');
  if (typeof obj.requestId !== 'string' || !UUID.test(obj.requestId)) throw Error('invalid_request_id');
  if (!Number.isSafeInteger(obj.expectedRevision) || (obj.expectedRevision as number) < 0) throw Error('invalid_revision');
  if (obj.action !== 'take_work_paper' && !WORK_ACTIONS.includes(obj.action as PlateworkAction)) throw Error('invalid_action');
  return {
    action: obj.action as Payload['action'],
    requestId: obj.requestId as string,
    expectedRevision: obj.expectedRevision as number
  };
}
function snapshot(char: CharacterState, work: PlateworkState | null) {
  return {
    stage: char.tutorial_stage,
    tutorialStatus: char.tutorial_status,
    work: work === null ? null : {...work},
    availableActions: work === null ? [] : availableActions(work),
    requiredNumberAuthored: false, // Don't invent unapproved municipal identifiers.
    ownership: 'employer',         // Never grant the metal/tools to player inventory.
    tutorialPayout: {coins: 0, ordinaryXp: 0, items: 0}
  };
}

export function registerMillhandWorkRoutes(app: FastifyInstance) {
  app.addHook('onClose', async () => {await db.end();});

  app.get<{Params: Params}>('/api/characters/:id/millhand/work', async (req, reply) => {
    const session = await auth.api.getSession({headers: fromNodeHeaders(req.headers)});
    if (!session?.user.emailVerified) return reply.code(401).send({error:'unauthorized'});
    if (!UUID.test(req.params.id)) return reply.code(404).send({error:'not_found'});

    const ch = await db.query<CharacterState>(
      'SELECT origin,tutorial_stage,tutorial_status FROM player_characters WHERE id=$1 AND account_id=$2',
      [req.params.id,session.user.id]
    );
    if (!ch.rowCount) return reply.code(404).send({error:'not_found'});
    if (ch.rows[0].origin !== 'Millhand') return reply.code(404).send({error:'not_found'});
    const state = await db.query<{state: PlateworkState}>(
      'SELECT state FROM player_character_platework WHERE character_id=$1',[req.params.id]
    );
    return snapshot(ch.rows[0],state.rows[0]?.state ?? null);
  });

  app.post<{Params: Params}>('/api/characters/:id/millhand/work', async (req, reply) => {
    const session = await auth.api.getSession({headers: fromNodeHeaders(req.headers)});
    if (!session?.user.emailVerified) return reply.code(401).send({error:'unauthorized'});
    if (!UUID.test(req.params.id)) return reply.code(404).send({error:'not_found'});
    const origin = req.headers.origin;
    if (origin && origin !== (process.env.AUTH_BASE_URL ?? 'http://127.0.0.1:5173')) return reply.code(403).send({error:'invalid_origin'});
    if (!req.headers['content-type']?.toLowerCase().startsWith('application/json')) return reply.code(415).send({error:'json_required'});
    let command: Payload;
    try {command = parseCommand(req.body);}
    catch(e) {return reply.code(400).send({error:e instanceof Error ? e.message : 'invalid_action'});}
    const hash = createHash('sha256').update(JSON.stringify({action:command.action,expectedRevision:command.expectedRevision})).digest('hex');
    const client = await db.connect();
    let inTransaction = false;
    try {
      await client.query('BEGIN');
      inTransaction = true;
      // Ownership and full character row lock are checked before receipts and state.
      const ch = await client.query<CharacterState>(
        'SELECT origin,tutorial_stage,tutorial_status FROM player_characters WHERE id=$1 AND account_id=$2 FOR UPDATE',
        [req.params.id, session.user.id]
      );
      if (!ch.rowCount || ch.rows[0].origin !== 'Millhand') {
        await client.query('ROLLBACK'); inTransaction = false;
        return reply.code(404).send({error:'not_found'});
      }

      const oldReceipt = await client.query<{request_hash:string;result:unknown}>(
        'SELECT request_hash,result FROM player_character_work_receipts WHERE character_id=$1 AND request_id=$2',
        [req.params.id,command.requestId]
      );
      if (oldReceipt.rowCount) {
        await client.query('COMMIT'); inTransaction = false;
        if (oldReceipt.rows[0].request_hash !== hash) return reply.code(409).send({error:'idempotency_key_reuse'});
        return oldReceipt.rows[0].result;
      }
      const workQuery = await client.query<{state:PlateworkState;revision:string}>(
        'SELECT state,revision FROM player_character_platework WHERE character_id=$1 FOR UPDATE',
        [req.params.id]
      );
      const current = workQuery.rows[0]?.state ?? null;
      const currentRevision = current?.revision ?? 0;
      if (command.expectedRevision !== currentRevision) {
        await client.query('ROLLBACK'); inTransaction = false;
        return reply.code(409).send({error:'stale_revision',currentRevision});
      }
      let next: PlateworkState;
      let nextChar: CharacterState = {...ch.rows[0]};
      if (command.action === 'take_work_paper') {
        if (current || nextChar.tutorial_stage !== 1 || nextChar.tutorial_status !== 'NOT_STARTED') {
          await client.query('ROLLBACK'); inTransaction = false;
          return reply.code(409).send({error:'wrong_work_phase'});
        }
        next = INITIAL_PLATEWORK;
        nextChar = {...nextChar,tutorial_stage:2,tutorial_status:'IN_PROGRESS'};
        await client.query(
          'INSERT INTO player_character_platework(character_id,revision,state) VALUES ($1,$2,$3::jsonb)',
          [req.params.id,next.revision,JSON.stringify(next)]
        );
        await client.query(
          "UPDATE player_characters SET tutorial_stage=2,tutorial_status='IN_PROGRESS' WHERE id=$1",
          [req.params.id]
        );
      } else {
        if (!current || nextChar.tutorial_stage !== 2 || nextChar.tutorial_status !== 'IN_PROGRESS') {
          await client.query('ROLLBACK'); inTransaction = false;
          return reply.code(409).send({error:'wrong_work_phase'});
        }
        try {next = advancePlatework(current,command.action);}
        catch(e) {
          if (!(e instanceof PlateworkInvalidAction)) throw e;
          await client.query('ROLLBACK'); inTransaction = false;
          return reply.code(409).send({error:'wrong_work_phase'});
        }
        if (next.phase === 'COMPLETE') {
          // Stage 3 is now unlocked in saved state, but its approved scene is NOT
          // automatically played or populated with fabricated death records.
          nextChar = {...nextChar,tutorial_stage:3,tutorial_status:'NOT_STARTED'};
          await client.query(
            "UPDATE player_characters SET tutorial_stage=3,tutorial_status='NOT_STARTED' WHERE id=$1",
            [req.params.id]
          );
        }
        await client.query(
          'UPDATE player_character_platework SET revision=$2,state=$3::jsonb,updated_at=NOW() WHERE character_id=$1',
          [req.params.id,next.revision,JSON.stringify(next)]
        );
      }
      const result = snapshot(nextChar,next);
      await client.query(
        'INSERT INTO player_character_work_receipts(character_id,request_id,request_hash,result) VALUES ($1,$2,$3,$4::jsonb)',
        [req.params.id,command.requestId,hash,JSON.stringify(result)]
      );
      await client.query('COMMIT'); inTransaction = false;
      return reply.code(200).send(result);
    } catch(e) {
      if (inTransaction) {try {await client.query('ROLLBACK');} catch {/* preserve original */}}
      throw e;
    } finally {client.release();}
  });
}
