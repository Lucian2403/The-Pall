/** Bellrunner Stage 3 — The Wrong Bell. Authenticated, transactional and replay safe.
 * The Stage 2 sealed order is a task prop. No coins, ordinary XP or loot.
 */
import type {FastifyInstance} from 'fastify';
import type {IncomingHttpHeaders} from 'node:http';
import {fromNodeHeaders} from 'better-auth/node';
import {createHash} from 'node:crypto';
import pg from 'pg';
import {auth} from './auth.js';
import {
  INITIAL_WRONG_BELL,BELL_ACTIONS,BELL_BRANCH_SKILL,advanceWrongBell,
  availableBellActions,InvalidBellAction,
  type BellState,type BellAction
} from './bellrunner-wrong-bell-work.js';

type Session={user:{id:string;emailVerified:boolean}}|null;
type Resolver=(headers:IncomingHttpHeaders)=>Promise<Session>;
type Params={id:string};
type Character={
  origin:string;tutorial_stage:number;tutorial_status:string;
  major_skill_bonuses:Record<string,number>;
};
type Command={action:BellAction;requestId:string;expectedRevision:number};
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const schemaMissing=(e:unknown)=>['42P01','42703'].includes((e as {code?:string})?.code??'');

function parse(input:unknown):Command{
  if(!input||typeof input!=='object'||Array.isArray(input))throw Error('invalid_body');
  const v=input as Record<string,unknown>;
  if(Object.keys(v).sort().join(',')!=='action,expectedRevision,requestId')
    throw Error('invalid_fields');
  if(typeof v.action!=='string'||!BELL_ACTIONS.includes(v.action as BellAction))
    throw Error('invalid_action');
  if(typeof v.requestId!=='string'||!UUID.test(v.requestId))
    throw Error('invalid_request_id');
  if(typeof v.expectedRevision!=='number'||!Number.isSafeInteger(v.expectedRevision)||
    v.expectedRevision<0)throw Error('invalid_revision');
  return {action:v.action as BellAction,requestId:v.requestId,expectedRevision:v.expectedRevision};
}
function view(character:Character,state:BellState){
  return {
    stage:character.tutorial_stage,tutorialStatus:character.tutorial_status,
    majorSkillBonuses:character.major_skill_bonuses,state,
    availableActions:availableBellActions(state),
    tutorialPayout:{coins:0,ordinaryXp:0,items:0},
    finalRound:{accepted:false,reason:'Receiving office closed; authorized final mark unavailable.'}
  };
}
export function registerBellrunnerWrongBellRoutes(app:FastifyInstance,options?:{
  pool?:pg.Pool;resolveSession?:Resolver
}){
  const db=options?.pool??new pg.Pool({connectionString:process.env.DATABASE_URL});
  if(!options?.pool)app.addHook('onClose',async()=>{await db.end();});
  const resolve=options?.resolveSession??(async(headers:IncomingHttpHeaders)=>
    auth.api.getSession({headers:fromNodeHeaders(headers)}));
  const URL='/api/characters/:id/bellrunner/wrong-bell';

  app.get<{Params:Params}>(URL,async(req,reply)=>{
    const session=await resolve(req.headers);
    if(!session?.user.emailVerified)return reply.code(401).send({error:'unauthorized'});
    if(!UUID.test(req.params.id))return reply.code(404).send({error:'not_found'});
    const ch=await db.query<Character>(
      'SELECT origin,tutorial_stage,tutorial_status,major_skill_bonuses FROM player_characters WHERE id=$1 AND account_id=$2',
      [req.params.id,session.user.id]);
    if(!ch.rowCount||ch.rows[0].origin!=='Bellrunner')
      return reply.code(404).send({error:'not_found'});
    if(ch.rows[0].tutorial_stage<3)return reply.code(409).send({error:'stage_three_not_ready'});
    try{
      const prior=await db.query<{work_state:{phase:string}}>(
        'SELECT work_state FROM player_character_bellrunner_dispatch WHERE character_id=$1',
        [req.params.id]);
      if(prior.rows[0]?.work_state?.phase!=='final_notice_taken')
        return reply.code(409).send({error:'stage_two_not_complete'});
      const saved=await db.query<{state:BellState}>(
        'SELECT state FROM player_character_bellrunner_wrong_bell WHERE character_id=$1',
        [req.params.id]);
      if(!saved.rowCount&&ch.rows[0].tutorial_stage!==3)
        return reply.code(409).send({error:'stage_three_state_missing'});
      return view(ch.rows[0],saved.rows[0]?.state??INITIAL_WRONG_BELL);
    }catch(e){
      if(schemaMissing(e))return reply.code(503).send({error:'bellrunner_migration_required'});
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
        'SELECT origin,tutorial_stage,tutorial_status,major_skill_bonuses FROM player_characters WHERE id=$1 AND account_id=$2 FOR UPDATE',
        [req.params.id,session.user.id]);
      if(!ch.rowCount||ch.rows[0].origin!=='Bellrunner'){
        await client.query('ROLLBACK');open=false;
        return reply.code(404).send({error:'not_found'});
      }
      const replay=await client.query<{request_hash:string;result:unknown}>(
        'SELECT request_hash,result FROM player_character_bellrunner_wrong_bell_receipts WHERE character_id=$1 AND request_id=$2',
        [req.params.id,cmd.requestId]);
      if(replay.rowCount){
        await client.query('COMMIT');open=false;
        if(replay.rows[0].request_hash!==hash)
          return reply.code(409).send({error:'idempotency_key_reuse'});
        return replay.rows[0].result;
      }
      if(ch.rows[0].tutorial_stage!==3){
        await client.query('ROLLBACK');open=false;
        return reply.code(409).send({error:'wrong_work_phase'});
      }
      const prior=await client.query<{work_state:{phase:string}}>(
        'SELECT work_state FROM player_character_bellrunner_dispatch WHERE character_id=$1 FOR UPDATE',
        [req.params.id]);
      if(prior.rows[0]?.work_state?.phase!=='final_notice_taken'){
        await client.query('ROLLBACK');open=false;
        return reply.code(409).send({error:'stage_two_not_complete'});
      }
      await client.query(
        'INSERT INTO player_character_bellrunner_wrong_bell(character_id,revision,state) VALUES ($1,0,$2::jsonb) ON CONFLICT DO NOTHING',
        [req.params.id,JSON.stringify(INITIAL_WRONG_BELL)]);
      const row=await client.query<{revision:string|number;state:BellState}>(
        'SELECT revision,state FROM player_character_bellrunner_wrong_bell WHERE character_id=$1 FOR UPDATE',
        [req.params.id]);
      const current=row.rows[0].state;
      if(Number(row.rows[0].revision)!==cmd.expectedRevision ||
         current.revision!==cmd.expectedRevision){
        await client.query('ROLLBACK');open=false;
        return reply.code(409).send({error:'stale_revision',currentRevision:current.revision});
      }
      let next:BellState;
      try{next=advanceWrongBell(current,cmd.action);}
      catch(e){
        if(!(e instanceof InvalidBellAction))throw e;
        await client.query('ROLLBACK');open=false;
        return reply.code(409).send({error:'invalid_work_phase'});
      }
      const character:Character={...ch.rows[0],
        major_skill_bonuses:{...ch.rows[0].major_skill_bonuses}};
      if(!current.branch&&next.branch){
        const key=BELL_BRANCH_SKILL[next.branch];
        const priorLevel=character.major_skill_bonuses[key]??0;
        if(!Number.isSafeInteger(priorLevel)||priorLevel<0||priorLevel>=Number.MAX_SAFE_INTEGER)
          throw Error('invalid_skill_level');
        character.major_skill_bonuses[key]=priorLevel+1;
        character.tutorial_stage=4;
        character.tutorial_status='NOT_STARTED';
      }else{
        character.tutorial_status='IN_PROGRESS';
      }
      await client.query(
        'UPDATE player_character_bellrunner_wrong_bell SET revision=$2,state=$3::jsonb,updated_at=NOW() WHERE character_id=$1',
        [req.params.id,next.revision,JSON.stringify(next)]);
      await client.query(
        'UPDATE player_characters SET tutorial_stage=$2,tutorial_status=$3,major_skill_bonuses=$4::jsonb WHERE id=$1',
        [req.params.id,character.tutorial_stage,character.tutorial_status,
          JSON.stringify(character.major_skill_bonuses)]);
      const result=view(character,next);
      await client.query(
        'INSERT INTO player_character_bellrunner_wrong_bell_receipts(character_id,request_id,request_hash,result) VALUES($1,$2,$3,$4::jsonb)',
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
