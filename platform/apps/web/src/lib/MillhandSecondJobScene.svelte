<script lang="ts">
  import {tick} from 'svelte';
  import type {SecondJobState,SecondJobAction} from '@the-pall/game-core';
  import {
    STAGE_FOUR_ROUTES,STAGE_FOUR_DIALOGUE,STAGE_FOUR_INSTRUCTIONS,
    STAGE_FOUR_ACTION_LABELS,STAGE_FOUR_OUTCOMES,STAGE_FOUR_FINAL,secondJobJournal
  } from '$lib/approved-stage-four';

  type Snapshot={stage:number;tutorialStatus:string;state:SecondJobState;
    availableActions:SecondJobAction[];
    tutorialPayout:{coins:number;ordinaryXp:number;items:number}};
  let {snapshot,pending,errorMessage,perform}:{
    snapshot:Snapshot;pending:boolean;errorMessage:string;
    perform:(action:SecondJobAction)=>Promise<void>
  }=$props();
  let journalOpen=$state(false);
  let journalElement:HTMLElement|undefined;
  const state=$derived(snapshot.state);
  const route=$derived(STAGE_FOUR_ROUTES[state.branch]);
  const dialogue=$derived(STAGE_FOUR_DIALOGUE[state.branch]);
  const speaking=$derived(state.phase==='DEPOT_DIALOGUE'||
    state.phase==='CONTRACTS_DIALOGUE'||state.phase==='ARCHIVE_DIALOGUE');
  const beat=$derived(speaking?dialogue[state.dialogueIndex]:null);
  const journal=$derived(secondJobJournal(state));
  const actions=$derived(snapshot.availableActions);
  const result=$derived(state.lastAction?STAGE_FOUR_OUTCOMES[state.lastAction]:null);
  const committed=$derived(state.phase==='DONE');
  async function toggleJournal(){
    journalOpen=!journalOpen;
    await tick();
    if(journalOpen)journalElement?.scrollIntoView({block:'start',behavior:'smooth'});
  }
  const sceneObjects=$derived(state.branch==='restamp'
    ? ['Numbered metal plates','Council work paper','Delivery list','Receiving record']
    : state.branch==='contracts'
      ? ['Work paper','Compensation record','Contract-charge record','Council seals']
      : ['Death register','Wage records','Scraped line','Shift book']);
</script>

<section class="second-job" aria-label={'Millhand Stage 4 '+route.name}>
  <div class="chapter-scene" class:depot={state.branch==='restamp'}
    class:contracts={state.branch==='contracts'} class:records={state.branch==='records'}>
    <header class="scene-heading">
      <span class="overline">STAGE 4 · {route.family}</span>
      <h1>{route.name}</h1>
      <p class="location">{route.location}</p>
    </header>
    <div class="workspace" aria-label="Objects and records in the current workplace">
      <p class="setting">{route.entry}</p>
      <div class="work-surface" aria-label="Scene objects">
        {#each sceneObjects as obj,i (obj)}
          <div class="scene-object" class:metal={state.branch==='restamp' && i===0}
            class:record={state.branch!=='restamp'} aria-label={obj}>
            <span class="symbol" aria-hidden="true">{state.branch==='restamp'&&i===0?'▰':state.branch==='records'?'▤':'▱'}</span>
            <span>{obj}</span>
          </div>
        {/each}
      </div>
      <p class="purpose">{route.task}</p>
      <p class="art-note">Objects shown schematically while this location's artwork is being developed.</p>
    </div>
    <aside class="work-dialogue" aria-label="Current work interaction">
      <p class="eyebrow">CURRENT WORK</p>
      {#if committed}
        <p class="outcome">{STAGE_FOUR_FINAL[state.branch]}</p>
        <p class="instruction">The job is finished. The Wage Claim with Flint follows, but Stage 5 is not yet connected.</p>
      {:else if speaking && beat}
        <p class="speaker">{beat.speaker==='Player'?'You':beat.speaker}</p>
        <p class="speech">“{beat.text}”</p>
      {:else}
        <p class="instruction">{STAGE_FOUR_INSTRUCTIONS[state.phase]}</p>
        {#if result}<p class="result">{result}</p>{/if}
        {#if state.phase==='COMPARE_DELIVERY'}
          <p class="context">You have brought numbered metal plates to the depot counter. The delivery list is separate from the physical load.</p>
        {:else if state.phase==='SPEAK_DEPOT' || state.phase==='CHOOSE_RECEIPT'}
          <p class="context">The delivery list has the goods entered as “workers”, although only metal plates arrived.</p>
        {:else if state.phase==='SPEAK_CONTRACTS'||state.phase==='CHOOSE_CHALLENGE'}
          <p class="context">One sealed record lists the worker as dead for compensation. Another lists him as active for contract charges.</p>
        {:else if state.phase==='SPEAK_ARCHIVE'||state.phase==='CHOOSE_SOURCE'||state.phase==='RECORD_FINDING'}
          <p class="context">The later wage record contains the worker's number. Part of a handwritten entry has been scraped away.</p>
        {/if}
      {/if}
      {#if actions.length>0}
        <div class="actions" aria-label="Available work actions">
          {#each actions as action (action)}
            <button type="button" disabled={pending} onclick={() => {void perform(action);}}>
              {STAGE_FOUR_ACTION_LABELS[action]}
            </button>
          {/each}
        </div>
      {/if}
      {#if errorMessage}<p role="alert" class="error">{errorMessage}</p>{/if}
      {#if pending}<p role="status" class="saving">Saving the work…</p>{/if}
      <div class="journal-trigger">
        <button type="button" class="journal-button" aria-expanded={journalOpen} aria-controls="second-job-journal"
          onclick={() => {void toggleJournal();}}>{journalOpen?'Close journal':'Review journal'}</button>
      </div>
    </aside>
  </div>
  <div class="notice">Council and workshop property stays at its workplace. No wages, ordinary XP or personal inventory items are awarded for this task.</div>
  {#if journalOpen}
    <section id="second-job-journal" class="journal" bind:this={journalElement} aria-label="Stage 4 personal journal">
      <header class="journal-head"><div><small>PERSONAL JOURNAL</small><h2>{route.name}</h2></div>
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
  .second-job{display:flex;flex-direction:column;flex:1;min-width:0;color:#e6d4bf;font-family:Georgia,'Times New Roman',serif}
  .chapter-scene{display:grid;grid-template-columns:minmax(0,53%) minmax(0,47%);grid-template-rows:auto 1fr;gap:0;
    min-height:clamp(570px,calc(100dvh - 245px),900px);
    background:radial-gradient(ellipse at 30% 80%,#5e4b36 0,#27241e 50%,#1c1d20 100%);border-bottom:1px solid #62452d}
  .chapter-scene.contracts{background:radial-gradient(ellipse at 27% 75%,#574838,#262420 50%,#1c1b1a)}
  .chapter-scene.records{background:radial-gradient(ellipse at 27% 75%,#393f3d,#242624 48%,#191d20)}
  .scene-heading{grid-column:1;grid-row:1;align-self:start;padding:clamp(21px,3vw,45px) 20px 12px}
  .overline{font:600 11px sans-serif;letter-spacing:.11em;color:#d6b78e}
  .scene-heading h1{font:normal clamp(24px,3vw,37px) Georgia,serif;color:#f2dfc5;margin:10px 0 6px}
  .location{font:14px sans-serif;color:#d3bd9e;margin:0}
  .workspace{grid-column:1;grid-row:2;align-self:stretch;display:flex;flex-direction:column;justify-content:end;
    min-width:0;padding:16px clamp(15px,2.6vw,40px) 22px}
  .setting{max-width:700px;font:15px/1.52 Georgia,serif;margin:0 0 23px}
  .work-surface{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px 22px;align-items:end;
    padding:20px 10px 16px;min-height:200px;background:linear-gradient(#453624,#37291e);
    border-top:7px solid #7e5c3b;border-bottom:2px solid #1b150f}
  .scene-object{display:flex;flex-direction:column;align-items:center;justify-content:end;gap:5px;
    min-height:72px;text-align:center;font:12px/1.3 sans-serif;color:#ead6b7}
  .symbol{font:49px/1 Georgia,serif;color:#c4ad86;opacity:.85}
  .metal .symbol{color:#b9bfc2}
  .scene-object.record .symbol{color:#c1b196}
  .purpose{font:13px/1.5 sans-serif;color:#e4d2ba;margin:12px 0 3px}
  .art-note{font:11px/1.4 sans-serif;color:#b9a98c;margin:0}
  .work-dialogue{grid-column:2;grid-row:1/3;align-self:start;min-width:0;
    background:#eedebd;color:#271c13;border:2px solid #785637;border-radius:5px;
    margin:clamp(20px,2.5vw,43px) clamp(16px,2.3vw,36px) 18px 0;padding:17px 18px;
    box-shadow:0 7px 18px #0008}
  .eyebrow{font:600 10px sans-serif;letter-spacing:.14em;color:#674732;margin:0 0 13px}
  .speaker{font:600 12px sans-serif;color:#684528;margin:0 0 7px}
  .speech{font:17px/1.55 Georgia,serif;margin:0 0 17px}
  .instruction{font:600 16px/1.4 Georgia,serif;margin:0 0 14px}
  .result,.context,.outcome{font:15px/1.5 Georgia,serif;margin:0 0 14px}
  .outcome{font-weight:bold}
  .context{color:#59432e}
  .actions{display:flex;flex-direction:column;gap:8px;margin:14px 0}
  .actions button{min-height:43px;width:100%;text-align:left;padding:10px 13px;background:#30251d;color:#f0dfc7;
    border:1px solid #98734c;font:14px/1.4 Georgia,serif;cursor:pointer}
  .actions button:hover,.actions button:focus-visible{background:#56402c;outline:2px solid #cfa777;outline-offset:1px}
  .actions button:disabled{opacity:.5;cursor:default}
  .error{font:13px/1.4 sans-serif;color:#842c19}
  .saving{font:12px sans-serif;color:#6c5133}
  .journal-trigger{margin-top:19px;padding-top:12px;border-top:1px solid #c2a98b}
  .journal-button{background:#dbcaab;border:1px solid #8c6d50;color:#3a281b;padding:7px 10px;font:12px sans-serif;cursor:pointer}
  .journal-button:hover,.journal-button:focus-visible{background:#eedabc}
  .notice{background:#1d1a18;padding:10px 15px;color:#c6b093;font:12px/1.4 sans-serif}
  .journal{background:#e6d5b5;color:#2b211a;padding:24px clamp(15px,3vw,48px);border-top:2px solid #98714c;scroll-margin-top:12px}
  .journal-head{max-width:960px;display:flex;align-items:center;justify-content:space-between;gap:12px;margin:0 auto 18px}
  .journal-head small{font:10px sans-serif;letter-spacing:.12em;color:#6f583e}
  .journal-head h2{font:normal 23px Georgia,serif;margin:5px 0}
  .journal>p{max-width:960px;margin:0 auto 10px;font:15px/1.6 Georgia,serif}
  @media(max-width:760px){
    .chapter-scene{display:flex;flex-direction:column;min-height:0}
    .scene-heading{padding:16px}
    .workspace{padding:6px 14px 15px}
    .work-surface{min-height:130px;gap:8px;padding:8px}
    .symbol{font-size:32px}
    .scene-object{min-height:60px;font-size:11px}
    .work-dialogue{margin:0;border-radius:0;padding:15px}
    .setting{margin-bottom:12px}
    .speech{font-size:16px}
  }
</style>
