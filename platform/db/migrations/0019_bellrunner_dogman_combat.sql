-- Dogman Stage VI: one real, replay-safe common-engine combat encounter.
-- Owner checks and stage preconditions are enforced in the Fastify adapter.
CREATE TABLE IF NOT EXISTS player_character_dogman_combat (
  character_id UUID PRIMARY KEY REFERENCES player_characters(id) ON DELETE RESTRICT,
  revision BIGINT NOT NULL DEFAULT 0 CHECK(revision>=0),
  stance TEXT NOT NULL CHECK(stance IN ('street','cart','defend')),
  state JSONB NOT NULL,
  history JSONB NOT NULL DEFAULT '[]'::jsonb,
  outcome TEXT CHECK(outcome IS NULL OR outcome IN ('player_victory','player_defeat')),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS player_character_dogman_combat_receipts(
  character_id UUID NOT NULL REFERENCES player_characters(id) ON DELETE RESTRICT,
  request_id UUID NOT NULL,
  request_hash TEXT NOT NULL,
  response JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY(character_id,request_id)
);
