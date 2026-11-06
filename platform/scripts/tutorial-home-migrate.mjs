import pg from 'pg';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
if(!process.env.DATABASE_URL)throw Error('DATABASE_URL required; run from platform with --env-file=.env');
const sql=readFileSync(resolve(import.meta.dirname,'../db/migrations/0010_tutorial_home.sql'),'utf8');
const db=new pg.Client({connectionString:process.env.DATABASE_URL});
await db.connect();
try{await db.query('BEGIN');await db.query(sql);await db.query('COMMIT');
console.log('PASS: shared Stage 8 home and receipts migrated.');}
catch(error){await db.query('ROLLBACK');throw error;}
finally{await db.end();}
