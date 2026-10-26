-- DEVELOPMENT FIXTURE ONLY. This is not a real player/account schema.
BEGIN;
CREATE TABLE IF NOT EXISTS dev_action_state (
  actor_id uuid PRIMARY KEY,
  revision bigint NOT NULL DEFAULT 0 CHECK (revision >= 0),
  value integer NOT NULL DEFAULT 0 CHECK (value >= 0)
);
CREATE TABLE IF NOT EXISTS dev_action_receipt (
  actor_id uuid NOT NULL REFERENCES dev_action_state(actor_id),
  request_id uuid NOT NULL,
  request_hash text NOT NULL,
  expected_revision bigint NOT NULL,
  result jsonb NOT NULL,
  PRIMARY KEY (actor_id, request_id)
);
INSERT INTO dev_action_state (actor_id, revision, value)
VALUES ('00000000-0000-4000-8000-000000000001', 0, 0)
ON CONFLICT (actor_id) DO NOTHING;
COMMIT;
