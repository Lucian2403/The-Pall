/** Authenticated, idempotent Stage 8 home, shared by later origins.
 * Only Millhand currently has a playable preceding clinic. */
import type {FastifyInstance} from 'fastify';
import type {IncomingHttpHeaders} from 'node:http';
import {fromNodeHeaders} from 'better-auth/node';
import {createHash} from 'node:crypto';
import pg from 'pg';
import {auth} from './auth.js';
import {advance,HomeInvalidAction,initial,view} from './shared-home-state.js';
import type {Action,State,Branch,Outcome} from './shared-home-state.js';
import type {ClinicState} from './millhand-clinic-state.js';

type Session={user:{id:string;emailVerified:boolean}}|null;
type Resolver=(headers:IncomingHttpHeaders)=>Promise<Session>;
type Character={id:string;name:string;origin:string;tutorial_stage:number;tutorial_status:string;coins:string|number};
type Command={kind:'start';requestId:string}|{kind:'action';requestId:string;expectedRevision:number;action:Action};
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function parse(input:unknown):Command{
 if(!input||typeof input!=='object'||Array.isArray(input))throw Error('invalid_body');
 const v=input as Record<string,unknown>;
 if(typeof v.requestId!=='string'||!UUID.test(v.requestId))throw Error('invalid_request_id');
 const keys=Object.keys(v).sort().join(',');
 if(v.kind==='start'&&keys==='kind,requestId')return {kind:'start',requestId:v.requestId};
 if(v.kind!=='action'||keys!=='action,expectedRevision,kind,requestId')throw Error('invalid_fields');
 if(!Number.isSafeInteger(v.expectedRevision)||(v.expectedRevision as number)<0)throw Error('invalid_revision');
 if(!['read_notice','put_down','finish','rest'].includes(String(v.action)))throw Error('invalid_action');
 return {kind:'action',requestId:v.requestId,expectedRevision:v.expectedRevision as number,action:v.action as Action};
}
const missing=(e:unknown)=>(e as {code?:string})?.code==='42P01';
const ready=(s:ClinicState|undefined)=>!!s&&s.phase==='LEFT'&&s.paid&&
 (s.outcome==='player_victory'||s.outcome==='player_defeat');
const base='/api/characters/:id/tutorial/home';
const characterSQL='SELECT id,name,origin,tutorial_stage,tutorial_status,coins FROM player_characters WHERE id=$1 AND account_id=$2';
export function registerTutorialHomeRoutes(app:FastifyInstance,options:{pool?:pg.Pool;resolveSession?:Resolver}={}){
 const pool=options.pool??new pg.Pool({connectionString:process.env.DATABASE_URL});
 const resolveSession=options.resolveSession??(async(headers:IncomingHttpHeaders)=>
  auth.api.getSession({headers:fromNodeHeaders(headers)}));
 app.addHook('onClose',async()=>{if(!options.pool)await pool.end();});
 app.get<{Params:{id:string}}>(base,async(req,reply)=>{
  reply.header('Cache-Control','no-store');
  const session=await resolveSession(req.headers);
  if(!session?.user.emailVerified)return reply.code(401).send({error:'unauthorized'});
  if(!UUID.test(req.params.id))return reply.code(404).send({error:'not_found'});
  try{
   const rows=await pool.query<Character>(characterSQL,[req.params.id,session.user.id]);
   const c=rows.rows[0];
   if(!c||c.origin!=='Millhand')return reply.code(404).send({error:'not_found'});
   if(c.tutorial_stage!==8)return reply.code(409).send({error:'home_not_ready'});
   const saved=await pool.query<{state:State}>('SELECT state FROM player_character_tutorial_home WHERE character_id=$1',[c.id]);
   if(saved.rowCount){
    const state=saved.rows[0].state;
    if((state.phase==='COMPLETE')!==(c.tutorial_status==='COMPLETED'))
     return reply.code(409).send({error:'home_completion_mismatch'});
    return view(state,c.name,Number(c.coins));
   }
   if(c.tutorial_status!=='NOT_STARTED')return reply.code(409).send({error:'home_not_started'});
   const clinic=await pool.query<{state:ClinicState}>('SELECT state FROM player_character_clinic WHERE character_id=$1',[c.id]);
   if(!ready(clinic.rows[0]?.state))return reply.code(409).send({error:'clinic_not_left'});
   return {needsStart:true,stage:8};
  }catch(error){
   if(missing(error))return reply.code(503).send({error:'home_schema_missing',setup:'npm run home:migrate'});
   throw error;
  }
 });
 app.post<{Params:{id:string}}>(base,async(req,reply)=>{
  reply.header('Cache-Control','no-store');
  const session=await resolveSession(req.headers);
  if(!session?.user.emailVerified)return reply.code(401).send({error:'unauthorized'});
  if(!UUID.test(req.params.id))return reply.code(404).send({error:'not_found'});
  if(req.headers.origin&&req.headers.origin!==(process.env.AUTH_BASE_URL??'http://127.0.0.1:5173'))
   return reply.code(403).send({error:'invalid_origin'});
  if(!req.headers['content-type']?.toLowerCase().startsWith('application/json'))
   return reply.code(415).send({error:'json_required'});
  let cmd:Command;
  try{cmd=parse(req.body);}catch(e){return reply.code(400).send({error:e instanceof Error?e.message:'invalid_body'});}
  const hash=createHash('sha256').update(JSON.stringify(cmd)).digest('hex');
  const db=await pool.connect();let open=false;
  try{
   await db.query('BEGIN');open=true;
   const characters=await db.query<Character>(characterSQL+' FOR UPDATE',[req.params.id,session.user.id]);
   const c=characters.rows[0];
   if(!c||c.origin!=='Millhand'){
    await db.query('ROLLBACK');open=false;return reply.code(404).send({error:'not_found'});
   }
   const receipt=await db.query<{request_hash:string;response:unknown}>(
    'SELECT request_hash,response FROM player_character_tutorial_home_receipts WHERE character_id=$1 AND request_id=$2',
    [c.id,cmd.requestId]);
   if(receipt.rowCount){
    await db.query('COMMIT');open=false;
    return receipt.rows[0].request_hash===hash?receipt.rows[0].response:
     reply.code(409).send({error:'idempotency_key_reuse'});
   }
   if(c.tutorial_stage!==8){
    await db.query('ROLLBACK');open=false;return reply.code(409).send({error:'home_not_ready'});
   }
   const saved=await db.query<{state:State}>(
    'SELECT state FROM player_character_tutorial_home WHERE character_id=$1 FOR UPDATE',[c.id]);
   let state:State;
   if(cmd.kind==='start'){
    if(saved.rowCount)state=saved.rows[0].state;
    else{
     if(c.tutorial_status!=='NOT_STARTED'){
      await db.query('ROLLBACK');open=false;return reply.code(409).send({error:'home_not_ready'});
     }
     const clinic=await db.query<{state:ClinicState}>(
      'SELECT state FROM player_character_clinic WHERE character_id=$1',[c.id]);
     if(!ready(clinic.rows[0]?.state)){
      await db.query('ROLLBACK');open=false;return reply.code(409).send({error:'clinic_not_left'});
     }
     const branchRows=await db.query<{state:{branch:string;phase:string}}>(
      'SELECT state FROM player_character_missing_stamp WHERE character_id=$1',[c.id]);
     const branch=branchRows.rows[0]?.state.branch;
     if(branchRows.rows[0]?.state.phase!=='SELECTED'||!['restamp','contracts','records'].includes(String(branch))){
      await db.query('ROLLBACK');open=false;return reply.code(409).send({error:'route_not_saved'});
     }
     state=initial(c.origin,branch as Branch,clinic.rows[0].state.outcome as Outcome,
       clinic.rows[0].state.after);
     await db.query('INSERT INTO player_character_tutorial_home(character_id,revision,state) VALUES($1,0,$2::jsonb)',
      [c.id,JSON.stringify(state)]);
     await db.query("UPDATE player_characters SET tutorial_status='IN_PROGRESS' WHERE id=$1",[c.id]);
    }
   }else{
    if(!saved.rowCount||
       !(c.tutorial_status==='IN_PROGRESS'||
         (cmd.action==='rest'&&c.tutorial_status==='COMPLETED'&&
          saved.rows[0].state.phase==='COMPLETE'))){
     await db.query('ROLLBACK');open=false;return reply.code(409).send({error:'home_not_started'});
    }
    const old=saved.rows[0].state;
    if(old.revision!==cmd.expectedRevision){
     await db.query('ROLLBACK');open=false;return reply.code(409).send({error:'stale_revision',currentRevision:old.revision});
    }
    try{state=advance(old,cmd.action);}catch(error){
     if(!(error instanceof HomeInvalidAction))throw error;
     await db.query('ROLLBACK');open=false;return reply.code(409).send({error:error.message});
    }
    if(state.phase==='COMPLETE')
     await db.query("UPDATE player_characters SET tutorial_status='COMPLETED' WHERE id=$1",[c.id]);
    await db.query('UPDATE player_character_tutorial_home SET revision=$2,state=$3::jsonb,updated_at=NOW() WHERE character_id=$1',
     [c.id,state.revision,JSON.stringify(state)]);
   }
   const result=view(state,c.name,Number(c.coins));
   await db.query('INSERT INTO player_character_tutorial_home_receipts(character_id,request_id,request_hash,response) VALUES($1,$2,$3,$4::jsonb)',
    [c.id,cmd.requestId,hash,JSON.stringify(result)]);
   await db.query('COMMIT');open=false;
   return result;
  }catch(error){
   if(open){try{await db.query('ROLLBACK');}catch{/* preserve original */}}
   if(missing(error))return reply.code(503).send({error:'home_schema_missing',setup:'npm run home:migrate'});
   throw error;
  }finally{db.release();}
 });
}
