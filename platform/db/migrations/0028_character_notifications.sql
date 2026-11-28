-- Generic persistent inbox. An event key identifies one committed game event.
CREATE TABLE IF NOT EXISTS player_character_notifications (
 character_id UUID NOT NULL REFERENCES player_characters(id) ON DELETE CASCADE,
 event_id TEXT NOT NULL,
 kind TEXT NOT NULL,
 title TEXT NOT NULL,
 message TEXT NOT NULL,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 read_at TIMESTAMPTZ,
 PRIMARY KEY(character_id,event_id)
);
CREATE INDEX IF NOT EXISTS character_notifications_recent
 ON player_character_notifications(character_id,created_at DESC,event_id);
