<script lang="ts">
  import {onDestroy} from 'svelte';
  import type {StageOneBeat} from '$lib/approved-stage-one';

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

<section class="bellrunner" aria-label="Bellrunner Stage 1 — Dispatch House">
  <div class="dispatch-scene">
    <img class="depot" src="/locations/origins/bellrunner-depot.webp"
      alt="Grand Cylinder City Dispatch House, a working industrial courier depot" draggable="false"/>
    <div class="scene-shade" aria-hidden="true"></div>
    <img class="hector" src="/characters/hector/hector-d-smoke.webp"
      alt="Hector D. Smoke, the Dispatch Master with a pipe and work clipboard" draggable="false"/>
    {#each paperKeys as key}
      <img class="paper-art {key}" src={papers[key].src} alt="" aria-hidden="true" draggable="false"/>
      <button type="button" class="paper-target {key}"
        aria-label={'Inspect '+papers[key].label} aria-pressed={selected===key}
        data-pall-sfx="paper" onclick={()=>inspect(key)}>
        <span class="object-label">{papers[key].label}</span>
      </button>
    {/each}
    <div class="hector-label" aria-hidden="true">Hector D. Smoke</div>

    <div class="dispatch-dialogue" aria-label="Hector's approved opening">
      {#if !entered}
        <p class="eyebrow">DISPATCH HOUSE · STAGE I</p>
        <h2>Hector D. Smoke</h2>
        <p class="speech">Dispatch Master</p>
        <button type="button" class="scene-action" onclick={begin}>Begin the round</button>
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
    </div>

    {#if selected}
      <aside class="paper-inspection" aria-label={papers[selected].label}>
        <div class="inspection-illustration">
          <img src={papers[selected].src} alt={papers[selected].label} draggable="false"/>
        </div>
        <div class="inspection-text">
          <h3>{papers[selected].label}</h3>
          <p>{papers[selected].observation}</p>
          <button type="button" onclick={()=>selected=null}>Close</button>
        </div>
      </aside>
    {/if}
  </div>
</section>

<style>
  .bellrunner{min-width:0;width:100%;color:#eee0c7;font-family:var(--pall-font-reading,Georgia,serif)}
  .dispatch-scene{position:relative;isolation:isolate;min-width:0;overflow:hidden;
    width:100%;height:clamp(555px,58vw,720px);background:#29231d}
  .depot{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;pointer-events:none}
  .scene-shade{position:absolute;inset:0;pointer-events:none;z-index:1;
    background:linear-gradient(90deg,#100e0c24 0%,transparent 48%,#09080738 100%),
      linear-gradient(0deg,#110d0955,transparent 40%)}
  .hector{position:absolute;left:5%;bottom:-3%;height:99%;max-width:45%;
    object-fit:contain;object-position:bottom left;z-index:2;pointer-events:none;
    filter:drop-shadow(1px 8px 8px #08060599)}
  .hector-label{position:absolute;bottom:29%;left:5%;z-index:4;pointer-events:none;
    padding:5px 10px;background:#211911d9;border:1px solid #987345;
    color:#f4d9aa;font:600 13px Georgia,serif}
  .paper-art{position:absolute;z-index:3;bottom:3%;height:24%;width:18%;
    object-fit:contain;pointer-events:none;filter:drop-shadow(0 5px 5px #0009)}
  .paper-art.notices{left:43%}
  .paper-art.sealed{left:62%}
  .paper-art.route{left:81%}
  .paper-target{position:absolute;z-index:5;bottom:2%;height:27%;width:18%;
    border:0;background:transparent;cursor:pointer;color:#f1dbb2}
  .paper-target.notices{left:43%}
  .paper-target.sealed{left:62%}
  .paper-target.route{left:81%}
  .paper-target:focus-visible{outline:2px solid #f4ce86;outline-offset:2px}
  .object-label{position:absolute;bottom:1%;left:50%;transform:translateX(-50%);
    padding:4px 7px;background:#221911ed;border:1px solid #aa8256;
    border-radius:2px;white-space:nowrap;font:600 11px Georgia,serif;
    opacity:0;pointer-events:none;transition:opacity .15s}
  .paper-target:is(:hover,:focus-visible) .object-label{opacity:1}
  .dispatch-dialogue{position:absolute;top:3.5%;right:2.4%;z-index:6;
    box-sizing:border-box;width:min(46%,640px);max-height:72%;overflow-y:auto;
    border:solid transparent;border-width:21px 25px 20px;
    border-image-source:url('/ui-kit/frames/dialogue-frame-trim.png');
    border-image-slice:145 190 125 190 fill;
    border-image-width:21px 25px 20px;border-image-repeat:stretch;
    padding:12px 15px 14px;background:transparent;color:#291b13;
    filter:drop-shadow(0 5px 8px #0009)}
  .eyebrow{margin:0 0 10px;font:600 12px/1.35 var(--pall-font-label,'Arial Narrow',sans-serif);
    letter-spacing:.06em;color:#4e3524}
  h2{margin:0 0 10px;font:600 26px/1.25 Georgia,serif;color:#2b1b10}
  .speech,.narration,.work-description,.payment{margin:0 0 12px;
    font:17px/1.45 var(--pall-font-reading,Georgia,serif);color:#2c1b10}
  .narration{font-style:italic}
  .payment{font-weight:700}
  .responses{display:flex;flex-wrap:wrap;align-items:center;gap:8px}
  .scene-action,.secondary,.paper-inspection button{cursor:pointer;
    min-height:38px;padding:8px 15px;border:1px solid #946c40;
    background:#36271e;color:#f5ddaf;font:600 14px/1.25 Georgia,serif}
  .secondary{background:#684b32;color:#fff0d8}
  .scene-action:disabled{opacity:.5;cursor:wait}
  button:focus-visible{outline:2px solid #f0c681;outline-offset:2px}
  .error{width:100%;margin:4px 0 0;color:#832815;font:13px Georgia,serif}
  .paper-inspection{position:absolute;right:2%;bottom:2%;z-index:8;
    width:min(54%,680px);max-height:62%;overflow-y:auto;
    display:grid;grid-template-columns:36% 1fr;gap:12px;
    padding:10px 15px;border:2px solid #9a7447;border-radius:4px;
    background:#ead8b7;color:#28190e;box-shadow:0 10px 30px #000b}
  .inspection-illustration{display:flex;align-items:center;justify-content:center;min-height:100px}
  .inspection-illustration img{width:100%;max-height:230px;object-fit:contain}
  .inspection-text h3{margin:8px 0;font:600 19px Georgia,serif}
  .inspection-text p{margin:0 0 14px;font:15px/1.42 Georgia,serif}
  @media(max-width:950px){
    .dispatch-scene{height:auto;overflow:visible}
    .depot{height:auto;aspect-ratio:1672/941;position:relative;display:block;object-fit:cover}
    .scene-shade{height:auto;aspect-ratio:1672/941;bottom:auto}
    .hector{height:auto;width:38%;max-width:none;bottom:auto;top:2%;
      aspect-ratio:1122/1402;object-fit:contain}
    .paper-art{bottom:auto;top:28%;width:19%;height:16%}
    .paper-target{bottom:auto;top:28%;width:19%;height:17%}
    .hector-label{bottom:auto;top:37%}
    .dispatch-dialogue{position:relative;top:auto;right:auto;max-height:none;
      width:min(100%,650px);margin:0 auto;overflow:visible}
    .paper-inspection{position:relative;right:auto;bottom:auto;
      width:calc(100% - 24px);max-height:none;margin:0 auto 12px}
  }
  @media(max-width:600px){
    .dispatch-dialogue{width:100%;border-width:18px 18px 17px;
      border-image-width:18px 18px 17px;padding:9px}
    .speech,.narration,.work-description,.payment{font-size:15px}
    .hector-label{font-size:10px}
    .paper-inspection{grid-template-columns:30% 1fr;gap:9px}
    .inspection-text p{font-size:13px}
    .object-label{font-size:10px}
  }
  @media(prefers-reduced-motion:reduce){.object-label{transition:none}}
</style>
