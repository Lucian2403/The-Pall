import type pg from 'pg';
import {activityCanFinish, activityRunning, type ActivityRun, type ActivitySnapshot} from '@the-pall/game-core';
import {activityDefinition} from './activity-definitions.js';

type Row = {
  run_id: string;
  activity_key: string;
  started_at: Date;
  ends_at: Date;
  completed_at: Date | null;
};

function toRun(row: Row): ActivityRun {
  return {
    id: row.run_id, key: row.activity_key, label: activityDefinition(row.activity_key).label,
    startedAt: row.started_at.toISOString(), endsAt: row.ends_at.toISOString(),
    completedAt: row.completed_at?.toISOString() ?? null
  };
}

async function serverTime(db: pg.PoolClient): Promise<Date> {
  return (await db.query<{now: Date}>('SELECT clock_timestamp() AS now')).rows[0].now;
}

/** Caller MUST hold the owning character row lock in an open transaction.
 * The outcome and completion marker are committed together. No worker or
 * browser callback is required: the first authorized read reconciles elapsed time. */
export async function settleActivity(db: pg.PoolClient, id: string): Promise<ActivitySnapshot> {
  const now = await serverTime(db);
  const exists = await db.query("SELECT to_regclass('player_character_activity') AS name");
  if (!exists.rows[0]?.name) return {activity: null, serverNow: now.toISOString()};
  const row = (await db.query<Row>(
    'SELECT run_id,activity_key,started_at,ends_at,completed_at FROM player_character_activity WHERE character_id=$1 FOR UPDATE',
    [id])).rows[0];
  let activity = row ? toRun(row) : null;
  if (activity && activityCanFinish(activity, now)) {
    await activityDefinition(activity.key).complete(db, id);
    await db.query('UPDATE player_character_activity SET completed_at=$2 WHERE character_id=$1', [id, now]);
    activity = {...activity, completedAt: now.toISOString()};
  }
  return {activity, serverNow: now.toISOString()};
}

/** Adapter validates its command/revision/receipt before calling this function.
 * One running activity per character, even across parallel tabs. */
export async function startActivity(
  db: pg.PoolClient, id: string, key: string, requestId: string, current: ActivitySnapshot
): Promise<ActivitySnapshot> {
  if (activityRunning(current.activity)) throw Error('activity_in_progress');
  const definition = activityDefinition(key);
  if (!Number.isSafeInteger(definition.durationSeconds) || definition.durationSeconds <= 0)
    throw Error('invalid_activity_duration');
  await definition.prepare(db, id);
  const now = await serverTime(db);
  const end = new Date(now.getTime() + definition.durationSeconds * 1000);
  const row = (await db.query<Row>(
    `INSERT INTO player_character_activity(character_id,run_id,activity_key,started_at,ends_at,completed_at)
     VALUES($1,$2,$3,$4,$5,NULL)
     ON CONFLICT(character_id) DO UPDATE SET run_id=EXCLUDED.run_id,activity_key=EXCLUDED.activity_key,
       started_at=EXCLUDED.started_at,ends_at=EXCLUDED.ends_at,completed_at=NULL
     WHERE player_character_activity.completed_at IS NOT NULL
     RETURNING run_id,activity_key,started_at,ends_at,completed_at`,
    [id,requestId,key,now,end])).rows[0];
  if (!row) throw Error('activity_in_progress');
  return {activity: toRun(row), serverNow: now.toISOString()};
}
