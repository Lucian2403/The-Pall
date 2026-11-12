<script lang="ts">
  import {dialogueSpeakerLabel} from '$lib/dialogue-speaker';
  import {onMount} from 'svelte';
  import {page} from '$app/state';
  import {goto} from '$app/navigation';
  import TutorialShell from '$lib/TutorialShell.svelte';
  import ActivityLayout from '$lib/ActivityLayout.svelte';
  import BellrunnerChoiceIcon from '$lib/BellrunnerChoiceIcon.svelte';
  import SecondJobChoices from '$lib/SecondJobChoices.svelte';
  import {pallAudioSettings} from '$lib/pall-audio';
  import {WRONG_BELL_ENTRY,WATCHMAN_LINES,WRONG_BELL_AFTER_WATCHMAN,
    WRONG_BELL_BRANCHES,WRONG_BELL_BRANCH_FIRST_BEAT_LINES} from '$lib/bellrunner-stage3-copy';
  import '$lib/pall-story-landscape.css';

  type Branch='contracts'|'trauma'|'machinery';
  type Action='read_closure'|'inspect_slip'|'compare_orders'|'talk_watchman'|
    'continue_watchman'|'choose_contracts'|'choose_trauma'|'choose_machinery';
  type State={revision:number;phase:'evidence'|'watchman'|'choice'|'committed';
    closureRead:boolean;slipRead:boolean;compared:boolean;watchmanLine:number;branch:Branch|null};
  type Snapshot={stage:number;tutorialStatus:string;state:State;availableActions:Action[];
    majorSkillBonuses:Record<string,number>;finalRound:{accepted:false;reason:string};
    tutorialPayout:{coins:number;ordinaryXp:number;items:number}};
  type Character={id:string;name:string;origin:string;sex:string;coins:number;
    health:{current:number;maximum:number};startingLocation:string;
    tutorial:{stage:number;status:string}};
  const id=$derived(page.params.id);
  let character=$state<Character|null>(null);
  let snapshot=$state<Snapshot|null>(null);
  let status=$state<'loading'|'ready'|'login'|'missing'|'schema'|'not-ready'|'error'>('loading');
  let busy=$state(false),errorMessage=$state('');
  let requestId=$state<string|null>(null),requestAction=$state<Action|null>(null);
  let detail=$state<'closure'|'slip'|'comparison'|null>(null);
  // As in Millhand Stage 3, the decision briefing is its own Continue beat.
  // Navigation within the two screens is local; only choosing a job writes
  // progression to the server.
  let decisionStep=$state<0|1>(0);
  let committedBeat=$state(0);
  let bellAudio=$state<HTMLAudioElement>();
  let backdropUnavailable=$state(false);
  let bellEnabled=false, bellVolume=0.5;
  const phase=$derived(snapshot?.state.phase??'evidence');
  const available=$derived(snapshot?.availableActions??[]);
  const secondJobChoices=$derived([
    {id:WRONG_BELL_BRANCHES.contracts.action,
      line:WRONG_BELL_BRANCHES.contracts.choice,
      skill:WRONG_BELL_BRANCHES.contracts.skillLabel,
      disabled:busy||!can('choose_contracts')},
    {id:WRONG_BELL_BRANCHES.trauma.action,
      line:WRONG_BELL_BRANCHES.trauma.choice,
      skill:WRONG_BELL_BRANCHES.trauma.skillLabel,
      disabled:busy||!can('choose_trauma')},
    {id:WRONG_BELL_BRANCHES.machinery.action,
      line:WRONG_BELL_BRANCHES.machinery.choice,
      skill:WRONG_BELL_BRANCHES.machinery.skillLabel,
      disabled:busy||!can('choose_machinery')}
  ]);
  $effect(()=>{
    if(phase!=='choice')decisionStep=0;
  });

  function ring(){
    if(!bellAudio||!bellEnabled||bellVolume===0||document.hidden)return;
    bellAudio.volume=bellVolume;
    bellAudio.currentTime=0;
    void bellAudio.play().catch(()=>{/* Unavailable audio never gates gameplay. */});
  }
  function can(action:Action){return available.includes(action);}
  // Reading a discovered document again never mutates saved progress or
  // request revisions. Only the first inspection goes through the API.
  function inspectDocument(which:'closure'|'slip'){
    if(busy||!snapshot||phase!=='evidence')return;
    if(which==='closure'){
      if(snapshot.state.closureRead){detail='closure';return;}
      void perform('read_closure');
    }else{
      if(snapshot.state.slipRead){detail='slip';return;}
      void perform('inspect_slip');
    }
  }
  function compareDocuments(){
    if(busy||!snapshot||phase!=='evidence'||
      !snapshot.state.closureRead||!snapshot.state.slipRead)return;
    if(snapshot.state.compared){detail='comparison';return;}
    void perform('compare_orders');
  }
  async function refresh(){
    const res=await fetch('/api/characters/'+encodeURIComponent(id)+'/bellrunner/wrong-bell',{cache:'no-store'});
    if(res.ok)snapshot=await res.json() as Snapshot;
  }
  async function perform(action:Action){
    if(busy||!snapshot||!can(action))return;
    busy=true;errorMessage='';
    if(requestAction!==action){requestAction=action;requestId=crypto.randomUUID();}
    try{
      // The bell is an authored one-shot cue, not a looping background.
      // Wait for a successful server transition before playing the cue,
      // so it lines up with the newly displayed conversation/narration.
      const isSecondRing=action==='continue_watchman'&&
        snapshot.state.watchmanLine===WATCHMAN_LINES.length-1;
      const res=await fetch('/api/characters/'+encodeURIComponent(id)+'/bellrunner/wrong-bell',{
        method:'POST',headers:{'content-type':'application/json'},
        body:JSON.stringify({action,requestId,expectedRevision:snapshot.state.revision})
      });
      if(res.ok){
        snapshot=await res.json() as Snapshot;
        if((action==='talk_watchman'&&snapshot.state.phase==='watchman')||
          (isSecondRing&&snapshot.state.phase==='choice'))ring();
        requestId=null;requestAction=null;
        if(character&&snapshot)character={...character,
          tutorial:{stage:snapshot.stage,status:snapshot.tutorialStatus}};
        if(action==='read_closure')detail='closure';
        else if(action==='inspect_slip')detail='slip';
        else if(action==='compare_orders')detail='comparison';
        else if(action==='continue_watchman'||action==='talk_watchman')detail=null;
        if(action.startsWith('choose_')){detail=null;committedBeat=0;decisionStep=0;}
      }else{
        const data=await res.json() as {error?:string};
        if(res.status===409){await refresh();requestId=null;requestAction=null;}
        errorMessage=data.error==='stale_revision'
          ?'Your saved investigation changed in another tab. Review the current scene.'
          :data.error==='bellrunner_migration_required'
            ?'Bellrunner Stage 3 database migration required.'
            :'Could not record this choice: '+(data.error??res.status);
      }
    }catch{
      errorMessage='Connection interrupted. Retry this action; completed work will not be duplicated.';
    }finally{busy=false;}
  }
  onMount(()=>{
    const unsubscribe=pallAudioSettings.subscribe(next=>{
      bellEnabled=next.enabled;
      bellVolume=Math.max(0,Math.min(1,next.sfxVolume));
      if(bellAudio){
        bellAudio.volume=bellEnabled?bellVolume:0;
        if(!bellEnabled||bellVolume===0)bellAudio.pause();
      }
    });
    void(async()=>{
      try{
        const [a,b]=await Promise.all([
          fetch('/api/characters/'+encodeURIComponent(id),{cache:'no-store'}),
          fetch('/api/characters/'+encodeURIComponent(id)+'/bellrunner/wrong-bell',{cache:'no-store'})
        ]);
        if(a.status===401||b.status===401){status='login';return;}
        if(a.status===404||b.status===404){status='missing';return;}
        if(b.status===503){status='schema';return;}
        if(b.status===409){status='not-ready';return;}
        if(!a.ok||!b.ok){status='error';return;}
        character=(await a.json() as {character:Character}).character;
        snapshot=await b.json() as Snapshot;
        if(character.origin!=='Bellrunner'){status='missing';return;}
        status='ready';
      }catch{status='error';}
    })();
    return ()=>{unsubscribe();if(bellAudio){bellAudio.pause();bellAudio.currentTime=0;}};
  });
</script>

<svelte:head><title>The Pall — The Wrong Bell</title></svelte:head>
<audio bind:this={bellAudio} src="/audio/bellrunner/night-shift-bell.mp3" preload="auto"></audio>
{#if status==='ready'&&character&&snapshot}
  <TutorialShell {character} sceneLocation="The Closed Industrial Block"
    compactCityVista travelLocked industrialCourtyardBackdrop>
    <section class="workshop wrong-bell" aria-label="Bellrunner Stage 3: The Wrong Bell">
      <ActivityLayout mode="scene" stageAspect={1672/941} class="pall-story-sections">
        {#snippet stage()}
          <div class="scene-visuals pall-story-visuals">
            <div class="courtyard pall-story-landscape">
              {#if backdropUnavailable}
                <div class="missing-art" role="status">
                  The Industrial Courtyard artwork has not been installed.
                  <small>Expected: /locations/industrial/industrial-courtyard.webp</small>
                </div>
              {/if}
              <img src="/locations/industrial/industrial-courtyard.webp"
                alt="Empty industrial courtyard. A locked iron gate, noticeboard, outside bell, pipes and a covered cart."
                class:asset-hidden={backdropUnavailable}
                onerror={()=>{backdropUnavailable=true;}}
                onload={()=>{backdropUnavailable=false;}}
                draggable="false"/>
              {#if phase==='evidence'&&snapshot}
                <button class="notice-hotspot" type="button" disabled={busy}
                  aria-label={snapshot.state.closureRead?'Review the closure notice':'Read the official closure notice'}
                  title={snapshot.state.closureRead?'Review the closure notice':'Read the closure notice'}
                  onclick={()=>{inspectDocument('closure');}}>
                  <span>Closure notice</span>
                </button>
              {/if}
              <button class="bell-hotspot" type="button" aria-label="Hear the night-shift bell"
                title="Hear the night-shift bell" onclick={ring}>
                <span>Shift bell</span>
              </button>
            </div>
          </div>
        {/snippet}
        {#snippet panel()}
          {#if snapshot}
            <section class="pall-story-dialogue-section" aria-label="Wrong Bell interaction">
              <div class="work-card">
                <p class="eyebrow">THE WRONG BELL · STAGE III</p>
                {#if phase==='evidence'}
                  <h1>The closed worksite</h1>
                  {#each WRONG_BELL_ENTRY as line}<p class="narration">{line}</p>{/each}
                  {#if detail==='closure'}
                    <h2>Closure notice</h2>
                    <p class="narration">The industrial block is officially closed to work after an incident involving dangerous fumes. The municipal seal and closure reason are visible.</p>
                  {:else if detail==='slip'}
                    <h2>Dispatch slip</h2>
                    <p class="narration">The still-sealed council order is routed to this block. Its outside slip calls in the night shift and requires an authorized receiving mark.</p>
                  {:else if detail==='comparison'}
                    <h2>Contradictory instructions</h2>
                    <p class="narration">Closed for fumes. Night shift called in anyway.</p>
                  {/if}
                  <div class="actions">
                    <button type="button" class="secondary-choice" disabled={busy}
                    onclick={()=>{inspectDocument('closure');}}>
                    <BellrunnerChoiceIcon kind="book"/>
                    {snapshot.state.closureRead?'Review the closure notice':'Read the closure notice'}
                  </button>
                  <button type="button" class="secondary-choice" disabled={busy}
                    onclick={()=>{inspectDocument('slip');}}>
                    <BellrunnerChoiceIcon kind="book"/>
                    {snapshot.state.slipRead?'Review the dispatch slip':'Check the dispatch slip'}
                  </button>
                  {#if snapshot.state.closureRead&&snapshot.state.slipRead}
                    <button type="button" class="secondary-choice" disabled={busy}
                      onclick={compareDocuments}>
                      <BellrunnerChoiceIcon kind="mark"/>
                      {snapshot.state.compared?'Review the comparison':'Compare the orders'}
                    </button>
                  {/if}
                    {#if can('talk_watchman')}
                      <button type="button" class="primary-choice" disabled={busy}
                        onclick={()=>{void perform('talk_watchman');}}>Speak to the watchman</button>
                    {/if}
                  </div>
                {:else if phase==='watchman'}
                  <h1>The Watchman</h1>
                  {#if WATCHMAN_LINES[snapshot.state.watchmanLine]}
                    <p class="speaker">{dialogueSpeakerLabel(WATCHMAN_LINES[snapshot.state.watchmanLine].speaker)}</p>
                    <p class="spoken">“{WATCHMAN_LINES[snapshot.state.watchmanLine].text}”</p>
                  {/if}
                  <div class="actions">
                    <button type="button" class="primary-choice continue-choice" disabled={busy}
                      onclick={()=>{void perform('continue_watchman');}}>Continue</button>
                  </div>
                {:else if phase==='choice'}
                  {#if decisionStep===0}
                    <h1>The Wrong Bell</h1>
                    {#each WRONG_BELL_AFTER_WATCHMAN as line}
                      <p class="narration">{line}</p>
                    {/each}
                    <div class="actions">
                      <button type="button" class="primary-choice continue-choice"
                        onclick={()=>{decisionStep=1;}}>Continue</button>
                    </div>
                  {:else}
                    <p class="decision-heading">Choose what you will do next.</p>
                    <SecondJobChoices choices={secondJobChoices}
                      onChoose={(chosen)=>{void perform(chosen as Action);}}/>
                  {/if}
                {:else if phase==='committed'&&snapshot.state.branch}
                  {@const branch=WRONG_BELL_BRANCHES[snapshot.state.branch]}
                  {@const splitAt=WRONG_BELL_BRANCH_FIRST_BEAT_LINES[snapshot.state.branch]}
                  <h1>{branch.name}</h1>
                  <div class="route-dialogue-beat" aria-live="polite">
                    {#if committedBeat<2}
                      {#each (committedBeat===0 ? branch.lines.slice(0,splitAt) : branch.lines.slice(splitAt)) as line}
                        {#if line.speaker==='Narration'}
                          <p class="narration">{line.text}</p>
                        {:else}
                          <p class="speaker">{dialogueSpeakerLabel(line.speaker)}</p>
                          <p class="spoken">“{line.text}”</p>
                        {/if}
                      {/each}
                      {#if committedBeat===1}
                        <p class="narration">{branch.end}</p>
                      {/if}
                      <div class="actions">
                        <button type="button" class="primary-choice continue-choice"
                          onclick={()=>{committedBeat+=1;}}>Continue</button>
                      </div>
                    {:else}
                      <p class="round-finding">Shift Dispatch: round not accepted. The receiving office is closed; its authorized final mark is unavailable. Payment: 0 coins. Ordinary XP: 0. No items.</p>
                      <p class="round-finding">Major Skill increased: <strong>{branch.majorSkill} +1</strong>.</p>
                      <p class="round-finding">Next: {branch.next}</p>
                      <p class="narration">The chosen Stage 4 task is not yet implemented. Your choice and skill award are saved.</p>
                    {/if}
                  </div>
                {/if}
                {#if errorMessage}<p class="error" role="alert">{errorMessage}</p>{/if}
                {#if busy}<p class="small" role="status">Recording…</p>{/if}
              </div>
            </section>
          {/if}
        {/snippet}
      </ActivityLayout>
    </section>
  </TutorialShell>
{:else}
  <main class="fallback" role="status">
    {#if status==='loading'}<h1>Checking the final delivery…</h1>
    {:else if status==='login'}<h1>Sign in required</h1><a href="/account">Account access</a>
    {:else if status==='missing'}<h1>Character not found</h1>
    {:else if status==='schema'}<h1>Stage 3 schema missing</h1><p>Run npm run bellrunner:migrate.</p>
    {:else if status==='not-ready'}<h1>Stage 3 not ready</h1><p>Take the final sealed notice from the Dispatch House first.</p>
    {:else}<h1>Wrong Bell unavailable</h1>{/if}
    <a href="/characters">Character selection</a>
  </main>
{/if}
<style>
  .wrong-bell{display:flex;flex-direction:column;flex:1;min-width:0;width:100%;color:#f3e3ce}
  .courtyard{position:relative;width:100%;aspect-ratio:1672/941;overflow:hidden;background:#221e1b}
  .courtyard img{display:block;width:100%;height:100%;object-fit:contain;pointer-events:none}
  .courtyard img.asset-hidden{display:none}
  .missing-art{position:absolute;inset:0;display:flex;flex-direction:column;
    align-items:center;justify-content:center;text-align:center;padding:20px;
    gap:9px;color:#d8b783;background:#1e1a17;
    font:600 16px/1.45 var(--pall-font-reading,Georgia,serif)}
  .missing-art small{font:12px/1.4 monospace;opacity:.83;overflow-wrap:anywhere}
  .notice-hotspot,.bell-hotspot{position:absolute;z-index:3;border:0;
    background:transparent;color:#f4dfba;cursor:pointer;display:flex;align-items:end;justify-content:center}
  .notice-hotspot{top:39%;left:24%;width:12%;height:21%}
  .bell-hotspot{top:8%;left:74%;width:11%;height:26%}
  .notice-hotspot span,.bell-hotspot span{padding:4px 7px;background:#251b12d9;
    border:1px solid #8f6944;font:600 12px/1.25 var(--pall-font-reading,Georgia,serif)}
  .notice-hotspot:focus-visible,.bell-hotspot:focus-visible{outline:3px solid #f4c37b;outline-offset:1px}
  .notice-hotspot:disabled{cursor:wait;opacity:.55}
  .work-card{box-sizing:border-box;width:100%;min-width:0;margin:0;
    padding:clamp(20px,2.3vw,37px) clamp(18px,2.2vw,36px);
    border:2px solid #654022;border-radius:5px;background:#efdfbb;color:#251910;
    box-shadow:0 7px 15px #0008}
  .eyebrow{font:600 14px/1.25 var(--pall-font-label,'Arial Narrow',sans-serif);
    letter-spacing:.1em;color:#614029;margin:0 0 16px;padding-bottom:10px;border-bottom:1px solid #9e815955}
  h1,h2{margin:0 0 13px;font:600 var(--dialogue-title,21px)/1.3
    var(--pall-font-reading,Georgia,serif);color:#25170f}
  h2{margin-top:17px}
  .narration,.spoken,.round-finding{margin:0 0 14px;font:600 var(--dialogue-text,17px)/1.55
    var(--pall-font-reading,Georgia,serif);color:#251910}
  .narration{font-style:italic;font-weight:500}
  .speaker{margin:10px 0 6px;font:600 var(--dialogue-label,15px)/1.2
    var(--pall-font-label,'Arial Narrow',sans-serif);color:#67432a;letter-spacing:.08em}
  .round-finding{padding:13px;border-top:1px solid #b79c78;border-bottom:1px solid #b79c78}
  .actions{display:flex;flex-direction:column;gap:9px;margin-top:19px}
  .actions>button{width:100%;min-height:52px;border:1px solid #6d5235;
    background:#241d16;color:#f7e6c9;text-align:left;padding:10px 13px;cursor:pointer;
    font:600 var(--dialogue-text,17px)/1.3 var(--pall-font-reading,Georgia,serif)}
  .actions>button:disabled{opacity:.55;cursor:wait}
  /* Continue always remains white on the dark primary action at hover/focus. */
  .actions>button.continue-choice:hover:not(:disabled),
  .actions>button.continue-choice:focus-visible{color:#fff!important}
  .route-dialogue-beat{min-width:0}
  .decision-heading{
    margin:0 0 10px;
    color:#24170f;
    font:700 var(--dialogue-text,17px)/1.4
      var(--pall-font-reading,Georgia,serif);
  }
  .error{color:#873523;font:13px/1.4 sans-serif}
  .small{color:#624c38;font:12px sans-serif}
  .fallback{padding:38px;color:#e3d0af;background:#25211e}
  @container activity-stage (max-width:600px){
    .notice-hotspot,.bell-hotspot{min-width:44px;min-height:44px}
    .notice-hotspot span,.bell-hotspot span{font-size:10px}
  }
  @container activity-panel (max-width:480px){.work-card{padding:18px 15px}}
</style>
