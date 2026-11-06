<script lang="ts">
  import {onMount} from 'svelte';
  export type Item={
    id:string;code:string;name:string;category:string;description:string;
    quantity:number;stackable:boolean;maxStack:number;qualityTier:number;
    weightKg:number;volumeL:number;carryVolumeBonusL:number;
    currentDurability:number|null;maxDurability:number|null;designStatus:string;
  };
  type Container={weightKg:number;volumeL:number;maxWeightKg:number;maxVolumeL:number;
    overCapacity:boolean;items:Item[]};
  type Snapshot={revision:number;storageEnabled:boolean;pack:Container;chest:Container};
  let {characterId,onClose}:{characterId:string;onClose:()=>void}=$props();
  const url=$derived('/api/characters/'+encodeURIComponent(characterId)+'/inventory');
  let snapshot=$state<Snapshot|null>(null);
  let loading=$state(true),pending=$state(false),error=$state('');
  let amounts=$state<Record<string,number>>({});
  async function reload(){
    loading=true;error='';
    try{
      const response=await fetch(url,{cache:'no-store'});
      const body=await response.json();
      if(!response.ok)throw Error(response.status===503
        ?'Inventory database is not initialized. Run npm run inventory:migrate.'
        :response.status===401?'Sign in is required.':'Inventory is unavailable.');
      snapshot=body as Snapshot;
    }catch(cause){error=cause instanceof Error?cause.message:'Inventory unavailable';}
    finally{loading=false;}
  }
  onMount(()=>{void reload();});
  async function transfer(item:Item,to:'pack'|'home_chest'){
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
        const message=body.error==='pack_capacity_exceeded'?'Too much weight or volume to carry.'
          :body.error==='chest_capacity_exceeded'?'The chest has insufficient space.'
          :body.error==='stale_revision'?'Inventory changed. Current contents reloaded.'
          :body.error==='storage_not_unlocked'?'Home storage is not yet unlocked.'
          :'Item transfer could not be completed.';
        await reload();
        error=message;
        return;
      }
      if(!response.ok)throw Error('Transfer failed. Inventory was not changed.');
      snapshot=await response.json() as Snapshot;
      delete amounts[item.id];
    }catch(cause){
      error=cause instanceof Error?cause.message:'Connection interrupted. Reopen storage to check saved items.';
      // Never silently repeat a transfer with a new ID after a network failure.
    }finally{pending=false;}
  }
  const measure=(v:number)=>v.toFixed(1);
</script>

<section class="inventory-panel" aria-label="Inventory and home storage">
  <header class="inventory-heading">
    <div><p class="eyebrow">YOUR POSSESSIONS</p><h2>Inventory &amp; Storage</h2></div>
    <button type="button" class="pall-framed-button" onclick={onClose}>Close storage</button>
  </header>
  {#if loading}
    <p role="status">Reading your possessions…</p>
  {:else if snapshot}
    <div class="inventory-columns">
      {#each [
        {key:'pack',title:'Carried Items',description:'Your personal possessions',data:snapshot.pack,to:'home_chest' as const,verb:'Store'},
        {key:'chest',title:'Home Chest',description:'Items kept in your rented room',data:snapshot.chest,to:'pack' as const,verb:'Take'}
      ] as group (group.key)}
        <section class="inventory-group" aria-label={group.title}>
          <h3>{group.title}</h3>
          <p class="group-description">{group.description}</p>
          <p class="capacity" aria-label="Capacity">
            Weight: {measure(group.data.weightKg)} / {measure(group.data.maxWeightKg)} kg
            <span aria-hidden="true"> · </span>
            Volume: {measure(group.data.volumeL)} / {measure(group.data.maxVolumeL)} L
          </p>
          {#if group.data.items.length===0}
            <p class="empty">Nothing here.</p>
          {:else}
            <ul class="item-list">
              {#each group.data.items as item (item.id)}
                <li class="item-row">
                  <div class="item-information">
                    <strong>{item.name}</strong>
                    {#if item.quantity>1}<span> × {item.quantity}</span>{/if}
                    <small>{item.category} · {measure(item.weightKg*item.quantity)} kg
                      · {measure(item.volumeL*item.quantity)} L</small>
                    {#if item.description}<small>{item.description}</small>{/if}
                  </div>
                  {#if item.stackable&&item.quantity>1}
                    <label class="quantity-label">Qty
                      <input type="number" min="1" max={item.quantity} step="1"
                        disabled={pending||!snapshot.storageEnabled}
                        value={amounts[item.id]??item.quantity}
                        oninput={event=>amounts[item.id]=Number(event.currentTarget.value)} />
                    </label>
                  {/if}
                  <button type="button" class="transfer"
                    disabled={pending||!snapshot.storageEnabled}
                    aria-label={group.verb+' '+item.name}
                    onclick={()=>{void transfer(item,group.to);}}>{group.verb}</button>
                </li>
              {/each}
            </ul>
          {/if}
        </section>
      {/each}
    </div>
    <p class="provisional">Weights and capacity are provisional playtest values.
      Equipment slots, durability effects and trading are not active yet.</p>
    {#if !snapshot.storageEnabled}
      <p>Home chest access unlocks after reaching your rented room.</p>
    {/if}
  {/if}
  {#if error}<p class="inventory-error" role="alert">{error}</p>
    <button type="button" class="retry" onclick={()=>{void reload();}}>Reload inventory</button>{/if}
</section>
<style>
  .inventory-panel{padding:20px clamp(15px,3vw,44px);background:#e6d5b5;
    border-top:2px solid #94704a;color:#261a10;font:15px/1.4 Georgia,serif}
  .inventory-heading{display:flex;justify-content:space-between;align-items:center;
    gap:16px;max-width:1100px;margin:0 auto 16px}
  .inventory-heading h2{margin:2px 0;font:600 25px/1.25 Georgia,serif}
  .eyebrow{font:700 11px/1.2 Arial,sans-serif;letter-spacing:.1em;margin:0}
  .inventory-columns{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));
    gap:16px;max-width:1100px;margin:auto}
  .inventory-group{border:1px solid #a38b6a;background:#f3e2c3;padding:14px;min-width:0}
  .inventory-group h3{font:600 20px Georgia,serif;margin:0 0 3px}
  .group-description{margin:0;color:#76543b;font-size:13px}
  .capacity{padding:8px 0;border-bottom:1px solid #bda78a;margin:6px 0 12px;
    font:600 13px/1.4 Georgia,serif}
  .empty{color:#79634a;font-style:italic}
  .item-list{padding:0;margin:0;list-style:none;display:grid;gap:7px}
  .item-row{display:flex;align-items:center;gap:8px;min-width:0;
    border-bottom:1px solid #d4bfa1;padding:7px 0}
  .item-information{flex:1;min-width:0}
  .item-information small{display:block;color:#6b5140;font:12px/1.4 Georgia,serif}
  .quantity-label{display:grid;gap:2px;font:700 11px Georgia,serif}
  .quantity-label input{width:54px;padding:5px;border:1px solid #ab8560;
    border-radius:2px;background:#fff4dc;color:#302011;font:14px Georgia,serif}
  .transfer,.retry{border:1px solid #795638;padding:7px 10px;background:#483226;
    color:#f4deb8;cursor:pointer;font:700 13px Georgia,serif}
  .transfer:disabled{opacity:.45;cursor:wait}
  .transfer:hover:not(:disabled),.retry:hover{background:#65432b}
  .provisional{max-width:1100px;margin:12px auto 0;color:#6b5543;font-size:12px}
  .inventory-error{max-width:1100px;margin:12px auto;color:#9e281d;font-weight:700}
  @media(max-width:800px){.inventory-columns{grid-template-columns:1fr}}
  @media(max-width:500px){.inventory-heading{align-items:flex-start;flex-direction:column}}
</style>
