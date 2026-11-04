-- Millhand Stage 7 clinic, one state and exactly-once command receipts.
-- Additive; historical v0.5.1 combat data remains unchanged.
CREATE TABLE IF NOT EXISTS player_character_clinic (
  character_id UUID PRIMARY KEY REFERENCES player_characters(id) ON DELETE RESTRICT,
  revision BIGINT NOT NULL CHECK(revision>=0),
  state JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS player_character_clinic_receipts (
  character_id UUID NOT NULL REFERENCES player_characters(id) ON DELETE RESTRICT,
  request_id UUID NOT NULL,
  request_hash TEXT NOT NULL,
  response JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY(character_id,request_id)
);
