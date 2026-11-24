-- Ephemeral authenticated Home Chest access. It is NOT a character location,
-- nor an inventory item, and expires even if the client disappears.
CREATE TABLE IF NOT EXISTS player_character_storage_context(
  character_id UUID NOT NULL REFERENCES player_characters(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL CHECK(token_hash~'^[0-9a-f]{64}$'),
  expires_at TIMESTAMPTZ NOT NULL,
  PRIMARY KEY(character_id,token_hash)
);
CREATE INDEX IF NOT EXISTS idx_pall_storage_context_expiry
 ON player_character_storage_context(expires_at);
