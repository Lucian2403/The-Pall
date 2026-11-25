-- One character-owned city state. A journey is either wholly active or absent.
CREATE TABLE IF NOT EXISTS player_character_city_travel (
 character_id UUID PRIMARY KEY REFERENCES player_characters(id) ON DELETE CASCADE,
 current_location_id TEXT NOT NULL,
 revision INTEGER NOT NULL DEFAULT 0 CHECK(revision>=0),
 destination_id TEXT,
 started_at TIMESTAMPTZ,
 arrives_at TIMESTAMPTZ,
 last_request_id UUID,
 CHECK ((destination_id IS NULL AND started_at IS NULL AND arrives_at IS NULL)
 OR (destination_id IS NOT NULL AND started_at IS NOT NULL AND arrives_at IS NOT NULL
     AND arrives_at>started_at AND destination_id<>current_location_id))
);
