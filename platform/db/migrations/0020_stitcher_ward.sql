-- Stitcher Stage I–IV one-row ordered progression. Commands and their exact
-- receipt replay are scoped to the owning character and all transitions
-- serialize on player_characters FOR UPDATE.
CREATE TABLE IF NOT EXISTS player_character_stitcher_ward(
 character_id UUID PRIMARY KEY REFERENCES player_characters(id) ON DELETE RESTRICT,
 revision BIGINT NOT NULL CHECK(revision >= 0),
 state JSONB NOT NULL,
 updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS player_character_stitcher_ward_receipts(
 character_id UUID NOT NULL REFERENCES player_characters(id) ON DELETE RESTRICT,
 request_id UUID NOT NULL,
 request_hash TEXT NOT NULL,
 result JSONB NOT NULL,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 PRIMARY KEY(character_id,request_id)
);