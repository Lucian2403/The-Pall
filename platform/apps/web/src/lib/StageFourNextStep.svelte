<script lang="ts">
  import {page} from '$app/state';
  import type {SecondJobAction,SecondJobState} from '@the-pall/game-core';

  let {snapshot,pending,perform}:{
    snapshot:{stage:number;state:SecondJobState;availableActions:SecondJobAction[]};
    pending:boolean;
    perform:(action:SecondJobAction)=>Promise<void>;
  }=$props();

  // The exact same exit surface is used by Industry, Commerce, and Scholarship.
  // No future character, confrontation, or combat title appears before exiting.
  const href=$derived('/characters/'+encodeURIComponent(page.params.id)+'/millhand/wage-claim');
  const label=$derived(snapshot.state.branch==='restamp'?'Leave the depot'
    :snapshot.state.branch==='contracts'?'Leave the Contracts office':'Leave the records room');
  const exitAvailable=$derived(snapshot.stage===4&&
    snapshot.state.phase==='DONE'&&snapshot.availableActions.includes('leave_location'));
  // Backwards compatibility: legacy saved characters were advanced at job
  // completion. They must not be forced to replay, re-save, or reset Stage 4.
  const alreadyAdvanced=$derived(snapshot.stage>=5&&
    (snapshot.state.phase==='DONE'||snapshot.state.phase==='EXITED'));
</script>

<nav class="stage-next-step" aria-label="Leave current location">
  <p class="stage-next-step-context">
    {snapshot.state.phase==='EXITED'?'You have already left this location.':'Your work here is finished.'}
  </p>
  {#if exitAvailable}
    <button class="stage-next-step-link primary-choice" type="button" disabled={pending}
      onclick={()=>{void perform('leave_location');}}>
      {label}
    </button>
  {:else if alreadyAdvanced}
    <a class="stage-next-step-link primary-choice" {href}>{label}</a>
  {/if}
</nav>

<style>
  .stage-next-step{
    margin-top:14px;
    padding-top:12px;
    border-top:1px solid #bca482;
    color:#332316;
  }
  .stage-next-step-context{
    margin:0 0 10px;
    font:15px/1.45 var(--pall-font-reading,Georgia,serif);
  }
</style>
