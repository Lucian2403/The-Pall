<script lang="ts">
  import {onMount,tick,getContext} from 'svelte';
  import {page} from '$app/state';
  import TutorialShell from '$lib/TutorialShell.svelte';
  import {SCENE_JOURNAL_CONTEXT,type SceneJournalRegistrar} from '$lib/scene-journal';

  type Phase='HOME'|'NOTICE'|'SPEECH'|'COMPLETE';
  type Action='read_notice'|'put_down'|'finish'|'rest';
  type Home={stage:8;revision:number;phase:Phase;homeId:string;origin:string;
    branch:'restamp'|'contracts'|'records';outcome:'player_victory'|'player_defeat';
    characterName:string;coins:number;rent:number;shortfall:number;
    noticeTitle:string;noticeText:string;closingSpeech:string;completed:boolean;
    condition:{stamina:number;composure:number;fatigue:number;stress:number}};
  type Character={id:string;name:string;origin:string;sex:string;avatarId?:string|null;
    coins:number;health:{current:number;maximum:number};startingLocation:string;
    tutorial:{stage:number;status:string}};
  const id=$derived(page.params.id);
  const api=$derived('/api/characters/'+encodeURIComponent(id)+'/tutorial/home');
  let character=$state<Character|null>(null);
  let home=$state<Home|null>(null);
  let status=$state<'loading'|'ready'|'unauthorized'|'missing'|'prerequisite'|'schema'|'error'>('loading');
  let pending=$state(false),errorMessage=$state(''),chestMessage=$state(''),restMessage=$state('');
  let noticeExpanded=$state(false),journalOpen=$state(false);
  let journalElement:HTMLElement|undefined;
  let retryKey:string|null=null,retryId:string|null=null;
  const registerSceneJournal=getContext<SceneJournalRegistrar|undefined>(SCENE_JOURNAL_CONTEXT);
  $effect(()=>{
    registerSceneJournal?.({id:'home-journal',open:journalOpen,toggle:()=>{void toggleJournal();}});
    return ()=>registerSceneJournal?.(null);
  });
  const routeEntry=$derived(home?.branch==='restamp'
    ?'The depot recorded metal plates, though the original manifest called them a transfer of workers.'
    :home?.branch==='contracts'
      ?'Two contradictory official classifications were sealed for the same dead worker number. I lodged an objection.'
      :home?.branch==='records'
        ?'The cancelled worker number appears in a later wage tally. A correction in the records had been scraped away.':null);
  const combatEntry=$derived(home?.outcome==='player_victory'
    ?'Flint backed away from the passage after our fight.'
    :home?.outcome==='player_defeat'
      ?'Flint beat me. Another worker helped me get to the clinic.':null);
  async function toggleJournal(){
    journalOpen=!journalOpen;await tick();
    if(journalOpen)journalElement?.scrollIntoView({block:'start',behavior:'smooth'});
  }
  async function refresh(){
    status='loading';errorMessage='';restMessage='';
    try{
      const [c,r]=await Promise.all([
        fetch('/api/characters/'+encodeURIComponent(id),{cache:'no-store'}),
        fetch(api,{cache:'no-store'})]);
      if(c.status===401||r.status===401){status='unauthorized';return;}
      if(c.status===404||r.status===404){status='missing';return;}
      if(r.status===503){status='schema';return;}
      if(r.status===409){status='prerequisite';return;}
      if(!c.ok||!r.ok)throw Error('home_unavailable');
      character=(await c.json() as {character:Character}).character;
      const result=await r.json() as Home|{needsStart:true};
      if('needsStart' in result){
        const started=await fetch(api,{method:'POST',headers:{'content-type':'application/json'},
          body:JSON.stringify({kind:'start',requestId:crypto.randomUUID()})});
        if(!started.ok)throw Error('home_start_failed');
        home=await started.json() as Home;
      }else home=result;
      noticeExpanded=home.phase==='NOTICE';
      if(character&&home)character={...character,tutorial:{stage:8,
        status:home.completed?'COMPLETED':'IN_PROGRESS'}};
      status='ready';
    }catch(e){errorMessage=e instanceof Error?e.message:'Home unavailable';status='error';}
  }
  onMount(()=>{void refresh();});
  async function perform(action:Action){
    if(pending||!home||(home.completed&&action!=='rest'))return;
    const key=home.revision+':'+action;
    if(key!==retryKey||!retryId){retryKey=key;retryId=crypto.randomUUID();}
    pending=true;errorMessage='';
    try{
      const response=await fetch(api,{method:'POST',headers:{'content-type':'application/json'},
        body:JSON.stringify({kind:'action',action,requestId:retryId,expectedRevision:home.revision})});
      if(response.status===409){
        retryId=null;retryKey=null;
        const latest=await fetch(api,{cache:'no-store'});
        if(latest.ok){home=await latest.json() as Home;noticeExpanded=home.phase==='NOTICE';}
        errorMessage='The saved scene changed. Current progress has been reloaded.';
        return;
      }
      if(!response.ok)throw Error('home_action_failed');
      home=await response.json() as Home;
      noticeExpanded=home.phase==='NOTICE';
      restMessage=action==='rest'
        ?'Rested. Stamina and Composure are full; Fatigue and Stress cleared.'
        :'';
      retryId=null;retryKey=null;
      if(character)character={...character,tutorial:{stage:8,status:home.completed?'COMPLETED':'IN_PROGRESS'}};
    }catch{errorMessage='Connection interrupted. Retry the same action; it cannot complete twice.';}
    finally{pending=false;}
  }
  function interactNotice(){
    if(pending||!home)return;
    if(home.phase==='HOME')void perform('read_notice');
    else if(['NOTICE','SPEECH','COMPLETE'].includes(home.phase))noticeExpanded=true;
  }
</script>
<svelte:head><title>The Pall — Return Home</title></svelte:head>
{#if status==='ready'&&character&&home}
  <TutorialShell {character} sceneStage={8} sceneLocation="Shared rented home">
    <section class="stage8" aria-label="Stage 8 shared rented home">
      <div class="home-scene" aria-label="A modest rented room in Grand Cylinder City">
        <button type="button" class="hotspot chest" aria-label="Storage"
          title="Storage" onclick={()=>chestMessage='Storage will be added with the Inventory and Equipment system.'}>
          <span class="object-caption">Storage</span>
        </button>
        <button type="button" class="hotspot book" aria-label="Read journal"
          title="Journal" data-pall-sfx="paper"
          onclick={()=>{void toggleJournal();}}>
          <span class="object-caption">Journal</span>
        </button>
        <button type="button" class="hotspot notice-object" aria-label="Read notice"
          title="Notice" data-pall-sfx="paper" onclick={interactNotice}>
          <img src="/locations/home/notice.webp" alt="" width="150" height="100"
            draggable="false" />
          <span class="object-caption">Notice</span>
        </button>
        <button type="button" class="hotspot bed" aria-label="Rest in bed"
          title="Rest — restore Stamina and Composure, clear Fatigue and Stress"
          disabled={pending} onclick={()=>{void perform('rest');}}>
          <span class="object-caption">Rest</span>
        </button>
        {#if restMessage}<p class="rest-message" role="status">{restMessage}</p>{/if}
        {#if home.phase==='HOME'}
          <aside class="home-dialogue" aria-label="Return home dialogue">
            <p class="eyebrow">RETURN HOME · STAGE VIII</p>
            <h1>Home</h1>
            <p class="narration">You return to your rented home. A notice lies on the table.</p>
            <p class="instruction">Read the notice on the table.</p>
          </aside>
        {:else if noticeExpanded}
          <aside class="home-dialogue notice" aria-label="Notice">
            <p class="eyebrow">NOTICE · STAGE VIII</p>
            <h1>{home.noticeTitle}</h1><p class="notice-text">{home.noticeText}</p>
            {#if home.phase==='NOTICE'}
              <button type="button" class="pall-framed-button" disabled={pending}
                onclick={()=>{void perform('put_down');}}>Put the notice down</button>
            {:else}
              <button type="button" class="pall-framed-button"
                onclick={()=>noticeExpanded=false}>Close notice</button>
            {/if}
          </aside>
        {:else if home.phase==='SPEECH'}
          <aside class="home-dialogue speech-panel" aria-label="Closing dialogue">
            <p class="eyebrow">RETURN HOME · STAGE VIII</p>
            <p class="narration stage-direction">You put the notice down.</p>
            <p class="speaker">YOU</p><p class="speech">“{home.closingSpeech}”</p>
            <button type="button" class="pall-framed-button" disabled={pending}
              onclick={()=>{void perform('finish');}}>Continue</button>
          </aside>
        {:else if home.phase==='COMPLETE'}
          <aside class="home-dialogue completion" aria-label="Stage eight completion">
            <p class="eyebrow">STAGE VIII · COMPLETE</p><h1>Millhand opening complete.</h1>
            <p>The council has not paid for the plate lot. The dispute over the worker number remains unresolved.</p>
            <p><strong>{home.coins} coins remaining. Rent notice: {home.rent} coins.</strong></p>
            <p class="prototype-note">The opening is complete. Further game systems are not available in this prototype.</p>
          </aside>
        {/if}
      </div>

      {#if chestMessage}<p role="status" class="status-message">{chestMessage}</p>{/if}
      {#if errorMessage}<p role="alert" class="error">{errorMessage}</p>{/if}
      {#if journalOpen}
        <section id="home-journal" bind:this={journalElement} class="journal"
          aria-label="Personal Journal">
          <header class="journal-heading"><div><small>YOUR RECORD</small><h2>Personal Journal</h2></div>
            <button class="pall-framed-button" type="button" data-pall-sfx="paper"
              onclick={()=>{void toggleJournal();}}>Close journal</button>
          </header>
          <div class="journal-body">
            <p>Home at last. Ten coins left after the clinic, and now the rent is a hundred and fifty. Lovely. Two jobs, no wages, and a fight with Flint on top of it. Need to find some work that actually pays.</p>
            {#if routeEntry}<p>{routeEntry}</p>{/if}
            {#if combatEntry}<p>{combatEntry}</p>{/if}
          </div>
        </section>
      {/if}
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
      <button type="button" onclick={()=>{void refresh();}}>Retry</button>{/if}
    <a href={'/characters/'+encodeURIComponent(id)}>Character</a>
  </main>
{/if}
<style>
  :global(body){background:#151515;color:#f2e1c9}
  .stage8{min-width:0;background:#1a1816}
  .home-scene{position:relative;width:100%;aspect-ratio:1672/941;isolation:isolate;
    background:#352d29 url('/locations/home/rented-room.webp') center/100% 100% no-repeat}
  .home-scene::after{content:'';position:absolute;inset:0;pointer-events:none;
    background:linear-gradient(90deg,#0908072b,transparent 37%),linear-gradient(0deg,#0807063d,transparent 40%)}
  /* Exact dialogue-frame slices, inner spacing, typeface and hierarchy from
     Stage 7 clinic and Stage 5 wage-claim, not a new oversized parchment UI. */
  .home-dialogue{position:absolute;z-index:8;top:3.5%;right:2.4%;
    box-sizing:border-box;width:min(46%,650px);max-height:91%;overflow-y:auto;
    background:transparent;color:#2b1c11;
    border:solid transparent;border-width:21px 25px 20px;
    border-image-source:url('/ui-kit/frames/dialogue-frame-trim.png');
    border-image-slice:145 190 125 190 fill;
    border-image-width:21px 25px 20px;border-image-repeat:stretch;
    margin:0;padding:10px 15px 12px;filter:drop-shadow(0 6px 8px #0008)}
  .home-dialogue .eyebrow,.home-dialogue .speaker{
    font:600 14px/1.2 var(--pall-font-label,'Arial Narrow',sans-serif);
    letter-spacing:.065em;color:#382416;margin:0 0 10px}
  .home-dialogue h1{margin:0 0 12px;
    font:600 26px/1.25 var(--pall-font-reading,Georgia,serif);color:#2b1b12}
  .home-dialogue .narration,.home-dialogue .speech,.home-dialogue .instruction,
  .home-dialogue .notice-text,.home-dialogue .completion-copy{
    font:16px/1.45 var(--pall-font-reading,Georgia,serif);
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
  .notice-object{left:50%;top:65%;width:12%;height:15%;
    display:grid;place-items:center}
  .notice-object img{width:100%;height:100%;object-fit:contain;
    transform:rotate(-5deg) scale(1);filter:drop-shadow(0 5px 5px #0008);
    transition:transform .16s ease,filter .16s ease;pointer-events:none}
  .notice-object:is(:hover,:focus-visible) img{
    transform:rotate(-5deg) scale(1.085);
    filter:brightness(1.1) drop-shadow(0 0 7px #e4bc7488) drop-shadow(0 5px 5px #0008)}
  .rest-message{position:absolute;bottom:3%;left:2%;z-index:9;
    max-width:min(60%,450px);box-sizing:border-box;margin:0;
    padding:9px 13px;border:1px solid #97734a;border-radius:2px;
    background:#251c17eb;color:#edd9b7;
    font:600 13px/1.4 Georgia,serif;box-shadow:0 4px 12px #000a}
  .status-message,.error{margin:0;padding:10px 15px;background:#362b1d;color:#e7d3b3}
  .error{color:#efaaa2;background:#472222}
  .journal{padding:20px clamp(15px,3vw,44px);scroll-margin-top:65px;
    background:#e6d5b5;color:#24160e;border-top:2px solid #94704a}
  .journal-heading{display:flex;align-items:center;justify-content:space-between;gap:12px;
    margin:0 auto 15px;max-width:960px}
  .journal-heading h2{font:600 24px Georgia,serif;margin:5px 0}
  .journal-heading small{font:700 12px Arial,sans-serif;letter-spacing:.1em}
  .journal-body{max-width:960px;margin:auto;font:600 16px/1.55 Georgia,serif}
  .journal-body p{margin:0 0 12px}
  .fallback{max-width:700px;margin:8vh auto;padding:30px;color:#ecd9b7;background:#28231e}
  @media(max-width:950px){
    .home-scene{aspect-ratio:auto;min-height:660px;display:flex;
      flex-direction:column;gap:14px;padding:22px 14px;align-items:flex-end;
      background-position:center;background-size:cover}
    .home-dialogue{position:relative;top:auto;right:auto;bottom:auto;
      left:auto;width:min(100%,590px);max-height:none;overflow:visible}
  }
  @media(max-width:650px){
    .home-scene{min-height:620px;padding:12px 8px;align-items:stretch;
      background-size:cover;background-position:48% center}
    .home-dialogue{width:100%;border-width:17px 18px 17px;
      border-image-width:17px 18px 17px;padding:8px 11px}
    .home-dialogue .narration,.home-dialogue .speech,.home-dialogue .instruction,
    .home-dialogue .notice-text{font-size:14px}
    .home-dialogue .eyebrow,.home-dialogue .speaker{font-size:12px}
    .home-dialogue h1{font-size:22px}
    .hotspot .object-caption{font-size:11px;padding:2px 5px}
    .rest-message{bottom:2%;max-width:90%;font-size:11px}
  }
</style>
