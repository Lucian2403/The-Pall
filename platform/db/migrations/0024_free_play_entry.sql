-- Persistent, once-per-character freedom announcement acknowledgement.
-- Stage VIII completion stays in player_character_tutorial_home and
-- player_characters.tutorial_status; no duplicate completion or reward flag.
ALTER TABLE player_characters
 ADD COLUMN IF NOT EXISTS free_play_intro_seen_at TIMESTAMPTZ;
