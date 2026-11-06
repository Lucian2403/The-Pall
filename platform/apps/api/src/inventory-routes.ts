/** Server-owned inventory and rented-room chest.
 * Currency is NOT an item; equipment slots, modifiers, trading and loot follow.
 */
import type {FastifyInstance} from 'fastify';
import type {IncomingHttpHeaders} from 'node:http';
import {fromNodeHeaders} from 'better-auth/node';
import {createHash,randomUUID} from 'node:crypto';
import pg from 'pg';
import {auth} from './auth.js';
import {inventoryView,planTransfer,InventoryInvalidAction} from './inventory-model.js';
import type {InventoryRow,ItemLocation} from './inventory-model.js';

type Session={user:{id:string;emailVerified:boolean}}|null;
type ResolveSession=(headers:IncomingHttpHeaders)=>Promise<Session>;
type Character={id:string;origin:string;tutorial_stage:number;tutorial_status:string};
type InventoryState={revision:string|number};
type Command={
 kind:'transfer';requestId:string;expectedRevision:number;
 itemInstanceId:string;quantity:number;to:ItemLocation
};
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const base='/api/characters/:id/inventory';
const selectRows=String.raw`SELECT i.id,i.item_code,i.location,i.quantity,
 i.quality_tier,i.current_durability,i.max_durability,i.grant_key,
 d.name,d.category,d.description,d.stackable,d.max_stack,d.weight_kg,
 d.volume_l,d.carry_volume_bonus_l,d.design_status
 FROM player_character_item_instances i
 JOIN pall_item_definitions d ON d.code=i.item_code
 WHERE i.character_id=$1 ORDER BY i.created_at,i.id`;
const verifiedHome=String.raw`SELECT 1 FROM player_character_tutorial_home
 WHERE character_id=$1 LIMIT 1`;
function parseCommand(body:unknown):Command{
 if(!body||typeof body!=='object'||Array.isArray(body))throw Error('invalid_body');
 const v=body as Record<string,unknown>;
 if(Object.keys(v).sort().join(',')!==
    'expectedRevision,itemInstanceId,kind,quantity,requestId,to')
   throw Error('invalid_fields');
 if(v.kind!=='transfer'||typeof v.requestId!=='string'||!UUID.test(v.requestId))
   throw Error('invalid_command');
 if(typeof v.itemInstanceId!=='string'||!UUID.test(v.itemInstanceId))
   throw Error('invalid_item_id');
 if(!Number.isSafeInteger(v.expectedRevision)||(v.expectedRevision as number)<0)
   throw Error('invalid_revision');
 if(!Number.isSafeInteger(v.quantity)||(v.quantity as number)<=0)
   throw Error('invalid_quantity');
 if(v.to!=='pack'&&v.to!=='home_chest')throw Error('invalid_location');
 return {
  kind:'transfer',requestId:v.requestId as string,
  expectedRevision:v.expectedRevision as number,
  itemInstanceId:v.itemInstanceId as string,
  quantity:v.quantity as number,to:v.to as ItemLocation
 };
}
function schemaMissing(error:unknown){return (error as {code?:string})?.code==='42P01';}
const allowedOrigin=(h:IncomingHttpHeaders)=>!h.origin||
 h.origin===(process.env.AUTH_BASE_URL??'http://127.0.0.1:5173');
export function registerInventoryRoutes(app:FastifyInstance,options:{
 pool?:pg.Pool;resolveSession?:ResolveSession
}={}){
 const pool=options.pool??new pg.Pool({connectionString:process.env.DATABASE_URL});
 const resolveSession=options.resolveSession??(async(headers:IncomingHttpHeaders)=>
  auth.api.getSession({headers:fromNodeHeaders(headers)}));
 app.addHook('onClose',async()=>{if(!options.pool)await pool.end();});

 app.get<{Params:{id:string}}>(base,async(req,reply)=>{
  reply.header('Cache-Control','no-store');
  const session=await resolveSession(req.headers);
  if(!session?.user.emailVerified)return reply.code(401).send({error:'unauthorized'});
  if(!UUID.test(req.params.id))return reply.code(404).send({error:'not_found'});
  const db=await pool.connect();let open=false;
  try{
   await db.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');open=true;
   const char=await db.query<Character>(
    'SELECT id,origin,tutorial_stage,tutorial_status FROM player_characters WHERE id=$1 AND account_id=$2',
    [req.params.id,session.user.id]
   );
   if(!char.rowCount){await db.query('ROLLBACK');open=false;return reply.code(404).send({error:'not_found'});}
   const state=await db.query<InventoryState>(
    'SELECT revision FROM player_character_inventory_state WHERE character_id=$1',
    [req.params.id]
   );
   if(!state.rowCount){await db.query('ROLLBACK');open=false;
    return reply.code(503).send({error:'inventory_not_initialized',setup:'npm run inventory:migrate'});}
   const rows=await db.query<InventoryRow>(selectRows,[req.params.id]);
   const homeReady=char.rows[0].tutorial_stage===8 &&
    ['IN_PROGRESS','COMPLETED'].includes(char.rows[0].tutorial_status) &&
    (await db.query(verifiedHome,[req.params.id])).rowCount===1;
   await db.query('COMMIT');open=false;
   return inventoryView(rows.rows,Number(state.rows[0].revision),homeReady);
  }catch(error){
   if(open){try{await db.query('ROLLBACK');}catch{/* preserve original */}}
   if(schemaMissing(error))return reply.code(503).send({
    error:'inventory_schema_missing',setup:'npm run inventory:migrate'
   });
   throw error;
  }finally{db.release();}
 });

 app.post<{Params:{id:string}}>(base,async(req,reply)=>{
  reply.header('Cache-Control','no-store');
  const session=await resolveSession(req.headers);
  if(!session?.user.emailVerified)return reply.code(401).send({error:'unauthorized'});
  if(!UUID.test(req.params.id))return reply.code(404).send({error:'not_found'});
  if(!allowedOrigin(req.headers))return reply.code(403).send({error:'invalid_origin'});
  if(!req.headers['content-type']?.toLowerCase().startsWith('application/json'))
   return reply.code(415).send({error:'json_required'});
  let cmd:Command;
  try{cmd=parseCommand(req.body);}
  catch(error){return reply.code(400).send({error:error instanceof Error?error.message:'invalid_body'});}
  const hash=createHash('sha256').update(JSON.stringify(cmd)).digest('hex');
  const db=await pool.connect();let open=false;
  try{
   await db.query('BEGIN');open=true;
   // Same character-first lock hierarchy as stage/character deletion.
   const chars=await db.query<Character>(
    'SELECT id,origin,tutorial_stage,tutorial_status FROM player_characters WHERE id=$1 AND account_id=$2 FOR UPDATE',
    [req.params.id,session.user.id]);
   if(!chars.rowCount){await db.query('ROLLBACK');open=false;return reply.code(404).send({error:'not_found'});}
   const oldReceipt=await db.query<{request_hash:string;response:unknown}>(
    'SELECT request_hash,response FROM player_character_inventory_receipts WHERE character_id=$1 AND request_id=$2',
    [req.params.id,cmd.requestId]);
   if(oldReceipt.rowCount){
    await db.query('COMMIT');open=false;
    return oldReceipt.rows[0].request_hash===hash
      ?oldReceipt.rows[0].response
      :reply.code(409).send({error:'idempotency_key_reuse'});
   }
   const state=await db.query<InventoryState>(
    'SELECT revision FROM player_character_inventory_state WHERE character_id=$1 FOR UPDATE',
    [req.params.id]);
   if(!state.rowCount){await db.query('ROLLBACK');open=false;
    return reply.code(503).send({error:'inventory_not_initialized',setup:'npm run inventory:migrate'});}
   const revision=Number(state.rows[0].revision);
   if(revision!==cmd.expectedRevision){
    await db.query('ROLLBACK');open=false;
    return reply.code(409).send({error:'stale_revision',currentRevision:revision});
   }
   // Chest transfers are allowed only after the authenticated Stage 8 home
   // exists. Other backgrounds cannot teleport items into a fictional home.
   const c=chars.rows[0];
   const homeReady=c.tutorial_stage===8&&
     ['IN_PROGRESS','COMPLETED'].includes(c.tutorial_status)&&
     (await db.query(verifiedHome,[req.params.id])).rowCount===1;
   if(!homeReady){await db.query('ROLLBACK');open=false;
    return reply.code(409).send({error:'storage_not_unlocked'});}
   const before=await db.query<InventoryRow>(selectRows+' FOR UPDATE OF i',[req.params.id]);
   let planned:ReturnType<typeof planTransfer>;
   try{planned=planTransfer(before.rows,cmd.itemInstanceId,cmd.quantity,cmd.to,randomUUID());}
   catch(error){
    if(!(error instanceof InventoryInvalidAction))throw error;
    await db.query('ROLLBACK');open=false;
    return reply.code(409).send({error:error.message});
   }
   for(const edit of planned.edits){
    if(edit.kind==='update'){
     await db.query(
      'UPDATE player_character_item_instances SET quantity=$3,location=$4 WHERE character_id=$1 AND id=$2',
      [req.params.id,edit.id,edit.quantity,edit.location]);
    }else if(edit.kind==='remove'){
     await db.query('DELETE FROM player_character_item_instances WHERE character_id=$1 AND id=$2',
      [req.params.id,edit.id]);
    }else{
     await db.query(
      `INSERT INTO player_character_item_instances
        (id,character_id,item_code,location,quantity,quality_tier,
          current_durability,max_durability)
       SELECT $3,character_id,item_code,$4,$5,quality_tier,
          current_durability,max_durability
       FROM player_character_item_instances WHERE character_id=$1 AND id=$2`,
      [req.params.id,edit.sourceId,edit.id,edit.location,edit.quantity]);
    }
   }
   await db.query(
    'UPDATE player_character_inventory_state SET revision=revision+1,updated_at=NOW() WHERE character_id=$1',
    [req.params.id]);
   const result=inventoryView(planned.after,revision+1,true);
   await db.query(
    'INSERT INTO player_character_inventory_receipts(character_id,request_id,request_hash,response) VALUES($1,$2,$3,$4::jsonb)',
    [req.params.id,cmd.requestId,hash,JSON.stringify(result)]);
   await db.query('COMMIT');open=false;
   return result;
  }catch(error){
   if(open){try{await db.query('ROLLBACK');}catch{/* original error */}}
   if(schemaMissing(error))return reply.code(503).send({
    error:'inventory_schema_missing',setup:'npm run inventory:migrate'
   });
   throw error;
  }finally{db.release();}
 });
}
