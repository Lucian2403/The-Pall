import type {FastifyInstance} from 'fastify';
import {fromNodeHeaders} from 'better-auth/node';
import pg from 'pg';
import {createHash, randomUUID} from 'node:crypto';
import {APPROVED_STARTING_FACTS, ORIGIN_CATALOGUE} from '@the-pall/game-core';
import {INITIAL_CHARACTER_SLOT_LIMIT, parseCreateCharacterCommand} from '@the-pall/contracts';
import {auth} from './auth.js';

const pool = new pg.Pool({connectionString: process.env.DATABASE_URL});
const CHARACTER_UUID = /^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
const STARTING_LOCATIONS: Record<string, string> = {
  Millhand: 'Smithing workshop',
  Bellrunner: 'Dispatch House',
  Squatter: 'Hedge Shelter',
  Stitcher: 'Cinder Row Infirmary',
  Scrapper: 'Rust Yard',
  Inkbound: 'Civic Copying Office'
};
const columns = `id, name, sex, origin, str, dex, intel, res, max_health, current_health,
  coins, major_skill_bonuses, starter_item_requirements, starting_location, tutorial_stage, tutorial_status, created_at`;

type CharacterRow = {
  id: string; name: string; sex: string; origin: string;
  str: number; dex: number; intel: number; res: number;
  max_health: number; current_health: number; coins: string | number;
  major_skill_bonuses: Record<string, number>;
  starter_item_requirements: {name: string; quantity: number}[];
  starting_location: string; tutorial_stage: number; tutorial_status: string; created_at: Date;
};

function serialize(row: CharacterRow) {
  return {
    id: row.id, name: row.name, sex: row.sex, origin: row.origin,
    attributes: {STR: row.str, DEX: row.dex, INT: row.intel, RES: row.res},
    health: {current: row.current_health, maximum: row.max_health},
    coins: Number(row.coins),
    majorSkillBonuses: row.major_skill_bonuses,
    starterItemRequirements: row.starter_item_requirements,
    startingLocation: row.starting_location,
    tutorial: {stage: row.tutorial_stage, status: row.tutorial_status},
    createdAt: row.created_at
  };
}

export function registerCharacterRoutes(app: FastifyInstance) {
  app.addHook('onClose', async () => {await pool.end();});

  app.get('/api/characters', async (request, reply) => {
    const session = await auth.api.getSession({headers: fromNodeHeaders(request.headers)});
    if (!session?.user.emailVerified) return reply.code(401).send({error: 'unauthorized'});
    const client = await pool.connect();
    try {
      await client.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
      const state = await client.query('SELECT revision FROM player_character_account_state WHERE account_id=$1', [session.user.id]);
      const rows = await client.query(`SELECT ${columns} FROM player_characters WHERE account_id=$1 ORDER BY created_at, id`, [session.user.id]);
      await client.query('COMMIT');
      return {
        revision: Number(state.rows[0]?.revision ?? 0),
        slots: {used: rows.rowCount ?? 0, limit: INITIAL_CHARACTER_SLOT_LIMIT},
        characters: rows.rows.map((row: CharacterRow) => serialize(row))
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  });

  app.get<{Params: {id: string}}>('/api/characters/:id', async (request, reply) => {
    const session = await auth.api.getSession({headers: fromNodeHeaders(request.headers)});
    if (!session?.user.emailVerified) return reply.code(401).send({error: 'unauthorized'});
    if (!CHARACTER_UUID.test(request.params.id)) return reply.code(404).send({error: 'not_found'});
    const result = await pool.query(`SELECT ${columns} FROM player_characters WHERE id=$1 AND account_id=$2`, [request.params.id, session.user.id]);
    if (!result.rowCount) return reply.code(404).send({error: 'not_found'});
    return {character: serialize(result.rows[0] as CharacterRow)};
  });

  app.post('/api/characters', async (request, reply) => {
    const session = await auth.api.getSession({headers: fromNodeHeaders(request.headers)});
    if (!session?.user.emailVerified) return reply.code(401).send({error: 'unauthorized'});

    // Reject cross-origin browser writes; local Vite proxy shares AUTH_BASE_URL.
    const origin = request.headers.origin;
    if (origin && origin !== (process.env.AUTH_BASE_URL ?? 'http://127.0.0.1:5173')) {
      return reply.code(403).send({error: 'invalid_origin'});
    }
    if (!request.headers['content-type']?.toLowerCase().startsWith('application/json')) {
      return reply.code(415).send({error: 'json_required'});
    }

    let cmd;
    try { cmd = parseCreateCharacterCommand(request.body); }
    catch (error) {
      return reply.code(400).send({error: error instanceof Error ? error.message : 'invalid_request'});
    }
    const hash = createHash('sha256').update(JSON.stringify({
      name: cmd.name, nameKey: cmd.nameKey, origin: cmd.origin,
      sex: cmd.sex, expectedRevision: cmd.expectedRevision
    })).digest('hex');
    const client = await pool.connect();
    let committed = false;
    try {
      await client.query('BEGIN');
      // Every create for the same account locks one parent row. Two-tab create
      // races cannot both pass slot capacity or account-revision checks.
      await client.query('INSERT INTO player_character_account_state(account_id) VALUES ($1) ON CONFLICT DO NOTHING', [session.user.id]);
      const state = await client.query('SELECT revision FROM player_character_account_state WHERE account_id=$1 FOR UPDATE', [session.user.id]);
      const receipt = await client.query('SELECT request_hash, result FROM player_character_create_receipts WHERE account_id=$1 AND request_id=$2', [session.user.id, cmd.requestId]);
      if (receipt.rowCount) {
        await client.query('COMMIT');
        committed = true;
        if (receipt.rows[0].request_hash !== hash) return reply.code(409).send({error: 'idempotency_key_reuse'});
        return receipt.rows[0].result;
      }
      const revision = Number(state.rows[0].revision);
      if (cmd.expectedRevision !== revision) {
        await client.query('ROLLBACK');
        return reply.code(409).send({error: 'stale_revision', currentRevision: revision});
      }
      const count = await client.query('SELECT COUNT(*)::int AS total FROM player_characters WHERE account_id=$1', [session.user.id]);
      if (count.rows[0].total >= INITIAL_CHARACTER_SLOT_LIMIT) {
        await client.query('ROLLBACK');
        return reply.code(409).send({error: 'slots_full'});
      }

      const definition = ORIGIN_CATALOGUE.find(x => x.origin === cmd.origin);
      if (!definition) throw new Error('canonical_origin_missing');
      const bonuses = {[definition.majorSkill]: APPROVED_STARTING_FACTS.originMajorSkillBonusLevels};
      const requirements = APPROVED_STARTING_FACTS.starterItemDisplayNames.map(name => ({name, quantity: 1}));
      const id = randomUUID();
      const inserted = await client.query(
        `INSERT INTO player_characters
        (id, account_id, name, name_key, sex, origin, str, dex, intel, res, max_health, current_health, coins,
         major_skill_bonuses, starter_item_requirements, starting_location, tutorial_stage, tutorial_status)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$11,$12,$13::jsonb,$14::jsonb,$15,1,'NOT_STARTED')
         RETURNING ${columns}`,
        [
          id, session.user.id, cmd.name, cmd.nameKey, cmd.sex, cmd.origin,
          APPROVED_STARTING_FACTS.attributes.STR, APPROVED_STARTING_FACTS.attributes.DEX,
          APPROVED_STARTING_FACTS.attributes.INT, APPROVED_STARTING_FACTS.attributes.RES,
          APPROVED_STARTING_FACTS.maximumHealth, APPROVED_STARTING_FACTS.startingCoins,
          JSON.stringify(bonuses), JSON.stringify(requirements), STARTING_LOCATIONS[cmd.origin]
        ]
      );
      const response = {revision: revision + 1, character: serialize(inserted.rows[0] as CharacterRow)};
      await client.query('INSERT INTO player_character_create_receipts(account_id, request_id, request_hash, character_id, result) VALUES ($1,$2,$3,$4,$5::jsonb)',
        [session.user.id, cmd.requestId, hash, id, JSON.stringify(response)]);
      await client.query('UPDATE player_character_account_state SET revision=revision+1 WHERE account_id=$1', [session.user.id]);
      await client.query('COMMIT');
      committed = true;
      return reply.code(201).send(response);
    } catch (error) {
      if (!committed) {
        try { await client.query('ROLLBACK'); } catch { /* preserving original error */ }
      }
      if (error && typeof error === 'object' && 'code' in error && error.code === '23505') {
        return reply.code(409).send({error: 'name_taken'});
      }
      throw error;
    } finally {
      client.release();
    }
  });
}
