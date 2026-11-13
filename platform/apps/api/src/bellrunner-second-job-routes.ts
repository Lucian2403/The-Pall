/** Bellrunner Stage 4 — branch-owned, persistent, replay-safe workplace tasks.
 * Stage 3 determines the branch/skill. This endpoint NEVER awards another
 * skill level or changes coins, XP, inventory, health or unapproved clock values.
 */
import type {FastifyInstance} from 'fastify';
import type {IncomingHttpHeaders} from 'node:http';
import {fromNodeHeaders} from 'better-auth/node';
import {createHash} from 'node:crypto';
import pg from 'pg';
import {auth} from './auth.js';
import type {BellBranch} from './bellrunner-wrong-bell-work.js';
import {
  initialBellrunnerSecondJob,availableStageFourActions,
  advanceBellrunnerSecondJob,STAGE_FOUR_ACTIONS,InvalidStageFourAction,
  type StageFourAction,type StageFourState
} from './bellrunner-second-job-work.js';
type Session={user:{id:string;emailVerified:boolean}}|null;
type Resolver=(headers:IncomingHttpHeaders)=>Promise<Session>;
type Params={id:string};
type Character={origin:string;tutorial_stage:number;tutorial_status:string};
type Command={action:StageFourAction;requestId:string;expectedRevision:number};
// UUIDv4 and compatible request identifiers from the shared client.
// time-safe variants used by the shared game client.
const UUID_SAFE=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const schemaMissing=(e:unknown)=>['42P01','42703'].includes((e as {code?:string})?.code??'');
function parse(value:unknown):Command{
  if(!value||typeof value!=='object'||Array.isArray(value))throw Error('invalid_body');
  const v=value as Record<string,unknown>;
  if(Object.keys(v).sort().join(',')!=='action,expectedRevision,requestId')throw Error('invalid_fields');
  if(typeof v.action!=='string'||!STAGE_FOUR_ACTIONS.includes(v.action as StageFourAction))throw Error('invalid_action');
  if(typeof v.requestId!=='string'||!UUID_SAFE.test(v.requestId))throw Error('invalid_request_id');
  if(typeof v.expectedRevision!=='number'||!Number.isSafeInteger(v.expectedRevision)||v.expectedRevision<0)
    throw Error('invalid_revision');
  return {action:v.action as StageFourAction,requestId:v.requestId,expectedRevision:v.expectedRevision};
}
function savedBranch(row:{state:{phase:string;branch:BellBranch|null}}|undefined):BellBranch|null{
  const state=row?.state;
  if(state?.phase!=='committed')return null;
  if(state.branch==='contracts'||state.branch==='trauma'||state.branch==='machinery')return state.branch;
  return null;
}
function view(ch:Character,state:StageFourState){
  return {
    stage:ch.tutorial_stage,tutorialStatus:ch.tutorial_status,
    state,availableActions:ch.tutorial_stage===4?availableStageFourActions(state):[],
    tutorialPayout:{coins:0,ordinaryXp:0,items:0}
  };
}
export function registerBellrunnerSecondJobRoutes(app:FastifyInstance,options?:{
  pool?:pg.Pool;resolveSession?:Resolver
}){
  const db=options?.pool??new pg.Pool({connectionString:process.env.DATABASE_URL});
  if(!options?.pool)app.addHook('onClose',async()=>{await db.end();});
  const resolve=options?.resolveSession??(async(headers:IncomingHttpHeaders)=>
    auth.api.getSession({headers:fromNodeHeaders(headers)}));
  const URL='/api/characters/:id/bellrunner/second-job';
  app.get<{Params:Params}>(URL,async(req,reply)=>{
    const session=await resolve(req.headers);
    if(!session?.user.emailVerified)return reply.code(401).send({error:'unauthorized'});
    if(!UUID_SAFE.test(req.params.id))return reply.code(404).send({error:'not_found'});
    const ch=await db.query<Character>(
      'SELECT origin,tutorial_stage,tutorial_status FROM player_characters WHERE id=$1 AND account_id=$2',
      [req.params.id,session.user.id]);
    if(!ch.rowCount||ch.rows[0].origin!=='Bellrunner')return reply.code(404).send({error:'not_found'});
    if(ch.rows[0].tutorial_stage<4)return reply.code(409).send({error:'stage_four_not_ready'});
    try{
      const earlier=await db.query<{state:{phase:string;branch:BellBranch|null}}>(
        'SELECT state FROM player_character_bellrunner_wrong_bell WHERE character_id=$1',
        [req.params.id]);
      const branch=savedBranch(earlier.rows[0]);
      if(!branch)return reply.code(409).send({error:'stage_three_not_committed'});
      const saved=await db.query<{state:StageFourState}>(
        'SELECT state FROM player_character_bellrunner_second_job WHERE character_id=$1',
        [req.params.id]);
      if(!saved.rowCount&&ch.rows[0].tutorial_stage!==4)
        return reply.code(409).send({error:'stage_four_state_missing'});
      const state=saved.rows[0]?.state??initialBellrunnerSecondJob(branch);
      if(state.branch!==branch||(ch.rows[0].tutorial_stage>4&&state.phase!=='exited'))
        return reply.code(409).send({error:'invalid_stage_four_state'});
      return view(ch.rows[0],state);
    }catch(e){
      if(schemaMissing(e))return reply.code(503).send({error:'bellrunner_migration_required'});
      throw e;
    }
  });
  app.post<{Params:Params}>(URL,async(req,reply)=>{
    const session=await resolve(req.headers);
    if(!session?.user.emailVerified)return reply.code(401).send({error:'unauthorized'});
    if(!UUID_SAFE.test(req.params.id))return reply.code(404).send({error:'not_found'});
    const origin=req.headers.origin;
    if(origin&&origin!==(process.env.AUTH_BASE_URL??'http://127.0.0.1:5173'))
      return reply.code(403).send({error:'invalid_origin'});
    if(!req.headers['content-type']?.toLowerCase().startsWith('application/json'))
      return reply.code(415).send({error:'json_required'});
    let cmd:Command;
    try{cmd=parse(req.body);}catch(e){
      return reply.code(400).send({error:e instanceof Error?e.message:'invalid_action'});
    }
    const hash=createHash('sha256').update(JSON.stringify({
      action:cmd.action,expectedRevision:cmd.expectedRevision
    })).digest('hex');
    const client=await db.connect();let open=false;
    try{
      await client.query('BEGIN');open=true;
      const ch=await client.query<Character>(
        'SELECT origin,tutorial_stage,tutorial_status FROM player_characters WHERE id=$1 AND account_id=$2 FOR UPDATE',
        [req.params.id,session.user.id]);
      if(!ch.rowCount||ch.rows[0].origin!=='Bellrunner'){
        await client.query('ROLLBACK');open=false;
        return reply.code(404).send({error:'not_found'});
      }
      const replay=await client.query<{request_hash:string;result:unknown}>(
        'SELECT request_hash,result FROM player_character_bellrunner_second_job_receipts WHERE character_id=$1 AND request_id=$2',
        [req.params.id,cmd.requestId]);
      if(replay.rowCount){
        await client.query('COMMIT');open=false;
        if(replay.rows[0].request_hash!==hash)
          return reply.code(409).send({error:'idempotency_key_reuse'});
        return replay.rows[0].result;
      }
      if(ch.rows[0].tutorial_stage!==4){
        await client.query('ROLLBACK');open=false;
        return reply.code(409).send({error:'wrong_work_phase'});
      }
      const earlier=await client.query<{state:{phase:string;branch:BellBranch|null}}>(
        'SELECT state FROM player_character_bellrunner_wrong_bell WHERE character_id=$1',
        [req.params.id]);
      const branch=savedBranch(earlier.rows[0]);
      if(!branch){
        await client.query('ROLLBACK');open=false;
        return reply.code(409).send({error:'stage_three_not_committed'});
      }
      await client.query(
        'INSERT INTO player_character_bellrunner_second_job(character_id,revision,state) VALUES($1,0,$2::jsonb) ON CONFLICT DO NOTHING',
        [req.params.id,JSON.stringify(initialBellrunnerSecondJob(branch))]);
      const saved=await client.query<{revision:string|number;state:StageFourState}>(
        'SELECT revision,state FROM player_character_bellrunner_second_job WHERE character_id=$1 FOR UPDATE',
        [req.params.id]);
      const current=saved.rows[0].state;
      if(current.branch!==branch){
        await client.query('ROLLBACK');open=false;
        return reply.code(409).send({error:'branch_mismatch'});
      }
      if(Number(saved.rows[0].revision)!==cmd.expectedRevision||
         current.revision!==cmd.expectedRevision){
        await client.query('ROLLBACK');open=false;
        return reply.code(409).send({error:'stale_revision',currentRevision:current.revision});
      }
      let next:StageFourState;
      try{next=advanceBellrunnerSecondJob(current,cmd.action);}
      catch(e){
        if(!(e instanceof InvalidStageFourAction))throw e;
        await client.query('ROLLBACK');open=false;
        return reply.code(409).send({error:'invalid_work_phase'});
      }
      const character:Character={...ch.rows[0]};
      if(next.phase==='exited'){
        character.tutorial_stage=5;
        character.tutorial_status='NOT_STARTED';
      }else{
        character.tutorial_status='IN_PROGRESS';
      }
      await client.query(
        'UPDATE player_character_bellrunner_second_job SET revision=$2,state=$3::jsonb,updated_at=NOW() WHERE character_id=$1',
        [req.params.id,next.revision,JSON.stringify(next)]);
      await client.query(
        'UPDATE player_characters SET tutorial_stage=$2,tutorial_status=$3 WHERE id=$1',
        [req.params.id,character.tutorial_stage,character.tutorial_status]);
      const result=view(character,next);
      await client.query(
        'INSERT INTO player_character_bellrunner_second_job_receipts(character_id,request_id,request_hash,result) VALUES($1,$2,$3,$4::jsonb)',
        [req.params.id,cmd.requestId,hash,JSON.stringify(result)]);
      await client.query('COMMIT');open=false;
      return result;
    }catch(e){
      if(open){try{await client.query('ROLLBACK');}catch{/* preserve failure */}}
      if(schemaMissing(e))return reply.code(503).send({error:'bellrunner_migration_required'});
      throw e;
    }finally{client.release();}
  });
}
