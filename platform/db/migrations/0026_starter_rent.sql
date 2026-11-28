-- The first rent obligation is independent of replayable tutorial Home state.
-- No recurring charge, due date, eviction or retroactive debit.
ALTER TABLE player_characters ADD COLUMN IF NOT EXISTS starter_rent_paid_at TIMESTAMPTZ;
