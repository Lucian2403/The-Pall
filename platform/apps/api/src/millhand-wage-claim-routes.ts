/**
 * Authenticated Stage 5. A physical Stage 4 exit (or a pre-upgrade Stage 5
 * save) is required. Each dialogue step and stance is idempotently persisted.
 * The unintegrated combat engine is never impersonated by this endpoint.
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
import type {WageClaimAction,WageClaimState,SecondJobState} from '@the-pall/game-core';

const db=new pg.Pool({connectionString:process.env.DATABASE_URL});
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
type Params={id:string};
type CharacterRow={origin:string;tutorial_stage:number;tutorial_status:string};
type Command={action:WageClaimAction;expectedRevision:number;requestId:string};
function parseCommand(value:unknown):Command{
  if(!value||typeof value!=='object'||Array.isArray(value))throw Error('invalid_body');
  const v=value as Record<string,unknown>;
  if(Object.keys(v).sort().join(',')!=='action,expectedRevision,requestId')throw Error('invalid_fields');
  if(typeof v.requestId!=='string'||!UUID.test(v.requestId))throw Error('invalid_request_id');
  if(!Number.isSafeInteger(v.expectedRevision)||(v.expectedRevision as number)<0)throw Error('invalid_revision');
  if(typeof v.action!=='string'||!WAGE_CLAIM_ACTIONS.includes(v.action as WageClaimAction))throw Error('invalid_action');
  return {action:v.action as WageClaimAction,expectedRevision:v.expectedRevision as number,requestId:v.requestId};
}
function snapshot(ch:CharacterRow,state:WageClaimState){
  return {stage:ch.tutorial_stage,tutorialStatus:ch.tutorial_status,
    state,availableActions:availableWageClaimActions(state),
    tutorialPayout:{coins:0,ordinaryXp:0,items:0}};
}
function validStageFour(s:SecondJobState|undefined,stage:number){
  return !!s && ['restamp','contracts','records'].includes(s.branch)
    && (s.phase==='EXITED'||(stage>=5&&s.phase==='DONE'));
}
export function registerMillhandWageClaimRoutes(app:FastifyInstance){
  app.addHook('onClose',async()=>{await db.end();});
  app.get<{Params:Params}>('/api/characters/:id/millhand/wage-claim',async(req,reply)=>{
    const session=await auth.api.getSession({headers:fromNodeHeaders(req.headers)});
    if(!session?.user.emailVerified)return reply.code(401).send({error:'unauthorized'});
    if(!UUID.test(req.params.id))return reply.code(404).send({error:'not_found'});
    const c=await db.query<CharacterRow>(
      'SELECT origin,tutorial_stage,tutorial_status FROM player_characters WHERE id=$1 AND account_id=$2',
      [req.params.id,session.user.id]);
    if(!c.rowCount||c.rows[0].origin!=='Millhand')return reply.code(404).send({error:'not_found'});
    if(c.rows[0].tutorial_stage!==5)return reply.code(409).send({error:'stage_five_not_ready'});
    try{
      const p=await db.query<{state:SecondJobState}>(
        'SELECT state FROM player_character_second_job WHERE character_id=$1',[req.params.id]);
      if(!validStageFour(p.rows[0]?.state,c.rows[0].tutorial_stage))
        return reply.code(409).send({error:'stage_four_exit_required'});
      const saved=await db.query<{state:WageClaimState}>(
        'SELECT state FROM player_character_wage_claim WHERE character_id=$1',[req.params.id]);
      const state=saved.rows[0]?.state??initialWageClaim(p.rows[0].state.branch);
      if(state.branch!==p.rows[0].state.branch)return reply.code(409).send({error:'branch_mismatch'});
      return snapshot(c.rows[0],state);
    }catch(e){
      if((e as {code?:string})?.code==='42P01')return reply.code(503).send({error:'wage_claim_schema_missing'});
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
      const prevReceipt=await client.query<{request_hash:string;result:unknown}>(
        'SELECT request_hash,result FROM player_character_wage_claim_receipts WHERE character_id=$1 AND request_id=$2',
        [req.params.id,cmd.requestId]);
      if(prevReceipt.rowCount){
        await client.query('COMMIT');transaction=false;
        if(prevReceipt.rows[0].request_hash!==hash)return reply.code(409).send({error:'idempotency_key_reuse'});
        return prevReceipt.rows[0].result;
      }
      if(c.rows[0].tutorial_stage!==5){
        await client.query('ROLLBACK');transaction=false;
        return reply.code(409).send({error:'stage_five_not_ready'});
      }
      const p=await client.query<{state:SecondJobState}>(
        'SELECT state FROM player_character_second_job WHERE character_id=$1',[req.params.id]);
      if(!validStageFour(p.rows[0]?.state,c.rows[0].tutorial_stage)){
        await client.query('ROLLBACK');transaction=false;
        return reply.code(409).send({error:'stage_four_exit_required'});
      }
      const branch=p.rows[0].state.branch;
      await client.query(
        'INSERT INTO player_character_wage_claim(character_id,revision,state) VALUES($1,0,$2::jsonb) ON CONFLICT DO NOTHING',
        [req.params.id,JSON.stringify(initialWageClaim(branch))]);
      const stored=await client.query<{state:WageClaimState}>(
        'SELECT state FROM player_character_wage_claim WHERE character_id=$1 FOR UPDATE',[req.params.id]);
      const current=stored.rows[0].state;
      if(current.branch!==branch){
        await client.query('ROLLBACK');transaction=false;
        return reply.code(409).send({error:'branch_mismatch'});
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
      await client.query(
        'UPDATE player_character_wage_claim SET state=$2::jsonb,revision=$3,updated_at=NOW() WHERE character_id=$1',
        [req.params.id,JSON.stringify(next),next.revision]);
      await client.query(
        "UPDATE player_characters SET tutorial_status='IN_PROGRESS' WHERE id=$1",
        [req.params.id]);
      const result=snapshot({...c.rows[0],tutorial_status:'IN_PROGRESS'},next);
      await client.query(
        'INSERT INTO player_character_wage_claim_receipts(character_id,request_id,request_hash,result) VALUES($1,$2,$3,$4::jsonb)',
        [req.params.id,cmd.requestId,hash,JSON.stringify(result)]);
      await client.query('COMMIT');transaction=false;
      return reply.code(200).send(result);
    }catch(e){
      if(transaction){try{await client.query('ROLLBACK');}catch{/* retain original */}}
      if((e as {code?:string})?.code==='42P01')return reply.code(503).send({error:'wage_claim_schema_missing'});
      throw e;
    }finally{client.release();}
  });
}
