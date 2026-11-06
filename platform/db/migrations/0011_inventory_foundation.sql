-- Stage inventory foundation: additive, reversible by development branch only.
-- Item masses, volumes and capacities are TECHNICAL PLAYTEST VALUES, not approved final balance.
-- All six backgrounds receive the exact same two starter instances. Coins remain currency.
CREATE TABLE IF NOT EXISTS pall_item_definitions(
  code TEXT PRIMARY KEY CHECK(code~'^[a-z][a-z0-9_]{2,63}$'),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  stackable BOOLEAN NOT NULL DEFAULT FALSE,
  max_stack INTEGER NOT NULL DEFAULT 1 CHECK(max_stack BETWEEN 1 AND 100000),
  weight_kg NUMERIC(10,3) NOT NULL CHECK(weight_kg>=0),
  volume_l NUMERIC(10,3) NOT NULL CHECK(volume_l>=0),
  carry_volume_bonus_l NUMERIC(10,3) NOT NULL DEFAULT 0 CHECK(carry_volume_bonus_l>=0),
  quality_min INTEGER NOT NULL DEFAULT 1 CHECK(quality_min BETWEEN 1 AND 5),
  quality_max INTEGER NOT NULL DEFAULT 1 CHECK(quality_max BETWEEN quality_min AND 5),
  base_durability INTEGER CHECK(base_durability BETWEEN 1 AND 100000),
  design_status TEXT NOT NULL DEFAULT 'PROVISIONAL',
  CHECK(stackable OR max_stack=1)
);
INSERT INTO pall_item_definitions
  (code,name,category,description,stackable,max_stack,weight_kg,volume_l,
   carry_volume_bonus_l,quality_min,quality_max,base_durability)
VALUES
 ('basic_clothes','Basic Clothes','clothing',
  'Universal starting clothes. Equipment effects are not yet active.',
  FALSE,1,1.200,2.000,0,1,1,100),
 ('crude_small_bag','Crude Small Bag','container',
  'Universal starting bag. Playtest volume allowance; equip slots follow later.',
  FALSE,1,0.800,2.000,12.000,1,1,100)
ON CONFLICT(code) DO NOTHING;

CREATE TABLE IF NOT EXISTS player_character_inventory_state(
  character_id UUID PRIMARY KEY REFERENCES player_characters(id) ON DELETE RESTRICT,
  revision BIGINT NOT NULL DEFAULT 0 CHECK(revision>=0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS player_character_item_instances(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id UUID NOT NULL REFERENCES player_characters(id) ON DELETE RESTRICT,
  item_code TEXT NOT NULL REFERENCES pall_item_definitions(code) ON DELETE RESTRICT,
  location TEXT NOT NULL DEFAULT 'pack' CHECK(location IN ('pack','home_chest')),
  quantity INTEGER NOT NULL DEFAULT 1 CHECK(quantity BETWEEN 1 AND 100000),
  quality_tier INTEGER NOT NULL DEFAULT 1 CHECK(quality_tier BETWEEN 1 AND 5),
  current_durability INTEGER,
  max_durability INTEGER,
  grant_key TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK((current_durability IS NULL AND max_durability IS NULL) OR
        (current_durability BETWEEN 0 AND max_durability AND max_durability>0))
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_pall_inventory_starter_grant
 ON player_character_item_instances(character_id,grant_key)
 WHERE grant_key IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_pall_inventory_owner_location
 ON player_character_item_instances(character_id,location,id);
CREATE TABLE IF NOT EXISTS player_character_inventory_receipts(
  character_id UUID NOT NULL REFERENCES player_characters(id) ON DELETE RESTRICT,
  request_id UUID NOT NULL,
  request_hash TEXT NOT NULL,
  response JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY(character_id,request_id)
);

-- Server-side insert hook guarantees starter ownership even when the existing
-- character-creation endpoint has no inventory knowledge. All writes are atomic.
CREATE OR REPLACE FUNCTION pall_seed_character_inventory(p_character UUID)
RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO player_character_inventory_state(character_id)
   VALUES(p_character) ON CONFLICT DO NOTHING;
  INSERT INTO player_character_item_instances
   (character_id,item_code,location,quantity,quality_tier,
    current_durability,max_durability,grant_key)
  SELECT p_character,d.code,'pack',1,1,d.base_durability,d.base_durability,
   'universal_starter_'||d.code
  FROM pall_item_definitions d
  WHERE d.code IN ('basic_clothes','crude_small_bag')
  ON CONFLICT(character_id,grant_key) WHERE grant_key IS NOT NULL DO NOTHING;
END $$;
CREATE OR REPLACE FUNCTION pall_seed_character_inventory_on_insert()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
 PERFORM pall_seed_character_inventory(NEW.id);
 RETURN NEW;
END $$;
DO $$
BEGIN
 IF NOT EXISTS(SELECT 1 FROM pg_trigger
   WHERE tgname='pall_character_inventory_on_insert'
     AND tgrelid='player_characters'::regclass) THEN
   CREATE TRIGGER pall_character_inventory_on_insert
    AFTER INSERT ON player_characters
    FOR EACH ROW EXECUTE FUNCTION pall_seed_character_inventory_on_insert();
 END IF;
END $$;
-- Backfill existing characters once; never duplicate starter grants on reruns.
SELECT pall_seed_character_inventory(id) FROM player_characters;
