-- One durable Flint encounter per character. Original v0.5.1 source remains unchanged.
-- The character owner is enforced by the API against player_characters.account_id.
CREATE TABLE IF NOT EXISTS player_character_flint_combat (
  character_id UUID PRIMARY KEY REFERENCES player_characters(id) ON DELETE RESTRICT,
  revision BIGINT NOT NULL DEFAULT 0 CHECK (revision >= 0),
  stance TEXT NOT NULL CHECK (stance IN ('brace','moving','cart')),
  state JSONB NOT NULL,
  history JSONB NOT NULL DEFAULT '[]'::jsonb,
  outcome TEXT CHECK (outcome IS NULL OR outcome IN ('player_victory','player_defeat')),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS player_character_flint_combat_receipts (
  character_id UUID NOT NULL REFERENCES player_characters(id) ON DELETE RESTRICT,
  request_id UUID NOT NULL,
  request_hash TEXT NOT NULL,
  response JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY(character_id,request_id)
);
