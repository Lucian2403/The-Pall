<script lang="ts">
 import {onDestroy} from 'svelte';
 import {gameWindows,selectWindowCharacter,closeGameWindow,frontGameWindow} from './game-window-state';
 import type {GameWindowRecord} from './game-window-state';
 import type {InventorySnapshot,Item,Place,EquipSlot} from './inventory-types';
 import GameWindow from './GameWindow.svelte';
 import InventoryWindow from './InventoryWindow.svelte';
 import StorageWindow from './StorageWindow.svelte';
 import './inventory-windows.css';

 let {characterId,onStorageClosed}:{
  characterId:string;onStorageClosed?:()=>void
 }=$props();
 const windows=$derived($gameWindows.characterId===characterId?$gameWindows.windows:[]);
 const inventoryOpen=$derived(windows.some(w=>w.id==='inventory'));
 const storageOpen=$derived(windows.some(w=>w.id==='storage:home_chest'));
 let snapshot=$state<InventorySnapshot|null>(null);
 let selectedId=$state<string|null>(null);
 let amounts=$state<Record<string,number>>({});
 const selected=$derived(snapshot&&[
  ...snapshot.equipment.items,...snapshot.pack.items,...snapshot.chest.items
 ].find(item=>item.id===selectedId)||null);
 const quantity=$derived(selected?(amounts[selected.id]??selected.quantity):1);
 let loading=$state(false),pending=$state(false),error=$state('');
 let contextToken=$state<string|null>(null);
 let acquiring=$state(false);
 let currentId='';
 let lastWindowKey='';
 let readEpoch=0,contextEpoch=0;

 const api=(id:string)=>'/api/characters/'+encodeURIComponent(id)+'/inventory';
 async function revoke(id:string,token:string){
  try{
   await fetch(api(id)+'/storage-context',{
    method:'POST',headers:{'content-type':'application/json'},
    body:JSON.stringify({action:'close',token}),keepalive:true
   });
  }catch{/* The server expires abandoned leases after ten minutes. */}
 }
 function dropStorage(id:string){
  ++contextEpoch;
  const old=contextToken;
  contextToken=null;
  acquiring=false;
  if(old)void revoke(id,old);
  if(snapshot) snapshot={...snapshot,storageEnabled:false,
   chest:{...snapshot.chest,items:[]}};
  if(snapshot && selectedId && ![
    ...snapshot.pack.items,...snapshot.equipment.items
  ].some(item=>item.id===selectedId))selectedId=null;
 }
 function syncSelection(next:InventorySnapshot){
  const all=[...next.equipment.items,...next.pack.items,...next.chest.items];
  if(!selectedId||!all.some(item=>item.id===selectedId))selectedId=all[0]?.id??null;
 }
 async function reload(id:string,token=contextToken){
  const epoch=++readEpoch;
  loading=true;
  error='';
  try{
   const response=await fetch(api(id),{
    cache:'no-store',headers:token?{'x-pall-storage-context':token}:{}
   });
   const body:unknown=await response.json().catch(()=>null);
   if(!response.ok){
    const code=body&&typeof body==='object'&&'error' in body&&
      typeof body.error==='string'?body.error:null;
    if(response.status===503&&(code==='inventory_schema_missing'||code==='inventory_not_initialized'))
      throw Error('Inventory database needs setup (HTTP 503). Run npm run inventory:migrate.');
    if(response.status===404)throw Error('Inventory endpoint missing (HTTP 404). Restart the API.');
    if(response.status===401)throw Error('Inventory sign-in required (HTTP 401).');
    if(response.status===500)throw Error('Inventory server error (HTTP 500). Check the API terminal.');
    throw Error('Inventory API is unreachable (HTTP '+response.status+(code?'; '+code:'')+').');
   }
   if(!body||typeof body!=='object'||!('pack' in body)||
      !('chest' in body)||!('equipment' in body)||!('bonuses' in body))
      throw Error('Inventory returned an invalid response.');
   if(epoch!==readEpoch||characterId!==id||token!==contextToken)return;
   const next=body as InventorySnapshot;
   snapshot=next;
   syncSelection(next);
  }catch(cause){
   if(epoch===readEpoch&&characterId===id)
    error=cause instanceof Error?cause.message:'Inventory unavailable';
  }finally{
   if(epoch===readEpoch)loading=false;
  }
 }
 async function activateStorage(id:string){
  const epoch=++contextEpoch;
  acquiring=true;
  error='';
  try{
   const response=await fetch(api(id)+'/storage-context',{
    method:'POST',headers:{'content-type':'application/json'},
    body:JSON.stringify({action:'open'})
   });
   const result=await response.json() as {token?:string;error?:string};
   if(!response.ok||typeof result.token!=='string')
     throw Error(result.error==='storage_not_unlocked'
       ?'Home Chest is not yet unlocked.':'Could not open Home Chest. Check the connection and inventory migration.');
   if(epoch!==contextEpoch||characterId!==id||!storageOpen){
    void revoke(id,result.token);
    return;
   }
   contextToken=result.token;
   await reload(id,result.token);
  }catch(cause){
   if(epoch===contextEpoch){
    error=cause instanceof Error?cause.message:'Home Chest unavailable';
    closeGameWindow('storage:home_chest');
   }
  }finally{
   if(epoch===contextEpoch)acquiring=false;
  }
 }
 $effect(()=>{
  const id=characterId;
  if(currentId===id)return;
  const previous=currentId;
  if(previous)dropStorage(previous);
  ++readEpoch;
  snapshot=null;selectedId=null;amounts={};loading=false;pending=false;error='';
  currentId=id;lastWindowKey='';
  // Runs on client after hydration; no cross-account server module state.
  selectWindowCharacter(id);
 });
 $effect(()=>{
  const key=characterId+':'+windows.map(w=>w.id).sort().join(',');
  if(key===lastWindowKey)return;
  const wasStorage=lastWindowKey.includes('storage:home_chest');
  lastWindowKey=key;
  if(storageOpen&&!wasStorage)void activateStorage(characterId);
  else if(!storageOpen&&wasStorage){
   dropStorage(characterId);
   if(windows.length)void reload(characterId,null);
  }else if(windows.length&&snapshot===null&&!loading&&!acquiring){
   void reload(characterId);
  }
 });
 onDestroy(()=>{
  ++readEpoch;++contextEpoch;
  const token=contextToken;
  if(token)void revoke(currentId,token);
 });
 function close(record:GameWindowRecord){
  closeGameWindow(record.id);
  if(record.kind==='storage')onStorageClosed?.();
  const target=record.kind==='inventory'?'[data-open-inventory]':'[data-open-home-chest]';
  queueMicrotask(()=>{
   const button=document.querySelector<HTMLElement>(target);
   button?.focus({preventScroll:true});
  });
 }
 function drag(event:DragEvent,item:Item){
  if(pending){event.preventDefault();return;}
  event.dataTransfer?.setData('application/x-pall-item',item.id);
  if(event.dataTransfer)event.dataTransfer.effectAllowed='move';
 }
 async function submit(item:Item,intent:{kind:'transfer';to:'pack'|'home_chest'}|
  {kind:'equip';slot:EquipSlot}){
  if(!snapshot||pending)return;
  const id=characterId;
  const from= snapshot.pack.items.some(x=>x.id===item.id)?'pack':
   snapshot.equipment.items.some(x=>x.id===item.id)?'equipped':'home_chest';
  const needsStorage=from==='home_chest'||intent.kind==='transfer'&&intent.to==='home_chest';
  if(needsStorage&&!snapshot.storageEnabled){
   error='Open the Home Chest in your rented room to transfer these items.';
   return;
  }
  const count=item.stackable?(amounts[item.id]??item.quantity):1;
  if(intent.kind==='transfer'&&(!Number.isSafeInteger(count)||count<1||count>item.quantity)){
   error='Choose a valid quantity.';return;
  }
  pending=true;error='';
  const command=intent.kind==='equip'
   ?{kind:'equip',requestId:crypto.randomUUID(),expectedRevision:snapshot.revision,
     itemInstanceId:item.id,slot:intent.slot}
   :{kind:'transfer',requestId:crypto.randomUUID(),expectedRevision:snapshot.revision,
     itemInstanceId:item.id,quantity:count,to:intent.to};
  try{
   const response=await fetch(api(id),{
    method:'POST',headers:{
     'content-type':'application/json',
     ...(contextToken?{'x-pall-storage-context':contextToken}:{})
    },body:JSON.stringify(command)
   });
   if(response.status===409){
    const body=await response.json() as {error?:string};
    const message=body.error==='pack_slots_exceeded'?'All inventory slots are occupied.'
     :body.error==='chest_slots_exceeded'?'All chest slots are occupied.'
     :body.error==='pack_capacity_exceeded'?'Too much weight or volume to carry.'
     :body.error==='chest_capacity_exceeded'?'The chest cannot hold that much weight or volume.'
     :body.error==='equipment_slot_occupied'?'That equipment slot is already occupied.'
     :body.error==='slot_incompatible'?'This item does not fit that equipment slot.'
     :body.error==='item_not_equippable'?'This item cannot be equipped.'
     :body.error==='stale_revision'?'Inventory changed. Current contents reloaded.'
     :body.error==='storage_context_required'?'Home Chest access expired. Return to the room and reopen it.'
     :'Item move could not be completed.';
    if(body.error==='storage_context_required'){
     closeGameWindow('storage:home_chest');dropStorage(id);
    }
    await reload(id);
    error=message;
    return;
   }
   if(!response.ok)throw Error('Move failed. Inventory was not changed.');
   const next=await response.json() as InventorySnapshot;
   if(id!==characterId)return;
   snapshot=next;amounts={...amounts,[item.id]:next.pack.items.find(x=>x.id===item.id)?.quantity??1};
   syncSelection(next);
  }catch(cause){
   if(id===characterId)error=cause instanceof Error?cause.message:
    'Connection interrupted. Reload to verify saved items before retrying.';
  }finally{pending=false;}
 }
 function select(item:Item,shift:boolean){
  const place:Place=snapshot?.equipment.items.some(x=>x.id===item.id)?'equipped':
   snapshot?.pack.items.some(x=>x.id===item.id)?'pack':'home_chest';
  if(shift&&(place==='equipped'||snapshot?.storageEnabled)){
   void submit(item,{kind:'transfer',to:place==='pack'?'home_chest':'pack'});
  }else selectedId=item.id;
 }
 function drop(event:DragEvent,place:Place,slot?:EquipSlot){
  event.preventDefault();
  if(!snapshot||pending)return;
  const id=event.dataTransfer?.getData('application/x-pall-item');
  const item=[...snapshot.equipment.items,...snapshot.pack.items,...snapshot.chest.items]
   .find(x=>x.id===id);
  if(!item)return;
  if(place==='equipped'){
   if(slot&&item.equipSlot===slot)void submit(item,{kind:'equip',slot});
   else error='This item does not fit that equipment slot.';
  }else{
   if(place==='home_chest'&&!snapshot.storageEnabled){
    error='Home Chest is not available here.';return;
   }
   if(place==='pack'&&snapshot.pack.items.some(x=>x.id===item.id)||
      place==='home_chest'&&snapshot.chest.items.some(x=>x.id===item.id))return;
   void submit(item,{kind:'transfer',to:place});
  }
 }
 function keys(event:KeyboardEvent){
  if(event.key!=='Escape'||event.defaultPrevented||
     (event.target as HTMLElement)?.closest('dialog,[role="dialog"]'))return;
  const top=windows.reduce<GameWindowRecord|null>((a,b)=>!a||b.z>a.z?b:a,null);
  if(!top)return;
  event.preventDefault();
  close(top);
 }
</script>
<svelte:window onkeydown={keys}/>
{#if windows.length>1}
 <nav class="game-window-tabs" aria-label="Open character windows">
  {#each windows as record (record.id)}
   <button type="button" class:active={$gameWindows.mobileActive===record.id}
     onclick={()=>frontGameWindow(record.id)}>
     {record.kind==='inventory'?'Inventory':'Home Chest'}
   </button>
  {/each}
 </nav>
{/if}
{#each windows as record (record.id)}
 <GameWindow {record} title={record.kind==='inventory'?'Inventory':'Home Chest'}
   mobileHidden={$gameWindows.mobileActive!==record.id} onClose={()=>close(record)}>
  {#snippet children()}
   {#if loading||acquiring}
    <p class="inventory-loading" role="status">Reading your possessions…</p>
   {:else if snapshot}
    {#if record.kind==='inventory'}
     <InventoryWindow {snapshot} {selected} {selectedId} {pending} {quantity}
       onQuantity={(id,n)=>amounts={...amounts,[id]:n}} onSelect={select}
       onEquip={(item,slot)=>{void submit(item,{kind:'equip',slot});}}
       onTransfer={(item,to)=>{void submit(item,{kind:'transfer',to});}}
       onDragStart={drag} onDrop={drop}/>
    {:else if snapshot.storageEnabled}
     <StorageWindow {snapshot} {selected} {selectedId} {pending} {quantity}
       onQuantity={(id,n)=>amounts={...amounts,[id]:n}} onSelect={select}
       onEquip={(item,slot)=>{void submit(item,{kind:'equip',slot});}}
       onTransfer={(item,to)=>{void submit(item,{kind:'transfer',to});}}
       onDragStart={drag} onDrop={drop}/>
    {:else}
     <p role="status">Home Chest access is unavailable. Close and reopen it from the room.</p>
    {/if}
   {/if}
   {#if error}
    <p class="inventory-error" role="alert">{error}</p>
    <button type="button" class="inventory-retry"
      onclick={()=>{void reload(characterId);}}>Reload inventory</button>
   {/if}
  {/snippet}
 </GameWindow>
{/each}
<style>
 .game-window-tabs{display:none}
 @media(max-width:700px){
  .game-window-tabs{position:fixed;inset:6px 6px auto;display:flex;gap:3px;z-index:9000;
   padding:3px;border:1px solid #826340;background:#171411}
  .game-window-tabs button{flex:1;min-height:40px;padding:7px;
   background:#33261c;color:#e8cfab;border:1px solid #6b5137;font:600 13px Georgia,serif}
  .game-window-tabs button.active{background:#64442a;border-color:#d3a774}
 }
</style>
