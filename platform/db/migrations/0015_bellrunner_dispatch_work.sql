-- Approved Bellrunner Stage 2 work interactions; additive and non-destructive.
-- No wages, routes with invented street IDs, timers or inventory grants.
ALTER TABLE player_character_bellrunner_dispatch
  ADD COLUMN IF NOT EXISTS work_state JSONB NOT NULL
    DEFAULT '{"phase":"issued","route":null,"noticesOrdered":false,"receipt":null}'::jsonb;
CREATE TABLE IF NOT EXISTS player_character_bellrunner_dispatch_work_receipts (
  character_id UUID NOT NULL REFERENCES player_characters(id) ON DELETE RESTRICT,
  request_id UUID NOT NULL,
  request_hash TEXT NOT NULL,
  result JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY(character_id,request_id)
);
