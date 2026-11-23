/** Idempotent, character-at-a-time backfill of verifiable completed work.
 * We do not extrapolate unrecorded choices, fabricate stage completions,
 * or aggregate across an account. Each character remains separately locked. */
import pg from 'pg';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import type {PlateworkState,MissingStampState,SecondJobState} from '@the-pall/game-core';
import type {StitcherState} from '../apps/api/src/stitcher-work.js';
import {archiveStitcherMilestones,archiveStitcherDoor,archiveMillhandWork,
  archiveMillhandMissingStamp,archiveMillhandSecondJob,archiveBellrunnerSecondJob}
  from '../apps/api/src/personal-journal-completions.js';

if(!process.env.DATABASE_URL)throw Error('DATABASE_URL required');
const db=new pg.Pool({connectionString:process.env.DATABASE_URL,max:4});
const root=resolve(import.meta.dirname,'..');
const schema=readFileSync(resolve(root,'db/migrations/0022_personal_journal.sql'),'utf8');
type Character={id:string;origin:string};
type Data={state:Record<string,unknown>};

async function findState(client:pg.PoolClient,table:string,id:string){
 // Table names are source constants; never interpolate a request field.
 try{
  const result=await client.query<Data>('SELECT state FROM '+table+' WHERE character_id=$1',[id]);
  return result.rows[0]?.state??null;
 }catch(error){
  if((error as {code?:string})?.code==='42P01')return null;
  throw error;
 }
}
let completed=0,skipped=0;
try{
 await db.query(schema);
 const characters=await db.query<Character>('SELECT id,origin FROM player_characters ORDER BY id');
 for(const {id,origin} of characters.rows){
  const client=await db.connect();
  try{
   await client.query('BEGIN');
   const owned=await client.query<Character>(
    'SELECT id,origin FROM player_characters WHERE id=$1 FOR UPDATE',[id]);
   if(!owned.rowCount){await client.query('ROLLBACK');skipped++;continue;}
   if(origin==='Stitcher'){
    const saved=await findState(client,'player_character_stitcher_ward',id) as StitcherState|null;
    if(saved){
     for(let stage=1;stage<=4&&stage<saved.stage;stage++)
      await archiveStitcherMilestones(client,id,
       {...saved,stage:stage as 1|2|3|4},
       {...saved,stage:(stage+1) as 2|3|4|5});
     const combat=await findState(client,'player_character_owler_combat',id);
     if(combat)await archiveStitcherDoor(client,id,saved);
    }
   }else if(origin==='Millhand'){
    const plate=await findState(client,'player_character_platework',id);
    if(plate)await archiveMillhandWork(client,id,plate as PlateworkState);
    const missing=await findState(client,'player_character_missing_stamp',id);
    if(missing)await archiveMillhandMissingStamp(client,id,missing as MissingStampState);
    const second=await findState(client,'player_character_second_job',id);
    if(second)await archiveMillhandSecondJob(client,id,second as SecondJobState);
   }else if(origin==='Bellrunner'){
    const second=await findState(client,'player_character_bellrunner_second_job',id);
    if(second)await archiveBellrunnerSecondJob(client,id,
      second as Parameters<typeof archiveBellrunnerSecondJob>[2]);
   }
   await client.query('COMMIT');completed++;
  }catch(error){
   await client.query('ROLLBACK');
   throw new Error('Journal backfill stopped for character '+id,{cause:error});
  }finally{client.release();}
 }
 console.log('Personal Journal backfill: '+completed+' characters processed; '+
  skipped+' unavailable; verified snapshots only.');
}finally{await db.end();}
