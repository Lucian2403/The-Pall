/**
 * Authenticated, server-authoritative Millhand Stage 4 second jobs.
 * The selected branch must come from persisted Stage 3; clients cannot choose
 * a different branch. No skill award, coins, XP, inventory or timer mutation.
 */
import type {FastifyInstance} from 'fastify';
import {fromNodeHeaders} from 'better-auth/node';
import {createHash} from 'node:crypto';
import pg from 'pg';
import {auth} from './auth.js';
import {
  SECOND_JOB_ACTIONS,initialSecondJob,availableSecondJobActions,
  advanceSecondJob,SecondJobInvalidAction
} from '@the-pall/game-core';
import type {SecondJobAction,SecondJobState,MissingStampBranch} from '@the-pall/game-core';

const db=new pg.Pool({connectionString:process.env.DATABASE_URL});
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
type Params={id:string};
type CharacterRow={origin:string;tutorial_stage:number;tutorial_status:string;major_skill_bonuses:Record<string,number>};
type Command={action:SecondJobAction;expectedRevision:number;requestId:string};

function parseCommand(value:unknown):Command {
  if(!value||typeof value!=='object'||Array.isArray(value))throw Error('invalid_body');
  const v=value as Record<string,unknown>;
  if(Object.keys(v).sort().join(',')!=='action,expectedRevision,requestId')throw Error('invalid_fields');
  if(typeof v.requestId!=='string'||!UUID.test(v.requestId))throw Error('invalid_request_id');
  if(!Number.isSafeInteger(v.expectedRevision)||(v.expectedRevision as number)<0)throw Error('invalid_revision');
  if(typeof v.action!=='string'||!SECOND_JOB_ACTIONS.includes(v.action as SecondJobAction))throw Error('invalid_action');
  return {action:v.action as SecondJobAction,expectedRevision:v.expectedRevision as number,requestId:v.requestId};
}
function snapshot(ch:CharacterRow,state:SecondJobState){
  return {stage:ch.tutorial_stage,tutorialStatus:ch.tutorial_status,
    state,availableActions:availableSecondJobActions(state),
    tutorialPayout:{coins:0,ordinaryXp:0,items:0}};
}
function branchFromSavedStage3(value:{branch:MissingStampBranch|null;phase:string}|undefined){
  if(!value||value.phase!=='SELECTED'||
    (value.branch!=='restamp'&&value.branch!=='contracts'&&value.branch!=='records'))
    return null;
  return value.branch;
}

export function registerMillhandSecondJobRoutes(app:FastifyInstance){
  app.addHook('onClose',async()=>{await db.end();});

  app.get<{Params:Params}>('/api/characters/:id/millhand/second-job',async(req,reply)=>{
    const session=await auth.api.getSession({headers:fromNodeHeaders(req.headers)});
    if(!session?.user.emailVerified)return reply.code(401).send({error:'unauthorized'});
    if(!UUID.test(req.params.id))return reply.code(404).send({error:'not_found'});
    const ch=await db.query<CharacterRow>(
      'SELECT origin,tutorial_stage,tutorial_status,major_skill_bonuses FROM player_characters WHERE id=$1 AND account_id=$2',
      [req.params.id,session.user.id]
    );
    if(!ch.rowCount||ch.rows[0].origin!=='Millhand')return reply.code(404).send({error:'not_found'});
    if(ch.rows[0].tutorial_stage<4)return reply.code(409).send({error:'stage_four_not_ready'});
    const predecessor=await db.query<{state:{branch:MissingStampBranch|null;phase:string}}>(
      'SELECT state FROM player_character_missing_stamp WHERE character_id=$1',[req.params.id]
    );
    const branch=branchFromSavedStage3(predecessor.rows[0]?.state);
    if(!branch)return reply.code(409).send({error:'stage_three_not_complete'});
    let job;
    try {
      job=await db.query<{state:SecondJobState}>(
        'SELECT state FROM player_character_second_job WHERE character_id=$1',[req.params.id]
      );
    } catch(e) {
      if((e as {code?:string})?.code==='42P01')
        return reply.code(503).send({error:'second_job_schema_missing',setup:'npm run second-job:migrate'});
      throw e;
    }
    if(!job.rowCount&&ch.rows[0].tutorial_stage!==4)return reply.code(409).send({error:'missing_second_job_state'});
    const state=job.rows[0]?.state??initialSecondJob(branch);
    if(state.branch!==branch || (ch.rows[0].tutorial_stage>4&&state.phase!=='DONE'))
      return reply.code(409).send({error:'invalid_second_job_state'});
    return snapshot(ch.rows[0],state);
  });

  app.post<{Params:Params}>('/api/characters/:id/millhand/second-job',async(req,reply)=>{
    const session=await auth.api.getSession({headers:fromNodeHeaders(req.headers)});
    if(!session?.user.emailVerified)return reply.code(401).send({error:'unauthorized'});
    if(!UUID.test(req.params.id))return reply.code(404).send({error:'not_found'});
    const origin=req.headers.origin;
    if(origin&&origin!==(process.env.AUTH_BASE_URL??'http://127.0.0.1:5173'))
      return reply.code(403).send({error:'invalid_origin'});
    if(!req.headers['content-type']?.toLowerCase().startsWith('application/json'))
      return reply.code(415).send({error:'json_required'});
    let cmd:Command;
    try{cmd=parseCommand(req.body);}catch(e){
      return reply.code(400).send({error:e instanceof Error?e.message:'invalid_action'});
    }
    const hash=createHash('sha256').update(JSON.stringify({
      action:cmd.action,expectedRevision:cmd.expectedRevision
    })).digest('hex');
    const client=await db.connect();
    let transaction=false;
    try{
      await client.query('BEGIN');transaction=true;
      const char=await client.query<CharacterRow>(
        'SELECT origin,tutorial_stage,tutorial_status,major_skill_bonuses FROM player_characters WHERE id=$1 AND account_id=$2 FOR UPDATE',
        [req.params.id,session.user.id]
      );
      if(!char.rowCount||char.rows[0].origin!=='Millhand'){
        await client.query('ROLLBACK');transaction=false;
        return reply.code(404).send({error:'not_found'});
      }
      const old=await client.query<{request_hash:string;result:unknown}>(
        'SELECT request_hash,result FROM player_character_second_job_receipts WHERE character_id=$1 AND request_id=$2',
        [req.params.id,cmd.requestId]
      );
      if(old.rowCount){
        await client.query('COMMIT');transaction=false;
        if(old.rows[0].request_hash!==hash)return reply.code(409).send({error:'idempotency_key_reuse'});
        return old.rows[0].result;
      }
      if(char.rows[0].tutorial_stage!==4){
        await client.query('ROLLBACK');transaction=false;
        return reply.code(409).send({error:'wrong_second_job_phase'});
      }
      const previous=await client.query<{state:{branch:MissingStampBranch|null;phase:string}}>(
        'SELECT state FROM player_character_missing_stamp WHERE character_id=$1',[req.params.id]
      );
      const branch=branchFromSavedStage3(previous.rows[0]?.state);
      if(!branch){
        await client.query('ROLLBACK');transaction=false;
        return reply.code(409).send({error:'stage_three_not_complete'});
      }
      await client.query(
        'INSERT INTO player_character_second_job(character_id,revision,state) VALUES($1,0,$2::jsonb) ON CONFLICT DO NOTHING',
        [req.params.id,JSON.stringify(initialSecondJob(branch))]
      );
      const job=await client.query<{state:SecondJobState}>(
        'SELECT state FROM player_character_second_job WHERE character_id=$1 FOR UPDATE',[req.params.id]
      );
      const current=job.rows[0].state;
      if(current.branch!==branch){
        await client.query('ROLLBACK');transaction=false;
        return reply.code(409).send({error:'branch_mismatch'});
      }
      if(current.revision!==cmd.expectedRevision){
        await client.query('ROLLBACK');transaction=false;
        return reply.code(409).send({error:'stale_revision',currentRevision:current.revision});
      }
      let next:SecondJobState;
      try{next=advanceSecondJob(current,cmd.action);}
      catch(e){
        if(!(e instanceof SecondJobInvalidAction))throw e;
        await client.query('ROLLBACK');transaction=false;
        return reply.code(409).send({error:'wrong_second_job_phase'});
      }
      const nextCharacter:CharacterRow={...char.rows[0]};
      if(next.phase==='DONE'){
        nextCharacter.tutorial_stage=5;
        nextCharacter.tutorial_status='NOT_STARTED';
      }else{
        nextCharacter.tutorial_stage=4;
        nextCharacter.tutorial_status='IN_PROGRESS';
      }
      await client.query(
        'UPDATE player_character_second_job SET state=$2::jsonb,revision=$3,updated_at=NOW() WHERE character_id=$1',
        [req.params.id,JSON.stringify(next),next.revision]
      );
      await client.query(
        'UPDATE player_characters SET tutorial_stage=$2,tutorial_status=$3 WHERE id=$1',
        [req.params.id,nextCharacter.tutorial_stage,nextCharacter.tutorial_status]
      );
      const result=snapshot(nextCharacter,next);
      await client.query(
        'INSERT INTO player_character_second_job_receipts(character_id,request_id,request_hash,result) VALUES($1,$2,$3,$4::jsonb)',
        [req.params.id,cmd.requestId,hash,JSON.stringify(result)]
      );
      await client.query('COMMIT');transaction=false;
      return reply.code(200).send(result);
    }catch(e){
      if(transaction){try{await client.query('ROLLBACK');}catch{/* keep original */}}
      if((e as {code?:string})?.code==='42P01')
        return reply.code(503).send({error:'second_job_schema_missing',setup:'npm run second-job:migrate'});
      throw e;
    }finally{client.release();}
  });
}
