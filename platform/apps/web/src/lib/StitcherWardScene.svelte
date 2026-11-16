<script lang="ts">
  import {getContext,tick} from 'svelte';
  import ActivityLayout from '$lib/ActivityLayout.svelte';
  import SecondJobChoices from '$lib/SecondJobChoices.svelte';
  import {dialogueSpeakerLabel} from '$lib/dialogue-speaker';
  import {SCENE_JOURNAL_CONTEXT,type SceneJournalRegistrar} from '$lib/scene-journal';
  import {STITCHER_ACTION_LABEL,STITCHER_ROUTE_UI,STITCHER_STAGE_TITLES} from '$lib/stitcher-ward-copy';
  import '$lib/pall-story-landscape.css';
  type Branch='trolley'|'consent'|'notes';
  type Phase='intro'|'briefing'|'inspect'|'order'|'prepare'|'care'|'linen_check'|
    'linen_fix'|'verify'|'record'|'report'|'close'|'discovery'|'claudia'|'choose'|
    'opening'|'work'|'dialogue'|'finish'|'exited';
  type State={
    revision:number;stage:1|2|3|4|5;phase:Phase;introLine:number;
    inspectedA:boolean;inspectedB:boolean;first:'a'|'b'|null;
    prepared:'cut'|'ready'|null;treatedA:boolean;treatedB:boolean;
    correction:'discard'|'trim'|null;reportLine:number;
    bedObserved:boolean;chartRead:boolean;patientHeard:boolean;
    patientLine:number;focus:'bed'|'chart'|'patient'|null;
    claudiaLine:number;branch:Branch|null;taskStep:number;
    routeMethod:string|null;openingLine:number;dialogueLine:number
  };
  type Snapshot={stage:number;tutorialStatus:string;state:State;
    started:boolean;availableActions:string[]};
  let {snapshot,pending,errorMessage,perform}:{
    snapshot:Snapshot;pending:boolean;errorMessage:string;
    perform:(action:string)=>Promise<void>;
  }=$props();
  const s=$derived(snapshot.state);
  const allowed=$derived(snapshot.availableActions);
  const branchData=$derived(s.branch?STITCHER_ROUTE_UI[s.branch]:null);
  const branchDialogues={
    trolley:[
      {speaker:'RECEIVER',text:'Contract number?'},
      {speaker:'YOU',text:"There's a man on this trolley. Haven't you got his name?"},
      {speaker:'RECEIVER',text:'I need the number.'},
      {speaker:'YOU',text:"I'm not signing him over."},
      {speaker:'RECEIVER',text:'Then take him back to the ward.'}
    ],
    consent:[
      {speaker:'CLERK',text:"His thumbprint's right here."},
      {speaker:'YOU',text:'He says they took it while he was asleep.'},
      {speaker:'CLERK',text:"Then we'd better check the medicine book."},
      {speaker:'YOU',text:'They gave him the draught before they took his print.'},
      {speaker:'CLERK',text:"I'll mark the transfer disputed."},
      {speaker:'CLAUDIA',text:"You couldn't come to me first?"},
      {speaker:'YOU',text:'Would you have changed anything?'},
      {speaker:'CLAUDIA',text:"Now the school won't pay until this is settled."}
    ],
    notes:[
      {speaker:'COPYIST',text:'What do you need?'},
      {speaker:'YOU',text:'His treatment notes. And the teaching list for tomorrow.'},
      {speaker:'YOU',text:"I can't find anything saying he needs another operation."},
      {speaker:'COPYIST',text:"He's down for a demonstration."},
      {speaker:'YOU',text:"So it's not to treat his wound?"},
      {speaker:'COPYIST',text:'Not according to these notes.'}
    ]
  } as const;
  const claudiaLines=[
    {speaker:'YOU',text:"What's this demonstration? He says he never agreed to it."},
    {speaker:'CLAUDIA',text:"The school's paying us. He got his treatment."},
    {speaker:'YOU',text:'So now they get to operate on him for a lesson?'},
    {speaker:'CLAUDIA',text:"Who's paying for the fever ward's coal if I turn them away? You?"},
    {speaker:'YOU',text:"He's strapped to the bed, Claudia."},
    {speaker:'CLAUDIA',text:"And I've got a ward full of patients waiting. Get on with your work."}
  ] as const;
  const currentLine=$derived(s.phase==='claudia'?claudiaLines[s.claudiaLine]:
    s.phase==='dialogue'&&s.branch?branchDialogues[s.branch][s.dialogueLine]:null);
  const journal=$derived.by(()=>{
    const entries:string[]=['I arrived at Cinder Row Infirmary. Claudia Cyka sent me to two charity beds for dressing changes.'];
    if(s.stage>=2)entries.push('The round was unpaid. One bed had a shallow cut; the other had a dirty dressing. I was told to inspect before treating either.');
    if(s.first)entries.push(s.first==='a'?'I went to the bleeding cut first.':'I checked the dirty dressing first.');
    if(s.prepared)entries.push(s.prepared==='cut'?'I cut the clean dressings to fit.':'I used the ready-cut clean dressings.');
    if(s.correction)entries.push(s.correction==='trim'
      ?'The linen brushed a dirty bed rail. I trimmed off the touched end and recorded the offcut.'
      :'The linen brushed a dirty bed rail. I discarded that piece and took fresh linen.');
    if(s.stage>=3){
      entries.push('After my round, I found an adult patient awake on a narrow bed with restraints and surgical guide marks.');
      if(s.chartRead)entries.push('His chart said: CHARITY ACCOUNT SETTLED — TEACHING DEMONSTRATION, DAWN.');
      if(s.patientHeard)entries.push('He told me they took his thumbprint while he slept. I cannot yet confirm the entry.');
      if(s.phase==='choose'||s.stage>=4)entries.push("Claudia says the school pays for the fever ward's coal. She would not stop the demonstration on his word.");
    }
    if(s.branch)entries.push(s.branch==='trolley'
      ?'I chose to follow the transfer and find the receiving point.'
      :s.branch==='consent'
        ?'I chose to contest the consent paper and the authority to move him.'
        :"I chose to examine the surgeon's notes.");
    if(s.stage===5&&branchData)entries.push(branchData.finding);
    return entries;
  });
  let journalOpen=$state(false);
  let journalEl:HTMLElement|undefined;
  const register=getContext<SceneJournalRegistrar|undefined>(SCENE_JOURNAL_CONTEXT);
  async function toggleJournal(){
    journalOpen=!journalOpen;
    if(journalOpen){await tick();journalEl?.scrollIntoView({block:'start',behavior:'smooth'});}
  }
  $effect(()=>{
    register?.({id:'stitcher-ward-journal',open:journalOpen,toggle:()=>{void toggleJournal();}});
    return ()=>register?.(null);
  });
  function act(action:string){
    if(!pending&&allowed.includes(action))void perform(action);
  }
  const choices=$derived([
    {id:'choose_trolley',line:"I'll go with the trolley. I want to see where they take him.",skill:'Industry / Hauling',disabled:pending},
    {id:'choose_consent',line:'Then show me his consent paper.',skill:'Commerce / Contracts',disabled:pending},
    {id:'choose_notes',line:"Let me see the surgeon's notes.",skill:'Scholarship / Investigation',disabled:pending}
  ]);
  const interactiveBeds=$derived(s.stage===2&&(s.phase==='inspect'||s.phase==='care')||s.stage===3&&s.phase==='discovery'&&!s.bedObserved);
  let claudiaArtMissing=$state(false);
</script>

<section class="workshop stitcher-ward" aria-label={'Stitcher Stage '+s.stage+' — '+STITCHER_STAGE_TITLES[s.stage]}>
  <ActivityLayout mode="scene" stageAspect={1672/941} class="pall-story-sections">
    {#snippet stage()}
      <div class="scene-visuals pall-story-visuals">
        <div class="ward-art pall-story-landscape">
          <img class="infirmary" src="/locations/clinic/clinic-workshop-cold.webp"
            alt="A working-class infirmary ward. Two cots stand beside curtains, with clean linen and medicine cupboards nearby."
            draggable="false"/>
          {#if s.stage===1&&!claudiaArtMissing&&snapshot.started}
            <!-- Asset path is fixed to the supplied transparent Claudia sprite.
                 The ward still renders when new owner art has not been installed. -->
            <img class="claudia" src="/locations/stitcher/claudia-front.webp"
              alt="Claudia Cyka, the Matron" draggable="false"
              onerror={()=>claudiaArtMissing=true}/>
          {/if}
          {#if interactiveBeds}
            {#if s.stage===2}
              <button class="bed-hotspot bed-a" type="button"
                class:completed={s.inspectedA||s.treatedA}
                disabled={pending||!(allowed.includes('inspect_a')||allowed.includes('dress_a'))}
                onclick={()=>act(allowed.includes('dress_a')?'dress_a':'inspect_a')}
                aria-label={s.phase==='care'?'Clean and dress Bed A':'Inspect Bed A, shallow bleeding cut'}
                title={s.phase==='care'?'Clean and dress Bed A':'Inspect the bleeding cut at Bed A'}>
                <span class="bed-marker"><span class="bed-poi" aria-hidden="true"></span><span class="bed-label">Bed A</span></span>
              </button>
              <button class="bed-hotspot bed-b" type="button"
                class:completed={s.inspectedB||s.treatedB}
                disabled={pending||!(allowed.includes('inspect_b')||allowed.includes('dress_b'))}
                onclick={()=>act(allowed.includes('dress_b')?'dress_b':'inspect_b')}
                aria-label={s.phase==='care'?'Clean and dress Bed B':'Inspect Bed B, dirty outer dressing'}
                title={s.phase==='care'?'Clean and dress Bed B':'Inspect the dirty dressing at Bed B'}>
                <span class="bed-marker"><span class="bed-poi" aria-hidden="true"></span><span class="bed-label">Bed B</span></span>
              </button>
            {:else if s.stage===3}
              <button class="bed-hotspot teaching-bed" type="button"
                disabled={pending} onclick={()=>act('observe_bed')}
                aria-label="Examine the Teaching Bed and its adult patient" title="Look at the Teaching Bed">
                <span class="bed-marker"><span class="bed-poi" aria-hidden="true"></span><span class="bed-label">Teaching Bed</span></span>
              </button>
            {/if}
          {/if}
          <span class="scene-place">Cinder Row Infirmary</span>
        </div>
      </div>
    {/snippet}
    {#snippet panel()}
      <section class="pall-story-dialogue-section" aria-label="Stitcher ward interaction">
        <div class="work-card">
          <p class="eyebrow">{s.stage===4?'SECOND JOB':'STITCHER'} · STAGE {['','I','II','III','IV','V'][s.stage]}{#if branchData} · {branchData.discipline}{/if}</p>
          <h1>{s.stage===5?STITCHER_STAGE_TITLES[5]:branchData?.title??STITCHER_STAGE_TITLES[s.stage]}</h1>
          {#if !snapshot.started}
            <p class="narration">The infirmary is packed, with every bed taken. Steam rises from a basin of hot water, and smoke drifts from the coal stove. Claudia Cyka is going over the morning's work.</p>
          {:else if s.stage===1}
            {#if s.phase==='intro'}
              {#if s.introLine===0}
                <p class="narration">A linen clerk questions Claudia's clean dressings. She gives him a warm smile and asks him to check his count. He turns back to his book. Her smile is gone before he reaches the doorway.</p>
                <p class="speaker">CLAUDIA</p>
                <p class="spoken">“Those two by the door need fresh dressings. Get on with it.”</p>
              {:else if s.introLine===1}
                <p class="speaker">{dialogueSpeakerLabel('YOU')}</p>
                <p class="spoken">“There's hardly any clean linen left.”</p>
              {:else if s.introLine===2}
                <p class="speaker">CLAUDIA</p>
                <p class="spoken">“I know. Use what they need. No more.”</p>
              {:else}
                <p class="speaker">CLAUDIA</p>
                <p class="spoken">“Look at the wounds first. If either one's worse than expected, come and get me. Don't guess.”</p>
              {/if}
            {:else}
              <p class="narration">Two patients lie in the beds near the door, waiting for their bandages to be changed. Claudia has left you clean water and linen to work with. She'll be keeping an eye on you, though you won't be paid for the round.</p>
              <p class="instruction">Before you begin, you need to check both wounds. If anything looks serious, you'll have to call Claudia over.</p>
            {/if}
          {:else if s.stage===2}
            {#if s.phase==='inspect'}
              <p class="narration">Two beds near the ward entrance need fresh dressings. Select each bed in the illustration to inspect it.</p>
              {#if s.inspectedA}<p class="finding"><strong>Bed A.</strong> A shallow cut has slight fresh seepage beneath the old dressing.</p>{/if}
              {#if s.inspectedB}<p class="finding"><strong>Bed B.</strong> A small scrape is covered by a dry, dirty outer dressing.</p>{/if}
            {:else if s.phase==='order'}
              <p class="narration">Both beds need attention. Who do you see first?</p>
            {:else if s.phase==='prepare'}
              <p class="narration">You check the clean water and linen. There's enough for both patients, but not much left to spare. You can cut the dressings to fit each wound, or use the ones already prepared.  </p>
            {:else if s.phase==='care'}
              <p class="narration">{!s.treatedA&&!s.treatedB
                ?'Inspect, clean and dress the first bed. Select the appropriate bed in the illustration.'
                :'The affected clean linen has been dealt with safely. Finish dressing the remaining patient.'}</p>
              <p class="instruction">Only clean material is applied; the other patient will also receive care.</p>
            {:else if s.phase==='linen_check'}
              <p class="narration">The loose end of the clean dressing brushes the dirty bed rail.</p>
              <p class="instruction">This unused portion cannot touch a wound.</p>
            {:else if s.phase==='linen_fix'}
              <p class="narration">The part of the dressing that touched the rail is visible. The unaffected linen is long enough to cover the wound if trimmed cleanly.</p>
            {:else if s.phase==='verify'}
              <p class="narration">Both patients have been dressed with clean material. Check the fit and cleanliness before you record the work.</p>
            {:else if s.phase==='record'}
              <p class="narration">Record which beds received care and the linen used, including {s.correction==='trim'?'the trimmed offcut':'the discarded piece'}.</p>
            {:else if s.phase==='report'}
              {#if s.reportLine===0}
                <p class="narration">Claudia checks the linen count before she looks at you.</p>
                <p class="speaker">CLAUDIA</p><p class="spoken">“Both finished?”</p>
              {:else if s.reportLine===1}
                <p class="speaker">{dialogueSpeakerLabel('YOU')}</p>
                <p class="spoken">“{s.correction==='trim'
                  ?'Yes. I cut off the end that touched the rail.'
                  :'Yes. Some clean linen touched the bed rail. I threw it out and got fresh.'}”</p>
              {:else}
                <p class="speaker">CLAUDIA</p>
                <p class="spoken">“{s.correction==='trim'
                  ?'Put the offcut on the sheet. I want the count right.'
                  :"Write it down, then. They'll ask me where the linen went."}”</p>
              {/if}
            {:else}
              <p class="narration">The charity-bed dressings are secure, the material accounted for, and Claudia has the written round record.</p>
            {/if}
          {:else if s.stage===3}
            {#if s.phase==='discovery'}
              {#if !s.bedObserved}
                <p class="narration">Claudia enters a side ward to shut it for the day. One narrow bed has a man awake on it. Select the marked bed in the illustration.</p>
              {:else if s.focus==='bed'}
                <p class="narration">The adult patient lies awake. Straps cross his wrists, and straight blue surgical marks run near an old wound. He watches the doorway.</p>
              {:else if s.focus==='chart'}
                <p class="narration">The bedside chart does not list another treatment needed for the wound. Its transfer entry reads:</p>
                <p class="finding"><strong>CHARITY ACCOUNT SETTLED — TEACHING DEMONSTRATION, DAWN.</strong></p>
              {:else if s.focus==='patient'}
                {#if s.patientLine===0}
                  <p class="speaker">PATIENT</p><p class="spoken">“I was asleep when they took my thumbprint.”</p>
                {:else if s.patientLine===1}
                  <p class="speaker">{dialogueSpeakerLabel('YOU')}</p><p class="spoken">“You never agreed to an operation?”</p>
                {:else}
                  <p class="speaker">PATIENT</p><p class="spoken">“No. They said they'd look after my wound.”</p>
                {/if}
              {/if}
            {:else if s.phase==='claudia'&&currentLine}
              {#if s.claudiaLine===0}
                <p class="narration">Claudia closes the casebook on the end table. She looks at the chart, not the man.</p>
              {/if}
              <p class="speaker">{dialogueSpeakerLabel(currentLine.speaker)}</p>
              <p class="spoken">“{currentLine.text}”</p>
            {:else if s.phase==='choose'}
              <p class="speaker">CLAUDIA</p>
              <p class="spoken">“Do what you like. Stay out of my way.”</p>
              <p class="narration">The patient is alive. The transfer is pending. Choose how you will act.</p>
            {/if}
          {:else if s.stage===4&&branchData}
            {#if s.phase==='opening'}
              <p class="narration">{branchData.opening[s.openingLine]}</p>
            {:else if s.phase==='work'}
              <p class="narration">{branchData.steps[Math.min(s.taskStep,3)]}</p>
            {:else if s.phase==='dialogue'&&currentLine}
              <p class="speaker">{dialogueSpeakerLabel(currentLine.speaker)}</p>
              <p class="spoken">“{currentLine.text}”</p>
            {:else}
              <p class="narration">{branchData.finding}</p>
              <p class="narration">The patient has not been signed over. The work remains unpaid and the local matter is not yet resolved.</p>
            {/if}
          {:else if s.stage===5}
            <p class="narration">You return toward the infirmary's service corridor. The patient's transfer is still pending, and the ward's ordinary noise carries on behind you.</p>
          {/if}
          {#if s.stage===3&&s.phase==='choose'}
            <SecondJobChoices {choices} onChoose={act}/>
          {:else if s.stage!==5&&allowed.length}
            <div class="actions" aria-label="Available actions">
              {#each allowed as action (action)}
                {#if !((s.stage===2&&s.phase==='inspect'&&(action==='inspect_a'||action==='inspect_b'))||(s.stage===3&&action==='observe_bed'))}
                  <button class={action==='start'||action==='begin_round'||action==='check_ward'||
                    action==='close_round'||action==='finish_job'||action==='confront_claudia'||
                    action==='continue_intro'||action==='continue_claudia'||action==='continue_opening'||
                    action==='continue_dialogue'||action==='continue_report'||action==='continue_patient'
                      ?'primary-choice':'secondary-choice'} type="button" disabled={pending}
                    onclick={()=>act(action)}>{STITCHER_ACTION_LABEL[action]??action}</button>
                {/if}
              {/each}
            </div>
          {/if}
          {#if errorMessage}<p class="error" role="alert">{errorMessage}</p>{/if}
          {#if pending}<p role="status" class="saving">Recording the work…</p>{/if}
        </div>
      </section>
    {/snippet}
  </ActivityLayout>
  {#if journalOpen}
    <section id="stitcher-ward-journal" class="journal-panel" bind:this={journalEl}
      aria-label="Personal journal — Cinder Row Infirmary">
      <header class="journal-heading">
        <div><span class="journal-kicker">PERSONAL JOURNAL</span>
          <h2>{STITCHER_STAGE_TITLES[s.stage]}</h2></div>
        <button type="button" class="journal-toggle" data-pall-sfx="paper"
          onclick={()=>{void toggleJournal();}}>Close journal</button>
      </header>
      <div class="journal-entries">{#each journal as entry,i (i)}<p>{entry}</p>{/each}</div>
    </section>
  {/if}
</section>

<style>
  .stitcher-ward{display:flex;flex-direction:column;min-width:0;width:100%;flex:1}
  .ward-art{position:relative;width:100%;background:#171a20}
  .infirmary{display:block;width:100%;height:100%;object-fit:contain;pointer-events:none}
  .claudia{position:absolute;bottom:0;left:6%;height:83%;max-width:40%;
    object-fit:contain;object-position:bottom;filter:drop-shadow(6px 7px 10px #0b090caa);
    pointer-events:none}
  .scene-place{position:absolute;bottom:12px;left:12px;
    padding:5px 9px;background:#1d1511df;border:1px solid #97724c;color:#eddbbc;
    font:600 12px/1.4 var(--pall-font-label,Georgia,serif)}
  /* Keep full-size, percentage-anchored bed hit targets. Only the POI + label
     are painted; the old dashed rectangles must never appear, even on focus. */
  .bed-hotspot{position:absolute;display:flex;align-items:flex-end;justify-content:center;
    padding:0;border:0;border-radius:0;background:transparent;
    color:#fff2cd;cursor:pointer;outline:none;box-shadow:none}
  .bed-marker{position:absolute;left:50%;bottom:-13px;transform:translateX(-50%);
    display:inline-flex;align-items:center;justify-content:center;gap:6px;
    white-space:nowrap;pointer-events:none}
  .bed-poi{display:block;flex:none;width:8px;height:8px;border-radius:50%;
    background:#e9c480;border:1px solid #39261a;box-shadow:0 0 0 1px #e5bf7980}
  .bed-label{display:block;border:1px solid #957651;padding:2px 8px;
    background:#1b1510ed;font:700 13px/1.3 var(--pall-font-reading,Georgia,serif)}
  .bed-hotspot:is(:hover,:focus-visible):not(:disabled) .bed-poi{
    background:#fff0b7;box-shadow:0 0 0 2px #e9c480}
  .bed-hotspot:is(:hover,:focus-visible):not(:disabled) .bed-label{
    border-color:#ffdb9c;filter:brightness(1.1)}
  .bed-hotspot:focus-visible:not(:disabled) .bed-label{
    outline:2px solid #ffdb9c;outline-offset:2px}
  .bed-hotspot:disabled{opacity:.33;cursor:default;pointer-events:none}
  .bed-a{left:31%;top:42%;width:25%;height:22%}
  .bed-b{left:53%;top:38%;width:14%;height:20%}
  .teaching-bed{left:31%;top:42%;width:25%;height:22%}
  .work-card{box-sizing:border-box;width:100%;min-width:0;margin:0}
  .eyebrow{font:600 14px/1.25 var(--pall-font-label,'Arial Narrow',sans-serif);
    letter-spacing:.08em;color:#614029;margin:0 0 13px;padding-bottom:10px;
    border-bottom:1px solid #9e815955}
  h1{margin:0 0 13px;font:600 var(--dialogue-title,21px)/1.3
    var(--pall-font-reading,Georgia,serif);color:#25170f}
  .narration,.spoken,.finding,.instruction{margin:0 0 14px;
    font:600 var(--dialogue-text,17px)/1.52 var(--pall-font-reading,Georgia,serif);
    color:#261b13}
  .narration{font-style:italic}
  .speaker{margin:8px 0 5px;font:700 15px/1.2 var(--pall-font-label,'Arial Narrow',sans-serif);
    letter-spacing:.07em;color:#69432a}
  .finding{border-left:2px solid #95704a;padding:4px 12px}
  .instruction{font-size:15px;color:#5d412b}
  .actions{display:flex;flex-direction:column;gap:8px;margin-top:16px}
  .error{color:#883522}.saving{color:#654932}
  /* Original owner journal contract; no new palette, font or closing skin. */
  .journal-panel{box-sizing:border-box;width:100%;background:#e8d6b6;color:#24160e;
    border-top:2px solid #9a7147;padding:19px clamp(16px,4vw,46px) 25px;
    scroll-margin-top:56px}
  .journal-heading{display:flex;align-items:center;justify-content:space-between;
    gap:15px;max-width:930px;margin:0 auto 15px}
  .journal-heading h2{margin:6px 0 0}
  .journal-entries{max-width:930px;margin:0 auto}
  .journal-entries p{margin:9px 0}
  .journal-toggle{box-sizing:border-box;min-height:40px;padding:3px 8px;
    border:solid transparent;border-width:10px 17px 9px;
    border-image-source:url('/ui-kit/buttons/button-normal-trim.png');
    border-image-slice:50 180 45 180 fill;border-image-width:10px 17px 9px;
    border-image-repeat:stretch;border-radius:0;background:transparent;color:#2e1d11;cursor:pointer}
  .journal-toggle:is(:hover,:focus-visible){border-image-source:url('/ui-kit/buttons/button-hover-trim.png')}
  .journal-toggle:active{border-image-source:url('/ui-kit/buttons/button-pressed-trim.png')}
  .journal-toggle:focus-visible{outline:2px solid #efd092;outline-offset:2px}
  @container activity-panel (max-width:480px){.work-card{padding:0}}
</style>
