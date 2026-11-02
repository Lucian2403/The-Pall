<script lang="ts">
  import {onMount} from 'svelte';
  import {page} from '$app/state';
  import type {WageClaimState,WageClaimAction} from '@the-pall/game-core';
  import TutorialShell from '$lib/TutorialShell.svelte';
  import MillhandWageClaimScene from '$lib/MillhandWageClaimScene.svelte';

  type Character={
    id:string;name:string;origin:string;sex:string;avatarId?:string|null;coins:number;
    health:{current:number;maximum:number};
    stamina?:{current:number;maximum:number};
    fatigue?:{current:number;maximum:number};
    focus?:{current:number;maximum:number};
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
  let backStageError=$state('');
  let retryId:string|null=null;
  let retrySignature:string|null=null;
  const id=$derived(page.params.id);

  async function refresh(){
    try{
      const [c,f]=await Promise.all([
        fetch('/api/characters/'+encodeURIComponent(id),{cache:'no-store'}),
        fetch('/api/characters/'+encodeURIComponent(id)+'/millhand/wage-claim',{cache:'no-store'})
      ]);
      if(c.status===401||f.status===401){status='login';return;}
      if(c.status===404||f.status===404){status='missing';return;}
      if(f.status===409){status='stage-four';return;}
      if(f.status===503){status='schema';return;}
      if(!c.ok||!f.ok){status='unavailable';return;}
      const body=await c.json() as {character:Character};
      character=body.character;
      snapshot=await f.json() as Snapshot;
      status='ready';
    }catch{status='unavailable';}
  }
  onMount(()=>{void refresh();});

  async function perform(action:WageClaimAction){
    const revision=snapshot?.state.revision;
    if(pending||revision===undefined||!character||!snapshot)return;
    // Previous Dialogue belongs to the saved Stage 5 position, not to a
    // possibly stale availableActions list from a previously started API.
    // Always send an eligible Back request; old API versions must return
    // an explanatory error rather than making the button appear broken.
    const previousAllowed=action==='previous_dialogue' &&
      (snapshot.state.phase!=='OPENING'||snapshot.state.dialogueIndex>0);
    if(!previousAllowed&&!snapshot.availableActions.includes(action))return;
    pending=true;errorMessage='';backStageError='';
    const signature=JSON.stringify([action,revision]);
    if(retrySignature!==signature||!retryId){retryId=crypto.randomUUID();retrySignature=signature;}
    try{
      const response=await fetch('/api/characters/'+encodeURIComponent(character.id)+'/millhand/wage-claim',{
        method:'POST',headers:{'content-type':'application/json'},
        body:JSON.stringify({action,expectedRevision:revision,requestId:retryId})
      });
      const body=await response.json() as Snapshot & {error?:string};
      if(response.ok){
        snapshot=body;
        character={...character,tutorial:{stage:body.stage,status:body.tutorialStatus}};
        retryId=null;retrySignature=null;
        backStageError='';
      }else{
        errorMessage=body.error==='stale_revision'
          ?'Your saved conversation changed elsewhere. The scene has been reloaded.'
          :body.error==='wage_claim_schema_missing'
          ?'Stage 5 database tables are missing. Run npm run wage-claim:migrate from platform, then restart the API.'
          :body.error==='wrong_wage_claim_phase'
          ?'That action is not available in this part of the conversation.'
          :'Could not save the conversation: '+(body.error??response.status);
        if(action==='previous_dialogue'){
          const restartNeeded=['invalid_action','wrong_wage_claim_phase',
            'stage_six_not_reversible'].includes(body.error??'');
          const backMessage=restartNeeded
            ?'Previous Dialogue requires the updated Stage 5 API. Rebuild game-core and restart the API server.'
            :'Previous Dialogue failed: '+(body.error??response.status)+'. Check the API response.';
          errorMessage=backMessage;
          if(snapshot.stage===6)backStageError=backMessage;
          if(response.status===409&&body.error==='stale_revision'){
            retryId=null;retrySignature=null;
            await refresh();
          }
        }else if(response.status===409){
          retryId=null;retrySignature=null;await refresh();
        }
      }
    }catch{
      errorMessage='The server could not be reached. Retry; the same saved request will not repeat the action.';
      if(action==='previous_dialogue')backStageError='Back to Stage 5 requires the API server to be running. Restart it and retry.';
    }finally{pending=false;}
  }
</script>

<svelte:head><title>The Pall — The Wage Claim</title></svelte:head>
{#if status==='ready' && character && snapshot}
  <TutorialShell {character} sceneLocation="Industrial service passage" alleyBackdrop={true} backStageBusy={pending} {backStageError} backToStageFive={()=>perform('previous_dialogue')}>
    <MillhandWageClaimScene {snapshot} {pending} {errorMessage} {perform}/>
  </TutorialShell>
{:else}
  <main class="fallback">
    {#if status==='loading'}
      <p role="status">Loading the confrontation…</p>
    {:else if status==='login'}
      <h1>Sign in required</h1><p><a href="/account">Account</a></p>
    {:else if status==='missing'}
      <h1>Character not found</h1>
    {:else if status==='stage-four'}
      <h1>Finish your second job first</h1>
      <p>Flint will confront you only after the selected Stage 4 job is complete.</p>
      <p><a href={'/characters/'+id+'/millhand/second-job'}>Return to Stage 4</a></p>
    {:else if status==='schema'}
      <h1>Stage 5 setup is incomplete</h1>
      <p>From the platform folder run <code>npm run wage-claim:migrate</code>, then restart the API. No work or coin balance is changed.</p>
    {:else}
      <h1>Character service unavailable</h1><p>Check the API and Stage 5 database migration.</p>
    {/if}
    <nav><a href={'/characters/'+id}>Character</a> · <a href="/characters">Characters</a></nav>
  </main>
{/if}
<style>
  :global(body){margin:0;background:#151717;color:#eadfcf;font-family:Georgia,serif}
  :global(a){color:#dcb98b}
  .fallback{max-width:750px;margin:6vh auto;padding:30px;background:#24211e;border:1px solid #72583e}
  .fallback code{color:#e9c997}
  nav{margin-top:25px}
</style>
