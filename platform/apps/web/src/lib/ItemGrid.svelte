<script lang="ts">
 import type {Item,Place} from './inventory-types';
 import {itemImage,itemMark} from './inventory-types';
 let {items,slots,place,selectedId,pending,onSelect,onDragStart,onDrop}:{
  items:Item[];slots:number;place:Place;selectedId:string|null;pending:boolean;
  onSelect:(item:Item,shift:boolean)=>void;
  onDragStart:(event:DragEvent,item:Item)=>void;
  onDrop:(event:DragEvent,place:Place)=>void
 }=$props();
 function allowDrop(event:DragEvent){
  if(!pending&&event.dataTransfer?.types.includes('application/x-pall-item'))
   event.preventDefault();
 }
</script>
<section class="slot-target" aria-label={place==='pack'?'Carried item slots':'Home storage slots'}
  ondragover={allowDrop} ondrop={event=>onDrop(event,place)}>
 <div class="item-grid" class:pack-grid={place==='pack'} role="group"
  aria-label={place==='pack'?'Carried item slots':'Home storage slots'}>
  {#each Array.from({length:slots},(_,index)=>index) as index (index)}
   {@const item=items[index]}
   {#if item}
    <button type="button" class="item-slot occupied" class:selected={selectedId===item.id}
      draggable={!pending} ondragstart={event=>onDragStart(event,item)}
      aria-label={'Select '+item.name+(item.quantity>1?' quantity '+item.quantity:'')}
      aria-pressed={selectedId===item.id}
      title={'Click to inspect · Shift-click to quick move '+item.name}
      onclick={event=>onSelect(item,event.shiftKey)}>
      {#if itemImage(item)}
       <img class="item-art" src={itemImage(item)!} alt="" loading="lazy"
         decoding="async" draggable="false"/>
      {:else}
       <span class="item-mark" aria-hidden="true">{itemMark(item)}</span>
      {/if}
      <span class="item-short-name">{item.name}</span>
      {#if item.quantity>1}<span class="stack-count">{item.quantity}</span>{/if}
    </button>
   {:else}
    <div class="item-slot vacant" aria-hidden="true"></div>
   {/if}
  {/each}
 </div>
</section>
