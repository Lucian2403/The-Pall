<script lang="ts">
  import {page} from '$app/state';
  import type {ActivityStatusSnapshot} from '@the-pall/game-core';
  import TutorialShell from '$lib/TutorialShell.svelte';
  import FreePlayAnnouncement from '$lib/FreePlayAnnouncement.svelte';
  import CityOverview from '$lib/CityOverview.svelte';
  import '$lib/pall-owner-ui.css';

  type SavedCharacter={
    id:string;name:string;origin:string;sex:string;avatarId?:string|null;
    coins:number;health:{current:number;maximum:number};
    startingLocation:string;welcomeSeen?:boolean;
    tutorial:{stage:number;status:string};
  };
  type Access={unlocked:true;announcementSeen:boolean};
  const id=$derived(page.params.id!);
  const href=$derived('/characters/'+encodeURIComponent(id));
  let character=$state<SavedCharacter|null>(null);
  let access=$state<Access|null>(null);
  let status=$state<'loading'|'ready'|'login'|'missing'|'locked'|'schema'|'error'>('loading');
  let message=$state('');
  let reviewOpen=$state(false);
  let activityStatus=$state<ActivityStatusSnapshot|null>(null);
  let requestGeneration=0;
  async function refresh(requestedId:string){
    const generation=++requestGeneration;
    const current=()=>generation===requestGeneration&&requestedId===id;
    character=null;access=null;status='loading';message='';reviewOpen=false;activityStatus=null;
    try{
      const base='/api/characters/'+encodeURIComponent(requestedId);
      const [person,gate]=await Promise.all([
        fetch(base,{cache:'no-store'}),fetch(base+'/free-play',{cache:'no-store'})
      ]);
      if(!current())return;
      if(person.status===401||gate.status===401){status='login';return;}
      if(person.status===404||gate.status===404){status='missing';return;}
      if(gate.status===409){status='locked';return;}
      if(gate.status===503){status='schema';return;}
      if(!person.ok||!gate.ok)throw Error('free_play_unavailable');
      const saved=(await person.json() as {character:SavedCharacter}).character;
      const boundary=await gate.json() as Access;
      if(!current())return;
      if(boundary.unlocked!==true||typeof boundary.announcementSeen!=='boolean'||saved.id!==requestedId||
        saved.tutorial.stage!==8||saved.tutorial.status!=='COMPLETED')
        throw Error('free_play_state_mismatch');
      character=saved;access=boundary;status='ready';
    }catch(error){
      if(current()){
        message=error instanceof Error?error.message:'Free Play unavailable';
        status='error';
      }
    }
  }
  $effect(()=>{
    const requestedId=id;
    void refresh(requestedId);
    return ()=>{requestGeneration++;};
  });
</script>
<svelte:head><title>The Pall — Grand Cylinder City</title></svelte:head>

{#if status==='ready'&&character?.id===id&&access?.unlocked}
  <TutorialShell {character} {activityStatus} activePage="overview" sceneLocation="Grand Cylinder City · City Map" cityMap={{href:href+'/overview'}}>
    {#if access.announcementSeen===false}
      {#key character.id}
        {@const announcementId=character.id}
        <FreePlayAnnouncement characterId={announcementId} onAcknowledged={()=>{
          if(id===announcementId&&character?.id===announcementId&&access?.unlocked){
            access={...access,announcementSeen:true};
          }
        }}/>
      {/key}
    {:else if access.announcementSeen===true}
      {#key character.id}
        <CityOverview characterId={character.id} onActivityStatus={(snapshot)=>{activityStatus=snapshot;}} onReviewAnnouncement={()=>{reviewOpen=true;}}/>
        {#if reviewOpen}
          <FreePlayAnnouncement characterId={character.id} reviewOnly onAcknowledged={()=>{reviewOpen=false;}}/>
        {/if}
      {/key}
    {/if}
  </TutorialShell>
{:else}
  <main class="free-play-fallback">
    {#if status==='loading'}
      <h1>Checking saved progress…</h1>
    {:else if status==='login'}
      <h1>Sign in required</h1><a href="/account">Account</a>
    {:else if status==='missing'}
      <h1>Character unavailable</h1>
    {:else if status==='locked'}
      <h1>Introduction not yet complete</h1>
      <p>Finish Stage VIII in the rented room before entering Free Play.</p>
    {:else if status==='schema'}
      <h1>Free Play database update required</h1>
      <p>Run <code>npm run free-play:migrate</code> from the platform directory.</p>
    {:else}
      <h1>Free Play unavailable</h1><p role="alert">{message}</p>
      <button type="button" onclick={()=>{void refresh(id);}}>Retry</button>
    {/if}
    <a href={href}>Character record</a>
    <a href="/characters">Character selection</a>
  </main>
{/if}
<style>
  :global(body){background:#171513;color:#ead6b7}
  h1{margin:12px 0 20px;font:600 clamp(30px,3.4vw,44px)/1.2 Georgia,serif;
    color:#f0dbc0}
  .free-play-fallback{max-width:720px;margin:7vh auto;padding:28px;
    background:#26211d;border:1px solid #785d41}
  .free-play-fallback a{display:inline-block;margin:12px 15px 0 0;color:#e7bd81}
</style>
