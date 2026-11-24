import assert from 'node:assert/strict';
import {test} from 'node:test';
import {randomUUID,createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {get} from 'svelte/store';
import {
 gameWindows,selectWindowCharacter,openGameWindow,closeGameWindow,
 frontGameWindow,positionGameWindow,closeContextWindows,resetGameWindows
} from '../apps/web/src/lib/game-window-state.ts';
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
 rarity_label:'Common',armour_rating:0,design_status:'PROVISIONAL',
 damage_rating:0,pall_protection:0,ash_protection:0,carry_weight_bonus_kg:0,
 ...overrides
});
const clothes=(overrides:Partial<InventoryRow>={})=>sample({
 item_code:'basic_clothes',name:'Daily Worker Clothes',category:'clothing',
 equipment_slot:'torso',equip_slot:'torso',
 weight_kg:'1.200',volume_l:'2',carry_volume_bonus_l:0,carry_slots_bonus:0,
 ...overrides
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
 assert.ok(!EQUIPMENT_SLOTS.some(slot=>slot==='pants'),
  'Clothing is one torso-and-legs socket, never a separate pants socket');
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
test('Equipment bonuses follow worn items; carried and chest gear contribute nothing',()=>{
 const worn=[sample({carry_weight_bonus_kg:2,pall_protection:3,ash_protection:1}),
  clothes({armour_rating:4,damage_rating:0}),sample({
    item_code:'test_sword',category:'weapon',equipment_slot:'primary_weapon',
    equip_slot:'primary_weapon',damage_rating:9,carry_slots_bonus:0,
    carry_volume_bonus_l:0,weight_kg:1,pall_protection:2,ash_protection:0
  })];
 const inactive=sample({location:'home_chest',equipment_slot:null,
  armour_rating:90,damage_rating:99,pall_protection:99,ash_protection:99});
 const before=inventoryView([...worn,inactive],4,true);
 assert.deepEqual(before.bonuses,{
  armour:4,weaponDamage:9,pallProtection:5,ashProtection:1,
  maxWeightKg:22,inventorySlots:10,maxVolumeL:17
 });
 const after=planTransfer([...worn,inactive],worn[0].id,1,'home_chest',randomUUID());
 assert.deepEqual(inventoryView(after.after,5,true).bonuses,{
  armour:4,weaponDamage:9,pallProtection:2,ashProtection:0,
  maxWeightKg:20,inventorySlots:4,maxVolumeL:5
 });
 assert.equal(inventoryView([clothes()],0,true).bonuses.weaponDamage,null,
  'Unarmed damage must never be fabricated from the equipment panel');
});
test('Inventory and Home Chest use separate typed windows with one authoritative controller',()=>{
 const read=(name:string)=>readFileSync(resolve(import.meta.dirname,
  '../apps/web/src/lib',name),'utf8');
 const shell=read('TutorialShell.svelte');
 const home=readFileSync(resolve(import.meta.dirname,
  '../apps/web/src/routes/characters/[id]/home/+page.svelte'),'utf8');
 const registry=read('game-window-state.ts');
 const window=read('GameWindow.svelte');
 const workspace=read('InventoryWorkspace.svelte');
 const inventory=read('InventoryWindow.svelte');
 const storage=read('StorageWindow.svelte');
 const slots=read('EquipmentSlots.svelte');
 const grid=read('ItemGrid.svelte');
 const inspect=read('ItemInspection.svelte');
 const stats=read('EquipmentStats.svelte');
 const palette=read('inventory-windows.css');
 for(const file of [registry,window,workspace,inventory,storage,slots,grid,inspect,stats])
   assert.ok(file.length>250,'No empty placeholder windows');
 assert.ok(shell.includes("openGameWindow(character.id,'inventory')"));
 assert.ok(shell.includes('data-open-inventory'));
 assert.ok(shell.includes('<InventoryWorkspace characterId={character.id}'));
 assert.ok(home.includes("openGameWindow(id,'storage')"));
 assert.ok(home.includes('data-open-home-chest'));
 assert.ok(!home.includes('<InventoryPanel'));
 assert.ok(!home.includes('<dialog bind:this={overlayDialog}'));
 assert.ok(registry.includes('gameWindows=writable'));
 assert.ok(registry.includes('selectWindowCharacter'));
 assert.ok(registry.includes('closeContextWindows'));
 assert.ok(registry.includes('frontGameWindow'));
 assert.ok(window.includes('setPointerCapture'));
 assert.ok(window.includes('onkeydown={keyboard}'));
 assert.ok(workspace.includes('onkeydown={keys}'));
 assert.ok(workspace.includes('storage-context'));
 assert.ok(workspace.includes('x-pall-storage-context'));
 assert.ok(workspace.includes('onDestroy('));
 assert.ok(workspace.includes('contextToken'));
 assert.ok(workspace.includes('<InventoryWindow'));
 assert.ok(workspace.includes('<StorageWindow'));
 assert.ok(workspace.includes('onTransfer'));
 assert.ok(workspace.includes('onDrop'));
 assert.ok(workspace.includes('requestId:crypto.randomUUID()'));
 assert.ok(workspace.includes('expectedRevision:snapshot.revision'));
 assert.ok(inventory.includes('<EquipmentSlots'));
 assert.ok(inventory.includes('<EquipmentStats'));
 assert.ok(inventory.includes('<ItemGrid'));
 assert.ok(inventory.includes('<ItemInspection'));
 assert.ok(storage.includes('Home Chest'));
 assert.ok(storage.includes('<ItemGrid'));
 assert.ok(storage.includes('<ItemInspection'));
 assert.ok(slots.includes('class="equipment-silhouette"'));
 assert.ok(slots.includes("label:'Body'")===false,'Equipment labels live in one typed model');
 assert.ok(slots.includes('class:outfit={slot.id===\'torso\'}'));
 assert.ok(grid.includes('class="item-slot occupied"'));
 assert.ok(grid.includes('class="item-slot vacant"'));
 assert.ok(grid.includes('event.shiftKey'));
 assert.ok(grid.includes('ondragstart={event=>onDragStart(event,item)}'));
 assert.ok(inspect.includes('aria-label="Selected item description"'));
 assert.ok(inspect.includes('{selected.description}'));
 assert.ok(inspect.includes('Store in chest'));
 assert.ok(inspect.includes('Take into inventory'));
 assert.ok(inspect.includes('Unequip to inventory'));
 for(const label of ['Armor','Damage','Pall Protection','Ash Protection','Max Weight',
    'Inventory Slots','Bag Volume'])assert.ok(stats.includes(label));
 assert.ok(palette.includes('.bonus-grid')&&!palette.includes('border:2px ridge'),
   'Equipment stats should be compact rather than individually framed tiles');
 const backend=readFileSync(resolve(import.meta.dirname,
   '../apps/api/src/inventory-routes.ts'),'utf8');
 assert.ok(backend.includes("source?.location==='home_chest'"));
 assert.ok(backend.includes("storage_context_required"));
 assert.ok(backend.includes('keepPrivate(rows.rows,storageEnabled)'));
 assert.ok(!backend.includes('if(!homeReady)'));
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
 assert.ok(migrate.includes('0013_equipment_stats_and_clothing.sql'));
 assert.ok(migrate.includes('0023_inventory_storage_context.sql'));
 const derived=readFileSync(resolve(import.meta.dirname,'../db/migrations/0013_equipment_stats_and_clothing.sql'),'utf8');
 assert.ok(derived.includes('ADD COLUMN IF NOT EXISTS pall_protection'));
 assert.ok(derived.includes('ADD COLUMN IF NOT EXISTS ash_protection'));
 assert.ok(derived.includes('ADD COLUMN IF NOT EXISTS damage_rating'));
 assert.ok(derived.includes('ADD COLUMN IF NOT EXISTS carry_weight_bonus_kg'));
 assert.ok(derived.includes("equip_slot='pants'"),'Do not silently discard historic pants gear');
 assert.ok(!derived.includes("'torso','hands','pants','feet'"));
});
test('Owner starter illustrations remain genuine optimized WebP assets',()=>{
 const types=readFileSync(resolve(import.meta.dirname,'../apps/web/src/lib/inventory-types.ts'),'utf8');
 const grid=readFileSync(resolve(import.meta.dirname,'../apps/web/src/lib/ItemGrid.svelte'),'utf8');
 const inspection=readFileSync(resolve(import.meta.dirname,'../apps/web/src/lib/ItemInspection.svelte'),'utf8');
 assert.ok(types.includes("'/items/daily-worker-clothes.webp'"));
 assert.ok(types.includes("'/items/simple-bag.webp'"));
 assert.ok(grid.includes('class="item-art"'));
 assert.ok(inspection.includes('class="inspection-art"'));
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

test('Window registry permits two unique windows but does not share state across characters',()=>{
 resetGameWindows();
 const first=randomUUID(),second=randomUUID();
 selectWindowCharacter(first);
 openGameWindow(first,'inventory');
 openGameWindow(first,'inventory');
 assert.deepEqual(get(gameWindows).windows.map(x=>x.id),['inventory']);
 openGameWindow(first,'storage');
 assert.deepEqual(get(gameWindows).windows.map(x=>x.id),['inventory','storage:home_chest']);
 const a=get(gameWindows).windows[0];
 const b=get(gameWindows).windows[1];
 assert.ok(a.z<b.z);
 frontGameWindow('inventory');
 assert.ok(get(gameWindows).windows[0].z>get(gameWindows).windows[1].z);
 positionGameWindow('inventory',97,121);
 assert.equal(get(gameWindows).windows[0].x,97);
 assert.equal(get(gameWindows).windows[0].y,121);
 closeContextWindows();
 assert.deepEqual(get(gameWindows).windows.map(x=>x.id),['inventory']);
 openGameWindow(first,'storage');
 closeGameWindow('inventory');
 assert.deepEqual(get(gameWindows).windows.map(x=>x.id),['storage:home_chest']);
 selectWindowCharacter(second);
 assert.deepEqual(get(gameWindows),{characterId:second,windows:[],mobileActive:null});
 resetGameWindows();
});
