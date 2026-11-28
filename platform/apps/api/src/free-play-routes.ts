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
import {CITY_OVERVIEW} from './city-poi-catalogue.js';
import {citySnapshot,CityTravelConflict,type TravelCommand} from './city-travel.js';
import {activityBlocks,type CityCatalogue} from '@the-pall/game-core';
import {settleActivity} from './activity-engine.js';
import {activityStatus,readNotifications} from './notification-store.js';

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
 pool?:pg.Pool;resolveSession?:Resolver;cityCatalogue?:CityCatalogue
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
   if(schemaMissing(error))return reply.code(503).send({error:'free_play_schema_missing',setup:'npm run free-play:migrate'});
   throw error;
  }
 });
 // GET reconciles a due journey; POST is the only way to initiate one.
 for(const method of ['GET','POST'] as const){
 app.route<{Params:{id:string}}>({method,url:method==='GET'?base+'/city':base+'/city/travel',handler:async(req,reply)=>{
  reply.header('Cache-Control','no-store');
  const owner=await identity(req.headers);
  if(!owner)return reply.code(401).send({error:'unauthorized'});
  if(!UUID.test(req.params.id))return reply.code(404).send({error:'not_found'});
  let command:TravelCommand|undefined;
  if(method==='POST'){
   if(req.headers.origin&&req.headers.origin!==(process.env.AUTH_BASE_URL??'http://127.0.0.1:5173'))
    return reply.code(403).send({error:'invalid_origin'});
   if(!req.headers['content-type']?.toLowerCase().startsWith('application/json'))
    return reply.code(415).send({error:'json_required'});
   const body=req.body as Partial<TravelCommand>|null;
   if(!body||typeof body!=='object'||Array.isArray(body)||Object.keys(body).sort().join(',')!=='destinationId,expectedRevision,requestId'||
      typeof body.destinationId!=='string'||body.destinationId.length>100||typeof body.requestId!=='string'||!UUID.test(body.requestId)||
      !Number.isSafeInteger(body.expectedRevision)||Number(body.expectedRevision)<0)
    return reply.code(400).send({error:'invalid_body'});
   command=body as TravelCommand;
  }
  const db=await pool.connect();let open=false;
  try{
   await db.query('BEGIN');open=true;
   const found=await db.query<GateRow>(characterState+' FOR UPDATE OF c',[req.params.id,owner]);
   if(!found.rowCount||!isPlayableCharacterOrigin(found.rows[0].origin)){
    await db.query('ROLLBACK');open=false;return reply.code(404).send({error:'not_found'});
   }
   if(!unlocked(found.rows[0])){
    await db.query('ROLLBACK');open=false;return reply.code(409).send({error:'free_play_not_unlocked'});
   }
   if(found.rows[0].free_play_intro_seen_at===null){
    await db.query('ROLLBACK');open=false;return reply.code(409).send({error:'free_play_announcement_required'});
   }
   const activity=await settleActivity(db,req.params.id);
   if(command&&activityBlocks(activity.activity,'travel')){
    await db.query('COMMIT');open=false;return reply.code(409).send({error:'activity_in_progress'});
   }
   const snapshot=await citySnapshot(db,req.params.id,options.cityCatalogue??CITY_OVERVIEW,command);
   const status=await activityStatus(db,req.params.id,activity);
   await db.query('COMMIT');open=false;
   return {...snapshot,...status};
  }catch(error){
   if(open){try{await db.query('ROLLBACK');}catch{/* Preserve original */}}
   if(error instanceof CityTravelConflict)return reply.code(409).send({error:error.message});
   if(schemaMissing(error))return reply.code(503).send({error:'city_travel_schema_missing',setup:'npm run city-travel:migrate'});
   throw error;
  }finally{db.release();}
 }});
 }
 // Read-only screens use this status endpoint when they do not already own a Home/city snapshot.
 // Marking notifications read changes only inbox metadata, never gameplay.
 for(const method of ['GET','POST'] as const){
 app.route<{Params:{id:string}}>({method,url:method==='GET'?base+'/activity':base+'/notifications/read',handler:async(req,reply)=>{
  reply.header('Cache-Control','no-store');
  const owner=await identity(req.headers);
  if(!owner)return reply.code(401).send({error:'unauthorized'});
  if(!UUID.test(req.params.id))return reply.code(404).send({error:'not_found'});
  if(method==='POST'){
   if(req.headers.origin&&req.headers.origin!==(process.env.AUTH_BASE_URL??'http://127.0.0.1:5173'))return reply.code(403).send({error:'invalid_origin'});
   if(!req.headers['content-type']?.toLowerCase().startsWith('application/json'))return reply.code(415).send({error:'json_required'});
   if(!req.body||typeof req.body!=='object'||Array.isArray(req.body)||Object.keys(req.body).length!==0)return reply.code(400).send({error:'invalid_body'});
  }
  const db=await pool.connect();let open=false;
  try{
   await db.query('BEGIN');open=true;
   const found=await db.query<GateRow>(characterState+' FOR UPDATE OF c',[req.params.id,owner]);
   if(!found.rowCount||!isPlayableCharacterOrigin(found.rows[0].origin))return reply.code(404).send({error:'not_found'});
   if(!unlocked(found.rows[0]))return reply.code(409).send({error:'free_play_not_unlocked'});
   // Mark existing notifications first, so an activity finishing in this transaction remains unread.
   if(method==='POST')await readNotifications(db,req.params.id);
   const result=await activityStatus(db,req.params.id,await settleActivity(db,req.params.id));
   await db.query('COMMIT');open=false;
   return result;
  }catch(error){
   if(schemaMissing(error))return reply.code(503).send({error:'activity_schema_missing',setup:'npm run home:migrate'});
   throw error;
  }finally{
   try{if(open)await db.query('ROLLBACK');}finally{db.release();}
  }
 }});
 }
 // The overview calls this endpoint when the one-time announcement is acknowledged.
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
