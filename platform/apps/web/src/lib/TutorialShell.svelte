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
    // These are only rendered as measured values if the server provides them.
    stamina?: {current:number;maximum:number};
    fatigue?: {current:number;maximum:number};
    focus?: {current:number;maximum:number};
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
  const resources=$derived([
    {id:'health',label:'Health',data:character.health,fill:'hp-fill.png'},
    {id:'stamina',label:'Stamina',data:character.stamina,fill:'stamina-fill.png'},
    {id:'fatigue',label:'Fatigue',data:character.fatigue,fill:'fatigue-fill.png'},
    {id:'focus',label:'Focus',data:character.focus,fill:null}
  ]);
  function isMeasured(value:{current:number;maximum:number}|undefined):value is {current:number;maximum:number}{
    return !!value && Number.isFinite(value.current) &&
      Number.isFinite(value.maximum) && value.maximum>0 && value.current>=0;
  }
  function percentage(value:{current:number;maximum:number}){
    return Math.max(0,Math.min(100,100*value.current/value.maximum));
  }

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
      <div class="resource-strip" aria-label="Character resources">
        {#each resources as resource (resource.id)}
          <div class="resource-meter">
            <span class="meter-heading"><span class="meter-label">{resource.label}</span>
              <strong class="meter-number">{isMeasured(resource.data) ? resource.data.current+' / '+resource.data.maximum : '—'}</strong>
            </span>
            {#if isMeasured(resource.data)}
              <span class="resource-track" role="progressbar" aria-label={resource.label}
                aria-valuemin="0" aria-valuemax={resource.data.maximum}
                aria-valuenow={Math.min(resource.data.current,resource.data.maximum)}>
                {#if resource.fill}
                  <img src={'/ui-kit/resources/'+resource.fill} alt="" aria-hidden="true"
                    style={'clip-path:inset(0 '+(100-percentage(resource.data))+'% 0 0)'} />
                {:else}
                  <span class="css-fill" style={'width:'+percentage(resource.data)+'%'}></span>
                {/if}
              </span>
            {:else}
              <span class="resource-track unavailable" role="img"
                aria-label={resource.label+': not tracked yet'} title="This resource is not yet supplied by the saved-character API"></span>
            {/if}
          </div>
        {/each}
      </div>
      <div class="top-extras">
        <div class="stat coin-stat"><span class="stat-symbol" aria-hidden="true">◉</span><span><small>Coins</small><strong>{character.coins}</strong></span></div>
        <div class="stat stage"><span><small>Onboarding</small><strong>{character.tutorial.stage} / 8</strong></span></div>
        <div class="account-link"><a href="/account" aria-label="Account settings">Account</a></div>
      </div>
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
  .topbar{display:grid;grid-template-columns:minmax(148px,188px) minmax(0,1fr) auto;
    align-items:stretch;min-height:80px;background:#131311;border-bottom:1px solid #574632}
  .player{display:flex;align-items:center;gap:9px;padding:9px 12px;border-right:1px solid #3e352b;min-width:0}
  .avatar{display:grid;place-items:center;width:40px;height:44px;border:1px solid #a88452;background:#332819;
    color:#efdab7;font-size:23px;flex-shrink:0}
  .player-label{display:flex;flex-direction:column;min-width:0;gap:4px}
  .player strong{font-size:17px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .player small{font-size:12px;color:#b3a695}
  .resource-strip{min-width:0;display:grid;grid-template-columns:repeat(4,minmax(0,1fr))}
  .resource-meter{display:flex;flex-direction:column;justify-content:center;gap:6px;min-width:0;
    padding:9px clamp(5px,.7vw,12px);border-right:1px solid #3e352b}
  .meter-heading{display:flex;align-items:baseline;justify-content:space-between;gap:4px;min-width:0}
  .meter-label{font:14px/1 var(--pall-font-label,'Arial Narrow',sans-serif);letter-spacing:.04em;color:#d7bd98}
  .meter-number{font:12px/1.2 var(--pall-font-reading,Georgia,serif);color:#eee0cb;white-space:nowrap}
  .resource-track{position:relative;display:block;width:100%;height:17px;border-radius:2px;
    background:#211b17 url('/ui-kit/resources/bar-empty.png') center/100% 100% no-repeat;
    overflow:hidden}
  .resource-track img{display:block;width:100%;height:100%;object-fit:fill;pointer-events:none}
  .resource-track .css-fill{display:block;height:100%;background:#8a94a7;opacity:.85}
  .resource-track.unavailable::after{content:'';position:absolute;left:8px;right:8px;top:7px;
    border-top:1px dashed #6a5b46;opacity:.55}
  .top-extras{display:flex;align-items:stretch;min-width:0}
  .stat{display:flex;align-items:center;gap:6px;padding:8px 10px;border-right:1px solid #3e352b}
  .stat>span:last-child{display:flex;flex-direction:column;gap:3px}
  .stat strong{font-size:14px;white-space:nowrap}
  .stat small{font-size:11px;color:#b3a695}
  .stat-symbol{font-size:19px;color:#ddbc83;flex-shrink:0}
  .account-link{display:flex;align-items:center;padding:0 10px}
  .account-link a{color:#e1bd88;font:12px sans-serif}
  .city-banner{position:relative;min-height:clamp(245px,26vw,335px);border-bottom:1px solid #5f4935;
    background:linear-gradient(90deg,#11110fb8,#14141223 43%,#1715120a 75%),
      url('/ui-kit/resources/TheCityVista.png') center 43%/cover no-repeat;
    background-color:#222321;display:flex;align-items:end;justify-content:space-between;padding:22px 26px;gap:15px}
  .banner-copy{display:flex;flex-direction:column;gap:5px;text-shadow:0 2px 2px #000}
  .banner-overline{font:13px var(--pall-font-label,'Arial Narrow',sans-serif);letter-spacing:.16em;color:#d3ad7c}
  .banner-copy strong{font:normal 27px/1.1 var(--pall-font-reading,Georgia,serif)}
  .banner-copy small{font:13px sans-serif;color:#dac1a2}
  .chapter-bar{display:flex;align-items:center;gap:12px;padding:7px 14px;min-height:43px;background:#151513;border-bottom:1px solid #5b442f}
  .chapter-label{display:flex;align-items:center;gap:9px;font-size:18px;min-width:0}
  .location-icon{font-size:19px;color:#d9b782}
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
    .topbar{grid-template-columns:minmax(133px,165px) minmax(0,1fr) auto}
    .player{padding:7px}
    .player strong{font-size:15px}
    .resource-meter{padding:8px 5px}
    .meter-label{font-size:13px}
    .meter-number{font-size:11px}
    .stat{padding:7px}
    .stat-symbol{display:none}
    .stat.stage{display:none}
    .account-link{padding:0 8px}
    .chapter-meta{display:none}
  }
  @media(max-width:900px){
    .topbar{grid-template-columns:minmax(0,1fr) auto;min-height:0}
    .player{grid-column:1;grid-row:1;min-height:53px}
    .top-extras{grid-column:2;grid-row:1}
    .resource-strip{grid-column:1/-1;grid-row:2;border-top:1px solid #3e352b}
    .resource-meter{padding:8px 12px}
  }
  @media(max-width:760px){
    .frame{display:block;width:100%;min-height:100vh;min-height:100dvh;margin:0;padding:0}
    .rail{display:none}
    .right{min-height:100vh;min-height:100dvh;border:0;border-radius:0;padding-bottom:calc(65px + env(safe-area-inset-bottom))}
    .account-link{display:none}
    .resource-meter{padding:7px 8px}
    .meter-label{font-size:12px}
    .meter-number{font-size:10px}
    .resource-track{height:15px}
    .city-banner{min-height:205px;padding:18px;background-position:center,center 39%}
    .banner-copy strong{font-size:23px}
    .chapter-bar{padding:7px 9px;gap:7px}
    .chapter-label{font-size:16px}
    .exit-link{font-size:11px;margin-left:auto}
    .rewind-button{padding:6px;font-size:11px;white-space:normal;max-width:125px}
    .chapter-content{padding:0}
    .mobile-nav{position:fixed;bottom:0;left:0;right:0;display:grid;grid-template-columns:repeat(4,1fr);background:#11100f;border-top:1px solid #89643c;z-index:30;min-height:65px;padding-bottom:env(safe-area-inset-bottom)}
    .mobile-nav a,.mobile-nav>span{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;padding:7px 2px;color:#dec8aa;text-decoration:none;font:11px sans-serif}
    .mobile-nav a[aria-current]{background:#423020}
    .mobile-nav a span,.mobile-nav>span span{font:21px Georgia,serif}
    .mobile-nav>span{opacity:.45}
  }
  @media(max-width:390px){
    .resource-meter{padding:7px 4px}
    .meter-heading{flex-direction:column;gap:4px}
    .resource-track{height:14px}
    .banner-copy strong{font-size:21px}
  }
</style>
