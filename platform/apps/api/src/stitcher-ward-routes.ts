/** Authenticated Stitcher Stages I–IV. One revisioned ward state, shared
 * idempotency receipts, and ONE awarded different Major Skill on the Stage
 * III -> IV route commitment. No tutorial wages/XP/items or extra healing. */
import type {FastifyInstance} from 'fastify';
import {archiveJournalTask} from './personal-journal-store.js';
import {stitcherTask} from './personal-journal-tasks.js';
import type {IncomingHttpHeaders} from 'node:http';
import {fromNodeHeaders} from 'better-auth/node';
import {createHash} from 'node:crypto';
import pg from 'pg';
import {auth} from './auth.js';
import {INITIAL_STITCHER,STITCHER_ACTIONS,STITCHER_MAJOR,
 applyStitcherAction,stitcherActions,StitcherInvalidAction,
 type StitcherAction,type StitcherState} from './stitcher-work.js';

type Session={user:{id:string;emailVerified:boolean}}|null;
type Resolver=(headers:IncomingHttpHeaders)=>Promise<Session>;
type Character={origin:string;tutorial_stage:number;tutorial_status:string;
 major_skill_bonuses:Record<string,number>;coins:number};
type Params={id:string};
type Command={action:StitcherAction;expectedRevision:number;requestId:string};
type Saved={revision:string|number;state:StitcherState};
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function parse(body:unknown):Command{
 if(!body||typeof body!=='object'||Array.isArray(body))throw Error('invalid_body');
 const v=body as Record<string,unknown>;
 if(Object.keys(v).sort().join(',')!=='action,expectedRevision,requestId')
  throw Error('invalid_fields');
 if(typeof v.action!=='string'||!STITCHER_ACTIONS.includes(v.action as StitcherAction))
  throw Error('invalid_action');
 if(typeof v.expectedRevision!=='number'||!Number.isSafeInteger(v.expectedRevision)||
    v.expectedRevision<0)throw Error('invalid_revision');
 if(typeof v.requestId!=='string'||!UUID.test(v.requestId))throw Error('invalid_request_id');
 return v as Command;
}
const notReady=(code:string)=>({error:code});
const schemaMissing=(e:unknown)=>['42P01','42703'].includes((e as {code?:string})?.code??'');
function view(character:Character,state:StitcherState,started:boolean){
 return {stage:character.tutorial_stage,tutorialStatus:character.tutorial_status,
  state,started,availableActions:started?stitcherActions(state):['start'],
  coins:Number(character.coins),majorSkillBonuses:character.major_skill_bonuses,
  tutorialPayout:{coins:0,ordinaryXp:0,items:0}};
}
export function registerStitcherWardRoutes(app:FastifyInstance,options:{
 pool?:pg.Pool;resolveSession?:Resolver
}={}){
 const db=options.pool??new pg.Pool({connectionString:process.env.DATABASE_URL});
 if(!options.pool)app.addHook('onClose',async()=>{await db.end();});
 const resolve=options.resolveSession??(async(headers:IncomingHttpHeaders)=>
  auth.api.getSession({headers:fromNodeHeaders(headers)}));
 const route='/api/characters/:id/stitcher/ward';
 app.get<{Params:Params}>(route,async(req,reply)=>{
  const session=await resolve(req.headers);
  if(!session?.user.emailVerified)return reply.code(401).send(notReady('unauthorized'));
  if(!UUID.test(req.params.id))return reply.code(404).send(notReady('not_found'));
  const ch=await db.query<Character>(
   'SELECT origin,tutorial_stage,tutorial_status,major_skill_bonuses,coins FROM player_characters WHERE id=$1 AND account_id=$2',
   [req.params.id,session.user.id]);
  if(!ch.rowCount||ch.rows[0].origin!=='Stitcher')
   return reply.code(404).send(notReady('not_found'));
  try{
   const saved=await db.query<Saved>(
    'SELECT revision,state FROM player_character_stitcher_ward WHERE character_id=$1',
    [req.params.id]);
   if(!saved.rowCount){
    if(ch.rows[0].tutorial_stage!==1)return reply.code(409).send(notReady('ward_not_started'));
    return view(ch.rows[0],INITIAL_STITCHER,false);
   }
   if(Number(saved.rows[0].revision)!==saved.rows[0].state.revision)
     return reply.code(409).send(notReady('unsafe_work_state'));
   return view(ch.rows[0],saved.rows[0].state,true);
  }catch(e){
   if(schemaMissing(e))return reply.code(503).send(notReady('stitcher_migration_required'));
   throw e;
  }
 });
 app.post<{Params:Params}>(route,async(req,reply)=>{
  const session=await resolve(req.headers);
  if(!session?.user.emailVerified)return reply.code(401).send(notReady('unauthorized'));
  if(!UUID.test(req.params.id))return reply.code(404).send(notReady('not_found'));
  const origin=req.headers.origin;
  if(origin&&origin!==(process.env.AUTH_BASE_URL??'http://127.0.0.1:5173'))
   return reply.code(403).send(notReady('invalid_origin'));
  if(!req.headers['content-type']?.toLowerCase().startsWith('application/json'))
   return reply.code(415).send(notReady('json_required'));
  let command:Command;
  try{command=parse(req.body);}
  catch(e){return reply.code(400).send(notReady(e instanceof Error?e.message:'invalid_body'));}
  const hash=createHash('sha256').update(JSON.stringify({
   action:command.action,expectedRevision:command.expectedRevision
  })).digest('hex');
  const client=await db.connect();
  let open=false;
  try{
   await client.query('BEGIN');open=true;
   const owned=await client.query<Character>(
    'SELECT origin,tutorial_stage,tutorial_status,major_skill_bonuses,coins FROM player_characters WHERE id=$1 AND account_id=$2 FOR UPDATE',
    [req.params.id,session.user.id]);
   if(!owned.rowCount||owned.rows[0].origin!=='Stitcher'){
    await client.query('ROLLBACK');open=false;
    return reply.code(404).send(notReady('not_found'));
   }
   const old=await client.query<Saved>(
    'SELECT revision,state FROM player_character_stitcher_ward WHERE character_id=$1 FOR UPDATE',
    [req.params.id]);
   const receipts=await client.query<{request_hash:string;result:unknown}>(
    'SELECT request_hash,result FROM player_character_stitcher_ward_receipts WHERE character_id=$1 AND request_id=$2',
    [req.params.id,command.requestId]);
   if(receipts.rowCount){
    await client.query('COMMIT');open=false;
    if(receipts.rows[0].request_hash!==hash)
      return reply.code(409).send(notReady('idempotency_key_reuse'));
    return receipts.rows[0].result;
   }
   const ch=owned.rows[0];
   if(!old.rowCount&&command.action==='start'&&ch.tutorial_stage===1&&
     ch.tutorial_status==='NOT_STARTED'&&command.expectedRevision===0){
    await client.query(
     'INSERT INTO player_character_stitcher_ward(character_id,revision,state) VALUES($1,0,$2::jsonb)',
     [req.params.id,JSON.stringify(INITIAL_STITCHER)]);
    await client.query(
     "UPDATE player_characters SET tutorial_status='IN_PROGRESS' WHERE id=$1",
     [req.params.id]);
    const result=view({...ch,tutorial_status:'IN_PROGRESS'},INITIAL_STITCHER,true);
    await client.query(
     'INSERT INTO player_character_stitcher_ward_receipts(character_id,request_id,request_hash,result) VALUES($1,$2,$3,$4::jsonb)',
     [req.params.id,command.requestId,hash,JSON.stringify(result)]);
    await client.query('COMMIT');open=false;
    return result;
   }
   const saved=old.rows[0];
   if(!saved||command.action==='start'||Number(saved.revision)!==saved.state.revision||
     saved.state.stage!==ch.tutorial_stage||
      !(ch.tutorial_status==='IN_PROGRESS'||
        // Stage IV used to park Stage V at NOT_STARTED. Resume old saves.
        (saved.state.stage===5&&saved.state.phase==='exited'&&
         ch.tutorial_status==='NOT_STARTED'))){
    await client.query('ROLLBACK');open=false;
    return reply.code(409).send(notReady('wrong_work_phase'));
   }
   if(saved.state.revision!==command.expectedRevision){
    await client.query('ROLLBACK');open=false;
    return reply.code(409).send({error:'stale_revision',revision:saved.state.revision});
   }
   let next:StitcherState;
   try{next=applyStitcherAction(saved.state,command.action);}
   catch(e){
    if(!(e instanceof StitcherInvalidAction))throw e;
    await client.query('ROLLBACK');open=false;
    return reply.code(409).send(notReady('invalid_work_phase'));
   }
   // The single skill award occurs *only* when Stage III commits one branch,
   // never on Stage IV completion, GET, reload or a repeated request ID.
   const granted={...ch.major_skill_bonuses};
   if(saved.state.stage===3&&next.stage===4&&next.branch){
    const major=STITCHER_MAJOR[next.branch];
    const previous=granted[major]??0;
    if(!Number.isSafeInteger(previous)||previous<0||previous>99){
     await client.query('ROLLBACK');open=false;
     return reply.code(409).send(notReady('invalid_skill_level'));
    }
    granted[major]=previous+1;
   }
   const nextStatus='IN_PROGRESS'; // Stage V is now playable, not a parked preview.
   await client.query(
    'UPDATE player_character_stitcher_ward SET revision=$2,state=$3::jsonb,updated_at=NOW() WHERE character_id=$1',
    [req.params.id,next.revision,JSON.stringify(next)]);
   await client.query(
    'UPDATE player_characters SET tutorial_stage=$2,tutorial_status=$3,major_skill_bonuses=$4::jsonb WHERE id=$1',
    [req.params.id,next.stage,nextStatus,JSON.stringify(granted)]);
   // Archive only reducer-confirmed transitions, inside the same
   // character-locked transaction as progression and idempotency receipts.
   if(next.stage>saved.state.stage){
    const stage=saved.state.stage;
    await archiveJournalTask(client,stitcherTask(req.params.id,next,stage as 1|2|3|4|5));
   }
   const result=view({...ch,tutorial_stage:next.stage,
    tutorial_status:nextStatus,major_skill_bonuses:granted},next,true);
   await client.query(
    'INSERT INTO player_character_stitcher_ward_receipts(character_id,request_id,request_hash,result) VALUES($1,$2,$3,$4::jsonb)',
    [req.params.id,command.requestId,hash,JSON.stringify(result)]);
   await client.query('COMMIT');open=false;
   return result;
  }catch(e){
   if(open){try{await client.query('ROLLBACK');}catch{/* Preserve original. */}}
   if(schemaMissing(e))return reply.code(503).send(notReady('stitcher_migration_required'));
   throw e;
  }finally{client.release();}
 });
}
