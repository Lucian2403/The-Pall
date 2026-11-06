import assert from 'node:assert/strict';
import {test} from 'node:test';
import {randomUUID,createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {
  InventoryInvalidAction,inventoryView,locationSummary,planTransfer
} from '../apps/api/src/inventory-model.ts';
import type {InventoryRow} from '../apps/api/src/inventory-model.ts';

const sample=(overrides:Partial<InventoryRow>={}):InventoryRow=>({
 id:randomUUID(),item_code:'crude_small_bag',location:'pack',quantity:1,
 quality_tier:1,current_durability:100,max_durability:100,grant_key:null,
 name:'Crude Small Bag',category:'container',description:'Test fixture',
 stackable:false,max_stack:1,weight_kg:'0.800',volume_l:'2.000',
 carry_volume_bonus_l:'12.000',carry_slots_bonus:8,
 rarity_label:'Common',armour_rating:0,design_status:'PROVISIONAL',...overrides
});
test('Shared starter bag grants volume, not unexplained strength',()=>{
 const bag=sample(),clothes=sample({
  item_code:'basic_clothes',name:'Daily Worker Clothes',category:'clothing',
  weight_kg:'1.200',volume_l:'2.000',carry_volume_bonus_l:'0',carry_slots_bonus:0
 });
 const pack=locationSummary([bag,clothes],'pack');
 assert.deepEqual(pack,{
  slotsUsed:2,maxSlots:24,weightKg:2,volumeL:4,
  maxWeightKg:20,maxVolumeL:17,overCapacity:false
 });
 const view=inventoryView([bag,clothes],0,false);
 assert.equal(view.storageEnabled,false);
 assert.equal(view.pack.items.length,2);
 assert.equal(view.chest.items.length,0);
 assert.equal(view.pack.items[0].designStatus,'PROVISIONAL');
 assert.equal(view.pack.items[0].carrySlotsBonus,8);
 assert.equal(view.pack.items[0].rarity,'Common');
 assert.equal(view.pack.items[0].armour,0);
});
test('Moving the starter bag to chest removes its capacity bonus and preserves identity',()=>{
 const bag=sample();
 const clothes=sample({
  item_code:'basic_clothes',weight_kg:'1.200',volume_l:'2.000',
  carry_volume_bonus_l:0,carry_slots_bonus:0
 });
 const planned=planTransfer([bag,clothes],bag.id,1,'home_chest',randomUUID());
 assert.deepEqual(planned.edits,[{
  kind:'update',id:bag.id,quantity:1,location:'home_chest'
 }]);
 assert.equal(locationSummary(planned.after,'pack').maxVolumeL,5);
 assert.equal(locationSummary(planned.after,'pack').maxSlots,16);
 assert.equal(locationSummary(planned.after,'home_chest').volumeL,2);
 assert.equal(bag.location,'pack','Plan never mutates the original');
});
test('Reject over-capacity transfers, wrong quantities and false item IDs',()=>{
 const bag=sample({location:'home_chest'});
 const bulky=sample({id:randomUUID(),item_code:'test_box',name:'Box',
  category:'misc',location:'home_chest',weight_kg:1,volume_l:7,
  carry_volume_bonus_l:0,carry_slots_bonus:0,grant_key:null});
 assert.throws(()=>planTransfer([bag,bulky],bulky.id,1,'pack',randomUUID()),
  /pack_capacity_exceeded/);
 assert.throws(()=>planTransfer([bag],bag.id,2,'pack',randomUUID()),
  /insufficient_quantity/);
 assert.throws(()=>planTransfer([bag],'not-an-item',1,'pack',randomUUID()),
  /item_not_owned/);
 assert.throws(()=>planTransfer([bag],bag.id,1,'home_chest',randomUUID()),
  /already_in_destination/);
 assert.throws(()=>planTransfer([bag],bag.id,0,'pack',randomUUID()),
  /invalid_quantity/);
});
test('Partial stack movement preserves quantity and creates exactly one new stack',()=>{
 const ore=sample({item_code:'test_ore',name:'Test Ore',category:'test',
  stackable:true,max_stack:10,quantity:7,location:'home_chest',
  weight_kg:'.100',volume_l:'.050',carry_volume_bonus_l:0,carry_slots_bonus:0,
  current_durability:null,max_durability:null});
 const newId=randomUUID();
 const plan=planTransfer([ore],ore.id,3,'pack',newId);
 assert.deepEqual(plan.after.map(x=>[x.id,x.location,x.quantity]),[
  [ore.id,'home_chest',4],[newId,'pack',3]
 ]);
 assert.equal(plan.after.reduce((sum,x)=>sum+x.quantity,0),7);
 assert.equal(ore.quantity,7);
 assert.equal(plan.edits[1].kind,'insert');
});
test('Merging stacks never exceeds max_stack or duplicates quantities',()=>{
 const a=sample({item_code:'test_salt',name:'Salt',category:'test',
  stackable:true,max_stack:10,quantity:6,weight_kg:'.100',volume_l:'.020',
  carry_volume_bonus_l:0,carry_slots_bonus:0,current_durability:null,max_durability:null,
  location:'home_chest'});
 const b={...a,id:randomUUID(),quantity:8,location:'pack' as const};
 const plan=planTransfer([a,b],a.id,6,'pack',randomUUID());
 assert.deepEqual(plan.after.map(x=>[x.id,x.location,x.quantity]),[
  [a.id,'pack',4],[b.id,'pack',10]
 ]);
 assert.equal(plan.after.reduce((sum,x)=>sum+x.quantity,0),14);
 assert.equal(plan.edits[0].kind,'update');
 assert.equal(plan.edits[1].kind,'update');
});
test('Existing quantities and data quality are not treated as economy rarity',()=>{
 const item=sample({quality_tier:1,quantity:1});
 const view=inventoryView([item],3,true);
 assert.equal(view.pack.items[0].qualityTier,1);
 assert.equal(view.pack.items[0].maxDurability,100);
 assert.equal(view.revision,3);
 assert.equal(view.chest.maxWeightKg,120);
 assert.equal(view.chest.maxSlots,24);
});

test('Bag grants exactly eight carried slots and chest retains 24 slots',()=>{
 const bag=sample(),clothes=sample({
  item_code:'basic_clothes',name:'Daily Worker Clothes',category:'clothing',
  carry_volume_bonus_l:0,carry_slots_bonus:0
 });
 const carried=locationSummary([bag,clothes],'pack');
 assert.equal(carried.slotsUsed,2);
 assert.equal(carried.maxSlots,24);
 const stored=planTransfer([bag,clothes],bag.id,1,'home_chest',randomUUID());
 assert.equal(locationSummary(stored.after,'pack').maxSlots,16);
 assert.equal(locationSummary(stored.after,'home_chest').maxSlots,24);
 const recovered=planTransfer(stored.after,bag.id,1,'pack',randomUUID());
 assert.equal(locationSummary(recovered.after,'pack').maxSlots,24);
});

test('Slot limits are enforced independently of generous weight/volume capacity',()=>{
 const packed=Array.from({length:16},()=>sample({
  item_code:'test_scrap',name:'Scrap',category:'misc',
  weight_kg:.001,volume_l:.001,carry_volume_bonus_l:0,carry_slots_bonus:0
 }));
 const chestItem=sample({id:randomUUID(),item_code:'test_wire',
  location:'home_chest',weight_kg:.001,volume_l:.001,
  carry_volume_bonus_l:0,carry_slots_bonus:0});
 assert.equal(locationSummary(packed,'pack').maxSlots,16);
 assert.throws(()=>planTransfer([...packed,chestItem],chestItem.id,1,
  'pack',randomUUID()),/pack_slots_exceeded/);
 const filledChest=Array.from({length:24},()=>sample({
  item_code:'test_scrap',location:'home_chest',weight_kg:.001,volume_l:.001,
  carry_volume_bonus_l:0,carry_slots_bonus:0
 }));
 const carry=sample({item_code:'test_cord',weight_kg:.001,volume_l:.001,
  carry_volume_bonus_l:0,carry_slots_bonus:0});
 assert.equal(locationSummary(filledChest,'home_chest').maxSlots,24);
 assert.throws(()=>planTransfer([...filledChest,carry],carry.id,1,
  'home_chest',randomUUID()),/chest_slots_exceeded/);
});

test('Grid UI shows 6-column carried and chest slots with a selected-item description',()=>{
 const ui=readFileSync(resolve(import.meta.dirname,'../apps/web/src/lib/InventoryPanel.svelte'),'utf8');
 assert.ok(ui.includes('grid-template-columns:repeat(6,minmax(0,1fr))'));
 assert.ok(ui.includes('Array.from({length:snapshot.pack.maxSlots}'));
 assert.ok(ui.includes('Array.from({length:snapshot.chest.maxSlots}'));
 assert.ok(ui.includes('class="item-slot occupied"'));
 assert.ok(ui.includes('class="item-slot vacant"'));
 assert.ok(ui.includes('class:selected={selectedId===item.id}'));
 assert.ok(ui.includes('aria-pressed={selectedId===item.id}'));
 assert.ok(ui.includes('aria-label="Selected item description"'));
 assert.ok(ui.includes('{selected.description}'));
 assert.ok(ui.includes("'/items/daily-worker-clothes.webp'"));
 assert.ok(ui.includes("'/items/simple-bag.webp'"));
 assert.ok(ui.includes('class="item-art"'));
 assert.ok(ui.includes('class="inspection-art"'));
 for(const [name,expected] of [
  ['simple-bag.webp','fcfff89beb0ae01b16945bb87df1c8ddc92f4c8608769ac121566515e9ff999b'],
  ['daily-worker-clothes.webp','f3fe0210b9d6317d15752c5785c0fb6f6eac2e863eac54a8dfe3f2c9c25c0bc5']
 ] as const){
   const image=readFileSync(resolve(import.meta.dirname,'../apps/web/static/items',name));
   assert.equal(image.subarray(0,4).toString(),'RIFF','Image must be real WebP');
   assert.equal(image.subarray(8,12).toString(),'WEBP','Image must be real WebP');
   assert.equal(createHash('sha256').update(image).digest('hex'),expected,
     'Starter cutouts must match the owner-supplied optimized artwork');
 }
 assert.ok(ui.includes('{itemType(selected)}'));
 assert.ok(ui.includes('{itemBenefit(selected)}'));
 assert.ok(ui.includes('Store in chest'));
 assert.ok(ui.includes('Take into inventory'));
 assert.ok(ui.includes('Items carried: {snapshot.pack.slotsUsed} / {snapshot.pack.maxSlots}'));
 assert.ok(ui.includes('Stored: {snapshot.chest.slotsUsed} / {snapshot.chest.maxSlots}'));
 assert.ok(!ui.includes('class="item-list"'),'Item presentation must not fall back to a list layout');
 assert.ok(ui.includes('Inventory endpoint missing (HTTP 404)'));
 assert.ok(ui.includes('Inventory server error (HTTP 500)'));
 assert.ok(ui.includes('inventory_schema_missing'));
 assert.ok(ui.includes('inventory_not_initialized'));
 assert.ok(ui.includes('Inventory API is unreachable (HTTP '));
 assert.ok(ui.includes('Inventory returned an invalid response'));
 assert.ok(!ui.includes("'Inventory is unavailable.'"),
   'A generic error must not hide missing API routes or failed database queries');
});
test('Item catalogue persists exact approved names, descriptive copy and bonuses',()=>{
 const sql=readFileSync(resolve(import.meta.dirname,'../db/migrations/0011_inventory_foundation.sql'),'utf8');
 assert.ok(sql.includes("'basic_clothes','Daily Worker Clothes','clothing'"));
 assert.ok(sql.includes("'crude_small_bag','Simple Bag','bag'"));
 assert.ok(sql.includes("The cloth''s stiff with old grime, the seams barely holding."));
 assert.ok(sql.includes("They''ve seen too many long shifts and too few washes."));
 assert.ok(sql.includes("Just don''t trust it with anything too heavy."));
 assert.ok(sql.includes("12.000,8,'Common',0"));
 assert.ok(sql.includes("0,0,'Common',0"));
 assert.ok(sql.includes("ON CONFLICT(code) DO UPDATE SET"));
 assert.ok(sql.includes("ALTER TABLE pall_item_definitions"));
});
