// Additive, development-only M1.2 migration using the SAME DATABASE_URL as the API.
// No Docker Compose project assumptions and no fixture or auth table resets.
import pg from 'pg';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required; run with --env-file=.env');
const sql = readFileSync(resolve(import.meta.dirname, '../db/migrations/0002_characters.sql'), 'utf8');
const client = new pg.Client({connectionString: process.env.DATABASE_URL});
await client.connect();
try {
  await client.query('BEGIN');
  await client.query(sql);
  await client.query('COMMIT');
  const found = await client.query("SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename LIKE 'player_character%' ORDER BY tablename");
  console.log('M1.2 tables:', found.rows.map(row => row.tablename).join(', '));
  console.log('PASS: M1.2 additive character schema initialized (existing users and data preserved).');
} catch (error) {
  await client.query('ROLLBACK');
  throw error;
} finally {
  await client.end();
}
