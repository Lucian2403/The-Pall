<script lang="ts">
  import {onMount} from 'svelte';
  import {goto} from '$app/navigation';
  import {page} from '$app/state';
  import TutorialShell from '$lib/TutorialShell.svelte';
  import BellrunnerHectorConversation from '$lib/BellrunnerHectorConversation.svelte';
  import BellrunnerDocumentTray from '$lib/BellrunnerDocumentTray.svelte';
  import {HAULING_SCENES} from '$lib/hauling-scenes';
  import {BELLRUNNER_ROUTE_NARRATION,BELLRUNNER_RECEIVING_ARRIVAL,
    BELLRUNNER_RECEIVER_OPENING,BELLRUNNER_RECEIVER_RESOLUTIONS}
    from '$lib/bellrunner-stage2-narrative';
  import '$lib/workshop-object-labels.css';
  import '$lib/pall-story-landscape.css';

  type Character={
    id:string;name:string;origin:string;sex:string;coins:number;
    health:{current:number;maximum:number};startingLocation:string;
    tutorial:{stage:number;status:string}
  };
  type PaperKey='notices'|'sealed'|'route';
  type Phase='issued'|'checked'|'road_chosen'|'receiving_arrival'|'spoiled_mark'|'book_checked'|
    'receiver_reply'|'receiver_result'|'round_report'|'final_notice'|'final_notice_taken';
  type WorkAction='check_round'|'sort_notices'|'take_direct_road'|'take_quieter_road'|
    'deliver_notices'|'continue_to_receiver'|'ask_fresh_mark'|'check_receiving_book'|'confirm_book'|
    'note_spoiled_mark'|'continue_receiver_dialogue'|'continue_to_final_notice'|'continue_to_report'|
    'finish_round'|'take_final_notice';
  type WorkState={phase:Phase;route:'direct'|'quieter'|null;
    noticesOrdered:boolean;receipt:'clear'|'book_confirmed'|'noted_unclear'|null};
  type Round={stage:number;tutorialStatus:string;accepted:boolean;
    revision:number;workState:WorkState|null;work:string;skill:string;payment:string;
    tutorialPayout:{coins:number;ordinaryXp:number;items:number}};
  const docs:Record<PaperKey,{label:string;src:string;description:string}>={
    notices:{
      label:'Council notices',src:'/locations/bellrunner/council-work.webp',
      description:'Council shift notices, to be checked against the destinations on the route sheet.'
    },
    sealed:{
      label:'Sealed council order',src:'/locations/bellrunner/sealed-order.webp',
      description:'The last council order is still tied and sealed. Nothing inside has been read.'
    },
    route:{
      label:'Route sheet',src:'/locations/bellrunner/route-sheet.webp',
      description:'A sheet for the marked stops and their receiving marks. A blurred mark must be accounted for truthfully.'
    }
  };
  const id=$derived(page.params.id);
  let character=$state<Character|null>(null);
  let round=$state<Round|null>(null);
  let status=$state<'loading'|'ready'|'login'|'missing'|'schema'|'unavailable'>('loading');
  let selected=$state<PaperKey|null>(null);
  let talkingToHector=$state(false);
  let busy=$state(false);
  let workError=$state('');
  let pendingId:string|null=null;
  let pendingAction:WorkAction|null=null;
  const phase=$derived(round?.workState?.phase??'issued');
  // Use one reusable Hauling location at a time. Hector and the Depot
  // paperwork never follow the character into the street or receiving desk.
  const sceneKey=$derived(phase==='issued'||phase==='checked'
    ?'depot'
    :phase==='road_chosen'
      ?(round?.workState?.route==='direct'?'short_route':'long_route')
      :'receiving_desk');
  const routeCopy=$derived(round?.workState?.route==='direct'
    ?'Short Route — the freight-yard back streets'
    :round?.workState?.route==='quieter'
      ?'Long Route — the main roads':'Not chosen');
  const routeNarration=$derived(round?.workState?.route
    ?BELLRUNNER_ROUTE_NARRATION[round.workState.route]:null);
  const receiverDialogue=$derived(round?.workState?.receipt
    ?BELLRUNNER_RECEIVER_RESOLUTIONS[round.workState.receipt]:null);
  const receiptCopy=$derived(round?.workState?.receipt==='clear'
    ?'Clear fresh receiving mark'
    :round?.workState?.receipt==='book_confirmed'
      ?'Confirmed against the receiving book'
      :round?.workState?.receipt==='noted_unclear'
        ?'Spoiled mark honestly recorded':'Pending');

  async function refresh(){
    const response=await fetch('/api/characters/'+encodeURIComponent(id)+
      '/bellrunner/dispatch',{cache:'no-store'});
    if(response.ok)round=await response.json() as Round;
  }
  async function perform(action:WorkAction){
    if(busy||!round||!round.accepted||!round.workState)return;
    busy=true;workError='';
    if(pendingAction!==action){pendingAction=action;pendingId=crypto.randomUUID();}
    try{
      const response=await fetch('/api/characters/'+encodeURIComponent(id)+
        '/bellrunner/dispatch/work',{
          method:'POST',headers:{'content-type':'application/json'},
          body:JSON.stringify({action,requestId:pendingId,expectedRevision:round.revision})
        });
      if(response.ok){
        round=await response.json() as Round;
        pendingId=null;pendingAction=null;selected=null;
      }else{
        const data=await response.json() as {error?:string};
        if(response.status===409&&data.error==='stale_revision'){
          await refresh();pendingId=null;pendingAction=null;
          workError='Your dispatch was updated elsewhere. Review the current step.';
        }else{
          if(response.status===409&&data.error==='invalid_work_phase')await refresh();
          pendingId=null;pendingAction=null;
          workError=data.error==='bellrunner_migration_required'
            ?'Run npm run bellrunner:migrate and restart the API.'
            :'Could not record this work step: '+(data.error??response.status);
        }
      }
    }catch{
      workError='Connection interrupted. Retry this action; saved work will not be duplicated.';
    }finally{busy=false;}
  }
  onMount(()=>{
    void(async()=>{
      try{
        const [c,r]=await Promise.all([
          fetch('/api/characters/'+encodeURIComponent(id),{cache:'no-store'}),
          fetch('/api/characters/'+encodeURIComponent(id)+'/bellrunner/dispatch',{cache:'no-store'})
        ]);
        if(c.status===401||r.status===401){status='login';return;}
        if(c.status===404||r.status===404){status='missing';return;}
        if(r.status===503){status='schema';return;}
        if(!c.ok||!r.ok){status='unavailable';return;}
        character=(await c.json() as {character:Character}).character;
        round=await r.json() as Round;
        if(character.origin!=='Bellrunner'||round.stage!==2||!round.accepted){
          if(round.stage===1)await goto('/characters/'+encodeURIComponent(id)+'/opening',{replaceState:true});
          else status='unavailable';
          return;
        }
        status='ready';
      }catch{status='unavailable';}
    })();
  });
</script>

<svelte:head><title>The Pall — Shift Dispatch</title></svelte:head>
{#if status==='ready'&&character&&round&&round.workState}
  <TutorialShell {character} sceneLocation={HAULING_SCENES[sceneKey].label}
    depotBackdrop={sceneKey==='depot'}>
    <section class="workshop dispatch" aria-label="Bellrunner Stage 2 Shift Dispatch">
      <div class="scene pall-story-sections" class:receiving={sceneKey==='receiving_desk'}>
        <section class="scene-visuals pall-story-visuals"
          aria-label={HAULING_SCENES[sceneKey].label+' illustrated scene'}>
          <div class="illustration pall-story-landscape"
            aria-label={HAULING_SCENES[sceneKey].label}>
          {#if sceneKey==='depot'}
            <!-- The original working Depot and its foreground stay together. -->
            <img class="environment" src={HAULING_SCENES.depot.src}
              alt={HAULING_SCENES.depot.alt} draggable="false"/>
            <img class="hector" src="/characters/hector/hector-d-smoke.webp"
              alt="Hector D. Smoke by the dispatch counter" draggable="false"/>
            <img class="environment foreground" src={HAULING_SCENES.depot.src}
              alt="" aria-hidden="true" draggable="false"/>
            <button type="button" class="npc-hotspot" title="Talk to Hector D. Smoke"
              aria-label="Talk to Hector D. Smoke"
              onclick={()=>{selected=null;talkingToHector=true;}}>
              <span class="workshop-npc-label">Hector D. Smoke</span>
            </button>
          {:else}
            <!-- Complete original painting, fitted to the native-ratio scene.
                 Streets and reception have no interactive overlays. -->
            <div class="art-scaled">
              <img class="environment" src={HAULING_SCENES[sceneKey].src}
                alt={HAULING_SCENES[sceneKey].alt} draggable="false"/>
              <!-- Receiver Desk is a location painting, not an object grid.
                   Every delivery and receiving-book choice stays in dialogue. -->
            </div>
          {/if}
          </div>
          {#if sceneKey==='depot'}
            <BellrunnerDocumentTray papers={docs}
              onChoose={(key)=>{
                talkingToHector=false;
                selected=selected===key?null:key;
              }} {selected}/>
          {/if}
        </section>

        <section class="dialogue-section pall-story-dialogue-section"
          aria-label="Shift Dispatch dialogue and choices">
        <aside class="work-card" aria-label={selected?'Dispatch paper inspection':
          talkingToHector?'Hector D. Smoke conversation':'Shift Dispatch work'}>
          {#if selected&&sceneKey==='depot'}
            <p class="eyebrow">DISPATCH HOUSE · PAPER INSPECTION</p>
            <h1>{docs[selected].label}</h1>
            <p class="story">{docs[selected].description}</p>
            <div class="actions">
              <button type="button" onclick={()=>{selected=null;}}>Return to the round</button>
            </div>
          {:else if talkingToHector&&sceneKey==='depot'}
            <BellrunnerHectorConversation characterName={character.name}
              returnToRound={()=>{talkingToHector=false;}}/>
          {:else}
          <p class="eyebrow">SHIFT DISPATCH · INDUSTRY / HAULING</p>
          {#if phase==='issued'||phase==='checked'}
            <h1>Choose the road</h1>
            <p class="story">You've got the route sheet and the notices.
              The same deliveries lie ahead, whichever way you go.</p>
            <div class="actions">
              <p class="route-note"><strong>Short Route:</strong> Through the narrow
                back streets behind the freight yards. Less walking, more
                risk of trouble in the alleys.</p>
              <button type="button" disabled={busy}
                onclick={()=>{void perform('take_direct_road');}}>Take the Short Route</button>
              <p class="route-note"><strong>Long Route:</strong> Along the main
                roads. More walking, traffic and crowds, but more people and
                better visibility.</p>
              <button type="button" disabled={busy}
                onclick={()=>{void perform('take_quieter_road');}}>Take the Long Route</button>
            </div>
          {:else if phase==='road_chosen'}
            <h1>{round.workState.route==='direct'?'The Short Route':'The Long Route'}</h1>
            {#if routeNarration}
              {#each routeNarration as paragraph,i (i)}
                <p class="inner-voice">{paragraph}</p>
              {/each}
            {/if}
            <div class="actions">
              <button type="button" disabled={busy}
                onclick={()=>{void perform('deliver_notices');}}>Continue to the delivery</button>
            </div>
          {:else if phase==='receiving_arrival'}
            <h1>A spoiled mark</h1>
            {#each BELLRUNNER_RECEIVING_ARRIVAL as paragraph,i (i)}
              <p class="story">{paragraph}</p>
            {/each}
            <div class="actions">
              <button type="button" disabled={busy}
                onclick={()=>{void perform('continue_to_receiver');}}>Continue</button>
            </div>
          {:else if phase==='spoiled_mark'}
            <p class="speaker">RECEIVER</p>
            {#each BELLRUNNER_RECEIVER_OPENING as line,i (i)}
              <p class="spoken">“{line}”</p>
            {/each}
            <div class="actions">
              <button type="button" disabled={busy}
                onclick={()=>{void perform('ask_fresh_mark');}}>Ask for a fresh mark</button>
              <button type="button" disabled={busy} data-pall-sfx="paper"
                onclick={()=>{void perform('check_receiving_book');}}>Check their receiving book</button>
              <button type="button" disabled={busy} data-pall-sfx="paper"
                onclick={()=>{void perform('note_spoiled_mark');}}>Note the spoiled mark and go on</button>
            </div>
          {:else if phase==='book_checked'}
            <!-- Compatibility for saved rounds from the older Stage 2 design.
                 A new player goes straight from the choice to its RP dialogue. -->
            <h1>Receiving book</h1>
            <p class="story">The entry matches the notice you delivered.
              You can note that confirmation or request a clearer mark.</p>
            <div class="actions">
              <button type="button" disabled={busy} data-pall-sfx="paper"
                onclick={()=>{void perform('confirm_book');}}>Record the book confirmation</button>
              <button type="button" disabled={busy}
                onclick={()=>{void perform('ask_fresh_mark');}}>Ask for a fresh mark</button>
              <button type="button" disabled={busy} data-pall-sfx="paper"
                onclick={()=>{void perform('note_spoiled_mark');}}>Note the unclear mark</button>
            </div>
          {:else if phase==='receiver_reply'&&receiverDialogue}
            <p class="eyebrow">{character.name.toUpperCase()}</p>
            <p class="spoken">“{receiverDialogue.player}”</p>
            <div class="actions">
              <button type="button" disabled={busy}
                onclick={()=>{void perform('continue_receiver_dialogue');}}>Continue</button>
            </div>
          {:else if phase==='receiver_result'&&receiverDialogue}
            <p class="speaker">RECEIVER</p>
            <p class="spoken">“{receiverDialogue.receiver}”</p>
            <p class="story">{receiverDialogue.outcome}</p>
            {#if receiverDialogue.extraPlayer}
              <p class="speaker">{character.name.toUpperCase()}</p>
              <p class="spoken">“{receiverDialogue.extraPlayer}”</p>
            {/if}
            <div class="actions">
              <button type="button" disabled={busy} data-pall-sfx="paper"
                onclick={()=>{void perform('continue_to_final_notice');}}>Continue to the final notice</button>
            </div>
          {:else if phase==='round_report'}
            <!-- A saved legacy report does not require the old extra screen. -->
            <h1>The final notice</h1>
            <p class="story">The ordinary deliveries are finished.
              One sealed council order still needs to reach the address on your route sheet.</p>
            <div class="actions">
              <button type="button" disabled={busy} data-pall-sfx="paper"
                onclick={()=>{void perform('finish_round');}}>Continue to the final notice</button>
            </div>
          {:else if phase==='final_notice'}
            <h1>The final notice</h1>
            <p class="story">The routine deliveries are recorded. One sealed council
              order remains to be presented at its marked address.</p>
            <div class="actions">
              <button type="button" disabled={busy} data-pall-sfx="paper"
                onclick={()=>{void perform('take_final_notice');}}>Take the final notice</button>
            </div>
          {:else}
            <h1>Final notice in hand</h1>
            <p class="story">The usual deliveries are done, and the receiving marks are recorded.
              One sealed council order remains. It still needs to be delivered to the address marked on the route sheet.</p>
            <p class="small">The next scene begins at the order's marked address.</p>
          {/if}
          {/if}
          {#if workError}<p class="error" role="alert">{workError}</p>{/if}
          {#if busy}<p class="small" role="status">Recording…</p>{/if}
        </aside>
        </section>
      </div>
    </section>
  </TutorialShell>
{:else}
  <main class="fallback" role="status">
    {#if status==='loading'}<h1>Checking your dispatch…</h1>
    {:else if status==='login'}<h1>Sign in required</h1>
    {:else if status==='schema'}<h1>Bellrunner database migration missing</h1><p>Run npm run bellrunner:migrate.</p>
    {:else if status==='missing'}<h1>Character not found</h1>
    {:else}<h1>Dispatch unavailable</h1>{/if}
    <a href="/characters">Character selection</a>
  </main>
{/if}

<style>
  .dispatch{display:flex;flex-direction:column;flex:1;min-width:0;width:100%;
    color:#f3e3ce;font-family:var(--pall-font-reading,Georgia,serif)}
  .scene,.scene-visuals{min-width:0}
  .illustration{position:relative;width:100%;aspect-ratio:1672/941;
    overflow:hidden;container-type:size}
  .art-scaled{position:absolute;inset:0;width:100%;height:100%}
  .environment{position:absolute;inset:0;width:100%;height:100%;
    object-fit:contain;pointer-events:none}
  .art-scaled>.environment{object-fit:contain}
  .hector{position:absolute;top:3%;left:7%;height:103%;max-width:43%;
    width:auto;object-fit:contain;object-position:bottom center;
    z-index:2;pointer-events:none;filter:drop-shadow(0 5px 7px #0a080577)}
  .foreground{z-index:3;clip-path:inset(93% 0 0 0)}
  .npc-hotspot{position:absolute;z-index:4;top:7%;left:6%;width:41%;height:86%;
    display:flex;align-items:end;justify-content:center;padding:0 0 6px;
    border:0;background:transparent;cursor:pointer}
  .npc-hotspot:focus-visible{outline:2px solid #efd092;outline-offset:2px}
  .work-card{position:relative;z-index:1;box-sizing:border-box;
    display:flex;flex-direction:column;flex:1;align-self:stretch;
    width:100%;max-width:980px;min-width:0;min-height:100%;margin:0 auto;max-height:none;overflow:visible;
    padding:clamp(20px,2.3vw,39px) clamp(19px,2.35vw,40px) 25px;
    border:2px solid #654022;border-radius:5px;
    background:#efdfbb;color:#251910;box-shadow:0 7px 15px #0008}
  .eyebrow{font:600 14px/1.25 var(--pall-font-label,'Arial Narrow',sans-serif);
    letter-spacing:.12em;color:#614029;margin:0 0 19px;padding-bottom:11px;
    border-bottom:1px solid #9e815955}
  h1{margin:0 0 16px;font:600 clamp(23px,1.8vw,30px)/1.3
    var(--pall-font-reading,Georgia,serif);color:#25170f}
  .story,.instruction,.route-note{font:600 clamp(16px,1.23vw,20px)/1.55
    var(--pall-font-reading,Georgia,serif);margin:0 0 17px;color:#251910}
  .instruction{font-weight:700}
  .route-note{font-size:14px;margin:9px 0 5px}
  .inner-voice{margin:0 0 17px;font:italic 600 clamp(16px,1.2vw,20px)/1.6
    var(--pall-font-reading,Georgia,serif);color:#322016}
  .speaker{margin:10px 0 12px;color:#5a3d27;
    font:700 11px/1.3 var(--pall-font-label,'Arial Narrow',sans-serif);
    letter-spacing:.08em}
  .spoken{margin:0 0 17px;color:#26180f;
    font:600 clamp(18px,1.35vw,23px)/1.55
    var(--pall-font-reading,Georgia,serif)}
  .actions{display:flex;flex-direction:column;gap:9px;margin-top:clamp(16px,2vw,30px)}
  .actions>button{display:block;width:100%;min-height:52px;text-align:left;
    background:#241d16;border:1px solid #6d5235;color:#f7e6c9;
    padding:10px 13px;font:600 clamp(15px,1.16vw,18px)/1.35
    var(--pall-font-reading,Georgia,serif);cursor:pointer}
  .actions>button:hover,.actions>button:focus-visible{
    background:#423022;outline:1px solid #c49d65}
  .actions>button:disabled{opacity:.55;cursor:wait}
  .round-summary{display:grid;gap:0;margin:8px 0 12px}
  .round-summary div{display:flex;align-items:start;justify-content:space-between;
    gap:10px;padding:5px 0;border-bottom:1px solid #b19b7d}
  .round-summary dt{font-weight:700}
  .round-summary dd{margin:0;text-align:right}
  .small{font:600 12px/1.45 Georgia,serif;color:#58412a}
  .error{font:13px/1.45 sans-serif;color:#873523}
  .fallback{padding:40px;color:#e3d0af;background:#25211e}
  @media(max-width:1160px){
    .work-card{min-height:0;padding:23px 24px}
    .story,.instruction,.inner-voice,.spoken{font-size:18px}
  }
  @media(max-width:700px){
    .scene{height:auto;min-height:0}
    .illustration{aspect-ratio:1672/941;container-type:normal}
    .art-scaled{inset:0;width:100%;height:100%}
    .hector{top:0;height:100%;max-width:43%;left:2%}
    .npc-hotspot{left:0;top:6%;width:47%;height:87%;padding-bottom:0}
    .work-card{min-height:0;padding:19px 14px}
    .story,.instruction,.inner-voice,.spoken{font-size:17px;line-height:1.55}
    .actions>button{font-size:16px;min-height:47px}
  }
</style>
