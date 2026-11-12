-- Bellrunner Stage 3, The Wrong Bell: one-time branch and non-destructive evidence.
-- No fabricated dates, names, objects, wages, rewards or medical conditions.
CREATE TABLE IF NOT EXISTS player_character_bellrunner_wrong_bell (
  character_id UUID PRIMARY KEY REFERENCES player_characters(id) ON DELETE RESTRICT,
  revision BIGINT NOT NULL DEFAULT 0 CHECK(revision>=0),
  state JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS player_character_bellrunner_wrong_bell_receipts (
  character_id UUID NOT NULL REFERENCES player_characters(id) ON DELETE RESTRICT,
  request_id UUID NOT NULL,
  request_hash TEXT NOT NULL,
  result JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY(character_id,request_id)
);
