<script lang="ts">
  import {tick} from 'svelte';
  import type {WageClaimState,WageClaimAction} from '@the-pall/game-core';
  import {
    WAGE_CLAIM_OPENING,WAGE_CLAIM_INSTRUCTIONS,WAGE_CLAIM_ACTION_LABELS,
    WAGE_CLAIM_STANCE_OUTCOMES,WAGE_CLAIM_DEMAND_INSPECTION,
    WAGE_CLAIM_FLINT_INSPECTION,WAGE_CLAIM_CLUB_INSPECTION,WAGE_CLAIM_CART_INSPECTION,
    wageClaimBeat,wageClaimJournal
  } from '$lib/approved-stage-five';
  import '$lib/workshop-object-labels.css';

  type Snapshot={
    stage:number;tutorialStatus:string;state:WageClaimState;
    availableActions:WageClaimAction[];
    tutorialPayout:{coins:number;ordinaryXp:number;items:number};
  };
  let {snapshot,pending,errorMessage,perform}:{
    snapshot:Snapshot;pending:boolean;errorMessage:string;
    perform:(action:WageClaimAction)=>Promise<void>;
  }=$props();
  const state=$derived(snapshot.state);
  const beat=$derived(wageClaimBeat(state));
  const journal=$derived(wageClaimJournal(state));
  const offered=$derived(state.phase!=='OPENING');
  // Compute Back availability from saved position. This stays visible even
  // during a stale local API build that omits the previous_dialogue action,
  // so the user receives a clear server error instead of a dead button.
  const canGoBack=$derived(state.phase!=='OPENING'||state.dialogueIndex>0);
  const atChoice=$derived(['CHOOSE_APPROACH','CHOOSE_EVIDENCE','LEAVING','CHOOSE_STANCE'].includes(state.phase));
  const forwardActions=$derived(snapshot.availableActions.filter(a=>a!=='previous_dialogue'));
  let flintImageMissing=$state(false);
  const cornered=$derived(
    state.phase==='CORNERED_EXCHANGE'||state.phase==='CHOOSE_STANCE'||state.phase==='DONE');
  let inspected=$state<'bill'|'club'|'cart'|null>(null);
  let inspectionNote=$state('');
  let journalOpen=$state(false);
  let journalElement:HTMLElement|undefined;

  function inspect(which:'bill'|'club'|'cart'){
    if(pending)return;
    inspected=which;
    if(which==='bill'){
      if(state.phase==='CHOOSE_APPROACH'&&snapshot.availableActions.includes('read_demand')){
        inspectionNote='';
        void perform('read_demand');
        return;
      }
      inspectionNote=offered?WAGE_CLAIM_DEMAND_INSPECTION
        :'Flint still has the folded paper in his hand. He has not handed it to you.';
    }else if(which==='club')inspectionNote=WAGE_CLAIM_CLUB_INSPECTION;
    else inspectionNote=WAGE_CLAIM_CART_INSPECTION;
  }
  async function toggleJournal(){
    journalOpen=!journalOpen;
    await tick();
    if(journalOpen)journalElement?.scrollIntoView({block:'start',behavior:'smooth'});
  }
  function choose(action:WageClaimAction){
    inspected=null;inspectionNote='';
    void perform(action);
  }
</script>

<section class="second-job wage-claim" aria-label="Millhand Stage 5 The Wage Claim and Cornered">
  <div class="alley-scene">
    <div class="alley-art" role="img"
      aria-label="A narrow industrial service passage in Grand Cylinder City, lit by gas lamps, with a wooden work cart to one side"></div>
    <!-- Flint and his club are one physical inspection target, not two detached labels. -->
    <button type="button" class="flint-figure" data-pall-sfx="click"
      aria-label="Inspect Flint and his club" aria-pressed={inspected==='club'}
      onclick={()=>inspect('club')}>
      {#if !flintImageMissing}
        <img src="/characters/flint/flint-standing.webp" alt=""
          class="flint-image" onerror={()=>{flintImageMissing=true;}}/>
      {:else}
        <span class="flint-missing" role="status">Flint artwork unavailable. Install flint-standing.webp in the game's character assets.</span>
      {/if}
      <span class="workshop-object-label flint-label">Flint</span>
    </button>
    <button type="button" class="object cart" data-pall-sfx="click" aria-label="Inspect the work cart"
      aria-pressed={inspected==='cart'} onclick={()=>inspect('cart')}>
      <span class="workshop-object-label">Work cart</span>
    </button>
    {#if offered}
      <button type="button" class="object bill" data-pall-sfx="paper"
        aria-label="Examine the contractor's folded demand"
        aria-pressed={inspected==='bill'} onclick={()=>inspect('bill')}>
        <span class="folded-paper" aria-hidden="true"></span>
        <span class="workshop-object-label">Contractor's demand</span>
      </button>
    {/if}

    <aside class="work-dialogue" aria-label="Flint dialogue and confrontation">
      <p class="eyebrow">{cornered?'CORNERED':'THE WAGE CLAIM'} · STAGE 5</p>
      {#if state.phase==='OPENING'}
        <p class="context">{WAGE_CLAIM_OPENING}</p>
      {/if}
      {#if beat}
        {#if beat.speaker==='Narration'}
          <p class="context current-beat">{beat.text}</p>
        {:else}
          <p class="speaker">{beat.speaker==='Player'?'You':'Flint'}</p>
          <p class="speech">“{beat.text}”</p>
        {/if}
      {:else if state.phase==='CHOOSE_STANCE'}
        <p class="context">You have to choose how to meet him. Flint is close enough to strike if you try to push past.</p>
        <p class="instruction">{WAGE_CLAIM_INSTRUCTIONS[state.phase]}</p>
      {:else if state.phase==='DONE' && state.stance}
        <p class="context">{WAGE_CLAIM_STANCE_OUTCOMES[state.stance]}</p>
        <p class="instruction">Your choice is saved. Stage 6 will use this position when the real Flint encounter is connected.</p>
        <p class="context boundary">Stage 6 combat is not yet integrated. No attack or damage has been simulated.</p>
      {:else}
        <p class="instruction">{WAGE_CLAIM_INSTRUCTIONS[state.phase]}</p>
      {/if}

      {#if inspectionNote}
        <section class="inspection" aria-live="polite" aria-label="Object inspection">
          <h3 class="inspection-title">{inspected==='bill'?"Contractor's demand":inspected==='club'?'Flint':'Work cart'}</h3>
          {#if inspected==='club'}
            <p class="inspection-text">{WAGE_CLAIM_FLINT_INSPECTION}</p>
            <p class="inspection-weapon"><strong>His club:</strong> {inspectionNote}</p>
          {:else}
            <p class="inspection-text">{inspectionNote}</p>
          {/if}
        </section>
      {/if}
      {#if forwardActions.length}
        {#if atChoice}
          <p class="decision-prompt">Choose your response</p>
        {/if}
        <div class="actions" aria-label="Available confrontation actions">
          {#each forwardActions as action (action)}
            <button type="button" disabled={pending} onclick={()=>choose(action)}
              data-pall-sfx={action==='read_demand'?'paper':'click'}>
              {WAGE_CLAIM_ACTION_LABELS[action]}
            </button>
          {/each}
        </div>
      {/if}
      {#if canGoBack}
        <div class="back-nav">
          <button type="button" class="back-button" disabled={pending}
            data-pall-sfx="click" onclick={()=>choose('previous_dialogue')}>
            ← Previous dialogue
          </button>
        </div>
      {/if}
      {#if errorMessage}<p class="error" role="alert">{errorMessage}</p>{/if}
      {#if pending}<p class="saving" role="status">Saving the conversation…</p>{/if}
      <div class="journal-trigger">
        <button type="button" class="journal-button" data-pall-sfx="paper"
          aria-expanded={journalOpen} aria-controls="wage-claim-journal"
          onclick={()=>{void toggleJournal();}}>{journalOpen?'Close journal':'Review journal'}</button>
      </div>
    </aside>
  </div>

  {#if journalOpen}
    <section id="wage-claim-journal" class="journal" bind:this={journalElement}
      aria-label="The Wage Claim personal journal">
      <header class="journal-head">
        <div><small>PERSONAL JOURNAL</small><h2>The Wage Claim</h2></div>
        <button type="button" class="journal-button" data-pall-sfx="paper"
          onclick={()=>{void toggleJournal();}}>Close journal</button>
      </header>
      {#if journal.length}
        {#each journal as entry,i (i)}<p>{entry}</p>{/each}
      {:else}
        <p>You have not recorded anything from this meeting yet.</p>
      {/if}
    </section>
  {/if}
</section>

<style>
  .wage-claim{display:flex;flex-direction:column;min-width:0;color:#edddc4;
    font-family:var(--pall-font-reading,Georgia,serif)}
  .alley-scene{position:relative;isolation:isolate;overflow:hidden;
    width:100%;height:clamp(610px,66vw,770px);background:#171b21}
  .alley-art{position:absolute;inset:0;
    background:url('/locations/alley/alley-background.webp') center center/cover no-repeat}
  .alley-art::after{content:'';position:absolute;inset:0;
    background:linear-gradient(90deg,#17100c12 0%,transparent 40%,#0a0b1240 85%);pointer-events:none}
  .flint-figure{position:absolute;z-index:2;left:5%;bottom:2.3%;
    width:38%;height:88%;display:flex;flex-direction:column;align-items:center;
    justify-content:flex-end;appearance:none;background:transparent;border:0;padding:0;
    cursor:pointer;color:#332113}
  .flint-image{height:calc(100% - 38px);width:100%;object-fit:contain;object-position:bottom center;
    filter:drop-shadow(0 9px 13px #0008)}
  .flint-label{width:min(180px,62%)}
  .flint-figure:focus-visible{outline:3px solid #f3d69c;outline-offset:3px}
  .flint-missing{display:block;max-width:70%;padding:12px;background:#1b1917c9;
    color:#eedbb9;border:1px solid #956e41;font:13px/1.45 sans-serif;
    text-align:center;pointer-events:none}
  .object{position:absolute;z-index:3;appearance:none;border:0;background:transparent;
    padding:0;cursor:pointer;color:#332113}
  .object:focus-visible{outline:3px solid #f3d69c;outline-offset:3px}
  .object .workshop-object-label{min-width:105px;max-width:220px}
  .cart{left:60%;bottom:9%;width:18%}
  .bill{left:40%;bottom:3%;width:19%;display:flex;flex-direction:column;align-items:center;gap:4px}
  .folded-paper{width:60px;height:48px;display:block;transform:rotate(-12deg);
    background:linear-gradient(145deg,#f2dfb6 0%,#cba976 88%);border:1px solid #6c5039;
    box-shadow:1px 4px 8px #000a;clip-path:polygon(0 0,84% 0,100% 18%,100% 100%,0 100%)}
  .folded-paper::after{content:'';display:block;width:66%;height:30%;
    margin:13px auto 0;border-top:2px solid #91795c;border-bottom:2px solid #91795c;opacity:.65}
  .work-dialogue{position:absolute;z-index:5;top:3.5%;right:2.4%;box-sizing:border-box;
    width:min(46%,650px);max-height:none;overflow:visible;
    background:#ead8b8;color:#2b1c11;
    border:solid transparent;border-width:21px 25px 20px;
    border-image-source:url('/ui-kit/frames/dialogue-frame-trim.png');
    border-image-slice:145 190 125 190 fill;border-image-width:21px 25px 20px;
    border-image-repeat:stretch;margin:0;padding:10px 15px 12px;
    filter:drop-shadow(0 6px 8px #0008)}
  .eyebrow,.speaker{font:600 14px/1.2 var(--pall-font-label,'Arial Narrow',sans-serif);
    letter-spacing:.065em;color:#60402a;margin:0 0 10px}
  .speech{font:600 17px/1.4 var(--pall-font-reading,Georgia,serif);margin:0 0 12px}
  .context,.instruction{font:15px/1.45 var(--pall-font-reading,Georgia,serif);margin:0 0 11px}
  .instruction{font-weight:700}
  .context{color:#463020}
  .current-beat{font-weight:600;white-space:pre-line}
  /* Inspected objects use the same readable presentation: Flint, cart and paper.
     This is only descriptive UI, never a dialogue or quest-state transition. */
  .inspection{
    box-sizing:border-box;
    margin:12px 0 14px;
    padding:12px 14px;
    background:#f4e5cd;
    border:1px solid #b99a70;
    color:#2b2016;
    overflow-wrap:break-word;
  }
  .inspection-title{
    margin:0 0 8px;
    font:700 17px/1.3 var(--pall-font-reading,Georgia,serif);
    color:#2d1d12;
  }
  .inspection-text,.inspection-weapon{
    margin:0;
    font:600 16px/1.55 var(--pall-font-reading,Georgia,serif);
    color:#342316;
  }
  .inspection-weapon{margin-top:10px;padding-top:9px;border-top:1px solid #b99a70}
  .inspection-weapon strong{font-weight:700;color:#26190f}
  .decision-prompt{margin:10px 0 7px;font:700 14px/1.3 var(--pall-font-reading,Georgia,serif);color:#614126}
  .actions{display:flex;flex-direction:column;gap:7px;margin:10px 0}
  .actions button{appearance:none;min-height:43px;text-align:left;padding:8px 13px;
    border:solid transparent;border-width:9px 17px 9px;
    border-image-source:url('/ui-kit/buttons/button-normal-trim.png');
    border-image-slice:50 180 45 180 fill;border-image-width:9px 17px 9px;
    background:transparent;color:#2a1c12;cursor:pointer;
    font:700 15px/1.25 var(--pall-font-reading,Georgia,serif)}
  .actions button:is(:hover,:focus-visible){border-image-source:url('/ui-kit/buttons/button-hover-trim.png')}
  .actions button:focus-visible{outline:2px solid #885f2c;outline-offset:2px}
  .actions button:disabled{opacity:.6;cursor:default}
  .back-nav{margin:10px 0 0}
  .back-button{appearance:none;border:1px solid #977956;background:#e6d3b1;color:#382619;
    padding:7px 12px;min-height:36px;cursor:pointer;
    font:600 14px/1.3 var(--pall-font-reading,Georgia,serif)}
  .back-button:is(:hover,:focus-visible){background:#f3dfc0;border-color:#6a4a31}
  .back-button:disabled{opacity:.55;cursor:default}
  .journal-trigger{border-top:1px solid #bfa889;margin-top:12px;padding-top:10px}
  .journal-button{background:#e5d1ae;border:1px solid #906c49;padding:6px 10px;
    font:600 14px/1.3 var(--pall-font-reading,Georgia,serif);color:#352414;cursor:pointer}
  .journal-button:is(:hover,:focus-visible){background:#f6e4c3}
  .saving{font:12px sans-serif;color:#6b4e32}
  .error{color:#862d22;font:13px/1.4 sans-serif}
  .boundary{font-size:13px}
  .journal{background:#e6d5b5;color:#25180d;padding:23px clamp(16px,3vw,45px);
    border-top:2px solid #94704a;scroll-margin-top:14px}
  .journal-head{max-width:960px;display:flex;justify-content:space-between;align-items:center;
    margin:0 auto 15px;gap:12px}
  .journal-head small{font:700 13px/1.3 var(--pall-font-label,'Arial Narrow',sans-serif)}
  .journal-head h2{margin:4px 0;font:600 24px/1.3 Georgia,serif}
  .journal>p{max-width:960px;margin:0 auto 10px;font:600 16px/1.55 Georgia,serif}
  @media(max-width:850px){
    .alley-scene{height:auto;overflow:visible;padding-top:52%;background:#211b1a}
    .alley-art{height:55%;bottom:auto;background-size:cover;background-position:center top}
    .flint-figure{top:0;bottom:auto;left:0;width:44%;height:38%}
    .flint-image{height:calc(100% - 30px)}
    .object{top:39%;bottom:auto}
    .cart{left:72%;width:25%}
    .bill{left:31%;width:38%;top:33%}
    .work-dialogue{position:relative;top:auto;right:auto;max-height:none;
      overflow:visible;width:100%;padding:9px 10px 11px;border-width:15px 17px}
    .speech{font-size:16px}
    .inspection{padding:11px 12px}
    .inspection-title{font-size:16px}
    .inspection-text,.inspection-weapon{font-size:15px;line-height:1.5}
  }
  @media(prefers-reduced-motion:reduce){.object,.actions button{transition:none}}
</style>
