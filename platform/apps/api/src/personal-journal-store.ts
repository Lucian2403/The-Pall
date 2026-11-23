import type pg from 'pg';

/** Server-only archive operation. Call inside the same transaction that saves
 * the completed work. Never accept text or a completion flag from a browser.
 * Conflict means an earlier immutable snapshot wins, including on retries. */
export type JournalCompletion={
  taskId:string;
  taskInstanceId:string;
  stage:number;
  title:string;
  paragraphs:readonly string[];
  choices?:Readonly<Record<string,string>>;
  outcome?:string|null;
  contentVersion?:number;
};
export type JournalWriter=Pick<pg.PoolClient,'query'>;

export async function archiveJournalTask(
  db:JournalWriter,characterId:string,task:JournalCompletion
):Promise<void>{
  if(!task.taskId||!task.taskInstanceId||!task.title||
    !Number.isSafeInteger(task.stage)||task.stage<1||
    !task.paragraphs.length||task.paragraphs.some(line=>!line.trim()))
    throw new Error('invalid_journal_snapshot');
  await db.query(
    `INSERT INTO player_character_journal_tasks
     (character_id,task_instance_id,task_id,stage,title,paragraphs,choices,outcome,content_version)
     VALUES ($1,$2,$3,$4,$5,$6::jsonb,$7::jsonb,$8,$9)
     ON CONFLICT (character_id,task_instance_id) DO NOTHING`,
    [characterId,task.taskInstanceId,task.taskId,task.stage,task.title,
      JSON.stringify(task.paragraphs),JSON.stringify(task.choices??{}),
      task.outcome??null,task.contentVersion??1]);
}

/** Explicit developer rewind only; production revisit never erases history.
 * The caller must have locked and authenticated this specific character. */
export async function invalidateJournalStages(
  db:JournalWriter,characterId:string,stages:readonly number[]
):Promise<void>{
  if(!stages.length)return;
  await db.query(
    'DELETE FROM player_character_journal_tasks WHERE character_id=$1 AND stage=ANY($2::int[])',
    [characterId,stages]);
}
