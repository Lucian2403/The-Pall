import type pg from 'pg';
import type {NotificationInbox,ActivitySnapshot,ActivityStatusSnapshot} from '@the-pall/game-core';

type Notice = {id:string;kind:string;title:string;message:string};
type Row = {event_id:string;kind:string;title:string;message:string;created_at:Date;read_at:Date|null};

/** Call inside the transaction which commits the underlying game event. */
export async function addNotification(db:pg.PoolClient,id:string,notice:Notice,now:Date){
  await db.query(`INSERT INTO player_character_notifications(character_id,event_id,kind,title,message,created_at)
    VALUES($1,$2,$3,$4,$5,$6) ON CONFLICT(character_id,event_id) DO NOTHING`,
    [id,notice.id,notice.kind,notice.title,notice.message,now]);
}

export async function notificationInbox(db:pg.PoolClient,id:string):Promise<NotificationInbox|null>{
  const exists=await db.query("SELECT to_regclass('player_character_notifications') AS name");
  if(!exists.rows[0]?.name)return null;
  const rows=await db.query<Row>(`SELECT event_id,kind,title,message,created_at,read_at
    FROM player_character_notifications WHERE character_id=$1 ORDER BY created_at DESC,event_id LIMIT 50`,[id]);
  const count=await db.query<{unread:string}>('SELECT COUNT(*) AS unread FROM player_character_notifications WHERE character_id=$1 AND read_at IS NULL',[id]);
  return {items:rows.rows.map(r=>({id:r.event_id,kind:r.kind,title:r.title,message:r.message,
    createdAt:r.created_at.toISOString(),readAt:r.read_at?.toISOString()??null})),unread:Number(count.rows[0].unread)};
}
export async function readNotifications(db:pg.PoolClient,id:string){
  await db.query('UPDATE player_character_notifications SET read_at=NOW() WHERE character_id=$1 AND read_at IS NULL',[id]);
  return notificationInbox(db,id);
}

/** All adapters use the same snapshot shape; no second timer or notification poll. */
export async function activityStatus(db:pg.PoolClient,id:string,snapshot:ActivitySnapshot):Promise<ActivityStatusSnapshot>{
  const notifications=await notificationInbox(db,id);
  const result=await db.query<{stamina:unknown}>("SELECT state->'condition'->'stamina' AS stamina FROM player_character_tutorial_home WHERE character_id=$1",[id]);
  const stamina=result.rows[0]?.stamina;
  return {...snapshot,notifications,...(typeof stamina==='number'?{stamina}:{})};
}
