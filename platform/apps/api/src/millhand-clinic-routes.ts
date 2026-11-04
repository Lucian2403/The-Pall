/** Stage 7 — authenticated, once-paid examination after Flint combat.
 * A clinic state and the character's coins/Health advance atomically.
 * No modification of the immutable saved fight, history, skills or items.
 */
import type {FastifyInstance} from 'fastify';
import type {IncomingHttpHeaders} from 'node:http';
import {fromNodeHeaders} from 'better-auth/node';
import {createHash} from 'node:crypto';
import pg from 'pg';
import {auth} from './auth.js';
import type {CombatState} from '@the-pall/game-core/combat-v0.5.1';
import {
  CLINIC_FEE,ClinicInvalidAction,advanceClinic,clinicView,initialClinic
} from './millhand-clinic-state.js';
import type {ClinicAction,ClinicState} from './millhand-clinic-state.js';

type Session={user:{id:string;emailVerified:boolean}}|null;
type SessionResolver=(headers:IncomingHttpHeaders)=>Promise<Session>;
type Character={
  origin:string;tutorial_stage:number;tutorial_status:string;
  current_health:number;max_health:number;coins:string|number
};
type RecordRow={state:ClinicState};
type Command={kind:'start';requestId:string}|{
  kind:'action';requestId:string;expectedRevision:number;action:ClinicAction
};
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const actions=['examine','speak','review_price','pay','leave'];
function parseCommand(input:unknown):Command{
  if(!input||typeof input!=='object'||Array.isArray(input))
    throw Error('invalid_body');
  const v=input as Record<string,unknown>;
  if(typeof v.requestId!=='string'||!UUID.test(v.requestId))
    throw Error('invalid_request_id');
  const keys=Object.keys(v).sort().join(',');
  if(v.kind==='start'&&keys==='kind,requestId')
    return {kind:'start',requestId:v.requestId};
  if(v.kind!=='action'||keys!=='action,expectedRevision,kind,requestId')
    throw Error('invalid_fields');
  if(!Number.isSafeInteger(v.expectedRevision)||(v.expectedRevision as number)<0)
    throw Error('invalid_revision');
  if(typeof v.action!=='string'||!actions.includes(v.action))
    throw Error('invalid_action');
  return {
    kind:'action',requestId:v.requestId,
    expectedRevision:v.expectedRevision as number,action:v.action as ClinicAction
  };
}
function schemaMissing(e:unknown){return (e as {code?:string})?.code==='42P01';}
export function registerMillhandClinicRoutes(app:FastifyInstance,options:{
  pool?:pg.Pool;resolveSession?:SessionResolver
}={}){
  const pool=options.pool??new pg.Pool({connectionString:process.env.DATABASE_URL});
  const resolveSession=options.resolveSession??(async(headers:IncomingHttpHeaders)=>
    auth.api.getSession({headers:fromNodeHeaders(headers)}));
  app.addHook('onClose',async()=>{if(!options.pool)await pool.end();});

  app.get<{Params:{id:string}}>('/api/characters/:id/millhand/clinic',
    async(req,reply)=>{
      reply.header('Cache-Control','no-store');
      const session=await resolveSession(req.headers);
      if(!session?.user.emailVerified)return reply.code(401).send({error:'unauthorized'});
      if(!UUID.test(req.params.id))return reply.code(404).send({error:'not_found'});
      try{
        const char=await pool.query<Character>(
          'SELECT origin,tutorial_stage,tutorial_status,current_health,max_health,coins FROM player_characters WHERE id=$1 AND account_id=$2',
          [req.params.id,session.user.id]
        );
        if(!char.rowCount||char.rows[0].origin!=='Millhand')
          return reply.code(404).send({error:'not_found'});
        const c=char.rows[0];
        if(c.tutorial_stage<6)return reply.code(409).send({error:'clinic_not_ready'});
        const saved=await pool.query<RecordRow>(
          'SELECT state FROM player_character_clinic WHERE character_id=$1',[req.params.id]
        );
        if(saved.rowCount)return clinicView(saved.rows[0].state,Number(c.coins));
        if(c.tutorial_stage!==6||c.tutorial_status!=='COMPLETED')
          return reply.code(409).send({error:'clinic_not_ready'});
        const fight=await pool.query<{state:CombatState}>(
          'SELECT state FROM player_character_flint_combat WHERE character_id=$1',
          [req.params.id]
        );
        if(!fight.rowCount||fight.rows[0].state.status!=='finished')
          return reply.code(409).send({error:'combat_not_finished'});
        return {needsStart:true,stage:7};
      }catch(error){
        if(schemaMissing(error))
          return reply.code(503).send({error:'clinic_schema_missing',setup:'npm run clinic:migrate'});
        throw error;
      }
    });

  app.post<{Params:{id:string}}>('/api/characters/:id/millhand/clinic',
    async(req,reply)=>{
      reply.header('Cache-Control','no-store');
      const session=await resolveSession(req.headers);
      if(!session?.user.emailVerified)return reply.code(401).send({error:'unauthorized'});
      if(!UUID.test(req.params.id))return reply.code(404).send({error:'not_found'});
      if(req.headers.origin&&req.headers.origin!==(process.env.AUTH_BASE_URL??'http://127.0.0.1:5173'))
        return reply.code(403).send({error:'invalid_origin'});
      if(!req.headers['content-type']?.toLowerCase().startsWith('application/json'))
        return reply.code(415).send({error:'json_required'});
      let command:Command;
      try{command=parseCommand(req.body);}catch(e){
        return reply.code(400).send({error:e instanceof Error?e.message:'invalid_body'});
      }
      const hash=createHash('sha256').update(JSON.stringify(command)).digest('hex');
      const db=await pool.connect();let open=false;
      try{
        await db.query('BEGIN');open=true;
        // Same lock ordering as the combat and wage-claim adapters.
        const char=await db.query<Character>(
          'SELECT origin,tutorial_stage,tutorial_status,current_health,max_health,coins FROM player_characters WHERE id=$1 AND account_id=$2 FOR UPDATE',
          [req.params.id,session.user.id]
        );
        if(!char.rowCount||char.rows[0].origin!=='Millhand'){
          await db.query('ROLLBACK');open=false;
          return reply.code(404).send({error:'not_found'});
        }
        const receipt=await db.query<{request_hash:string;response:unknown}>(
          'SELECT request_hash,response FROM player_character_clinic_receipts WHERE character_id=$1 AND request_id=$2',
          [req.params.id,command.requestId]
        );
        if(receipt.rowCount){
          await db.query('COMMIT');open=false;
          return receipt.rows[0].request_hash===hash?receipt.rows[0].response
            :reply.code(409).send({error:'idempotency_key_reuse'});
        }
        const c=char.rows[0];
        if(c.tutorial_stage!==6&&c.tutorial_stage!==7){
          await db.query('ROLLBACK');open=false;
          return reply.code(409).send({error:'clinic_not_ready'});
        }
        const combat=await db.query<{state:CombatState}>(
          'SELECT state FROM player_character_flint_combat WHERE character_id=$1',
          [req.params.id]
        );
        if(!combat.rowCount||combat.rows[0].state.status!=='finished'){
          await db.query('ROLLBACK');open=false;
          return reply.code(409).send({error:'combat_not_finished'});
        }
        const saved=await db.query<RecordRow>(
          'SELECT state FROM player_character_clinic WHERE character_id=$1 FOR UPDATE',
          [req.params.id]
        );
        let state:ClinicState;
        let coins=Number(c.coins);
        if(command.kind==='start'){
          if(saved.rowCount)state=saved.rows[0].state;
          else{
            if(c.tutorial_stage!==6||c.tutorial_status!=='COMPLETED'){
              await db.query('ROLLBACK');open=false;
              return reply.code(409).send({error:'clinic_not_ready'});
            }
            state=initialClinic(combat.rows[0].state);
            if(state.before.hp!==c.current_health||state.before.hpMax!==c.max_health)
              throw Error('combat_character_health_mismatch');
            await db.query(
              'INSERT INTO player_character_clinic(character_id,revision,state) VALUES($1,0,$2::jsonb)',
              [req.params.id,JSON.stringify(state)]
            );
            await db.query(
              "UPDATE player_characters SET tutorial_stage=7,tutorial_status='IN_PROGRESS' WHERE id=$1",
              [req.params.id]
            );
          }
        }else{
          if(c.tutorial_stage!==7||!saved.rowCount){
            await db.query('ROLLBACK');open=false;
            return reply.code(409).send({error:'clinic_not_started'});
          }
          const prior=saved.rows[0].state;
          if(prior.revision!==command.expectedRevision){
            await db.query('ROLLBACK');open=false;
            return reply.code(409).send({error:'stale_revision',currentRevision:prior.revision});
          }
          if(command.action==='pay'&&coins<CLINIC_FEE){
            await db.query('ROLLBACK');open=false;
            return reply.code(409).send({error:'insufficient_coins'});
          }
          try{state=advanceClinic(prior,command.action);}catch(error){
            if(!(error instanceof ClinicInvalidAction))throw error;
            await db.query('ROLLBACK');open=false;
            return reply.code(409).send({error:error.message});
          }
          if(command.action==='pay'){
            // Atomic fee and onboarding discharge; the saved fight remains
            // the permanent original record of all actual wounds and Health.
            const updated=await db.query<{coins:string|number;current_health:number}>(
              'UPDATE player_characters SET coins=coins-$2,current_health=max_health WHERE id=$1 AND coins>=$2 RETURNING coins,current_health',
              [req.params.id,CLINIC_FEE]
            );
            if(!updated.rowCount)throw Error('clinic_fee_update_failed');
            coins=Number(updated.rows[0].coins);
          }
          if(command.action==='leave'){
            await db.query(
              "UPDATE player_characters SET tutorial_stage=8,tutorial_status='NOT_STARTED' WHERE id=$1",
              [req.params.id]
            );
          }
          await db.query(
            'UPDATE player_character_clinic SET revision=$2,state=$3::jsonb,updated_at=NOW() WHERE character_id=$1',
            [req.params.id,state.revision,JSON.stringify(state)]
          );
        }
        const result=clinicView(state,coins);
        await db.query(
          'INSERT INTO player_character_clinic_receipts(character_id,request_id,request_hash,response) VALUES($1,$2,$3,$4::jsonb)',
          [req.params.id,command.requestId,hash,JSON.stringify(result)]
        );
        await db.query('COMMIT');open=false;
        return result;
      }catch(error){
        if(open){try{await db.query('ROLLBACK');}catch{/* preserve original */}}
        if(schemaMissing(error))
          return reply.code(503).send({error:'clinic_schema_missing',setup:'npm run clinic:migrate'});
        throw error;
      }finally{db.release();}
    });
}
