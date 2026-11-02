<script lang="ts">
  import {onMount} from 'svelte';
  import {page} from '$app/state';
  import type {WageClaimState,WageClaimAction} from '@the-pall/game-core';
  import TutorialShell from '$lib/TutorialShell.svelte';
  import MillhandWageClaimScene from '$lib/MillhandWageClaimScene.svelte';

  type Character={
    id:string;name:string;origin:string;sex:string;coins:number;
    health:{current:number;maximum:number};
    startingLocation:string;tutorial:{stage:number;status:string};
  };
  type Snapshot={stage:number;tutorialStatus:string;state:WageClaimState;
    availableActions:WageClaimAction[];
    tutorialPayout:{coins:number;ordinaryXp:number;items:number}};
  let character=$state<Character|null>(null);
  let snapshot=$state<Snapshot|null>(null);
  let status=$state<'loading'|'ready'|'login'|'missing'|'stage-four'|'schema'|'unavailable'>('loading');
  let pending=$state(false);
  let errorMessage=$state('');
  let retryId:string|null=null;
  let retrySignature:string|null=null;
  const id=$derived(page.params.id);

  async function refresh(){
    try{
      const [c,w]=await Promise.all([
        fetch('/api/characters/'+encodeURIComponent(id),{cache:'no-store'}),
        fetch('/api/characters/'+encodeURIComponent(id)+'/millhand/wage-claim',{cache:'no-store'})
      ]);
      if(c.status===401||w.status===401){status='login';return;}
      if(c.status===404||w.status===404){status='missing';return;}
      if(w.status===409){status='stage-four';return;}
      if(w.status===503){status='schema';return;}
      if(!c.ok||!w.ok){status='unavailable';return;}
      character=(await c.json() as {character:Character}).character;
      snapshot=await w.json() as Snapshot;
      status='ready';
    }catch{status='unavailable';}
  }
  onMount(()=>{void refresh();});

  async function perform(action:WageClaimAction){
    const revision=snapshot?.state.revision;
    if(pending||revision===undefined||!snapshot?.availableActions.includes(action)||!character)return;
    pending=true;errorMessage='';
    const signature=JSON.stringify([action,revision]);
    if(retrySignature!==signature||!retryId){
      retryId=crypto.randomUUID();retrySignature=signature;
    }
    try{
      const response=await fetch('/api/characters/'+encodeURIComponent(character.id)+'/millhand/wage-claim',{
        method:'POST',headers:{'content-type':'application/json'},
        body:JSON.stringify({action,expectedRevision:revision,requestId:retryId})
      });
      const body=await response.json() as Snapshot&{error?:string};
      if(response.ok){
        snapshot=body;
        character={...character,tutorial:{stage:body.stage,status:body.tutorialStatus}};
        retryId=null;retrySignature=null;
      }else{
        errorMessage=body.error==='stale_revision'?'The saved conversation changed elsewhere. The scene has been reloaded.'
          :body.error==='wrong_wage_claim_phase'?'That action is not available now.'
          :body.error==='stage_four_exit_required'?'You must leave the workplace before continuing.'
          :'Could not save the conversation: '+(body.error??response.status);
        if(response.status===409){retryId=null;retrySignature=null;await refresh();}
      }
    }catch{
      errorMessage='The server could not be reached. Retry the action; the same request will not repeat the conversation.';
    }finally{pending=false;}
  }
</script>

<svelte:head><title>The Pall — On the way home</title></svelte:head>
{#if status==='ready'&&character&&snapshot}
  <TutorialShell {character} sceneLocation="Industrial service passage">
    <MillhandWageClaimScene {snapshot} {pending} {errorMessage} {perform}/>
  </TutorialShell>
{:else}
  <main class="fallback">
    {#if status==='loading'}<p role="status">Loading your journey home…</p>
    {:else if status==='login'}<h1>Sign in required</h1><p><a href="/account">Account</a></p>
    {:else if status==='missing'}<h1>Character not found</h1>
    {:else if status==='schema'}
      <h1>Stage 5 setup is incomplete</h1>
      <p>Run <code>npm run wage-claim:migrate</code> from the platform folder and restart the API.</p>
    {:else if status==='stage-four'}
      <h1>Finish your current work</h1>
      <p>The journey home begins after you leave the workplace.</p>
      <p><a href={'/characters/'+id+'/millhand/second-job'}>Return to your second job</a></p>
    {:else}<h1>Character service unavailable</h1><p>Check the API and Stage 5 migration.</p>{/if}
    <nav><a href={'/characters/'+id}>Character</a> · <a href="/characters">Characters</a></nav>
  </main>
{/if}
<style>
  :global(body){margin:0;background:#151717;color:#eadfcf;font-family:Georgia,serif}
  :global(a){color:#dcb98b}
  .fallback{max-width:750px;margin:6vh auto;padding:30px;background:#24211e;border:1px solid #72583e}
  nav{margin-top:25px}
</style>
