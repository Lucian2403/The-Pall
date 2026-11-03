<script lang="ts">
  import {onMount} from 'svelte';
  import {page} from '$app/state';
  import TutorialShell from '$lib/TutorialShell.svelte';
  import MillhandCombatScene from '$lib/MillhandCombatScene.svelte';
  import type {CombatAction} from '@the-pall/game-core/combat-v0.5.1';

  type Character={id:string;name:string;origin:string;sex:string;
    avatarId?:string|null;coins:number;health:{current:number;maximum:number};
    startingLocation:string;tutorial:{stage:number;status:string}};
  type Snapshot={needsStart?:boolean;revision:number;status:'active'|'finished';
    legalActions:string[];[key:string]:unknown};
  let character=$state<Character|null>(null);
  let battle=$state<Snapshot|null>(null);
  let status=$state<'loading'|'ready'|'login'|'missing'|'prerequisite'|'schema'|'unavailable'>('loading');
  let pending=$state(false);
  let errorMessage=$state('');
  let retryId:string|null=null;
  let retrySignature:string|null=null;
  const id=$derived(page.params.id);
  const api=$derived('/api/characters/'+encodeURIComponent(id)+'/millhand/combat');

  async function initialize(){
    // No extra pre-fight choice. A single idempotent start creates the encounter
    // from the saved Stage 5 stance when the player enters the combat route.
    const response=await fetch(api,{method:'POST',headers:{'content-type':'application/json'},
      body:JSON.stringify({kind:'start',requestId:crypto.randomUUID()})});
    if(!response.ok)throw Error('start_failed_'+response.status);
    battle=await response.json() as Snapshot;
  }
  async function refresh(){
    status='loading';
    try{
      const [person,fight]=await Promise.all([
        fetch('/api/characters/'+encodeURIComponent(id),{cache:'no-store'}),
        fetch(api,{cache:'no-store'})
      ]);
      if(person.status===401||fight.status===401){status='login';return;}
      if(person.status===404||fight.status===404){status='missing';return;}
      if(fight.status===409){status='prerequisite';return;}
      if(fight.status===503){status='schema';return;}
      if(!person.ok||!fight.ok){status='unavailable';return;}
      character=(await person.json() as {character:Character}).character;
      const state=await fight.json() as Snapshot;
      if(state.needsStart)await initialize();
      else battle=state;
      status='ready';
    }catch(error){
      status='unavailable';
      errorMessage=error instanceof Error?error.message:'The encounter could not be loaded.';
    }
  }
  onMount(()=>{void refresh();});

  async function perform(action:CombatAction){
    const revision=battle?.revision;
    if(pending||revision===undefined||!battle||battle.status!=='active')return;
    if(!battle.legalActions.includes(action.type))return;
    pending=true;errorMessage='';
    const signature=JSON.stringify([revision,action]);
    if(signature!==retrySignature||!retryId){
      retrySignature=signature;retryId=crypto.randomUUID();
    }
    try{
      const response=await fetch(api,{method:'POST',headers:{'content-type':'application/json'},
        body:JSON.stringify({kind:'turn',requestId:retryId,
          expectedRevision:revision,action})});
      const result=await response.json() as Snapshot&{error?:string;detail?:string};
      if(response.ok){
        battle=result;retryId=null;retrySignature=null;
        if(character){
          const p=result.player as {hp:number};
          character={...character,health:{...character.health,current:p.hp},
            tutorial:{...character.tutorial,status:result.status==='finished'?'COMPLETE':'IN_PROGRESS'}};
        }
      }else{
        if(response.status===409){
          retryId=null;retrySignature=null;
          const current=await fetch(api,{cache:'no-store'});
          if(current.ok)battle=await current.json() as Snapshot;
        }
        errorMessage=result.error==='stale_revision'?'The encounter changed in another tab; the saved turn has been reloaded.'
          :result.error==='invalid_combat_action'?'That action cannot be performed from the current position.'
          :'The turn could not be saved: '+(result.error??response.status);
      }
    }catch{
      errorMessage='Connection interrupted. Retry the same action; damage will not be applied twice.';
    }finally{pending=false;}
  }
</script>

<svelte:head><title>The Pall — The Passage, Flint</title></svelte:head>
{#if status==='ready' && character && battle}
  <TutorialShell {character} sceneLocation="Industrial service passage" alleyBackdrop={true}>
    <MillhandCombatScene snapshot={battle} {pending} {errorMessage} {perform}/>
  </TutorialShell>
{:else}
  <main class="fallback">
    {#if status==='loading'}
      <p role="status">Loading the saved encounter…</p>
    {:else if status==='login'}
      <h1>Sign in required</h1><p><a href="/account">Account</a></p>
    {:else if status==='missing'}
      <h1>Character not found</h1>
    {:else if status==='prerequisite'}
      <h1>The confrontation is not complete</h1>
      <p>Stage 6 begins after the opening stance has been saved.</p>
      <a href={'/characters/'+encodeURIComponent(id)+'/millhand/wage-claim'}>Return to the passage</a>
    {:else if status==='schema'}
      <h1>Combat persistence is not installed</h1>
      <p>Run <code>npm run combat:migrate</code> from the platform folder, then restart the API.</p>
    {:else}
      <h1>The combat service is unavailable</h1>
      <p role="alert">{errorMessage}</p>
      <button type="button" onclick={()=>{void refresh();}}>Retry</button>
    {/if}
    <nav><a href={'/characters/'+encodeURIComponent(id)}>Character</a></nav>
  </main>
{/if}
<style>
  :global(body){margin:0;background:#151717;color:#eadfcf;font-family:Georgia,serif}
  :global(a){color:#dcb98b}.fallback{max-width:750px;margin:6vh auto;padding:30px;background:#24211e;border:1px solid #72583e}
  .fallback button{padding:8px 14px}nav{margin-top:24px}
</style>
