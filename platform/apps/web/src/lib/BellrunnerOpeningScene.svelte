<script lang="ts">
  import {dialogueSpeakerLabel} from '$lib/dialogue-speaker';
  import {onDestroy} from 'svelte';
  import type {StageOneBeat} from '$lib/approved-stage-one';
  import BellrunnerHectorConversation from '$lib/BellrunnerHectorConversation.svelte';
  import BellrunnerDocumentTray from '$lib/BellrunnerDocumentTray.svelte';
  import BellrunnerChoiceIcon from '$lib/BellrunnerChoiceIcon.svelte';
  import ActivityLayout from '$lib/ActivityLayout.svelte';
  import '$lib/workshop-object-labels.css';
  import '$lib/pall-story-landscape.css';

  type PropKey='notices'|'sealed'|'route';
  const papers:Record<PropKey,{label:string;src:string;observation:string}>={
    notices:{
      label:'Council notices',src:'/locations/bellrunner/council-work.webp',
      observation:'A bundle of council shift notices, still waiting to be delivered. It is assigned work, not personal cargo.'
    },
    sealed:{
      label:'Sealed council order',src:'/locations/bellrunner/sealed-order.webp',
      observation:'One council order is tied and sealed. Its contents remain unread; the dispatch has not reached its last address.'
    },
    route:{
      label:'Route sheet',src:'/locations/bellrunner/route-sheet.webp',
      observation:'A courier route sheet with places for receiving marks. The assigned stops and load are checked when the round begins.'
    }
  };
  let {characterName,beat,advance,goBack,canGoBack,takeRound,takingRound=false,handoffError=''}:{
    characterName:string;beat:StageOneBeat;advance:(next:string,fromChoice?:boolean)=>void;
    goBack:()=>void;canGoBack:boolean;takeRound:()=>Promise<void>;
    takingRound?:boolean;handoffError?:string
  }=$props();
  let entered=$state(false);
  let selected=$state<PropKey|null>(null);
  let talking=$state(false);
  let bell:HTMLAudioElement|null=null;
  function begin(){
    if(entered)return;
    entered=true;
    // Browser autoplay rules: the first explicit entry click owns this cue.
    // The ordinary duty bell plays once, not on every dialogue response.
    bell=new Audio('/audio/bellrunner/duty-bell.mp3');
    bell.volume=.65;
    void bell.play().catch(()=>{/* Audio may be disabled by the browser */});
  }
  onDestroy(()=>{
    if(bell){bell.pause();bell.currentTime=0;bell=null;}
  });
  function inspect(item:PropKey){
    selected=selected===item?null:item;
  }
  // The Route Sheet is the Stage 1 handoff object, not another
  // decorative inspection. The existing owner-checked take_round API
  // commits Stage 2 once; every other paper retains inspection only.
  function usePaper(item:PropKey){
    if(item==='route'&&beat.kind==='handoff'){
      if(!takingRound)void takeRound();
      return;
    }
    inspect(item);
  }
  function askHector(){
    selected=null;
    if(!entered)begin();
    talking=true;
    // Hector remains on the left; the conversation appears immediately
    // to his right in the independent dialogue panel.
  }
  function returnToRound(){talking=false;}
  function next(nextId:string,fromChoice=false){
    selected=null;
    advance(nextId,fromChoice);
  }
  const say=$derived(beat.text.replaceAll('[player name]',characterName));
</script>

<section class="workshop bellrunner" aria-label="Bellrunner Stage 1 — Dispatch House">
  <ActivityLayout mode="scene" class="dispatch-scene pall-story-sections" stageAspect={1672/941}>
    {#snippet stage()}
    <section class="scene-visuals pall-story-visuals" aria-label="Dispatch House with Hector D. Smoke">
      <div class="scene-illustration pall-story-landscape"
        aria-label="Dispatch House with Hector D. Smoke">
    <img class="depot" src="/locations/origins/bellrunner-depot.webp"
      alt="Grand Cylinder City Dispatch House, a working industrial courier depot" draggable="false"/>
    <div class="scene-shade" aria-hidden="true"></div>
    <img class="hector" src="/characters/hector/hector-d-smoke.webp"
      alt="Hector D. Smoke, the Dispatch Master with a pipe and work clipboard" draggable="false"/>
    <!-- Only the lowest edge of the wooden counter covers Hector's boots.
         The former 70% foreground mask hid half his body in mid-air. -->
    <img class="depot depot-foreground" src="/locations/origins/bellrunner-depot.webp"
      alt="" aria-hidden="true" draggable="false"/>
    <button type="button" class="npc-hotspot" title="Talk to Hector D. Smoke"
      aria-label="Talk to Hector D. Smoke"
      onclick={askHector}>
      <span class="workshop-npc-label">Hector D. Smoke</span>
    </button>
      </div>
    </section>
    {/snippet}
    {#snippet supplement()}
      <BellrunnerDocumentTray {papers} onChoose={usePaper} {selected}
        routeReady={beat.kind==='handoff'} busy={takingRound}/>
    {/snippet}

    {#snippet panel()}
    <section class="dialogue-section pall-story-dialogue-section"
      aria-label="Dispatch House dialogue">
    <aside class="work-card dispatch-dialogue" aria-label="Dispatch House conversation and paper inspection">
      <div class="dialogue-body">
      {#if selected}
        <p class="eyebrow">DISPATCH HOUSE · PAPER INSPECTION</p>
        <h2>{papers[selected].label}</h2>
        <p class="work-description">{papers[selected].observation}</p>
        <div class="responses">
          <button type="button" class="secondary-choice" onclick={()=>{selected=null;}}>
            <BellrunnerChoiceIcon kind="back"/>Return to the dialogue
          </button>
        </div>
      {:else if talking}
        <BellrunnerHectorConversation {returnToRound}/>
      {:else if !entered}
        <p class="eyebrow">DISPATCH HOUSE · STAGE I</p>
        <h2>Hector D. Smoke</h2>
        <p class="speech">Dispatch Master</p>
        <div class="responses">
          <button type="button" class="primary-choice" onclick={begin}>Begin the round</button>
          <button type="button" class="secondary-choice" onclick={askHector}>
            <BellrunnerChoiceIcon kind="chat"/>Ask Hector something
          </button>
        </div>
      {:else}
        {#if beat.kind==='narration'}
          <p class="eyebrow">DISPATCH HOUSE</p>
          <p class="narration">{say}</p>
        {:else if beat.kind==='speech'}
          {#if beat.speaker==='Player'}
            <p class="eyebrow">{dialogueSpeakerLabel(beat.speaker)}</p>
          {:else}
            <h2 class="speaker-heading">HECTOR D. SMOKE</h2>
          {/if}
          <p class="speech">“{say}”</p>
        {:else if beat.kind==='handoff'}
          <p class="eyebrow">SHIFT DISPATCH · INDUSTRY / HAULING</p>
          <h2>Take the Route Sheet</h2>
          <p class="work-description">The Route Sheet is ready with the round documents.
            Take it before you set off.</p>
          {#if takingRound}<p class="work-description" role="status">Taking the route sheet…</p>{/if}
        {/if}

        <div class="responses">
          {#if beat.next}
            <button type="button" class="primary-choice" onclick={()=>{if(beat.next)next(beat.next);}}>Continue</button>
          {/if}
          {#if beat.kind!=='handoff'}
            <button type="button" class="secondary-choice" onclick={askHector}>
            <BellrunnerChoiceIcon kind="chat"/>Ask Hector something
          </button>
          {/if}
          {#if handoffError}<p class="error" role="alert">{handoffError}</p>{/if}
        </div>
      {/if}
      </div>
      {#if entered&&!selected&&!talking&&canGoBack}
        <div class="dialogue-navigation">
          <button type="button" onclick={()=>{selected=null;goBack();}}>
            <span aria-hidden="true">‹</span> Previous line
          </button>
        </div>
      {/if}
    </aside>
    </section>
    {/snippet}
  </ActivityLayout>
</section>

<style>
  /* Hector and the Depot are the scene anchor; the job papers are the scene
     supplement and the parchment is the adjacent reading panel. Placement is
     owned by ActivityLayout (scene mode); sizes follow the slot each region
     was given, not the window width. */
  .bellrunner{display:flex;flex-direction:column;flex:1;min-width:0;width:100%;
    color:#eee1cf;font-family:var(--pall-font-reading,Georgia,serif)}
  .scene-visuals{min-width:0}
  .scene-illustration{position:relative;width:100%;aspect-ratio:1672/941}
  .depot{position:absolute;inset:0;width:100%;height:100%;
    object-fit:contain;pointer-events:none}
  .scene-shade{position:absolute;inset:0;z-index:1;pointer-events:none;
    background:linear-gradient(90deg,#100e0c3d,transparent 65%,#0c0a0925)}
  .hector{position:absolute;z-index:2;top:3%;left:7%;height:103%;
    width:auto;max-width:43%;object-fit:contain;object-position:bottom center;
    pointer-events:none;filter:drop-shadow(1px 6px 7px #0a080577)}
  .depot-foreground{z-index:3;clip-path:inset(93% 0 0 0)}
  .npc-hotspot{position:absolute;z-index:4;top:7%;left:6%;width:41%;
    height:86%;display:flex;align-items:flex-end;justify-content:center;
    padding:0 0 6px;border:0;background:transparent;color:#f9dfb2;cursor:pointer}
  .npc-hotspot:focus-visible{outline:2px solid #efd092;outline-offset:2px}
  /* Content-driven height: two choices make a short sheet, a long speech a
     taller one. No stretching to match the artwork column. */
  .dispatch-dialogue{position:relative;z-index:1;display:flex;flex-direction:column;
    box-sizing:border-box;width:100%;max-width:980px;min-width:0;
    min-height:0;max-height:none;overflow:visible;margin:0 auto;
    padding:clamp(20px,2.3vw,39px) clamp(19px,2.35vw,40px) 25px;
    border:2px solid #654022;border-radius:5px;
    background:#efdfbb;color:#251910;box-shadow:0 7px 15px #0008}
  .dialogue-body{min-width:0}
  .dialogue-navigation{border-top:1px solid #9e8159;margin-top:auto;
    padding-top:12px;min-width:0}
  .dialogue-navigation>button{appearance:none;display:inline-flex;align-items:center;
    gap:10px;min-height:44px;padding:5px 2px;border:0;background:transparent;
    color:#543820;cursor:pointer;text-align:left;font:600 var(--dialogue-text,17px)/1.3
    var(--pall-font-reading,Georgia,serif)}
  .dialogue-navigation>button span{font:24px/1 Georgia,serif}
  .dialogue-navigation>button:is(:hover,:focus-visible){color:#24140b;
    text-decoration:underline}
  .dialogue-navigation>button:focus-visible{outline:2px solid #b58e59;outline-offset:2px}
  .eyebrow{font:600 14px/1.25 var(--pall-font-label,'Arial Narrow',sans-serif);
    letter-spacing:.12em;color:#614029;margin:0 0 16px;padding-bottom:10px;
    border-bottom:1px solid #9e815955}
  /* One fixed reading scale (tokens in pall-story-landscape.css): every
     narration, speech, inspection line and choice is the same size. */
  h2{margin:0 0 12px;font:600 var(--dialogue-title,21px)/1.3
    var(--pall-font-reading,Georgia,serif);color:#25170f}
  /* The speaking NPC is labelled like the player's name: a small caption. */
  .speaker-heading{margin:0 0 16px;padding:0 0 10px;
    border-bottom:1px solid #9e815955;text-transform:uppercase;
    font:normal var(--dialogue-label,15px)/1.15
    var(--pall-font-label,'Arial Narrow',sans-serif);letter-spacing:.09em;color:#624328}
  .speech,.narration,.work-description{margin:0 0 14px;
    font:600 var(--dialogue-text,17px)/1.55 var(--pall-font-reading,Georgia,serif);
    color:#251910}
  .narration{font-style:italic}
  .responses{display:flex;flex-direction:column;gap:9px;margin-top:18px}
  .responses>button{display:block;width:100%;text-align:left;
    border:1px solid #6d5235;background:#241d16;color:#f7e6c9;
    padding:10px 13px;font:600 var(--dialogue-text,17px)/1.35
    var(--pall-font-reading,Georgia,serif);
    cursor:pointer;min-height:52px}
  .responses>button:hover,.responses>button:focus-visible{
    background:#423022;outline:1px solid #c49d65}
  .responses>button:disabled{opacity:.55;cursor:wait}
  .error{margin:4px 0 0;color:#873523;font:13px/1.45 Georgia,serif}
  /* A narrow reading slot (beside or below) tightens the parchment. */
  @container activity-panel (max-width:560px){
    .dispatch-dialogue{padding:20px 18px}
  }
  /* Small rendered artwork: Hector fills the frame height and the hotspot
     widens with him, whatever produced the small slot. */
  @container activity-stage (max-width:680px){
    .depot{object-position:center}
    .hector{top:0;height:100%;max-width:43%;left:2%}
    .npc-hotspot{left:0;top:6%;width:47%;height:87%;padding-bottom:0}
  }
</style>