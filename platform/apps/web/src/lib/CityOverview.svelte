<script lang="ts">
 import {onMount} from 'svelte';
 import {goto} from '$app/navigation';
 import {cityWalkingSeconds,type CityOverviewSnapshot,type CityPointOfInterest} from '@the-pall/game-core';
 import CityMapViewport from './CityMapViewport.svelte';
 import {cityMapAssets as assets} from './city-map-assets';
 import {createCityMapAudio} from './city-map-audio';

 let {characterId,onReviewAnnouncement}:{characterId:string;onReviewAnnouncement:()=>void}=$props();
 let city=$state<CityOverviewSnapshot|null>(null),selectedId=$state(''),search=$state(''),directoryOpen=$state(false);
 let status=$state<'loading'|'ready'|'error'>('loading'),errorMessage=$state(''),pending=$state(false);
 let time=$state(0),clockBase=0,clockAt=0,disposed=false,requestInFlight=false;
 let controller:AbortController|undefined;
 let audio:ReturnType<typeof createCityMapAudio>|undefined;
 let failedIcons=$state<Record<string,boolean>>({});
 const base=$derived('/api/characters/'+encodeURIComponent(characterId)+'/free-play/city');
 const root=$derived('/characters/'+encodeURIComponent(characterId));
 const points=$derived([...(city?.pointsOfInterest??[])].sort((a,b)=>a.displayOrder-b.displayOrder));
 const filtered=$derived(points.filter(p=>p.name.toLowerCase().includes(search.trim().toLowerCase())));
 const selected=$derived(points.find(p=>p.id===selectedId));
 const current=$derived(points.find(p=>p.id===city?.currentLocationId));
 const travelDestination=$derived(points.find(p=>p.id===city?.journey?.destinationId));
 const seconds=$derived(city&&current&&selected?cityWalkingSeconds(current.position,selected.position,city.config):0);
 const remaining=$derived(city?.journey?Math.max(0,Math.ceil((Date.parse(city.journey.arrivesAt)-time)/1000)):0);
 const progress=$derived(city?.journey?Math.max(0,Math.min(100,100*(time-Date.parse(city.journey.startedAt))/(Date.parse(city.journey.arrivesAt)-Date.parse(city.journey.startedAt)))):0);
 function href(p:CityPointOfInterest|undefined){
  return p?.availability==='available'&&p.destination&&/^[a-z0-9-]+(?:\/[a-z0-9-]+)*$/.test(p.destination)?root+'/'+p.destination:null;
 }
 function select(id:string){selectedId=id;}
 async function apply(snapshot:CityOverviewSnapshot){
  const previous=city;
  clockBase=Date.parse(snapshot.serverNow);clockAt=performance.now();time=clockBase;
  city=snapshot;status='ready';errorMessage='';
  if(!selectedId||!snapshot.pointsOfInterest.some(p=>p.id===selectedId))
   selectedId=snapshot.journey?.destinationId??snapshot.currentLocationId;
  audio?.set(snapshot.journey?'walking':'city');
  if(previous?.journey&&!snapshot.journey&&snapshot.currentLocationId===previous.journey.destinationId){
   const destination=href(snapshot.pointsOfInterest.find(p=>p.id===snapshot.currentLocationId));
   if(destination&&!disposed){audio?.set(null);await goto(destination);}
  }
 }
 async function load(){
  if(requestInFlight||pending||disposed)return;
  requestInFlight=true;
  controller=new AbortController();
  try{
   const response=await fetch(base,{cache:'no-store',signal:controller.signal});
   if(!response.ok)throw Error(response.status===503?'City database update required: npm run city-travel:migrate':response.status===409?'City access has changed. Reopen the city overview.':'City destinations could not be loaded.');
   const snapshot=await response.json() as CityOverviewSnapshot;
   if(disposed)return;
   if(snapshot.cityId!=='grand-cylinder-city'||!Array.isArray(snapshot.pointsOfInterest)||!snapshot.config||!snapshot.serverNow)throw Error('City data unavailable');
   await apply(snapshot);
  }catch(error){if(!disposed){errorMessage=error instanceof Error?error.message:'City destinations could not be loaded.';status=city?'ready':'error';}}
  finally{requestInFlight=false;}
 }
 async function walk(){
  if(!city||!selected||selected.availability!=='available'||city.journey||pending||requestInFlight)return;
  if(selected.id===city.currentLocationId){const destination=href(selected);if(destination)await goto(destination);return;}
  pending=true;errorMessage='';
  controller=new AbortController();
  try{
   const response=await fetch(base+'/travel',{method:'POST',headers:{'content-type':'application/json'},signal:controller.signal,
    body:JSON.stringify({destinationId:selected.id,expectedRevision:city.revision,requestId:crypto.randomUUID()})});
   if(!response.ok){const result=await response.json().catch(()=>({}));throw Error(result.error==='travel_in_progress'?'Travel is already in progress.':result.error==='destination_unavailable'?'Destination unavailable.':'Travel request could not be confirmed.');}
   const snapshot=await response.json() as CityOverviewSnapshot;
   if(!disposed)await apply(snapshot);
  }catch(error){if(!disposed)errorMessage=error instanceof Error?error.message:'Connection interrupted.';}
  finally{pending=false;}
 }
 onMount(()=>{
  audio=createCityMapAudio();void load();
  let lastPoll=0;
  const timer=window.setInterval(()=>{
   if(city){time=clockBase+performance.now()-clockAt;
    const interval=city.journey?1000:5000;
    if(performance.now()-lastPoll>=interval){lastPoll=performance.now();void load();}
   }
  },250);
  const resume=()=>{if(!document.hidden)void load();};
  document.addEventListener('visibilitychange',resume);window.addEventListener('focus',resume);
  return ()=>{disposed=true;controller?.abort();clearInterval(timer);document.removeEventListener('visibilitychange',resume);window.removeEventListener('focus',resume);audio?.dispose();};
 });
</script>
{#snippet poiIcon(p:CityPointOfInterest)}
 {#if assets.useFinalIcons&&!failedIcons[p.id]}<img class="poi-icon" src={p.icon} alt="" onerror={()=>{failedIcons={...failedIcons,[p.id]:true};}}/>
 {:else}<span class="poi-icon symbol" aria-hidden="true">{p.symbol}</span>{/if}
{/snippet}
<main class="city-workspace" aria-labelledby="city-overview-title">
 <header class="heading"><div><h1 id="city-overview-title">City Map</h1><p>Grand Cylinder City — Key locations within a short walk.</p></div>
 <button class="review" type="button" onclick={onReviewAnnouncement}>Review announcement</button></header>
 {#if status==='loading'}<p role="status">Loading city destinations…</p>
 {:else if status==='error'}<p role="alert">{errorMessage}</p><button type="button" onclick={()=>{void load();}}>Retry</button>
 {:else if city}
  <div class="workspace">
   <aside class="directory panel" class:expanded={directoryOpen} aria-label="Location directory">
    <button class="directory-toggle" type="button" aria-expanded={directoryOpen} onclick={()=>{directoryOpen=!directoryOpen;}}>Locations ({points.length}) {directoryOpen?'−':'+'}</button>
    <div class="directory-body">
     <label class="search"><span class="visually-hidden">Search locations</span><span aria-hidden="true">⌕</span><input type="search" bind:value={search} placeholder="Search location…"/></label>
     <nav aria-label="City points of interest">
      {#each filtered as point (point.id)}
       <button type="button" class="directory-item" class:selected={point.id===selectedId} aria-pressed={point.id===selectedId} onclick={()=>select(point.id)}>
        {@render poiIcon(point)}<span class="location-name">{point.name}</span>
        {#if point.id===city.currentLocationId}<small class="current-badge">Current location</small>
        {:else if point.id===city.journey?.destinationId}<small>Walking</small>
        {:else if point.availability==='unavailable'}<small>Unavailable</small>{/if}
       </button>
      {:else}<p class="no-results">No matching locations.</p>{/each}
     </nav>
    </div>
   </aside>
   <CityMapViewport {points} width={city.config.width} height={city.config.height}
    {selectedId} currentId={city.currentLocationId} travelId={city.journey?.destinationId??null} onSelect={select}/>
   <aside class="details panel" aria-label="Selected location">
    {#if city.journey}
     <div class="journey" role="status"><strong>Walking to {travelDestination?.name??'destination'}</strong><p>{remaining} sec remaining</p><progress max="100" value={progress} aria-label="Journey progress"></progress></div>
    {/if}
    {#if selected}
     <h2>{@render poiIcon(selected)}{selected.name}</h2><p>{selected.description}</p>
     <p class="walking-time">{selected.id===city.currentLocationId?'Current location':seconds+' sec walk'}</p>
     {#if selected.availability==='unavailable'}<p class="availability">Unavailable — scene not implemented.</p>{/if}
     <button type="button" class="walk pall-framed-button" disabled={pending||!!city.journey||selected.availability!=='available'} onclick={()=>{void walk();}}>
      {pending?'Starting…':selected.id===city.currentLocationId?'Enter location':'Walk there'}
     </button>
     <p class="hint">Selecting a location does not start travel. Use “Walk there” to move to it.</p>
    {/if}
    {#if errorMessage}<p role="alert">{errorMessage}</p><button type="button" onclick={()=>{void load();}}>Retry</button>{/if}
   </aside>
  </div>
 {/if}
</main>
<style>
 .city-workspace{box-sizing:border-box;min-width:0;padding:clamp(10px,1.5vw,24px);color:#392518;background:radial-gradient(ellipse at 45% 30%,#f1dbaf,#d0b17e);font-family:var(--pall-font-reading,Georgia,serif);flex:1}
 .heading{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:12px;flex-wrap:wrap}
 .heading>div{display:flex;gap:18px;align-items:baseline;flex-wrap:wrap}
 h1{font-size:clamp(26px,3vw,42px);margin:0;line-height:1.1} .heading p{margin:0;font-style:italic}
 .review{background:transparent;border:1px solid #8f6f48;color:#50351e;padding:5px 10px;min-height:34px;cursor:pointer}
 .workspace{display:grid;grid-template-columns:minmax(180px,1fr) minmax(0,2.8fr) minmax(180px,1.15fr);gap:10px;min-height:clamp(440px,68vh,760px)}
 .panel{border:3px double #8a6845;background:#e6cca0a6;min-width:0;min-height:0}
 .directory{display:flex;flex-direction:column;overflow:hidden}.directory-body{display:flex;flex:1;min-height:0;flex-direction:column}
 .search{margin:9px;display:flex;align-items:center;gap:6px;padding:6px;border:1px solid #8b6a46}.search input{width:100%;min-width:0;color:#392518;border:0;background:transparent;font:inherit}
 .directory nav{max-height:clamp(390px,61vh,700px);overflow:auto}
 .directory-item{width:100%;min-height:52px;display:flex;align-items:center;gap:8px;padding:8px 10px;text-align:left;border:0;border-top:1px solid #b79a70;color:inherit;background:transparent;font:600 15px/1.2 var(--pall-font-reading,Georgia,serif);cursor:pointer;flex-wrap:wrap}
 .directory-item.selected{background:#674521;color:#f8e2b7}.directory-item:hover:not(.selected){background:#bc955f44}
 .location-name{flex:1}.directory-item small{font-size:10px;color:inherit;font-weight:400}.current-badge{background:#60431e;color:#fff2ce!important;padding:3px 5px;border-radius:3px}
 .poi-icon{width:24px;height:24px;object-fit:contain;flex:none}.symbol{display:inline-grid;place-items:center;font:700 23px Georgia,serif}
 .details{padding:clamp(12px,1.5vw,24px);overflow-wrap:anywhere}
 .details h2{display:flex;align-items:center;gap:10px;margin:8px 0 20px;font-size:clamp(22px,2vw,32px);border-bottom:1px solid #98754c;padding-bottom:14px}
 .details p{line-height:1.55}.walking-time{font-weight:700;margin:24px 0}.availability{font-size:13px;color:#704b34}
 .walk{display:block;width:100%;min-height:48px;margin:18px 0;color:#362417;cursor:pointer;font-size:18px}.walk:disabled{opacity:.55;cursor:not-allowed}
 .hint{border-top:1px solid #b19670;padding-top:14px;font-size:14px}.journey{background:#624728;color:#f6e4bf;padding:12px;margin-bottom:12px}.journey progress{width:100%;accent-color:#bd913f}
 .directory-toggle{display:none}.no-results{padding:10px}.visually-hidden{position:absolute;clip:rect(0,0,0,0);width:1px;height:1px;overflow:hidden}
 button:focus-visible,input:focus-visible{outline:2px solid #a26112;outline-offset:2px}
 @media(max-width:1100px){.workspace{grid-template-columns:minmax(150px,1fr) minmax(0,2.4fr);min-height:0}.details{grid-column:1/-1}}
 @media(max-width:650px){.city-workspace{padding:8px}.workspace{display:flex;flex-direction:column;gap:8px}.directory{order:0}.directory-toggle{display:block;min-height:44px;color:#352517;background:transparent;border:0;font:700 16px Georgia,serif;cursor:pointer}.directory:not(.expanded) .directory-body{display:none}.directory nav{max-height:230px}.details{order:2}.heading p{font-size:13px}.heading>div{gap:4px}.review{font-size:12px}}
</style>
