<script lang="ts">
  import type {Snippet} from 'svelte';
  import {onMount} from 'svelte';
  import {goto} from '$app/navigation';
  import './pall-owner-ui.css';

  type SavedCharacter = {
    id: string;
    name: string;
    origin: string;
    sex: string;
    coins: number;
    health: {current: number; maximum: number};
    startingLocation: string;
    tutorial: {stage: number; status: string};
  };

  let {character, children, activePage = 'scene'}: {character: SavedCharacter; children: Snippet; activePage?: 'scene' | 'character'} = $props();
  const chapter = $derived(character.origin === 'Millhand' && character.tutorial.stage >= 4
    ? '/characters/' + encodeURIComponent(character.id) + '/millhand/second-job'
    : character.origin === 'Millhand' && character.tutorial.stage === 3
      ? '/characters/' + encodeURIComponent(character.id) + '/millhand/missing-stamp'
      : character.origin === 'Millhand' && character.tutorial.stage === 2
        ? '/characters/' + encodeURIComponent(character.id) + '/millhand/work'
        : '/characters/' + encodeURIComponent(character.id) + '/opening');
  const detail = $derived('/characters/' + encodeURIComponent(character.id));
  const healthPercent = $derived(character.health.maximum > 0
    ? Math.max(0,Math.min(100,100 * character.health.current / character.health.maximum)) : 0);

  // Rewind is a development-only server capability. The live game never
  // exposes this button, even if someone manually opens an onboarding URL.
  let canRewind=$state(false);
  let rewinding=$state(false);
  let rewindError=$state('');
  let rewindFromStage=$state<number|null>(null);

  onMount(()=>{
    if(character.origin!=='Millhand')return;
    void (async()=>{
      try{
        const response=await fetch('/api/characters/'+encodeURIComponent(character.id)+'/dev/rewind-stage',{cache:'no-store'});
        if(!response.ok)return;
        const data=await response.json() as {enabled:boolean;canRewind:boolean;stage:number};
        canRewind=data.enabled&&data.canRewind;
        rewindFromStage=data.stage;
      }catch{/* Developer-only capability unavailable; hide control. */}
    })();
  });

  async function rewindOneStage(){
    if(!canRewind||rewinding||rewindFromStage===null)return;
    const fromStage=rewindFromStage;
    if(!window.confirm('TESTING ONLY: Replay Stage '+(fromStage-1)+'? This resets the stage you are returning to and clears any later-stage progress, including a Stage 3 route skill award if earned. Your character will be kept.'))return;
    rewinding=true;
    rewindError='';
    try{
      const response=await fetch('/api/characters/'+encodeURIComponent(character.id)+'/dev/rewind-stage',{
        method:'POST',headers:{'content-type':'application/json'},
        body:JSON.stringify({expectedStage:fromStage})
      });
      if(!response.ok){
        const data=await response.json() as {error?:string};
        if(response.status===409 && data.error==='stale_stage'){
          rewindError='This character moved to another stage. Reload this page before testing again.';
        }else{
          rewindError='Could not rewind: '+(data.error??response.status);
        }
        return;
      }
      const data=await response.json() as {stage:number;route:string};
      canRewind=false;
      await goto(data.route,{replaceState:true,invalidateAll:true});
    }catch{
      rewindError='Could not reach the game server. Reload to check the saved stage before retrying.';
    }finally{rewinding=false;}
  }

  // The owner-approved normal Home dashboard unlocks after the shared Stage 8
  // completion transaction. No post-tutorial capabilities are exposed here.
  const lockedSections = [
    {name: 'City', icon: '▥'},
    {name: 'Inventory', icon: '▣'},
    {name: 'Journal', icon: '▤'},
    {name: 'Jobs', icon: '⚒'},
    {name: 'Market', icon: '⚖'},
    {name: 'Contracts', icon: '≡'},
    {name: 'Crafting', icon: '◇'},
    {name: 'Expeditions', icon: '△'}
  ] as const;
</script>

<div class="frame" data-mode="onboarding">
  <aside class="rail" aria-label="Game navigation">
    <a class="identity" href="/characters">
      <img class="brand-logo" src="/ui-kit/branding/logo-compact.png" alt="The Pall" width="166" height="107" />
      <span class="motto">A CITY ENDURES</span>
    </a>
    <nav class="nav-list" aria-label="Available pages">
      <a class:active={activePage === 'scene'} class="nav-entry" href={chapter} aria-current={activePage === 'scene' ? 'page' : undefined}>
        <span class="nav-icon" aria-hidden="true">⌂</span><span>Current scene</span>
      </a>
      <a class:active={activePage === 'character'} class="nav-entry" href={detail} aria-current={activePage === 'character' ? 'page' : undefined}>
        <span class="nav-icon" aria-hidden="true">◈</span><span>Character</span>
      </a>
      <a class="nav-entry" href="/characters">
        <span class="nav-icon" aria-hidden="true">☰</span><span>Characters</span>
      </a>
    </nav>
    <div class="nav-rule"></div>
    <p class="locked-heading">AFTER YOUR INTRODUCTION</p>
    <div class="nav-list">
      {#each lockedSections as item}
        <span class="nav-entry locked" aria-disabled="true" title="Unavailable during the eight-stage introduction">
          <span class="nav-icon" aria-hidden="true">{item.icon}</span><span>{item.name}</span><span class="lock" aria-label="locked">—</span>
        </span>
      {/each}
    </div>
    <div class="rail-footer">
      <span>WITHIN THE WALLS</span>
      <span>WE REMAIN</span>
    </div>
  </aside>

  <div class="right">
    <header class="topbar">
      <div class="player" aria-label="Current saved character">
        <span class="avatar" aria-hidden="true">{character.name.slice(0, 1).toUpperCase()}</span>
        <span class="player-label"><strong>{character.name}</strong><small>{character.origin}</small></span>
      </div>
      <div class="stat health-stat"><span class="stat-symbol" aria-hidden="true">✚</span><span class="health-values"><small>Health</small><strong>{character.health.current} / {character.health.maximum}</strong>
        <span class="health-track" role="progressbar" aria-label="Health" aria-valuemin="0"
          aria-valuemax={character.health.maximum} aria-valuenow={character.health.current}>
          <img src="/ui-kit/resources/hp-fill.png" alt="" aria-hidden="true"
            style={'clip-path:inset(0 '+(100-healthPercent)+'% 0 0)'} />
        </span>
      </span></div>
      <div class="stat"><span class="stat-symbol" aria-hidden="true">◉</span><span><small>Coins</small><strong>{character.coins}</strong></span></div>
      <div class="stat stage"><span class="stat-symbol" aria-hidden="true">▣</span><span><small>Onboarding</small><strong>Stage {character.tutorial.stage} of 8</strong></span></div>
      <div class="account-link"><a href="/account" aria-label="Account settings">Account</a></div>
    </header>

    <div class="city-banner" aria-label="Grand Cylinder City">
      <div class="banner-copy">
        <span class="banner-overline">THE PALL</span>
        <strong>Grand Cylinder City</strong>
        <small>Guided introduction · {character.origin}</small>
      </div>
    </div>

    <div class="chapter-bar">
      <div class="chapter-label">
        <span class="location-icon" aria-hidden="true">⚒</span>
        <span>{character.startingLocation}</span>
      </div>
      <div class="chapter-meta">Stage {character.tutorial.stage} · {character.origin}</div>
      {#if canRewind && rewindFromStage!==null}
        <button type="button" class="rewind-button" disabled={rewinding}
          title="Developer testing only: reset the current stage to replay the previous one"
          onclick={() => {void rewindOneStage();}}>
          {rewinding?'Rewinding…':'← Back to Stage '+(rewindFromStage-1)}
        </button>
      {/if}
      <a href="/characters" class="exit-link">Character selection</a>
    </div>

    {#if rewindError}<p class="rewind-error" role="alert">{rewindError}</p>{/if}
    <div class="chapter-content">
      {@render children()}
    </div>

    <footer class="onboarding-footer">GUIDED CHAPTER · Normal Home navigation becomes available only after Stage 8.</footer>
  </div>
</div>

<nav class="mobile-nav" aria-label="Tutorial navigation">
  <a href={chapter} aria-current={activePage === 'scene' ? 'page' : undefined}><span aria-hidden="true">⌂</span>Scene</a>
  <a href={detail} aria-current={activePage === 'character' ? 'page' : undefined}><span aria-hidden="true">◈</span>Character</a>
  <a href="/characters"><span aria-hidden="true">☰</span>Characters</a>
  <span aria-disabled="true"><span aria-hidden="true">▣</span>More later</span>
</nav>

<style>
  :global(html){width:100%;min-height:100%;margin:0;padding:0}
  :global(body){width:100%;min-height:100%;margin:0;padding:0;background:#131312;color:#eee3d0;font-family:var(--pall-font-reading,Georgia,serif)}
  :global(*){box-sizing:border-box}
  .frame{display:grid;grid-template-columns:230px minmax(0,1fr);width:100%;max-width:none;min-width:0;min-height:100vh;min-height:100dvh;margin:0;padding:0}
  .rail{display:flex;flex-direction:column;min-width:0;background:#171715;border:0;border-right:1px solid #56412d;border-radius:0;min-height:100%}
  .identity{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;padding:12px 10px;min-height:114px;text-decoration:none;color:#f0dfc7;border-bottom:1px solid #504030;background:#121211;text-align:center}
  .brand-logo{width:94%;max-width:174px;height:auto;max-height:94px;object-fit:contain;display:block;filter:drop-shadow(0 1px 3px #0008)}
  .motto{font:12px/1.2 var(--pall-font-label,'Arial Narrow',sans-serif);letter-spacing:.19em;color:#c09b73}
  .nav-list{display:flex;flex-direction:column;gap:1px;padding:7px}
  .nav-entry{display:flex;align-items:center;gap:10px;min-height:43px;padding:9px 13px;color:#e9dbc7;text-decoration:none;font:16px/1.25 var(--pall-font-reading,Georgia,serif);border:1px solid transparent;border-radius:3px}
  a.nav-entry:hover,a.nav-entry:focus-visible{background:#2e281f;border-color:#836241}
  .nav-entry.active{background:#473426;border-color:#9a6b3d}
  .nav-icon{width:24px;text-align:center;font-family:Georgia,serif;font-size:22px;color:#ddbb88;flex-shrink:0}
  .nav-entry.locked{opacity:.45;cursor:not-allowed;font-size:15px}
  .lock{margin-left:auto;font-size:13px}
  .nav-rule{border-top:1px solid #403429;margin:8px 17px 12px}
  .locked-heading{margin:0;padding:0 19px;font:10px/1.5 sans-serif;letter-spacing:.1em;color:#aa8a62}
  .rail-footer{margin-top:auto;min-height:188px;display:flex;flex-direction:column;justify-content:end;gap:3px;padding:25px 20px 17px;color:#d9b98b;font:13px/1.1 var(--pall-font-label,'Arial Narrow',sans-serif);letter-spacing:.23em;background:linear-gradient(0deg,#100e0df2,#100e0d4a 58%,#100e0dbb),url('/ui-kit/sidebar-illustration.png') center center/cover no-repeat;background-color:#181611}
  .right{display:flex;flex-direction:column;min-width:0;min-height:100vh;min-height:100dvh;border:0;background:#1c1a18;border-radius:0}
  .topbar{display:flex;align-items:stretch;min-height:72px;background:#131311;border-bottom:1px solid #574632}
  .player,.stat{display:flex;align-items:center;gap:11px;padding:11px 17px;border-right:1px solid #3e352b;min-width:0}
  .player{min-width:190px}
  .avatar{display:grid;place-items:center;width:49px;height:49px;border:1px solid #a88452;background:#332819;color:#efdab7;font-size:28px;flex-shrink:0}
  .player-label,.stat>span:last-child{display:flex;flex-direction:column;min-width:0;gap:4px}
  .player strong{font-size:17px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .player small,.stat small{font-size:12px;color:#b3a695}
  .stat strong{font-size:16px;white-space:nowrap}
  .health-stat{min-width:166px;gap:8px}
  .health-values{min-width:126px}
  .health-track{display:block;position:relative;width:133px;height:17px;background:url('/ui-kit/resources/bar-empty.png') center/100% 100% no-repeat}
  .health-track img{position:absolute;inset:0;width:100%;height:100%;object-fit:fill;pointer-events:none}
  .stat-symbol{font-size:25px;color:#ddbc83;border:1px solid #554638;width:33px;height:33px;border-radius:50%;display:grid;place-items:center;flex-shrink:0}
  .account-link{margin-left:auto;display:flex;align-items:center;padding:0 15px}
  .account-link a{color:#e1bd88;font:13px sans-serif}
  .city-banner{position:relative;min-height:143px;border-bottom:1px solid #5f4935;background:linear-gradient(90deg,#11110fd9,#14141263 38%,#17151222),url('/ui-kit/resources/TheCityVista.png') center 50%/cover no-repeat;background-color:#222321;display:flex;align-items:end;justify-content:space-between;padding:17px 23px;gap:15px}
  .banner-copy{display:flex;flex-direction:column;gap:5px;text-shadow:0 2px 2px #000}
  .banner-overline{font:13px var(--pall-font-label,'Arial Narrow',sans-serif);letter-spacing:.16em;color:#d3ad7c}
  .banner-copy strong{font:normal 27px/1.1 var(--pall-font-reading,Georgia,serif)}
  .banner-copy small{font:13px sans-serif;color:#dac1a2}
  .chapter-bar{display:flex;align-items:center;gap:15px;padding:12px 18px;min-height:53px;background:#151513;border-bottom:1px solid #76543a}
  .chapter-label{display:flex;align-items:center;gap:11px;font-size:23px;min-width:0}
  .location-icon{font-size:24px;color:#d9b782}
  .chapter-meta{margin-left:auto;color:#c1aa8d;font-size:14px;white-space:nowrap}
  .exit-link{padding:7px 9px;border:1px solid #705236;color:#e5c39a;text-decoration:none;font-size:12px;white-space:nowrap}
  .rewind-button{padding:7px 10px;background:#3a2a1b;color:#eed1aa;border:1px solid #aa7841;
    font:12px/1.3 sans-serif;cursor:pointer;white-space:nowrap}
  .rewind-button:hover,.rewind-button:focus-visible{background:#634126;outline:2px solid #d0a678}
  .rewind-button:disabled{opacity:.5;cursor:wait}
  .rewind-error{margin:0;padding:9px 16px;background:#34231c;color:#f0b7a0;font:13px/1.4 sans-serif}
  .chapter-content{display:flex;flex-direction:column;flex:1;min-width:0;padding:0}
  .onboarding-footer{border-top:1px solid #4d3928;padding:12px 17px;font:11px/1.5 sans-serif;color:#a99783;letter-spacing:.06em}
  .mobile-nav{display:none}
  @media(max-width:1100px){
    .frame{grid-template-columns:188px minmax(0,1fr)}
    .nav-entry{padding:7px 9px;font-size:15px}
    .stat,.player{padding:10px}
    .stat-symbol{width:28px;height:28px;font-size:20px}
    .stat.stage{display:none}
    .health-track{width:105px;height:15px}
    .health-values{min-width:105px}
    .health-stat{min-width:0}
    .chapter-meta{display:none}
  }
  @media(max-width:760px){
    .frame{display:block;width:100%;min-height:100vh;min-height:100dvh;margin:0;padding:0}
    .rail{display:none}
    .right{min-height:100vh;min-height:100dvh;border:0;border-radius:0;padding-bottom:calc(65px + env(safe-area-inset-bottom))}
    .topbar{min-height:62px}
    .player{min-width:0;flex:1;padding:8px}
    .avatar{height:42px;width:42px;font-size:24px}
    .player strong{font-size:14px}
    .player small{font-size:11px}
    .stat{gap:5px;padding:7px}
    .stat-symbol{display:none}
    .stat strong{font-size:13px}
    .stat small{font-size:10px}
    .account-link{display:none}
    .city-banner{min-height:115px;padding:16px}
    .banner-copy strong{font-size:23px}
    .chapter-bar{padding:10px;gap:8px}
    .chapter-label{font-size:19px}
    .exit-link{font-size:11px;margin-left:auto}
    .rewind-button{padding:7px;font-size:11px;white-space:normal;max-width:125px}
    .chapter-label{font-size:16px}
    .chapter-content{padding:0}
    .mobile-nav{position:fixed;bottom:0;left:0;right:0;display:grid;grid-template-columns:repeat(4,1fr);background:#11100f;border-top:1px solid #89643c;z-index:30;min-height:65px;padding-bottom:env(safe-area-inset-bottom)}
    .mobile-nav a,.mobile-nav>span{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;padding:7px 2px;color:#dec8aa;text-decoration:none;font:11px sans-serif}
    .mobile-nav a[aria-current]{background:#423020}
    .mobile-nav a span,.mobile-nav>span span{font:21px Georgia,serif}
    .mobile-nav>span{opacity:.45}
  }
  @media(max-width:390px){.topbar .stat{padding:6px}.player{gap:5px}.stat strong{font-size:12px}.banner-copy strong{font-size:21px}}
</style>
