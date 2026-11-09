-- Composite outfit slot and equipment-derived display attributes.
-- Existing starter item IDs, equipped state, currency and story are untouched.
-- A historical separate pants item must be reconciled explicitly, not deleted.
DO $$ BEGIN
 IF EXISTS(SELECT 1 FROM pall_item_definitions WHERE equip_slot='pants')
    OR EXISTS(SELECT 1 FROM player_character_item_instances WHERE equipment_slot='pants') THEN
  RAISE EXCEPTION 'Cannot merge pants slot: existing separate pants equipment must be reconciled';
 END IF;
END $$;
ALTER TABLE pall_item_definitions
 ADD COLUMN IF NOT EXISTS damage_rating NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK(damage_rating>=0),
 ADD COLUMN IF NOT EXISTS pall_protection NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK(pall_protection>=0),
 ADD COLUMN IF NOT EXISTS ash_protection NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK(ash_protection>=0),
 ADD COLUMN IF NOT EXISTS carry_weight_bonus_kg NUMERIC(10,3) NOT NULL DEFAULT 0 CHECK(carry_weight_bonus_kg>=0);
-- Keep 'torso' as the stable database key for one combined torso-and-legs
-- clothing slot. 'pants' is no longer a separately equippable socket.
ALTER TABLE pall_item_definitions
 DROP CONSTRAINT IF EXISTS pall_item_definitions_equip_slot_check;
ALTER TABLE pall_item_definitions
 ADD CONSTRAINT pall_item_definitions_equip_slot_check
 CHECK(equip_slot IS NULL OR equip_slot IN
 ('head','face','torso','hands','feet','back','primary_weapon',
  'secondary_weapon','respiratory_filter','accessory_1','accessory_2'));
ALTER TABLE player_character_item_instances
 DROP CONSTRAINT IF EXISTS pall_equipment_slot_valid;
ALTER TABLE player_character_item_instances
 ADD CONSTRAINT pall_equipment_slot_valid
 CHECK(equipment_slot IS NULL OR equipment_slot IN
 ('head','face','torso','hands','feet','back','primary_weapon',
  'secondary_weapon','respiratory_filter','accessory_1','accessory_2'));
