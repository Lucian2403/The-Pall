// Additive Bellrunner Stage 1 acceptance migration; never resets characters.
import pg from 'pg';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';

if(!process.env.DATABASE_URL)throw new Error('DATABASE_URL required. Run npm run bellrunner:migrate from platform.');
const migrations=['0014_bellrunner_stage1.sql','0015_bellrunner_dispatch_work.sql',
  '0016_bellrunner_wrong_bell.sql','0017_bellrunner_second_job.sql'];
const client=new pg.Client({connectionString:process.env.DATABASE_URL});
await client.connect();
try{
  await client.query('BEGIN');
  for(const name of migrations){
    await client.query(readFileSync(resolve(import.meta.dirname,'../db/migrations',name),'utf8'));
  }
  await client.query('COMMIT');
  console.log('PASS: Bellrunner Stages 1–4 tables initialized; existing character progress is unchanged.');
}catch(e){
  await client.query('ROLLBACK');
  throw e;
}finally{await client.end();}
