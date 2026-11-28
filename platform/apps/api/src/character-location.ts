import type pg from 'pg';
import {HOME_ID} from './shared-home-state.js';

/** The old tutorial room still works before the city migration. Once travel
 * exists, completed characters must actually be at Home to use the room. */
export async function physicallyAtHome(db:pg.Pool|pg.PoolClient,id:string){
 const exists=await db.query("SELECT to_regclass('player_character_city_travel') AS name");
 if(!exists.rows[0]?.name)return true;
 const result=await db.query<{current_location_id:string;destination_id:string|null}>(
  'SELECT current_location_id,destination_id FROM player_character_city_travel WHERE character_id=$1',[id]);
 const row=result.rows[0];
 return !row||(row.current_location_id===HOME_ID&&row.destination_id===null);
}
