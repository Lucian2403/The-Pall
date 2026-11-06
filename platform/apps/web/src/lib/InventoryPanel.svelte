<script lang="ts">
  import {onMount} from 'svelte';

  type EquipSlot='head'|'face'|'torso'|'hands'|'pants'|'feet'|'back'
    |'primary_weapon'|'secondary_weapon'|'respiratory_filter'|'accessory_1'|'accessory_2';
  type Item={
    id:string;code:string;name:string;category:string;description:string;
    rarity:string;armour:number;carrySlotsBonus:number;
    equipSlot:EquipSlot|null;equipmentSlot:EquipSlot|null;
    quantity:number;stackable:boolean;maxStack:number;qualityTier:number;
    weightKg:number;volumeL:number;carryVolumeBonusL:number;
    currentDurability:number|null;maxDurability:number|null;designStatus:string;
  };
  type Container={
    slotsUsed:number;maxSlots:number;weightKg:number;volumeL:number;
    maxWeightKg:number;maxVolumeL:number;overCapacity:boolean;items:Item[]
  };
  type Snapshot={revision:number;storageEnabled:boolean;
    pack:Container;chest:Container;equipment:{items:Item[]}};
  type Place='pack'|'home_chest'|'equipped';
  type Transfer={kind:'transfer';to:'pack'|'home_chest'};
  type Equip={kind:'equip';slot:EquipSlot};
  const equipmentSlots:{id:EquipSlot;label:string;x:number;y:number}[]=[
    {id:'head',label:'Head',x:35,y:0},
    {id:'face',label:'Face',x:68,y:0},
    {id:'respiratory_filter',label:'Filter',x:2,y:0},
    {id:'hands',label:'Hands',x:2,y:24},
    {id:'torso',label:'Torso',x:35,y:24},
    {id:'back',label:'Back / Bag',x:68,y:24},
    {id:'primary_weapon',label:'Primary',x:2,y:48},
    {id:'pants',label:'Pants',x:35,y:48},
    {id:'secondary_weapon',label:'Secondary',x:68,y:48},
    {id:'accessory_1',label:'Accessory I',x:2,y:72},
    {id:'feet',label:'Feet',x:35,y:72},
    {id:'accessory_2',label:'Accessory II',x:68,y:72}
  ];
  let {characterId,onClose}:{characterId:string;onClose:()=>void}=$props();
  const url=$derived('/api/characters/'+encodeURIComponent(characterId)+'/inventory');
  let snapshot=$state<Snapshot|null>(null);
  let loading=$state(true),pending=$state(false),error=$state('');
  let selectedId=$state<string|null>(null);
  let amounts=$state<Record<string,number>>({});
  const allItems=$derived([
    ...(snapshot?.equipment.items??[]),...(snapshot?.pack.items??[]),
    ...(snapshot?.chest.items??[])
  ]);
  const selected=$derived(allItems.find(item=>item.id===selectedId)??null);
  const selectedPlace=$derived.by(():Place=>{
    if(snapshot?.equipment.items.some(item=>item.id===selectedId))return 'equipped';
    if(snapshot?.pack.items.some(item=>item.id===selectedId))return 'pack';
    return 'home_chest';
  });
  const measure=(value:number)=>value.toFixed(1);
  const titleCase=(value:string)=>value.replace(/_/g,' ')
    .replace(/\b\w/g,letter=>letter.toUpperCase());
  // Display-only mapping. Server-owned codes remain the authority for gear.
  const itemImage=(item:Item)=>item.code==='basic_clothes'
    ?'/items/daily-worker-clothes.webp'
    :item.code==='crude_small_bag'?'/items/simple-bag.webp':null;
  const itemMark=(item:Item)=>item.code==='basic_clothes'?'WC'
    :item.code==='crude_small_bag'?'SB'
    :item.name.split(/\s+/).map(word=>word[0]).join('').slice(0,3).toUpperCase();
  const itemType=(item:Item)=>item.rarity+' '+titleCase(item.category);
  const itemBenefit=(item:Item)=>item.category==='clothing'
    ?item.armour+' Armour'
    :item.carrySlotsBonus>0?item.carrySlotsBonus+' Slots':null;

  function syncSelection(next:Snapshot){
    const all=[...next.equipment.items,...next.pack.items,...next.chest.items];
    if(!selectedId||!all.some(item=>item.id===selectedId))
      selectedId=all[0]?.id??null;
  }
  async function reload(){
    loading=true;error='';
    try{
      const response=await fetch(url,{cache:'no-store'});
      const body:unknown=await response.json().catch(()=>null);
      if(!response.ok){
        const code=body&&typeof body==='object'&&'error' in body&&
          typeof body.error==='string'?body.error:null;
        if(response.status===503&&
          (code==='inventory_schema_missing'||code==='inventory_not_initialized'))
          throw Error('Inventory database needs setup (HTTP 503). Run npm run inventory:migrate from platform.');
        if(response.status===404)
          throw Error('Inventory endpoint missing (HTTP 404). Restart the API server from the inventory branch.');
        if(response.status===401)throw Error('Inventory sign-in required (HTTP 401).');
        if(response.status===500)
          throw Error('Inventory server error (HTTP 500). Check the API terminal for details.');
        if(response.status===502||response.status===503||response.status===504)
          throw Error('Inventory API is unreachable (HTTP '+response.status+'). Check the API server.');
        throw Error('Inventory request failed (HTTP '+response.status+(code?'; '+code:'')+').');
      }
      if(!body||typeof body!=='object'||!('pack' in body)||!('chest' in body)||
        !('equipment' in body))
        throw Error('Inventory returned an invalid response. Check the API terminal.');
      const next=body as Snapshot;
      snapshot=next;
      syncSelection(next);
    }catch(cause){error=cause instanceof Error?cause.message:'Inventory unavailable';}
    finally{loading=false;}
  }
  onMount(()=>{void reload();});

  async function submit(item:Item,intent:Transfer|Equip){
    if(!snapshot||pending||!snapshot.storageEnabled)return;
    const quantity=item.stackable?(amounts[item.id]??item.quantity):1;
    if(intent.kind==='transfer'&&
      (!Number.isSafeInteger(quantity)||quantity<1||quantity>item.quantity)){
      error='Choose a valid quantity.';return;
    }
    pending=true;error='';
    const requestId=crypto.randomUUID();
    const originalRevision=snapshot.revision;
    const command=intent.kind==='equip'
      ?{kind:'equip',requestId,expectedRevision:originalRevision,
        itemInstanceId:item.id,slot:intent.slot}
      :{kind:'transfer',requestId,expectedRevision:originalRevision,
        itemInstanceId:item.id,quantity,to:intent.to};
    try{
      const response=await fetch(url,{method:'POST',
        headers:{'content-type':'application/json'},body:JSON.stringify(command)});
      if(response.status===409){
        const body=await response.json() as {error?:string};
        const message=body.error==='pack_slots_exceeded'?'All inventory slots are occupied.'
          :body.error==='chest_slots_exceeded'?'All chest slots are occupied.'
          :body.error==='pack_capacity_exceeded'?'Too much weight or volume to carry.'
          :body.error==='chest_capacity_exceeded'?'The chest cannot hold that much weight or volume.'
          :body.error==='equipment_slot_occupied'?'That equipment slot is already occupied.'
          :body.error==='slot_incompatible'?'This item cannot go in that equipment slot.'
          :body.error==='item_not_equippable'?'This item cannot be equipped.'
          :body.error==='stale_revision'?'Inventory changed. Current contents reloaded.'
          :body.error==='storage_not_unlocked'?'Home storage is not yet unlocked.'
          :'Item move could not be completed.';
        await reload();error=message;return;
      }
      if(!response.ok)throw Error('Move failed. Inventory was not changed.');
      const next=await response.json() as Snapshot;
      snapshot=next;
      delete amounts[item.id];
      syncSelection(next);
    }catch(cause){
      error=cause instanceof Error?cause.message:'Connection interrupted. Reopen storage to check saved items.';
    }finally{pending=false;}
  }
  const transfer=(item:Item,to:'pack'|'home_chest')=>submit(item,{kind:'transfer',to});
  const equip=(item:Item,slot:EquipSlot)=>submit(item,{kind:'equip',slot});
  function quickMove(item:Item,place:Place){
    if(place==='equipped')void transfer(item,'pack');
    else void transfer(item,place==='pack'?'home_chest':'pack');
  }
  function selectItem(event:MouseEvent,item:Item,place:Place){
    if(event.shiftKey)quickMove(item,place);
    else selectedId=item.id;
  }
  function startDrag(event:DragEvent,item:Item){
    if(pending||!snapshot?.storageEnabled){event.preventDefault();return;}
    event.dataTransfer?.setData('application/x-pall-item',item.id);
    if(event.dataTransfer)event.dataTransfer.effectAllowed='move';
  }
  function allowDrop(event:DragEvent){
    if(!pending&&snapshot?.storageEnabled&&
      event.dataTransfer?.types.includes('application/x-pall-item'))
      event.preventDefault();
  }
  function onDrop(event:DragEvent,destination:Place,slot?:EquipSlot){
    event.preventDefault();
    if(pending||!snapshot?.storageEnabled)return;
    const item=allItems.find(x=>x.id===event.dataTransfer?.getData('application/x-pall-item'));
    if(!item)return;
    if(destination==='equipped'){
      if(slot&&item.equipSlot===slot)void equip(item,slot);
      else error='This item does not fit that equipment slot.';
    }else if(item.equipmentSlot||selectedPlace!=='equipped'){
      // Transfers are still validated by the server; never trust drag data.
      void transfer(item,destination);
    }else void transfer(item,destination);
  }
</script>

<section class="inventory-panel" aria-label="Inventory and home storage">
  <header class="inventory-heading">
    <div><p class="overline">YOUR POSSESSIONS</p><h2>Inventory &amp; Storage</h2></div>
    <button type="button" class="pall-framed-button" onclick={onClose}>Close storage</button>
  </header>

  {#if loading}
    <p class="loading" role="status">Reading your possessions…</p>
  {:else if snapshot}
    <div class="inventory-layout">
      <section class="grid-card pack-card" aria-label="Inventory">
        <header class="grid-heading">
          <h3>Inventory</h3>
          <span>{snapshot.pack.items.some(item=>item.code==='crude_small_bag')
            ?'Simple Bag':'No bag carried'}</span>
        </header>
        <div class="item-grid" role="group" aria-label="Carried item slots">
          {#each Array.from({length:snapshot.pack.maxSlots},(_,index)=>index) as index (index)}
            {@const item=snapshot.pack.items[index]}
            {#if item}
              <button type="button" class="item-slot occupied"
                class:selected={selectedId===item.id}
                aria-label={'Select '+item.name+(item.quantity>1?' quantity '+item.quantity:'')}
                aria-pressed={selectedId===item.id}
                onclick={()=>selectedId=item.id}>
                {#if itemImage(item)}
                  <img class="item-art" src={itemImage(item)!} alt=""
                    loading="lazy" decoding="async" draggable="false" />
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
        <p class="grid-footer">
          <span>Items carried: {snapshot.pack.slotsUsed} / {snapshot.pack.maxSlots}</span>
          <span>{measure(snapshot.pack.weightKg)} / {measure(snapshot.pack.maxWeightKg)} kg</span>
        </p>
      </section>

      <aside class="inspection" aria-label="Selected item description">
        <p class="overline">ITEM INSPECTION</p>
        {#if selected}
          {#if itemImage(selected)}
            <img class="inspection-art" src={itemImage(selected)!} alt=""
              decoding="async" draggable="false" />
          {:else}
            <div class="inspection-mark" aria-hidden="true">{itemMark(selected)}</div>
          {/if}
          <h3>{selected.name}</h3>
          <p class="item-class">{itemType(selected)}
            {#if itemBenefit(selected)} <span>·</span> {itemBenefit(selected)}{/if}
          </p>
          <p class="item-description">{selected.description}</p>
          <div class="item-statistics">
            <div><span>Location</span><strong>{selectedPlace==='pack'?'Inventory':'Home Chest'}</strong></div>
            <div><span>Weight</span><strong>{measure(selected.weightKg)} kg</strong></div>
            <div><span>Volume</span><strong>{measure(selected.volumeL)} L</strong></div>
            {#if selected.currentDurability!==null && selected.maxDurability!==null}
              <div><span>Condition</span><strong>{selected.currentDurability} / {selected.maxDurability}</strong></div>
            {/if}
            {#if selected.quantity>1}
              <div><span>Owned in stack</span><strong>{selected.quantity}</strong></div>
            {/if}
          </div>
          {#if selected.stackable&&selected.quantity>1}
            <label class="quantity-label">Quantity to move
              <input type="number" min="1" max={selected.quantity} step="1"
                disabled={pending||!snapshot.storageEnabled}
                value={amounts[selected.id]??selected.quantity}
                oninput={event=>amounts[selected.id]=Number(event.currentTarget.value)}/>
            </label>
          {/if}
          <button type="button" class="transfer-button"
            disabled={pending||!snapshot.storageEnabled}
            onclick={()=>{if(selected)void transfer(selected,selectedPlace==='pack'?'home_chest':'pack');}}>
            {selectedPlace==='pack'?'Store in chest':'Take into inventory'}
          </button>
        {:else}
          <p class="selection-empty">Select an item from either grid to read its description and examine its condition.</p>
        {/if}
        {#if !snapshot.storageEnabled}
          <p class="note">Storage becomes available upon reaching the shared rented home.</p>
        {/if}
      </aside>

      <section class="grid-card chest-card" aria-label="Home Chest">
        <header class="grid-heading">
          <h3>Home Chest</h3>
          <span>Rented room</span>
        </header>
        <div class="item-grid" role="group" aria-label="Home storage slots">
          {#each Array.from({length:snapshot.chest.maxSlots},(_,index)=>index) as index (index)}
            {@const item=snapshot.chest.items[index]}
            {#if item}
              <button type="button" class="item-slot occupied"
                class:selected={selectedId===item.id}
                aria-label={'Select '+item.name+(item.quantity>1?' quantity '+item.quantity:'')}
                aria-pressed={selectedId===item.id}
                onclick={()=>selectedId=item.id}>
                {#if itemImage(item)}
                  <img class="item-art" src={itemImage(item)!} alt=""
                    loading="lazy" decoding="async" draggable="false" />
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
        <p class="grid-footer">
          <span>Stored: {snapshot.chest.slotsUsed} / {snapshot.chest.maxSlots}</span>
          <span>{measure(snapshot.chest.weightKg)} / {measure(snapshot.chest.maxWeightKg)} kg</span>
        </p>
      </section>
    </div>
    <p class="provisional">The grid is functional; item icons and final carrying-weight and chest balance remain provisional.</p>
  {/if}
  {#if error}<p class="inventory-error" role="alert">{error}</p>
    <button type="button" class="reload" onclick={()=>{void reload();}}>Reload inventory</button>{/if}
</section>

<style>
  .inventory-panel{padding:20px clamp(12px,2.5vw,36px) 18px;
    background:#211c19;border:1px solid #745333;border-radius:9px;
    color:#edd9b7;font:14px/1.45 Georgia,serif}
  .inventory-heading{display:flex;align-items:center;justify-content:space-between;
    max-width:1450px;margin:0 auto 17px;gap:15px}
  .inventory-heading h2{margin:2px 0 0;font:600 26px Georgia,serif;color:#efd2a3}
  .overline{margin:0;color:#b5a18a;letter-spacing:.1em;font:700 11px Arial,sans-serif}
  .inventory-layout{max-width:1450px;margin:auto;display:grid;
    grid-template-columns:minmax(0,1fr) minmax(235px,.66fr) minmax(0,1fr);
    align-items:start;gap:14px}
  .grid-card{min-width:0;border:1px solid #6d5544;background:#282320;padding:12px;
    border-radius:4px}
  .grid-heading{display:flex;justify-content:space-between;align-items:baseline;
    border-bottom:1px solid #645144;gap:10px;padding-bottom:11px;margin-bottom:12px}
  .grid-heading h3{margin:0;font:600 19px Georgia,serif;color:#e8c594}
  .grid-heading span{font:12px Georgia,serif;color:#c1a589;text-align:right}
  .item-grid{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:5px}
  .item-slot{position:relative;aspect-ratio:1;min-width:0;overflow:hidden;
    border-radius:3px;border:1px solid #5c5046;background:#302a26;
    padding:3px;color:#dfc9a5}
  .occupied{cursor:pointer;display:flex;flex-direction:column;
    align-items:center;justify-content:center;gap:3px;
    background:linear-gradient(145deg,#48392e,#302720)}
  .occupied:hover{border-color:#c19b64;background:#51402f}
  .occupied.selected,.occupied:focus-visible{border:2px solid #dbb478;
    background:#4e3b2a;outline:1px solid #d4a96a;outline-offset:-4px}
  .item-art{width:88%;height:74%;max-height:72px;flex-shrink:1;
    object-fit:contain;pointer-events:none;filter:drop-shadow(0 2px 2px #0008)}
  .item-mark{font:700 clamp(12px,1.6vw,20px)/1 Georgia,serif;
    color:#f1cc92;text-shadow:0 1px 2px #000}
  .item-short-name{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;
    overflow:hidden;text-align:center;font:10px/1.1 Georgia,serif;word-break:normal}
  .stack-count{position:absolute;right:3px;bottom:2px;padding:1px 3px;
    border-radius:3px;background:#211915e8;color:#f5deac;font:700 11px Georgia,serif}
  .grid-footer{display:flex;justify-content:space-between;gap:8px;
    margin:10px 0 0;color:#c4aa89;font:12px/1.35 Georgia,serif}
  .inspection{min-width:0;border:1px solid #7f6043;border-radius:4px;
    background:linear-gradient(180deg,#342920,#28211d);padding:15px;
    min-height:260px;box-sizing:border-box}
  .inspection-art{display:block;width:116px;height:116px;max-width:100%;
    object-fit:contain;margin:4px auto 12px;filter:drop-shadow(0 5px 5px #0009)}
  .inspection-mark{display:grid;place-items:center;width:62px;height:62px;
    margin:12px 0;border:1px solid #96754c;background:#4b3627;
    color:#f4d49e;font:700 22px Georgia,serif}
  .inspection h3{margin:8px 0 3px;color:#f1d29f;font:600 22px/1.2 Georgia,serif}
  .item-class{margin:0 0 13px;color:#d1af7b;font:italic 14px/1.35 Georgia,serif}
  .item-class span{padding:0 2px}
  .item-description{margin:0 0 17px;color:#e5d5c1;font:14px/1.6 Georgia,serif}
  .item-statistics{border-top:1px solid #65513f;padding-top:10px;
    display:grid;gap:7px;margin-bottom:15px}
  .item-statistics div{display:flex;justify-content:space-between;gap:12px}
  .item-statistics span{color:#b8a28c}
  .item-statistics strong{color:#e8cba0;font-weight:600;text-align:right}
  .selection-empty,.note{color:#b8a28c}
  .quantity-label{display:flex;justify-content:space-between;gap:10px;
    align-items:center;margin-bottom:12px;font-size:12px}
  .quantity-label input{max-width:72px;padding:7px;background:#201915;
    border:1px solid #92724e;border-radius:2px;color:#f0d4aa}
  .transfer-button,.reload{border:1px solid #b18a55;background:#4c3424;
    color:#f2d7ac;padding:9px 13px;font:700 13px Georgia,serif;cursor:pointer}
  .transfer-button:hover:not(:disabled),.reload:hover{background:#69472c}
  .transfer-button:disabled{opacity:.45;cursor:default}
  .provisional{max-width:1450px;margin:12px auto 0;color:#99887a;font:12px Georgia,serif}
  .inventory-error{max-width:1450px;margin:12px auto;color:#f0a9a0;font-weight:700}
  .loading{margin:30px 0;color:#e4cfb5}
  @media(max-width:1200px){
    .inventory-layout{grid-template-columns:repeat(2,minmax(0,1fr))}
    .inspection{grid-column:1 / -1;grid-row:2}
    .chest-card{grid-column:2;grid-row:1}
  }
  @media(max-width:750px){
    .inventory-layout{grid-template-columns:minmax(0,1fr)}
    .inspection,.chest-card{grid-column:auto;grid-row:auto}
    .inventory-heading{align-items:flex-start;flex-wrap:wrap}
  }
</style>
