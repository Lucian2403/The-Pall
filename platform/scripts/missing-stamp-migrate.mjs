// Safe additive migration. Preserve all saved Millhand Stage 1–2 work.
import pg from 'pg';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL required; run from platform with --env-file=.env');
const sql=readFileSync(resolve(import.meta.dirname,'../db/migrations/0004_millhand_missing_stamp.sql'),'utf8');
const client=new pg.Client({connectionString:process.env.DATABASE_URL});
await client.connect();
try {
  await client.query('BEGIN');
  await client.query(sql);
  await client.query('COMMIT');
  console.log('PASS: Stage3 Missing Stamp state and receipt tables created.');
} catch(error) {
  await client.query('ROLLBACK');
  throw error;
} finally {await client.end();}
