-- Permanent first-person history, scoped to the CHARACTER, not the account.
-- Every task ID may recur freely across characters; no global task identifier is unique.
CREATE TABLE IF NOT EXISTS player_character_journal_tasks (
  character_id UUID NOT NULL REFERENCES player_characters(id) ON DELETE RESTRICT,
  task_instance_id TEXT NOT NULL CHECK (length(task_instance_id) BETWEEN 1 AND 160),
  task_id TEXT NOT NULL CHECK (length(task_id) BETWEEN 1 AND 120),
  stage INTEGER NOT NULL CHECK (stage >= 1),
  title TEXT NOT NULL CHECK (length(title) BETWEEN 1 AND 180),
  paragraphs JSONB NOT NULL CHECK (
    jsonb_typeof(paragraphs) = 'array' AND jsonb_array_length(paragraphs) > 0
  ),
  choices JSONB NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(choices) = 'object'),
  outcome TEXT,
  content_version INTEGER NOT NULL DEFAULT 1 CHECK (content_version > 0),
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (character_id, task_instance_id)
);
CREATE INDEX IF NOT EXISTS player_character_journal_history
  ON player_character_journal_tasks (character_id, completed_at ASC, task_instance_id ASC);
