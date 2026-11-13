<script lang="ts">
  import {dialogueSpeakerLabel} from '$lib/dialogue-speaker';
  import {getContext} from 'svelte';
  import {SCENE_JOURNAL_CONTEXT,type SceneJournalRegistrar} from '$lib/scene-journal';
  import {tick} from 'svelte';
  import type {SecondJobAction, SecondJobState} from '@the-pall/game-core';
  import {
    STAGE_FOUR_ROUTES,STAGE_FOUR_DIALOGUE,STAGE_FOUR_INSTRUCTIONS,
    STAGE_FOUR_ACTION_LABELS,STAGE_FOUR_OUTCOMES,STAGE_FOUR_FINAL,
    STAGE_FOUR_TRANSPORT_HINTS,STAGE_FOUR_TRANSPORT_VERIFICATION,
    secondJobJournal
  } from '$lib/approved-stage-four';
  import '$lib/workshop-object-labels.css';
  import '$lib/pall-story-landscape.css';
  import ActivityLayout from '$lib/ActivityLayout.svelte';
  import StageFourNextStep from '$lib/StageFourNextStep.svelte';

  type Snapshot = {
    stage:number;
    tutorialStatus:string;
    state:SecondJobState;
    availableActions:SecondJobAction[];
    tutorialPayout:{coins:number;ordinaryXp:number;items:number};
  };
  let {snapshot,pending,errorMessage,perform,travelConfirmed,confirmTravel}:{
    snapshot:Snapshot;
    pending:boolean;
    errorMessage:string;
    perform:(action:SecondJobAction)=>Promise<void>;
    travelConfirmed:boolean;confirmTravel:()=>void;
  }=$props();

  const state=$derived(snapshot.state);
  // The location-specific exit belongs only to StageFourNextStep.
  const workActions=$derived(snapshot.availableActions.filter(action=>action!=='leave_location'));
  // Purely local presentation beat: a saved transport choice is shown at the
  // workshop before the player proceeds to the depot. This grants no work
  // action and cannot change server progress or cause a missing receipt.
  const atWorkshop=$derived(state.phase==='CHECK_LOAD'||state.phase==='CHOOSE_TRANSPORT'||
    (state.phase==='COMPARE_DELIVERY'&&!travelConfirmed));
  const speaking=$derived(state.phase==='DEPOT_DIALOGUE');
  const beat=$derived(speaking?STAGE_FOUR_DIALOGUE.restamp[state.dialogueIndex]:null);
  const result=$derived(state.lastAction?STAGE_FOUR_OUTCOMES[state.lastAction]:null);
  const instruction=$derived(STAGE_FOUR_INSTRUCTIONS[state.phase]);
  const journal=$derived(secondJobJournal(state));
  let selected=$state<'plates'|'paper'|null>(null);
  let journalOpen=$state(false);
  // The persistent corner control is owned by TutorialShell, not this dialogue.
  const registerSceneJournal=getContext<SceneJournalRegistrar|undefined>(SCENE_JOURNAL_CONTEXT);
  $effect(()=>{
    registerSceneJournal?.({id:'depot-job-journal',open:journalOpen,toggle:()=>{void toggleJournal();}});
    return ()=>registerSceneJournal?.(null);
  });
  let journalElement:HTMLElement|undefined;

  function inspect(which:'plates'|'paper'){selected=selected===which?null:which;}
  async function toggleJournal(){
    journalOpen=!journalOpen;
    await tick();
    if(journalOpen)journalElement?.scrollIntoView({block:'start',behavior:'smooth'});
  }
</script>

<section class="second-job depot-job" aria-label="Depot Intake Run, Stage 4">
  <!-- Shared scene layout: the workshop/depot painting (native 2:1) with its
       two counter props is the stage; the delivery dialogue is the reading column. -->
  <ActivityLayout mode="scene" stageAspect={2} class="depot-scene pall-story-sections">
  {#snippet stage()}
  <div class="scene-visuals pall-story-visuals">
  <div class="depot-stage pall-story-landscape">
    <div class="scene-art" class:preparing={atWorkshop}
      role="img" aria-label={atWorkshop
        ? 'Guther’s workshop, with a wooden workbench before the metalworking equipment'
        : 'Municipal depot receiving yard, with a loading gantry, crates, rail cart and wooden receiving counter'}>
    </div>

    <!-- Two reusable owner-painted assets. The delivery list and receipt are
         acted on in the CRPG popup; do not fabricate separate paper sprites. -->
    <div class="table-props" aria-label="Physical objects at the workbench or receiving counter">
      <button type="button" class="table-prop plates" class:selected={selected==='plates'}
        aria-pressed={selected==='plates'} aria-label="Inspect the numbered metal plates"
        onclick={() => inspect('plates')}>
        <img src="/workshop/metal-plates.webp" alt="" aria-hidden="true"/>
        <span class="workshop-object-label">Numbered plates</span>
      </button>
      <button type="button" class="table-prop paper" class:selected={selected==='paper'}
        aria-pressed={selected==='paper'} aria-label="Inspect the council work paper"
        onclick={() => inspect('paper')}>
        <img src="/workshop/council-work.webp" alt="" aria-hidden="true"/>
        <span class="workshop-object-label">Council work paper</span>
      </button>
    </div>
  </div>
  </div>
  {/snippet}
  {#snippet panel()}
  <div class="reading-column pall-story-dialogue-section">
    <aside class="work-dialogue" aria-label="Depot delivery interaction">
      <p class="eyebrow">{atWorkshop?'PREPARING THE DELIVERY':'MUNICIPAL DEPOT'} · STAGE 4</p>
      {#if state.revision===0}
        <p class="context">{STAGE_FOUR_ROUTES.restamp.entry}</p>
      {/if}
      {#if (state.phase==='DONE'||state.phase==='EXITED')}
        <p class="outcome">{STAGE_FOUR_FINAL.restamp}</p>
        <StageFourNextStep {snapshot} {pending} {perform}/>
      {:else if speaking && beat}
        <p class="speaker">{dialogueSpeakerLabel(beat.speaker)}</p>
        <p class="speech">“{beat.text}”</p>
      {:else}
        {#if result && !(state.phase==='COMPARE_DELIVERY' && travelConfirmed)}
          <p class="result">{result}</p>
        {/if}
        {#if state.phase==='COMPARE_DELIVERY' && state.transport && travelConfirmed}
          <p class="context transport-verification">{STAGE_FOUR_TRANSPORT_VERIFICATION[state.transport]}</p>
        {/if}
        {#if !(state.phase==='COMPARE_DELIVERY' && !travelConfirmed) && result!==instruction}
          <p class="instruction">{instruction}</p>
        {/if}
        {#if state.phase==='SPEAK_DEPOT'||state.phase==='CHOOSE_RECEIPT'}
          <p class="context">The goods column on the delivery list has “workers” written in it. You brought numbered metal plates.</p>
        {/if}
      {/if}

      {#if selected}
        <div class="inspection" aria-live="polite">
          <strong>{selected==='plates'?'Numbered metal plates':'Council work paper'}</strong>
          <p>{selected==='plates'
            ? atWorkshop
              ? state.phase==='COMPARE_DELIVERY'
                ? 'You have chosen how to move the load. The plates are ready to go to the depot.'
                : 'The finished plates are together on the bench. Check the load against the paper before moving them.'
              : 'You have brought numbered metal plates to the municipal depot.'
            : atWorkshop
              ? 'The council work paper accompanies the finished plates.'
              : 'The council work paper is with the delivered plates. The depot clerk has a separate delivery list.'}</p>
        </div>
      {/if}

      {#if state.phase==='COMPARE_DELIVERY' && !travelConfirmed}
        <div class="actions"><button type="button" class="primary-choice" disabled={pending}
          onclick={() => {selected=null;confirmTravel();}}>Continue to the depot</button></div>
      {:else if workActions.length>0}
        <div class="actions" aria-label="Available delivery actions">
          {#each workActions as action (action)}
            <button type="button" class={workActions.length===1?'primary-choice':'secondary-choice'}
              disabled={pending} onclick={() => {selected=null;void perform(action);}}>
              {STAGE_FOUR_ACTION_LABELS[action]}
              {#if action==='secure_plates'||action==='carry_smaller_loads'}
                <small class="transport-hint">{STAGE_FOUR_TRANSPORT_HINTS[action]}</small>
              {/if}
            </button>
          {/each}
        </div>
      {/if}
      {#if errorMessage}<p role="alert" class="error">{errorMessage}</p>{/if}
      {#if pending}<p role="status" class="saving">Saving the work…</p>{/if}
    </aside>
  </div>
  {/snippet}
  </ActivityLayout>
  {#if journalOpen}
    <section id="depot-job-journal" class="journal" bind:this={journalElement}
      aria-label="Depot Intake Run personal journal">
      <header class="journal-head">
        <div><small>PERSONAL JOURNAL</small><h2>Depot Intake Run</h2></div>
        <button type="button" class="journal-button" onclick={() => {void toggleJournal();}}>Close journal</button>
      </header>
      {#if journal.length}
        {#each journal as entry,i (i)}<p>{entry}</p>{/each}
      {:else}
        <p>You have not recorded any findings from this job yet.</p>
      {/if}
    </section>
  {/if}
</section>

<style>
  .depot-job{display:flex;flex-direction:column;min-width:0;color:#f1dfc7;
    font-family:var(--pall-font-reading,Georgia,serif)}
  /* Native 2:1 stage (workshop and depot paintings are both 1774x887), so the
     two counter props stay on the painted counter at any size. */
  .depot-stage{position:relative;isolation:isolate;overflow:hidden;aspect-ratio:2 / 1;background:#271e18}
  .scene-art{position:absolute;inset:0;z-index:0;
    background:url('/locations/depot/depot-background-cold.webp') center center/cover no-repeat}
  .scene-art.preparing{background-image:url('/workshop/environment.webp')}
  .scene-art::after{content:'';position:absolute;inset:0;
    background:linear-gradient(90deg,transparent 28%,#160f0b16 58%,#160f0b25 100%);
    pointer-events:none}
  .table-props{position:absolute;left:4%;bottom:1.5%;width:53%;height:38%;z-index:2;
    display:flex;gap:3%;align-items:flex-end}
  .table-prop{appearance:none;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;
    position:relative;min-width:0;height:100%;border:0;padding:0;background:transparent;
    cursor:pointer;color:#f8e9d0;font:13px/1.3 var(--pall-font-reading,Georgia,serif)}
  .table-prop.plates{width:55%}
  .table-prop.paper{width:40%}
  .table-prop img{display:block;width:100%;height:calc(100% - 45px);object-fit:contain;
    filter:drop-shadow(0 5px 5px #080501a8);transform:scale(1);
    transform-origin:center 75%;transition:transform 150ms ease-out;pointer-events:none}
  .table-prop:is(:hover,:focus-visible) img{transform:scale(1.018)}
  .table-prop .workshop-object-label{width:100%;max-width:240px}
  .table-prop:focus-visible{outline:2px solid #edd19a;outline-offset:2px}
  /* Reading column: content-height, never an internal scrollbar. */
  .reading-column{flex-direction:column;align-items:stretch}
  .work-dialogue{position:relative;width:100%;min-width:0;box-sizing:border-box;
    max-height:none;overflow:visible;
    background:#e9d9bb;color:#261b13;border:2px solid #785637;border-radius:5px;
    margin:0;padding:16px 19px;box-shadow:0 7px 18px #0008}
  .eyebrow{font:normal 15px/1.2 var(--pall-font-label,'Arial Narrow',sans-serif);
    letter-spacing:.085em;color:#65462f;margin:0 0 13px}
  .speaker{font:normal 15px/1.2 var(--pall-font-label,'Arial Narrow',sans-serif);
    letter-spacing:.075em;color:#65462f;margin:0 0 8px}
  .speech{font:var(--dialogue-text,17px)/1.55 var(--pall-font-reading,Georgia,serif);margin:0 0 15px}
  .instruction,.result,.outcome,.context{font:var(--dialogue-text,17px)/1.55 var(--pall-font-reading,Georgia,serif);margin:0 0 13px}
  .instruction,.outcome{font-weight:600}
  .context{color:#503b2b}
  .inspection{border-top:1px solid #bba07a;padding-top:10px;margin:13px 0;
    font:15px/1.45 var(--pall-font-reading,Georgia,serif);color:#59412d}
  .inspection strong{color:#3f2d1f}
  .inspection p{margin:6px 0 0}
  .actions{display:flex;flex-direction:column;gap:7px;margin:15px 0}
  .actions .transport-hint{display:block;margin-top:4px;font:12px/1.35 var(--pall-font-reading,Georgia,serif);opacity:.86}
  .transport-verification{margin-top:0}
  .error{font:13px/1.4 sans-serif;color:#842c19}
  .saving{font:12px sans-serif;color:#6c5133}
  .journal-trigger{padding-top:11px;margin-top:17px;border-top:1px solid #bca482}
  .journal-button{background:#dbcaab;border:1px solid #8c6d50;color:#3a281b;
    padding:7px 10px;font:600 15px/1.3 var(--pall-font-reading,Georgia,serif);cursor:pointer}
  .journal-button:is(:hover,:focus-visible){background:#eedabc}
  .journal{background:#e6d5b5;color:#24160e;padding:24px clamp(15px,3vw,48px);
    border-top:2px solid #98714c;scroll-margin-top:12px}
  .journal-head{max-width:960px;display:flex;justify-content:space-between;align-items:center;
    gap:12px;margin:0 auto 17px}
  .journal-head small{font:700 14px/1.25 var(--pall-font-label,'Arial Narrow',sans-serif);letter-spacing:.09em;color:#47301d}
  .journal-head h2{font:600 24px/1.25 var(--pall-font-reading,Georgia,serif);color:#25170f;margin:5px 0}
  .journal>p{max-width:960px;margin:0 auto 10px;font:600 16px/1.55 var(--pall-font-reading,Georgia,serif);color:#24160e}
  /* Narrow stage: the props get their own row overlapping the counter edge,
     so both stay large enough to tap (same treatment as before, by stage width). */
  @container activity-stage (max-width:600px){
    .depot-stage{aspect-ratio:auto;overflow:visible}
    .scene-art{position:relative;inset:auto;width:100%;aspect-ratio:2/1}
    .table-props{position:relative;left:auto;bottom:auto;width:100%;height:155px;
      margin-top:-80px;gap:2%;padding:0 8px;box-sizing:border-box}
    .table-prop.plates{width:52%}
    .table-prop.paper{width:45%}
  }
  @container activity-panel (max-width:480px){
    .work-dialogue{padding:14px}
  }
  @media(prefers-reduced-motion:reduce){
    .table-prop img{transition:none}
  }
</style>
