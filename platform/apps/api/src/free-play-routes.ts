/** Server-owned boundary between the eight-stage introduction and ordinary
 * gameplay. No rewards, locations, timers or jobs are created here. */
import type {FastifyInstance} from 'fastify';
import type {IncomingHttpHeaders} from 'node:http';
import {fromNodeHeaders} from 'better-auth/node';
import {isPlayableCharacterOrigin} from '@the-pall/contracts';
import pg from 'pg';
import {auth} from './auth.js';
import {getGameplayPool} from './database-pool.js';
import {HOME_ID} from './shared-home-state.js';

const UUID=/^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
const base='/api/characters/:id/free-play';
type Session={user:{id:string;emailVerified:boolean}}|null;
type Resolver=(headers:IncomingHttpHeaders)=>Promise<Session>;
type GateRow={
 origin:string;tutorial_stage:number;tutorial_status:string;
 home_phase:string|null;home_id:string|null;home_origin:string|null;
 free_play_intro_seen_at:Date|null;
};
const characterState=`SELECT c.origin,c.tutorial_stage,c.tutorial_status,
  h.state->>'phase' AS home_phase,h.state->>'homeId' AS home_id,
  h.state->>'origin' AS home_origin,c.free_play_intro_seen_at
  FROM player_characters c
  LEFT JOIN player_character_tutorial_home h ON h.character_id=c.id
  WHERE c.id=$1 AND c.account_id=$2`;
const unlocked=(row:GateRow)=>
 isPlayableCharacterOrigin(row.origin)&&row.tutorial_stage===8&&
 row.tutorial_status==='COMPLETED'&&row.home_phase==='COMPLETE'&&
 row.home_id===HOME_ID&&row.home_origin===row.origin;
const schemaMissing=(error:unknown)=>['42P01','42703'].includes(
 (error as {code?:string})?.code??'');

export function registerFreePlayRoutes(app:FastifyInstance,options:{
 pool?:pg.Pool;resolveSession?:Resolver
}={}){
 const pool=getGameplayPool(app,options.pool);
 const resolveSession=options.resolveSession??(async (headers:IncomingHttpHeaders)=>
  auth.api.getSession({headers:fromNodeHeaders(headers)}));
 async function identity(headers:IncomingHttpHeaders){
  const session=await resolveSession(headers);
  return session?.user.emailVerified?session.user.id:null;
 }
 app.get<{Params:{id:string}}>(base,async(req,reply)=>{
  reply.header('Cache-Control','no-store');
  const owner=await identity(req.headers);
  if(!owner)return reply.code(401).send({error:'unauthorized'});
  if(!UUID.test(req.params.id))return reply.code(404).send({error:'not_found'});
  try{
   const found=await pool.query<GateRow>(characterState,[req.params.id,owner]);
   if(!found.rowCount||!isPlayableCharacterOrigin(found.rows[0].origin))
    return reply.code(404).send({error:'not_found'});
   if(!unlocked(found.rows[0]))
    return reply.code(409).send({error:'free_play_not_unlocked'});
   return {unlocked:true,announcementSeen:found.rows[0].free_play_intro_seen_at!==null};
  }catch(error){
   if(schemaMissing(error))return reply.code(503).send({
    error:'free_play_schema_missing',setup:'npm run free-play:migrate'});
   throw error;
  }
 });
 // Step 2 will call this endpoint when the one-time announcement is dismissed.
 // Safe to retry across multiple tabs, refreshes and reconnects.
 app.post<{Params:{id:string}}>(base+'/announcement',async(req,reply)=>{
  reply.header('Cache-Control','no-store');
  const owner=await identity(req.headers);
  if(!owner)return reply.code(401).send({error:'unauthorized'});
  if(!UUID.test(req.params.id))return reply.code(404).send({error:'not_found'});
  if(req.headers.origin&&req.headers.origin!==
    (process.env.AUTH_BASE_URL??'http://127.0.0.1:5173'))
    return reply.code(403).send({error:'invalid_origin'});
  if(!req.headers['content-type']?.toLowerCase().startsWith('application/json'))
    return reply.code(415).send({error:'json_required'});
  if(!req.body||typeof req.body!=='object'||Array.isArray(req.body)||
     Object.keys(req.body).length!==0)
    return reply.code(400).send({error:'invalid_body'});
  const db=await pool.connect();let open=false;
  try{
   await db.query('BEGIN');open=true;
   // Lock the same character row as Stage VIII completion/rewind.
   const found=await db.query<GateRow>(characterState+' FOR UPDATE OF c',
    [req.params.id,owner]);
   if(!found.rowCount||!isPlayableCharacterOrigin(found.rows[0].origin)){
    await db.query('ROLLBACK');open=false;
    return reply.code(404).send({error:'not_found'});
   }
   if(!unlocked(found.rows[0])){
    await db.query('ROLLBACK');open=false;
    return reply.code(409).send({error:'free_play_not_unlocked'});
   }
   await db.query(`UPDATE player_characters
    SET free_play_intro_seen_at=COALESCE(free_play_intro_seen_at,NOW())
    WHERE id=$1 AND account_id=$2`,[req.params.id,owner]);
   await db.query('COMMIT');open=false;
   return {unlocked:true,announcementSeen:true};
  }catch(error){
   if(open){try{await db.query('ROLLBACK');}catch{/* Preserve original */}}
   if(schemaMissing(error))return reply.code(503).send({
    error:'free_play_schema_missing',setup:'npm run free-play:migrate'});
   throw error;
  }finally{db.release();}
 });
}
