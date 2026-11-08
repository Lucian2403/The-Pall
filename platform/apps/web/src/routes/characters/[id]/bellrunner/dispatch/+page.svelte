<script lang="ts">
  import {onMount} from 'svelte';
  import {goto} from '$app/navigation';
  import {page} from '$app/state';
  import TutorialShell from '$lib/TutorialShell.svelte';
  import WorkshopItemPopover from '$lib/WorkshopItemPopover.svelte';
  import '$lib/workshop-object-labels.css';

  type Character={
    id:string;name:string;origin:string;sex:string;coins:number;
    health:{current:number;maximum:number};startingLocation:string;
    tutorial:{stage:number;status:string}
  };
  type PaperKey='notices'|'sealed'|'route';
  type Phase='issued'|'checked'|'road_chosen'|'spoiled_mark'|'book_checked'|
    'round_report'|'final_notice'|'final_notice_taken';
  type WorkAction='check_round'|'sort_notices'|'take_direct_road'|'take_quieter_road'|
    'deliver_notices'|'ask_fresh_mark'|'check_receiving_book'|'confirm_book'|
    'note_spoiled_mark'|'finish_round'|'take_final_notice';
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
  const paperKeys=['notices','sealed','route'] as const;
  const id=$derived(page.params.id);
  let character=$state<Character|null>(null);
  let round=$state<Round|null>(null);
  let status=$state<'loading'|'ready'|'login'|'missing'|'schema'|'unavailable'>('loading');
  let selected=$state<PaperKey|null>(null);
  let busy=$state(false);
  let workError=$state('');
  let pendingId:string|null=null;
  let pendingAction:WorkAction|null=null;
  const phase=$derived(round?.workState?.phase??'issued');
  const routeCopy=$derived(round?.workState?.route==='direct'
    ?'Direct road — shorter, busier, more carts'
    :round?.workState?.route==='quieter'
      ?'Quieter road — longer, less crowded': 'Not chosen');
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
  <TutorialShell {character} sceneLocation="Dispatch House" depotBackdrop>
    <section class="workshop dispatch" aria-label="Bellrunner Stage 2 Shift Dispatch">
      <div class="scene">
        <div class="illustration">
          <img class="environment" src="/locations/origins/bellrunner-depot.webp"
            alt="Dispatch House, council papers on the sorting counter" draggable="false"/>
          <img class="hector" src="/characters/hector/hector-d-smoke.webp"
            alt="Hector D. Smoke by the dispatch counter" draggable="false"/>
          <img class="environment foreground" src="/locations/origins/bellrunner-depot.webp"
            alt="" aria-hidden="true" draggable="false"/>
          {#each paperKeys as key}
            <img class="paper-art {key}" src={docs[key].src}
              alt="" aria-hidden="true" draggable="false"/>
            <button type="button" class="paper-target {key}" data-workshop-object
              data-pall-sfx="paper" aria-label={'Inspect '+docs[key].label}
              aria-pressed={selected===key}
              onclick={()=>{selected=selected===key?null:key;}}>
              <span class="workshop-object-label">{docs[key].label}</span>
            </button>
          {/each}
          {#if selected}
            <WorkshopItemPopover itemKey={selected} title={docs[selected].label}
              description={docs[selected].description} onClose={()=>{selected=null;}}/>
          {/if}
        </div>

        <aside class="work-card" aria-label="Shift Dispatch work">
          <p class="eyebrow">SHIFT DISPATCH · INDUSTRY / HAULING</p>
          {#if phase==='issued'}
            <h1>Check the round</h1>
            <p class="story">Hector pushes the bundle across the counter.</p>
            <p class="instruction">Council shift notices. Route sheet. Receiving marks required.</p>
            <p class="payment">Payment: {round.payment}.</p>
            <div class="actions">
              <button type="button" disabled={busy} data-pall-sfx="paper"
                onclick={()=>{void perform('check_round');}}>Inspect route and notices</button>
            </div>
          {:else if phase==='checked'}
            <h1>Choose the road</h1>
            <p class="story">The bundle is accounted for against the route sheet.
              You can put the notices in route order before setting off.</p>
            {#if round.workState.noticesOrdered}
              <p class="small">Notices sorted by their listed stops.</p>
            {/if}
            <div class="actions">
              {#if !round.workState.noticesOrdered}
                <button type="button" disabled={busy} data-pall-sfx="paper"
                  onclick={()=>{void perform('sort_notices');}}>Put the notices in route order</button>
              {/if}
              <p class="route-note"><strong>Direct road:</strong> Shorter, but packed with carts.
                Greater chance of delays and jostled papers.</p>
              <button type="button" disabled={busy}
                onclick={()=>{void perform('take_direct_road');}}>Take the direct road</button>
              <p class="route-note"><strong>Quieter road:</strong> Longer circuit, more room
                to carry the bundle undisturbed.</p>
              <button type="button" disabled={busy}
                onclick={()=>{void perform('take_quieter_road');}}>Take the quieter road</button>
            </div>
          {:else if phase==='road_chosen'}
            <h1>Make the deliveries</h1>
            <p class="story">{routeCopy}.</p>
            <p class="instruction">The marked routine stops are ahead. Each notice
              needs a receiving mark from whoever takes it.</p>
            <div class="actions">
              <button type="button" disabled={busy}
                onclick={()=>{void perform('deliver_notices');}}>Make deliveries and record marks</button>
            </div>
          {:else if phase==='spoiled_mark'}
            <h1>A spoiled mark</h1>
            <p class="story">The receiving mark has smeared across two lines.
              You saw the notice taken, but the sheet won't show it plainly.</p>
            <div class="actions">
              <button type="button" disabled={busy}
                onclick={()=>{void perform('ask_fresh_mark');}}>Ask for a fresh mark</button>
              <button type="button" disabled={busy} data-pall-sfx="paper"
                onclick={()=>{void perform('check_receiving_book');}}>Check their receiving book</button>
              <button type="button" disabled={busy} data-pall-sfx="paper"
                onclick={()=>{void perform('note_spoiled_mark');}}>Note the spoiled mark and go on</button>
            </div>
          {:else if phase==='book_checked'}
            <h1>Receiving book</h1>
            <p class="story">The office book confirms the notice was taken at this stop.
              Record the confirmation, or ask for a fresh mark on your own sheet.</p>
            <div class="actions">
              <button type="button" disabled={busy} data-pall-sfx="paper"
                onclick={()=>{void perform('confirm_book');}}>Record the book confirmation</button>
              <button type="button" disabled={busy}
                onclick={()=>{void perform('ask_fresh_mark');}}>Ask for a fresh mark</button>
              <button type="button" disabled={busy} data-pall-sfx="paper"
                onclick={()=>{void perform('note_spoiled_mark');}}>Note the unclear mark</button>
            </div>
          {:else if phase==='round_report'}
            <h1>The round report</h1>
            <p class="story">The ordinary stops are attended. Here is the work
              recorded on the route sheet.</p>
            <dl class="round-summary">
              <div><dt>Road</dt><dd>{routeCopy}</dd></div>
              <div><dt>Notice order</dt><dd>{round.workState.noticesOrdered?'Sorted':'As issued'}</dd></div>
              <div><dt>Receipt proof</dt><dd>{receiptCopy}</dd></div>
              <div><dt>Payment</dt><dd>{round.payment}</dd></div>
            </dl>
            <div class="actions">
              <button type="button" disabled={busy} data-pall-sfx="paper"
                onclick={()=>{void perform('finish_round');}}>Finish the ordinary circuit</button>
            </div>
          {:else if phase==='final_notice'}
            <h1>The final notice</h1>
            <p class="story">The routine deliveries are recorded. One sealed council
              order remains to be presented at its marked address.</p>
            <p class="payment">Payment: {round.payment}.</p>
            <div class="actions">
              <button type="button" disabled={busy} data-pall-sfx="paper"
                onclick={()=>{void perform('take_final_notice');}}>Take the final notice</button>
            </div>
          {:else}
            <h1>Final notice in hand</h1>
            <p class="story">The route sheet and ordinary receiving marks are recorded.
              The sealed council order awaits its final destination.</p>
            <p class="payment">Payment: {round.payment}.</p>
            <p class="small">The next scene begins at the order's marked address.</p>
          {/if}
          {#if workError}<p class="error" role="alert">{workError}</p>{/if}
          {#if busy}<p class="small" role="status">Recording…</p>{/if}
        </aside>
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
  .scene{position:relative;display:grid;
    grid-template-columns:minmax(0,43%) minmax(0,46%) minmax(0,11%);
    grid-template-rows:minmax(0,1fr);align-content:start;box-sizing:border-box;
    width:100%;height:clamp(535px,62vh,640px);background:#291d15}
  .illustration{position:absolute;inset:0;overflow:hidden}
  .environment{position:absolute;inset:0;width:100%;height:100%;
    object-fit:cover;pointer-events:none}
  .hector{position:absolute;top:5%;left:10%;height:103%;max-width:36%;
    width:auto;object-fit:contain;object-position:bottom center;
    z-index:1;pointer-events:none;filter:drop-shadow(0 5px 6px #0a080555)}
  .foreground{z-index:2;clip-path:inset(93% 0 0 0)}
  .paper-art{position:absolute;z-index:3;bottom:5%;height:30%;width:18%;
    object-fit:contain;pointer-events:none;filter:drop-shadow(0 4px 4px #0806069c)}
  .paper-art.notices{left:43%}.paper-art.sealed{left:62%}.paper-art.route{left:81%}
  .paper-target{position:absolute;z-index:5;bottom:1%;height:36%;width:18%;
    display:flex;align-items:end;justify-content:center;padding:0;
    background:transparent;border:0;color:#f3e6d1;cursor:pointer}
  .paper-target.notices{left:43%}.paper-target.sealed{left:62%}.paper-target.route{left:81%}
  .paper-target:focus-visible{outline:2px solid #eed4a3;outline-offset:2px}
  .work-card{position:relative;grid-column:2;z-index:6;align-self:start;
    box-sizing:border-box;width:100%;min-width:0;margin:clamp(24px,3vw,50px) 0 24px;
    max-height:calc(100% - 48px);overflow-y:auto;overscroll-behavior:contain;
    border:2px solid #654022;border-radius:5px;
    background:#efdfbb;color:#251910;padding:15px 18px;box-shadow:0 7px 15px #0008}
  .eyebrow{font:700 11px/1.3 sans-serif;letter-spacing:.12em;color:#614029;margin:0 0 12px}
  h1{margin:0 0 12px;font:600 24px/1.3 var(--pall-font-reading,Georgia,serif);color:#25170f}
  .story,.instruction,.payment,.route-note{font:600 clamp(13px,1.2vw,17px)/1.5
    var(--pall-font-reading,Georgia,serif);margin:0 0 12px;color:#251910}
  .instruction,.payment{font-weight:700}
  .route-note{font-size:14px;margin:9px 0 5px}
  .actions{display:flex;flex-direction:column;gap:6px;margin-top:3px}
  .actions>button{display:block;width:100%;min-height:42px;text-align:left;
    background:#241d16;border:1px solid #6d5235;color:#f7e6c9;
    padding:10px 12px;font:14px/1.4 var(--pall-font-reading,Georgia,serif);cursor:pointer}
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
  @media(max-width:700px){
    .scene{display:flex;flex-direction:column;height:auto;min-height:0}
    .illustration{position:relative;width:100%;aspect-ratio:4/3}
    .environment{object-position:39% center}
    .hector{height:94%;max-width:42%;left:-2%;top:2%}
    .foreground{object-position:39% center}
    .paper-art{bottom:9%;height:25%;width:20%}
    .paper-target{bottom:2%;height:35%;width:20%}
    .paper-art.notices,.paper-target.notices{left:39%}
    .paper-art.sealed,.paper-target.sealed{left:59%}
    .paper-art.route,.paper-target.route{left:79%}
    .work-card{width:100%;margin:0;padding:14px;border-radius:0;
      max-height:none;overflow:visible}
    .story,.instruction,.payment{font-size:16px}
  }
</style>
