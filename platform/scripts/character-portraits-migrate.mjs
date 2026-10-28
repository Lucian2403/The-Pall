// Additive portrait selection migration, never resets existing characters.
import pg from 'pg';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
if(!process.env.DATABASE_URL)throw Error('DATABASE_URL required; run from platform with --env-file=.env');
const sql=readFileSync(resolve(import.meta.dirname,'../db/migrations/0006_character_portraits.sql'),'utf8');
const client=new pg.Client({connectionString:process.env.DATABASE_URL});
await client.connect();
try{
  await client.query('BEGIN');
  await client.query(sql);
  await client.query('COMMIT');
  console.log('PASS: Optional character portraits are ready; existing characters preserved.');
}catch(error){await client.query('ROLLBACK');throw error;}
finally{await client.end();}
