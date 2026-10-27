<script lang="ts">
  import type {Snippet} from 'svelte';

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
  const chapter = $derived(character.origin === 'Millhand' && character.tutorial.stage >= 3
    ? '/characters/' + encodeURIComponent(character.id) + '/millhand/missing-stamp'
    : character.origin === 'Millhand' && character.tutorial.stage === 2
      ? '/characters/' + encodeURIComponent(character.id) + '/millhand/work'
      : '/characters/' + encodeURIComponent(character.id) + '/opening');
  const detail = $derived('/characters/' + encodeURIComponent(character.id));

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
      <span class="wordmark">THE PALL</span>
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
      <div class="stat"><span class="stat-symbol" aria-hidden="true">✚</span><span><small>Health</small><strong>{character.health.current} / {character.health.maximum}</strong></span></div>
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
      <span class="art-note">City panorama artwork pending</span>
    </div>

    <div class="chapter-bar">
      <div class="chapter-label">
        <span class="location-icon" aria-hidden="true">⚒</span>
        <span>{character.startingLocation}</span>
      </div>
      <div class="chapter-meta">Stage {character.tutorial.stage} · {character.origin}</div>
      <a href="/characters" class="exit-link">Character selection</a>
    </div>

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
  :global(body){width:100%;min-height:100%;margin:0;padding:0;background:#131312;color:#eee3d0;font-family:Georgia,'Times New Roman',serif}
  :global(*){box-sizing:border-box}
  .frame{display:grid;grid-template-columns:230px minmax(0,1fr);width:100%;max-width:none;min-width:0;min-height:100vh;min-height:100dvh;margin:0;padding:0}
  .rail{display:flex;flex-direction:column;min-width:0;background:#171715;border:0;border-right:1px solid #56412d;border-radius:0;min-height:100%}
  .identity{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;padding:24px 10px 22px;min-height:126px;text-decoration:none;color:#f0dfc7;border-bottom:1px solid #715237;background:linear-gradient(160deg,#28231e,#111110);text-align:center}
  .wordmark{font-size:32px;line-height:1.1;letter-spacing:.035em;text-shadow:0 2px #000}
  .motto{font:10px/1.5 sans-serif;letter-spacing:.27em;color:#d0a979}
  .nav-list{display:flex;flex-direction:column;gap:1px;padding:7px}
  .nav-entry{display:flex;align-items:center;gap:10px;min-height:43px;padding:9px 13px;color:#e9dbc7;text-decoration:none;font-size:16px;border:1px solid transparent;border-radius:3px}
  a.nav-entry:hover,a.nav-entry:focus-visible{background:#2e281f;border-color:#836241}
  .nav-entry.active{background:#473426;border-color:#9a6b3d}
  .nav-icon{width:24px;text-align:center;font-family:Georgia,serif;font-size:22px;color:#ddbb88;flex-shrink:0}
  .nav-entry.locked{opacity:.45;cursor:not-allowed;font-size:15px}
  .lock{margin-left:auto;font-size:13px}
  .nav-rule{border-top:1px solid #403429;margin:8px 17px 12px}
  .locked-heading{margin:0;padding:0 19px;font:10px/1.5 sans-serif;letter-spacing:.1em;color:#aa8a62}
  .rail-footer{margin-top:auto;min-height:125px;display:flex;flex-direction:column;justify-content:end;gap:5px;padding:19px 22px 23px;color:#c7a273;font:12px sans-serif;letter-spacing:.22em;background:linear-gradient(transparent,#24201a);line-height:1.3}
  .right{display:flex;flex-direction:column;min-width:0;min-height:100vh;min-height:100dvh;border:0;background:#1c1a18;border-radius:0}
  .topbar{display:flex;align-items:stretch;min-height:75px;background:linear-gradient(#141413,#090a0a);border-bottom:2px solid #73543b}
  .player,.stat{display:flex;align-items:center;gap:11px;padding:11px 17px;border-right:1px solid #3e352b;min-width:0}
  .player{min-width:190px}
  .avatar{display:grid;place-items:center;width:49px;height:49px;border:1px solid #a88452;background:#332819;color:#efdab7;font-size:28px;flex-shrink:0}
  .player-label,.stat>span:last-child{display:flex;flex-direction:column;min-width:0;gap:4px}
  .player strong{font-size:17px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .player small,.stat small{font-size:12px;color:#b3a695}
  .stat strong{font-size:16px;white-space:nowrap}
  .stat-symbol{font-size:25px;color:#ddbc83;border:1px solid #554638;width:33px;height:33px;border-radius:50%;display:grid;place-items:center;flex-shrink:0}
  .account-link{margin-left:auto;display:flex;align-items:center;padding:0 15px}
  .account-link a{color:#e1bd88;font:13px sans-serif}
  .city-banner{position:relative;min-height:140px;border-bottom:1px solid #78583a;background:radial-gradient(ellipse at 72% 95%,#75503577,transparent 60%),linear-gradient(180deg,#282b30,#34312c 58%,#131311);display:flex;align-items:end;justify-content:space-between;padding:22px 26px;gap:15px}
  .banner-copy{display:flex;flex-direction:column;gap:5px;text-shadow:0 2px 2px #000}
  .banner-overline{font:10px sans-serif;letter-spacing:.15em;color:#d1b28b}
  .banner-copy strong{font-size:27px;font-weight:normal}
  .banner-copy small{font:13px sans-serif;color:#dac1a2}
  .art-note{font:11px sans-serif;color:#baac9d;text-align:right}
  .chapter-bar{display:flex;align-items:center;gap:15px;padding:12px 18px;min-height:53px;background:#151513;border-bottom:1px solid #76543a}
  .chapter-label{display:flex;align-items:center;gap:11px;font-size:23px;min-width:0}
  .location-icon{font-size:24px;color:#d9b782}
  .chapter-meta{margin-left:auto;color:#c1aa8d;font-size:14px;white-space:nowrap}
  .exit-link{padding:7px 9px;border:1px solid #705236;color:#e5c39a;text-decoration:none;font-size:12px;white-space:nowrap}
  .chapter-content{display:flex;flex-direction:column;flex:1;min-width:0;padding:0}
  .onboarding-footer{border-top:1px solid #4d3928;padding:12px 17px;font:11px/1.5 sans-serif;color:#a99783;letter-spacing:.06em}
  .mobile-nav{display:none}
  @media(max-width:1100px){
    .frame{grid-template-columns:188px minmax(0,1fr)}
    .wordmark{font-size:27px}
    .nav-entry{padding:7px 9px;font-size:15px}
    .stat,.player{padding:10px}
    .stat-symbol{width:28px;height:28px;font-size:20px}
    .stat.stage{display:none}
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
    .art-note{display:none}
    .chapter-bar{padding:10px;gap:8px}
    .chapter-label{font-size:19px}
    .exit-link{font-size:11px;margin-left:auto}
    .chapter-content{padding:0}
    .mobile-nav{position:fixed;bottom:0;left:0;right:0;display:grid;grid-template-columns:repeat(4,1fr);background:#11100f;border-top:1px solid #89643c;z-index:30;min-height:65px;padding-bottom:env(safe-area-inset-bottom)}
    .mobile-nav a,.mobile-nav>span{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;padding:7px 2px;color:#dec8aa;text-decoration:none;font:11px sans-serif}
    .mobile-nav a[aria-current]{background:#423020}
    .mobile-nav a span,.mobile-nav>span span{font:21px Georgia,serif}
    .mobile-nav>span{opacity:.45}
  }
  @media(max-width:390px){.topbar .stat{padding:6px}.player{gap:5px}.stat strong{font-size:12px}.banner-copy strong{font-size:21px}}
</style>
