/** Owned item instances, equipment sockets, carried capacity and atomic move plans.
 * Mass/volume allowances remain playtest values. No combat modifiers yet.
 */
export const EQUIPMENT_SLOTS=[
 'head','face','torso','hands','pants','feet','back','primary_weapon',
 'secondary_weapon','respiratory_filter','accessory_1','accessory_2'
] as const;
export type EquipmentSlot=typeof EQUIPMENT_SLOTS[number];
export type ItemLocation='pack'|'home_chest'|'equipped';
export type StorageLocation='pack'|'home_chest';
export type InventoryRow={
 id:string;item_code:string;location:ItemLocation;equipment_slot:EquipmentSlot|null;
 equip_slot:EquipmentSlot|null;quantity:number;
 quality_tier:number;current_durability:number|null;max_durability:number|null;
 grant_key:string|null;
 name:string;category:string;description:string;stackable:boolean;
 max_stack:number;weight_kg:string|number;volume_l:string|number;
 carry_volume_bonus_l:string|number;carry_slots_bonus:number;
 rarity_label:string;armour_rating:number;design_status:string;
};
export type Edit=
  |{kind:'update';id:string;quantity:number;location:ItemLocation;equipmentSlot:EquipmentSlot|null}
  |{kind:'remove';id:string}
  |{kind:'insert';id:string;sourceId:string;quantity:number;location:StorageLocation};
export class InventoryInvalidAction extends Error{}
const round=(n:number)=>Math.round((n+Number.EPSILON)*1000)/1000;
const mass=(v:string|number)=>Number(v);
export const PLAYTEST_CAPACITY={
 packBaseKg:20,packBaseL:5,packBaseSlots:4,
 chestKg:120,chestL:200,chestSlots:24
} as const;
export function locationSummary(rows:InventoryRow[],location:StorageLocation){
 const selected=rows.filter(x=>x.location===location);
 const equipped=rows.filter(x=>x.location==='equipped');
 const slotsUsed=selected.length;
 const maxSlots=location==='pack'
   ?PLAYTEST_CAPACITY.packBaseSlots+
     equipped.reduce((t,x)=>t+x.carry_slots_bonus*x.quantity,0)
   :PLAYTEST_CAPACITY.chestSlots;
 // Worn equipment counts as carried mass, but does not consume bag volume/slots.
 const weightKg=round([...selected,...(location==='pack'?equipped:[])]
   .reduce((t,x)=>t+mass(x.weight_kg)*x.quantity,0));
 const volumeL=round(selected.reduce((t,x)=>t+mass(x.volume_l)*x.quantity,0));
 const maxWeightKg=location==='pack'?PLAYTEST_CAPACITY.packBaseKg:PLAYTEST_CAPACITY.chestKg;
 const maxVolumeL=location==='pack'
   ?round(PLAYTEST_CAPACITY.packBaseL+
      equipped.reduce((t,x)=>t+mass(x.carry_volume_bonus_l)*x.quantity,0))
   :PLAYTEST_CAPACITY.chestL;
 return {slotsUsed,maxSlots,weightKg,volumeL,maxWeightKg,maxVolumeL,
   overCapacity:slotsUsed>maxSlots||
     weightKg>maxWeightKg+.00001||volumeL>maxVolumeL+.00001};
}
export function inventoryView(rows:InventoryRow[],revision:number,storageEnabled:boolean){
 const mapRow=(x:InventoryRow)=>({
  id:x.id,code:x.item_code,name:x.name,category:x.category,
  description:x.description,quantity:x.quantity,stackable:x.stackable,
  maxStack:x.max_stack,qualityTier:x.quality_tier,
  weightKg:mass(x.weight_kg),volumeL:mass(x.volume_l),
  carryVolumeBonusL:mass(x.carry_volume_bonus_l),
  carrySlotsBonus:x.carry_slots_bonus,equipSlot:x.equip_slot,
  equipmentSlot:x.equipment_slot,
  rarity:x.rarity_label,armour:x.armour_rating,
  currentDurability:x.current_durability,maxDurability:x.max_durability,
  designStatus:x.design_status
 });
 return {revision,storageEnabled,
  pack:{...locationSummary(rows,'pack'),
    items:rows.filter(x=>x.location==='pack').map(mapRow)},
  chest:{...locationSummary(rows,'home_chest'),
    items:rows.filter(x=>x.location==='home_chest').map(mapRow)},
  equipment:{items:rows.filter(x=>x.location==='equipped').map(mapRow)}
 };
}
function verifyCapacity(after:InventoryRow[]){
 const pack=locationSummary(after,'pack');
 const chest=locationSummary(after,'home_chest');
 if(pack.slotsUsed>pack.maxSlots)
   throw new InventoryInvalidAction('pack_slots_exceeded');
 if(chest.slotsUsed>chest.maxSlots)
   throw new InventoryInvalidAction('chest_slots_exceeded');
 if(pack.overCapacity)throw new InventoryInvalidAction('pack_capacity_exceeded');
 if(chest.overCapacity)throw new InventoryInvalidAction('chest_capacity_exceeded');
}
function update(id:string,quantity:number,location:ItemLocation,
 equipmentSlot:EquipmentSlot|null):Edit{
 return {kind:'update',id,quantity,location,equipmentSlot};
}
export function planEquip(rows:InventoryRow[],id:string,slot:EquipmentSlot){
 const source=rows.find(x=>x.id===id);
 if(!source)throw new InventoryInvalidAction('item_not_owned');
 if(!EQUIPMENT_SLOTS.includes(slot))throw new InventoryInvalidAction('invalid_equipment_slot');
 if(source.location==='equipped')throw new InventoryInvalidAction('already_equipped');
 if(source.equip_slot!==slot)throw new InventoryInvalidAction('slot_incompatible');
 if(source.stackable||source.quantity!==1)throw new InventoryInvalidAction('item_not_equippable');
 if(rows.some(x=>x.location==='equipped'&&x.equipment_slot===slot))
   throw new InventoryInvalidAction('equipment_slot_occupied');
 const after=rows.map(x=>({...x}));
 const item=after.find(x=>x.id===id)!;
 item.location='equipped';
 item.equipment_slot=slot;
 verifyCapacity(after);
 return {edits:[update(item.id,1,'equipped',slot)],after};
}
export function planTransfer(rows:InventoryRow[],id:string,quantity:number,
  to:StorageLocation,newId:string):{edits:Edit[];after:InventoryRow[]}{
 if(!Number.isSafeInteger(quantity)||quantity<=0)
   throw new InventoryInvalidAction('invalid_quantity');
 const original=rows.find(x=>x.id===id);
 if(!original)throw new InventoryInvalidAction('item_not_owned');
 if(original.location===to)throw new InventoryInvalidAction('already_in_destination');
 if(quantity>original.quantity)throw new InventoryInvalidAction('insufficient_quantity');
 if(!original.stackable&&quantity!==1)
   throw new InventoryInvalidAction('nonstackable_quantity');
 if(original.location==='equipped'&&quantity!==1)
   throw new InventoryInvalidAction('nonstackable_quantity');
 const after=rows.map(x=>({...x}));
 const source=after.find(x=>x.id===id)!;
 const edits:Edit[]=[];
 let outstanding=quantity;
 if(source.stackable){
  for(const target of after){
   if(outstanding===0)break;
   if(target.location!==to||target.item_code!==source.item_code||
      target.quality_tier!==source.quality_tier||
      target.current_durability!==source.current_durability||
      target.max_durability!==source.max_durability)continue;
   const amount=Math.min(outstanding,target.max_stack-target.quantity);
   if(amount<=0)continue;
   target.quantity+=amount;
   outstanding-=amount;
   edits.push(update(target.id,target.quantity,to,null));
  }
 }
 if(outstanding===0){
  if(quantity===source.quantity){
   edits.push({kind:'remove',id:source.id});
   after.splice(after.indexOf(source),1);
  }else{
   source.quantity-=quantity;
   edits.push(update(source.id,source.quantity,source.location,source.equipment_slot));
  }
 }else if(quantity===source.quantity){
  source.quantity=outstanding;
  source.location=to;
  source.equipment_slot=null;
  edits.push(update(source.id,source.quantity,to,null));
 }else{
  source.quantity-=quantity;
  edits.push(update(source.id,source.quantity,source.location,source.equipment_slot));
  if(outstanding>source.max_stack)throw new InventoryInvalidAction('stack_exceeds_limit');
  after.push({...source,id:newId,grant_key:null,location:to,
    equipment_slot:null,quantity:outstanding});
  edits.push({kind:'insert',id:newId,sourceId:source.id,quantity:outstanding,location:to});
 }
 verifyCapacity(after);
 return {edits,after};
}
