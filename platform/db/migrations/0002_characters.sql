-- M1.2 local-only, additive character storage. Run via npm run characters:migrate.
-- Deliberately no destructive ALTER/DROP, no prices/equipment schema invented.
-- Better Auth stores its account identifiers in public."user"(id TEXT).
CREATE TABLE IF NOT EXISTS player_character_account_state (
  account_id TEXT PRIMARY KEY REFERENCES "user"(id) ON DELETE RESTRICT,
  revision BIGINT NOT NULL DEFAULT 0 CHECK (revision >= 0)
);

CREATE TABLE IF NOT EXISTS player_characters (
  id UUID PRIMARY KEY,
  account_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  name_key TEXT NOT NULL UNIQUE,
  sex TEXT NOT NULL CHECK (sex IN ('Male','Female')),
  origin TEXT NOT NULL CHECK (origin IN ('Millhand','Bellrunner','Squatter','Stitcher','Scrapper','Inkbound')),
  str INTEGER NOT NULL DEFAULT 5 CHECK (str = 5),
  dex INTEGER NOT NULL DEFAULT 5 CHECK (dex = 5),
  intel INTEGER NOT NULL DEFAULT 5 CHECK (intel = 5),
  res INTEGER NOT NULL DEFAULT 5 CHECK (res = 5),
  max_health INTEGER NOT NULL DEFAULT 50 CHECK (max_health = 50),
  current_health INTEGER NOT NULL DEFAULT 50 CHECK (current_health BETWEEN 0 AND max_health),
  coins BIGINT NOT NULL DEFAULT 20 CHECK (coins >= 0),
  major_skill_bonuses JSONB NOT NULL,
  -- Pending game inventory schema: exact canonical starter requirements only.
  -- This is NOT tradable, equipable or an item ID.
  starter_item_requirements JSONB NOT NULL,
  starting_location TEXT NOT NULL,
  tutorial_stage INTEGER NOT NULL DEFAULT 1 CHECK (tutorial_stage BETWEEN 1 AND 8),
  tutorial_status TEXT NOT NULL DEFAULT 'NOT_STARTED' CHECK (tutorial_status IN ('NOT_STARTED','IN_PROGRESS','COMPLETED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_player_characters_owner ON player_characters(account_id, created_at, id);

CREATE TABLE IF NOT EXISTS player_character_create_receipts (
  account_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE RESTRICT,
  request_id UUID NOT NULL,
  request_hash TEXT NOT NULL,
  character_id UUID NOT NULL REFERENCES player_characters(id) ON DELETE RESTRICT,
  result JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (account_id, request_id)
);
