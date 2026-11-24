/** Character-owned, read-only archive. A request never backfills or advances a task. */
import type {FastifyInstance} from 'fastify';
import {fromNodeHeaders} from 'better-auth/node';
import type {IncomingHttpHeaders} from 'node:http';
import pg from 'pg';
import {getGameplayPool} from './database-pool.js';
import {auth} from './auth.js';

const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
type Session={user:{id:string;emailVerified:boolean}}|null;
type Resolver=(headers:IncomingHttpHeaders)=>Promise<Session>;
type Params={id:string};
type Query={limit?:string;after?:string};
type Archived={
 task_instance_id:string;task_id:string;stage:number;title:string;
 paragraphs:string[];choices:Record<string,string>;outcome:string|null;
 content_version:number;completed_at:string;sequence:string;
};
export function registerPersonalJournalRoutes(app:FastifyInstance,options:{
 pool?:pg.Pool;resolveSession?:Resolver
}={}){
 const db=getGameplayPool(app,options.pool);
 const resolve=options.resolveSession??(async(headers:IncomingHttpHeaders)=>
   auth.api.getSession({headers:fromNodeHeaders(headers)}));
 app.get<{Params:Params;Querystring:Query}>('/api/characters/:id/journal',async(req,reply)=>{
  reply.header('Cache-Control','private, no-store');
  const session=await resolve(req.headers);
  if(!session?.user.emailVerified)return reply.code(401).send({error:'unauthorized'});
  if(!UUID.test(req.params.id))return reply.code(404).send({error:'not_found'});
  const limit=req.query.limit===undefined?20:Number(req.query.limit);
  const after=req.query.after===undefined?0:Number(req.query.after);
  if(!Number.isSafeInteger(limit)||limit<1||limit>100||
     !Number.isSafeInteger(after)||after<0)
   return reply.code(400).send({error:'invalid_pagination'});
  // A matching account alone is NOT permission to query another character.
  const owned=await db.query(
   'SELECT 1 FROM player_characters WHERE id=$1 AND account_id=$2',
   [req.params.id,session.user.id]);
  if(!owned.rowCount)return reply.code(404).send({error:'not_found'});
  const result=await db.query<Archived>(
   `SELECT task_instance_id,task_id,stage,title,paragraphs,choices,outcome,
           content_version,completed_at,sequence
    FROM player_character_journal WHERE character_id=$1 AND sequence>$2
    ORDER BY sequence ASC LIMIT $3`,
   [req.params.id,after,limit+1]);
  const rows=result.rows.slice(0,limit);
  return {characterId:req.params.id,completed:rows.map(r=>({
   taskInstanceId:r.task_instance_id,taskId:r.task_id,stage:r.stage,
   title:r.title,paragraphs:r.paragraphs,choices:r.choices,outcome:r.outcome,
   contentVersion:r.content_version,completedAt:r.completed_at
  })),nextCursor:result.rows.length>limit?String(rows.at(-1)?.sequence):null};
 });
}
