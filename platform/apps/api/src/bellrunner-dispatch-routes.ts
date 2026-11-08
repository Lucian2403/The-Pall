/** Bellrunner's first real tutorial mutation: accept the council notice round.
 * The saved character advances from Stage 1 to Stage 2 exactly once.
 * Stage 2 courier interactions are deliberately a separate milestone.
 */
import type {FastifyInstance} from 'fastify';
import type {IncomingHttpHeaders} from 'node:http';
import {fromNodeHeaders} from 'better-auth/node';
import {createHash} from 'node:crypto';
import pg from 'pg';
import {auth} from './auth.js';

type Session={user:{id:string;emailVerified:boolean}}|null;
type Resolver=(headers:IncomingHttpHeaders)=>Promise<Session>;
type Character={origin:string;tutorial_stage:number;tutorial_status:string};
type Params={id:string};
type Command={action:'take_round';requestId:string;expectedRevision:0};
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function parse(input:unknown):Command{
  if(!input||typeof input!=='object'||Array.isArray(input))throw Error('invalid_body');
  const v=input as Record<string,unknown>;
  if(Object.keys(v).sort().join(',')!=='action,expectedRevision,requestId')
    throw Error('invalid_fields');
  if(v.action!=='take_round')throw Error('invalid_action');
  if(typeof v.requestId!=='string'||!UUID.test(v.requestId))
    throw Error('invalid_request_id');
  if(v.expectedRevision!==0)throw Error('invalid_revision');
  return {action:'take_round',requestId:v.requestId,expectedRevision:0};
}
function view(character:Character,accepted:boolean){
  return {stage:character.tutorial_stage,tutorialStatus:character.tutorial_status,
    accepted,revision:0,work:'Shift Dispatch',skill:'Industry / Hauling',
    payment:'Not yet cleared',tutorialPayout:{coins:0,ordinaryXp:0,items:0}};
}
const schemaMissing=(e:unknown)=>(e as {code?:string})?.code==='42P01';

export function registerBellrunnerDispatchRoutes(app:FastifyInstance,
  options?:{pool?:pg.Pool;resolveSession?:Resolver}){
  const db=options?.pool??new pg.Pool({connectionString:process.env.DATABASE_URL});
  if(!options?.pool)app.addHook('onClose',async()=>{await db.end();});
  const resolve=options?.resolveSession??(async(headers:IncomingHttpHeaders)=>
    auth.api.getSession({headers:fromNodeHeaders(headers)}));

  app.get<{Params:Params}>('/api/characters/:id/bellrunner/dispatch',async(req,reply)=>{
    const session=await resolve(req.headers);
    if(!session?.user.emailVerified)return reply.code(401).send({error:'unauthorized'});
    if(!UUID.test(req.params.id))return reply.code(404).send({error:'not_found'});
    const rows=await db.query<Character>(
      'SELECT origin,tutorial_stage,tutorial_status FROM player_characters WHERE id=$1 AND account_id=$2',
      [req.params.id,session.user.id]);
    if(!rows.rowCount||rows.rows[0].origin!=='Bellrunner')
      return reply.code(404).send({error:'not_found'});
    try{
      const accepted=await db.query(
        'SELECT character_id FROM player_character_bellrunner_dispatch WHERE character_id=$1',
        [req.params.id]);
      return view(rows.rows[0],!!accepted.rowCount);
    }catch(e){
      if(schemaMissing(e))return reply.code(503).send({error:'bellrunner_migration_required'});
      throw e;
    }
  });

  app.post<{Params:Params}>('/api/characters/:id/bellrunner/dispatch',async(req,reply)=>{
    const session=await resolve(req.headers);
    if(!session?.user.emailVerified)return reply.code(401).send({error:'unauthorized'});
    if(!UUID.test(req.params.id))return reply.code(404).send({error:'not_found'});
    const origin=req.headers.origin;
    if(origin&&origin!==(process.env.AUTH_BASE_URL??'http://127.0.0.1:5173'))
      return reply.code(403).send({error:'invalid_origin'});
    if(!req.headers['content-type']?.toLowerCase().startsWith('application/json'))
      return reply.code(415).send({error:'json_required'});
    let command:Command;
    try{command=parse(req.body);}catch(e){
      return reply.code(400).send({error:e instanceof Error?e.message:'invalid_action'});
    }
    const hash=createHash('sha256').update(
      JSON.stringify({action:command.action,expectedRevision:command.expectedRevision})
    ).digest('hex');
    const client=await db.connect();
    let transaction=false;
    try{
      await client.query('BEGIN');transaction=true;
      const ch=await client.query<Character>(
        'SELECT origin,tutorial_stage,tutorial_status FROM player_characters WHERE id=$1 AND account_id=$2 FOR UPDATE',
        [req.params.id,session.user.id]);
      if(!ch.rowCount||ch.rows[0].origin!=='Bellrunner'){
        await client.query('ROLLBACK');transaction=false;
        return reply.code(404).send({error:'not_found'});
      }
      const receipt=await client.query<{request_hash:string;result:unknown}>(
        'SELECT request_hash,result FROM player_character_bellrunner_dispatch_receipts WHERE character_id=$1 AND request_id=$2',
        [req.params.id,command.requestId]);
      if(receipt.rowCount){
        await client.query('COMMIT');transaction=false;
        if(receipt.rows[0].request_hash!==hash)
          return reply.code(409).send({error:'idempotency_key_reuse'});
        return receipt.rows[0].result;
      }
      const accepted=await client.query(
        'SELECT revision FROM player_character_bellrunner_dispatch WHERE character_id=$1 FOR UPDATE',
        [req.params.id]);
      if(accepted.rowCount||ch.rows[0].tutorial_stage!==1||
        ch.rows[0].tutorial_status!=='NOT_STARTED'){
        await client.query('ROLLBACK');transaction=false;
        return reply.code(409).send({error:'wrong_work_phase'});
      }
      await client.query(
        'INSERT INTO player_character_bellrunner_dispatch(character_id,revision) VALUES($1,0)',
        [req.params.id]);
      await client.query(
        "UPDATE player_characters SET tutorial_stage=2,tutorial_status='IN_PROGRESS' WHERE id=$1",
        [req.params.id]);
      const result=view({origin:'Bellrunner',tutorial_stage:2,tutorial_status:'IN_PROGRESS'},true);
      await client.query(
        'INSERT INTO player_character_bellrunner_dispatch_receipts(character_id,request_id,request_hash,result) VALUES($1,$2,$3,$4::jsonb)',
        [req.params.id,command.requestId,hash,JSON.stringify(result)]);
      await client.query('COMMIT');transaction=false;
      return reply.code(200).send(result);
    }catch(e){
      if(transaction){try{await client.query('ROLLBACK');}catch{/* Preserve original error */}}
      if(schemaMissing(e))return reply.code(503).send({error:'bellrunner_migration_required'});
      throw e;
    }finally{client.release();}
  });
}
