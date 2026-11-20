// Additive Stitcher Stage I–IV migration. Never resets existing characters.
import pg from 'pg';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
if(!process.env.DATABASE_URL)throw new Error('DATABASE_URL required');
const client=new pg.Client({connectionString:process.env.DATABASE_URL});
await client.connect();
try{
 await client.query('BEGIN');
 await client.query(readFileSync(resolve(import.meta.dirname,'../db/migrations/0020_stitcher_ward.sql'),'utf8'));
 await client.query(readFileSync(resolve(import.meta.dirname,'../db/migrations/0021_stitcher_owler_combat.sql'),'utf8'));
 await client.query('COMMIT');
 console.log('PASS: Stitcher ward and Owler combat schema created; no player progress reset.');
}catch(e){await client.query('ROLLBACK');throw e;}finally{await client.end();}