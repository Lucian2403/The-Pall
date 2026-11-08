// Additive Bellrunner Stage 1 acceptance migration; never resets characters.
import pg from 'pg';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';

if(!process.env.DATABASE_URL)throw new Error('DATABASE_URL required. Run npm run bellrunner:migrate from platform.');
const sql=readFileSync(resolve(import.meta.dirname,'../db/migrations/0014_bellrunner_stage1.sql'),'utf8');
const client=new pg.Client({connectionString:process.env.DATABASE_URL});
await client.connect();
try{
  await client.query('BEGIN');
  await client.query(sql);
  await client.query('COMMIT');
  console.log('PASS: Bellrunner acceptance tables initialized; existing character progress is unchanged.');
}catch(e){
  await client.query('ROLLBACK');
  throw e;
}finally{await client.end();}
