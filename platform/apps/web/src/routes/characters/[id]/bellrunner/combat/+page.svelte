<script lang="ts">
  import {onMount} from 'svelte';
  import {page} from '$app/state';
  import TutorialShell from '$lib/TutorialShell.svelte';
  import ActivityLayout from '$lib/ActivityLayout.svelte';
  import {DOGMAN_ASSETS,DOGMAN_STANCE_NOTES,type DogmanStance} from '$lib/bellrunner-dogman-copy';
  import '$lib/pall-story-landscape.css';
  type Character={id:string;name:string;origin:string;sex:string;coins:number;
    health:{current:number;maximum:number};startingLocation:string;
    tutorial:{stage:number;status:string}};
  type Snapshot={stage:number;state:{phase:string;stance:DogmanStance|null}};
  const id=$derived(page.params.id);
  let character=$state<Character|null>(null);
  let snapshot=$state<Snapshot|null>(null);
  let status=$state<'loading'|'ready'|'error'>('loading');
  onMount(()=>{
    void (async()=>{
      try{
        const [a,b]=await Promise.all([
          fetch('/api/characters/'+encodeURIComponent(id),{cache:'no-store'}),
          fetch('/api/characters/'+encodeURIComponent(id)+'/bellrunner/dogman',{cache:'no-store'})
        ]);
        if(!a.ok||!b.ok){status='error';return;}
        character=(await a.json() as {character:Character}).character;
        snapshot=await b.json() as Snapshot;
        status=character.origin==='Bellrunner'&&snapshot.stage===6&&
          snapshot.state.phase==='done'&&snapshot.state.stance?'ready':'error';
      }catch{status='error';}
    })();
  });
</script>

<svelte:head><title>The Pall — Dogman at the Gate</title></svelte:head>
{#if status==='ready'&&character&&snapshot&&snapshot.state.stance}
  <TutorialShell {character} sceneLocation="Industrial service passage" alleyBackdrop={true} travelLocked>
    <section class="second-job bellrunner-dogman-combat-boundary">
      <ActivityLayout mode="scene" stageAspect={1648/928} class="pall-story-sections">
        {#snippet stage()}
          <div class="scene-visuals pall-story-visuals">
            <div class="scene">
              <img src={DOGMAN_ASSETS.background} alt="A narrow industrial alley beside the closed factory"
                onerror={(event)=>{event.currentTarget.src='/locations/alley/alley-background.webp';}}/>
              <img class="dogman" src={DOGMAN_ASSETS.standing} alt="Dogman with his club"
                onerror={(event)=>{event.currentTarget.style.display='none';}}/>
            </div>
          </div>
        {/snippet}
        {#snippet panel()}
          <section class="pall-story-dialogue-section">
            <div class="work-card">
              <p class="eyebrow">BELLRUNNER · STAGE VI · THE SERVICE GATE</p>
              <h1>The Fight With Dogman</h1>
              <p class="narration">{DOGMAN_STANCE_NOTES[snapshot.state.stance]}</p>
              <p class="narration">Dogman comes forward with the club held low. The service lane is narrow, with a work cart to one side and the public street beyond.</p>
              <p class="notice" role="status">The Stage VI turn-based combat encounter has not been implemented. Your chosen opening position is saved.</p>
            </div>
          </section>
        {/snippet}
      </ActivityLayout>
    </section>
  </TutorialShell>
{:else}
  <main role="status" class="fallback">
    <h1>{status==='loading'?'Checking the encounter…':'Finish the confrontation first'}</h1>
    <a href={'/characters/'+encodeURIComponent(id)+'/bellrunner/dogman'}>Show Your Papers</a>
  </main>
{/if}
<style>
  .bellrunner-dogman-combat-boundary{width:100%;min-width:0}
  .scene{position:relative;aspect-ratio:1648/928;overflow:hidden;background:#151413}
  .scene>img:first-child{width:100%;height:100%;object-fit:cover}
  .scene .dogman{position:absolute;bottom:0;left:36%;height:94%;max-width:48%;object-fit:contain}
  .work-card{box-sizing:border-box;width:100%;padding:clamp(20px,3vw,36px);
    border:2px solid #654022;background:#efdfbb;color:#251910}
  .eyebrow{font:600 14px/1.3 var(--pall-font-label,Arial,sans-serif);
    letter-spacing:.07em;border-bottom:1px solid #a78d62;padding-bottom:10px}
  h1{font:600 21px/1.3 var(--pall-font-reading,Georgia,serif)}
  .narration{font:italic 500 17px/1.55 var(--pall-font-reading,Georgia,serif)}
  .notice{font:600 15px/1.45 var(--pall-font-reading,Georgia,serif);
    padding-top:15px;border-top:1px solid #a78d62}
  .fallback{padding:40px;background:#25211e;color:#ecd8b2}
</style>
