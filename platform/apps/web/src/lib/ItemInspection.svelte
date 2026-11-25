<script lang="ts">
 import type {Item,Place,EquipSlot} from './inventory-types';
 import {itemImage,itemMark,itemType,itemBenefit,titleCase,measure} from './inventory-types';
 let {selected,place,pending,storageEnabled,quantity,equipped,onQuantity,onTransfer,onEquip}:{
  selected:Item|null;place:Place;pending:boolean;storageEnabled:boolean;
  quantity:number;equipped:Item[];
  onQuantity:(itemId:string,quantity:number)=>void;
  onTransfer:(item:Item,to:'pack'|'home_chest')=>void;
  onEquip:(item:Item,slot:EquipSlot)=>void
 }=$props();
</script>
<aside class="inspection" aria-label="Selected item description">
 <p class="overline">ITEM INSPECTION</p>
 {#if selected}
  {#if itemImage(selected)}
   <img class="inspection-art" src={itemImage(selected)!} alt=""
     decoding="async" draggable="false"/>
  {:else}
   <div class="inspection-mark" aria-hidden="true">{itemMark(selected)}</div>
  {/if}
  <h3>{selected.name}</h3>
  <p class="item-class">{itemType(selected)}
   {#if itemBenefit(selected)} <span>·</span> {itemBenefit(selected)}{/if}
  </p>
  <p class="item-description">{selected.description}</p>
  <dl class="item-statistics">
   <div><dt>Location</dt><dd>{place==='equipped'
    ?'Equipped · '+titleCase(selected.equipmentSlot??'')
    :place==='pack'?'Inventory':'Home Chest'}</dd></div>
   <div><dt>Weight</dt><dd>{measure(selected.weightKg)} kg</dd></div>
   <div><dt>Volume</dt><dd>{measure(selected.volumeL)} L</dd></div>
   {#if selected.currentDurability!==null&&selected.maxDurability!==null}
    <div><dt>Condition</dt><dd>{selected.currentDurability} / {selected.maxDurability}</dd></div>
   {/if}
   {#if selected.quantity>1}
    <div><dt>Owned in stack</dt><dd>{selected.quantity}</dd></div>
   {/if}
  </dl>
  {#if selected.stackable&&selected.quantity>1}
   <label class="quantity-label">Quantity to move
    <input type="number" min="1" max={selected.quantity} step="1"
     disabled={pending} value={quantity}
     oninput={event=>onQuantity(selected.id,Number(event.currentTarget.value))}/>
   </label>
  {/if}
  <div class="inspection-actions">
   {#if place==='equipped'}
    <button type="button" class="transfer-button" disabled={pending}
      onclick={()=>onTransfer(selected,'pack')}>Unequip to inventory</button>
    {#if storageEnabled}
     <button type="button" class="transfer-button secondary" disabled={pending}
       onclick={()=>onTransfer(selected,'home_chest')}>Store in chest</button>
    {/if}
   {:else}
    {#if selected.equipSlot}
     <button type="button" class="transfer-button"
      disabled={pending||equipped.some(x=>x.equipmentSlot===selected.equipSlot)}
      onclick={()=>{if(selected.equipSlot)onEquip(selected,selected.equipSlot);}}>
      Equip · {titleCase(selected.equipSlot)}
     </button>
    {/if}
    {#if place==='home_chest'}
     <button type="button" class="transfer-button secondary"
       disabled={pending||!storageEnabled}
       onclick={()=>onTransfer(selected,'pack')}>Take into inventory</button>
    {:else if storageEnabled}
     <button type="button" class="transfer-button secondary"
       disabled={pending} onclick={()=>onTransfer(selected,'home_chest')}>
       Store in chest
     </button>
    {/if}
   {/if}
  </div>
 {:else}
  <p class="selection-empty">Select an item to inspect its description and condition.</p>
 {/if}
</aside>
