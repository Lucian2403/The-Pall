<script lang="ts">
  import {onMount} from 'svelte';
  import type {CityOverviewSnapshot,CityPointOfInterest} from '@the-pall/game-core';

  let {characterId}:{characterId:string}=$props();
  let city=$state<CityOverviewSnapshot|null>(null);
  let status=$state<'loading'|'ready'|'error'>('loading');
  let errorMessage=$state('');
  let controller:AbortController|undefined;

  function destinationHref(point:CityPointOfInterest):string|undefined{
    if(point.availability==='available'&&point.destination==='rented-room')
      return '/characters/'+encodeURIComponent(characterId)+'/home';
  }

  async function loadCity(){
    controller?.abort();
    const request=new AbortController();
    controller=request;
    const requestedId=characterId;
    status='loading';errorMessage='';city=null;
    try{
      const response=await fetch('/api/characters/'+encodeURIComponent(requestedId)+'/free-play/city',{
        cache:'no-store',signal:request.signal
      });
      if(!response.ok)throw Error(response.status===409
        ?'City access has changed. Reopen the city overview.'
        :'City destinations could not be loaded.');
      const snapshot=await response.json() as CityOverviewSnapshot;
      if(snapshot.cityId!=='grand-cylinder-city'||!Array.isArray(snapshot.pointsOfInterest))
        throw Error('City destinations could not be loaded.');
      if(request.signal.aborted||requestedId!==characterId)return;
      city=snapshot;status='ready';
    }catch(error){
      if(request.signal.aborted||requestedId!==characterId)return;
      errorMessage=error instanceof Error?error.message:'City destinations could not be loaded.';
      status='error';
    }
  }
  onMount(()=>{
    void loadCity();
    return ()=>controller?.abort();
  });
</script>

<!-- Design-neutral integration surface. The approved artwork and layout
     will replace this semantic list without changing the data/entry boundary. -->
<main class="city-overview" aria-labelledby="city-overview-title">
  <h1 id="city-overview-title">{city?.name??'Grand Cylinder City'}</h1>
  {#if status==='loading'}
    <p role="status">Loading city destinations…</p>
  {:else if status==='error'}
    <p role="alert">{errorMessage}</p>
    <button type="button" onclick={()=>{void loadCity();}}>Retry</button>
  {:else if city}
    <nav aria-label="City points of interest">
      <ul>
        {#each city.pointsOfInterest as point (point.id)}
          {@const destination=destinationHref(point)}
          <li>
            {#if destination}
              <a href={destination}>{point.name}</a>
            {:else}
              <span aria-disabled="true">{point.name} — unavailable</span>
            {/if}
          </li>
        {/each}
      </ul>
    </nav>
  {/if}
</main>
<style>
  .city-overview{min-width:0;padding:clamp(16px,3vw,32px)}
  h1{margin:0 0 20px;font:600 clamp(26px,3vw,38px)/1.2 Georgia,serif;color:#f0dbc0}
  ul{margin:0;padding-inline-start:24px}
  li{margin:8px 0}
  a{display:inline-flex;align-items:center;min-height:44px;color:#e7bd81}
  a:focus-visible,button:focus-visible{outline:2px solid #e3bb7f;outline-offset:3px}
</style>
