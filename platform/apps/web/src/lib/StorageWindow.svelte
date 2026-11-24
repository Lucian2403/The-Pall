<script lang="ts">
 import type {InventorySnapshot,Item,Place,EquipSlot} from './inventory-types';
 import {measure} from './inventory-types';
 import ItemGrid from './ItemGrid.svelte';
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
 const mySelected=$derived(selected&&snapshot.chest.items.some(x=>x.id===selected.id)?selected:null);
</script>
<div class="storage-window" aria-label="Home Chest">
 <section class="inventory-section chest-card" aria-label="Home Chest">
  <header class="grid-heading"><h3>Home Chest</h3><span>Rented room</span></header>
  <ItemGrid items={snapshot.chest.items} slots={snapshot.chest.maxSlots}
    place="home_chest" {selectedId} {pending} {onSelect} {onDragStart} {onDrop}/>
  <p class="grid-footer">
   <span>Stored: {snapshot.chest.slotsUsed} / {snapshot.chest.maxSlots}</span>
   <span>{measure(snapshot.chest.weightKg)} / {measure(snapshot.chest.maxWeightKg)} kg</span>
  </p>
  <p class="grid-footer">Volume: {measure(snapshot.chest.volumeL)} / {measure(snapshot.chest.maxVolumeL)} L</p>
 </section>
 <ItemInspection selected={mySelected} place="home_chest" {pending}
   storageEnabled={snapshot.storageEnabled} {quantity}
   equipped={snapshot.equipment.items} {onQuantity} {onTransfer} {onEquip}/>
</div>
