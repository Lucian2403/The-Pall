<script lang="ts">
  import {tick} from 'svelte';
  import type {WageClaimState,WageClaimAction} from '@the-pall/game-core';
  import {
    OPENING_BEATS,DEMAND_RESPONSES,COMMON_BEATS,ROUTE_EVIDENCE,CORNERED_BEATS,
    POSITION_RESULTS,WAGE_CLAIM_LABELS,wageClaimJournal
  } from '$lib/approved-stage-five';

  type Snapshot={stage:number;tutorialStatus:string;state:WageClaimState;
    availableActions:WageClaimAction[];
    tutorialPayout:{coins:number;ordinaryXp:number;items:number}};
  let {snapshot,pending,errorMessage,perform}:{
    snapshot:Snapshot;pending:boolean;errorMessage:string;
    perform:(action:WageClaimAction)=>Promise<void>;
  }=$props();
  const state=$derived(snapshot.state);
  const beats=$derived(
    state.phase==='OPENING'?OPENING_BEATS
    :state.phase==='DEMAND_RESPONSE'&&state.demandChoice
      ?DEMAND_RESPONSES[state.demandChoice]
    :state.phase==='COMMON_EXCHANGE'?COMMON_BEATS
    :state.phase==='CORNERED'?CORNERED_BEATS
    :[]
  );
  const beat=$derived(beats[state.dialogueIndex]??null);
  const cartVisible=$derived(
    state.phase==='CORNERED'&&state.dialogueIndex>=4||
    state.phase==='CHOOSE_POSITION'||state.phase==='FIGHT_PENDING');
  const journal=$derived(wageClaimJournal(state));
  let inspected=$state<string|null>(null);
  let journalOpen=$state(false);
  let journalElement:HTMLElement|undefined;
  function inspectPaper(){
    inspected=state.phase==='OPENING'&&state.dialogueIndex<6
      ?'Flint still has the folded paper in his hand. He has not handed it to you.'
      :"You check the contractor's paper. It lists the disputed plate lot, the cancelled worker number and a processing charge against you. It does not record any wages paid to you.";
  }
  function inspectClub(){
    inspected='Flint has a short club at his side. You cannot take it from him by examining it.';
  }
  function inspectCart(){
    inspected='A work cart stands against one side of the passage. Flint is blocking the way ahead.';
  }
  async function toggleJournal(){
    journalOpen=!journalOpen;
    await tick();
    if(journalOpen)journalElement?.scrollIntoView({block:'start',behavior:'smooth'});
  }
</script>

<section class="claim" aria-label="Industrial service passage confrontation">
  <div class="passage">
    <div class="location" role="img" aria-label="An industrial service passage; scene artwork is pending review"></div>
    <div class="scene-props" aria-label="Objects in the passage">
      <button class="prop" type="button" disabled={pending} onclick={inspectPaper}>Folded paper</button>
      <button class="prop" type="button" disabled={pending} onclick={inspectClub}>Short club</button>
      {#if cartVisible}
        <button class="prop" type="button" disabled={pending} onclick={inspectCart}>Work cart</button>
      {/if}
    </div>
    <aside class="work-dialogue" aria-label="Current conversation">
      <p class="eyebrow">ON THE WAY HOME</p>
      {#if beat}
        {#if beat.speaker}<p class="speaker">{beat.speaker}</p>{/if}
        <p class="speech">{beat.speaker?'“'+beat.text+'”':beat.text}</p>
      {:else if state.phase==='DEMAND_CHOICE'}
        <p class="instruction">Check the demand or ask who sent Flint.</p>
      {:else if state.phase==='SHARE_EVIDENCE'}
        <p class="instruction">Tell Flint what you found in your second job.</p>
      {:else if state.phase==='GOING_HOME'}
        {#each ROUTE_EVIDENCE[state.branch] as line,i (i)}
          {#if line.speaker}<p class="speaker">{line.speaker}</p>{/if}
          <p class="speech">{line.speaker?'“'+line.text+'”':line.text}</p>
        {/each}
        <p class="instruction">Tell Flint you are leaving.</p>
      {:else if state.phase==='CHOOSE_POSITION'}
        <p class="instruction">You have to choose how to meet him. Flint is close enough to strike if you try to push past.</p>
        <p class="instruction">Choose your position before Flint comes at you.</p>
      {:else if state.phase==='FIGHT_PENDING'}
        <p class="speech">{state.stance?POSITION_RESULTS[state.stance]:''}</p>
        <p class="instruction">Your position is saved. The existing turn-based combat engine must be connected before the fight can begin.</p>
      {/if}
      {#if inspected}
        <div class="inspection" aria-live="polite"><p>{inspected}</p></div>
      {/if}
      {#if snapshot.availableActions.length}
        <div class="actions" aria-label="Available interaction choices">
          {#each snapshot.availableActions as action (action)}
            <button type="button" disabled={pending} onclick={()=>{
              inspected=null;void perform(action);
            }}>{WAGE_CLAIM_LABELS[action]}</button>
          {/each}
        </div>
      {/if}
      {#if errorMessage}<p class="error" role="alert">{errorMessage}</p>{/if}
      {#if pending}<p class="saving" role="status">Saving…</p>{/if}
    </aside>
  </div>
  <div class="scene-footer">
    <span>The objects can be examined without moving the conversation forward.</span>
    <button type="button" class="journal-button" aria-expanded={journalOpen}
      aria-controls="wage-claim-journal" onclick={()=>{void toggleJournal();}}>
      {journalOpen?'Close journal':'Review journal'}
    </button>
  </div>
  {#if journalOpen}
    <section id="wage-claim-journal" class="journal" bind:this={journalElement}
      aria-label="Personal journal">
      <h2>Personal journal</h2>
      {#each journal as entry,i (i)}<p>{entry}</p>{/each}
    </section>
  {/if}
</section>

<style>
  .claim{min-width:0;display:flex;flex-direction:column;font-family:var(--pall-font-reading,Georgia,serif)}
  .passage{position:relative;isolation:isolate;min-height:610px;background:#24221d;overflow:hidden}
  .location{position:absolute;inset:0;
    background:linear-gradient(90deg,#25241f 0%,#34302a 45%,#1b1a19 100%);
    border:1px solid #554637}
  .scene-props{position:absolute;z-index:1;left:2%;bottom:7%;display:flex;gap:10px;flex-wrap:wrap;max-width:47%}
  .prop{padding:9px 13px;background:#2a211bcf;color:#edddc7;border:1px solid #987658;
    font:14px/1.3 Georgia,serif;cursor:pointer;min-height:44px}
  .prop:focus-visible,.actions button:focus-visible,.journal-button:focus-visible{
    outline:2px solid #f5d3a4;outline-offset:2px}
  .work-dialogue{position:relative;z-index:2;width:min(46%,650px);min-height:180px;
    max-height:560px;overflow-y:auto;box-sizing:border-box;margin:30px 3% 30px auto;
    padding:17px 20px;background:#ead9b9;color:#25180f;border:2px solid #795637;
    box-shadow:0 7px 18px #0008}
  .eyebrow,.speaker{font:600 14px/1.3 Arial,sans-serif;letter-spacing:.06em;color:#503222;margin:0 0 10px}
  .speaker{margin-bottom:4px}
  .speech,.instruction{font:17px/1.45 Georgia,serif;margin:0 0 12px}
  .instruction{font-weight:600}
  .inspection{padding-top:10px;margin:10px 0;border-top:1px solid #b69b74;font:14px/1.4 Georgia,serif}
  .inspection p{margin:0}
  .actions{display:flex;flex-direction:column;gap:8px;margin-top:15px}
  .actions button{min-height:45px;width:100%;padding:9px 12px;text-align:left;background:#33261e;
    border:1px solid #927048;color:#f2dfc7;font:15px/1.35 Georgia,serif;cursor:pointer}
  .actions button:disabled,.prop:disabled{opacity:.55;cursor:wait}
  .error{font:13px/1.4 Arial,sans-serif;color:#912d1a}
  .saving{font:13px Arial,sans-serif;color:#55432f}
  .scene-footer{display:flex;align-items:center;justify-content:space-between;gap:14px;
    padding:9px 14px;background:#201c17;color:#c9b393;font:12px/1.4 Arial,sans-serif}
  .journal-button{padding:8px 12px;border:1px solid #987652;background:#d7c5a5;
    color:#332214;font:600 15px/1.3 Georgia,serif;cursor:pointer;white-space:nowrap}
  .journal{padding:22px clamp(14px,3vw,46px);background:#e6d5b5;color:#24160e;
    border-top:2px solid #917048;scroll-margin-top:12px}
  .journal h2,.journal p{max-width:950px;margin:0 auto 12px}
  .journal h2{font-size:23px}
  .journal p{font-size:16px;line-height:1.55}
  @media(max-width:760px){
    .passage{display:flex;flex-direction:column;min-height:0}
    .location{position:relative;inset:auto;aspect-ratio:16/9;min-height:185px}
    .scene-props{position:relative;left:auto;bottom:auto;max-width:none;padding:0 10px;margin:-45px 0 0;min-height:48px}
    .work-dialogue{width:100%;max-height:none;overflow:visible;margin:0;padding:15px}
    .scene-footer{flex-wrap:wrap}
  }
</style>
