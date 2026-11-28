<script lang="ts">
  import {PLAYER_SPEAKER_LABEL} from '$lib/dialogue-speaker';
  import {homeJournalEntries,homeCompletionSummary} from '$lib/home-journal-copy';
  import type {FinaleOrigin} from '$lib/shared-finale-origins';
  import {page} from '$app/state';
  import {onMount} from 'svelte';
  import {activityRunning,type ActivityRun} from '@the-pall/game-core';
  import ActivityProgress from '$lib/ActivityProgress.svelte';
  import TutorialShell from '$lib/TutorialShell.svelte';
  import {openGameWindow,closeContextWindows} from '$lib/game-window-state';
  import ActivityLayout from '$lib/ActivityLayout.svelte';
  import '$lib/pall-story-landscape.css';

  type Phase='HOME'|'NOTICE'|'SPEECH'|'COMPLETE';
  type Action='read_notice'|'put_down'|'finish'|'rest'|'pay_rent';
  type Home={stage:8;revision:number;phase:Phase;homeId:string;origin:FinaleOrigin;
    branch:string;
    outcome:'player_victory'|'player_defeat';
    characterName:string;coins:number;rent:number;shortfall:number;
    rentPaid:boolean;rentPaidAt:string|null;rentDue:number;
    activity?:ActivityRun|null;serverNow?:string;
    noticeTitle:string;noticeText:string;closingSpeech:string;completed:boolean;
    condition:{stamina:number;composure:number;fatigue:number;stress:number}};
  type Character={id:string;name:string;origin:string;sex:string;avatarId?:string|null;
    coins:number;health:{current:number;maximum:number};startingLocation:string;
    tutorial:{stage:number;status:string}};
  const id=$derived(page.params.id!);
  const api=$derived('/api/characters/'+encodeURIComponent(id)+'/tutorial/home');
  let character=$state<Character|null>(null);
  let home=$state<Home|null>(null);
  let status=$state<'loading'|'ready'|'unauthorized'|'missing'|'prerequisite'|'schema'|'error'>('loading');
  let pending=$state(false),errorMessage=$state(''),restMessage=$state('');
  let restAnimating=$state(false);
  const activityBusy=$derived(activityRunning(home?.activity));
  let activityTime=$state(0);
  let clockBase=0,clockAt=0,polling=false,lastPoll=0;
  const REST_RESULT='Stamina and Composure restored. Fatigue and Stress cleared.';
  function syncClock(saved:Home){
    clockBase=saved.serverNow?Date.parse(saved.serverNow):Date.now();
    clockAt=performance.now();activityTime=clockBase;
  }
  let noticeExpanded=$state(false);
  let kitchenOpen=$state(false);
  let journalOpen=$state(false);
  let nextOpenSound=0;
  const chestOpenSounds=['/audio/chest/PersonalChest_Open1.wav',
    '/audio/chest/PersonalChest_Open2.wav'];
  const chestCloseSound='/audio/chest/PersonalChest_Close.wav';
  function playChestSound(kind:'open'|'close'){
    const source=kind==='close'?chestCloseSound:
      chestOpenSounds[(nextOpenSound++)%chestOpenSounds.length];
    const effect=new Audio(source);
    effect.volume=.65;
    void effect.play().catch(()=>{/* Browser may block audio */});
  }
  let retryKey:string|null=null,retryId:string|null=null;
  const currentJournalEntries=$derived(home?homeJournalEntries(home.origin,home.phase,home.rent):[]);
  function openRoomStorage(){
    openGameWindow(id,'storage');
    playChestSound('open');
  }
  function toggleJournal(){journalOpen=!journalOpen;}
  $effect(()=>{const currentId=id;journalOpen=false;void currentId;});
  // A reused route cannot carry another character's Home or Journal state.
  let requestGeneration=0;
  async function refresh(requestedId:string){
    const generation=++requestGeneration;
    const requestedApi='/api/characters/'+encodeURIComponent(requestedId)+'/tutorial/home';
    const current=()=>generation===requestGeneration&&requestedId===id;
    character=null;home=null;status='loading';pending=false;
    errorMessage='';restMessage='';restAnimating=false;retryKey=null;retryId=null;
    noticeExpanded=false;kitchenOpen=false;lastPoll=0;
    closeContextWindows();
    try{
      const [person,r]=await Promise.all([
        fetch('/api/characters/'+encodeURIComponent(requestedId),{cache:'no-store'}),
        fetch(requestedApi,{cache:'no-store'})
      ]);
      if(!current())return;
      if(person.status===401||r.status===401){status='unauthorized';return;}
      if(person.status===404||r.status===404){status='missing';return;}
      if(r.status===503){status='schema';return;}
      if(r.status===409){
        const detail=await r.json().catch(()=>({}));
        if(!current())return;
        if(detail.error==='not_at_home'){
          window.location.replace('/characters/'+encodeURIComponent(requestedId)+'/overview');return;
        }
        status='prerequisite';return;
      }
      if(!person.ok||!r.ok)throw Error('home_unavailable');
      const savedCharacter=(await person.json() as {character:Character}).character;
      const result=await r.json() as Home|{needsStart:true};
      if(!current())return;
      let savedHome:Home;
      if('needsStart' in result){
        const started=await fetch(requestedApi,{method:'POST',
          headers:{'content-type':'application/json'},
          body:JSON.stringify({kind:'start',requestId:crypto.randomUUID()})});
        if(!started.ok)throw Error('home_start_failed');
        savedHome=await started.json() as Home;
      }else savedHome=result;
      if(!current())return;
      home=savedHome;syncClock(savedHome);noticeExpanded=savedHome.phase==='NOTICE';
      if(savedHome.activity?.key==='home.rest'&&savedHome.activity.completedAt)restMessage=REST_RESULT;
      character={...savedCharacter,coins:savedHome.coins,tutorial:{stage:8,
        status:savedHome.completed?'COMPLETED':'IN_PROGRESS'}};
      status='ready';
    }catch(error){
      if(!current())return;
      errorMessage=error instanceof Error?error.message:'Home unavailable';
      status='error';
    }
  }
  $effect(()=>{
    const requestedId=id;
    void refresh(requestedId);
    return ()=>{requestGeneration++;};
  });
  // Poll while in Free Play, including when another tab starts an activity.
  // The server settles due work. The local clock only animates its progress.
  async function pollHome(){
    if(polling||pending||restAnimating||status!=='ready'||!home?.completed)return;
    const requestedId=id,generation=requestGeneration;
    polling=true;
    try{
      const response=await fetch('/api/characters/'+encodeURIComponent(requestedId)+'/tutorial/home',{cache:'no-store'});
      if(requestedId!==id||generation!==requestGeneration||pending)return;
      if(!response.ok)return;
      const result=await response.json() as Home;
      if(requestedId!==id||generation!==requestGeneration||pending||!home||result.revision<home.revision)return;
      const previous=home.activity;
      home=result;syncClock(result);
      if(character)character={...character,coins:result.coins};
      if(activityRunning(result.activity)){
        noticeExpanded=false;kitchenOpen=false;restMessage='';
      }else if(result.activity?.key==='home.rest'&&result.activity.completedAt&&
        (activityRunning(previous)||previous?.id!==result.activity.id)){
        restMessage=REST_RESULT;
      }
    }catch{/* Keep the last confirmed state. Retry on the next poll. */}
    finally{polling=false;}
  }
  onMount(()=>{
    const tick=()=>{
      activityTime=clockBase+performance.now()-clockAt;
      if(document.hidden)return;
      const interval=activityBusy?1000:5000;
      if(performance.now()-lastPoll>=interval){lastPoll=performance.now();void pollHome();}
    };
    const timer=window.setInterval(tick,250);
    const resume=()=>{if(!document.hidden)void pollHome();};
    window.addEventListener('focus',resume);document.addEventListener('visibilitychange',resume);
    return ()=>{clearInterval(timer);window.removeEventListener('focus',resume);document.removeEventListener('visibilitychange',resume);};
  });
  async function perform(action:Action):Promise<boolean>{
    if(pending||activityBusy||!home||(home.completed&&action!=='rest'&&action!=='pay_rent'))return false;
    const actingId=id,actingGeneration=requestGeneration;
    const current=()=>actingId===id&&actingGeneration===requestGeneration;
    const actingApi='/api/characters/'+encodeURIComponent(actingId)+'/tutorial/home';
    const key=home.revision+':'+action;
    if(key!==retryKey||!retryId){retryKey=key;retryId=crypto.randomUUID();}
    pending=true;errorMessage='';
    try{
      const response=await fetch(actingApi,{method:'POST',headers:{'content-type':'application/json'},
        body:JSON.stringify({kind:'action',action,requestId:retryId,expectedRevision:home.revision})});
      if(!current())return false;
      if(response.status===409){
        const problem=await response.json().catch(()=>({}));
        if(!current())return false;
        retryId=null;retryKey=null;
        const latest=await fetch(actingApi,{cache:'no-store'});
        if(latest.ok){
          const updated=await latest.json() as Home;
          if(!current())return false;
          home=updated;syncClock(updated);noticeExpanded=updated.phase==='NOTICE'||(action==='pay_rent'&&updated.completed);
          if(character)character={...character,coins:updated.coins,tutorial:{stage:8,status:updated.completed?'COMPLETED':'IN_PROGRESS'}};
        }
        errorMessage=problem.error==='activity_in_progress'?'An activity is already in progress.':problem.error==='insufficient_coins'?'You do not have enough coins to pay the rent.':problem.error==='rent_already_paid'?'The rent has already been paid.':'The saved scene changed. Current progress has been reloaded.';
        return false;
      }
      if(response.status===503){errorMessage='Home database update required. Run npm run home:migrate.';return false;}
      if(!response.ok)throw Error('home_action_failed');
      const result=await response.json() as Home;
      if(!current())return false;
      home=result;syncClock(result);noticeExpanded=result.phase==='NOTICE'||(action==='pay_rent'&&result.completed);
      retryId=null;retryKey=null;
      if(character)character={...character,coins:result.coins,tutorial:{stage:8,status:home.completed?'COMPLETED':'IN_PROGRESS'}};
      return true;
    }catch{
      if(current())errorMessage='Connection interrupted. Retry the same action; it cannot complete twice.';
      return false;
    }
    finally{if(current())pending=false;}
  }
  async function restInBed(){
    if(restAnimating||pending||activityBusy||!home)return;
    if(home.completed){
      restMessage='';kitchenOpen=false;noticeExpanded=false;
      await perform('rest');return;
    }
    const actingId=id,actingGeneration=requestGeneration;
    restAnimating=true;restMessage='';kitchenOpen=false;
    // Only the confirmed server Rest changes character condition.
    const fade=new Promise<void>(resolve=>setTimeout(resolve,1000));
    const saved=await perform('rest');
    await fade;
    if(actingId!==id||actingGeneration!==requestGeneration)return;
    restAnimating=false;
    if(saved)restMessage=REST_RESULT;
  }
  function interactNotice(){
    if(pending||activityBusy||!home)return;
    restMessage='';kitchenOpen=false;
    if(home.phase==='HOME')void perform('read_notice');
    else if(['NOTICE','SPEECH','COMPLETE'].includes(home.phase))noticeExpanded=true;
  }
  function interactKitchen(){
    if(pending||restAnimating||activityBusy||!home?.completed)return;
    restMessage='';noticeExpanded=false;kitchenOpen=true;
  }
</script>
<svelte:head><title>The Pall — Return Home</title></svelte:head>
{#if status==='ready'&&character?.id===id&&home}
  <TutorialShell character={{...character,stamina:{current:home.condition.stamina,maximum:100}}} sceneStage={8} sceneLocation="Shared rented home" travelLocked={activityBusy} cityMap={home?.completed?{href:'/characters/'+encodeURIComponent(id)+'/overview'}:undefined}
    journalController={{open:journalOpen,toggle:toggleJournal,
      title:'Rented Home',entries:home.completed?[]:currentJournalEntries}}
    onStorageClosed={()=>playChestSound('close')}
    onStorageOpened={()=>playChestSound('open')}>
    <section class="stage8" aria-label="Stage 8 shared rented home">
      <!-- Shared scene layout: the rented room (native 1672x941) with its
           chest, journal, notice and bed is the stage; the room dialogue is
           the reading column beside it on wide screens, below on narrow. -->
      <ActivityLayout mode="scene" stageAspect={1672 / 941} class="pall-story-sections">
      {#snippet stage()}
      <div class="scene-visuals pall-story-visuals">
      <div class="home-scene pall-story-landscape" aria-label="A modest rented room in Grand Cylinder City">
        <div class="home-artwork" aria-label="The complete rented room illustration">
        <button type="button" class="hotspot chest" aria-label="Storage"
          data-open-home-chest title="Storage" disabled={activityBusy} onclick={openRoomStorage}>
          <span class="object-caption">Storage</span>
        </button>
        <button type="button" class="hotspot book" aria-label="Read journal"
          title="Journal" data-pall-sfx="paper"
          onclick={()=>{void toggleJournal();}}>
          <span class="object-caption">Journal</span>
        </button>
        <button type="button" class="hotspot notice-object" aria-label="Read notice"
          title="Notice" data-pall-sfx="paper" disabled={activityBusy} onclick={interactNotice}>
          <img src="/locations/home/notice.webp" alt="" width="150" height="100"
            draggable="false" />
          <span class="object-caption">Notice</span>
        </button>
        <button type="button" class="hotspot bed" aria-label="Rest in bed"
          title="Rest — restore Stamina and Composure, clear Fatigue and Stress"
          disabled={pending||restAnimating||activityBusy} onclick={()=>{void restInBed();}}>
          <span class="object-caption">Rest</span>
        </button>
        {#if home?.completed}
          <button type="button" class="hotspot kitchen" aria-label="Kitchen — Tier I"
            title="Kitchen — Tier I" disabled={pending||restAnimating||activityBusy} onclick={interactKitchen}>
            <span class="object-caption">Kitchen · T1</span>
          </button>
        {/if}
        {#if restAnimating}<div class="rest-fade" aria-hidden="true"></div>{/if}
        </div>
      </div>
      </div>
      {/snippet}
      {#snippet panel()}
      {#if home}
      <div class="reading-column pall-story-dialogue-section">
        {#if home.activity&&activityBusy}
          <aside class="home-dialogue rest-dialogue" aria-label="Current activity">
            <p class="eyebrow">BED · REST</p>
            <h1>Resting</h1>
            <p class="narration">You are resting in bed.</p>
            <ActivityProgress activity={home.activity} now={activityTime}/>
            <p class="instruction">You can leave this page. Rest continues until the allotted time has elapsed.</p>
          </aside>
        {:else if restMessage}
          <aside class="home-dialogue rest-dialogue" aria-label="Rest result" role="status">
            <p class="eyebrow">BED · REST</p>
            <h1>Rest complete</h1>
            <p class="narration">You have finished resting.</p>
            <p class="instruction">{restMessage}</p>
            <button type="button" class="pall-framed-button primary-choice"
              onclick={()=>restMessage=''}>Continue</button>
          </aside>
        {:else if home.phase==='HOME'}
          <aside class="home-dialogue" aria-label="Return home dialogue">
            <p class="eyebrow">RETURN HOME · STAGE VIII</p>
            <h1>Home</h1>
            <p class="narration">You return to your rented home. A notice lies on the table.</p>
            <p class="instruction">Read the notice on the table.</p>
          </aside>
        {:else if kitchenOpen&&home.completed}
          <aside class="home-dialogue" aria-label="Kitchen">
            <p class="eyebrow">HOME · TIER I</p>
            <h1>Kitchen</h1>
            <p class="narration">A small iron stove, a battered pot and a little space to work. Not much, but enough to put a meal on the table.</p>
            <p class="instruction">Cooking is not yet available.</p>
            <button type="button" class="pall-framed-button primary-choice" onclick={()=>kitchenOpen=false}>Continue</button>
          </aside>
        {:else if noticeExpanded}
          <aside class="home-dialogue notice" aria-label="Notice">
            <p class="eyebrow">{home.completed?'HOME · RENT':'NOTICE · STAGE VIII'}</p>
            <h1>{home.noticeTitle}</h1><p class="notice-text">{home.noticeText}</p>
            {#if home.phase==='NOTICE'}
              <button type="button" class="pall-framed-button primary-choice" disabled={pending}
                onclick={()=>{void perform('put_down');}}>Put the notice down</button>
            {:else}
              {#if home.completed}
                {#if home.rentPaid}
                  <p class="narration">You have paid the 150 coins demanded in the notice. No rent remains outstanding.</p>
                  <p class="instruction" role="status">Rent paid in full.</p>
                {:else}
                  <p class="narration">You read the notice again. You still owe 150 coins in rent.</p>
                  <p class="instruction">Rent due: {home.rent} coins. You have {home.coins} coins.</p>
                  {#if home.shortfall>0}<p class="instruction">You need {home.shortfall} more coins.</p>{/if}
                  <button type="button" class="pall-framed-button primary-choice" disabled={pending||home.shortfall>0}
                    onclick={()=>{void perform('pay_rent');}}>{pending?'Paying…':'Pay Rent'}</button>
                {/if}
              {/if}
              <button type="button" class="pall-framed-button secondary-choice"
                disabled={pending} onclick={()=>noticeExpanded=false}>Close notice</button>
            {/if}
          </aside>
        {:else if home.phase==='SPEECH'}
          <aside class="home-dialogue speech-panel" aria-label="Closing dialogue">
            <p class="eyebrow">RETURN HOME · STAGE VIII</p>
            <p class="narration stage-direction">You put the notice down.</p>
            <p class="speaker">{PLAYER_SPEAKER_LABEL}</p><p class="speech">“{home.closingSpeech}”</p>
            <button type="button" class="pall-framed-button primary-choice" disabled={pending}
              onclick={()=>{void perform('finish');}}>Continue</button>
          </aside>
        {:else if home.phase==='COMPLETE'}
          <aside class="home-dialogue completion" aria-label="Stage eight completion">
            <p class="eyebrow">STAGE VIII · COMPLETE</p>
            <h1>{home.origin+' opening complete.'}</h1>
            <p class="completion-copy">{homeCompletionSummary(home.origin)}</p>
            <p><strong>{home.coins} coins remaining. {home.rentPaid?'Rent paid in full.':'Rent notice: '+home.rent+' coins.'}</strong></p>
            <p class="prototype-note">The room is yours to use. Rest, inspect the kitchen or review the rent notice.</p>
            <a class="pall-framed-button primary-choice"
              href={'/characters/'+encodeURIComponent(id)+'/overview'}>
              Continue to Free Play
            </a>
          </aside>
        {/if}
      </div>
      {/if}
      {/snippet}
      </ActivityLayout>
      {#if errorMessage}<p role="alert" class="error">{errorMessage}</p>{/if}
    </section>
  </TutorialShell>
{:else}
  <main class="fallback" role="status">
    {#if status==='loading'}<h1>Returning home…</h1>
    {:else if status==='unauthorized'}<h1>Sign in required</h1><p><a href="/account">Account</a></p>
    {:else if status==='missing'}<h1>Character unavailable</h1>
    {:else if status==='schema'}<h1>Stage 8 database missing</h1><p>Run npm run home:migrate.</p>
    {:else if status==='prerequisite'}<h1>Finish the clinic first</h1>
    {:else}<h1>Home unavailable</h1><p>{errorMessage}</p>
      <button type="button" onclick={()=>{void refresh(id);}}>Retry</button>{/if}
    <a href={'/characters/'+encodeURIComponent(id)}>Character</a>
  </main>
{/if}
<style>
  :global(body){background:#151515;color:#f2e1c9}
  /* The room is the scene stage at its native 1672:941 ratio
     (pall-story-landscape). The art layer keeps its cover-scaled sizing, so
     its percentage-based chest, bed, journal and notice targets stay
     registered to the same pixel-space as the painted objects. */
  .stage8{min-width:0;background:#1a1816}
  .home-scene{position:relative;box-sizing:border-box;width:100%;
    overflow:hidden;container-type:size;isolation:isolate;background:#352d29}
  .home-artwork{position:absolute;left:50%;top:50%;isolation:isolate;
    transform:translate(-50%,-50%);
    width:max(100cqw,177.683cqh);aspect-ratio:1672/941;
    background:#352d29 url('/locations/home/rented-room.webp') center/100% 100% no-repeat}
  .home-artwork::after{content:'';position:absolute;inset:0;pointer-events:none;
    background:linear-gradient(90deg,#0908072b,transparent 37%),linear-gradient(0deg,#0807063d,transparent 40%)}
  /* Exact dialogue-frame slices, inner spacing, typeface and hierarchy from
     Stage 7 clinic and Stage 5 wage-claim, not a new oversized parchment UI.
     It lives in the reading column: content-height, no internal scrollbar. */
  .reading-column{flex-direction:column;align-items:stretch}
  .home-dialogue{position:relative;
    box-sizing:border-box;width:100%;min-width:0;max-height:none;overflow:visible;
    background:transparent;color:#2b1c11;
    border:solid transparent;border-width:21px 25px 20px;
    border-image-source:url('/ui-kit/frames/dialogue-frame-trim.png');
    border-image-slice:145 190 125 190 fill;
    border-image-width:21px 25px 20px;border-image-repeat:stretch;
    margin:0;padding:10px 15px 12px;filter:drop-shadow(0 6px 8px #0008)}
  .home-dialogue .eyebrow,.home-dialogue .speaker{
    font:600 var(--dialogue-label,15px)/1.2 var(--pall-font-label,'Arial Narrow',sans-serif);
    letter-spacing:.065em;color:#382416;margin:0 0 10px}
  .home-dialogue h1{margin:0 0 12px;
    font:600 var(--dialogue-title,21px)/1.3 var(--pall-font-reading,Georgia,serif);color:#2b1b12}
  .home-dialogue .narration,.home-dialogue .speech,.home-dialogue .instruction,
  .home-dialogue .notice-text,.home-dialogue .completion-copy{
    font:var(--dialogue-text,17px)/1.55 var(--pall-font-reading,Georgia,serif);
    color:#21150e;margin:0 0 13px}
  .home-dialogue .speech{font-weight:600}
  .home-dialogue .narration{color:#302016}
  .home-dialogue .stage-direction{font-style:italic}
  .home-dialogue .instruction{font-weight:700}
  .home-dialogue .speaker{margin:10px 0 5px}
  .home-dialogue .prototype-note{font:12px/1.45 var(--pall-font-reading,Georgia,serif);
    color:#654a38;margin:0 0 13px}
  .home-dialogue .pall-framed-button{display:inline-flex;margin:3px 0 8px;
    min-height:42px;align-items:center;justify-content:center}
  /* The objects are the targets. No debug-style coloured hitbox appears on
     hover: a small amber point and an unobtrusive name identify interaction. */
  .hotspot{position:absolute;z-index:5;cursor:pointer;background:transparent;
    border:0;outline:0;color:#e9d0a4;padding:0;isolation:isolate}
  .hotspot:disabled{opacity:.5;cursor:wait}
  .hotspot:not(.notice-object)::after{content:'';position:absolute;top:52%;left:50%;
    width:21px;height:21px;border:1px solid #f0ce8c;border-radius:50%;
    background:radial-gradient(circle,#f4d9a799 0 17%,#f4d9a844 24%,transparent 65%);
    box-shadow:0 0 10px #f1c77a88;pointer-events:none;opacity:0;
    transform:translate(-50%,-50%) scale(.65);
    transition:opacity .16s ease,transform .16s ease}
  .hotspot:not(.notice-object):is(:hover,:focus-visible)::after{
    opacity:1;transform:translate(-50%,-50%) scale(1)}
  .hotspot .object-caption{position:absolute;z-index:3;bottom:-25px;left:50%;
    transform:translate(-50%,4px);pointer-events:none;opacity:0;
    padding:3px 9px;border:1px solid #ad814c;border-radius:2px;
    background:#241b14f2;color:#f0d5a4;white-space:nowrap;
    font:700 clamp(11px,.87vw,13px)/1.15 Georgia,serif;
    box-shadow:0 2px 7px #0008;
    transition:opacity .16s ease,transform .16s ease}
  .hotspot:is(:hover,:focus-visible) .object-caption{
    opacity:1;transform:translate(-50%,0)}
  .hotspot:focus-visible .object-caption{outline:2px solid #f3d18a;outline-offset:2px}
  .chest{left:1%;top:64%;width:19%;height:25%}
  .book{left:63%;top:68%;width:11%;height:11%}
  .bed{left:14%;top:39%;width:31%;height:25%}
  .kitchen{left:76%;top:37%;width:20%;height:28%}
  .notice-object{left:50%;top:65%;width:12%;height:15%;
    display:grid;place-items:center}
  .notice-object img{width:100%;height:100%;object-fit:contain;
    transform:rotate(-5deg) scale(1);filter:drop-shadow(0 5px 5px #0008);
    transition:transform .16s ease,filter .16s ease;pointer-events:none}
  .notice-object:is(:hover,:focus-visible) img{
    transform:rotate(-5deg) scale(1.085);
    filter:brightness(1.1) drop-shadow(0 0 7px #e4bc7488) drop-shadow(0 5px 5px #0008)}
  .rest-fade{position:absolute;inset:0;z-index:15;pointer-events:none;
    background:#000;animation:rest-room-fade 1s ease-in-out both}
  @keyframes rest-room-fade{
    0%{opacity:0}48%{opacity:1}100%{opacity:0}
  }
  @media(prefers-reduced-motion:reduce){
    .rest-fade{animation:none;opacity:0}
  }
  .status-message,.error{margin:0;padding:10px 15px;background:#362b1d;color:#e7d3b3}
  .error{color:#efaaa2;background:#472222}
  .fallback{max-width:700px;margin:8vh auto;padding:30px;color:#ecd9b7;background:#28231e}
  /* Narrow stage (by its own width): the whole room is always visible, so
     only the small journal and notice targets grow to a tappable size. */
  @container activity-stage (max-width:600px){
    .book{min-height:36px}
    .notice-object{min-height:36px}
    .hotspot .object-caption{font-size:11px;padding:2px 5px}
    .chest .object-caption,.kitchen .object-caption{bottom:auto;top:-22px}
  }
  @container activity-panel (max-width:420px){
    .home-dialogue{border-width:17px 18px 17px;
      border-image-width:17px 18px 17px;padding:8px 11px}
  }
</style>
