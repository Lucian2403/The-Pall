import type {FastifyInstance} from 'fastify';
import {fromNodeHeaders} from 'better-auth/node';
import {createHash} from 'node:crypto';
import pg from 'pg';
import {auth} from './auth.js';
import {
  AUTHORED_MISSING_STAMP_EVIDENCE, INITIAL_MISSING_STAMP,
  MISSING_STAMP_ACTIONS, MISSING_STAMP_ROUTE_SKILL,
  advanceMissingStamp, availableMissingStampActions, validateMissingStampEvidence,
  MissingStampInvalidAction
} from '@the-pall/game-core';
import type {MissingStampAction,MissingStampState,MissingStampEvidence} from '@the-pall/game-core';

const db=new pg.Pool({connectionString:process.env.DATABASE_URL});
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
type Params={id:string};
type CharacterRow={origin:string;tutorial_stage:number;tutorial_status:string;major_skill_bonuses:Record<string,number>};
type Command={action:MissingStampAction;expectedRevision:number;requestId:string};

function parseCommand(body:unknown):Command {
  if(!body||typeof body!=='object'||Array.isArray(body))throw Error('invalid_body');
  const v=body as Record<string,unknown>;
  if(Object.keys(v).sort().join(',')!=='action,expectedRevision,requestId')throw Error('invalid_fields');
  if(typeof v.requestId!=='string'||!UUID.test(v.requestId))throw Error('invalid_request_id');
  if(!Number.isSafeInteger(v.expectedRevision)||(v.expectedRevision as number)<0)throw Error('invalid_revision');
  if(typeof v.action!=='string'||!MISSING_STAMP_ACTIONS.includes(v.action as MissingStampAction))throw Error('invalid_action');
  return {action:v.action as MissingStampAction,expectedRevision:v.expectedRevision as number,requestId:v.requestId};
}

function authoredEvidence(): MissingStampEvidence | null {
  const e=AUTHORED_MISSING_STAMP_EVIDENCE;
  return e && validateMissingStampEvidence(e) ? e : null;
}
function snapshot(ch:CharacterRow,state:MissingStampState) {
  const evidence=authoredEvidence();
  return {
    stage:ch.tutorial_stage,
    tutorialStatus:ch.tutorial_status,
    majorSkillBonuses:ch.major_skill_bonuses,
    state,
    availableActions:availableMissingStampActions(state,evidence),
    contentReady:Boolean(evidence),
    // Never send a guessed number/date, or an uninspected record.
    slip: evidence && state.slipRead ? {workerNumber:evidence.workerNumber,recordedDeathDate:evidence.recordedDeathDate} : null,
    plate: evidence && state.plateRead ? {workerNumber:evidence.workerNumber,inspectionDate:evidence.inspectionDate,inspectionMarkPresent:true} : null,
    finding: evidence && state.slipRead && state.plateRead ? {
      workerNumber:evidence.workerNumber,
      recordedDeathDate:evidence.recordedDeathDate,
      inspectionDate:evidence.inspectionDate
    } : null,
    tutorialPayout:{coins:0,ordinaryXp:0,items:0}
  };
}

export function registerMissingStampRoutes(app:FastifyInstance) {
  app.addHook('onClose',async()=>{await db.end();});

  app.get<{Params:Params}>('/api/characters/:id/millhand/missing-stamp',async(req,reply)=>{
    const session=await auth.api.getSession({headers:fromNodeHeaders(req.headers)});
    if(!session?.user.emailVerified)return reply.code(401).send({error:'unauthorized'});
    if(!UUID.test(req.params.id))return reply.code(404).send({error:'not_found'});
    const ch=await db.query<CharacterRow>(
      'SELECT origin,tutorial_stage,tutorial_status,major_skill_bonuses FROM player_characters WHERE id=$1 AND account_id=$2',
      [req.params.id,session.user.id]
    );
    if(!ch.rowCount||ch.rows[0].origin!=='Millhand')return reply.code(404).send({error:'not_found'});
    if(ch.rows[0].tutorial_stage<3)return reply.code(409).send({error:'stage_three_not_ready'});
    // Stage 3 is unlocked only by the persisted completion of Stage 2.
    // Do not display the returned evidence for a corrupted/manual stage change.
    const preceding=await db.query<{state:{phase:string}}>(
      'SELECT state FROM player_character_platework WHERE character_id=$1',[req.params.id]
    );
    if(preceding.rows[0]?.state.phase!=='COMPLETE')
      return reply.code(409).send({error:'stage_two_not_complete'});
    const record=await db.query<{state:MissingStampState}>(
      'SELECT state FROM player_character_missing_stamp WHERE character_id=$1',[req.params.id]
    );
    if(!record.rowCount&&ch.rows[0].tutorial_stage!==3)return reply.code(409).send({error:'missing_stage_three_state'});
    return snapshot(ch.rows[0],record.rows[0]?.state??INITIAL_MISSING_STAMP);
  });

  app.post<{Params:Params}>('/api/characters/:id/millhand/missing-stamp',async(req,reply)=>{
    const session=await auth.api.getSession({headers:fromNodeHeaders(req.headers)});
    if(!session?.user.emailVerified)return reply.code(401).send({error:'unauthorized'});
    if(!UUID.test(req.params.id))return reply.code(404).send({error:'not_found'});
    const origin=req.headers.origin;
    if(origin&&origin!==(process.env.AUTH_BASE_URL??'http://127.0.0.1:5173'))
      return reply.code(403).send({error:'invalid_origin'});
    if(!req.headers['content-type']?.toLowerCase().startsWith('application/json'))
      return reply.code(415).send({error:'json_required'});
    let command:Command;
    try{command=parseCommand(req.body);}
    catch(e){return reply.code(400).send({error:e instanceof Error?e.message:'invalid_action'});}
    const hash=createHash('sha256').update(JSON.stringify({
      action:command.action,expectedRevision:command.expectedRevision
    })).digest('hex');

    const client=await db.connect();
    let inTransaction=false;
    try {
      await client.query('BEGIN');inTransaction=true;
      // Lock the owner-scoped parent before checking idempotency and revision.
      const ch=await client.query<CharacterRow>(
        'SELECT origin,tutorial_stage,tutorial_status,major_skill_bonuses FROM player_characters WHERE id=$1 AND account_id=$2 FOR UPDATE',
        [req.params.id,session.user.id]
      );
      if(!ch.rowCount||ch.rows[0].origin!=='Millhand'){
        await client.query('ROLLBACK');inTransaction=false;
        return reply.code(404).send({error:'not_found'});
      }
      const previous=await client.query<{request_hash:string;result:unknown}>(
        'SELECT request_hash,result FROM player_character_missing_stamp_receipts WHERE character_id=$1 AND request_id=$2',
        [req.params.id,command.requestId]
      );
      if(previous.rowCount) {
        await client.query('COMMIT');inTransaction=false;
        if(previous.rows[0].request_hash!==hash)return reply.code(409).send({error:'idempotency_key_reuse'});
        return previous.rows[0].result;
      }
      if(ch.rows[0].tutorial_stage!==3) {
        await client.query('ROLLBACK');inTransaction=false;
        return reply.code(409).send({error:'wrong_stage_three_phase'});
      }
      const platework=await client.query<{state:{phase:string}}>(
        'SELECT state FROM player_character_platework WHERE character_id=$1',[req.params.id]
      );
      if(platework.rows[0]?.state.phase!=='COMPLETE'){
        await client.query('ROLLBACK');inTransaction=false;
        return reply.code(409).send({error:'stage_two_not_complete'});
      }

      await client.query(
        'INSERT INTO player_character_missing_stamp(character_id,revision,state) VALUES ($1,0,$2::jsonb) ON CONFLICT DO NOTHING',
        [req.params.id,JSON.stringify(INITIAL_MISSING_STAMP)]
      );
      const row=await client.query<{state:MissingStampState}>(
        'SELECT state FROM player_character_missing_stamp WHERE character_id=$1 FOR UPDATE',[req.params.id]
      );
      const current=row.rows[0].state;
      if(current.revision!==command.expectedRevision){
        await client.query('ROLLBACK');inTransaction=false;
        return reply.code(409).send({error:'stale_revision',currentRevision:current.revision});
      }
      let next:MissingStampState;
      try{next=advanceMissingStamp(current,command.action,authoredEvidence());}
      catch(e){
        if(!(e instanceof MissingStampInvalidAction))throw e;
        await client.query('ROLLBACK');inTransaction=false;
        return reply.code(409).send({error:'wrong_stage_three_phase'});
      }
      const nextCharacter:CharacterRow={...ch.rows[0],major_skill_bonuses:{...ch.rows[0].major_skill_bonuses}};
      const branchChosen = !current.branch && next.branch !== null;
      if(branchChosen && next.branch){
        const skill=MISSING_STAMP_ROUTE_SKILL[next.branch];
        const oldValue=nextCharacter.major_skill_bonuses[skill]??0;
        if(!Number.isSafeInteger(oldValue)||oldValue<0||oldValue>=Number.MAX_SAFE_INTEGER)throw Error('invalid_skill_level');
        nextCharacter.major_skill_bonuses[skill]=oldValue+1;
      }
      if(next.phase==='SELECTED'){
        nextCharacter.tutorial_stage=4;
        nextCharacter.tutorial_status='NOT_STARTED';
      } else {
        nextCharacter.tutorial_stage=3;
        nextCharacter.tutorial_status='IN_PROGRESS';
      }
      await client.query(
        'UPDATE player_character_missing_stamp SET state=$2::jsonb,revision=$3,updated_at=NOW() WHERE character_id=$1',
        [req.params.id,JSON.stringify(next),next.revision]
      );
      if(branchChosen||next.phase==='SELECTED'){
        await client.query(
          'UPDATE player_characters SET major_skill_bonuses=$2::jsonb,tutorial_stage=$3,tutorial_status=$4 WHERE id=$1',
          [req.params.id,JSON.stringify(nextCharacter.major_skill_bonuses),nextCharacter.tutorial_stage,nextCharacter.tutorial_status]
        );
      } else if(ch.rows[0].tutorial_status!=='IN_PROGRESS') {
        await client.query(
          "UPDATE player_characters SET tutorial_status='IN_PROGRESS' WHERE id=$1",[req.params.id]
        );
      }
      const result=snapshot(nextCharacter,next);
      await client.query(
        'INSERT INTO player_character_missing_stamp_receipts(character_id,request_id,request_hash,result) VALUES ($1,$2,$3,$4::jsonb)',
        [req.params.id,command.requestId,hash,JSON.stringify(result)]
      );
      await client.query('COMMIT');inTransaction=false;
      return reply.code(200).send(result);
    } catch(e) {
      if(inTransaction){try{await client.query('ROLLBACK');}catch{/* preserve original failure */}}
      throw e;
    } finally {client.release();}
  });
}
