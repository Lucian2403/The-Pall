<script lang="ts">
  import {tick} from 'svelte';
  import type {MissingStampAction,MissingStampState} from '@the-pall/game-core';
  import type {ReadableMissingStampEvidence} from '$lib/approved-stage-three';
  import {MISSING_STAMP_CONFRONTATION,MISSING_STAMP_HANDOFF,MISSING_STAMP_OPENING,CANCELLATION_NARRATION,PLATE_NARRATION,stageThreeFinding,MISSING_STAMP_ROUTES,missingStampJournal} from '$lib/approved-stage-three';
  import NpcConversation from '$lib/NpcConversation.svelte';
  import {GUTHER_WORK_SKIP_LINE} from '$lib/approved-guther-optional';

  type Snapshot = {
    stage:number;tutorialStatus:string;
    state:MissingStampState;
    availableActions:MissingStampAction[];
    contentReady:boolean;
    detailsAuthored:boolean;
    slip:{workerNumber:string|null;recordedDeathDate:string|null}|null;
    plate:{workerNumber:string|null;inspectionDate:string|null;inspectionMarkPresent:boolean}|null;
    finding:ReadableMissingStampEvidence|null;
    majorSkillBonuses:Record<string,number>;
    tutorialPayout:{coins:number;ordinaryXp:number;items:number};
  };
  let {snapshot,pending,errorMessage,perform,continueToJob}:{
    snapshot:Snapshot;
    pending:boolean;
    errorMessage:string;
    perform:(action:MissingStampAction)=>Promise<void>;
    continueToJob:()=>void;
  }=$props();

  let talkingOptional=$state(false);
  let inspectedView=$state<'slip'|'plate'|null>(null);
  let journalOpen=$state(false);
  let sceneElement:HTMLDivElement|undefined;
  let journalElement:HTMLElement|undefined;

  // The journal lives outside the workshop scene. Expanding it must never
  // enlarge the NPC's small dialogue popup or push objects beneath it.
  async function toggleJournal() {
    journalOpen=!journalOpen;
    await tick();
    if(journalOpen) journalElement?.scrollIntoView({block:'start',behavior:'smooth'});
    else sceneElement?.scrollIntoView({block:'start',behavior:'smooth'});
  }
  const state=$derived(snapshot.state);
  const beat=$derived(MISSING_STAMP_CONFRONTATION[state.dialogueIndex]??null);
  const journal=$derived(missingStampJournal(state,snapshot.finding,snapshot.slip,snapshot.plate));
  const branchCopy=$derived(state.branch?MISSING_STAMP_ROUTES[state.branch]:null);
  const canAct=(a:MissingStampAction)=>snapshot.availableActions.includes(a)&&!pending;
  async function inspect(which:'slip'|'plate'){
    if(state.phase==='CONFRONT'||state.phase==='DECISION'||state.phase==='RESTAMP')return;
    talkingOptional=false;
    inspectedView=which;
    const act=which==='slip'?'read_cancellation_slip':'turn_returned_plate';
    if(canAct(act))await perform(act);
  }
</script>

<section class="workshop" aria-label="Millhand Stage 3 The Missing Stamp">
  <div class="scene" bind:this={sceneElement}>
    <div class="illustration">
      <img class="environment" src="/workshop/environment.webp" alt="Guther's smithing workshop" />
      <img class="guther" src="/workshop/guther-front.webp" alt="Guther Anvil" />
      <button type="button" class="npc-hotspot" disabled={state.phase==='CONFRONT'||state.phase==='DECISION'}
        onclick={() => {talkingOptional=true;inspectedView=null;}} aria-label="Speak to Guther Anvil">
        <span class="npc-label">Guther Anvil</span>
      </button>

    </div>

    <aside class="dialogue" aria-label="The Missing Stamp dialogue">
      {#if talkingOptional}
        <NpcConversation origin="Millhand" close={() => {talkingOptional=false;}} />
      {:else}
        <p class="eyebrow">THE MISSING STAMP · STAGE 3</p>
        {#if state.phase==='INSPECT'||state.phase==='READY_TO_SPEAK'}
          {#if !state.slipRead && !state.plateRead && !inspectedView}
            <p class="speaker">Guther</p>
            <p class="speech">“{MISSING_STAMP_HANDOFF}”</p>
            <p class="story">{MISSING_STAMP_OPENING}</p>
          {:else if inspectedView==='slip'}
            <p class="story">{CANCELLATION_NARRATION}</p>
          {:else if inspectedView==='plate'}
            <p class="story">{PLATE_NARRATION}</p>
          {:else}
            <p class="story">{MISSING_STAMP_OPENING}</p>
          {/if}

          {#if inspectedView==='slip' && state.slipRead && snapshot.slip}
            <div class="record" aria-label="Cancellation slip">
              <strong>CANCELLATION SLIP</strong>
              <p>Recorded as: Dead after a workshop fire with locked doors.</p>
              <p>Worker number: {snapshot.slip.workerNumber ?? 'Present on the original record'}</p>
              <p>Recorded death date: {snapshot.slip.recordedDeathDate ?? 'Dated in the council record'}</p>
            </div>
          {:else if inspectedView==='plate' && state.plateRead && snapshot.plate}
            <div class="record" aria-label="Returned reference plate">
              <strong>RETURNED REFERENCE PLATE</strong>
              <p>Worker number: {snapshot.plate.workerNumber ?? 'Stamped into the plate'}</p>
              <p>Council inspector's mark: Present, separate from your stamping.</p>
              <p>Inspection date: {snapshot.plate.inspectionDate ?? 'Dated beside the mark'}</p>
            </div>
          {/if}

          <p class="instruction">
            {state.phase==='INSPECT' ? 'Examine the returned plate and the folded slip.' : 'Both records have been examined.'}
          </p>
          {#if snapshot.finding}
            <p class="finding">{stageThreeFinding(snapshot.finding)}</p>
            <p class="finding">The same worker number was recorded as dead before the council inspection date.</p>
            <div class="choices">
              <button type="button" disabled={!canAct('show_guther')} onclick={() => {void perform('show_guther');}}>
                Show Guther the papers
              </button>
            </div>

          {/if}
          <p class="hint">Select either evidence object on the bench to inspect it again.</p>

        {:else if state.phase==='CONFRONT' && beat}
          <p class="speaker">{beat.speaker==='Player'?'You':beat.speaker}</p>
          <p class:stage-narration={'kind' in beat && beat.kind==='narration'} class="speech">
            {'kind' in beat && beat.kind==='narration' ? beat.text : '“'+beat.text+'”'}
          </p>
          <div class="choices">
            <button type="button" disabled={!canAct('continue_dialogue')} onclick={() => {void perform('continue_dialogue');}}>Continue</button>
            <button type="button" class="leave" disabled={!canAct('skip_confrontation')} onclick={() => {void perform('skip_confrontation');}}>{GUTHER_WORK_SKIP_LINE}</button>
          </div>
        {:else if state.phase==='DECISION'}
          <p class="story">You put the returned plate and the cancellation slip before Guther. He cannot approve the lot. Decide what you will do next.</p>
          <p class="instruction">Choose what you will do next.</p>
          <div class="choices">
            {#each ['restamp','contracts','records'] as route (route)}
              {@const copy=MISSING_STAMP_ROUTES[route as keyof typeof MISSING_STAMP_ROUTES]}
              {@const action=('choose_'+route) as MissingStampAction}
              <button type="button" disabled={!canAct(action)} onclick={() => {void perform(action);}}>
                “{copy.choice}” <span class="route">{copy.label}</span>
              </button>
            {/each}
          </div>
        {:else if branchCopy}
          <p class="speaker">Guther</p>
          <p class="speech">“{branchCopy.response}”</p>
          <p class="story">{branchCopy.consequence}</p>
          {#if state.phase==='RESTAMP'}
            <p class="instruction">Make one more worker-number mark. Do not touch the council inspector's mark.</p>
            <div class="choices">
              <button type="button" disabled={!canAct('restamp_worker_number')} onclick={() => {void perform('restamp_worker_number');}}>Stamp the worker number again</button>
            </div>
          {:else if state.phase==='SELECTED'}
            <div class="choices">
              <button type="button" onclick={continueToJob}>
                {state.branch==='restamp'?'Take the plates to the depot':
                  state.branch==='contracts'?'Go to the Contracts office':'Go to the records room'}
              </button>
            </div>
          {/if}
          <p class="skill">Route: {branchCopy.label}. The associated Major Skill received +1 on the saved route choice.</p>
        {/if}
        <div class="journal-trigger">
          <button type="button" class="journal-toggle" aria-expanded={journalOpen}
            aria-controls="stage-three-journal"
            onclick={() => {void toggleJournal();}}>{journalOpen?'Close journal':'Review journal'}</button>
        </div>
        {#if errorMessage}<p role="alert" class="error">{errorMessage}</p>{/if}
        {#if pending}<p role="status" class="hint">Saving…</p>{/if}
      {/if}
    </aside>
    <div class="evidence" aria-label="Council evidence on the bench">
      <button type="button" class:seen={state.plateRead} disabled={state.phase==='CONFRONT'||state.phase==='DECISION'||state.phase==='RESTAMP'}
        onclick={() => {void inspect('plate');}}>
        <img class="evidence-art" src="/workshop/returned-reference-plate.webp" alt="" aria-hidden="true" /><span class="evidence-label">Returned plate</span>
      </button>
      <button type="button" class:seen={state.slipRead} disabled={state.phase==='CONFRONT'||state.phase==='DECISION'||state.phase==='RESTAMP'}
        onclick={() => {void inspect('slip');}}>
        <img class="evidence-art" src="/workshop/cancellation-slip.webp" alt="" aria-hidden="true" /><span class="evidence-label">Cancellation slip</span>
      </button>
    </div>
  </div>
  <p class="footnote">Council-owned evidence. No wages, ordinary XP or items are awarded during this scene.</p>
  {#if journalOpen}
    <section id="stage-three-journal" class="journal-panel" bind:this={journalElement}
      aria-label="The Missing Stamp journal">
      <div class="journal-heading">
        <div><span class="journal-kicker">WORKER'S JOURNAL</span><h2>The Missing Stamp</h2></div>
        <button type="button" class="journal-toggle" onclick={() => {void toggleJournal();}}>Close journal</button>
      </div>
      <div class="journal-entries">
        {#each journal as entry,i (i)}
          <p>{entry}</p>
        {/each}
      </div>
    </section>
  {/if}
</section>

<style>
  .workshop{display:flex;flex-direction:column;flex:1;min-width:0;width:100%;color:#efdecb;font-family:var(--pall-font-reading,Georgia,serif)}
  /* Row 1 is reserved for the CRPG dialogue. Row 2 holds the physical bench props.
     Their footprints cannot intersect, including when the longest choice is shown. */
  .scene{position:relative;display:grid;grid-template-columns:minmax(0,42%) minmax(0,47%) minmax(0,11%);
    grid-template-rows:auto minmax(195px,1fr);flex:0 0 auto;width:100%;min-width:0;
    min-height:clamp(550px,calc(100dvh - 250px),1000px);background:#291d15}
  .illustration{position:absolute;inset:0;overflow:hidden}
  .environment{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;pointer-events:none}
  .guther{position:absolute;top:6%;left:11%;height:112%;width:auto;max-width:none;object-fit:contain;clip-path:inset(0 0 38% 0);pointer-events:none;z-index:1}
  .npc-hotspot{position:absolute;z-index:3;top:12%;left:12%;width:25%;height:50%;display:flex;align-items:end;justify-content:center;background:none;border:0;padding:0 0 10px;color:#f7dfb6;cursor:pointer}
  .npc-hotspot:disabled{cursor:default;opacity:.7}
  .npc-label{padding:5px 9px;border:1px solid #a4804d;background:#19150edc;font:12px sans-serif}
  .npc-hotspot:hover .npc-label,.npc-hotspot:focus-visible .npc-label{background:#3c2b19;border-color:#efd092}
  /* The image itself is the prop and hit target. Only the small nameplate is framed. */
  .evidence{position:relative;z-index:4;grid-column:1/-1;grid-row:2;align-self:end;justify-self:center;
    width:min(490px,48%);display:flex;align-items:end;justify-content:center;gap:12px;margin:0 0 13px}
  .evidence button{display:flex;flex-direction:column;justify-content:end;align-items:center;gap:3px;
    flex:1;min-width:0;margin:0;padding:0;background:transparent;border:0;color:#f3dfc1;cursor:pointer;font:13px/1.3 var(--pall-font-reading,Georgia,serif)}
  .evidence-art{display:block;object-fit:contain;width:100%;height:clamp(102px,12vw,158px);
    pointer-events:none;filter:drop-shadow(0 5px 6px #0009)}
  .evidence-label{display:block;box-sizing:border-box;width:100%;max-width:205px;min-height:29px;padding:5px 6px;
    background:#16130feb;border:1px solid #92704b;font:clamp(11px,1.06vw,13px)/1.25 var(--pall-font-reading,Georgia,serif);text-align:center}
  .evidence button:hover .evidence-label,.evidence button:focus-visible .evidence-label,
  .evidence button.seen .evidence-label{border-color:#e9bd73;background:#312415}
  .evidence button:focus-visible{outline:2px solid #f2d28f;outline-offset:3px}
  .evidence button:disabled{opacity:1;cursor:default}
  .evidence button:disabled .evidence-label{opacity:.7}
  .dialogue{position:relative;z-index:5;grid-column:2;grid-row:1;align-self:start;
    min-width:0;margin:clamp(20px,2.6vw,36px) 0 0;padding:15px 18px;
    border:2px solid #654022;border-radius:5px;background:#efdfbb;color:#251910;box-shadow:0 7px 15px #0008}
  .eyebrow{font:600 11px sans-serif;letter-spacing:.12em;color:#614029;margin:0 0 12px}
  .story,.speech,.finding{font-size:clamp(14px,1.25vw,17px);line-height:1.5;margin:0 0 13px}
  .speaker{font:600 12px sans-serif;letter-spacing:.08em;color:#6b462a;margin-bottom:8px}
  .stage-narration{font-style:italic}
  .instruction{font-weight:bold;font-size:14px;line-height:1.4;margin:14px 0}
  .choices{display:flex;flex-direction:column;gap:7px;margin-top:13px}
  .choices button{width:100%;padding:10px 12px;min-height:40px;text-align:left;font:14px/1.4 var(--pall-font-reading,Georgia,serif);border:1px solid #6d5235;background:#241d16;color:#f7e6c9;cursor:pointer}
  .choices button:hover:not(:disabled),.choices button:focus-visible{background:#423022;outline:2px solid #c49d65;outline-offset:1px}
  .choices button:disabled{opacity:.5;cursor:default}
  .choices .leave{background:#503c29}
  .route{display:block;color:#d6b78c;font:12px/1.5 sans-serif;margin-top:4px}
  .record{margin:12px 0;padding:12px;border:1px solid #a88f6d;background:#e5d1a9;font:13px/1.4 sans-serif}
  .record strong{font-size:12px;letter-spacing:.04em}
  .record p{margin:6px 0}
  .hint,.skill{font:12px/1.45 sans-serif;color:#614e39}
  .journal-trigger{border-top:1px solid #b79d7b;margin-top:15px;padding-top:10px}
  .journal-toggle{padding:7px 10px;background:#d8c7a7;border:1px solid #81654d;color:#3a281b;
    cursor:pointer;font:12px sans-serif}
  .journal-toggle:hover,.journal-toggle:focus-visible{background:#e7d2ae;border-color:#54351c}
  /* A separate page-flow journal: it cannot stretch the floating dialogue
     or move the tabletop props. The page scrolls; neither panel has a scrollbar. */
  .journal-panel{width:100%;box-sizing:border-box;padding:19px clamp(16px,4vw,46px) 25px;
    background:#e8d6b6;color:#2c2119;border-top:2px solid #9a7147}
  .journal-heading{display:flex;align-items:center;justify-content:space-between;gap:15px;max-width:930px;margin:0 auto 15px}
  .journal-kicker{font:600 10px sans-serif;letter-spacing:.14em;color:#6d5037}
  .journal-heading h2{font:normal 24px var(--pall-font-reading,Georgia,serif);margin:6px 0 0}
  .journal-entries{max-width:930px;margin:0 auto;font:15px/1.55 var(--pall-font-reading,Georgia,serif)}
  .journal-entries p{margin:9px 0}
  .error{font:13px/1.4 sans-serif;color:#873523}
  .footnote{padding:9px 14px;background:#201c17;border-top:1px solid #594229;color:#cbb8a0;font:12px/1.5 sans-serif}
  @media(max-width:700px){
    .scene{display:grid;grid-template-columns:minmax(0,1fr);grid-template-rows:auto auto;
      min-height:0;flex:0 0 auto}
    .illustration{position:relative;grid-column:1;grid-row:1;inset:auto;width:100%;aspect-ratio:4/3}
    .environment{object-position:39% center}
    .guther{height:86%;left:-5%;top:2%;clip-path:inset(0 0 38% 0)}
    .npc-hotspot{left:0;top:7%;width:41%;height:49%}
    .evidence{grid-column:1;grid-row:1;width:min(76%,440px);margin:0 0 8px;gap:7px}
    .evidence-art{height:clamp(70px,20vw,120px)}
    .evidence-label{min-height:25px;font:11px/1.2 sans-serif;padding:5px 3px}
    .dialogue{grid-column:1;grid-row:2;margin:0;width:100%;border-radius:0;padding:14px}
    .story,.speech,.finding{font-size:16px}
    .journal-heading h2{font-size:20px}
    .journal-entries{font-size:14px}
  }
  @media(max-width:375px){
    .evidence{width:82%}
    .journal-heading{align-items:start}
    .journal-heading h2{font-size:18px}
  }
</style>
