/** Only authoritative state handlers call this, inside their existing transaction.
 * Never accept diary text or completed milestones from a client payload. */
import type pg from 'pg';

export type CompletedJournalTask={
  characterId:string;
  taskId:string;
  taskInstanceId:string;
  stage:number;
  title:string;
  paragraphs:readonly string[];
  choices?:Record<string,string>;
  outcome?:string|null;
  contentVersion?:number;
};
export async function archiveJournalTask(
  client:pg.PoolClient, task:CompletedJournalTask
):Promise<void>{
  if(!task.paragraphs.length||task.paragraphs.some(p=>!p.trim()))
    throw new Error('journal_snapshot_requires_real_paragraphs');
  await client.query(
    `INSERT INTO player_character_journal
       (character_id,task_instance_id,task_id,stage,title,paragraphs,choices,outcome,content_version)
     VALUES($1,$2,$3,$4,$5,$6::jsonb,$7::jsonb,$8,$9)
     ON CONFLICT(character_id,task_instance_id) DO NOTHING`,
    [task.characterId,task.taskInstanceId,task.taskId,task.stage,task.title,
      JSON.stringify(task.paragraphs),JSON.stringify(task.choices??{}),
      task.outcome??null,task.contentVersion??1]
  );
}
