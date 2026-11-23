/** Read-only, authenticated, character-specific permanent journal API.
 * Reads never create progress or run backfills. No account-wide results/cache. */
import type {FastifyInstance} from 'fastify';
import {fromNodeHeaders} from 'better-auth/node';
import type {IncomingHttpHeaders} from 'node:http';
import pg from 'pg';
import {auth} from './auth.js';

const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
type Params={id:string};
type Query={limit?:string;cursor?:string};
type Account={user:{id:string;emailVerified:boolean}}|null;
type Resolver=(headers:IncomingHttpHeaders)=>Promise<Account>;
type Row={task_instance_id:string;task_id:string;stage:number;title:string;
  paragraphs:string[];choices:Record<string,string>;outcome:string|null;
  content_version:number;completed_at:Date};

export function registerPersonalJournalRoutes(app:FastifyInstance,options:{
  pool?:pg.Pool;resolveSession?:Resolver
}={}){
  const pool=options.pool??new pg.Pool({connectionString:process.env.DATABASE_URL});
  const resolveSession=options.resolveSession??(async headers=>
    auth.api.getSession({headers:fromNodeHeaders(headers)}));
  app.addHook('onClose',async()=>{if(!options.pool)await pool.end();});
  app.get<{Params:Params;Querystring:Query}>('/api/characters/:id/journal',async(req,reply)=>{
    reply.header('Cache-Control','private, no-store');
    const session=await resolveSession(req.headers);
    if(!session?.user.emailVerified)return reply.code(401).send({error:'unauthorized'});
    if(!UUID.test(req.params.id))return reply.code(404).send({error:'not_found'});
    const rawLimit=req.query.limit??'20';
    if(!/^\d{1,2}$/.test(rawLimit)||Number(rawLimit)<1||Number(rawLimit)>50)
      return reply.code(400).send({error:'invalid_limit'});
    let afterDate:Date|null=null,afterId:string|null=null;
    if(req.query.cursor){
      if(req.query.cursor.length>512)return reply.code(400).send({error:'invalid_cursor'});
      try{
        const decoded=JSON.parse(Buffer.from(req.query.cursor,'base64url').toString('utf8')) as unknown;
        if(!Array.isArray(decoded)||decoded.length!==3||
          decoded[0]!==req.params.id||
          typeof decoded[1]!=='string'||typeof decoded[2]!=='string'||
          decoded[2].length>160||!Number.isFinite(Date.parse(decoded[1])))
          throw Error('invalid_cursor');
        afterDate=new Date(decoded[1]);afterId=decoded[2];
      }catch{return reply.code(400).send({error:'invalid_cursor'});}
    }
    // Ownership is checked before ANY journal query. Two owned characters
    // still cannot read one another's tasks through a shared account ID.
    const owned=await pool.query(
      'SELECT id FROM player_characters WHERE id=$1 AND account_id=$2',
      [req.params.id,session.user.id]);
    if(!owned.rowCount)return reply.code(404).send({error:'not_found'});
    const limit=Number(rawLimit);
    const history=await pool.query<Row>(
      `SELECT j.task_instance_id,j.task_id,j.stage,j.title,j.paragraphs,
         j.choices,j.outcome,j.content_version,j.completed_at
       FROM player_character_journal_tasks AS j
       JOIN player_characters AS c ON c.id=j.character_id
       WHERE j.character_id=$1 AND c.account_id=$2
         AND ($3::timestamptz IS NULL OR
           (j.completed_at,j.task_instance_id)>($3::timestamptz,$4::text))
       ORDER BY j.completed_at,j.task_instance_id
       LIMIT $5`,
      [req.params.id,session.user.id,afterDate,afterId,limit+1]);
    const entries=history.rows.slice(0,limit);
    const last=entries.at(-1);
    return {characterId:req.params.id,tasks:entries.map(row=>({
      taskId:row.task_id,taskInstanceId:row.task_instance_id,
      stage:row.stage,title:row.title,paragraphs:row.paragraphs,
      choices:row.choices,outcome:row.outcome,contentVersion:row.content_version,
      completedAt:row.completed_at
    })),nextCursor:history.rows.length>limit&&last
      ?Buffer.from(JSON.stringify([req.params.id,last.completed_at.toISOString(),last.task_instance_id])).toString('base64url')
      :null};
  });
}
