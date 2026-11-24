<script lang="ts">
 import type {Item,EquipSlot} from './inventory-types';
 import {equipmentSlots,itemImage,itemMark} from './inventory-types';
 let {items,selected,selectedId,pending,onSelect,onEquip,onDragStart,onDrop}:{
  items:Item[];selected:Item|null;selectedId:string|null;pending:boolean;
  onSelect:(item:Item,shift:boolean)=>void;
  onEquip:(item:Item,slot:EquipSlot)=>void;
  onDragStart:(event:DragEvent,item:Item)=>void;
  onDrop:(event:DragEvent,place:'equipped',slot:EquipSlot)=>void
 }=$props();
 function allowDrop(event:DragEvent){
  if(!pending&&event.dataTransfer?.types.includes('application/x-pall-item'))
   event.preventDefault();
 }
</script>
<div class="equipment-stage" role="group" aria-label="Human-shaped equipment layout">
 <svg class="equipment-silhouette" viewBox="0 0 240 360" aria-hidden="true">
  <circle cx="120" cy="37" r="23"/>
  <path d="M106 66 L82 81 L58 146 L72 159 L92 121 L94 208 L145 208 L146 121 L169 159 L181 146 L158 81 L134 66 Z"/>
  <path d="M94 211 L91 324 L107 332 L122 242 L132 332 L149 324 L145 211 Z"/>
  <path d="M91 325 L87 343 L110 343 L107 332 M132 332 L129 343 L153 343 L149 325"/>
 </svg>
 {#each equipmentSlots as slot (slot.id)}
  {@const item=items.find(x=>x.equipmentSlot===slot.id)}
  {#if item}
   <button type="button" class="equip-socket filled"
     style={'left:'+slot.x+'%;top:'+slot.y+'%'}
     class:selected={selectedId===item.id} class:outfit={slot.id==='torso'}
     draggable={!pending} ondragstart={event=>onDragStart(event,item)}
     ondragover={allowDrop} ondrop={event=>onDrop(event,'equipped',slot.id)}
     aria-label={'Select equipped '+item.name+' in '+slot.label+' (Shift-click to unequip)'}
     aria-pressed={selectedId===item.id}
     title={'Click to inspect · Shift-click to unequip '+item.name}
     onclick={event=>onSelect(item,event.shiftKey)}>
     <span class="socket-label">{slot.label}</span>
     {#if itemImage(item)}
      <img class="socket-art" src={itemImage(item)!} alt="" draggable="false" decoding="async"/>
     {:else}
      <span class="item-mark" aria-hidden="true">{itemMark(item)}</span>
     {/if}
   </button>
  {:else}
   <button type="button" class="equip-socket empty"
     style={'left:'+slot.x+'%;top:'+slot.y+'%'}
     class:outfit={slot.id==='torso'}
     aria-disabled={pending}
     ondragover={allowDrop} ondrop={event=>onDrop(event,'equipped',slot.id)}
     aria-label={'Empty '+slot.label+' equipment slot. Drop compatible gear here.'}
     title={'Empty '+slot.label}
     onclick={()=>{if(selected?.equipSlot===slot.id)onEquip(selected,slot.id);}}>
     <span class="socket-label">{slot.label}</span>
     <span class="socket-empty" aria-hidden="true">+</span>
   </button>
  {/if}
 {/each}
</div>
