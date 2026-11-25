<script lang="ts">
 import {page} from '$app/state';
 import {goto} from '$app/navigation';
 import type {CityOverviewSnapshot} from '@the-pall/game-core';
 const id=$derived(page.params.id!);
 let error=$state('');
 async function resolveScene(characterId:string,signal:AbortSignal){
  const root='/characters/'+encodeURIComponent(characterId);
  try{
   const response=await fetch('/api'+root+'/free-play/city',{cache:'no-store',signal});
   if(signal.aborted)return;
   if(!response.ok){await goto(root+'/overview',{replaceState:true});return;}
   const city=await response.json() as CityOverviewSnapshot;
   if(signal.aborted)return;
   const p=city.pointsOfInterest.find(p=>p.id===city.currentLocationId);
   const scene=p?.availability==='available'&&/^[a-z0-9-]+(?:\/[a-z0-9-]+)*$/.test(p.destination)?p.destination:null;
   await goto(root+(city.journey||!scene?'/overview':'/'+scene),{replaceState:true});
  }catch{if(!signal.aborted)error='Could not restore your current scene.';}
 }
 $effect(()=>{const c=new AbortController();error='';void resolveScene(id,c.signal);return()=>c.abort();});
</script>
<main><p role="status">{error||'Restoring current scene…'}</p><a href={'/characters/'+encodeURIComponent(id)+'/overview'}>City overview</a></main>
