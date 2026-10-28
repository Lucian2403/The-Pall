-- Additive, safe for existing accounts. The owner's 16 portraits are universal
-- to all six origins and are selected by sex and a numbered visual variant.
-- No existing character is assigned an arbitrary portrait.
ALTER TABLE player_characters
  ADD COLUMN IF NOT EXISTS avatar_id TEXT;
ALTER TABLE player_characters
  DROP CONSTRAINT IF EXISTS player_characters_avatar_id_check;
ALTER TABLE player_characters
  ADD CONSTRAINT player_characters_avatar_id_check
  CHECK (avatar_id IS NULL OR
    (sex='Male' AND avatar_id ~ '^male-0[1-8]$') OR
    (sex='Female' AND avatar_id ~ '^female-0[1-8]$'));
