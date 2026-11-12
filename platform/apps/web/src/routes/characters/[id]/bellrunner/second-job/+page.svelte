<script lang="ts">
  import {onMount} from 'svelte';
  import {page} from '$app/state';
  import TutorialShell from '$lib/TutorialShell.svelte';
  import BellrunnerSecondJobScene from '$lib/BellrunnerSecondJobScene.svelte';
  import {pallAudioSettings} from '$lib/pall-audio';
  import {BELLRUNNER_STAGE_FOUR,
    type StageFourAction,type StageFourBranch,type StageFourPhase} from '$lib/bellrunner-stage4-copy';

  type Character={id:string;name:string;origin:string;sex:string;coins:number;
    health:{current:number;maximum:number};startingLocation:string;
    tutorial:{stage:number;status:string}};
  type State={revision:number;branch:StageFourBranch;phase:StageFourPhase;
    openingLine:number;revelationLine:number;method:string|null;
    observation:string|null;priority:'urgent'|'corrected'|null;journalFact:string|null};
  type Snapshot={stage:number;tutorialStatus:string;state:State;
    availableActions:StageFourAction[];tutorialPayout:{coins:number;ordinaryXp:number;items:number}};
  const id=$derived(page.params.id);
  let character=$state<Character|null>(null);
  let snapshot=$state<Snapshot|null>(null);
  let status=$state<'loading'|'ready'|'login'|'missing'|'migration'|'not-ready'|'error'>('loading');
  let busy=$state(false),errorMessage=$state('');
  let requestId=$state<string|null>(null),requestAction=$state<StageFourAction|null>(null);
  let bellAudio=$state<HTMLAudioElement>();
  let bellEnabled=false,bellVolume=0.5;
  const branch=$derived(snapshot?.state.branch??null);
  const sceneLocation=$derived(branch?BELLRUNNER_STAGE_FOUR[branch].place:'Second Job');

  function ring(){
    if(!bellAudio||!bellEnabled||bellVolume===0||document.hidden)return;
    bellAudio.volume=bellVolume;
    bellAudio.currentTime=0;
    void bellAudio.play().catch(()=>{/* Audio cannot block the saved work. */});
  }
  async function refresh(){
    const res=await fetch('/api/characters/'+encodeURIComponent(id)+'/bellrunner/second-job',
      {cache:'no-store'});
    if(res.ok)snapshot=await res.json() as Snapshot;
  }
  async function perform(action:StageFourAction){
    if(busy||!snapshot||!snapshot.availableActions.includes(action))return;
    busy=true;errorMessage='';
    if(requestAction!==action){requestAction=action;requestId=crypto.randomUUID();}
    try{
      const res=await fetch('/api/characters/'+encodeURIComponent(id)+'/bellrunner/second-job',{
        method:'POST',headers:{'content-type':'application/json'},
        body:JSON.stringify({action,requestId,expectedRevision:snapshot.state.revision})
      });
      if(res.ok){
        snapshot=await res.json() as Snapshot;
        if(action==='inspect_safety_linkage'&&snapshot.state.branch==='machinery')ring();
        requestId=null;requestAction=null;
        if(character)character={...character,
          tutorial:{stage:snapshot.stage,status:snapshot.tutorialStatus}};
      }else{
        const data=await res.json() as {error?:string};
        if(res.status===409){await refresh();requestId=null;requestAction=null;}
        errorMessage=data.error==='stale_revision'
          ?'Your saved work changed in another tab. Review the updated task.'
          :data.error==='bellrunner_migration_required'
            ?'Stage 4 database migration required: npm run bellrunner:migrate.'
            :'Could not save this action: '+(data.error??res.status);
      }
    }catch{
      errorMessage='Connection interrupted. Retry the same action; saved progress is not duplicated.';
    }finally{busy=false;}
  }
  onMount(()=>{
    const unsubscribe=pallAudioSettings.subscribe(next=>{
      bellEnabled=next.enabled;
      bellVolume=Math.max(0,Math.min(1,next.sfxVolume));
      if(bellAudio){
        bellAudio.volume=bellEnabled?bellVolume:0;
        if(!bellEnabled||bellVolume===0)bellAudio.pause();
      }
    });
    void(async()=>{
      try{
        const [a,b]=await Promise.all([
          fetch('/api/characters/'+encodeURIComponent(id),{cache:'no-store'}),
          fetch('/api/characters/'+encodeURIComponent(id)+'/bellrunner/second-job',{cache:'no-store'})
        ]);
        if(a.status===401||b.status===401){status='login';return;}
        if(a.status===404||b.status===404){status='missing';return;}
        if(b.status===503){status='migration';return;}
        if(b.status===409){status='not-ready';return;}
        if(!a.ok||!b.ok){status='error';return;}
        character=(await a.json() as {character:Character}).character;
        snapshot=await b.json() as Snapshot;
        status=character.origin==='Bellrunner'?'ready':'missing';
      }catch{status='error';}
    })();
    return ()=>{unsubscribe();if(bellAudio){bellAudio.pause();bellAudio.currentTime=0;}};
  });
</script>

<svelte:head><title>The Pall — Bellrunner Second Job</title></svelte:head>
<audio bind:this={bellAudio} src="/audio/bellrunner/night-shift-bell.mp3" preload="auto"></audio>
{#if status==='ready'&&character&&snapshot}
  <TutorialShell {character} {sceneLocation} compactCityVista travelLocked
    councilBackdrop={branch==='contracts'} clinicBackdrop={branch==='trauma'}
    industrialCourtyardBackdrop={branch==='machinery'}>
    <BellrunnerSecondJobScene {snapshot} pending={busy} {errorMessage} {perform}/>
  </TutorialShell>
{:else}
  <main class="fallback" role="status">
    {#if status==='loading'}<h1>Checking the saved second job…</h1>
    {:else if status==='login'}<h1>Sign in required</h1><a href="/account">Account access</a>
    {:else if status==='missing'}<h1>Character not found</h1>
    {:else if status==='migration'}<h1>Stage 4 schema missing</h1><p>Run npm run bellrunner:migrate and restart the API.</p>
    {:else if status==='not-ready'}<h1>Stage 4 not ready</h1><p>Complete The Wrong Bell first.</p>
    {:else}<h1>Second job unavailable</h1>{/if}
    <a href="/characters">Character selection</a>
  </main>
{/if}

<style>
  .fallback{padding:38px;color:#e3d0af;background:#25211e;min-height:45vh}
  .fallback a{color:#f4cf9b}
</style>
