/**
 * Bellrunner Stage 6 — Dogman. This is the authenticated PostgreSQL adapter for
 * the exact v0.5.1 engine, NOT a new combat implementation.
 *
 * Lock order: owned character -> the finished Dogman confrontation -> combat row -> receipt.
 * Every resolved round and character Health update commit atomically.
 */
import type {FastifyInstance} from 'fastify';
import {fromNodeHeaders} from 'better-auth/node';
import type {IncomingHttpHeaders} from 'node:http';
import {createHash,randomBytes} from 'node:crypto';
import pg from 'pg';
import {auth} from './auth.js';
import {step,CombatError} from '@the-pall/game-core/combat-v0.5.1';
import {initializeDogmanCombat,type DogmanStance} from './bellrunner-dogman-combat-opening.js';
import type {CombatAction,CombatState,CombatEvent} from '@the-pall/game-core/combat-v0.5.1';
import {combatView} from './millhand-combat-view.js';


const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
type Params={id:string};
type Character={origin:string;tutorial_stage:number;tutorial_status:string;
  current_health:number;max_health:number};
type Claim={state:{phase:string;stance:DogmanStance|null}};
type CombatRecord={state:CombatState;history:CombatEvent[];stance:DogmanStance};
type Command={kind:'start';requestId:string}|{
  kind:'turn';requestId:string;expectedRevision:number;action:CombatAction
};
const allowedMove=['side','close','cover','back'];
const allowedZone=['head','torso','limbs'];

function parseCommand(value:unknown):Command{
  if(!value||typeof value!=='object'||Array.isArray(value))throw Error('invalid_body');
  const v=value as Record<string,unknown>;
  if(typeof v.requestId!=='string'||!UUID.test(v.requestId))throw Error('invalid_request_id');
  if(v.kind==='start'){
    if(Object.keys(v).sort().join(',')!=='kind,requestId')throw Error('invalid_fields');
    return {kind:'start',requestId:v.requestId};
  }
  if(v.kind!=='turn'||Object.keys(v).sort().join(',')!=='action,expectedRevision,kind,requestId')
    throw Error('invalid_fields');
  if(!Number.isSafeInteger(v.expectedRevision)||(v.expectedRevision as number)<0)
    throw Error('invalid_revision');
  if(!v.action||typeof v.action!=='object'||Array.isArray(v.action))throw Error('invalid_action');
  const a=v.action as Record<string,unknown>;
  const keys=Object.keys(a).sort().join(',');
  let action:CombatAction;
  switch(a.type){
    case 'attack':case 'technique':
      if(keys!=='type,zone'||!allowedZone.includes(a.zone as string))throw Error('invalid_action');
      action={type:a.type,zone:a.zone as 'head'|'torso'|'limbs'};break;
    case 'move':
      if(keys!=='to,type'||!allowedMove.includes(a.to as string))throw Error('invalid_action');
      action={type:'move',to:a.to as 'side'|'close'|'cover'|'back'};break;
    case 'recover':
      if(keys!=='mode,type'||(a.mode!=='breath'&&a.mode!=='nerves'))throw Error('invalid_action');
      action={type:'recover',mode:a.mode};break;
    case 'guard':case 'focus':
      if(keys!=='type')throw Error('invalid_action');
      action={type:a.type};break;
    default:
      // No client override for speed, AI intent, damage, consumables or escape.
      throw Error('invalid_action');
  }
  return {kind:'turn',requestId:v.requestId,expectedRevision:v.expectedRevision as number,action};
}

function readyStance(claim:Claim|undefined):DogmanStance|null{
  if(claim?.state.phase!=='done')return null;
  const stance=claim.state.stance;
  return stance==='street'||stance==='cart'||stance==='defend'?stance:null;
}
/** Annotate authoritative engine events with the actual chosen actions.
 * This changes presentation metadata only, never RNG, damage or resolution.
 * It also makes saved history truthful across reloads and repeated requests. */
function describeCommittedTurn(
  events:CombatEvent[],chosen:CombatAction,enemyIntent:CombatState['intent']
):CombatEvent[]{
  return events.map(event=>{
    let who=event.actor;
    // The v0.5.1 prototype omits actor on Recover, despite naming the
    // recovering actor in text. Recover is the only such direct action.
    if(event.kind==='recovery'&&!who){
      if(event.text.startsWith('You '))who='player';
      else if(event.text.startsWith('Dogman '))who='enemy';
    }
    if(who!=='player'&&who!=='enemy')return event;
    const action=who==='player'?chosen:enemyIntent;
    if(!action)return {...event,actor:who};
    const direct=['damage','miss','guard','move','recovery','technique','focus'].includes(event.kind);
    // A new opening produced by a guarded strike belongs to the actor's
    // guard, not to a fictional extra attack.
    const defensiveOpening=event.kind==='tactical'&&who==='player'&&
      chosen.type==='guard'&&event.text.includes('firm guard');
    if(!direct&&!defensiveOpening)return {...event,actor:who};
    const type=action.type;
    if(!['attack','technique','guard','move','recover','focus'].includes(type))return {...event,actor:who};
    const detail='zone' in action&&typeof action.zone==='string'?action.zone:
      'to' in action&&typeof action.to==='string'?action.to:
      'mode' in action&&typeof action.mode==='string'?action.mode:undefined;
    const name=type==='technique'
      ?('ability' in action&&typeof action.ability==='string'
          ?action.ability:'Press Advantage')
      :undefined;
    return {...event,actor:who,actionType:type,actionDetail:detail,actionName:name};
  });
}

function snapshot(record:CombatRecord){
  // The common HUD uses the original brace / moving / cart vocabulary;
  // the authoritative Stage V state and combat row retain street/cart/defend.
  const viewStance=record.stance==='street'?'moving'
    :record.stance==='defend'?'brace':'cart';
  return combatView(record.state,record.history,viewStance);
}
function databaseSetupError(error:unknown){return (error as {code?:string})?.code==='42P01';}

type SessionAccount={user:{id:string;emailVerified:boolean}}|null;
type SessionResolver=(headers:IncomingHttpHeaders)=>Promise<SessionAccount>;

/**
 * Production uses the real Better Auth session, a private PostgreSQL pool,
 * and cryptographic seeds. Dependencies can be supplied only by the in-process
 * PostgreSQL integration harness; no HTTP header can enable this substitution.
 */
export function registerBellrunnerDogmanCombatRoutes(app:FastifyInstance,options:{
  pool?:pg.Pool;
  resolveSession?:SessionResolver;
  seed?:()=>number;
}={}){
  const db=options.pool??new pg.Pool({connectionString:process.env.DATABASE_URL});
  const resolveSession=options.resolveSession??(async (headers:IncomingHttpHeaders)=>
    auth.api.getSession({headers:fromNodeHeaders(headers)}));
  const seed=options.seed??(()=>randomBytes(4).readUInt32BE(0));
  app.addHook('onClose',async()=>{if(!options.pool)await db.end();});

  app.get<{Params:Params}>('/api/characters/:id/bellrunner/combat',async(req,reply)=>{
    reply.header('Cache-Control','no-store');
    const session=await resolveSession(req.headers);
    if(!session?.user.emailVerified)return reply.code(401).send({error:'unauthorized'});
    if(!UUID.test(req.params.id))return reply.code(404).send({error:'not_found'});
    const c=await db.query<Character>(
      'SELECT origin,tutorial_stage,tutorial_status,current_health,max_health FROM player_characters WHERE id=$1 AND account_id=$2',
      [req.params.id,session.user.id]);
    if(!c.rowCount||c.rows[0].origin!=='Bellrunner')return reply.code(404).send({error:'not_found'});
    if(c.rows[0].tutorial_stage<6)return reply.code(409).send({error:'stage_six_not_ready'});
    try{
      const claim=await db.query<Claim>('SELECT state FROM player_character_bellrunner_dogman WHERE character_id=$1',[req.params.id]);
      const stance=readyStance(claim.rows[0]);
      if(!stance)return reply.code(409).send({error:'stance_not_recorded'});
      const saved=await db.query<CombatRecord>(
        'SELECT state,history,stance FROM player_character_dogman_combat WHERE character_id=$1',[req.params.id]);
      if(!saved.rowCount){
        if(c.rows[0].tutorial_stage!==6)return reply.code(409).send({error:'combat_not_found'});
        return {needsStart:true,stage:6};
      }
      if(saved.rows[0].stance!==stance)return reply.code(409).send({error:'combat_stance_mismatch'});
      return snapshot(saved.rows[0]);
    }catch(error){
      if(databaseSetupError(error))return reply.code(503).send({error:'dogman_combat_schema_missing',setup:'npm run bellrunner:migrate'});
      throw error;
    }
  });

  app.post<{Params:Params}>('/api/characters/:id/bellrunner/combat',async(req,reply)=>{
    reply.header('Cache-Control','no-store');
    const session=await resolveSession(req.headers);
    if(!session?.user.emailVerified)return reply.code(401).send({error:'unauthorized'});
    if(!UUID.test(req.params.id))return reply.code(404).send({error:'not_found'});
    if(req.headers.origin&&req.headers.origin!==(process.env.AUTH_BASE_URL??'http://127.0.0.1:5173'))
      return reply.code(403).send({error:'invalid_origin'});
    if(!req.headers['content-type']?.toLowerCase().startsWith('application/json'))
      return reply.code(415).send({error:'json_required'});
    let command:Command;
    try{command=parseCommand(req.body);}catch(error){
      return reply.code(400).send({error:error instanceof Error?error.message:'invalid_action'});
    }
    const hash=createHash('sha256').update(JSON.stringify(command)).digest('hex');
    const client=await db.connect();let inTransaction=false;
    try{
      await client.query('BEGIN');inTransaction=true;
      const characters=await client.query<Character>(
        'SELECT origin,tutorial_stage,tutorial_status,current_health,max_health FROM player_characters WHERE id=$1 AND account_id=$2 FOR UPDATE',
        [req.params.id,session.user.id]);
      if(!characters.rowCount||characters.rows[0].origin!=='Bellrunner'){
        await client.query('ROLLBACK');inTransaction=false;
        return reply.code(404).send({error:'not_found'});
      }
      const receipt=await client.query<{request_hash:string;response:unknown}>(
        'SELECT request_hash,response FROM player_character_dogman_combat_receipts WHERE character_id=$1 AND request_id=$2',
        [req.params.id,command.requestId]);
      if(receipt.rowCount){
        await client.query('COMMIT');inTransaction=false;
        return receipt.rows[0].request_hash===hash?receipt.rows[0].response
          :reply.code(409).send({error:'idempotency_key_reuse'});
      }
      const ch=characters.rows[0];
      if(ch.tutorial_stage!==6){
        await client.query('ROLLBACK');inTransaction=false;
        return reply.code(409).send({error:'stage_six_not_ready'});
      }
      const claims=await client.query<Claim>(
        'SELECT state FROM player_character_bellrunner_dogman WHERE character_id=$1',[req.params.id]);
      const stance=readyStance(claims.rows[0]);
      if(!stance){
        await client.query('ROLLBACK');inTransaction=false;
        return reply.code(409).send({error:'stance_not_recorded'});
      }
      const saved=await client.query<CombatRecord>(
        'SELECT state,history,stance FROM player_character_dogman_combat WHERE character_id=$1 FOR UPDATE',
        [req.params.id]);
      let record:CombatRecord;
      if(command.kind==='start'){
        if(saved.rowCount)record=saved.rows[0];
        else{
          const state=initializeDogmanCombat(req.params.id,ch,stance,seed());
          record={state,history:[],stance};
          await client.query(
            'INSERT INTO player_character_dogman_combat(character_id,revision,stance,state,history) VALUES($1,0,$2,$3::jsonb,$4::jsonb)',
            [req.params.id,stance,JSON.stringify(state),'[]']);
          await client.query(
            "UPDATE player_characters SET tutorial_status='IN_PROGRESS' WHERE id=$1",[req.params.id]);
        }
      }else{
        if(!saved.rowCount){
          await client.query('ROLLBACK');inTransaction=false;
          return reply.code(409).send({error:'combat_not_initialized'});
        }
        record=saved.rows[0];
        if(record.stance!==stance){
          await client.query('ROLLBACK');inTransaction=false;
          return reply.code(409).send({error:'combat_stance_mismatch'});
        }
        if(record.state.revision!==command.expectedRevision){
          await client.query('ROLLBACK');inTransaction=false;
          return reply.code(409).send({error:'stale_revision',currentRevision:record.state.revision});
        }
        let state:CombatState;
        try{
          state=step(record.state,command.action,{
            expectedRevision:command.expectedRevision,requestId:command.requestId});
        }catch(error){
          if(!(error instanceof CombatError))throw error;
          await client.query('ROLLBACK');inTransaction=false;
          return reply.code(422).send({error:'invalid_combat_action',detail:error.message});
        }
        if(state.status==='finished'&&state.outcome!=='player_victory'&&state.outcome!=='player_defeat')
          throw new Error('unexpected_encounter_outcome');
        // Enemy intention was committed before resolving this turn. Keep it
        // exclusively in historical log metadata; never reveal future AI.
        state.events=describeCommittedTurn(state.events,command.action,record.state.intent);
        record={state,stance,history:[...record.history,...state.events]};
        await client.query(
          'UPDATE player_character_dogman_combat SET revision=$2,state=$3::jsonb,history=$4::jsonb,outcome=$5,updated_at=NOW() WHERE character_id=$1',
          [req.params.id,state.revision,JSON.stringify(state),JSON.stringify(record.history),state.outcome]);
        // No automatic wound type, recovery, coins, XP or tutorial clinic fee.
        await client.query(
          'UPDATE player_characters SET current_health=$2,tutorial_status=$3 WHERE id=$1',
          [req.params.id,state.player.hp,state.status==='finished'?'COMPLETED':'IN_PROGRESS']);
      }
      const response=snapshot(record);
      await client.query(
        'INSERT INTO player_character_dogman_combat_receipts(character_id,request_id,request_hash,response) VALUES($1,$2,$3,$4::jsonb)',
        [req.params.id,command.requestId,hash,JSON.stringify(response)]);
      await client.query('COMMIT');inTransaction=false;
      return response;
    }catch(error){
      if(inTransaction){try{await client.query('ROLLBACK');}catch{/* preserve original */}}
      if(databaseSetupError(error))return reply.code(503).send({error:'dogman_combat_schema_missing',setup:'npm run bellrunner:migrate'});
      throw error;
    }finally{client.release();}
  });
}
