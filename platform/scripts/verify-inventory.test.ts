import assert from 'node:assert/strict';
import {test} from 'node:test';
import {randomUUID} from 'node:crypto';
import {
  InventoryInvalidAction,inventoryView,locationSummary,planTransfer
} from '../apps/api/src/inventory-model.ts';
import type {InventoryRow} from '../apps/api/src/inventory-model.ts';

const sample=(overrides:Partial<InventoryRow>={}):InventoryRow=>({
 id:randomUUID(),item_code:'crude_small_bag',location:'pack',quantity:1,
 quality_tier:1,current_durability:100,max_durability:100,grant_key:null,
 name:'Crude Small Bag',category:'container',description:'Test fixture',
 stackable:false,max_stack:1,weight_kg:'0.800',volume_l:'2.000',
 carry_volume_bonus_l:'12.000',design_status:'PROVISIONAL',...overrides
});
test('Shared starter bag grants volume, not unexplained strength',()=>{
 const bag=sample(),clothes=sample({
  item_code:'basic_clothes',name:'Basic Clothes',category:'clothing',
  weight_kg:'1.200',volume_l:'2.000',carry_volume_bonus_l:'0'
 });
 const pack=locationSummary([bag,clothes],'pack');
 assert.deepEqual(pack,{
  weightKg:2,volumeL:4,maxWeightKg:20,maxVolumeL:17,overCapacity:false
 });
 const view=inventoryView([bag,clothes],0,false);
 assert.equal(view.storageEnabled,false);
 assert.equal(view.pack.items.length,2);
 assert.equal(view.chest.items.length,0);
 assert.equal(view.pack.items[0].designStatus,'PROVISIONAL');
});
test('Moving the starter bag to chest removes its capacity bonus and preserves identity',()=>{
 const bag=sample();
 const clothes=sample({
  item_code:'basic_clothes',weight_kg:'1.200',volume_l:'2.000',
  carry_volume_bonus_l:0
 });
 const planned=planTransfer([bag,clothes],bag.id,1,'home_chest',randomUUID());
 assert.deepEqual(planned.edits,[{
  kind:'update',id:bag.id,quantity:1,location:'home_chest'
 }]);
 assert.equal(locationSummary(planned.after,'pack').maxVolumeL,5);
 assert.equal(locationSummary(planned.after,'home_chest').volumeL,2);
 assert.equal(bag.location,'pack','Plan never mutates the original');
});
test('Reject over-capacity transfers, wrong quantities and false item IDs',()=>{
 const bag=sample({location:'home_chest'});
 const bulky=sample({id:randomUUID(),item_code:'test_box',name:'Box',
  category:'misc',location:'home_chest',weight_kg:1,volume_l:7,
  carry_volume_bonus_l:0,grant_key:null});
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
  weight_kg:'.100',volume_l:'.050',carry_volume_bonus_l:0,
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
  carry_volume_bonus_l:0,current_durability:null,max_durability:null,
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
});
