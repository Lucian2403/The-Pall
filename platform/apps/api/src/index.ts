import Fastify, {LogController} from 'fastify';
import {getGameplayPool} from './database-pool.js';
import {createHash} from 'node:crypto';
import {registerAuthRoutes} from './auth-routes.js';
import {authPool} from './auth.js';
import {registerCharacterCatalogueRoutes} from './character-catalogue-routes.js';
import {registerCharacterRoutes} from './character-routes.js';
import {registerMillhandWorkRoutes} from './millhand-work-routes.js';
import {registerBellrunnerDispatchRoutes} from './bellrunner-dispatch-routes.js';
import {registerStitcherWardRoutes} from './stitcher-ward-routes.js';
import {registerStitcherOwlerCombatRoutes} from './stitcher-owler-combat-routes.js';
import {registerBellrunnerWrongBellRoutes} from './bellrunner-wrong-bell-routes.js';
import {registerBellrunnerSecondJobRoutes} from './bellrunner-second-job-routes.js';
import {registerBellrunnerDogmanRoutes} from './bellrunner-dogman-routes.js';
import {registerBellrunnerDogmanCombatRoutes} from './bellrunner-dogman-combat-routes.js';
import {registerMissingStampRoutes} from './millhand-missing-stamp-routes.js';
import {registerMillhandSecondJobRoutes} from './millhand-second-job-routes.js';
import {registerMillhandWageClaimRoutes} from './millhand-wage-claim-routes.js';
import {registerMillhandCombatRoutes} from './millhand-combat-routes.js';
import {registerMillhandClinicRoutes,registerBellrunnerClinicRoutes,registerStitcherClinicRoutes} from './millhand-clinic-routes.js';
import {registerTutorialHomeRoutes} from './tutorial-home-routes.js';
import {registerFreePlayRoutes} from './free-play-routes.js';
import {registerInventoryRoutes} from './inventory-routes.js';
import {registerMillhandStageRewindRoutes} from './millhand-stage-rewind-routes.js';
import {registerPersonalJournalRoutes} from './personal-journal-routes.js';
import {parseFixtureAction} from '@the-pall/contracts';
import {advanceFixture} from '@the-pall/game-core';

// M0 ONLY: fixed server-owned test identity, loopback host, no production users.
const ACTOR = '00000000-0000-4000-8000-000000000001';
const api = Fastify({logger: true, logController: new LogController({disableRequestLogging: true}), bodyLimit: 16 * 1024});
// The gameplay pool is created once and closed once with the Fastify process.
const gameplayDb=getGameplayPool(api);
api.addHook('onClose',async()=>{await authPool.end();});
registerAuthRoutes(api);
registerCharacterCatalogueRoutes(api);
registerCharacterRoutes(api);
registerMillhandWorkRoutes(api);
registerBellrunnerDispatchRoutes(api);
registerStitcherWardRoutes(api);
registerStitcherOwlerCombatRoutes(api);
registerBellrunnerWrongBellRoutes(api);
registerBellrunnerSecondJobRoutes(api);
registerBellrunnerDogmanRoutes(api);
registerBellrunnerDogmanCombatRoutes(api);
registerMissingStampRoutes(api);
registerMillhandSecondJobRoutes(api);
registerMillhandWageClaimRoutes(api);
registerMillhandCombatRoutes(api);
registerMillhandClinicRoutes(api);
registerBellrunnerClinicRoutes(api);
registerStitcherClinicRoutes(api);
registerTutorialHomeRoutes(api);
registerFreePlayRoutes(api);
registerInventoryRoutes(api);
registerMillhandStageRewindRoutes(api);
registerPersonalJournalRoutes(api);
api.get('/health', async () => ({status: 'ok'}));
// M0 technical fixture is never part of a publicly bound API.
const fixtureAllowed=process.env.NODE_ENV!=='production' &&
  ['127.0.0.1','localhost','::1'].includes(process.env.API_HOST??'127.0.0.1');
if(fixtureAllowed){
const pool=gameplayDb;
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
}
const port = Number(process.env.API_PORT || '8788');
const host = process.env.API_HOST || '127.0.0.1';
// Drain in-flight requests and both managed pools on a normal process stop.
let shuttingDown=false;
for(const signal of ['SIGINT','SIGTERM'] as const){
  process.once(signal,()=>{
    if(shuttingDown)return;
    shuttingDown=true;
    void api.close().catch(error=>{
      api.log.error({err:error,signal},'API shutdown failed');
      process.exitCode=1;
    });
  });
}
await api.listen({host, port});
