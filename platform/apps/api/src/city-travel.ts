import type pg from 'pg';
import {settleCityJourney,startCityJourney,type CityCatalogue,type CityTravelState,type CityOverviewSnapshot} from '@the-pall/game-core';
import {HOME_ID} from './shared-home-state.js';

type Row={current_location_id:string;revision:number;destination_id:string|null;started_at:Date|null;arrives_at:Date|null;last_request_id:string|null};
export type TravelCommand={destinationId:string;expectedRevision:number;requestId:string};
export class CityTravelConflict extends Error{}
/** Caller holds the owning character row lock throughout. Lazy reconciliation
 * is transactional: refreshes and parallel tabs cannot apply arrival twice. */
export async function citySnapshot(db:pg.PoolClient,id:string,catalogue:CityCatalogue,command?:TravelCommand):Promise<CityOverviewSnapshot>{
 await db.query('INSERT INTO player_character_city_travel(character_id,current_location_id) VALUES($1,$2) ON CONFLICT DO NOTHING',[id,HOME_ID]);
 const row=(await db.query<Row>('SELECT * FROM player_character_city_travel WHERE character_id=$1 FOR UPDATE',[id])).rows[0];
 const now=(await db.query<{now:Date}>('SELECT clock_timestamp() AS now')).rows[0].now;
 let state:CityTravelState={currentLocationId:row.current_location_id,revision:row.revision,
  journey:row.destination_id&&row.started_at&&row.arrives_at?{originId:row.current_location_id,destinationId:row.destination_id,startedAt:row.started_at.toISOString(),arrivesAt:row.arrives_at.toISOString()}:null};
 let requestId=row.last_request_id;
 state=settleCityJourney(state,now);
 if(command&&command.requestId!==requestId){
  if(command.expectedRevision!==state.revision)throw new CityTravelConflict('stale_city_revision');
  try{state=startCityJourney(state,catalogue,command.destinationId,now);}
  catch(error){throw new CityTravelConflict(error instanceof Error?error.message:'invalid_travel');}
  requestId=command.requestId;
 }
 if(state.revision!==row.revision){
  await db.query('UPDATE player_character_city_travel SET current_location_id=$2,revision=$3,destination_id=$4,started_at=$5,arrives_at=$6,last_request_id=$7 WHERE character_id=$1',
    [id,state.currentLocationId,state.revision,state.journey?.destinationId??null,state.journey?.startedAt??null,state.journey?.arrivesAt??null,requestId]);
 }
 return {...catalogue,...state,serverNow:now.toISOString()};
}
