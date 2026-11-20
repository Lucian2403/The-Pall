<script lang="ts">
  import {onMount} from 'svelte';
  import {page} from '$app/state';
  import TutorialShell from '$lib/TutorialShell.svelte';
  import StitcherWardScene from '$lib/StitcherWardScene.svelte';
  import {STITCHER_SCENE_ART,stitcherSceneEnvironment} from '$lib/stitcher-scene-environment';
  type Character={id:string;name:string;origin:string;sex:string;coins:number;
    health:{current:number;maximum:number};startingLocation:string;
    tutorial:{stage:number;status:string}};
  type State={revision:number;stage:1|2|3|4|5;phase:string;branch:'trolley'|'consent'|'notes'|null};
  type Snapshot={stage:number;tutorialStatus:string;state:State;
    started:boolean;availableActions:string[]};
  const id=$derived(page.params.id);
  const api=$derived('/api/characters/'+encodeURIComponent(id)+'/stitcher/ward');
  let character=$state<Character|null>(null);
  let snapshot=$state<Snapshot|null>(null);
  const sceneArt=$derived(snapshot
    ?STITCHER_SCENE_ART[stitcherSceneEnvironment(snapshot.state.stage,snapshot.state.branch,snapshot.state.phase)]
    :STITCHER_SCENE_ART.ward);
  let status=$state<'loading'|'ready'|'login'|'missing'|'migration'|'unavailable'>('loading');
  let pending=$state(false),errorMessage=$state('');
  let pendingId=$state<string|null>(null),pendingAction=$state<string|null>(null);
  async function refresh(){
    const r=await fetch(api,{cache:'no-store'});
    if(r.ok)snapshot=await r.json() as Snapshot;
  }
  async function perform(action:string){
    if(pending||!snapshot||!snapshot.availableActions.includes(action))return;
    pending=true;errorMessage='';
    if(pendingAction!==action){pendingAction=action;pendingId=crypto.randomUUID();}
    try{
      const r=await fetch(api,{method:'POST',headers:{'content-type':'application/json'},
        body:JSON.stringify({action,expectedRevision:snapshot.state.revision,requestId:pendingId})});
      if(r.ok){
        snapshot=await r.json() as Snapshot;
        pendingId=null;pendingAction=null;
        if(character)character={...character,tutorial:{stage:snapshot.stage,status:snapshot.tutorialStatus}};
      }else{
        const data=await r.json() as {error?:string};
        if(r.status===409){await refresh();pendingId=null;pendingAction=null;}
        errorMessage=data.error==='stale_revision'
          ?'The saved ward work changed in another tab. Review the current step.'
          :'Could not save the ward action: '+(data.error??r.status);
      }
    }catch{
      errorMessage='Connection interrupted. Retry the same action; it cannot duplicate the saved work.';
    }finally{pending=false;}
  }
  onMount(()=>{
    void(async()=>{
      try{
        const [a,b]=await Promise.all([
          fetch('/api/characters/'+encodeURIComponent(id),{cache:'no-store'}),
          fetch(api,{cache:'no-store'})
        ]);
        if(a.status===401||b.status===401){status='login';return;}
        if(a.status===404||b.status===404){status='missing';return;}
        if(b.status===503){status='migration';return;}
        if(!a.ok||!b.ok){status='unavailable';return;}
        character=(await a.json() as {character:Character}).character;
        snapshot=await b.json() as Snapshot;
        status=character.origin==='Stitcher'?'ready':'missing';
      }catch{status='unavailable';}
    })();
  });
</script>

<svelte:head><title>The Pall — Cinder Row Infirmary</title></svelte:head>
{#if status==='ready'&&character&&snapshot}
  <TutorialShell {character}
    sceneLocation={sceneArt.place}
    clinicBackdrop compactCityVista travelLocked>
    <StitcherWardScene {snapshot} {pending} {errorMessage} {perform} characterId={id}/>
  </TutorialShell>
{:else}
  <main class="fallback" role="status">
    {#if status==='loading'}<h1>Opening Cinder Row Infirmary…</h1>
    {:else if status==='login'}<h1>Sign in required</h1><a href="/account">Account access</a>
    {:else if status==='missing'}<h1>Character not found</h1>
    {:else if status==='migration'}<h1>Stitcher database schema missing</h1>
      <p>Run <code>npm run stitcher:migrate</code> from <code>platform/</code>.</p>
    {:else}<h1>The ward is unavailable</h1>{/if}
    <a href="/characters">Character selection</a>
  </main>
{/if}
<style>
  .fallback{padding:38px;color:#e3d0af;background:#25211e;min-height:45vh}
  .fallback a{color:#f4cf9b}
</style>
