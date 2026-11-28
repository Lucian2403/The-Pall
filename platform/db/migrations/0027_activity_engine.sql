-- One current or most recently completed activity per character.
-- All mutations are serialized by the owning player_characters row lock.
CREATE TABLE IF NOT EXISTS player_character_activity (
 character_id UUID PRIMARY KEY REFERENCES player_characters(id) ON DELETE CASCADE,
 run_id UUID NOT NULL,
 activity_key TEXT NOT NULL,
 started_at TIMESTAMPTZ NOT NULL,
 ends_at TIMESTAMPTZ NOT NULL,
 completed_at TIMESTAMPTZ,
 CHECK (ends_at > started_at),
 CHECK (completed_at IS NULL OR completed_at >= ends_at)
);
