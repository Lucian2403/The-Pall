<script lang="ts">
  import {onMount} from 'svelte';
  import {goto} from '$app/navigation';
  import {page} from '$app/state';
  import TutorialShell from '$lib/TutorialShell.svelte';
  import BellrunnerDogmanScene from '$lib/BellrunnerDogmanScene.svelte';
  import type {DogmanAction,DogmanBranch,DogmanPhase,DogmanReply,DogmanStance} from '$lib/bellrunner-dogman-copy';

  type Character={id:string;name:string;origin:string;sex:string;coins:number;
    health:{current:number;maximum:number};startingLocation:string;
    tutorial:{stage:number;status:string}};
  type State={
    revision:number;branch:DogmanBranch;phase:DogmanPhase;line:number;
    reply:DogmanReply|null;stance:DogmanStance|null
  };
  type Snapshot={
    stage:number;tutorialStatus:string;state:State;availableActions:DogmanAction[];
    tutorialPayout:{coins:number;ordinaryXp:number;items:number}
  };
  const id=$derived(page.params.id);
  let character=$state<Character|null>(null);
  let snapshot=$state<Snapshot|null>(null);
  let status=$state<'loading'|'ready'|'login'|'missing'|'prerequisite'|'migration'|'unavailable'>('loading');
  let pending=$state(false);
  let errorMessage=$state('');
  let requestId:string|null=null;
  let requestSignature:string|null=null;

  async function refresh(){
    try{
      const [a,b]=await Promise.all([
        fetch('/api/characters/'+encodeURIComponent(id),{cache:'no-store'}),
        fetch('/api/characters/'+encodeURIComponent(id)+'/bellrunner/dogman',{cache:'no-store'})
      ]);
      if(a.status===401||b.status===401){status='login';return;}
      if(a.status===404||b.status===404){status='missing';return;}
      if(b.status===503){status='migration';return;}
      if(b.status===409){status='prerequisite';return;}
      if(!a.ok||!b.ok){status='unavailable';return;}
      character=(await a.json() as {character:Character}).character;
      snapshot=await b.json() as Snapshot;
      status=character.origin==='Bellrunner'?'ready':'missing';
    }catch{status='unavailable';}
  }
  onMount(()=>{void refresh();});

  async function perform(action:DogmanAction){
    if(pending||!snapshot||!character||!snapshot.availableActions.includes(action))return;
    const revision=snapshot.state.revision;
    const signature=action+':'+revision;
    if(requestSignature!==signature||!requestId){
      requestId=crypto.randomUUID();requestSignature=signature;
    }
    pending=true;errorMessage='';
    try{
      const res=await fetch('/api/characters/'+encodeURIComponent(id)+'/bellrunner/dogman',{
        method:'POST',headers:{'content-type':'application/json'},
        body:JSON.stringify({action,expectedRevision:revision,requestId})
      });
      const data=await res.json() as Snapshot & {error?:string};
      if(res.ok){
        snapshot=data;
        character={...character,tutorial:{stage:data.stage,status:data.tutorialStatus}};
        requestId=null;requestSignature=null;
        if(data.stage===6&&data.state.phase==='done'){
          await goto('/characters/'+encodeURIComponent(id)+'/bellrunner/combat');
        }
      }else{
        errorMessage=data.error==='stale_revision'
          ?'The saved conversation changed elsewhere. The scene has been reloaded.'
          :data.error==='dogman_migration_required'
          ?'Stage V database migration required. Run npm run bellrunner:migrate.'
          :'Could not save this response: '+(data.error??res.status);
        if(res.status===409){
          requestId=null;requestSignature=null;
          await refresh();
        }
      }
    }catch{
      errorMessage='Connection interrupted. Retry the action; the same request is not applied twice.';
    }finally{pending=false;}
  }
</script>

<svelte:head><title>The Pall — Dogman at the Service Gate</title></svelte:head>
{#if status==='ready'&&character&&snapshot}
  <TutorialShell {character} sceneLocation="Industrial service passage"
    alleyBackdrop={true} travelLocked>
    <BellrunnerDogmanScene {snapshot} {pending} {errorMessage} {perform}/>
  </TutorialShell>
{:else}
  <main class="fallback" role="status">
    {#if status==='loading'}<h1>Returning to the service gate…</h1>
    {:else if status==='login'}<h1>Sign in required</h1><a href="/account">Account access</a>
    {:else if status==='missing'}<h1>Character not found</h1>
    {:else if status==='migration'}<h1>Stage V database setup missing</h1><p>Run npm run bellrunner:migrate and restart the API.</p>
    {:else if status==='prerequisite'}<h1>Finish your second job first</h1>
      <a href={'/characters/'+encodeURIComponent(id)+'/bellrunner/second-job'}>Return to Stage IV</a>
    {:else}<h1>Confrontation unavailable</h1>{/if}
    <a href="/characters">Character selection</a>
  </main>
{/if}
<style>
  .fallback{padding:38px;max-width:760px;margin:5vh auto;color:#e3d0af;
    background:#25211e;min-height:40vh}
  .fallback a{color:#f4cf9b}
</style>
