<script lang="ts">
  import {onMount} from 'svelte';
  import {page} from '$app/state';
  import {goto} from '$app/navigation';
  import TutorialShell from '$lib/TutorialShell.svelte';
  import ActivityLayout from '$lib/ActivityLayout.svelte';
  import BellrunnerChoiceIcon from '$lib/BellrunnerChoiceIcon.svelte';
  import {pallAudioSettings} from '$lib/pall-audio';
  import {WRONG_BELL_ENTRY,WATCHMAN_LINES,WRONG_BELL_AFTER_WATCHMAN,
    WRONG_BELL_BRANCHES} from '$lib/bellrunner-stage3-copy';
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
  let proposedBranch=$state<Branch|null>(null);
  let bellAudio=$state<HTMLAudioElement>();
  let bellEnabled=false, bellVolume=0.5;
  const phase=$derived(snapshot?.state.phase??'evidence');
  const available=$derived(snapshot?.availableActions??[]);

  function ring(){
    if(!bellAudio||!bellEnabled||bellVolume===0||document.hidden)return;
    bellAudio.volume=bellVolume;
    bellAudio.currentTime=0;
    void bellAudio.play().catch(()=>{/* Unavailable audio never gates gameplay. */});
  }
  function can(action:Action){return available.includes(action);}
  async function refresh(){
    const res=await fetch('/api/characters/'+encodeURIComponent(id)+'/bellrunner/wrong-bell',{cache:'no-store'});
    if(res.ok)snapshot=await res.json() as Snapshot;
  }
  async function perform(action:Action){
    if(busy||!snapshot||!can(action))return;
    busy=true;errorMessage='';
    if(requestAction!==action){requestAction=action;requestId=crypto.randomUUID();}
    try{
      // The bell is an authored one-shot cue, not a silent autoplay loop.
      if(action==='talk_watchman'||action==='compare_orders')ring();
      const res=await fetch('/api/characters/'+encodeURIComponent(id)+'/bellrunner/wrong-bell',{
        method:'POST',headers:{'content-type':'application/json'},
        body:JSON.stringify({action,requestId,expectedRevision:snapshot.state.revision})
      });
      if(res.ok){
        snapshot=await res.json() as Snapshot;
        requestId=null;requestAction=null;
        if(character&&snapshot)character={...character,
          tutorial:{stage:snapshot.stage,status:snapshot.tutorialStatus}};
        if(action==='read_closure')detail='closure';
        else if(action==='inspect_slip')detail='slip';
        else if(action==='compare_orders')detail='comparison';
        else if(action==='continue_watchman'||action==='talk_watchman')detail=null;
        if(action.startsWith('choose_')){proposedBranch=null;detail=null;}
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
  <TutorialShell {character} sceneLocation="The Closed Industrial Block" compactCityVista travelLocked>
    <section class="workshop wrong-bell" aria-label="Bellrunner Stage 3: The Wrong Bell">
      <ActivityLayout mode="scene" stageAspect={1672/941} class="pall-story-sections">
        {#snippet stage()}
          <div class="scene-visuals pall-story-visuals">
            <div class="courtyard pall-story-landscape">
              <img src="/locations/industrial/industrial-courtyard.webp"
                alt="Empty industrial courtyard. A locked iron gate, noticeboard, outside bell, pipes and a covered cart."
                draggable="false"/>
              {#if phase==='evidence'&&snapshot&&!snapshot.state.closureRead}
                <button class="notice-hotspot" type="button" disabled={busy}
                  aria-label="Read the official closure notice" title="Read the closure notice"
                  onclick={()=>{void perform('read_closure');}}>
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
                    {#if can('read_closure')}
                      <button type="button" class="secondary-choice" disabled={busy}
                        onclick={()=>{void perform('read_closure');}}>
                        <BellrunnerChoiceIcon kind="book"/>Read the closure notice</button>
                    {/if}
                    {#if can('inspect_slip')}
                      <button type="button" class="secondary-choice" disabled={busy}
                        onclick={()=>{void perform('inspect_slip');}}>
                        <BellrunnerChoiceIcon kind="book"/>Check the dispatch slip</button>
                    {/if}
                    {#if can('compare_orders')}
                      <button type="button" class="secondary-choice" disabled={busy}
                        onclick={()=>{void perform('compare_orders');}}>
                        <BellrunnerChoiceIcon kind="mark"/>Compare the orders</button>
                    {/if}
                    {#if can('talk_watchman')}
                      <button type="button" class="primary-choice" disabled={busy}
                        onclick={()=>{void perform('talk_watchman');}}>Speak to the watchman</button>
                    {/if}
                  </div>
                {:else if phase==='watchman'}
                  <h1>The Watchman</h1>
                  {#if snapshot.state.watchmanLine===0}
                    {#each WRONG_BELL_ENTRY as line}<p class="narration">{line}</p>{/each}
                  {/if}
                  {#if WATCHMAN_LINES[snapshot.state.watchmanLine]}
                    <p class="speaker">{WATCHMAN_LINES[snapshot.state.watchmanLine].speaker==='Player'
                      ?character.name:WATCHMAN_LINES[snapshot.state.watchmanLine].speaker}</p>
                    <p class="spoken">“{WATCHMAN_LINES[snapshot.state.watchmanLine].text}”</p>
                  {/if}
                  <div class="actions">
                    <button type="button" class="primary-choice" disabled={busy}
                      onclick={()=>{void perform('continue_watchman');}}>Continue</button>
                  </div>
                {:else if phase==='choice'}
                  <h1>The Wrong Bell</h1>
                  {#each WRONG_BELL_AFTER_WATCHMAN as line}<p class="narration">{line}</p>{/each}
                  <p class="round-finding">The council will not clear the round: the worksite receiving office is shut, and nobody can provide its authorized mark. Payment: 0 coins. Ordinary XP: 0.</p>
                  {#if detail==='comparison'}
                    <p class="narration">The closure and the shift order contradict one another. Neither document authorizes reopening this block.</p>
                  {/if}
                  {#if !proposedBranch}
                    <div class="actions">
                      {#each ['contracts','trauma','machinery'] as key}
                        {@const branchKey=key as Branch}
                        <button type="button" class="secondary-choice" disabled={busy}
                          onclick={()=>{proposedBranch=branchKey;}}>
                          <BellrunnerChoiceIcon kind="route"/>
                          {WRONG_BELL_BRANCHES[branchKey].name}
                        </button>
                      {/each}
                      {#if can('compare_orders')}
                        <button type="button" class="secondary-choice" disabled={busy}
                          onclick={()=>{void perform('compare_orders');}}>
                          <BellrunnerChoiceIcon kind="book"/>Compare the orders</button>
                      {/if}
                    </div>
                  {:else}
                    <h2>{WRONG_BELL_BRANCHES[proposedBranch].name}</h2>
                    <p class="narration">This choice selects your second tutorial job and grants +1 once in its associated Major Skill. You cannot switch routes after confirming.</p>
                    <div class="actions">
                      <button type="button" class="primary-choice" disabled={busy}
                        onclick={()=>{if(proposedBranch)void perform(WRONG_BELL_BRANCHES[proposedBranch].action);}}>
                        Confirm this choice</button>
                      <button type="button" class="secondary-choice" disabled={busy}
                        onclick={()=>{proposedBranch=null;}}>
                        <BellrunnerChoiceIcon kind="back"/>Review the alternatives</button>
                    </div>
                  {/if}
                {:else if phase==='committed'&&snapshot.state.branch}
                  <h1>{WRONG_BELL_BRANCHES[snapshot.state.branch].name}</h1>
                  {#if WRONG_BELL_BRANCHES[snapshot.state.branch].before}
                    <p class="narration">{WRONG_BELL_BRANCHES[snapshot.state.branch].before}</p>
                  {/if}
                  {#each WRONG_BELL_BRANCHES[snapshot.state.branch].lines as line}
                    {#if line.speaker==='Narration'}
                      <p class="narration">{line.text}</p>
                    {:else}
                      <p class="speaker">{line.speaker==='Player'?character.name:line.speaker}</p>
                      <p class="spoken">“{line.text}”</p>
                    {/if}
                  {/each}
                  <p class="narration">{WRONG_BELL_BRANCHES[snapshot.state.branch].end}</p>
                  <p class="round-finding">Next: {WRONG_BELL_BRANCHES[snapshot.state.branch].next}</p>
                  <p class="narration">The chosen Stage 4 task is not yet implemented. Your choice and skill award are saved.</p>
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
  .error{color:#873523;font:13px/1.4 sans-serif}
  .small{color:#624c38;font:12px sans-serif}
  .fallback{padding:38px;color:#e3d0af;background:#25211e}
  @container activity-stage (max-width:600px){
    .notice-hotspot,.bell-hotspot{min-width:44px;min-height:44px}
    .notice-hotspot span,.bell-hotspot span{font-size:10px}
  }
  @container activity-panel (max-width:480px){.work-card{padding:18px 15px}}
</style>
