import pg from 'pg';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
if(!process.env.DATABASE_URL)throw Error('DATABASE_URL required; run from platform with --env-file=.env');
const sql=['0010_tutorial_home.sql','0026_starter_rent.sql','0027_activity_engine.sql','0028_character_notifications.sql'].map(file=>readFileSync(resolve(import.meta.dirname,'../db/migrations',file),'utf8')).join('\n');
const db=new pg.Client({connectionString:process.env.DATABASE_URL});
await db.connect();
try{await db.query('BEGIN');await db.query(sql);await db.query('COMMIT');
console.log('PASS: shared Stage 8 home, receipts, initial rent and activity engine migrated.');}
catch(error){await db.query('ROLLBACK');throw error;}
finally{await db.end();}
