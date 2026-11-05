-- Per-character first-entry introduction state.
-- Idempotent: only pre-existing characters at the first install are marked
-- introduced. Re-running this migration does not dismiss newly made characters.
DO $welcome$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='player_characters'
      AND column_name='welcome_seen_at'
  ) THEN
    ALTER TABLE player_characters ADD COLUMN welcome_seen_at TIMESTAMPTZ;
    UPDATE player_characters SET welcome_seen_at=created_at;
  END IF;
END
$welcome$;

-- Newly created characters get NULL and must acknowledge the welcome once.
-- Explicit developer reset: UPDATE player_characters
--   SET welcome_seen_at=NULL WHERE id='<character uuid>';
