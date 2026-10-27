<script lang="ts">
  import {onMount} from 'svelte';
  import {page} from '$app/state';
  import type {MissingStampAction,MissingStampState,MissingStampEvidence} from '@the-pall/game-core';
  import TutorialShell from '$lib/TutorialShell.svelte';
  import MillhandMissingStampScene from '$lib/MillhandMissingStampScene.svelte';

  type Character={
    id:string;name:string;origin:string;sex:string;coins:number;
    health:{current:number;maximum:number};
    startingLocation:string;tutorial:{stage:number;status:string};
  };
  type StageThreeSnapshot={
    stage:number;tutorialStatus:string;
    state:MissingStampState;availableActions:MissingStampAction[];
    contentReady:boolean;majorSkillBonuses:Record<string,number>;
    slip:{workerNumber:string;recordedDeathDate:string}|null;
    plate:{workerNumber:string;inspectionDate:string;inspectionMarkPresent:boolean}|null;
    finding:MissingStampEvidence|null;
    tutorialPayout:{coins:number;ordinaryXp:number;items:number};
  };
  let character=$state<Character|null>(null);
  let snapshot=$state<StageThreeSnapshot|null>(null);
  let status=$state<'loading'|'ready'|'login'|'missing'|'stage-two'|'unavailable'>('loading');
  let pending=$state(false);
  let errorMessage=$state('');
  let retryId:string|null=null;
  let retrySignature:string|null=null;
  const characterId=$derived(page.params.id);

  async function refresh() {
    try {
      const [a,b]=await Promise.all([
        fetch('/api/characters/'+encodeURIComponent(characterId),{cache:'no-store'}),
        fetch('/api/characters/'+encodeURIComponent(characterId)+'/millhand/missing-stamp',{cache:'no-store'})
      ]);
      if(a.status===401||b.status===401){status='login';return;}
      if(a.status===404||b.status===404){status='missing';return;}
      if(b.status===409){status='stage-two';return;}
      if(!a.ok||!b.ok){status='unavailable';return;}
      const c=await a.json() as {character:Character};
      character=c.character;
      snapshot=await b.json() as StageThreeSnapshot;
      status='ready';
    }catch{status='unavailable';}
  }
  onMount(()=>{void refresh();});

  async function perform(action:MissingStampAction) {
    const revision=snapshot?.state.revision;
    if(pending||revision===undefined||!character||!snapshot?.availableActions.includes(action))return;
    pending=true;errorMessage='';
    const signature=JSON.stringify([action,revision]);
    if(retrySignature!==signature||!retryId){retryId=crypto.randomUUID();retrySignature=signature;}
    try {
      const response=await fetch('/api/characters/'+encodeURIComponent(character.id)+'/millhand/missing-stamp',{
        method:'POST',headers:{'content-type':'application/json'},
        body:JSON.stringify({action,expectedRevision:revision,requestId:retryId})
      });
      const data=await response.json() as StageThreeSnapshot & {error?:string};
      if(response.ok){
        snapshot=data;
        character={...character,tutorial:{stage:data.stage,status:data.tutorialStatus}};
        retryId=null;retrySignature=null;
      } else {
        errorMessage=data.error==='stale_revision'?'Your saved evidence changed in another tab. The latest state has been reloaded.'
          :data.error==='wrong_stage_three_phase'?'That interaction is not available now.'
          :'Could not save this action: '+(data.error??response.status);
        if(response.status===409){retryId=null;retrySignature=null;await refresh();}
      }
    }catch{
      errorMessage='The API could not be reached. Retry the same action; it cannot be applied twice.';
    }finally{pending=false;}
  }
</script>

<svelte:head><title>The Pall — The Missing Stamp</title></svelte:head>

{#if status==='ready' && character && snapshot}
  <TutorialShell {character}>
    <MillhandMissingStampScene {snapshot} {pending} {errorMessage} {perform}/>
    {#if snapshot.stage===4}
      <div class="next-stage">
        Stage 3 is complete. Your route and one-time skill bonus are saved.
        Stage 4's follow-up job is not yet connected.
        <a href={'/characters/'+character.id}>Return to character</a>
      </div>
    {/if}
  </TutorialShell>
{:else}
  <main class="fallback">
    {#if status==='loading'}<p role="status">Loading the returned council papers…</p>
    {:else if status==='login'}<h1>Sign in required</h1><p><a href="/account">Account access</a></p>
    {:else if status==='missing'}<h1>Character not found</h1>
    {:else if status==='stage-two'}<h1>The evidence is not ready</h1><p>Finish the council platework and return the work paper first.</p>
      <p><a href={'/characters/'+characterId+'/millhand/work'}>Return to the workshop</a></p>
    {:else}<h1>Character service unavailable</h1><p>Check the API and Stage 3 migration.</p>{/if}
    <nav><a href={'/characters/'+characterId}>Character details</a> · <a href="/characters">Characters</a></nav>
  </main>
{/if}
<style>
  :global(body){margin:0;background:#151717;color:#e9dfcd;font-family:Georgia,serif}
  :global(a){color:#e0bc8b}
  .fallback{margin:6vh auto;max-width:760px;padding:30px;background:#24221f;border:1px solid #756047}
  .fallback nav{margin-top:25px;border-top:1px solid #574633;padding-top:20px}
  .next-stage{padding:17px 20px;background:#30271e;color:#e8d4b7;font:14px/1.6 sans-serif}
  .next-stage a{margin-left:9px}
</style>
