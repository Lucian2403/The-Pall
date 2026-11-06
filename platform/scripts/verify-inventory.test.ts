import assert from 'node:assert/strict';
import {test} from 'node:test';
import {randomUUID,createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {
 InventoryInvalidAction,inventoryView,locationSummary,planTransfer,planEquip,
 PLAYTEST_CAPACITY,EQUIPMENT_SLOTS
} from '../apps/api/src/inventory-model.ts';
import type {InventoryRow} from '../apps/api/src/inventory-model.ts';

const sample=(overrides:Partial<InventoryRow>={}):InventoryRow=>({
 id:randomUUID(),item_code:'crude_small_bag',location:'equipped',
 equipment_slot:'back',equip_slot:'back',quantity:1,
 quality_tier:1,current_durability:100,max_durability:100,grant_key:null,
 name:'Simple Bag',category:'bag',description:'Test fixture',
 stackable:false,max_stack:1,weight_kg:'.800',volume_l:'2',
 carry_volume_bonus_l:'12',carry_slots_bonus:6,
 rarity_label:'Common',armour_rating:0,design_status:'PROVISIONAL',...overrides
});
const clothes=()=>sample({
 item_code:'basic_clothes',name:'Daily Worker Clothes',category:'clothing',
 equipment_slot:'torso',equip_slot:'torso',
 weight_kg:'1.200',volume_l:'2',carry_volume_bonus_l:0,carry_slots_bonus:0
});
const scrap=(overrides:Partial<InventoryRow>={})=>sample({
 item_code:'test_scrap',name:'Scrap',category:'misc',location:'pack',
 equipment_slot:null,equip_slot:null,weight_kg:'.001',volume_l:'.001',
 carry_volume_bonus_l:0,carry_slots_bonus:0,...overrides
});

test('Equipped starter items occupy no bag squares; bag adds exactly six to four',()=>{
 const items=[sample(),clothes()];
 const pack=locationSummary(items,'pack');
 assert.equal(PLAYTEST_CAPACITY.packBaseSlots,4);
 assert.deepEqual(pack,{slotsUsed:0,maxSlots:10,weightKg:2,volumeL:0,
   maxWeightKg:20,maxVolumeL:17,overCapacity:false});
 const view=inventoryView(items,0,true);
 assert.equal(view.pack.items.length,0);
 assert.equal(view.equipment.items.length,2);
 assert.equal(view.equipment.items[0].equipmentSlot,'back');
 assert.equal(view.equipment.items[0].carrySlotsBonus,6);
 assert.equal(view.chest.maxSlots,24);
});
test('Removing equipped bag reduces capacity to four; equipped weight remains carried',()=>{
 const bag=sample(),outfit=clothes();
 const moved=planTransfer([bag,outfit],bag.id,1,'pack',randomUUID());
 assert.deepEqual(moved.edits,[{
   kind:'update',id:bag.id,quantity:1,location:'pack',equipmentSlot:null
 }]);
 assert.equal(moved.after.find(x=>x.id===bag.id)?.equipment_slot,null);
 assert.equal(locationSummary(moved.after,'pack').maxSlots,4);
 assert.equal(locationSummary(moved.after,'pack').maxVolumeL,5);
 assert.equal(locationSummary(moved.after,'pack').weightKg,2);
 assert.equal(bag.location,'equipped');
 const stored=planTransfer(moved.after,bag.id,1,'home_chest',randomUUID());
 assert.equal(locationSummary(stored.after,'pack').slotsUsed,0);
 const equipped=planEquip(stored.after,bag.id,'back');
 assert.equal(equipped.after.find(x=>x.id===bag.id)?.location,'equipped');
 assert.equal(locationSummary(equipped.after,'pack').maxSlots,10);
});
test('Equip checks compatible sockets, slot ownership and quantity',()=>{
 const bag=sample({location:'pack',equipment_slot:null});
 const outfit=clothes();
 assert.throws(()=>planEquip([bag,outfit],bag.id,'torso'),/slot_incompatible/);
 assert.throws(()=>planEquip([bag,outfit],outfit.id,'torso'),/already_equipped/);
 assert.throws(()=>planEquip([bag,sample()],bag.id,'back'),/equipment_slot_occupied/);
 const crafted=scrap();
 assert.throws(()=>planEquip([crafted],crafted.id,'back'),/slot_incompatible/);
 assert.throws(()=>planEquip([bag],randomUUID(),'back'),/item_not_owned/);
 assert.ok(EQUIPMENT_SLOTS.includes('respiratory_filter'));
});
test('Equipped bag cannot be taken off when new four-slot limit would overflow',()=>{
 const bag=sample(),outfit=clothes();
 const packed=Array.from({length:5},()=>scrap());
 assert.equal(locationSummary([bag,outfit,...packed],'pack').maxSlots,10);
 assert.throws(()=>planTransfer([bag,outfit,...packed],bag.id,1,'home_chest',randomUUID()),
   /pack_slots_exceeded/);
 assert.throws(()=>planTransfer([bag,outfit,...packed],bag.id,1,'pack',randomUUID()),
   /pack_slots_exceeded/);
});
test('Pack and chest overflow are enforced independently of mass',()=>{
 const packed=Array.from({length:4},()=>scrap());
 const waiting=scrap({location:'home_chest'});
 assert.equal(locationSummary(packed,'pack').maxSlots,4);
 assert.throws(()=>planTransfer([...packed,waiting],waiting.id,1,'pack',randomUUID()),
   /pack_slots_exceeded/);
 const chest=Array.from({length:24},()=>scrap({location:'home_chest'}));
 const carried=scrap();
 assert.throws(()=>planTransfer([...chest,carried],carried.id,1,'home_chest',randomUUID()),
   /chest_slots_exceeded/);
});
test('Quantity validation, conservation, stack splitting and combining are unchanged',()=>{
 const ore=scrap({item_code:'test_ore',stackable:true,max_stack:10,quantity:7,
  location:'home_chest',current_durability:null,max_durability:null});
 assert.throws(()=>planTransfer([ore],ore.id,0,'pack',randomUUID()),/invalid_quantity/);
 assert.throws(()=>planTransfer([ore],ore.id,8,'pack',randomUUID()),/insufficient_quantity/);
 assert.throws(()=>planTransfer([ore],randomUUID(),1,'pack',randomUUID()),/item_not_owned/);
 const split=planTransfer([ore],ore.id,3,'pack',randomUUID());
 assert.equal(split.after.reduce((n,x)=>n+x.quantity,0),7);
 assert.equal(split.after.find(x=>x.location==='pack')?.equipment_slot,null);
 assert.equal(split.edits[1].kind,'insert');
 const packStack=split.after.find(x=>x.location==='pack')!;
 const merged=planTransfer(split.after,ore.id,4,'pack',randomUUID());
 assert.equal(merged.after.find(x=>x.id===packStack.id)?.quantity,7);
 assert.equal(merged.after.reduce((n,x)=>n+x.quantity,0),7);
});
test('Physical limits still apply when slots are free',()=>{
 const heavy=scrap({weight_kg:25,location:'home_chest'});
 assert.throws(()=>planTransfer([heavy],heavy.id,1,'pack',randomUUID()),
  /pack_capacity_exceeded/);
 const huge=scrap({volume_l:7,location:'home_chest'});
 assert.throws(()=>planTransfer([huge],huge.id,1,'pack',randomUUID()),
  /pack_capacity_exceeded/);
});
test('UI provides equipped silhouette, clickable inspection, Shift-click and drag targets',()=>{
 const ui=readFileSync(resolve(import.meta.dirname,'../apps/web/src/lib/InventoryPanel.svelte'),'utf8');
 assert.ok(ui.includes('class="equipment-silhouette"'));
 assert.ok(ui.includes('equipmentSlots'));
 assert.ok(ui.includes('class="equip-socket filled"'));
 assert.ok(ui.includes('class="equip-socket empty"'));
 assert.ok(ui.includes('class="item-slot occupied"'));
 assert.ok(ui.includes('class="item-slot vacant"'));
 assert.ok(ui.includes('grid-template-columns:repeat(6,minmax(0,1fr))'));
 assert.ok(ui.includes('repeat(4,minmax(0,1fr))'));
 assert.ok(ui.includes('Array.from({length:snapshot.pack.maxSlots}'));
 assert.ok(ui.includes('Array.from({length:snapshot.chest.maxSlots}'));
 assert.ok(ui.includes('class:selected={selectedId===item.id}'));
 assert.ok(ui.includes('aria-pressed={selectedId===item.id}'));
 assert.ok(ui.includes('event.shiftKey'));
 assert.ok(ui.includes('ondragstart={event=>startDrag(event,item)}'));
 assert.ok(ui.includes("ondrop={event=>onDrop(event,'pack')}"));
 assert.ok(ui.includes("ondrop={event=>onDrop(event,'home_chest')}"));
 assert.ok(ui.includes("onDrop(event,'equipped',slot.id)"));
 assert.ok(ui.includes('aria-label="Selected item description"'));
 assert.ok(ui.includes('{selected.description}'));
 assert.ok(ui.includes('{itemType(selected)}'));
 assert.ok(ui.includes('{itemBenefit(selected)}'));
 assert.ok(ui.includes('Store in chest'));
 assert.ok(ui.includes('Take into inventory'));
 assert.ok(ui.includes('Unequip to inventory'));
 assert.ok(ui.includes('Items carried: {snapshot.pack.slotsUsed} / {snapshot.pack.maxSlots}'));
 assert.ok(ui.includes('Stored: {snapshot.chest.slotsUsed} / {snapshot.chest.maxSlots}'));
 assert.ok(ui.includes('Inventory endpoint missing (HTTP 404)'));
 assert.ok(ui.includes('Inventory server error (HTTP 500)'));
 assert.ok(ui.includes('inventory_schema_missing'));
 assert.ok(ui.includes('inventory_not_initialized'));
 assert.ok(ui.includes('Inventory API is unreachable (HTTP '));
 assert.ok(ui.includes('Inventory returned an invalid response'));
 assert.ok(!ui.includes("'Inventory is unavailable.'"));
});
test('Catalogue uses exact approved copy; new migration respects owner 4+6 rule',()=>{
 const base=readFileSync(resolve(import.meta.dirname,'../db/migrations/0011_inventory_foundation.sql'),'utf8');
 const sql=readFileSync(resolve(import.meta.dirname,'../db/migrations/0012_equipment_slots.sql'),'utf8');
 assert.ok(base.includes("'basic_clothes','Daily Worker Clothes','clothing'"));
 assert.ok(base.includes("'crude_small_bag','Simple Bag','bag'"));
 assert.ok(base.includes("The cloth''s stiff with old grime, the seams barely holding."));
 assert.ok(base.includes("Just don''t trust it with anything too heavy."));
 assert.ok(sql.includes("SET equip_slot='back',carry_slots_bonus=6"));
 assert.ok(sql.includes("SET equip_slot='torso'"));
 assert.ok(sql.includes('NOT EXISTS('));
 assert.ok(sql.includes("location='equipped'"));
 assert.ok(sql.includes('idx_pall_equipment_owner_slot'));
 const migrate=readFileSync(resolve(import.meta.dirname,'inventory-migrate.mjs'),'utf8');
 assert.ok(migrate.includes('0012_equipment_slots.sql'));
});
test('Owner starter illustrations remain genuine optimized WebP assets',()=>{
 const ui=readFileSync(resolve(import.meta.dirname,'../apps/web/src/lib/InventoryPanel.svelte'),'utf8');
 assert.ok(ui.includes("'/items/daily-worker-clothes.webp'"));
 assert.ok(ui.includes("'/items/simple-bag.webp'"));
 assert.ok(ui.includes('class="item-art"'));
 assert.ok(ui.includes('class="inspection-art"'));
 for(const [name,expected] of [
  ['simple-bag.webp','fcfff89beb0ae01b16945bb87df1c8ddc92f4c8608769ac121566515e9ff999b'],
  ['daily-worker-clothes.webp','f3fe0210b9d6317d15752c5785c0fb6f6eac2e863eac54a8dfe3f2c9c25c0bc5']
 ] as const){
  const img=readFileSync(resolve(import.meta.dirname,'../apps/web/static/items',name));
  assert.equal(img.subarray(0,4).toString(),'RIFF');
  assert.equal(img.subarray(8,12).toString(),'WEBP');
  assert.equal(createHash('sha256').update(img).digest('hex'),expected);
 }
});
