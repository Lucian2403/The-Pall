<script lang="ts">
  import {tick} from 'svelte';
  import type {SecondJobAction,SecondJobState} from '@the-pall/game-core';
  import {
    STAGE_FOUR_ROUTES,STAGE_FOUR_DIALOGUE,STAGE_FOUR_INSTRUCTIONS,
    STAGE_FOUR_ACTION_LABELS,STAGE_FOUR_OUTCOMES,STAGE_FOUR_FINAL,
    secondJobJournal
  } from '$lib/approved-stage-four';

  type Snapshot={
    stage:number;tutorialStatus:string;state:SecondJobState;
    availableActions:SecondJobAction[];
    tutorialPayout:{coins:number;ordinaryXp:number;items:number};
  };
  let {snapshot,pending,errorMessage,perform}:{
    snapshot:Snapshot;pending:boolean;errorMessage:string;
    perform:(action:SecondJobAction)=>Promise<void>;
  }=$props();

  const state=$derived(snapshot.state);
  const speaking=$derived(state.phase==='CONTRACTS_DIALOGUE');
  const beat=$derived(speaking?STAGE_FOUR_DIALOGUE.contracts[state.dialogueIndex]:null);
  const result=$derived(state.lastAction?STAGE_FOUR_OUTCOMES[state.lastAction]:null);
  const instruction=$derived(STAGE_FOUR_INSTRUCTIONS[state.phase]);
  const journal=$derived(secondJobJournal(state));

  // Only two owner-supplied physical props. The approved compensation/charge
  // comparison remains in the dialogue, not painted onto these book images.
  let inspected=$state<'death'|'wage'|null>(null);
  let journalOpen=$state(false);
  let journalElement:HTMLElement|undefined;

  function inspect(which:'death'|'wage'){
    inspected=inspected===which?null:which;
  }
  async function toggleJournal(){
    journalOpen=!journalOpen;
    await tick();
    if(journalOpen)journalElement?.scrollIntoView({block:'start',behavior:'smooth'});
  }
</script>

<section class="second-job contracts-job" aria-label="Disputed Docket, Commerce and Contracts Stage 4">
  <div class="contracts-scene">
    <div class="office-art" role="img"
      aria-label="Council Contracts office with bookshelves, a record desk, filing cabinets and a tall arched window"></div>

    <div class="record-props" aria-label="Books on the Contracts office counter">
      <button type="button" class="record-prop death" class:chosen={inspected==='death'}
        aria-pressed={inspected==='death'} aria-label="Inspect the Death Register"
        onclick={() => inspect('death')}>
        <img src="/locations/contracts/death-register.webp" alt="" aria-hidden="true"/>
        <span>Death register</span>
      </button>
      <button type="button" class="record-prop wage" class:chosen={inspected==='wage'}
        aria-pressed={inspected==='wage'} aria-label="Inspect the Wage Record"
        onclick={() => inspect('wage')}>
        <img src="/locations/contracts/wage-record.webp" alt="" aria-hidden="true"/>
        <span>Wage record</span>
      </button>
    </div>

    <aside class="work-dialogue" aria-label="Contracts office interaction">
      <p class="eyebrow">DISPUTED DOCKET · STAGE 4</p>
      {#if state.revision===0}
        <p class="context">{STAGE_FOUR_ROUTES.contracts.entry}</p>
      {/if}
      {#if state.phase==='DONE'}
        <p class="outcome">{STAGE_FOUR_FINAL.contracts}</p>
      {:else if speaking && beat}
        <p class="speaker">{beat.speaker==='Player'?'You':beat.speaker}</p>
        <p class="speech">“{beat.text}”</p>
      {:else}
        {#if result}
          <p class="result">{result}</p>
        {/if}
        {#if result!==instruction}
          <p class="instruction">{instruction}</p>
        {/if}
        {#if state.phase==='SPEAK_CONTRACTS'||state.phase==='CHOOSE_CHALLENGE'}
          <p class="context">One sealed record lists the worker as dead for compensation. Another lists him as active for contract charges.</p>
        {/if}
      {/if}

      {#if inspected}
        <div class="inspection" aria-live="polite">
          <strong>{inspected==='death'?'Death register':'Wage record'}</strong>
          <p>{inspected==='death'
            ? 'An open council register, with ruled pages worn by use.'
            : 'An open council wage book, with rows prepared for written entries.'}</p>
        </div>
      {/if}

      {#if snapshot.availableActions.length>0}
        <div class="actions" aria-label="Available Contracts actions">
          {#each snapshot.availableActions as action (action)}
            <button type="button" disabled={pending} onclick={() => {inspected=null;void perform(action);}}>
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
    <span>Council records remain at the office. No wages or inventory items are awarded here.</span>
    <button type="button" class="journal-button" aria-expanded={journalOpen}
      aria-controls="contracts-job-journal"
      onclick={() => {void toggleJournal();}}>
      {journalOpen?'Close journal':'Review journal'}
    </button>
  </div>

  {#if journalOpen}
    <section id="contracts-job-journal" class="journal" bind:this={journalElement}
      aria-label="Disputed Docket personal journal">
      <header class="journal-head">
        <div><small>PERSONAL JOURNAL</small><h2>Disputed Docket</h2></div>
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
  .contracts-job{display:flex;flex-direction:column;min-width:0;
    font-family:var(--pall-font-reading,Georgia,serif)}
  .contracts-scene{position:relative;isolation:isolate;overflow:hidden;
    height:clamp(690px,76vh,830px);min-width:0;background:#322720}
  .office-art{position:absolute;inset:0;z-index:0;
    background:url('/locations/contracts/contracts-office.webp') center 55%/cover no-repeat}
  .record-props{position:absolute;z-index:2;left:2.5%;bottom:8%;width:54%;height:29%;
    display:flex;align-items:flex-end;justify-content:center;gap:2%}
  .record-prop{appearance:none;display:flex;flex-direction:column;justify-content:flex-end;
    align-items:center;min-width:0;height:100%;padding:0;border:0;
    background:transparent;color:#f3e3ca;cursor:pointer;
    font:14px/1.25 var(--pall-font-reading,Georgia,serif)}
  .record-prop.death{width:49%}
  .record-prop.wage{width:49%}
  .record-prop img{display:block;width:100%;height:calc(100% - 34px);
    object-fit:contain;pointer-events:none;transform-origin:center 77%;
    filter:drop-shadow(0 4px 5px #100c08ae);
    transition:transform 150ms ease-out}
  .record-prop:is(:hover,:focus-visible) img{transform:scale(1.018)}
  .record-prop span{display:block;box-sizing:border-box;width:100%;max-width:240px;
    min-height:31px;padding:6px 8px;text-align:center;background:#17130de8;
    border:1px solid #967447;color:#f5e9d5;text-shadow:0 1px #000}
  .record-prop:is(:hover,:focus-visible) span,.record-prop.chosen span{
    background:#382819;border-color:#e6b978}
  .record-prop:focus-visible{outline:2px solid #e6bb83;outline-offset:2px}
  .work-dialogue{position:absolute;top:clamp(22px,2.8vw,42px);right:3%;
    z-index:3;width:min(45%,650px);box-sizing:border-box;min-width:0;
    max-height:calc(100% - 65px);overflow-y:auto;overscroll-behavior:contain;
    margin:0;padding:15px 18px;background:#ead9b9;color:#25180f;
    border:2px solid #795637;box-shadow:0 7px 18px #0008}
  .eyebrow,.speaker{font:normal 15px/1.2 var(--pall-font-label,'Arial Narrow',sans-serif);
    color:#503222;letter-spacing:.08em;margin:0 0 11px}
  .speech{font:17px/1.42 var(--pall-font-reading,Georgia,serif);margin:0 0 14px}
  .result,.instruction,.context,.outcome{font:15px/1.45 var(--pall-font-reading,Georgia,serif);
    color:#25180f;margin:0 0 12px}
  .instruction,.outcome{font-weight:600}
  .context{color:#493021}
  .inspection{border-top:1px solid #b69b74;margin:9px 0;padding-top:9px;
    font:13px/1.4 sans-serif;color:#493021}
  .inspection strong{color:#2b1c12}
  .inspection p{margin:4px 0 0}
  .actions{display:flex;flex-direction:column;gap:7px;margin:13px 0 0}
  .actions button{width:100%;min-height:44px;box-sizing:border-box;
    padding:8px 12px;background:#30251d;color:#f2dfc7;
    border:1px solid #927048;cursor:pointer;
    font:14px/1.4 var(--pall-font-reading,Georgia,serif);text-align:left}
  .actions button:disabled{opacity:.55;cursor:default}
  .error{font:13px/1.4 sans-serif;color:#912d1a}
  .saving{font:12px sans-serif;color:#675039}
  .scene-footer{display:flex;justify-content:space-between;align-items:center;gap:14px;
    padding:9px 14px;background:#201c17;color:#c9b393;font:12px/1.4 sans-serif}
  .journal-button{border:1px solid #987652;background:#d7c5a5;color:#332214;
    padding:7px 11px;white-space:nowrap;cursor:pointer;font:12px sans-serif}
  .journal-button:is(:hover,:focus-visible){background:#efddbd}
  .journal{background:#e6d5b5;color:#271c16;padding:22px clamp(14px,3vw,46px);
    border-top:2px solid #917048;scroll-margin-top:12px}
  .journal-head{display:flex;align-items:center;justify-content:space-between;gap:14px;
    max-width:950px;margin:0 auto 17px}
  .journal-head small{font:10px sans-serif;letter-spacing:.12em;color:#655139}
  .journal-head h2{margin:5px 0;font:normal 23px var(--pall-font-reading,Georgia,serif)}
  .journal>p{max-width:950px;margin:0 auto 10px;font:15px/1.55 var(--pall-font-reading,Georgia,serif)}
  @media(max-width:760px){
    .contracts-scene{display:flex;flex-direction:column;height:auto;overflow:visible}
    .office-art{position:relative;inset:auto;aspect-ratio:16/10;width:100%;
      background-position:center 50%}
    .record-props{position:relative;left:auto;bottom:auto;z-index:2;
      margin:-38px 0 0;width:100%;height:145px;box-sizing:border-box;
      padding:0 6px;gap:2%;background:linear-gradient(#33241900,#33241958)}
    .record-prop{font-size:12px}
    .work-dialogue{position:relative;top:auto;right:auto;width:100%;
      max-height:none;overflow:visible;margin:0;padding:14px}
    .scene-footer{flex-wrap:wrap}
  }
  @media(prefers-reduced-motion:reduce){
    .record-prop img{transition:none}
  }
</style>
