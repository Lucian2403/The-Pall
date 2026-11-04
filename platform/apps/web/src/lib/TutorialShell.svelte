<script lang="ts">
  import type {Snippet} from 'svelte';
  import {onMount} from 'svelte';
  import {goto} from '$app/navigation';
  import './pall-owner-ui.css';
  import CharacterAvatar from '$lib/CharacterAvatar.svelte';
  import PallAudioControls from '$lib/PallAudioControls.svelte';
  import {setPallAudioScene,claimSmithingWorkshopAmbience,stopSmithingWorkshopAmbience,claimCouncilOfficeAmbience,stopCouncilOfficeAmbience,claimNightAlleyAmbience,stopNightAlleyAmbience,claimDepotAmbience,stopDepotAmbience} from '$lib/pall-audio';

  type SavedCharacter = {
    id: string;
    name: string;
    avatarId?: string|null;
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

  let {
    character,children,activePage = 'scene',sceneLocation,smithingBackdrop = false,
    councilBackdrop = false,alleyBackdrop = false,depotBackdrop = false,
    combatStamina,backToStageFive,backStageBusy = false,backStageError = ''
  }:{
    character:SavedCharacter;
    children:Snippet;
    activePage?:'scene'|'character';
    sceneLocation?:string;
    smithingBackdrop?:boolean;
    councilBackdrop?:boolean;
    alleyBackdrop?:boolean;
    depotBackdrop?:boolean;
    /** Only the active combat page supplies live, server-confirmed Stamina. */
    combatStamina?:{current:number;maximum:number};
    backToStageFive?:()=>Promise<void>;
    backStageBusy?:boolean;
    backStageError?:string;
  }=$props();
  const chapter = $derived(character.origin === 'Millhand' && character.tutorial.stage >= 7
    ? '/characters/' + encodeURIComponent(character.id) + '/millhand/clinic'
    : character.origin === 'Millhand' && character.tutorial.stage === 6
    ? '/characters/' + encodeURIComponent(character.id) + '/millhand/combat'
    : character.origin === 'Millhand' && character.tutorial.stage === 5
    ? '/characters/' + encodeURIComponent(character.id) + '/millhand/wage-claim'
    : character.origin === 'Millhand' && character.tutorial.stage === 4
    ? '/characters/' + encodeURIComponent(character.id) + '/millhand/second-job'
    : character.origin === 'Millhand' && character.tutorial.stage === 3
      ? '/characters/' + encodeURIComponent(character.id) + '/millhand/missing-stamp'
      : character.origin === 'Millhand' && character.tutorial.stage === 2
        ? '/characters/' + encodeURIComponent(character.id) + '/millhand/work'
        : '/characters/' + encodeURIComponent(character.id) + '/opening');
  const detail = $derived('/characters/' + encodeURIComponent(character.id));
  // Prefer the currently rendered combat snapshot over the character sheet.
  // Outside combat, retain the existing saved-resource/provisional HUD behavior.
  const staminaShown=$derived(isMeasured(combatStamina)
    ?combatStamina
    :isMeasured(character.stamina)
      ?character.stamina:{current:100,maximum:100});
  const resources=$derived([
    {id:'health',label:'Health',data:character.health},
    {id:'stamina',label:'Stamina',data:staminaShown}
  ] as const);
  const minorResources=$derived([
    {id:'fatigue',label:'Fatigue',data:character.fatigue},
    {id:'focus',label:'Focus',data:character.focus}
  ] as const);
  const romanStages=['—','I','II','III','IV','V','VI','VII','VIII'];
  const introStage=$derived(romanStages[character.tutorial.stage]??String(character.tutorial.stage));
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

  // Audio scope belongs to the *actual mounted game shell*, not a guess
  // about the URL in a separate root layout. All HUD controls are therefore
  // live for exactly as long as this in-game scene is rendered.
  onMount(()=>{
    setPallAudioScene(true);
    return ()=>setPallAudioScene(false);
  });
  // The actual rendered background decides whether forge ambience belongs
  // here. This is independent of the character route or workshop-related
  // text; the backdrop flag changes dynamically when Stage 4 moves to depot.
  $effect(()=>{
    if(smithingBackdrop)return claimSmithingWorkshopAmbience();
    stopSmithingWorkshopAmbience();
  });
  // Both council interiors use one soundscape. Claim it from the actual
  // painted route, not a generic character stage; keep it outside the popup.
  $effect(()=>{
    if(councilBackdrop)return claimCouncilOfficeAmbience();
    stopCouncilOfficeAmbience();
  });
  // Explicit illustrated alley only, including the pre-combat Stage 6 boundary.
  $effect(()=>{
    if(alleyBackdrop)return claimNightAlleyAmbience();
    stopNightAlleyAmbience();
  });

  // Depot playback follows the visible backdrop, not merely Stage 4 status.
  $effect(()=>{
    if(depotBackdrop)return claimDepotAmbience();
    stopDepotAmbience();
  });

  // Refresh the local-only replay button when undoing the Stage 6 stance
  // returns this same mounted shell to Stage 5. Do not show stale stage labels.
  $effect(()=>{
    if(character.origin!=='Millhand')return;
    const characterId=character.id;
    const currentStage=character.tutorial.stage;
    let stale=false;
    canRewind=false;
    rewindFromStage=null;
    void (async()=>{
      try{
        const response=await fetch('/api/characters/'+encodeURIComponent(characterId)+'/dev/rewind-stage',{cache:'no-store'});
        if(!response.ok||stale)return;
        const data=await response.json() as {enabled:boolean;canRewind:boolean;stage:number};
        if(stale||data.stage!==currentStage)return;
        canRewind=data.enabled&&data.canRewind;
        rewindFromStage=data.stage;
      }catch{/* Developer-only capability unavailable; hide control. */}
    })();
    return ()=>{stale=true;};
  });

  async function rewindOneStage(){
    if(!canRewind||rewinding||rewindFromStage===null)return;
    const fromStage=rewindFromStage;
    const warning=fromStage===6
      ?'TESTING ONLY: Return to Stage 5 stance selection? This discards Flint combat turns and Chronicle, restores the Health saved at the start of the fight, and keeps the character, rewards and earlier jobs.'
      :'TESTING ONLY: Replay Stage '+(fromStage-1)+'? This resets the stage you are returning to and clears any later-stage progress, including a Stage 3 route skill award if earned. Your character will be kept.';
    if(!window.confirm(warning))return;
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
        }else if(response.status===503 && data.error==='second_job_schema_missing'){
          rewindError='Stage 4 database setup is missing. Run npm run second-job:migrate from platform, then restart the API.';
        }else if(response.status===503 && data.error==='combat_schema_missing'){
          rewindError='Stage 6 database setup is missing. Run npm run combat:migrate from platform, then restart the API.';
        }else if(response.status===409 && data.error==='unsafe_combat_initial_health'){
          rewindError='Cannot restore the original combat Health: the starting save receipt is missing. No progress was changed.';
        }else if(response.status===409 && data.error==='unsafe_combat_health_state'){
          rewindError='Character Health differs from the saved fight. Rewind was blocked to protect the character.';
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
        <CharacterAvatar name={character.name} avatarId={character.avatarId} />
        <span class="player-label"><strong>{character.name}</strong><small>{character.origin}</small></span>
      </div>
      <div class="resource-cluster" aria-label="Character condition">
        <div class="resource-strip" aria-label="Health and stamina">
          {#each resources as resource (resource.id)}
            <div class="resource-meter">
              <span class="meter-heading">
                <span class="meter-label">{resource.label}</span>
                <strong class="meter-number">{resource.data.current} / {resource.data.maximum}</strong>
              </span>
              <span class="resource-track" role="progressbar" aria-label={resource.label}
                aria-valuemin="0" aria-valuemax={resource.data.maximum}
                aria-valuenow={Math.min(resource.data.current,resource.data.maximum)}
                title={resource.id==='stamina'&&!isMeasured(combatStamina)&&!isMeasured(character.stamina)
                  ?'Provisional full stamina; future combat data will replace this value'
                  :undefined}>
                <span class="resource-interior">
                  <span class={'meter-fill '+resource.id}
                    style={'width:'+percentage(resource.data)+'%'}></span>
                </span>
              </span>
            </div>
          {/each}
        </div>
        <div class="minor-resources" aria-label="Other condition indicators">
          {#each minorResources as resource (resource.id)}
            <span class="minor-resource">
              <img src={'/ui-kit/icons/character-'+resource.id+'.svg'}
                width="18" height="18" alt="" aria-hidden="true"/>
              <span>{resource.label}</span>
              <strong>{isMeasured(resource.data)
                ?resource.data.current+' / '+resource.data.maximum:'—'}</strong>
            </span>
          {/each}
        </div>
      </div>
      <div class="top-extras">
        <div class="stat coin-stat">
          <img src="/ui-kit/icons/character-coins.svg" alt="" aria-hidden="true" width="25" height="25"/>
          <span><small>Coins</small><strong>{character.coins}</strong></span>
        </div>
        <div class="stat stage">
          <span><small>Introduction</small><strong>{introStage} / VIII</strong></span>
        </div>
        <PallAudioControls/>
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
        <span>{sceneLocation ?? character.startingLocation}</span>
      </div>
      <div class="chapter-meta">Stage {character.tutorial.stage} · {character.origin}</div>
      {#if character.origin==='Millhand' && character.tutorial.stage===6 && backToStageFive}
        <button type="button" class="rewind-button" disabled={backStageBusy}
          title="Return to the saved Stage 5 stance selection before combat begins"
          onclick={()=>{void backToStageFive();}}>
          {backStageBusy?'Returning…':'← Back to Stage 5'}
        </button>
      {/if}
      {#if character.origin==='Millhand' && character.tutorial.stage===6 && backToStageFive && backStageError}
        <span class="back-stage-error" role="alert">{backStageError}</span>
      {/if}
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
  .back-stage-error{max-width:360px;padding:6px 8px;border:1px solid #a36b3d;color:#f5ce91;background:#4e241d;font:12px/1.4 sans-serif}
  .rail-footer{margin-top:auto;min-height:188px;display:flex;flex-direction:column;justify-content:end;gap:3px;padding:25px 20px 17px;color:#d9b98b;font:13px/1.1 var(--pall-font-label,'Arial Narrow',sans-serif);letter-spacing:.23em;background:linear-gradient(0deg,#100e0df2,#100e0d4a 58%,#100e0dbb),url('/ui-kit/sidebar-illustration.png') center center/cover no-repeat;background-color:#181611}
  .right{display:flex;flex-direction:column;min-width:0;min-height:100vh;min-height:100dvh;border:0;background:#1c1a18;border-radius:0}
  /* Industrial brass-and-charcoal HUD, rather than four equal developer gauges. */
  .topbar{
    display:grid;
    grid-template-columns:minmax(210px,1.05fr) minmax(350px,2.3fr) minmax(320px,1.4fr);
    align-items:stretch;min-height:88px;min-width:0;
    background:linear-gradient(180deg,#292119,#201a15 54%,#161311);
    border-top:1px solid #80623f;
    border-bottom:2px solid #a07a4e;
    box-shadow:inset 0 3px #c09d6720,0 4px 10px #0008;
  }
  .player{
    display:flex;align-items:center;gap:13px;min-width:0;
    padding:12px clamp(12px,1.5vw,23px);
    border-right:1px solid #88643b70;
  }
  .player :global(.portrait){
    width:53px;height:60px;border:2px solid #a67f4f;
    box-shadow:0 0 0 2px #150f0b,0 3px 10px #0009;
  }
  .player-label{display:flex;flex-direction:column;min-width:0;gap:5px}
  .player strong{
    color:#f3e1c2;
    font:700 clamp(17px,1.13vw,20px)/1.17 var(--pall-font-reading,Georgia,serif);
    white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
  }
  .player small{font:13px/1.1 var(--pall-font-reading,Georgia,serif);color:#c7a878}
  .resource-cluster{
    display:flex;flex-direction:column;justify-content:center;
    min-width:0;gap:6px;padding:8px clamp(10px,1.3vw,20px);
    border-right:1px solid #88643b70;
  }
  .resource-strip{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:clamp(9px,1.2vw,20px)}
  .resource-meter{display:flex;flex-direction:column;justify-content:center;gap:5px;min-width:0}
  .meter-heading{display:flex;align-items:baseline;justify-content:space-between;gap:6px;min-width:0}
  .meter-label{
    color:#d6ae77;font:600 14px/1 var(--pall-font-label,'Arial Narrow',sans-serif);
    letter-spacing:.055em;text-transform:uppercase;
  }
  .meter-number{
    color:#f3dfbb;
    font:700 12px/1.2 var(--pall-font-reading,Georgia,serif);
    font-variant-numeric:tabular-nums;white-space:nowrap;
  }
  .resource-track{
    position:relative;display:block;width:100%;height:17px;min-width:0;
    background:#1b1611 url('/ui-kit/resources/bar-empty.png') center/100% 100% no-repeat;
    border-radius:2px;overflow:hidden;
  }
  /* Bar frame is owner artwork; the fill spans its *entire inner track* at
     100%, unlike the previously padded hp-fill sprite. */
  .resource-interior{position:absolute;inset:4px 9px;overflow:hidden;border-radius:30px;background:#0d0c0a}
  .meter-fill{
    display:block;height:100%;border-radius:inherit;
    box-shadow:inset 0 1px 1px #fff5,0 0 4px #0005;
    transition:width 220ms ease-out;
  }
  .meter-fill.health{background:linear-gradient(180deg,#d65b47,#9e2e23 58%,#651b17)}
  .meter-fill.stamina{background:linear-gradient(180deg,#648e60,#315c39 52%,#183b2b)}
  .minor-resources{display:flex;align-items:center;gap:clamp(10px,1.4vw,22px);min-width:0}
  .minor-resource{
    display:flex;align-items:center;gap:5px;min-width:0;
    color:#bca585;font:12px/1.1 var(--pall-font-reading,Georgia,serif);
  }
  .minor-resource img{display:block;width:18px;height:18px;flex:none;opacity:.85}
  .minor-resource strong{color:#e7d4b6;font-variant-numeric:tabular-nums;white-space:nowrap}
  .top-extras{
    display:flex;align-items:center;justify-content:flex-end;gap:clamp(6px,.65vw,13px);
    min-width:0;padding:6px clamp(8px,1vw,17px);
  }
  .stat{display:flex;align-items:center;gap:6px;flex:none}
  .stat img{width:25px;height:25px;flex:none}
  .stat>span:last-child{display:flex;flex-direction:column;gap:5px}
  .stat strong{color:#f3dcb8;font:700 16px/1.1 var(--pall-font-reading,Georgia,serif);white-space:nowrap}
  .stat small{
    font:12px/1 var(--pall-font-label,'Arial Narrow',sans-serif);
    letter-spacing:.04em;color:#c6a67c;
  }
  .stat.stage{padding-left:10px;border-left:1px solid #82634170}
  .stat.stage strong{font-size:14px}
  .account-link{display:flex;align-items:center;padding-left:10px;border-left:1px solid #82634170}
  .account-link a{color:#f0c995;font:13px/1.1 var(--pall-font-reading,Georgia,serif)}
  .account-link a:hover,.account-link a:focus-visible{color:#ffe6be;text-decoration:underline}
  .city-banner{position:relative;min-height:clamp(160px,17vw,225px);border-bottom:1px solid #5f4935;
    background:linear-gradient(90deg,#11110fb8,#14141223 43%,#1715120a 75%),
      url('/ui-kit/resources/TheCityVista.png') center 12%/cover no-repeat;
    background-color:#222321;display:flex;align-items:end;justify-content:space-between;padding:22px 26px;gap:15px}
  .banner-copy{display:flex;flex-direction:column;gap:5px;text-shadow:0 2px 2px #000}
  .banner-overline{font:13px var(--pall-font-label,'Arial Narrow',sans-serif);letter-spacing:.16em;color:#d3ad7c}
  /* The decorative face becomes illegible at banner scale. Prefer a clear
     serif title; the supplied logo and restrained Bebas labels carry identity. */
  .banner-copy strong{font:normal 29px/1.16 var(--pall-font-reading,Georgia,serif);letter-spacing:0;text-shadow:0 2px 4px #000a}
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
  @media(max-width:1270px){
    .frame{grid-template-columns:188px minmax(0,1fr)}
    .nav-entry{padding:7px 9px;font-size:15px}
    .topbar{grid-template-columns:minmax(0,1fr) auto;min-height:0}
    .player{grid-column:1;grid-row:1;min-height:70px}
    .top-extras{grid-column:2;grid-row:1}
    .resource-cluster{grid-column:1/-1;grid-row:2;border-right:0;border-top:1px solid #59432e}
    .chapter-meta{display:none}
  }
  @media(max-width:900px){
    .player{padding:8px 12px}
    .resource-cluster{padding:9px 12px}
    .top-extras{gap:8px}
    .stat.stage{padding-left:7px}
    .account-link{padding-left:7px}
  }
  @media(max-width:760px){
    .frame{display:block;width:100%;min-height:100vh;min-height:100dvh;margin:0;padding:0}
    .rail{display:none}
    .right{min-height:100vh;min-height:100dvh;border:0;border-radius:0;padding-bottom:calc(65px + env(safe-area-inset-bottom))}
    .topbar{grid-template-columns:1fr}
    .player{grid-column:1;grid-row:1}
    .resource-cluster{grid-column:1;grid-row:2;padding:10px 12px}
    .top-extras{
      grid-column:1;grid-row:3;justify-content:space-between;
      flex-wrap:wrap;padding:9px 12px;border-top:1px solid #59432e;
    }
    .resource-strip{gap:12px}
    .meter-label{font-size:12px}
    .meter-number{font-size:11px}
    .resource-track{height:16px}
    .minor-resources{gap:12px}
    .minor-resource{font-size:11px}
    .stat img{width:22px;height:22px}
    .account-link{display:flex}
    .city-banner{min-height:152px;padding:16px;background-position:center,center 12%}
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
