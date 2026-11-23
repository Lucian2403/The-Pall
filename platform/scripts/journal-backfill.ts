/** One-time/idempotent migration of verifiable saved diary milestones.
 * This script NEVER invents a missing decision, outcome or award. */
import pg from 'pg';
import {backfillCharacterJournal} from '../apps/api/src/personal-journal-backfill.js';
if(!process.env.DATABASE_URL)throw Error('DATABASE_URL required');
const pool=new pg.Pool({connectionString:process.env.DATABASE_URL});
let cursor='';
let count=0;
try{
 for(;;){
  const batch=await pool.query<{id:string}>(
   'SELECT id FROM player_characters WHERE id::text>$1 ORDER BY id LIMIT 100',[cursor]);
  if(!batch.rowCount)break;
  for(const row of batch.rows){
   const client=await pool.connect();
   try{
    await client.query('BEGIN');
    const owned=await client.query<{id:string;origin:string;tutorial_stage:number}>(
     'SELECT id,origin,tutorial_stage FROM player_characters WHERE id=$1 FOR UPDATE',[row.id]);
    if(owned.rowCount){
     await backfillCharacterJournal(client,owned.rows[0]);
     count++;
    }
    await client.query('COMMIT');
   }catch(error){await client.query('ROLLBACK');throw error;}
   finally{client.release();}
   cursor=row.id;
  }
 }
 console.log('PASS: audited and backfilled '+count+' characters without merging histories.');
}finally{await pool.end();}
