import pg from 'pg';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
if(!process.env.DATABASE_URL)throw Error('DATABASE_URL required');
const db=new pg.Client({connectionString:process.env.DATABASE_URL});
await db.connect();
try{
 await db.query('BEGIN');
 for(const file of ['0024_free_play_entry.sql','0025_city_travel.sql'])
  await db.query(readFileSync(resolve(import.meta.dirname,'../db/migrations',file),'utf8'));
 await db.query('COMMIT');
 console.log('PASS: City travel tables installed.');
}catch(error){await db.query('ROLLBACK');throw error;}finally{await db.end();}
