<script lang="ts">
  import type {MissingStampAction,MissingStampState,MissingStampEvidence} from '@the-pall/game-core';
  import {MISSING_STAMP_CONFRONTATION,MISSING_STAMP_OPENING,CANCELLATION_NARRATION,PLATE_NARRATION,stageThreeFinding,MISSING_STAMP_ROUTES} from '$lib/approved-stage-three';
  import NpcConversation from '$lib/NpcConversation.svelte';
  import {GUTHER_WORK_SKIP_LINE} from '$lib/approved-guther-optional';

  type Snapshot = {
    stage:number;tutorialStatus:string;
    state:MissingStampState;
    availableActions:MissingStampAction[];
    contentReady:boolean;
    slip:{workerNumber:string;recordedDeathDate:string}|null;
    plate:{workerNumber:string;inspectionDate:string;inspectionMarkPresent:boolean}|null;
    finding:MissingStampEvidence|null;
    majorSkillBonuses:Record<string,number>;
    tutorialPayout:{coins:number;ordinaryXp:number;items:number};
  };
  let {snapshot,pending,errorMessage,perform}:{
    snapshot:Snapshot;
    pending:boolean;
    errorMessage:string;
    perform:(action:MissingStampAction)=>Promise<void>;
  }=$props();

  let talkingOptional=$state(false);
  let inspectedView=$state<'slip'|'plate'|null>(null);
  const state=$derived(snapshot.state);
  const beat=$derived(MISSING_STAMP_CONFRONTATION[state.dialogueIndex]??null);
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
  <div class="scene">
    <div class="illustration">
      <img class="environment" src="/workshop/environment.webp" alt="Guther's smithing workshop" />
      <img class="guther" src="/workshop/guther-front.webp" alt="Guther Anvil" />
      <button type="button" class="npc-hotspot" disabled={state.phase==='CONFRONT'||state.phase==='DECISION'}
        onclick={() => {talkingOptional=true;inspectedView=null;}} aria-label="Speak to Guther Anvil">
        <span class="npc-label">Guther Anvil</span>
      </button>
      <div class="evidence" aria-label="Council evidence on the bench">
        <button type="button" class:seen={state.plateRead} disabled={state.phase==='CONFRONT'||state.phase==='DECISION'||state.phase==='RESTAMP'}
          onclick={() => {void inspect('plate');}}>
          <span class="item-icon" aria-hidden="true">▤</span><span>Returned plate</span>
        </button>
        <button type="button" class:seen={state.slipRead} disabled={state.phase==='CONFRONT'||state.phase==='DECISION'||state.phase==='RESTAMP'}
          onclick={() => {void inspect('slip');}}>
          <span class="item-icon" aria-hidden="true">▧</span><span>Cancellation slip</span>
        </button>
      </div>
    </div>

    <aside class="dialogue" aria-label="The Missing Stamp dialogue">
      {#if talkingOptional}
        <NpcConversation origin="Millhand" close={() => {talkingOptional=false;}} />
      {:else}
        <p class="eyebrow">THE MISSING STAMP · STAGE 3</p>
        {#if state.phase==='INSPECT'||state.phase==='READY_TO_SPEAK'}
          {#if !state.slipRead && !state.plateRead && !inspectedView}
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
              <p>Worker number: {snapshot.slip.workerNumber}</p>
              <p>Recorded as: Dead after workshop fire</p>
              <p>Recorded death date: {snapshot.slip.recordedDeathDate}</p>
            </div>
          {:else if inspectedView==='plate' && state.plateRead && snapshot.plate}
            <div class="record" aria-label="Returned reference plate">
              <strong>RETURNED REFERENCE PLATE</strong>
              <p>Worker number: {snapshot.plate.workerNumber}</p>
              <p>Council inspector's mark: Present</p>
              <p>Inspection date: {snapshot.plate.inspectionDate}</p>
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
          {:else if state.phase==='READY_TO_SPEAK'}
            <div class="content-gate">
              <strong>Development content gate</strong>
              <p>The worker number and the two dated records have not been authored. The inspections are saved, but the contradiction and subsequent dialogue cannot be verified or advanced yet. No number or date is fabricated.</p>
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
          {:else}
            <p class="instruction">Your chosen route is saved. Stage 4 begins with its corresponding follow-up task, which is not yet connected.</p>
          {/if}
          <p class="skill">Route: {branchCopy.label}. The associated Major Skill received +1 on the saved route choice.</p>
        {/if}
        {#if errorMessage}<p role="alert" class="error">{errorMessage}</p>{/if}
        {#if pending}<p role="status" class="hint">Saving…</p>{/if}
      {/if}
    </aside>
  </div>
  <p class="footnote">Council-owned evidence. No wages, ordinary XP or items are awarded during this scene.</p>
</section>

<style>
  .workshop{display:flex;flex-direction:column;flex:1;min-width:0;width:100%;color:#efdecb;font-family:Georgia,'Times New Roman',serif}
  .scene{position:relative;display:grid;grid-template-columns:minmax(0,42%) minmax(0,47%) minmax(0,11%);flex:1;min-height:clamp(450px,calc(100dvh - 350px),1100px);background:#291d15;align-content:start}
  .illustration{position:absolute;inset:0;overflow:hidden}
  .environment{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;pointer-events:none}
  .guther{position:absolute;top:6%;left:11%;height:112%;width:auto;max-width:none;object-fit:contain;clip-path:inset(0 0 38% 0);pointer-events:none;z-index:1}
  .npc-hotspot{position:absolute;z-index:3;top:12%;left:12%;width:25%;height:50%;display:flex;align-items:end;justify-content:center;background:none;border:0;padding:0 0 10px;color:#f7dfb6;cursor:pointer}
  .npc-hotspot:disabled{cursor:default;opacity:.7}
  .npc-label{padding:5px 9px;border:1px solid #a4804d;background:#19150edc;font:12px sans-serif}
  .evidence{position:absolute;z-index:4;bottom:5%;left:14%;width:66%;display:flex;justify-content:center;gap:12px;align-items:end}
  .evidence button{min-width:0;max-width:210px;display:flex;flex-direction:column;align-items:center;gap:6px;flex:1;background:#1b1712e8;color:#f3dfc1;border:1px solid #92704b;padding:10px 8px;cursor:pointer;font:13px/1.3 Georgia,serif}
  .evidence button.seen{border-color:#d2ad76}
  .evidence button:disabled{opacity:.48;cursor:default}
  .item-icon{font-size:26px;color:#e1bd85}
  .dialogue{position:relative;z-index:5;grid-column:2;align-self:start;min-width:0;margin:clamp(24px,3vw,50px) 0 24px;padding:15px 18px;border:2px solid #654022;border-radius:5px;background:#efdfbb;color:#251910;box-shadow:0 7px 15px #0008}
  .eyebrow{font:600 11px sans-serif;letter-spacing:.12em;color:#614029;margin:0 0 12px}
  .story,.speech,.finding{font-size:clamp(14px,1.25vw,17px);line-height:1.5;margin:0 0 13px}
  .speaker{font:600 12px sans-serif;letter-spacing:.08em;color:#6b462a;margin-bottom:8px}
  .stage-narration{font-style:italic}
  .instruction{font-weight:bold;font-size:14px;line-height:1.4;margin:14px 0}
  .choices{display:flex;flex-direction:column;gap:7px;margin-top:13px}
  .choices button{width:100%;padding:10px 12px;min-height:40px;text-align:left;font:14px/1.4 Georgia,serif;border:1px solid #6d5235;background:#241d16;color:#f7e6c9;cursor:pointer}
  .choices button:hover:not(:disabled),.choices button:focus-visible{background:#423022;outline:2px solid #c49d65;outline-offset:1px}
  .choices button:disabled{opacity:.5;cursor:default}
  .choices .leave{background:#503c29}
  .route{display:block;color:#d6b78c;font:12px/1.5 sans-serif;margin-top:4px}
  .record{margin:12px 0;padding:12px;border:1px solid #a88f6d;background:#e5d1a9;font:13px/1.4 sans-serif}
  .record strong{font-size:12px;letter-spacing:.04em}
  .record p{margin:6px 0}
  .content-gate{margin:12px 0;padding:12px 14px;border:1px solid #936f4a;background:#d8c3a0;font:13px/1.5 sans-serif}
  .content-gate p{margin:7px 0 0}
  .hint,.skill{font:12px/1.45 sans-serif;color:#614e39}
  .error{font:13px/1.4 sans-serif;color:#873523}
  .footnote{padding:9px 14px;background:#201c17;border-top:1px solid #594229;color:#cbb8a0;font:12px/1.5 sans-serif}
  @media(max-width:700px){
    .scene{display:flex;flex-direction:column;min-height:0}
    .illustration{position:relative;inset:auto;width:100%;aspect-ratio:4/3}
    .environment{object-position:39% center}
    .guther{height:86%;left:-5%;top:2%;clip-path:inset(0 0 38% 0)}
    .npc-hotspot{left:0;top:7%;width:41%;height:49%}
    .evidence{bottom:3%;left:20%;width:78%;gap:5px}
    .evidence button{font:11px sans-serif;padding:5px}
    .item-icon{font-size:18px}
    .dialogue{margin:0;width:100%;border-radius:0;padding:14px}
    .story,.speech,.finding{font-size:16px}
  }
</style>
