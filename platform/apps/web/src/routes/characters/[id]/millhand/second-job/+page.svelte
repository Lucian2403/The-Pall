<script lang="ts">
  import {onMount} from 'svelte';
  import {page} from '$app/state';
  import {goto} from '$app/navigation';
  import type {SecondJobState,SecondJobAction} from '@the-pall/game-core';
  import TutorialShell from '$lib/TutorialShell.svelte';
  import MillhandSecondJobScene from '$lib/MillhandSecondJobScene.svelte';

  type Character={
    id:string;name:string;origin:string;sex:string;coins:number;
    health:{current:number;maximum:number};
    startingLocation:string;tutorial:{stage:number;status:string}
  };
  type Snapshot={stage:number;tutorialStatus:string;state:SecondJobState;
    availableActions:SecondJobAction[];
    tutorialPayout:{coins:number;ordinaryXp:number;items:number}};
  let character=$state<Character|null>(null);
  let snapshot=$state<Snapshot|null>(null);
  let status=$state<'loading'|'ready'|'login'|'missing'|'stage-three'|'unavailable'>('loading');
  let pending=$state(false);
  let errorMessage=$state('');
  let retryId:string|null=null;
  let retrySignature:string|null=null;
  const id=$derived(page.params.id);

  async function refresh(){
    try{
      const [c,j]=await Promise.all([
        fetch('/api/characters/'+encodeURIComponent(id),{cache:'no-store'}),
        fetch('/api/characters/'+encodeURIComponent(id)+'/millhand/second-job',{cache:'no-store'})
      ]);
      if(c.status===401||j.status===401){status='login';return;}
      if(c.status===404||j.status===404){status='missing';return;}
      if(j.status===409){status='stage-three';return;}
      if(!c.ok||!j.ok){status='unavailable';return;}
      const body=await c.json() as {character:Character};
      character=body.character;
      snapshot=await j.json() as Snapshot;
      status='ready';
    }catch{status='unavailable';}
  }
  onMount(()=>{void refresh();});

  async function perform(action:SecondJobAction){
    const revision=snapshot?.state.revision;
    if(pending||revision===undefined||!snapshot?.availableActions.includes(action)||!character)return;
    pending=true;errorMessage='';
    const signature=JSON.stringify([action,revision]);
    if(retrySignature!==signature||!retryId){retryId=crypto.randomUUID();retrySignature=signature;}
    try{
      const response=await fetch('/api/characters/'+encodeURIComponent(character.id)+'/millhand/second-job',{
        method:'POST',headers:{'content-type':'application/json'},
        body:JSON.stringify({action,expectedRevision:revision,requestId:retryId})
      });
      const body=await response.json() as Snapshot & {error?:string};
      if(response.ok){
        snapshot=body;
        character={...character,tutorial:{stage:body.stage,status:body.tutorialStatus}};
        retryId=null;retrySignature=null;
      }else{
        errorMessage=body.error==='stale_revision'?'Your saved work changed elsewhere. The scene has been reloaded.'
          :body.error==='wrong_second_job_phase'?'That action is not available yet.'
          :'Could not save the work: '+(body.error??response.status);
        if(response.status===409){retryId=null;retrySignature=null;await refresh();}
      }
    }catch{errorMessage='The server could not be reached. Retry the action; the same request will not repeat the work.';}
    finally{pending=false;}
  }
</script>

<svelte:head><title>The Pall — Millhand second job</title></svelte:head>
{#if status==='ready' && character && snapshot}
  <TutorialShell {character}>
    <MillhandSecondJobScene {snapshot} {pending} {errorMessage} {perform}/>
    {#if snapshot.state.phase==='DONE'}
      <div class="follow-up">
        The job is finished. The Wage Claim with Flint is the next chapter. That scene has not yet been connected.
        <a href={'/characters/'+character.id}>View character</a>
      </div>
    {/if}
  </TutorialShell>
{:else}
  <main class="fallback">
    {#if status==='loading'}<p role="status">Loading saved council work…</p>
    {:else if status==='login'}<h1>Sign in required</h1><p><a href="/account">Account</a></p>
    {:else if status==='missing'}<h1>Character not found</h1>
    {:else if status==='stage-three'}
      <h1>Finish The Missing Stamp first</h1>
      <p>Your chosen route must be saved before this job can begin.</p>
      <p><a href={'/characters/'+id+'/millhand/missing-stamp'}>Return to Guther's workshop</a></p>
    {:else}<h1>Character service unavailable</h1><p>Check the API and Stage 4 migration.</p>{/if}
    <nav><a href={'/characters/'+id}>Character</a> · <a href="/characters">Characters</a></nav>
  </main>
{/if}
<style>
  :global(body){margin:0;background:#151717;color:#eadfcf;font-family:Georgia,serif}
  :global(a){color:#dcb98b}
  .fallback{max-width:750px;margin:6vh auto;padding:30px;background:#24211e;border:1px solid #72583e}
  .follow-up{padding:14px 18px;background:#30271e;color:#edddc4;font:14px/1.5 sans-serif}
  .follow-up a{margin-left:12px}
  nav{margin-top:25px}
</style>
