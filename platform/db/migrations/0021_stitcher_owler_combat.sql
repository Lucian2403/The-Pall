-- Stitcher Stage VI: real shared-engine encounter, saved under the
-- witnessed Stage V refusal and locked physical doorway preparation.
CREATE TABLE IF NOT EXISTS player_character_owler_combat (
 character_id UUID PRIMARY KEY REFERENCES player_characters(id) ON DELETE RESTRICT,
 revision BIGINT NOT NULL DEFAULT 0 CHECK(revision>=0),
 preparation TEXT NOT NULL CHECK(preparation IN ('reason','cart','brace')),
 branch TEXT NOT NULL CHECK(branch IN ('trolley','consent','notes')),
 state JSONB NOT NULL,
 history JSONB NOT NULL DEFAULT '[]'::jsonb,
 outcome TEXT CHECK(outcome IS NULL OR outcome IN ('player_victory','player_defeat')),
 patient_safe BOOLEAN NOT NULL DEFAULT FALSE,
 transfer_cancelled BOOLEAN NOT NULL DEFAULT FALSE,
 updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 CHECK ((outcome IS NOT NULL) OR NOT (patient_safe OR transfer_cancelled))
);
CREATE TABLE IF NOT EXISTS player_character_owler_combat_receipts (
 character_id UUID NOT NULL REFERENCES player_characters(id) ON DELETE RESTRICT,
 request_id UUID NOT NULL,
 request_hash TEXT NOT NULL,
 response JSONB NOT NULL,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 PRIMARY KEY(character_id,request_id)
);
