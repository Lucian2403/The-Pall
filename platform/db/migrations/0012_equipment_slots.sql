-- Owner equipment revision: four free pack slots, six from an EQUIPPED Simple Bag.
-- Existing item IDs/receipt history are retained; no money or story writes.
-- Migration is additive and idempotent. Never empty player inventories.
ALTER TABLE pall_item_definitions
 ADD COLUMN IF NOT EXISTS equip_slot TEXT;
ALTER TABLE pall_item_definitions
 DROP CONSTRAINT IF EXISTS pall_item_definitions_equip_slot_check;
ALTER TABLE pall_item_definitions
 ADD CONSTRAINT pall_item_definitions_equip_slot_check
 CHECK(equip_slot IS NULL OR equip_slot IN
 ('head','face','torso','hands','pants','feet','back','primary_weapon',
  'secondary_weapon','respiratory_filter','accessory_1','accessory_2'));
UPDATE pall_item_definitions
 SET equip_slot='torso' WHERE code='basic_clothes';
UPDATE pall_item_definitions
 SET equip_slot='back',carry_slots_bonus=6 WHERE code='crude_small_bag';

ALTER TABLE player_character_item_instances
 ADD COLUMN IF NOT EXISTS equipment_slot TEXT;
ALTER TABLE player_character_item_instances
 DROP CONSTRAINT IF EXISTS player_character_item_instances_location_check;
ALTER TABLE player_character_item_instances
 ADD CONSTRAINT player_character_item_instances_location_check
 CHECK(location IN ('pack','home_chest','equipped'));
ALTER TABLE player_character_item_instances
 DROP CONSTRAINT IF EXISTS pall_equipment_location_matches_slot;
ALTER TABLE player_character_item_instances
 ADD CONSTRAINT pall_equipment_location_matches_slot
 CHECK ((location='equipped' AND equipment_slot IS NOT NULL) OR
        (location<>'equipped' AND equipment_slot IS NULL));
ALTER TABLE player_character_item_instances
 DROP CONSTRAINT IF EXISTS pall_equipment_slot_valid;
ALTER TABLE player_character_item_instances
 ADD CONSTRAINT pall_equipment_slot_valid
 CHECK(equipment_slot IS NULL OR equipment_slot IN
 ('head','face','torso','hands','pants','feet','back','primary_weapon',
  'secondary_weapon','respiratory_filter','accessory_1','accessory_2'));
CREATE UNIQUE INDEX IF NOT EXISTS idx_pall_equipment_owner_slot
 ON player_character_item_instances(character_id,equipment_slot)
 WHERE equipment_slot IS NOT NULL;

-- Preserve intentional transfers to the chest. Equip only starter grants
-- still in the pack and only when the corresponding slot is vacant.
UPDATE player_character_item_instances i
SET location='equipped',equipment_slot=d.equip_slot
FROM pall_item_definitions d
WHERE i.item_code=d.code
 AND i.location='pack'
 AND i.grant_key IN ('universal_starter_basic_clothes','universal_starter_crude_small_bag')
 AND d.equip_slot IS NOT NULL
 AND NOT EXISTS(
  SELECT 1 FROM player_character_item_instances occupied
  WHERE occupied.character_id=i.character_id
  AND occupied.equipment_slot=d.equip_slot
 );
-- New characters receive their starter outfit and bag already equipped.
-- ON CONFLICT keeps existing item IDs, even if a player stored a starter.
CREATE OR REPLACE FUNCTION pall_seed_character_inventory(p_character UUID)
RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO player_character_inventory_state(character_id)
    VALUES(p_character) ON CONFLICT DO NOTHING;
  INSERT INTO player_character_item_instances
    (character_id,item_code,location,equipment_slot,quantity,quality_tier,
     current_durability,max_durability,grant_key)
  SELECT p_character,d.code,
    CASE WHEN d.equip_slot IS NOT NULL THEN 'equipped' ELSE 'pack' END,
    d.equip_slot,1,1,d.base_durability,d.base_durability,
    'universal_starter_'||d.code
  FROM pall_item_definitions d
  WHERE d.code IN ('basic_clothes','crude_small_bag')
  ON CONFLICT(character_id,grant_key) WHERE grant_key IS NOT NULL DO NOTHING;
END $$;
