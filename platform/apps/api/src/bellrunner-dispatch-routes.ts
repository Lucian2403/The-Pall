/** Bellrunner Stage 1 round acceptance and Stage 2 ordinary courier work.
 * Every command is an owner-locked, idempotent transaction. Stage 3 remains
 * separately gated; none of these actions grants XP, wages or quest items.
 */
import type {FastifyInstance} from 'fastify';
import type {IncomingHttpHeaders} from 'node:http';
import {fromNodeHeaders} from 'better-auth/node';
import {createHash} from 'node:crypto';
import pg from 'pg';
import {auth} from './auth.js';
import {INITIAL_DISPATCH_STATE,DISPATCH_ACTIONS,applyDispatchAction,InvalidDispatchAction,
  type DispatchState,type DispatchWorkAction} from './bellrunner-dispatch-work.js';

type Session={user:{id:string;emailVerified:boolean}}|null;
type Resolver=(headers:IncomingHttpHeaders)=>Promise<Session>;
type Character={origin:string;tutorial_stage:number;tutorial_status:string};
type Params={id:string};
type Command={action:'take_round';requestId:string;expectedRevision:0};
type WorkCommand={action:DispatchWorkAction;requestId:string;expectedRevision:number};
type DispatchRow={revision:string|number;work_state:DispatchState};
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function parse(input:unknown):Command{
  if(!input||typeof input!=='object'||Array.isArray(input))throw Error('invalid_body');
  const v=input as Record<string,unknown>;
  if(Object.keys(v).sort().join(',')!=='action,expectedRevision,requestId')
    throw Error('invalid_fields');
  if(v.action!=='take_round')throw Error('invalid_action');
  if(typeof v.requestId!=='string'||!UUID.test(v.requestId))
    throw Error('invalid_request_id');
  if(v.expectedRevision!==0)throw Error('invalid_revision');
  return {action:'take_round',requestId:v.requestId,expectedRevision:0};
}
function view(character:Character,accepted:boolean,revision=0,
  workState:DispatchState|null=accepted?INITIAL_DISPATCH_STATE:null){
  return {stage:character.tutorial_stage,tutorialStatus:character.tutorial_status,
    accepted,revision,workState,work:'Shift Dispatch',skill:'Industry / Hauling',
    payment:'Not yet cleared',tutorialPayout:{coins:0,ordinaryXp:0,items:0}};
}
function parseWork(input:unknown):WorkCommand{
  if(!input||typeof input!=='object'||Array.isArray(input))throw Error('invalid_body');
  const v=input as Record<string,unknown>;
  if(Object.keys(v).sort().join(',')!=='action,expectedRevision,requestId')
    throw Error('invalid_fields');
  if(typeof v.action!=='string'||!DISPATCH_ACTIONS.includes(v.action as DispatchWorkAction))
    throw Error('invalid_action');
  if(typeof v.requestId!=='string'||!UUID.test(v.requestId))
    throw Error('invalid_request_id');
  if(typeof v.expectedRevision!=='number'||!Number.isSafeInteger(v.expectedRevision)||
    v.expectedRevision<0)throw Error('invalid_revision');
  return {action:v.action as DispatchWorkAction,requestId:v.requestId,
    expectedRevision:v.expectedRevision};
}
const schemaMissing=(e:unknown)=>['42P01','42703'].includes((e as {code?:string})?.code??'');

export function registerBellrunnerDispatchRoutes(app:FastifyInstance,
  options?:{pool?:pg.Pool;resolveSession?:Resolver}){
  const db=options?.pool??new pg.Pool({connectionString:process.env.DATABASE_URL});
  if(!options?.pool)app.addHook('onClose',async()=>{await db.end();});
  const resolve=options?.resolveSession??(async(headers:IncomingHttpHeaders)=>
    auth.api.getSession({headers:fromNodeHeaders(headers)}));

  app.get<{Params:Params}>('/api/characters/:id/bellrunner/dispatch',async(req,reply)=>{
    const session=await resolve(req.headers);
    if(!session?.user.emailVerified)return reply.code(401).send({error:'unauthorized'});
    if(!UUID.test(req.params.id))return reply.code(404).send({error:'not_found'});
    const rows=await db.query<Character>(
      'SELECT origin,tutorial_stage,tutorial_status FROM player_characters WHERE id=$1 AND account_id=$2',
      [req.params.id,session.user.id]);
    if(!rows.rowCount||rows.rows[0].origin!=='Bellrunner')
      return reply.code(404).send({error:'not_found'});
    try{
      const accepted=await db.query<DispatchRow>(
        'SELECT revision,work_state FROM player_character_bellrunner_dispatch WHERE character_id=$1',
        [req.params.id]);
      return view(rows.rows[0],!!accepted.rowCount,
        Number(accepted.rows[0]?.revision??0),accepted.rows[0]?.work_state??null);
    }catch(e){
      if(schemaMissing(e))return reply.code(503).send({error:'bellrunner_migration_required'});
      throw e;
    }
  });

  app.post<{Params:Params}>('/api/characters/:id/bellrunner/dispatch',async(req,reply)=>{
    const session=await resolve(req.headers);
    if(!session?.user.emailVerified)return reply.code(401).send({error:'unauthorized'});
    if(!UUID.test(req.params.id))return reply.code(404).send({error:'not_found'});
    const origin=req.headers.origin;
    if(origin&&origin!==(process.env.AUTH_BASE_URL??'http://127.0.0.1:5173'))
      return reply.code(403).send({error:'invalid_origin'});
    if(!req.headers['content-type']?.toLowerCase().startsWith('application/json'))
      return reply.code(415).send({error:'json_required'});
    let command:Command;
    try{command=parse(req.body);}catch(e){
      return reply.code(400).send({error:e instanceof Error?e.message:'invalid_action'});
    }
    const hash=createHash('sha256').update(
      JSON.stringify({action:command.action,expectedRevision:command.expectedRevision})
    ).digest('hex');
    const client=await db.connect();
    let transaction=false;
    try{
      await client.query('BEGIN');transaction=true;
      const ch=await client.query<Character>(
        'SELECT origin,tutorial_stage,tutorial_status FROM player_characters WHERE id=$1 AND account_id=$2 FOR UPDATE',
        [req.params.id,session.user.id]);
      if(!ch.rowCount||ch.rows[0].origin!=='Bellrunner'){
        await client.query('ROLLBACK');transaction=false;
        return reply.code(404).send({error:'not_found'});
      }
      const receipt=await client.query<{request_hash:string;result:unknown}>(
        'SELECT request_hash,result FROM player_character_bellrunner_dispatch_receipts WHERE character_id=$1 AND request_id=$2',
        [req.params.id,command.requestId]);
      if(receipt.rowCount){
        await client.query('COMMIT');transaction=false;
        if(receipt.rows[0].request_hash!==hash)
          return reply.code(409).send({error:'idempotency_key_reuse'});
        return receipt.rows[0].result;
      }
      const accepted=await client.query(
        'SELECT revision FROM player_character_bellrunner_dispatch WHERE character_id=$1 FOR UPDATE',
        [req.params.id]);
      if(accepted.rowCount||ch.rows[0].tutorial_stage!==1||
        ch.rows[0].tutorial_status!=='NOT_STARTED'){
        await client.query('ROLLBACK');transaction=false;
        return reply.code(409).send({error:'wrong_work_phase'});
      }
      await client.query(
        'INSERT INTO player_character_bellrunner_dispatch(character_id,revision) VALUES($1,0)',
        [req.params.id]);
      await client.query(
        "UPDATE player_characters SET tutorial_stage=2,tutorial_status='IN_PROGRESS' WHERE id=$1",
        [req.params.id]);
      const result=view({origin:'Bellrunner',tutorial_stage:2,tutorial_status:'IN_PROGRESS'},true);
      await client.query(
        'INSERT INTO player_character_bellrunner_dispatch_receipts(character_id,request_id,request_hash,result) VALUES($1,$2,$3,$4::jsonb)',
        [req.params.id,command.requestId,hash,JSON.stringify(result)]);
      await client.query('COMMIT');transaction=false;
      return reply.code(200).send(result);
    }catch(e){
      if(transaction){try{await client.query('ROLLBACK');}catch{/* Preserve original error */}}
      if(schemaMissing(e))return reply.code(503).send({error:'bellrunner_migration_required'});
      throw e;
    }finally{client.release();}
  });

  // All dispatch actions share the single row locked in acceptance/rewind.
  // A second received request ID cannot double-process a receiving mark.
  app.post<{Params:Params}>('/api/characters/:id/bellrunner/dispatch/work',async(req,reply)=>{
    const session=await resolve(req.headers);
    if(!session?.user.emailVerified)return reply.code(401).send({error:'unauthorized'});
    if(!UUID.test(req.params.id))return reply.code(404).send({error:'not_found'});
    const origin=req.headers.origin;
    if(origin&&origin!==(process.env.AUTH_BASE_URL??'http://127.0.0.1:5173'))
      return reply.code(403).send({error:'invalid_origin'});
    if(!req.headers['content-type']?.toLowerCase().startsWith('application/json'))
      return reply.code(415).send({error:'json_required'});
    let command:WorkCommand;
    try{command=parseWork(req.body);}catch(e){
      return reply.code(400).send({error:e instanceof Error?e.message:'invalid_action'});
    }
    const hash=createHash('sha256').update(JSON.stringify({
      action:command.action,expectedRevision:command.expectedRevision
    })).digest('hex');
    const client=await db.connect();
    let transaction=false;
    try{
      await client.query('BEGIN');transaction=true;
      const ch=await client.query<Character>(
        'SELECT origin,tutorial_stage,tutorial_status FROM player_characters WHERE id=$1 AND account_id=$2 FOR UPDATE',
        [req.params.id,session.user.id]);
      if(!ch.rowCount||ch.rows[0].origin!=='Bellrunner'){
        await client.query('ROLLBACK');transaction=false;
        return reply.code(404).send({error:'not_found'});
      }
      if(ch.rows[0].tutorial_stage!==2||ch.rows[0].tutorial_status!=='IN_PROGRESS'){
        await client.query('ROLLBACK');transaction=false;
        return reply.code(409).send({error:'wrong_work_phase'});
      }
      const current=await client.query<DispatchRow>(
        'SELECT revision,work_state FROM player_character_bellrunner_dispatch WHERE character_id=$1 FOR UPDATE',
        [req.params.id]);
      if(!current.rowCount){
        await client.query('ROLLBACK');transaction=false;
        return reply.code(409).send({error:'round_not_accepted'});
      }
      const replay=await client.query<{request_hash:string;result:unknown}>(
        'SELECT request_hash,result FROM player_character_bellrunner_dispatch_work_receipts WHERE character_id=$1 AND request_id=$2',
        [req.params.id,command.requestId]);
      if(replay.rowCount){
        await client.query('COMMIT');transaction=false;
        if(replay.rows[0].request_hash!==hash)
          return reply.code(409).send({error:'idempotency_key_reuse'});
        return replay.rows[0].result;
      }
      const revision=Number(current.rows[0].revision);
      if(revision!==command.expectedRevision){
        await client.query('ROLLBACK');transaction=false;
        return reply.code(409).send({error:'stale_revision',revision});
      }
      let next:DispatchState;
      try{next=applyDispatchAction(current.rows[0].work_state,command.action);}
      catch(e){
        if(!(e instanceof InvalidDispatchAction))throw e;
        await client.query('ROLLBACK');transaction=false;
        return reply.code(409).send({error:'invalid_work_phase'});
      }
      await client.query(
        'UPDATE player_character_bellrunner_dispatch SET revision=$2,work_state=$3::jsonb WHERE character_id=$1',
        [req.params.id,revision+1,JSON.stringify(next)]);
      // Only the explicit sealed-order handoff advances the character.
      const movesToWrongBell=command.action==='take_final_notice';
      if(movesToWrongBell){
        await client.query(
          "UPDATE player_characters SET tutorial_stage=3,tutorial_status='NOT_STARTED' WHERE id=$1",
          [req.params.id]);
      }
      const result=view(movesToWrongBell
        ?{...ch.rows[0],tutorial_stage:3,tutorial_status:'NOT_STARTED'}
        :ch.rows[0],true,revision+1,next);
      await client.query(
        'INSERT INTO player_character_bellrunner_dispatch_work_receipts(character_id,request_id,request_hash,result) VALUES($1,$2,$3,$4::jsonb)',
        [req.params.id,command.requestId,hash,JSON.stringify(result)]);
      await client.query('COMMIT');transaction=false;
      return result;
    }catch(e){
      if(transaction){try{await client.query('ROLLBACK');}catch{/* Preserve error */}}
      if(schemaMissing(e))return reply.code(503).send({error:'bellrunner_migration_required'});
      throw e;
    }finally{client.release();}
  });
}
