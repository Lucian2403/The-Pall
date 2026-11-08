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
  type Round={
    stage:number;tutorialStatus:string;accepted:boolean;
    revision:number;work:string;skill:string;payment:string;
    tutorialPayout:{coins:number;ordinaryXp:number;items:number}
  };
  type PaperKey='route'|'notices'|'sealed';
  const documents:Record<PaperKey,{name:string;src:string;description:string}>={
    route:{name:'Route sheet',src:'/locations/bellrunner/route-sheet.webp',
      description:'Places for destinations and receiving marks. Route checks and deliveries begin with the next work interaction.'},
    notices:{name:'Council notices',src:'/locations/bellrunner/council-work.webp',
      description:'Council shift notices issued to the courier for delivery.'},
    sealed:{name:'Sealed council order',src:'/locations/bellrunner/sealed-order.webp',
      description:'The final council order remains sealed until the assigned route reaches its marked address.'}
  };
  const keys=['route','notices','sealed'] as const;
  let selected=$state<PaperKey|null>(null);
  const id=$derived(page.params.id);
  let character=$state<Character|null>(null);
  let round=$state<Round|null>(null);
  let status=$state<'loading'|'ready'|'login'|'missing'|'schema'|'unavailable'>('loading');
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
{#if status==='ready'&&character&&round}
  <TutorialShell {character} sceneLocation="Dispatch House" depotBackdrop>
    <section class="workshop dispatch" aria-label="Saved Bellrunner Shift Dispatch">
      <div class="background" aria-hidden="true"></div>
      <div class="work-card docket">
        <p class="eyebrow">BELLRUNNER · STAGE II</p>
        <h1>Shift Dispatch</h1>
        <p>Hector D. Smoke has issued the council notice round. Your acceptance is saved.</p>
        <dl>
          <div><dt>Work</dt><dd>Deliver council shift notices</dd></div>
          <div><dt>Major Skill</dt><dd>Industry · Hauling</dd></div>
          <div><dt>Payment</dt><dd>{round.payment}</dd></div>
        </dl>
        <p class="status-note">The route-check, delivery and receipt interactions belong to Stage 2 and are not implemented in this pass. The notices and sealed order are task papers, not inventory items. No money, XP or equipment has been awarded.</p>
        <a href={'/characters/'+encodeURIComponent(id)} class="pall-framed-button back">Return to character</a>
      </div>
      <div class="documents" aria-label="Issued dispatch papers">
        {#each keys as key}
          <div class="document {key}">
            <img src={documents[key].src} alt="" aria-hidden="true" draggable="false"/>
            <button type="button" class="document-target" data-workshop-object
              data-pall-sfx="paper" aria-pressed={selected===key}
              aria-label={'Inspect '+documents[key].name}
              onclick={()=>{selected=selected===key?null:key;}}>
              <span class="workshop-object-label">{documents[key].name}</span>
            </button>
          </div>
        {/each}
      </div>
      {#if selected}
        <WorkshopItemPopover itemKey={selected} title={documents[selected].name}
          description={documents[selected].description} onClose={()=>{selected=null;}} />
      {/if}
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
  .dispatch{position:relative;isolation:isolate;min-width:0;
    min-height:clamp(560px,56vw,750px);padding:32px clamp(15px,4vw,55px);
    display:grid;grid-template-columns:minmax(300px,1fr) minmax(300px,1fr);
    align-items:start;gap:24px;overflow:hidden;background:#28211c}
  .background{position:absolute;inset:0;z-index:-1;
    background:linear-gradient(90deg,#110d0bd8,#100e0a85),
      url('/locations/origins/bellrunner-depot.webp') center/cover no-repeat}
  .docket{padding:18px 22px;max-width:590px;color:#2b1c10;
    border:solid transparent;border-width:22px 26px 23px;
    border-image-source:url('/ui-kit/frames/dialogue-frame-trim.png');
    border-image-slice:145 190 125 190 fill;
    border-image-width:22px 26px 23px;border-image-repeat:stretch}
  .eyebrow{font:700 12px/1.3 sans-serif;letter-spacing:.05em}
  h1{margin:10px 0;font:600 28px Georgia,serif}
  p{font:16px/1.5 Georgia,serif}
  dl{margin:18px 0}
  dl div{display:flex;justify-content:space-between;gap:12px;
    padding:9px 0;border-bottom:1px solid #ae8a5d}
  dt{font-weight:700}
  dd{margin:0;text-align:right}
  .status-note{font-size:13px;color:#60452e}
  .back{margin-top:10px}
  .documents{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));
    gap:10px;align-items:end;min-width:0}
  .document{position:relative;display:flex;align-items:center;justify-content:center;
    min-width:0;min-height:190px;padding-bottom:35px}
  .document.route{grid-row:span 2;min-height:425px}
  .document img{width:100%;max-height:240px;object-fit:contain;
    pointer-events:none;filter:drop-shadow(0 8px 9px #0008)}
  .document.route img{max-height:380px}
  .document-target{position:absolute;inset:0;display:flex;align-items:end;
    justify-content:center;cursor:pointer;padding:0;border:0;background:transparent}
  .document-target:focus-visible{outline:2px solid #f3cc89}
  .document-target .workshop-object-label{pointer-events:none}
  .fallback{padding:40px;color:#e3d0af;background:#25211e}
  @media(max-width:900px){
    .dispatch{grid-template-columns:minmax(0,1fr);min-height:unset;padding:16px;gap:8px}
    .document{min-height:140px}
    .document.route{min-height:260px}
    .document img{max-height:155px}
    .document.route img{max-height:240px}
  }
</style>
