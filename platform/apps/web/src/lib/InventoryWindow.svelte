<script lang="ts">
 import type {InventorySnapshot,Item,EquipSlot,Place} from './inventory-types';
 import {measure} from './inventory-types';
 import ItemGrid from './ItemGrid.svelte';
 import EquipmentSlots from './EquipmentSlots.svelte';
 import EquipmentStats from './EquipmentStats.svelte';
 import ItemInspection from './ItemInspection.svelte';
 let {snapshot,selected,selectedId,pending,quantity,onQuantity,onSelect,onEquip,onTransfer,
      onDragStart,onDrop}:{
  snapshot:InventorySnapshot;selected:Item|null;selectedId:string|null;
  pending:boolean;quantity:number;onQuantity:(id:string,n:number)=>void;
  onSelect:(item:Item,shift:boolean)=>void;
  onEquip:(item:Item,slot:EquipSlot)=>void;
  onTransfer:(item:Item,to:'pack'|'home_chest')=>void;
  onDragStart:(event:DragEvent,item:Item)=>void;
  onDrop:(event:DragEvent,place:Place,slot?:EquipSlot)=>void
 }=$props();
 const mySelected=$derived(selected&&
   (snapshot.pack.items.some(x=>x.id===selected.id)||
    snapshot.equipment.items.some(x=>x.id===selected.id))?selected:null);
 const selectedPlace=$derived(mySelected&&snapshot.equipment.items.some(x=>x.id===mySelected.id)
  ?'equipped' as const:'pack' as const);
</script>
<div class="inventory-window" aria-label="Personal inventory and equipment">
 <section class="inventory-section equipment-card" aria-label="Equipped gear">
  <h3>Equipment</h3>
  <EquipmentSlots items={snapshot.equipment.items} {selectedId} selected={mySelected}
    {pending} {onSelect} {onEquip} {onDragStart} {onDrop}/>
  <EquipmentStats bonuses={snapshot.bonuses}/>
 </section>
 <section class="inventory-section pack-card" aria-label="Inventory">
  <header class="grid-heading">
   <h3>Inventory</h3>
   <span>{snapshot.equipment.items.some(x=>x.equipmentSlot==='back'&&x.carrySlotsBonus>0)
    ?'Bag equipped':'No bag equipped'}</span>
  </header>
  <ItemGrid items={snapshot.pack.items} slots={snapshot.pack.maxSlots}
    place="pack" {selectedId} {pending} {onSelect} {onDragStart} {onDrop}/>
  <p class="grid-footer">
   <span>Items carried: {snapshot.pack.slotsUsed} / {snapshot.pack.maxSlots}</span>
   <span>{measure(snapshot.pack.weightKg)} / {measure(snapshot.pack.maxWeightKg)} kg</span>
  </p>
  <p class="grid-footer">Volume: {measure(snapshot.pack.volumeL)} / {measure(snapshot.pack.maxVolumeL)} L</p>
  {#if snapshot.pack.overCapacity}<p class="inventory-error">Carrying capacity exceeded.</p>{/if}
 </section>
 <ItemInspection selected={mySelected} place={selectedPlace} {pending}
   storageEnabled={snapshot.storageEnabled} {quantity}
   equipped={snapshot.equipment.items} {onQuantity} {onTransfer} {onEquip}/>
</div>
