<script lang="ts">
  import {onMount} from 'svelte';
  import {goto} from '$app/navigation';
  import {page} from '$app/state';
  import TutorialShell from '$lib/TutorialShell.svelte';

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
  <TutorialShell {character} sceneLocation="Dispatch House">
    <section class="dispatch" aria-label="Saved Bellrunner Shift Dispatch">
      <div class="background" aria-hidden="true"></div>
      <div class="docket">
        <p class="eyebrow">BELLRUNNER · STAGE II</p>
        <h1>Shift Dispatch</h1>
        <p>Hector D. Smoke has issued the council notice round. Your acceptance is saved.</p>
        <dl>
          <div><dt>Work</dt><dd>Deliver council shift notices</dd></div>
          <div><dt>Major Skill</dt><dd>Industry · Hauling</dd></div>
          <div><dt>Payment</dt><dd>{round.payment}</dd></div>
        </dl>
        <p class="status-note">The route-check, delivery and receipt interactions belong to Stage 2 and are not implemented in this pass. The notices and sealed order are task papers, not inventory items. No money, XP or equipment has been awarded.</p>
        <a href={'/characters/'+encodeURIComponent(id)} class="back">Return to character</a>
      </div>
      <div class="documents">
        <img src="/locations/bellrunner/route-sheet.webp" alt="Route sheet awaiting delivery marks" draggable="false"/>
        <img src="/locations/bellrunner/council-work.webp" alt="Council notice papers" draggable="false"/>
        <img src="/locations/bellrunner/sealed-order.webp" alt="Sealed council order, still unopened" draggable="false"/>
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
  .back{display:inline-block;padding:10px 14px;margin-top:10px;
    background:#33271d;color:#f1d7ad;border:1px solid #9b7951;text-decoration:none}
  .back:focus-visible{outline:2px solid #f3cc89}
  .documents{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;align-items:center}
  .documents img{width:100%;max-height:320px;object-fit:contain;filter:drop-shadow(0 8px 9px #0008)}
  .documents img:first-child{grid-row:span 2;max-height:530px}
  .fallback{padding:40px;color:#e3d0af;background:#25211e}
  @media(max-width:900px){
    .dispatch{grid-template-columns:minmax(0,1fr);min-height:unset;padding:16px;gap:8px}
    .documents img{max-height:180px}
    .documents img:first-child{max-height:310px}
  }
</style>
