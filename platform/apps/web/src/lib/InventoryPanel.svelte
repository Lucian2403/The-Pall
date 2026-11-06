<script lang="ts">
  import {onMount} from 'svelte';

  type Item={
    id:string;code:string;name:string;category:string;description:string;
    rarity:string;armour:number;carrySlotsBonus:number;
    quantity:number;stackable:boolean;maxStack:number;qualityTier:number;
    weightKg:number;volumeL:number;carryVolumeBonusL:number;
    currentDurability:number|null;maxDurability:number|null;designStatus:string;
  };
  type Container={
    slotsUsed:number;maxSlots:number;weightKg:number;volumeL:number;
    maxWeightKg:number;maxVolumeL:number;overCapacity:boolean;items:Item[]
  };
  type Snapshot={revision:number;storageEnabled:boolean;pack:Container;chest:Container};
  type Place='pack'|'home_chest';

  let {characterId,onClose}:{characterId:string;onClose:()=>void}=$props();
  const url=$derived('/api/characters/'+encodeURIComponent(characterId)+'/inventory');
  let snapshot=$state<Snapshot|null>(null);
  let loading=$state(true),pending=$state(false),error=$state('');
  let selectedId=$state<string|null>(null);
  let amounts=$state<Record<string,number>>({});
  const selected=$derived.by(()=>{
    const all=[...(snapshot?.pack.items??[]),...(snapshot?.chest.items??[])];
    return all.find(item=>item.id===selectedId)??null;
  });
  const selectedPlace=$derived(
    snapshot?.pack.items.some(item=>item.id===selectedId)?'pack':'home_chest'
  );
  const measure=(value:number)=>value.toFixed(1);
  const titleCase=(value:string)=>value.replace(/_/g,' ')
    .replace(/\b\w/g,letter=>letter.toUpperCase());
  const itemMark=(item:Item)=>item.code==='basic_clothes'?'WC'
    :item.code==='crude_small_bag'?'SB'
    :item.name.split(/\s+/).map(word=>word[0]).join('').slice(0,3).toUpperCase();
  const itemType=(item:Item)=>item.rarity+' '+titleCase(item.category);
  const itemBenefit=(item:Item)=>item.category==='clothing'
    ?item.armour+' Armour'
    :item.carrySlotsBonus>0
      ?item.carrySlotsBonus+' Slots'
      :null;

  function syncSelection(next:Snapshot){
    const all=[...next.pack.items,...next.chest.items];
    if(!selectedId||!all.some(item=>item.id===selectedId))
      selectedId=all[0]?.id??null;
  }
  async function reload(){
    loading=true;error='';
    try{
      const response=await fetch(url,{cache:'no-store'});
      const body=await response.json();
      if(!response.ok)throw Error(response.status===503
        ?'Inventory schema missing. Run npm run inventory:migrate.'
        :response.status===401?'Sign in is required.':'Inventory is unavailable.');
      snapshot=body as Snapshot;
      syncSelection(snapshot);
    }catch(cause){error=cause instanceof Error?cause.message:'Inventory unavailable';}
    finally{loading=false;}
  }
  onMount(()=>{void reload();});
  async function transfer(item:Item,to:Place){
    if(!snapshot||pending||!snapshot.storageEnabled)return;
    const quantity=item.stackable?(amounts[item.id]??item.quantity):1;
    if(!Number.isSafeInteger(quantity)||quantity<1||quantity>item.quantity){
      error='Choose a valid quantity.';return;
    }
    pending=true;error='';
    const requestId=crypto.randomUUID();
    const originalRevision=snapshot.revision;
    try{
      const response=await fetch(url,{method:'POST',
        headers:{'content-type':'application/json'},
        body:JSON.stringify({kind:'transfer',requestId,expectedRevision:originalRevision,
          itemInstanceId:item.id,quantity,to})});
      if(response.status===409){
        const body=await response.json() as {error?:string};
        const message=body.error==='pack_slots_exceeded'?'All inventory slots are occupied.'
          :body.error==='chest_slots_exceeded'?'All chest slots are occupied.'
          :body.error==='pack_capacity_exceeded'?'Too much weight or volume to carry.'
          :body.error==='chest_capacity_exceeded'?'The chest cannot hold that much weight or volume.'
          :body.error==='stale_revision'?'Inventory changed. Current contents reloaded.'
          :body.error==='storage_not_unlocked'?'Home storage is not yet unlocked.'
          :'Item transfer could not be completed.';
        await reload();error=message;return;
      }
      if(!response.ok)throw Error('Transfer failed. Inventory was not changed.');
      snapshot=await response.json() as Snapshot;
      delete amounts[item.id];
      syncSelection(snapshot);
    }catch(cause){
      error=cause instanceof Error?cause.message:'Connection interrupted. Reopen storage to check saved items.';
      // Avoid silently retrying with a different request ID after network failure.
    }finally{pending=false;}
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
                <span class="item-mark" aria-hidden="true">{itemMark(item)}</span>
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
          <div class="inspection-mark" aria-hidden="true">{itemMark(selected)}</div>
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
            onclick={()=>{void transfer(selected,selectedPlace==='pack'?'home_chest':'pack');}}>
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
                <span class="item-mark" aria-hidden="true">{itemMark(item)}</span>
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
