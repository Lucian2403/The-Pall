<script lang="ts">
  import {getContext,tick} from 'svelte';
  import ActivityLayout from '$lib/ActivityLayout.svelte';
  import BellrunnerChoiceIcon from '$lib/BellrunnerChoiceIcon.svelte';
  import {dialogueSpeakerLabel} from '$lib/dialogue-speaker';
  import {bellrunnerStageFourJournal} from '$lib/bellrunner-stage4-journal';
  import {SCENE_JOURNAL_CONTEXT,type SceneJournalRegistrar} from '$lib/scene-journal';
  import {
    BELLRUNNER_STAGE_FOUR,STAGE_FOUR_ACTION_LABELS,STAGE_FOUR_TASK_TEXT,
    type StageFourBranch,type StageFourAction,type StageFourPhase
  } from '$lib/bellrunner-stage4-copy';
  import '$lib/pall-story-landscape.css';
  type State={
    revision:number;branch:StageFourBranch;phase:StageFourPhase;
    openingLine:number;revelationLine:number;
    triageLine?:number;detailLine?:number;registerLine?:number;
    method:string|null;observation:string|null;priority:'urgent'|'corrected'|null;
    journalFact:string|null
  };
  type Snapshot={stage:number;tutorialStatus:string;state:State;
    availableActions:StageFourAction[];tutorialPayout:{coins:number;ordinaryXp:number;items:number}};
  let {snapshot,pending,errorMessage,perform}:{
    snapshot:Snapshot;pending:boolean;errorMessage:string;
    perform:(action:StageFourAction)=>Promise<void>;
  }=$props();
  const state=$derived(snapshot.state);
  const journal=$derived(bellrunnerStageFourJournal(state));
  const copy=$derived(BELLRUNNER_STAGE_FOUR[state.branch]);
  const instruction=$derived(STAGE_FOUR_TASK_TEXT[state.branch][state.phase]);
  const currentLine=$derived(state.phase==='opening'
    ?copy.opening[state.openingLine]
    :state.phase==='revelation'?copy.revelation[state.revelationLine]
    :state.branch==='trauma'&&state.phase==='triage_response'
      ?BELLRUNNER_STAGE_FOUR.trauma.triageResponse[state.priority==='urgent'?'urgent':'corrected'][state.triageLine??0]
    :state.branch==='trauma'&&state.phase==='detail'
      ?BELLRUNNER_STAGE_FOUR.trauma.assistance[state.detailLine??0]
    :state.branch==='trauma'&&state.phase==='confirm'
      ?BELLRUNNER_STAGE_FOUR.trauma.register[state.method==='bring_next_worker'?'escort':'observations'][state.registerLine??0]
    :null);
  const sceneHeading=$derived(state.branch==='trauma'&&state.phase==='detail'
    ?'Helping the Attendant'
    :state.branch==='trauma'&&['confirm','choose','revelation','finish'].includes(state.phase)
      ?'The Medical Register':copy.title);
  const actions=$derived(snapshot.availableActions);
  let journalOpen=$state(false);
  let journalElement:HTMLElement|undefined;
  const registerJournal=getContext<SceneJournalRegistrar|undefined>(SCENE_JOURNAL_CONTEXT);
  $effect(()=>{
    registerJournal?.({id:'bellrunner-second-job-journal',open:journalOpen,
      toggle:()=>{void toggleJournal();}});
    return ()=>registerJournal?.(null);
  });
  async function toggleJournal(){
    journalOpen=!journalOpen;
    if(journalOpen){await tick();journalElement?.scrollIntoView({block:'start',behavior:'smooth'});}
  }
  function act(action:StageFourAction){if(!pending&&actions.includes(action))void perform(action);}
</script>

<section class="workshop bellrunner-second-job" aria-label={'Bellrunner Stage 4 — '+copy.title}>
  <ActivityLayout mode="scene" stageAspect={copy.aspect} class="pall-story-sections">
    {#snippet stage()}
      <div class="scene-visuals pall-story-visuals">
        <div class="stage-art" style:aspect-ratio={String(copy.aspect)}>
          <img src={copy.image} alt={state.branch==='contracts'
            ?'An industrial records office with a large wooden counter and registers'
            :state.branch==='trauma'
              ?'A staffed industrial clinic setting'
              :'The exterior industrial courtyard outside the condemned worksite'}
            draggable="false"/>
          <span class="scene-place">{copy.place}</span>
        </div>
      </div>
    {/snippet}
    {#snippet panel()}
      <section class="pall-story-dialogue-section" aria-label={'Stage 4 '+copy.title+' interaction'}>
        <div class="work-card">
          <p class="eyebrow">SECOND JOB · STAGE IV · {copy.discipline}</p>
          <h1>{sceneHeading}</h1>
          {#if state.phase==='opening'||state.phase==='revelation'||
            (state.branch==='trauma'&&
              (state.phase==='triage_response'||state.phase==='detail'||state.phase==='confirm'))}
            {#if state.phase==='opening'&&state.openingLine===0&&state.branch!=='trauma'}
              <p class="narration">{copy.entry}</p>
            {/if}
            {#if currentLine}
              {#if currentLine.speaker==='Narration'}
                {#if state.branch==='trauma'&&state.phase==='confirm'&&(state.registerLine??0)===3}
                  <p class="narration">Under the illness category, someone has written <strong>“Non-work illness.”</strong></p>
                {:else}
                  <p class="narration">{currentLine.text}</p>
                {/if}
              {:else}
                <p class="speaker">{dialogueSpeakerLabel(currentLine.speaker).toUpperCase()}</p>
                <p class="spoken">“{currentLine.text}”</p>
              {/if}
            {/if}
          {:else if state.phase==='done'}
            <p class="narration">{copy.done}</p>
          {:else if state.phase==='exited'}
            <p class="narration">You leave the work behind. The outside service gate stands ahead.</p>
          {:else}
            {#if instruction}<p class="narration">{instruction}</p>{/if}
            {#if state.branch==='trauma'&&state.phase==='inspect'}
              <!-- Older saved Stage 4 sessions can still resume here. Show
                   the real conversation, never a duplicated evidence ledger. -->
              <p class="narration">{BELLRUNNER_STAGE_FOUR.trauma.opening[1].text}</p>
              <p class="speaker">ATTENDANT</p>
              <p class="spoken">“{BELLRUNNER_STAGE_FOUR.trauma.opening[2].text}”</p>
            {/if}
          {/if}

          {#if state.phase!=='exited'&&actions.length>0}
            <div class="actions" aria-label="Available work actions">
              {#each actions as action (action)}
                <button type="button"
                  class={action==='continue_opening'||action==='continue_triage'||
                    action==='continue_detail'||action==='continue_register'||
                    action==='continue_revelation'||
                    action==='submit_certificate'||action==='finish_handover'||
                    action==='record_inspection'||action==='leave_for_gate'
                      ?'primary-choice':'secondary-choice'}
                  disabled={pending}
                  onclick={()=>{act(action);}}>
                  {#if action!=='continue_opening'&&action!=='continue_triage'&&
                    action!=='continue_detail'&&action!=='continue_register'&&
                    action!=='continue_revelation'}
                    <BellrunnerChoiceIcon kind={action==='leave_for_gate'?'route':
                      action==='submit_certificate'||action==='record_inspection'?'mark':'book'}/>
                  {/if}
                  {STAGE_FOUR_ACTION_LABELS[action]}
                </button>
              {/each}
            </div>
          {/if}
          {#if errorMessage}<p role="alert" class="error">{errorMessage}</p>{/if}
          {#if pending}<p role="status" class="saving">Recording the work…</p>{/if}
        </div>
      </section>
    {/snippet}
  </ActivityLayout>
  {#if journalOpen}
    <section id="bellrunner-second-job-journal" class="journal-panel"
      bind:this={journalElement} aria-label={'Personal journal — '+copy.title}>
      <header class="journal-heading">
        <div>
          <span class="journal-kicker">PERSONAL JOURNAL</span>
          <h2>{copy.title}</h2>
        </div>
        <button type="button" class="journal-toggle" data-pall-sfx="paper"
          onclick={()=>{void toggleJournal();}}>Close journal</button>
      </header>
      <div class="journal-entries">
        {#each journal as entry,i (i)}
          <p>{entry}</p>
        {/each}
      </div>
    </section>
  {/if}
</section>

<style>
  .bellrunner-second-job{display:flex;flex-direction:column;min-width:0;flex:1;width:100%}
  .stage-art{position:relative;width:100%;overflow:hidden;background:#221e1b}
  .stage-art img{display:block;width:100%;height:100%;object-fit:contain;pointer-events:none}
  .scene-place{position:absolute;bottom:12px;left:12px;max-width:calc(100% - 24px);
    padding:6px 10px;background:#21180edc;border:1px solid #97724c;color:#ead7b6;
    font:600 12px/1.4 var(--pall-font-label,Georgia,serif);letter-spacing:.035em}
  .work-card{box-sizing:border-box;width:100%;min-width:0;margin:0;
    padding:clamp(20px,2.3vw,37px) clamp(18px,2.2vw,36px);
    border:2px solid #654022;border-radius:5px;background:#efdfbb;color:#251910;
    box-shadow:0 7px 15px #0008}
  .eyebrow{font:600 14px/1.25 var(--pall-font-label,'Arial Narrow',sans-serif);
    letter-spacing:.08em;color:#614029;margin:0 0 16px;padding-bottom:10px;
    border-bottom:1px solid #9e815955}
  h1{margin:0 0 15px;font:600 var(--dialogue-title,21px)/1.3
    var(--pall-font-reading,Georgia,serif);color:#25170f}
  .narration,.spoken{margin:0 0 15px;font:500 var(--dialogue-text,17px)/1.5
    var(--pall-font-reading,Georgia,serif);color:#251910}
  .narration{font-style:italic}
  .speaker{margin:10px 0 6px;font:700 15px/1.2 var(--pall-font-label,'Arial Narrow',sans-serif);
    letter-spacing:.07em;color:#67432a}
  .spoken{font-weight:600}
  .actions{display:flex;flex-direction:column;gap:9px;margin-top:19px}
  .error{color:#873523}.saving{color:#644f36}
  /* Match the original Millhand Stage 3 journal panel. Typography
     (New Standard 16px/600, title 24px/600, Bebas label 14px/700)
     comes from the shared pall-owner-ui.css, not a Bellrunner override. */
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
    border-image-source:url('/ui-kit/buttons/button-hover-trim.png');color:#24170d}
  .journal-toggle:active{border-image-source:url('/ui-kit/buttons/button-pressed-trim.png')}
  .journal-toggle:focus-visible{outline:2px solid #efd092;outline-offset:2px}
  @container activity-panel (max-width:480px){.work-card{padding:18px 15px}}
</style>
