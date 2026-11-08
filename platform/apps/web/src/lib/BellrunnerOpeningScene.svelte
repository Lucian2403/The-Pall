<script lang="ts">
  import {onDestroy} from 'svelte';
  import type {StageOneBeat} from '$lib/approved-stage-one';
  import WorkshopItemPopover from '$lib/WorkshopItemPopover.svelte';
  import '$lib/workshop-object-labels.css';

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
  const paperKeys=['notices','sealed','route'] as const;
  let {characterName,beat,advance,goBack,canGoBack,takeRound,takingRound=false,handoffError=''}:{
    characterName:string;beat:StageOneBeat;advance:(next:string,fromChoice?:boolean)=>void;
    goBack:()=>void;canGoBack:boolean;takeRound:()=>Promise<void>;
    takingRound?:boolean;handoffError?:string
  }=$props();
  let entered=$state(false);
  let selected=$state<PropKey|null>(null);
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
  function next(nextId:string,fromChoice=false){
    selected=null;
    advance(nextId,fromChoice);
  }
  const say=$derived(beat.text.replaceAll('[player name]',characterName));
</script>

<section class="workshop bellrunner" aria-label="Bellrunner Stage 1 — Dispatch House">
  <div class="dispatch-scene">
    <div class="scene-illustration">
    <img class="depot" src="/locations/origins/bellrunner-depot.webp"
      alt="Grand Cylinder City Dispatch House, a working industrial courier depot" draggable="false"/>
    <div class="scene-shade" aria-hidden="true"></div>
    <img class="hector" src="/characters/hector/hector-d-smoke.webp"
      alt="Hector D. Smoke, the Dispatch Master with a pipe and work clipboard" draggable="false"/>
    <!-- Reuse the original scene over the lower foreground, exactly as Guther's bench.
         The object props remain in front and Hector's lower legs are occluded. -->
    <img class="depot depot-foreground" src="/locations/origins/bellrunner-depot.webp"
      alt="" aria-hidden="true" draggable="false"/>
    {#each paperKeys as key}
      <img class="paper-art {key}" src={papers[key].src} alt="" aria-hidden="true" draggable="false"/>
      <button type="button" class="paper-target {key}" data-workshop-object
        aria-label={'Inspect '+papers[key].label} aria-pressed={selected===key}
        data-pall-sfx="paper" onclick={()=>inspect(key)}>
        <span class="workshop-object-label">{papers[key].label}</span>
      </button>
    {/each}
    <button type="button" class="npc-hotspot" title="Talk to Hector D. Smoke"
      aria-label="Talk to Hector D. Smoke"
      onclick={()=>{selected=null;begin();}}>
      <span class="workshop-npc-label">Hector D. Smoke</span>
    </button>
    {#if selected}
      <WorkshopItemPopover itemKey={selected} title={papers[selected].label}
        description={papers[selected].observation} onClose={()=>{selected=null;}} />
    {/if}
    </div>

    <aside class="work-card dispatch-dialogue" aria-label="Hector's approved opening">
      {#if !entered}
        <p class="eyebrow">DISPATCH HOUSE · STAGE I</p>
        <h2>Hector D. Smoke</h2>
        <p class="speech">Dispatch Master</p>
        <div class="responses">
          <button type="button" class="scene-action" onclick={begin}>Begin the round</button>
        </div>
      {:else}
        {#if beat.kind==='narration'}
          <p class="eyebrow">DISPATCH HOUSE</p>
          <p class="narration">{say}</p>
        {:else if beat.kind==='speech'}
          <p class="eyebrow">{beat.speaker==='Player'?characterName:'HECTOR D. SMOKE'}</p>
          <p class="speech">“{say}”</p>
        {:else if beat.kind==='choice'}
          <p class="eyebrow">YOUR RESPONSE</p>
        {:else}
          <p class="eyebrow">SHIFT DISPATCH · INDUSTRY / HAULING</p>
          <h2>Take the round</h2>
          <p class="work-description">Council shift notices. Route sheet. Receiving marks.</p>
          <p class="payment">Payment not yet cleared.</p>
        {/if}

        <div class="responses">
          {#if beat.kind==='choice'&&beat.choices}
            {#each beat.choices as choice}
              <button type="button" class="scene-action"
                onclick={()=>next(choice.next,true)}>{choice.label}</button>
            {/each}
          {:else if beat.next}
            <button type="button" class="scene-action" onclick={()=>{if(beat.next)next(beat.next);}}>Continue</button>
          {:else if beat.kind==='handoff'}
            <button type="button" class="scene-action" data-pall-sfx="paper"
              disabled={takingRound} onclick={()=>{void takeRound();}}>
              {takingRound?'Saving…':'Take the round'}
            </button>
          {/if}
          {#if canGoBack}
            <button type="button" class="secondary" onclick={()=>{selected=null;goBack();}}>Previous line</button>
          {/if}
          {#if handoffError}<p class="error" role="alert">{handoffError}</p>{/if}
        </div>
      {/if}
    </aside>
  </div>
</section>

<style>
  /* The Bellrunner stage reuses Millhand's exact nine-slice frame, choice buttons,
     inspect popover and object labels from pall-owner-ui.css and workshop-object-labels.css. */
  .bellrunner{display:flex;flex-direction:column;flex:1;min-width:0;width:100%;
    color:#eee1cf;font-family:var(--pall-font-reading,Georgia,serif)}
  .dispatch-scene{position:relative;display:grid;
    grid-template-columns:minmax(0,42%) minmax(0,47%) minmax(0,11%);
    align-content:start;grid-template-rows:minmax(0,1fr);
    width:100%;min-width:0;height:clamp(535px,62vh,640px);background:#291d15}
  .scene-illustration{position:absolute;inset:0;overflow:hidden}
  .depot{position:absolute;inset:0;width:100%;height:100%;
    object-fit:cover;pointer-events:none}
  .scene-shade{position:absolute;inset:0;z-index:1;pointer-events:none;
    background:linear-gradient(90deg,#100e0c29,transparent 52%,#0c0a092c)}
  .hector{position:absolute;z-index:1;top:6%;left:10%;height:112%;
    width:auto;max-width:36%;object-fit:contain;object-position:bottom center;
    pointer-events:none;filter:drop-shadow(1px 5px 6px #0a080555)}
  .depot-foreground{z-index:2;clip-path:inset(70% 0 0 0)}
  .npc-hotspot{position:absolute;z-index:4;top:12%;left:10%;
    width:27%;height:56%;display:flex;align-items:flex-end;justify-content:center;
    padding:0 0 10px;border:0;background:transparent;color:#f9dfb2;cursor:pointer}
  .npc-hotspot:focus-visible{outline:2px solid #efd092;outline-offset:2px}
  .paper-art{position:absolute;z-index:3;bottom:5%;height:30%;width:18%;
    object-fit:contain;pointer-events:none;filter:drop-shadow(0 4px 4px #0806069c)}
  .paper-art.notices{left:43%}.paper-art.sealed{left:62%}.paper-art.route{left:81%}
  .paper-target{position:absolute;z-index:5;bottom:1%;height:36%;width:18%;
    display:flex;flex-direction:column;justify-content:flex-end;align-items:center;
    padding:0;background:transparent;border:0;color:#f3e6d1;cursor:pointer}
  .paper-target.notices{left:43%}.paper-target.sealed{left:62%}.paper-target.route{left:81%}
  .paper-target:focus-visible{outline:2px solid #eed4a3;outline-offset:2px}
  .paper-target:hover~.paper-art{filter:brightness(1.05)}
  .dispatch-dialogue{position:relative;grid-column:2;z-index:6;align-self:start;
    width:100%;margin:clamp(24px,3vw,50px) 0 24px;box-sizing:border-box;
    min-width:0;max-height:calc(100% - 48px);overflow-y:auto;
    overscroll-behavior:contain;padding:15px 18px;
    border:2px solid #654022;border-radius:5px;
    background:#efdfbb;color:#251910;box-shadow:0 7px 15px #0008}
  .eyebrow{font:600 11px/1.3 sans-serif;letter-spacing:.12em;color:#614029;margin:0 0 12px}
  h2{margin:0 0 12px;font:600 24px/1.3 var(--pall-font-reading,Georgia,serif);color:#25170f}
  .speech,.narration,.work-description,.payment{margin:0 0 12px;
    font:600 clamp(13px,1.2vw,17px)/1.5 var(--pall-font-reading,Georgia,serif);color:#251910}
  .narration{font-style:italic}
  .payment{font-weight:700}
  .responses{display:flex;flex-direction:column;gap:6px;margin-top:3px}
  .responses>button{display:block;width:100%;text-align:left;
    border:1px solid #6d5235;background:#241d16;color:#f7e6c9;
    padding:10px 12px;font:14px/1.4 var(--pall-font-reading,Georgia,serif);
    cursor:pointer;min-height:42px}
  .responses>button:hover,.responses>button:focus-visible{
    background:#423022;outline:1px solid #c49d65}
  .responses>button:disabled{opacity:.55;cursor:wait}
  .error{margin:4px 0 0;color:#873523;font:13px/1.45 Georgia,serif}
  @media(max-width:700px){
    .dispatch-scene{display:flex;flex-direction:column;height:auto;min-height:0}
    .scene-illustration{position:relative;inset:auto;width:100%;aspect-ratio:4/3}
    .depot{object-position:39% center}
    .hector{height:88%;max-width:42%;left:-2%;top:2%}
    .depot-foreground{object-position:39% center}
    .npc-hotspot{left:0;top:7%;width:41%;height:49%;padding-bottom:0}
    .paper-art{bottom:9%;height:25%;width:20%}
    .paper-target{bottom:2%;height:35%;width:20%}
    .paper-art.notices,.paper-target.notices{left:39%}
    .paper-art.sealed,.paper-target.sealed{left:59%}
    .paper-art.route,.paper-target.route{left:79%}
    .dispatch-dialogue{width:100%;margin:0;padding:14px;border-radius:0;
      max-height:none;overflow:visible}
    .speech,.narration,.work-description,.payment{font-size:16px;line-height:1.5}
  }
</style>
