/** Bellrunner Stage V: replay-safe, owner-scoped Dogman conversation.
 * Dogman knows the completed branch only; choosing to tell him is explicit.
 * Stage VI combat is separate. No temporary fake fighting or double awards.
 */
import type {FastifyInstance} from 'fastify';
import type {IncomingHttpHeaders} from 'node:http';
import {fromNodeHeaders} from 'better-auth/node';
import {createHash} from 'node:crypto';
import pg from 'pg';
import {auth} from './auth.js';
import {
  initialDogman,advanceDogman,availableDogmanActions,
  DOGMAN_ACTIONS,DOGMAN_BRANCHES,InvalidDogmanAction,
  type DogmanAction,type DogmanState
} from './bellrunner-dogman-work.js';
import type {BellBranch} from './bellrunner-wrong-bell-work.js';

type Session={user:{id:string;emailVerified:boolean}}|null;
type Resolver=(headers:IncomingHttpHeaders)=>Promise<Session>;
type Params={id:string};
type Character={origin:string;tutorial_stage:number;tutorial_status:string};
type Command={action:DogmanAction;expectedRevision:number;requestId:string};
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const missing=(e:unknown)=>['42P01','42703'].includes((e as {code?:string})?.code??'');
function parse(value:unknown):Command{
  if(!value||typeof value!=='object'||Array.isArray(value))throw Error('invalid_body');
  const v=value as Record<string,unknown>;
  if(Object.keys(v).sort().join(',')!=='action,expectedRevision,requestId')throw Error('invalid_fields');
  if(typeof v.action!=='string'||!DOGMAN_ACTIONS.includes(v.action as DogmanAction))throw Error('invalid_action');
  if(typeof v.requestId!=='string'||!UUID.test(v.requestId))throw Error('invalid_request_id');
  if(typeof v.expectedRevision!=='number'||!Number.isSafeInteger(v.expectedRevision)||v.expectedRevision<0)
    throw Error('invalid_revision');
  return {action:v.action as DogmanAction,expectedRevision:v.expectedRevision,requestId:v.requestId};
}
function view(ch:Character,state:DogmanState){
  return {stage:ch.tutorial_stage,tutorialStatus:ch.tutorial_status,state,
    availableActions:ch.tutorial_stage===5?availableDogmanActions(state):[],
    tutorialPayout:{coins:0,ordinaryXp:0,items:0}};
}
function predecessor(row:{state:{branch:BellBranch;phase:string}}|undefined):BellBranch|null{
  if(row?.state.phase!=='exited')return null;
  return DOGMAN_BRANCHES.includes(row.state.branch)?row.state.branch:null;
}
export function registerBellrunnerDogmanRoutes(app:FastifyInstance,options?:{
  pool?:pg.Pool;resolveSession?:Resolver
}){
  const db=options?.pool??new pg.Pool({connectionString:process.env.DATABASE_URL});
  if(!options?.pool)app.addHook('onClose',async()=>{await db.end();});
  const resolve=options?.resolveSession??(async(headers:IncomingHttpHeaders)=>
    auth.api.getSession({headers:fromNodeHeaders(headers)}));
  const URL='/api/characters/:id/bellrunner/dogman';
  app.get<{Params:Params}>(URL,async(req,reply)=>{
    const session=await resolve(req.headers);
    if(!session?.user.emailVerified)return reply.code(401).send({error:'unauthorized'});
    if(!UUID.test(req.params.id))return reply.code(404).send({error:'not_found'});
    const ch=await db.query<Character>(
      'SELECT origin,tutorial_stage,tutorial_status FROM player_characters WHERE id=$1 AND account_id=$2',
      [req.params.id,session.user.id]);
    if(!ch.rowCount||ch.rows[0].origin!=='Bellrunner')return reply.code(404).send({error:'not_found'});
    if(ch.rows[0].tutorial_stage<5)return reply.code(409).send({error:'stage_five_not_ready'});
    if(ch.rows[0].tutorial_stage>6)return reply.code(409).send({error:'stage_five_closed'});
    try{
      const completed=await db.query<{state:{branch:BellBranch;phase:string}}>(
        'SELECT state FROM player_character_bellrunner_second_job WHERE character_id=$1',
        [req.params.id]);
      const branch=predecessor(completed.rows[0]);
      if(!branch)return reply.code(409).send({error:'second_job_not_complete'});
      const saved=await db.query<{state:DogmanState}>(
        'SELECT state FROM player_character_bellrunner_dogman WHERE character_id=$1',
        [req.params.id]);
      if(!saved.rowCount&&ch.rows[0].tutorial_stage!==5)
        return reply.code(409).send({error:'missing_dogman_state'});
      const state=saved.rows[0]?.state??initialDogman(branch);
      if(state.branch!==branch||
        (ch.rows[0].tutorial_stage===6&&(state.phase!=='done'||!state.stance))||
        (ch.rows[0].tutorial_stage===5&&state.phase==='done'))
        return reply.code(409).send({error:'invalid_dogman_state'});
      return view(ch.rows[0],state);
    }catch(e){
      if(missing(e))return reply.code(503).send({error:'dogman_migration_required'});
      throw e;
    }
  });
  app.post<{Params:Params}>(URL,async(req,reply)=>{
    const session=await resolve(req.headers);
    if(!session?.user.emailVerified)return reply.code(401).send({error:'unauthorized'});
    if(!UUID.test(req.params.id))return reply.code(404).send({error:'not_found'});
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
        'SELECT request_hash,result FROM player_character_bellrunner_dogman_receipts WHERE character_id=$1 AND request_id=$2',
        [req.params.id,cmd.requestId]);
      if(replay.rowCount){
        await client.query('COMMIT');open=false;
        if(replay.rows[0].request_hash!==hash)
          return reply.code(409).send({error:'idempotency_key_reuse'});
        return replay.rows[0].result;
      }
      if(ch.rows[0].tutorial_stage!==5){
        await client.query('ROLLBACK');open=false;
        return reply.code(409).send({error:'wrong_dogman_phase'});
      }
      const completed=await client.query<{state:{branch:BellBranch;phase:string}}>(
        'SELECT state FROM player_character_bellrunner_second_job WHERE character_id=$1',
        [req.params.id]);
      const branch=predecessor(completed.rows[0]);
      if(!branch){
        await client.query('ROLLBACK');open=false;
        return reply.code(409).send({error:'second_job_not_complete'});
      }
      await client.query(
        'INSERT INTO player_character_bellrunner_dogman(character_id,revision,state) VALUES($1,0,$2::jsonb) ON CONFLICT DO NOTHING',
        [req.params.id,JSON.stringify(initialDogman(branch))]);
      const saved=await client.query<{revision:string|number;state:DogmanState}>(
        'SELECT revision,state FROM player_character_bellrunner_dogman WHERE character_id=$1 FOR UPDATE',
        [req.params.id]);
      const current=saved.rows[0].state;
      if(current.branch!==branch||current.phase==='done'){
        await client.query('ROLLBACK');open=false;
        return reply.code(409).send({error:'branch_mismatch'});
      }
      if(Number(saved.rows[0].revision)!==cmd.expectedRevision||
        current.revision!==cmd.expectedRevision){
        await client.query('ROLLBACK');open=false;
        return reply.code(409).send({error:'stale_revision',currentRevision:current.revision});
      }
      let next:DogmanState;
      try{next=advanceDogman(current,cmd.action);}
      catch(e){
        if(!(e instanceof InvalidDogmanAction))throw e;
        await client.query('ROLLBACK');open=false;
        return reply.code(409).send({error:'invalid_work_phase'});
      }
      const character:Character={...ch.rows[0]};
      if(next.phase==='done'){
        character.tutorial_stage=6;
        character.tutorial_status='NOT_STARTED';
      }else character.tutorial_status='IN_PROGRESS';
      await client.query(
        'UPDATE player_character_bellrunner_dogman SET revision=$2,state=$3::jsonb,updated_at=NOW() WHERE character_id=$1',
        [req.params.id,next.revision,JSON.stringify(next)]);
      await client.query(
        'UPDATE player_characters SET tutorial_stage=$2,tutorial_status=$3 WHERE id=$1',
        [req.params.id,character.tutorial_stage,character.tutorial_status]);
      const result=view(character,next);
      await client.query(
        'INSERT INTO player_character_bellrunner_dogman_receipts(character_id,request_id,request_hash,result) VALUES($1,$2,$3,$4::jsonb)',
        [req.params.id,cmd.requestId,hash,JSON.stringify(result)]);
      await client.query('COMMIT');open=false;
      return result;
    }catch(e){
      if(open){try{await client.query('ROLLBACK');}catch{/* preserve failure */}}
      if(missing(e))return reply.code(503).send({error:'dogman_migration_required'});
      throw e;
    }finally{client.release();}
  });
}
