-- A diary entry is owned by one character, never by an account. Task IDs may
-- deliberately repeat across characters. Only the dev stage-rewind transition
-- can discard already archived future tasks.
CREATE TABLE IF NOT EXISTS player_character_journal (
  character_id UUID NOT NULL REFERENCES player_characters(id) ON DELETE RESTRICT,
  task_instance_id TEXT NOT NULL CHECK(length(task_instance_id) BETWEEN 1 AND 160),
  task_id TEXT NOT NULL CHECK(length(task_id) BETWEEN 1 AND 160),
  stage INTEGER NOT NULL CHECK(stage >= 1),
  title TEXT NOT NULL CHECK(length(title) BETWEEN 1 AND 240),
  paragraphs JSONB NOT NULL CHECK(jsonb_typeof(paragraphs) = 'array'),
  choices JSONB NOT NULL DEFAULT '{}'::jsonb CHECK(jsonb_typeof(choices) = 'object'),
  outcome TEXT,
  content_version INTEGER NOT NULL CHECK(content_version >= 1),
  completed_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
  sequence BIGINT GENERATED ALWAYS AS IDENTITY,
  PRIMARY KEY(character_id,task_instance_id),
  UNIQUE(character_id,sequence)
);
CREATE INDEX IF NOT EXISTS player_character_journal_sequence_idx
  ON player_character_journal(character_id,sequence);

-- Rewinds are only exposed on loopback development servers. The stage is
-- lowered in the same transaction as deleting/recreating task receipts.
-- A trigger ensures every existing rewind path invalidates only THIS
-- character's now-future diary entries, including after interrupted requests.
CREATE OR REPLACE FUNCTION purge_rewound_character_journal()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.tutorial_stage < OLD.tutorial_stage THEN
    DELETE FROM player_character_journal
    WHERE character_id=NEW.id AND stage>=NEW.tutorial_stage;
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS purge_rewound_character_journal_trigger ON player_characters;
CREATE TRIGGER purge_rewound_character_journal_trigger
AFTER UPDATE OF tutorial_stage ON player_characters
FOR EACH ROW EXECUTE FUNCTION purge_rewound_character_journal();
