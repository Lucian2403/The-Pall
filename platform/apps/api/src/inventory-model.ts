/** Inventory foundation — pure capacity, grouping and atomic transfer plan.
 * The mass/volume allowances are PLAYTEST CONSTANTS, not approved economy balance.
 * Equipped gear and modifiers belong to the subsequent equipment milestone.
 */
export type ItemLocation='pack'|'home_chest';
export type InventoryRow={
 id:string;item_code:string;location:ItemLocation;quantity:number;
 quality_tier:number;current_durability:number|null;max_durability:number|null;
 grant_key:string|null;
 name:string;category:string;description:string;stackable:boolean;
 max_stack:number;weight_kg:string|number;volume_l:string|number;
 carry_volume_bonus_l:string|number;design_status:string;
};
type Edit=
  |{kind:'update';id:string;quantity:number;location:ItemLocation}
  |{kind:'remove';id:string}
  |{kind:'insert';id:string;sourceId:string;quantity:number;location:ItemLocation};
export class InventoryInvalidAction extends Error{}
const round=(n:number)=>Math.round((n+Number.EPSILON)*1000)/1000;
const mass=(v:string|number)=>Number(v);
export const PLAYTEST_CAPACITY={
 packBaseKg:20,packBaseL:5,chestKg:120,chestL:200
} as const;
export function locationSummary(rows:InventoryRow[],location:ItemLocation){
 const selected=rows.filter(x=>x.location===location);
 const weightKg=round(selected.reduce((t,x)=>t+mass(x.weight_kg)*x.quantity,0));
 const volumeL=round(selected.reduce((t,x)=>t+mass(x.volume_l)*x.quantity,0));
 const maxWeightKg=location==='pack'?PLAYTEST_CAPACITY.packBaseKg:PLAYTEST_CAPACITY.chestKg;
 const maxVolumeL=location==='pack'
   ?round(PLAYTEST_CAPACITY.packBaseL+
      selected.reduce((t,x)=>t+mass(x.carry_volume_bonus_l)*x.quantity,0))
   :PLAYTEST_CAPACITY.chestL;
 return {weightKg,volumeL,maxWeightKg,maxVolumeL,
   overCapacity:weightKg>maxWeightKg+.00001||volumeL>maxVolumeL+.00001};
}
export function inventoryView(rows:InventoryRow[],revision:number,storageEnabled:boolean){
 const mapRow=(x:InventoryRow)=>({
  id:x.id,code:x.item_code,name:x.name,category:x.category,
  description:x.description,quantity:x.quantity,stackable:x.stackable,
  maxStack:x.max_stack,qualityTier:x.quality_tier,
  weightKg:mass(x.weight_kg),volumeL:mass(x.volume_l),
  carryVolumeBonusL:mass(x.carry_volume_bonus_l),
  currentDurability:x.current_durability,maxDurability:x.max_durability,
  designStatus:x.design_status
 });
 return {revision,storageEnabled,
  pack:{...locationSummary(rows,'pack'),
    items:rows.filter(x=>x.location==='pack').map(mapRow)},
  chest:{...locationSummary(rows,'home_chest'),
    items:rows.filter(x=>x.location==='home_chest').map(mapRow)}
 };
}
export function planTransfer(rows:InventoryRow[],id:string,quantity:number,
  to:ItemLocation,newId:string):{edits:Edit[];after:InventoryRow[]}{
 if(!Number.isSafeInteger(quantity)||quantity<=0)
   throw new InventoryInvalidAction('invalid_quantity');
 const original=rows.find(x=>x.id===id);
 if(!original)throw new InventoryInvalidAction('item_not_owned');
 if(original.location===to)throw new InventoryInvalidAction('already_in_destination');
 if(quantity>original.quantity)throw new InventoryInvalidAction('insufficient_quantity');
 if(!original.stackable&&quantity!==1)
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
   edits.push({kind:'update',id:target.id,quantity:target.quantity,location:to});
  }
 }
 if(outstanding===0){
  if(quantity===source.quantity){
   edits.push({kind:'remove',id:source.id});
   after.splice(after.indexOf(source),1);
  }else{
   source.quantity-=quantity;
   edits.push({kind:'update',id:source.id,quantity:source.quantity,location:source.location});
  }
 }else if(quantity===source.quantity){
  source.quantity=outstanding;
  source.location=to;
  edits.push({kind:'update',id:source.id,quantity:source.quantity,location:to});
 }else{
  source.quantity-=quantity;
  edits.push({kind:'update',id:source.id,quantity:source.quantity,location:source.location});
  if(outstanding>source.max_stack)throw new InventoryInvalidAction('stack_exceeds_limit');
  after.push({...source,id:newId,grant_key:null,location:to,quantity:outstanding});
  edits.push({kind:'insert',id:newId,sourceId:source.id,quantity:outstanding,location:to});
 }
 if(locationSummary(after,'pack').overCapacity)
   throw new InventoryInvalidAction('pack_capacity_exceeded');
 if(locationSummary(after,'home_chest').overCapacity)
   throw new InventoryInvalidAction('chest_capacity_exceeded');
 return {edits,after};
}
