// Additive M1.3/M1.4 platework migration. Uses existing DATABASE_URL.
import pg from 'pg';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL required. Use npm run platework:migrate from platform.');
const sql = readFileSync(resolve(import.meta.dirname,'../db/migrations/0003_millhand_platework.sql'),'utf8');
const client = new pg.Client({connectionString:process.env.DATABASE_URL});
await client.connect();
try {
  await client.query('BEGIN');
  await client.query(sql);
  await client.query('COMMIT');
  console.log('PASS: Millhand platework tables initialized without removing existing characters.');
} catch (err) {
  await client.query('ROLLBACK');
  throw err;
} finally {
  await client.end();
}
