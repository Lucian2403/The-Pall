import Fastify, {LogController} from 'fastify';
import pg from 'pg';
import {createHash} from 'node:crypto';
import {registerAuthRoutes} from './auth-routes.js';
import {registerCharacterCatalogueRoutes} from './character-catalogue-routes.js';
import {registerCharacterRoutes} from './character-routes.js';
import {registerMillhandWorkRoutes} from './millhand-work-routes.js';
import {registerMissingStampRoutes} from './millhand-missing-stamp-routes.js';
import {registerMillhandSecondJobRoutes} from './millhand-second-job-routes.js';
import {registerMillhandStageRewindRoutes} from './millhand-stage-rewind-routes.js';
import {parseFixtureAction} from '@the-pall/contracts';
import {advanceFixture} from '@the-pall/game-core';

// M0 ONLY: fixed server-owned test identity, loopback host, no production users.
const ACTOR = '00000000-0000-4000-8000-000000000001';
const pool = new pg.Pool({connectionString: process.env.DATABASE_URL});
const api = Fastify({logger: true, logController: new LogController({disableRequestLogging: true}), bodyLimit: 16 * 1024});
registerAuthRoutes(api);
registerCharacterCatalogueRoutes(api);
registerCharacterRoutes(api);
registerMillhandWorkRoutes(api);
registerMissingStampRoutes(api);
registerMillhandSecondJobRoutes(api);
registerMillhandStageRewindRoutes(api);
api.get('/health', async () => ({status: 'ok', module: 'technical-fixture'}));
api.get('/api/fixture', async () => {
  const {rows} = await pool.query('SELECT revision, value FROM dev_action_state WHERE actor_id = $1', [ACTOR]);
  if (rows.length !== 1) throw new Error('Fixture schema has not been initialized');
  return {revision: Number(rows[0].revision), value: Number(rows[0].value)};
});
api.post('/api/fixture', async (request, reply) => {
  let cmd;
  try {cmd = parseFixtureAction(request.body);} catch {return reply.code(400).send({error: 'invalid_action'});}
  const hash = createHash('sha256').update(JSON.stringify({action: cmd.action, expectedRevision: cmd.expectedRevision})).digest('hex');
  const db = await pool.connect();
  try {
    await db.query('BEGIN');
    // Lock first; serialized retries and stale commands cannot both advance.
    const stateRows = await db.query('SELECT revision, value FROM dev_action_state WHERE actor_id = $1 FOR UPDATE', [ACTOR]);
    if (stateRows.rowCount !== 1) throw new Error('Fixture schema has not been initialized');
    const receipt = await db.query('SELECT request_hash, result FROM dev_action_receipt WHERE actor_id=$1 AND request_id=$2', [ACTOR, cmd.requestId]);
    if (receipt.rowCount) {
      await db.query('COMMIT');
      if (receipt.rows[0].request_hash !== hash) return reply.code(409).send({error: 'idempotency_key_reuse'});
      return receipt.rows[0].result;
    }
    const existing = {revision: Number(stateRows.rows[0].revision), value: Number(stateRows.rows[0].value)};
    if (existing.revision !== cmd.expectedRevision) {
      await db.query('ROLLBACK');
      return reply.code(409).send({error: 'stale_revision', currentRevision: existing.revision});
    }
    const next = advanceFixture(existing);
    await db.query('UPDATE dev_action_state SET revision=$2, value=$3 WHERE actor_id=$1', [ACTOR, next.revision, next.value]);
    await db.query('INSERT INTO dev_action_receipt (actor_id, request_id, request_hash, expected_revision, result) VALUES ($1,$2,$3,$4,$5::jsonb)', [ACTOR, cmd.requestId, hash, cmd.expectedRevision, JSON.stringify(next)]);
    await db.query('COMMIT');
    return next;
  } catch (err) {
    try {await db.query('ROLLBACK');} catch {}
    throw err;
  } finally {db.release();}
});

const port = Number(process.env.API_PORT || '8788');
const host = process.env.API_HOST || '127.0.0.1';
api.addHook('onClose', async () => {await pool.end();});
await api.listen({host, port});
