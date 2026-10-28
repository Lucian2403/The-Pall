<script lang="ts">
  import {tick} from 'svelte';
  import type {SecondJobAction,SecondJobState} from '@the-pall/game-core';
  import {
    STAGE_FOUR_ROUTES,STAGE_FOUR_DIALOGUE,STAGE_FOUR_INSTRUCTIONS,
    STAGE_FOUR_ACTION_LABELS,STAGE_FOUR_OUTCOMES,STAGE_FOUR_FINAL,
    secondJobJournal
  } from '$lib/approved-stage-four';

  type Snapshot={
    stage:number;
    tutorialStatus:string;
    state:SecondJobState;
    availableActions:SecondJobAction[];
    tutorialPayout:{coins:number;ordinaryXp:number;items:number};
  };
  let {snapshot,pending,errorMessage,perform}:{
    snapshot:Snapshot;
    pending:boolean;
    errorMessage:string;
    perform:(action:SecondJobAction)=>Promise<void>;
  }=$props();

  const state=$derived(snapshot.state);
  const beat=$derived(state.phase==='ARCHIVE_DIALOGUE'
    ? STAGE_FOUR_DIALOGUE.records[state.dialogueIndex] : null);
  const journal=$derived(secondJobJournal(state));
  const result=$derived(state.lastAction ? STAGE_FOUR_OUTCOMES[state.lastAction] : null);

  // The two existing owner books also suit the Scholarship records task.
  // No scraped writing or additional shift-book sprite has been fabricated.
  let inspected=$state<'death'|'wage'|null>(null);
  let inspectionNote=$state<string|null>(null);
  let journalOpen=$state(false);
  let journalElement:HTMLElement|undefined;

  const readingPhase=$derived(
    state.phase==='READ_DEATH_REGISTER'||
    state.phase==='READ_WAGE_RECORD'||
    state.phase==='EXAMINE_SCRAPED_ENTRY'
  );
  const instruction=$derived(
    state.phase==='READ_DEATH_REGISTER'
      ? 'Find the worker number in the Death Register on the counter.'
      : state.phase==='READ_WAGE_RECORD'
        ? 'Check the later Wage Record against the recorded death.'
        : state.phase==='EXAMINE_SCRAPED_ENTRY'
          ? 'Examine the damaged line in the Wage Record.'
          : STAGE_FOUR_INSTRUCTIONS[state.phase]
  );

  // All three examination steps use the server's already-approved actions.
  // An incorrect selection only changes local explanatory copy.
  function inspect(which:'death'|'wage'){
    if(pending)return;
    inspected=which;
    if(state.phase==='READ_DEATH_REGISTER'){
      if(which==='death' && snapshot.availableActions.includes('read_death_register')){
        inspectionNote=null;
        void perform('read_death_register');
      }else{
        inspectionNote='First find the council’s recorded death in the Death Register.';
      }
      return;
    }
    if(state.phase==='READ_WAGE_RECORD'){
      if(which==='wage' && snapshot.availableActions.includes('check_wage_record')){
        inspectionNote=null;
        void perform('check_wage_record');
      }else{
        inspectionNote='You have checked the death entry. Now compare the later Wage Record.';
      }
      return;
    }
    if(state.phase==='EXAMINE_SCRAPED_ENTRY'){
      if(which==='wage' && snapshot.availableActions.includes('examine_scraped_entry')){
        inspectionNote=null;
        void perform('examine_scraped_entry');
      }else{
        inspectionNote='The damaged handwritten entry is in the later Wage Record.';
      }
      return;
    }
    inspectionNote=which==='death'
      ? 'The council death register remains on the counter.'
      : 'The later wage records remain on the counter.';
  }

  async function toggleJournal(){
    journalOpen=!journalOpen;
    await tick();
    if(journalOpen)journalElement?.scrollIntoView({block:'start',behavior:'smooth'});
  }
</script>

<section class="second-job records-job" aria-label="Ledger Reconciliation, Scholarship and Investigation Stage 4">
  <div class="records-scene">
    <div class="records-art" role="img"
      aria-label="Council records room with stone arches, tall bookcases, filing cabinets and a wooden archive counter"></div>

    <!-- Reuse approved book cutouts already installed for the Commerce route.
         Interact with the images themselves; the labels are not shortcuts. -->
    <div class="record-props" aria-label="Council records on the archive counter">
      <button type="button" class="record-prop death" class:chosen={inspected==='death'}
        aria-pressed={inspected==='death'} aria-label="Examine the Death Register"
        disabled={pending} onclick={() => inspect('death')}>
        <img src="/locations/contracts/death-register.webp" alt="" aria-hidden="true"/>
        <span>Death register</span>
      </button>
      <button type="button" class="record-prop wage" class:chosen={inspected==='wage'}
        aria-pressed={inspected==='wage'} aria-label="Examine the Wage Record"
        disabled={pending} onclick={() => inspect('wage')}>
        <img src="/locations/contracts/wage-record.webp" alt="" aria-hidden="true"/>
        <span>Wage record</span>
      </button>
    </div>

    <aside class="work-dialogue" aria-label="Ledger Reconciliation interaction">
      <p class="eyebrow">LEDGER RECONCILIATION · STAGE 4</p>
      {#if state.revision===0}
        <p class="context">{STAGE_FOUR_ROUTES.records.entry}</p>
      {/if}

      {#if state.phase==='DONE'}
        <p class="outcome">{STAGE_FOUR_FINAL.records}</p>
      {:else if state.phase==='ARCHIVE_DIALOGUE' && beat}
        <p class="speaker">{beat.speaker==='Player'?'You':beat.speaker}</p>
        <p class="speech">“{beat.text}”</p>
      {:else}
        {#if result}
          <p class="result">{result}</p>
        {/if}
        {#if result!==instruction}
          <p class="instruction">{instruction}</p>
        {/if}
        {#if state.phase==='SPEAK_ARCHIVE' || state.phase==='CHOOSE_SOURCE'}
          <p class="context">The later wage record carries the worker number. Part of a handwritten entry has been scraped away.</p>
        {/if}
      {/if}

      {#if inspectionNote && inspected}
        <div class="inspection" aria-live="polite">
          <strong>{inspected==='death'?'Death register':'Wage record'}</strong>
          <p>{inspectionNote}</p>
        </div>
      {/if}

      {#if readingPhase}
        <p class="prop-hint">Select the relevant book on the counter to examine it.</p>
      {:else if snapshot.availableActions.length>0}
        <div class="actions" aria-label="Available investigation actions">
          {#each snapshot.availableActions as action (action)}
            <button type="button" disabled={pending}
              onclick={() => {inspected=null;inspectionNote=null;void perform(action);}}>
              {STAGE_FOUR_ACTION_LABELS[action]}
            </button>
          {/each}
        </div>
      {/if}

      {#if errorMessage}<p role="alert" class="error">{errorMessage}</p>{/if}
      {#if pending}<p role="status" class="saving">Saving the work…</p>{/if}
    </aside>
  </div>

  <div class="scene-footer">
    <span>Council records stay in the records room. You may note what you find.</span>
    <button type="button" class="journal-button" aria-expanded={journalOpen}
      aria-controls="records-job-journal"
      onclick={() => {void toggleJournal();}}>
      {journalOpen?'Close journal':'Review journal'}
    </button>
  </div>

  {#if journalOpen}
    <section id="records-job-journal" class="journal" bind:this={journalElement}
      aria-label="Ledger Reconciliation personal journal">
      <header class="journal-head">
        <div><small>PERSONAL JOURNAL</small><h2>Ledger Reconciliation</h2></div>
        <button type="button" class="journal-button"
          onclick={() => {void toggleJournal();}}>Close journal</button>
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
  .records-job{display:flex;flex-direction:column;min-width:0;
    font-family:var(--pall-font-reading,Georgia,serif)}
  .records-scene{position:relative;isolation:isolate;overflow:hidden;
    height:clamp(690px,76vh,830px);min-width:0;background:#242730}
  .records-art{position:absolute;inset:0;z-index:0;
    background:url('/locations/records/records-room.webp') center 49%/cover no-repeat}
  .record-props{position:absolute;z-index:2;left:2.5%;bottom:8%;
    width:54%;height:30%;display:flex;align-items:flex-end;justify-content:center;gap:2%}
  .record-prop{appearance:none;display:flex;flex-direction:column;
    justify-content:flex-end;align-items:center;min-width:0;height:100%;padding:0;
    border:0;background:transparent;color:#f3e3ca;cursor:pointer;
    font:14px/1.25 var(--pall-font-reading,Georgia,serif)}
  .record-prop.death,.record-prop.wage{width:49%}
  .record-prop img{display:block;width:100%;height:calc(100% - 34px);
    object-fit:contain;pointer-events:none;transform-origin:center 76%;
    filter:drop-shadow(0 4px 5px #100c08ae);transition:transform 150ms ease-out}
  .record-prop:is(:hover,:focus-visible):not(:disabled) img{transform:scale(1.018)}
  .record-prop span{display:block;box-sizing:border-box;width:100%;max-width:240px;
    min-height:31px;padding:6px 8px;text-align:center;background:#17130de8;
    border:1px solid #967447;color:#f5e9d5;text-shadow:0 1px #000}
  .record-prop:is(:hover,:focus-visible) span,.record-prop.chosen span{
    background:#382819;border-color:#e6b978}
  .record-prop:focus-visible{outline:2px solid #e6bb83;outline-offset:2px}
  .record-prop:disabled{cursor:wait}

  .work-dialogue{position:absolute;top:clamp(22px,2.8vw,42px);right:3%;z-index:3;
    width:min(45%,650px);min-width:0;box-sizing:border-box;max-height:calc(100% - 65px);
    overflow-y:auto;overscroll-behavior:contain;margin:0;padding:15px 18px;
    background:#ead9b9;color:#25180f;border:2px solid #795637;
    box-shadow:0 7px 18px #0008}
  .eyebrow,.speaker{font:normal 15px/1.2 var(--pall-font-label,'Arial Narrow',sans-serif);
    letter-spacing:.08em;color:#503222;margin:0 0 11px}
  .speech{font:17px/1.42 var(--pall-font-reading,Georgia,serif);margin:0 0 14px}
  .result,.instruction,.context,.outcome{font:15px/1.45 var(--pall-font-reading,Georgia,serif);
    color:#25180f;margin:0 0 12px}
  .instruction,.outcome{font-weight:600}
  .context{color:#493021}
  .inspection{border-top:1px solid #b69b74;margin:9px 0;padding-top:9px;
    font:13px/1.4 sans-serif;color:#493021}
  .inspection strong{color:#2b1c12}
  .inspection p{margin:4px 0 0}
  .prop-hint{font:600 13px/1.4 var(--pall-font-reading,Georgia,serif);
    color:#513927;margin:12px 0 0}
  .actions{display:flex;flex-direction:column;gap:7px;margin:13px 0 0}
  .actions button{width:100%;min-height:44px;box-sizing:border-box;
    padding:8px 12px;background:#30251d;color:#f2dfc7;border:1px solid #927048;
    cursor:pointer;font:14px/1.4 var(--pall-font-reading,Georgia,serif);text-align:left}
  .actions button:disabled{opacity:.55;cursor:default}
  .error{font:13px/1.4 sans-serif;color:#912d1a}
  .saving{font:12px sans-serif;color:#675039}
  .scene-footer{display:flex;justify-content:space-between;align-items:center;gap:14px;
    padding:9px 14px;background:#201c17;color:#c9b393;font:12px/1.4 sans-serif}
  .journal-button{border:1px solid #987652;background:#d7c5a5;color:#332214;
    padding:7px 11px;white-space:nowrap;cursor:pointer;font:600 15px/1.3 var(--pall-font-reading,Georgia,serif)}
  .journal-button:is(:hover,:focus-visible){background:#efddbd}
  .journal{background:#e6d5b5;color:#24160e;padding:22px clamp(14px,3vw,46px);
    border-top:2px solid #917048;scroll-margin-top:12px}
  .journal-head{display:flex;align-items:center;justify-content:space-between;gap:14px;
    max-width:950px;margin:0 auto 17px}
  .journal-head small{font:700 14px/1.25 var(--pall-font-label,'Arial Narrow',sans-serif);letter-spacing:.09em;color:#47301d}
  .journal-head h2{margin:5px 0;font:600 24px/1.25 var(--pall-font-reading,Georgia,serif);color:#25170f}
  .journal>p{max-width:950px;margin:0 auto 10px;font:600 16px/1.55 var(--pall-font-reading,Georgia,serif);color:#24160e}
  @media(max-width:760px){
    .records-scene{display:flex;flex-direction:column;height:auto;overflow:visible}
    .records-art{position:relative;inset:auto;aspect-ratio:16/10;width:100%;
      background-position:center 50%}
    .record-props{position:relative;left:auto;bottom:auto;z-index:2;
      width:100%;height:145px;margin:-38px 0 0;padding:0 6px;box-sizing:border-box;
      gap:2%;background:linear-gradient(#24201900,#24201958)}
    .record-prop{font-size:12px}
    .work-dialogue{position:relative;top:auto;right:auto;width:100%;
      max-height:none;overflow:visible;margin:0;padding:14px}
    .scene-footer{flex-wrap:wrap}
  }
  @media(prefers-reduced-motion:reduce){
    .record-prop img{transition:none}
  }
</style>
