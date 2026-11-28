import type pg from 'pg';
import {advance, HOME_ID, type State} from './shared-home-state.js';

/** Definitions own the rules of an activity. The engine owns time and persistence.
 * All hooks execute inside the caller's character-locked transaction. */
export type ActivityDefinition = Readonly<{
  label: string;
  durationSeconds: number;
  prepare(db: pg.PoolClient, characterId: string): Promise<void>;
  complete(db: pg.PoolClient, characterId: string): Promise<void>;
}>;

async function savedHome(db: pg.PoolClient, id: string): Promise<State> {
  const result = await db.query<{state: State}>(
    'SELECT state FROM player_character_tutorial_home WHERE character_id=$1 FOR UPDATE', [id]);
  const state = result.rows[0]?.state;
  if (!state || state.phase !== 'COMPLETE' || state.homeId !== HOME_ID)
    throw Error('activity_home_not_ready');
  return state;
}

export const ACTIVITIES: Readonly<Record<string, ActivityDefinition>> = {
  'home.rest': {
    label: 'Resting',
    durationSeconds: 30, // Provisional first Free Play activity duration.
    async prepare(db, id) {
      await savedHome(db, id);
      // The existing Home route checks physical presence and tutorial completion.
      // This definition also checks location so future adapters cannot bypass it.
      const travelTable = await db.query("SELECT to_regclass('player_character_city_travel') AS name");
      if (!travelTable.rows[0]?.name) return;
      const travel = await db.query<{current_location_id:string; destination_id:string|null}>(
        'SELECT current_location_id,destination_id FROM player_character_city_travel WHERE character_id=$1', [id]);
      const row = travel.rows[0];
      if (row && (row.current_location_id !== HOME_ID || row.destination_id !== null))
        throw Error('not_at_home');
    },
    async complete(db, id) {
      const state = advance(await savedHome(db, id), 'rest');
      await db.query(
        'UPDATE player_character_tutorial_home SET revision=$2,state=$3::jsonb,updated_at=NOW() WHERE character_id=$1',
        [id, state.revision, JSON.stringify(state)]);
    }
  }
};

export function activityDefinition(key: string): ActivityDefinition {
  if (!Object.prototype.hasOwnProperty.call(ACTIVITIES, key)) throw Error('unknown_activity');
  return ACTIVITIES[key];
}
