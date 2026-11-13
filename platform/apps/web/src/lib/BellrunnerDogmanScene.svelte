<script lang="ts">
  import {getContext,tick} from 'svelte';
  import {page} from '$app/state';
  import ActivityLayout from '$lib/ActivityLayout.svelte';
  import {dialogueSpeakerLabel} from '$lib/dialogue-speaker';
  import {SCENE_JOURNAL_CONTEXT,type SceneJournalRegistrar} from '$lib/scene-journal';
  import {
    DOGMAN_ASSETS,DOGMAN_ACTION_LABELS,DOGMAN_STANCE_NOTES,
    dogmanLine,dogmanJournal,
    type DogmanAction,type DogmanViewState
  } from '$lib/bellrunner-dogman-copy';
  import '$lib/pall-story-landscape.css';

  type State=DogmanViewState & {revision:number};
  type Snapshot={
    stage:number;tutorialStatus:string;state:State;availableActions:DogmanAction[];
    tutorialPayout:{coins:number;ordinaryXp:number;items:number}
  };
  let {snapshot,pending,errorMessage,perform}:{
    snapshot:Snapshot;pending:boolean;errorMessage:string;
    perform:(action:DogmanAction)=>Promise<void>;
  }=$props();
  const state=$derived(snapshot.state);
  const line=$derived(dogmanLine(state));
  const journal=$derived(dogmanJournal(state));
  const atGate=$derived(state.phase==='gate'||state.phase==='done');
  const actions=$derived(snapshot.availableActions);
  let alleyImageMissing=$state(false);
  let dogmanImageMissing=$state(false);
  let journalOpen=$state(false);
  let journalElement:HTMLElement|undefined;
  const registerSceneJournal=getContext<SceneJournalRegistrar|undefined>(SCENE_JOURNAL_CONTEXT);
  $effect(()=>{
    registerSceneJournal?.({id:'bellrunner-dogman-journal',open:journalOpen,
      toggle:()=>{void toggleJournal();}});
    return ()=>registerSceneJournal?.(null);
  });
  async function toggleJournal(){
    journalOpen=!journalOpen;
    if(journalOpen){await tick();journalElement?.scrollIntoView({block:'start',behavior:'smooth'});}
  }
  function act(action:DogmanAction){
    if(!pending&&actions.includes(action))void perform(action);
  }
</script>

<section class="second-job bellrunner-dogman" aria-label="Bellrunner Stage 5 — Dogman at the service gate">
  <ActivityLayout mode="scene" stageAspect={1648/928} class="pall-story-sections">
    {#snippet stage()}
      <div class="scene-visuals pall-story-visuals">
        <div class="dogman-stage pall-story-landscape">
          {#if !alleyImageMissing}
            <img class="scene-background" src={DOGMAN_ASSETS.background}
              alt="An industrial service alley with a work cart and a way back to the street"
              draggable="false" onerror={()=>{alleyImageMissing=true;}}/>
          {:else}
            <!-- The existing alley is only a runtime fallback when the new upload
                 is missing, not a replacement for the owner's provided painting. -->
            <img class="scene-background" src="/locations/alley/alley-background.webp"
              alt="An industrial service passage" draggable="false"/>
          {/if}
          {#if !dogmanImageMissing}
            <img class="dogman-standing" src={DOGMAN_ASSETS.standing} alt="Dogman, the Shift Marshal's hired man, holding a short club"
              draggable="false" onerror={()=>{dogmanImageMissing=true;}}/>
          {:else}
            <p class="missing-character" role="status">Dogman stands in the path, club in hand.</p>
          {/if}
          <span class="dogman-label">Dogman</span>
          {#if atGate}<span class="cart-label">Work cart</span>{/if}
        </div>
      </div>
    {/snippet}
    {#snippet panel()}
      <section class="pall-story-dialogue-section" aria-label="Dogman confrontation dialogue">
        <div class="work-card">
          <p class="eyebrow">BELLRUNNER · STAGE V · {atGate?'GATE BARRED':'SHOW YOUR PAPERS'}</p>
          <h1>{atGate?'Gate Barred':'Show Your Papers'}</h1>
          {#if line}
            {#if line.speaker==='Narration'}
              <p class="narration">{line.text}</p>
            {:else}
              <p class="speaker">{dialogueSpeakerLabel(line.speaker).toUpperCase()}</p>
              <p class="spoken">“{line.text}”</p>
            {/if}
          {:else if state.phase==='done'&&state.stance}
            <p class="narration">{DOGMAN_STANCE_NOTES[state.stance]}</p>
            <p class="narration">Dogman comes forward with the club held low. The service lane is narrow, with the public street beyond.</p>
            <a class="pall-framed-button primary-choice combat-link"
              href={'/characters/'+encodeURIComponent(page.params.id)+'/bellrunner/combat'}>
              Enter the fight
            </a>
          {/if}
          {#if actions.length>0}
            <div class="actions" aria-label="Available Dogman responses">
              {#each actions as action (action)}
                <button type="button"
                  class={actions.length===1?'primary-choice':'secondary-choice'}
                  disabled={pending} onclick={()=>act(action)}
                  data-pall-sfx="click">
                  {DOGMAN_ACTION_LABELS[action]}
                </button>
              {/each}
            </div>
          {/if}
          {#if errorMessage}<p class="error" role="alert">{errorMessage}</p>{/if}
          {#if pending}<p class="saving" role="status">Saving your choice…</p>{/if}
        </div>
      </section>
    {/snippet}
  </ActivityLayout>
  {#if journalOpen}
    <section id="bellrunner-dogman-journal" class="journal-panel"
      bind:this={journalElement} aria-label="Personal journal — Show Your Papers">
      <header class="journal-heading">
        <div>
          <span class="journal-kicker">PERSONAL JOURNAL</span>
          <h2>Show Your Papers</h2>
        </div>
        <button type="button" class="journal-toggle" data-pall-sfx="paper"
          onclick={()=>{void toggleJournal();}}>Close journal</button>
      </header>
      <div class="journal-entries">
        {#each journal as entry,i (i)}<p>{entry}</p>{/each}
      </div>
    </section>
  {/if}
</section>

<style>
  .bellrunner-dogman{display:flex;flex-direction:column;min-width:0;flex:1;width:100%}
  .dogman-stage{position:relative;aspect-ratio:1648/928;background:#141413}
  .scene-background{display:block;width:100%;height:100%;object-fit:cover;pointer-events:none}
  .dogman-standing{position:absolute;z-index:1;bottom:0;left:36%;height:94%;max-width:48%;
    width:auto;object-fit:contain;object-position:bottom center;pointer-events:none;
    filter:drop-shadow(0 10px 12px #0c0c0bb8)}
  .dogman-label,.cart-label{position:absolute;z-index:2;bottom:12px;left:48%;
    padding:5px 11px;border:1px solid #a17c55;background:#161310e5;
    color:#f1dfbf;font:700 13px/1.3 var(--pall-font-label,Georgia,sans-serif)}
  .cart-label{bottom:25%;left:7%}
  .missing-character{position:absolute;left:31%;bottom:10%;color:#f1dfbf;
    padding:16px;background:#1c1915c9;border:1px solid #836647}
  .work-card{width:100%;min-width:0;box-sizing:border-box;margin:0;
    padding:clamp(20px,2.3vw,37px) clamp(18px,2.2vw,36px);
    border:2px solid #654022;border-radius:5px;background:#efdfbb;
    color:#251910;box-shadow:0 7px 15px #0008}
  .eyebrow{font:600 14px/1.25 var(--pall-font-label,Arial,sans-serif);
    letter-spacing:.08em;color:#614029;margin:0 0 16px;padding-bottom:10px;
    border-bottom:1px solid #9e815955}
  h1{margin:0 0 15px;font:600 var(--dialogue-title,21px)/1.3 var(--pall-font-reading,Georgia,serif)}
  .narration,.spoken{margin:0 0 15px;font:500 var(--dialogue-text,17px)/1.5
    var(--pall-font-reading,Georgia,serif);color:#251910}
  .narration{font-style:italic}
  .spoken{font-weight:600}
  .speaker{margin:10px 0 6px;font:700 15px/1.2 var(--pall-font-label,Arial,sans-serif);
    letter-spacing:.07em;color:#67432a}
  .actions{display:flex;flex-direction:column;gap:9px;margin-top:19px}
  .combat-link{display:flex;align-items:center;justify-content:center;
    text-align:center;text-decoration:none;margin-top:20px;min-height:52px}
  .error{color:#873523}.saving{color:#644f36}
  .journal-panel{width:100%;box-sizing:border-box;
    padding:19px clamp(16px,4vw,46px) 25px;background:#e8d6b6;
    color:#24160e;border-top:2px solid #9a7147;
    font-synthesis:weight;scroll-margin-top:56px}
  .journal-heading{display:flex;align-items:center;justify-content:space-between;
    gap:15px;max-width:930px;margin:0 auto 15px}
  .journal-heading h2{margin:6px 0 0}
  .journal-entries{max-width:930px;margin:0 auto}
  .journal-entries p{margin:9px 0}
  .journal-toggle{box-sizing:border-box;min-height:40px;padding:3px 8px;
    border:solid transparent;border-width:10px 17px 9px;
    border-image-source:url('/ui-kit/buttons/button-normal-trim.png');
    border-image-slice:50 180 45 180 fill;border-image-width:10px 17px 9px;
    border-image-repeat:stretch;border-radius:0;background:transparent;
    color:#2e1d11;cursor:pointer}
  .journal-toggle:is(:hover,:focus-visible){
    border-image-source:url('/ui-kit/buttons/button-hover-trim.png')}
  .journal-toggle:active{border-image-source:url('/ui-kit/buttons/button-pressed-trim.png')}
  .journal-toggle:focus-visible{outline:2px solid #efd092;outline-offset:2px}
  @container activity-panel (max-width:480px){.work-card{padding:18px 15px}}
</style>
