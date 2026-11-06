/** Additive inventory migration on the same database as the API.
 * Never resets currency, stage, combat, clinic or starter records. */
import pg from 'pg';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
if(!process.env.DATABASE_URL)
  throw Error('DATABASE_URL required; run from platform with --env-file=.env');
const sql=readFileSync(resolve(import.meta.dirname,
  '../db/migrations/0011_inventory_foundation.sql'),'utf8');
const db=new pg.Client({connectionString:process.env.DATABASE_URL});
await db.connect();
try{
 await db.query('BEGIN');
 await db.query(sql);
 await db.query('COMMIT');
 const counts=await db.query(
  'SELECT count(*)::int AS instances,count(DISTINCT character_id)::int AS characters FROM player_character_item_instances');
 console.log('PASS: additive inventory schema and starter grants migrated.',counts.rows[0]);
}catch(error){await db.query('ROLLBACK');throw error;}
finally{await db.end();}
