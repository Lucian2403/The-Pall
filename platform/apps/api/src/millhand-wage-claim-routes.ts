/**
 * Millhand Stage 5: authenticated, revision-checked Wage Claim / Cornered.
 * Valid predecessor: one completed server-owned Stage 4 branch.
 * Zero coins, XP, inventory, Health or combat changes. A saved stance at
 * completion advances to Stage 6; the real fight is a separate integration.
 */
import type {FastifyInstance} from 'fastify';
import {fromNodeHeaders} from 'better-auth/node';
import {createHash} from 'node:crypto';
import pg from 'pg';
import {auth} from './auth.js';
import {
  WAGE_CLAIM_ACTIONS,initialWageClaim,availableWageClaimActions,
  advanceWageClaim,WageClaimInvalidAction
} from '@the-pall/game-core';
import type {WageClaimAction,WageClaimState,MissingStampBranch} from '@the-pall/game-core';

const db=new pg.Pool({connectionString:process.env.DATABASE_URL});
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
type Params={id:string};
type CharacterRow={origin:string;tutorial_stage:number;tutorial_status:string};
type PriorJob={state:{phase:string;branch:MissingStampBranch}};
type Command={action:WageClaimAction;expectedRevision:number;requestId:string};

function parseCommand(value:unknown):Command {
  if(!value||typeof value!=='object'||Array.isArray(value))throw Error('invalid_body');
  const v=value as Record<string,unknown>;
  if(Object.keys(v).sort().join(',')!=='action,expectedRevision,requestId')throw Error('invalid_fields');
  if(typeof v.requestId!=='string'||!UUID.test(v.requestId))throw Error('invalid_request_id');
  if(!Number.isSafeInteger(v.expectedRevision)||(v.expectedRevision as number)<0)throw Error('invalid_revision');
  if(typeof v.action!=='string'||!WAGE_CLAIM_ACTIONS.includes(v.action as WageClaimAction))
    throw Error('invalid_action');
  return {action:v.action as WageClaimAction,expectedRevision:v.expectedRevision as number,requestId:v.requestId};
}
function snapshot(ch:CharacterRow,state:WageClaimState){
  return {stage:ch.tutorial_stage,tutorialStatus:ch.tutorial_status,
    state,availableActions:availableWageClaimActions(state),
    tutorialPayout:{coins:0,ordinaryXp:0,items:0}};
}
function finishedBranch(job:PriorJob|undefined,stage:number):MissingStampBranch|null{
  // Older saved characters reached Stage 5 or 6 when the job became DONE.
  // New characters must explicitly leave their workplace (EXITED).
  if(!job||!(job.state.phase==='EXITED'||(stage>=5&&job.state.phase==='DONE')))return null;
  const b=job.state.branch;
  return b==='restamp'||b==='contracts'||b==='records'?b:null;
}
export function registerMillhandWageClaimRoutes(app:FastifyInstance){
  app.addHook('onClose',async()=>{await db.end();});

  app.get<{Params:Params}>('/api/characters/:id/millhand/wage-claim',async(req,reply)=>{
    const session=await auth.api.getSession({headers:fromNodeHeaders(req.headers)});
    if(!session?.user.emailVerified)return reply.code(401).send({error:'unauthorized'});
    if(!UUID.test(req.params.id))return reply.code(404).send({error:'not_found'});
    const c=await db.query<CharacterRow>(
      'SELECT origin,tutorial_stage,tutorial_status FROM player_characters WHERE id=$1 AND account_id=$2',
      [req.params.id,session.user.id]
    );
    if(!c.rowCount||c.rows[0].origin!=='Millhand')return reply.code(404).send({error:'not_found'});
    if(c.rows[0].tutorial_stage<5)return reply.code(409).send({error:'stage_five_not_ready'});
    if(c.rows[0].tutorial_stage>6)return reply.code(409).send({error:'stage_five_closed'});
    try{
      const previous=await db.query<PriorJob>(
        'SELECT state FROM player_character_second_job WHERE character_id=$1',[req.params.id]);
      const branch=finishedBranch(previous.rows[0],c.rows[0].tutorial_stage);
      if(!branch)return reply.code(409).send({error:'second_job_not_complete'});
      const saved=await db.query<{state:WageClaimState}>(
        'SELECT state FROM player_character_wage_claim WHERE character_id=$1',[req.params.id]);
      if(!saved.rowCount&&c.rows[0].tutorial_stage!==5)
        return reply.code(409).send({error:'missing_wage_claim_state'});
      const state=saved.rows[0]?.state??initialWageClaim(branch);
      if(state.branch!==branch||
        (c.rows[0].tutorial_stage===6&&state.phase!=='DONE')||
        (c.rows[0].tutorial_stage===5&&state.phase==='DONE'))
        return reply.code(409).send({error:'invalid_wage_claim_state'});
      return snapshot(c.rows[0],state);
    }catch(e){
      if((e as {code?:string})?.code==='42P01')
        return reply.code(503).send({error:'wage_claim_schema_missing',setup:'npm run wage-claim:migrate'});
      throw e;
    }
  });

  app.post<{Params:Params}>('/api/characters/:id/millhand/wage-claim',async(req,reply)=>{
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
      const c=await client.query<CharacterRow>(
        'SELECT origin,tutorial_stage,tutorial_status FROM player_characters WHERE id=$1 AND account_id=$2 FOR UPDATE',
        [req.params.id,session.user.id]);
      if(!c.rowCount||c.rows[0].origin!=='Millhand'){
        await client.query('ROLLBACK');transaction=false;
        return reply.code(404).send({error:'not_found'});
      }
      const receipt=await client.query<{request_hash:string;result:unknown}>(
        'SELECT request_hash,result FROM player_character_wage_claim_receipts WHERE character_id=$1 AND request_id=$2',
        [req.params.id,cmd.requestId]);
      if(receipt.rowCount){
        await client.query('COMMIT');transaction=false;
        if(receipt.rows[0].request_hash!==hash)
          return reply.code(409).send({error:'idempotency_key_reuse'});
        return receipt.rows[0].result;
      }
      // Completed Stage 5 may return to the stance selection before Stage 6
      // combat begins. Normal progression cannot be edited from Stage 6.
      const returningFromBoundary=c.rows[0].tutorial_stage===6&&cmd.action==='previous_dialogue';
      if(c.rows[0].tutorial_stage!==5&&!returningFromBoundary){
        await client.query('ROLLBACK');transaction=false;
        return reply.code(409).send({error:'wrong_wage_claim_phase'});
      }
      const previous=await client.query<PriorJob>(
        'SELECT state FROM player_character_second_job WHERE character_id=$1',[req.params.id]);
      const branch=finishedBranch(previous.rows[0],c.rows[0].tutorial_stage);
      if(!branch){
        await client.query('ROLLBACK');transaction=false;
        return reply.code(409).send({error:'second_job_not_complete'});
      }
      await client.query(
        'INSERT INTO player_character_wage_claim(character_id,revision,state) VALUES($1,0,$2::jsonb) ON CONFLICT DO NOTHING',
        [req.params.id,JSON.stringify(initialWageClaim(branch))]);
      const saved=await client.query<{state:WageClaimState}>(
        'SELECT state FROM player_character_wage_claim WHERE character_id=$1 FOR UPDATE',[req.params.id]);
      const current=saved.rows[0].state;
      if(current.branch!==branch){
        await client.query('ROLLBACK');transaction=false;
        return reply.code(409).send({error:'branch_mismatch'});
      }
      if(returningFromBoundary){
        // An encounter freezes the saved stance. Both APIs lock the character
        // row first; no concurrent start can race this check.
        const combat=await client.query(
          'SELECT character_id FROM player_character_flint_combat WHERE character_id=$1',
          [req.params.id]);
        if(combat.rowCount){
          await client.query('ROLLBACK');transaction=false;
          return reply.code(409).send({error:'combat_already_started'});
        }
      }
      if(returningFromBoundary&&current.phase!=='DONE'){
        await client.query('ROLLBACK');transaction=false;
        return reply.code(409).send({error:'stage_six_not_reversible'});
      }
      if(current.revision!==cmd.expectedRevision){
        await client.query('ROLLBACK');transaction=false;
        return reply.code(409).send({error:'stale_revision',currentRevision:current.revision});
      }
      let next:WageClaimState;
      try{next=advanceWageClaim(current,cmd.action);}
      catch(e){
        if(!(e instanceof WageClaimInvalidAction))throw e;
        await client.query('ROLLBACK');transaction=false;
        return reply.code(409).send({error:'wrong_wage_claim_phase'});
      }
      const nextCharacter:CharacterRow={...c.rows[0],
        tutorial_stage:next.phase==='DONE'?6:5,
        tutorial_status:next.phase==='DONE'?'NOT_STARTED':'IN_PROGRESS'};
      await client.query(
        'UPDATE player_character_wage_claim SET state=$2::jsonb,revision=$3,updated_at=NOW() WHERE character_id=$1',
        [req.params.id,JSON.stringify(next),next.revision]);
      await client.query(
        'UPDATE player_characters SET tutorial_stage=$2,tutorial_status=$3 WHERE id=$1',
        [req.params.id,nextCharacter.tutorial_stage,nextCharacter.tutorial_status]);
      const result=snapshot(nextCharacter,next);
      await client.query(
        'INSERT INTO player_character_wage_claim_receipts(character_id,request_id,request_hash,result) VALUES($1,$2,$3,$4::jsonb)',
        [req.params.id,cmd.requestId,hash,JSON.stringify(result)]);
      await client.query('COMMIT');transaction=false;
      return reply.code(200).send(result);
    }catch(e){
      if(transaction){try{await client.query('ROLLBACK');}catch{/* preserve error */}}
      if((e as {code?:string})?.code==='42P01')
        return reply.code(503).send({error:'wage_claim_schema_missing',setup:'npm run wage-claim:migrate'});
      throw e;
    }finally{client.release();}
  });
}
