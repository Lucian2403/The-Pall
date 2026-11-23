// Additive only; no account-wide copy or guessed diary entries.
import pg from 'pg';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
if(!process.env.DATABASE_URL)throw Error('DATABASE_URL required');
const db=new pg.Client({connectionString:process.env.DATABASE_URL});
await db.connect();
try{
 await db.query('BEGIN');
 await db.query(readFileSync(resolve(import.meta.dirname,'../db/migrations/0022_personal_journal.sql'),'utf8'));
 await db.query('COMMIT');
 console.log('Personal Journal schema ready. No existing character history was changed.');
}catch(e){await db.query('ROLLBACK');throw e;}finally{await db.end();}
