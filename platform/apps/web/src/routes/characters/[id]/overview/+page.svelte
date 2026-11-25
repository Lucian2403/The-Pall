<script lang="ts">
  import {page} from '$app/state';
  import TutorialShell from '$lib/TutorialShell.svelte';
  import FreePlayAnnouncement from '$lib/FreePlayAnnouncement.svelte';
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
  let requestGeneration=0;
  async function refresh(requestedId:string){
    const generation=++requestGeneration;
    const current=()=>generation===requestGeneration&&requestedId===id;
    character=null;access=null;status='loading';message='';
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
      if(boundary.unlocked!==true||saved.id!==requestedId||
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
<svelte:head><title>The Pall — Free Play Home</title></svelte:head>

{#if status==='ready'&&character?.id===id&&access?.unlocked}
  <TutorialShell {character} activePage="overview" sceneLocation="Grand Cylinder City · Overview">
    <main class="free-play-entry" aria-labelledby="free-play-home-title">
      <span class="eyebrow">GRAND CYLINDER CITY · FREE PLAY</span>
      <h1 id="free-play-home-title">Your life within the walls</h1>
      <p>The eight-stage introduction is complete. Your saved character, Inventory
        and Journal remain available. You can return to your rented room.</p>
      <p>City navigation, ordinary paid jobs and timed activities are not yet available.
        They will open as their gameplay systems are implemented.</p>
      <nav class="entry-actions" aria-label="Available Free Play entry actions">
        <a class="pall-framed-button" href={href+'/home'}>Visit rented room</a>
        <a class="pall-framed-button" href={href}>Character record</a>
      </nav>
    </main>
    {#if access.announcementSeen===false}
      {#key character.id}
        {@const announcementId=character.id}
        <FreePlayAnnouncement characterId={announcementId} onAcknowledged={()=>{
          if(id===announcementId&&character?.id===announcementId&&access?.unlocked){
            access={...access,announcementSeen:true};
          }
        }}/>
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
  .free-play-entry{margin:clamp(18px,4vw,45px) auto;max-width:850px;
    padding:clamp(24px,3.5vw,45px);background:#27211b;
    border:1px solid #856545;box-shadow:0 8px 27px #0008}
  .eyebrow{display:block;font:600 12px var(--pall-font-label,'Arial Narrow',sans-serif);
    letter-spacing:.13em;color:#cdaa78}
  h1{margin:12px 0 20px;font:600 clamp(30px,3.4vw,44px)/1.2 Georgia,serif;
    color:#f0dbc0}
  .free-play-entry p{max-width:69ch;line-height:1.65;color:#dcc5a6}
  .entry-actions{display:flex;flex-wrap:wrap;gap:12px;margin-top:26px}
  .entry-actions a{min-height:44px;display:inline-flex;align-items:center;
    text-decoration:none;padding:8px 15px;color:#2c2117}
  .entry-actions a:focus-visible{outline:2px solid #e3bb7f;outline-offset:3px}
  .free-play-fallback{max-width:720px;margin:7vh auto;padding:28px;
    background:#26211d;border:1px solid #785d41}
  .free-play-fallback a{display:inline-block;margin:12px 15px 0 0;color:#e7bd81}
</style>
