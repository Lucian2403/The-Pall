-- Bellrunner Stage 1 -> Stage 2: permanent acceptance of the council notice round.
-- Quest documents remain office-owned props, never inventory items.
CREATE TABLE IF NOT EXISTS player_character_bellrunner_dispatch (
  character_id UUID PRIMARY KEY REFERENCES player_characters(id) ON DELETE RESTRICT,
  revision BIGINT NOT NULL DEFAULT 0 CHECK (revision >= 0),
  accepted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS player_character_bellrunner_dispatch_receipts (
  character_id UUID NOT NULL REFERENCES player_characters(id) ON DELETE RESTRICT,
  request_id UUID NOT NULL,
  request_hash TEXT NOT NULL,
  result JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (character_id,request_id)
);
