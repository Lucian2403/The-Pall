/** Additive inventory migration on the same database as the API.
 * Never resets currency, stage, combat, clinic or starter records. */
import pg from 'pg';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
if(!process.env.DATABASE_URL)
  throw Error('DATABASE_URL required; run from platform with --env-file=.env');
const migrations=['0011_inventory_foundation.sql','0012_equipment_slots.sql',
  '0013_equipment_stats_and_clothing.sql'];
const db=new pg.Client({connectionString:process.env.DATABASE_URL});
await db.connect();
try{
 await db.query('BEGIN');
 for(const migration of migrations){
   const sql=readFileSync(resolve(import.meta.dirname,'../db/migrations',migration),'utf8');
   await db.query(sql);
 }
 await db.query('COMMIT');
 const counts=await db.query(
  'SELECT count(*)::int AS instances,count(DISTINCT character_id)::int AS characters FROM player_character_item_instances');
 console.log('PASS: inventory/equipment schema and starter grants migrated.',counts.rows[0]);
}catch(error){await db.query('ROLLBACK');throw error;}
finally{await db.end();}
