/** Additive shared-character diary migration. Does not reset saved progress. */
import pg from 'pg';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
if(!process.env.DATABASE_URL)throw Error('DATABASE_URL required');
const client=new pg.Client({connectionString:process.env.DATABASE_URL});
await client.connect();
try{
 await client.query('BEGIN');
 await client.query(readFileSync(resolve(import.meta.dirname,'../db/migrations/0022_personal_journal.sql'),'utf8'));
 await client.query('COMMIT');
 console.log('PASS: character-specific Personal Journal schema migrated.');
}catch(error){await client.query('ROLLBACK');throw error;}
finally{await client.end();}
