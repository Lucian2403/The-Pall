import type pg from 'pg';
import {advance, HOME_ID, type State} from './shared-home-state.js';
import {physicallyAtHome} from './character-location.js';

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
      if (!await physicallyAtHome(db, id)) throw Error('not_at_home');
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
