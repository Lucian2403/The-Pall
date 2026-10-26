<script lang="ts">
  import {onMount} from 'svelte';
  import {page} from '$app/state';
  import type {PlateworkAction, PlateworkState} from '@the-pall/game-core';
  import TutorialShell from '$lib/TutorialShell.svelte';
  import MillhandWorkScene from '$lib/MillhandWorkScene.svelte';

  type Character = {
    id:string;name:string;origin:string;sex:string;coins:number;
    health:{current:number;maximum:number};startingLocation:string;
    tutorial:{stage:number;status:string};
  };
  type WorkSnapshot = {
    stage:number;tutorialStatus:string;work:PlateworkState|null;
    availableActions:PlateworkAction[];requiredNumberAuthored:boolean;
    tutorialPayout:{coins:number;ordinaryXp:number;items:number};
  };
  let character = $state<Character|null>(null);
  let work = $state<WorkSnapshot|null>(null);
  let status = $state<'loading'|'ready'|'login'|'missing'|'unavailable'|'stage-one'>('loading');
  let committing = $state(false);
  let errorMessage = $state('');
  let retryId = $state<string|null>(null);
  let retrySignature = $state<string|null>(null);
  const characterId = $derived(page.params.id);

  async function refresh() {
    try {
      const [c,w] = await Promise.all([
        fetch('/api/characters/'+encodeURIComponent(characterId),{cache:'no-store'}),
        fetch('/api/characters/'+encodeURIComponent(characterId)+'/millhand/work',{cache:'no-store'})
      ]);
      if(c.status===401||w.status===401){status='login';return;}
      if(c.status===404||w.status===404){status='missing';return;}
      if(!c.ok||!w.ok){status='unavailable';return;}
      const body=await c.json() as {character:Character};
      const snapshot=await w.json() as WorkSnapshot;
      character=body.character;
      work=snapshot;
      status=snapshot.work?'ready':'stage-one';
    } catch {
      status='unavailable';
    }
  }
  onMount(()=>{void refresh();});

  async function perform(action:PlateworkAction) {
    const revision=work?.work?.revision;
    if(committing||revision===undefined||!character||!work?.availableActions.includes(action))return;
    committing=true;errorMessage='';
    const signature=JSON.stringify([action,revision]);
    if(retrySignature!==signature||!retryId){
      retryId=crypto.randomUUID();
      retrySignature=signature;
    }
    try {
      const response=await fetch('/api/characters/'+encodeURIComponent(character.id)+'/millhand/work',{
        method:'POST',headers:{'content-type':'application/json'},
        body:JSON.stringify({action,expectedRevision:revision,requestId:retryId})
      });
      const result=await response.json() as WorkSnapshot & {error?:string};
      if(response.ok){
        work=result;
        if(character)character={...character,tutorial:{stage:result.stage,status:result.tutorialStatus}};
        retryId=null;retrySignature=null;
      } else {
        errorMessage=result.error==='stale_revision'
          ? 'Your work changed in another tab. The current state has been reloaded.'
          : result.error==='wrong_work_phase'
            ? 'That action is not available at this point in the work.'
            : 'Could not save the work: '+(result.error??response.status);
        if(response.status===409){retryId=null;retrySignature=null;await refresh();}
      }
    } catch {
      errorMessage='The API could not be reached. Try again; the same request will not repeat the action.';
    } finally {
      committing=false;
    }
  }
</script>

<svelte:head><title>The Pall — Marking the Plates</title></svelte:head>

{#if status==='ready' && character && work?.work}
  <TutorialShell {character}>
    <MillhandWorkScene work={work.work} available={work.availableActions}
      pending={committing} {errorMessage} {perform}/>
    {#if work.work.phase==='COMPLETE'}
      <p class="work-complete">The work paper was returned. The saved tutorial is at Stage 3; that scene has not yet been connected. <a href={'/characters/'+character.id}>Return to character</a></p>
    {/if}
    {#if !work.requiredNumberAuthored}
      <p class="data-gate">Development note: the actual council worker number is not yet authored. No numeric identification or stamp-matching puzzle is being claimed as final.</p>
    {/if}
  </TutorialShell>
{:else}
  <main class="fallback">
    {#if status==='loading'}<p role="status">Loading saved platework…</p>
    {:else if status==='login'}<h1>Sign in required</h1><p><a href="/account">Account access</a></p>
    {:else if status==='missing'}<h1>Character not found</h1><p>This character does not belong to your account or is not a Millhand.</p>
    {:else if status==='stage-one'}<h1>The work has not started</h1><p>Finish Guther's introduction and take the work paper first.</p><a href={'/characters/'+characterId+'/opening'}>Return to the workshop opening</a>
    {:else}<h1>Character service unavailable</h1><p>Check the API and run the new platework migration.</p>{/if}
    <nav><a href={'/characters/'+characterId}>Character details</a> · <a href="/characters">All characters</a></nav>
  </main>
{/if}

<style>
  :global(body){margin:0;background:#151717;color:#e9dfcd;font-family:Georgia,serif}
  :global(a){color:#e0bc8b}
  .fallback{max-width:760px;margin:6vh auto;padding:30px;background:#24221f;border:1px solid #756047}
  .fallback h1{font-weight:normal}
  .fallback nav{margin-top:25px;border-top:1px solid #574633;padding-top:20px}
  .work-complete{margin:0;padding:18px;background:#30271e;color:#e8d4b7;font:14px/1.6 sans-serif}
  .data-gate{margin:0;padding:9px 14px;background:#171513;color:#b09d88;font:12px/1.45 sans-serif}
</style>
