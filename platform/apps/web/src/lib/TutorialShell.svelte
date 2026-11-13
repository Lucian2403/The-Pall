<script lang="ts">
  import type {Snippet} from 'svelte';
  import {onMount,setContext,tick} from 'svelte';
  import {SCENE_JOURNAL_CONTEXT,type SceneJournalController,type SceneJournalRegistrar} from '$lib/scene-journal';
  import {goto} from '$app/navigation';
  import './pall-owner-ui.css';
  import CharacterAvatar from '$lib/CharacterAvatar.svelte';
  import PallAudioControls from '$lib/PallAudioControls.svelte';
  import ShellServiceControl,{type ShellService} from '$lib/ShellServiceControl.svelte';
  import WelcomeToThePall from '$lib/WelcomeToThePall.svelte';
  import {setPallAudioScene,claimSmithingWorkshopAmbience,stopSmithingWorkshopAmbience,claimCouncilOfficeAmbience,stopCouncilOfficeAmbience,claimNightAlleyAmbience,stopNightAlleyAmbience,claimDepotAmbience,stopDepotAmbience,claimMedicalClinicAmbience,stopMedicalClinicAmbience,playCoinTransactionSfx} from '$lib/pall-audio';

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
    welcomeSeen?:boolean;
    tutorial: {stage: number; status: string};
  };

  let {
    character,children,activePage = 'scene',sceneLocation,compactBanner = false,
    compactCityVista = false,smithingBackdrop = false,
    councilBackdrop = false,alleyBackdrop = false,depotBackdrop = false,
    industrialCourtyardBackdrop = false,clinicBackdrop = false,
    combatStamina,sceneStage,backToStageFive,backStageBusy = false,backStageError = '',
    cityMap,travelLocked = false,services = {},dock
  }:{
    character:SavedCharacter;
    children:Snippet;
    activePage?:'scene'|'character';
    sceneLocation?:string;
    /** Deprecated option used by earlier screens to fully hide the panorama. */
    compactBanner?:boolean;
    /** Retained for existing callers; every scene now shares one shallow City header. */
    compactCityVista?:boolean;
    smithingBackdrop?:boolean;
    councilBackdrop?:boolean;
    alleyBackdrop?:boolean;
    depotBackdrop?:boolean;
    /** Same owner depot ambience for the reusable Bellrunner Industrial Courtyard. */
    industrialCourtyardBackdrop?:boolean;
    clinicBackdrop?:boolean;
    /** Only the active combat page supplies live, server-confirmed Stamina. */
    combatStamina?:{current:number;maximum:number};
    /** The clinic remains the Stage 7 scene when its saved exit unlocks Stage 8. */
    sceneStage?:number;
    backToStageFive?:()=>Promise<void>;
    backStageBusy?:boolean;
    backStageError?:string;
    /** A real, routable city map. Absent until one exists; never guessed. */
    cityMap?:{href:string};
    /** The current activity forbids travel (e.g. an encounter in progress). */
    travelLocked?:boolean;
    /** Live Notifications / Chat services. Omitted ones show an honest unavailable state. */
    services?:{notifications?:ShellService;chat?:ShellService};
    /** Future chat/messages dock. It takes its own grid column and reflows the
        activity area (activity layouts are container-driven), never overlaying it. */
    dock?:Snippet;
  }=$props();
  // The City header is the future map gateway. It only becomes a link when the
  // server-confirmed introduction is complete, travel is not locked by the
  // current activity, AND a real map route has been supplied.
  const tutorialComplete=$derived(character.tutorial.stage>=8&&character.tutorial.status==='COMPLETED');
  const mapState=$derived(!tutorialComplete?'introduction':travelLocked?'activity':!cityMap?'unavailable':'open');
  const mapStatus=$derived(mapState==='introduction'?'Opens after the introduction'
    :mapState==='activity'?'Travel is locked during this activity'
    :mapState==='unavailable'?'Not available yet':'Open the city map');
  const chapter = $derived(character.tutorial.stage === 8
    ? '/characters/' + encodeURIComponent(character.id) + '/home'
    : character.origin === 'Bellrunner' && character.tutorial.stage === 6
    ? '/characters/' + encodeURIComponent(character.id) + '/bellrunner/combat'
    : character.origin === 'Bellrunner' && character.tutorial.stage === 5
    ? '/characters/' + encodeURIComponent(character.id) + '/bellrunner/dogman'
    : character.origin === 'Bellrunner' && character.tutorial.stage === 4
    ? '/characters/' + encodeURIComponent(character.id) + '/bellrunner/second-job'
    : character.origin === 'Bellrunner' && character.tutorial.stage === 3
    ? '/characters/' + encodeURIComponent(character.id) + '/bellrunner/wrong-bell'
    : character.origin === 'Bellrunner' && character.tutorial.stage === 2
    ? '/characters/' + encodeURIComponent(character.id) + '/bellrunner/dispatch'
    : character.origin === 'Millhand' && character.tutorial.stage >= 7
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
  // The server owns first-entry acknowledgement. QA fixture characters that
  // predate the field remain unaffected; newly created ones explicitly say false.
  let welcomedThisMount=$state(false);
  const welcomeRequired=$derived(character.welcomeSeen===false&&!welcomedThisMount);
  async function beginWelcomeStory(){
    welcomedThisMount=true;
    if(character.tutorial.stage===1){
      await goto('/characters/'+encodeURIComponent(character.id)+'/opening',
        {replaceState:true,invalidateAll:true});
    }
  }
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
  // The HUD only shows extra condition values the server actually provides.
  const measuredMinorResources=$derived(minorResources.filter(resource=>isMeasured(resource.data)));
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
  let rewindTargetStage=$state<number|null>(null);

  // Every playable scene shares one permanent upper-right journal control.
  // Scene components register their already-existing journals through context.
  let sceneJournal=$state<SceneJournalController|null>(null);
  let emptyJournalOpen=$state(false);
  const registerJournal:SceneJournalRegistrar=(controller)=>{sceneJournal=controller;};
  setContext(SCENE_JOURNAL_CONTEXT,registerJournal);
  async function toggleEmptyJournal(){
    emptyJournalOpen=!emptyJournalOpen;
    if(emptyJournalOpen){
      await tick();
      document.getElementById('scene-empty-journal')?.scrollIntoView({block:'start',behavior:'smooth'});
    }
  }

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

  // Hector's Dispatch House and the reusable Industrial Courtyard share
  // one existing depot ambience stream, not two overlapping audio elements.
  // The active illustrated scene owns the track and Sound Settings govern it.
  $effect(()=>{
    if(depotBackdrop||industrialCourtyardBackdrop)return claimDepotAmbience();
    stopDepotAmbience();
  });
  // The clinic's owner soundscape is tied to the mounted painted scene only.
  $effect(()=>{
    if(clinicBackdrop)return claimMedicalClinicAmbience();
    stopMedicalClinicAmbience();
  });

  // Read the local-only replay contract for each implemented origin.
  // Production/non-loopback never exposes this route or its button.
  $effect(()=>{
    if(character.origin!=='Millhand'&&character.origin!=='Bellrunner')return;
    const characterId=character.id;
    const currentStage=character.tutorial.stage;
    let stale=false;
    canRewind=false;
    rewindFromStage=null;
    rewindTargetStage=null;
    void (async()=>{
      try{
        const response=await fetch('/api/characters/'+encodeURIComponent(characterId)+'/dev/rewind-stage',{cache:'no-store'});
        if(!response.ok||stale)return;
        const data=await response.json() as {enabled:boolean;canRewind:boolean;stage:number;targetStage:number|null};
        if(stale||data.stage!==currentStage)return;
        canRewind=data.enabled&&data.canRewind;
        rewindFromStage=data.stage;
        rewindTargetStage=data.targetStage;
      }catch{/* Developer-only capability unavailable; hide control. */}
    })();
    return ()=>{stale=true;};
  });

  async function rewindOneStage(){
    if(!canRewind||rewinding||rewindFromStage===null)return;
    const fromStage=rewindFromStage;
    const warning=character.origin==='Bellrunner'&&fromStage===2
      ?'TESTING ONLY: Return to Bellrunner Stage 1? The saved round acceptance and its request receipts will be cleared so you can replay Hector\'s opening. Character items, coins and skills are preserved.'
      :character.origin==='Bellrunner'&&fromStage===3
      ?'TESTING ONLY: Return to Bellrunner Stage 2? This clears the Wrong Bell investigation and returns you to the final sealed notice. Earlier deliveries, Health, coins and skills are preserved.'
      :character.origin==='Bellrunner'&&fromStage===4
      ?'TESTING ONLY: Return to Bellrunner Stage 3? This restarts the chosen Stage 4 job, including its saved dialogue, inspections and receipts, and removes the original route\'s one-time +1 Major Skill award. Your completed delivery, coins and character are preserved.'
      :character.origin==='Bellrunner'&&fromStage===5
      ?'TESTING ONLY: Return to Bellrunner Stage 4? The completed second job remains saved and your +1 Major Skill is preserved. Only the final departure to the service gate is undone.'
      :fromStage===8
      ?'TESTING ONLY: Return to Stage 7? This restarts the rented-home ending from the paid clinic departure. The clinic fee, your saved fight, Health, coins, skills and earlier choices are preserved.'
      :fromStage===7
      ?'TESTING ONLY: Replay the fight in Stage 6? This clears the clinic visit and the completed Flint fight, restores your exact pre-fight Health, and refunds the 10-coin clinic fee if already paid. Earlier jobs, equipment and skill awards remain saved.'
      :fromStage===6
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
        }else if(response.status===503 && data.error==='bellrunner_migration_required'){
          rewindError='Bellrunner schema is missing. Run npm run bellrunner:migrate, then restart the API.';
        }else if(response.status===409 && data.error==='unsafe_dispatch_state'){
          rewindError='The accepted Bellrunner round is missing or inconsistent; nothing was reset.';
        }else if(response.status===409 && data.error==='unsafe_wrong_bell_state'){
          rewindError='The saved Bellrunner route or skill award cannot safely be reset. No progress was changed.';
        }else if(response.status===409 && data.error==='unsafe_second_job_state'){
          rewindError='The saved Stage 4 job is inconsistent with its original branch. Nothing was reset.';
        }else if(response.status===503 && data.error==='second_job_schema_missing'){
          rewindError='Stage 4 database setup is missing. Run npm run second-job:migrate from platform, then restart the API.';
        }else if(response.status===503 && data.error==='combat_schema_missing'){
          rewindError='Stage 6 database setup is missing. Run npm run combat:migrate from platform, then restart the API.';
        }else if(response.status===503 && data.error==='clinic_schema_missing'){
          rewindError='Stage 7 database setup is missing. Run npm run clinic:migrate from platform, then restart the API.';
        }else if(response.status===503 && data.error==='home_schema_missing'){
          rewindError='Stage 8 database setup is missing. Run npm run home:migrate from platform, then restart the API.';
        }else if(response.status===409 && data.error==='unsafe_home_state'){
          rewindError='The saved home ending is inconsistent with tutorial progress. Rewind was blocked without changing the clinic or coins.';
        }else if(response.status===409 && data.error==='unsafe_clinic_state'){
          rewindError='Clinic and saved combat records disagree. Rewind was blocked; no progress or coins were changed.';
        }else if(response.status===409 && data.error==='unsafe_clinic_health_state'){
          rewindError='Current Health differs from the saved clinic record. Rewind was blocked to prevent duplicate care or payment.';
        }else if(response.status===409 && data.error==='unsafe_combat_initial_health'){
          rewindError='Cannot restore the original combat Health: the starting save receipt is missing. No progress was changed.';
        }else if(response.status===409 && data.error==='unsafe_combat_health_state'){
          rewindError='Character Health differs from the saved fight. Rewind was blocked to protect the character.';
        }else{
          rewindError='Could not rewind: '+(data.error??response.status);
        }
        return;
      }
      const data=await response.json() as {stage:number;route:string;coinDelta?:number};
      if(typeof data.coinDelta==='number'&&data.coinDelta>0)playCoinTransactionSfx();
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

<div class="frame" class:has-dock={!!dock} data-mode="onboarding">
  <aside class="rail" aria-label="Game navigation">
    <a class="identity" href="/characters" title="Characters">
      <img class="brand-logo" src="/ui-kit/branding/logo-compact.png" alt="The Pall" width="166" height="107" />
      <span class="motto">A CITY ENDURES</span>
    </a>
    <nav class="nav-list" aria-label="Available pages">
      <a class:active={activePage === 'scene'} class="nav-entry" href={chapter} title="Current scene" aria-current={activePage === 'scene' ? 'page' : undefined}>
        <span class="nav-icon" aria-hidden="true">⌂</span><span class="nav-text">Current scene</span>
      </a>
      <a class:active={activePage === 'character'} class="nav-entry" href={detail} title="Character" aria-current={activePage === 'character' ? 'page' : undefined}>
        <span class="nav-icon" aria-hidden="true">◈</span><span class="nav-text">Character</span>
      </a>
      <a class="nav-entry" href="/characters" title="Characters">
        <span class="nav-icon" aria-hidden="true">☰</span><span class="nav-text">Characters</span>
      </a>
    </nav>
    <div class="nav-rule"></div>
    <p class="locked-heading">AFTER YOUR INTRODUCTION</p>
    <div class="nav-list">
      {#each lockedSections as item}
        <span class="nav-entry locked" aria-disabled="true" title={item.name+' — unavailable during the eight-stage introduction'}>
          <span class="nav-icon" aria-hidden="true">{item.icon}</span><span class="nav-text">{item.name}</span><span class="lock" aria-label="locked">—</span>
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
        {#if measuredMinorResources.length}
          <div class="minor-resources" aria-label="Other condition indicators">
            {#each measuredMinorResources as resource (resource.id)}
              <span class="minor-resource">
                <img src={'/ui-kit/icons/character-'+resource.id+'.svg'}
                  width="18" height="18" alt="" aria-hidden="true"/>
                <span>{resource.label}</span>
                <strong>{resource.data?.current} / {resource.data?.maximum}</strong>
              </span>
            {/each}
          </div>
        {/if}
      </div>
      <div class="top-extras">
        <div class="top-stats">
          <div class="stat coin-stat">
            <img src="/ui-kit/icons/character-coins.svg" alt="" aria-hidden="true" width="25" height="25"/>
            <span><small>Coins</small><strong>{character.coins}</strong></span>
          </div>
          <div class="stat stage">
            <span><small>Introduction</small><strong>{introStage} / VIII</strong></span>
          </div>
        </div>
        <div class="top-tools" role="group" aria-label="Notifications, chat, sound and account">
          <ShellServiceControl kind="notifications" service={services.notifications}/>
          <ShellServiceControl kind="chat" service={services.chat}/>
          <PallAudioControls/>
          <div class="account-link"><a href="/account" aria-label="Account settings">Account</a></div>
        </div>
      </div>
    </header>

    {#if !compactBanner}
    <section class="city-banner" class:city-banner-workstation={compactCityVista}
      aria-labelledby="city-banner-title" data-map-state={mapState}>
      <div class="banner-copy">
        <span class="banner-overline">THE PALL</span>
        <strong id="city-banner-title">Grand Cylinder City</strong>
        <small>{tutorialComplete?character.origin:'Guided introduction · '+character.origin}</small>
      </div>
      {#if mapState==='open'&&cityMap}
        <a class="city-map-gateway" href={cityMap.href} aria-describedby="city-map-status">
          {@render mapIcon()}
          <span class="gateway-text"><span class="gateway-title">City map</span>
            <span class="gateway-status" id="city-map-status">{mapStatus}</span></span>
        </a>
      {:else}
        <button type="button" class="city-map-gateway" aria-disabled="true"
          aria-describedby="city-map-status" title={'City map — '+mapStatus}>
          {@render mapIcon()}
          <span class="gateway-text"><span class="gateway-title">City map</span>
            <span class="gateway-status" id="city-map-status">{mapStatus}</span></span>
          <svg class="gateway-lock" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none"
            stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <rect x="5.5" y="10.5" width="13" height="9.5" rx="1.5"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/>
          </svg>
        </button>
      {/if}
    </section>
    {/if}

    <!-- One sticky activity row: location, progress, testing rewinds and the
         permanent journal control, so the HUD never adds a separate strip. -->
    <div class="chapter-bar">
      <div class="chapter-label">
        <span class="location-icon" aria-hidden="true">⚒</span>
        <span class="chapter-location">{sceneLocation ?? character.startingLocation}</span>
      </div>
      <div class="chapter-meta">Stage {sceneStage??character.tutorial.stage} · {character.origin}</div>
      {#if (character.origin==='Millhand'||character.origin==='Bellrunner') && character.tutorial.stage===6 && backToStageFive}
        <button type="button" class="rewind-button" disabled={backStageBusy}
          title={character.origin==='Bellrunner'
            ? 'Review the saved Stage 5 confrontation. Combat turns and Health are not reset.'
            : 'Return to the saved Stage 5 stance selection before combat begins'}
          onclick={()=>{void backToStageFive();}}>
          {backStageBusy?'Returning…':'← Back to Stage 5'}
        </button>
      {/if}
      {#if (character.origin==='Millhand'||character.origin==='Bellrunner') && character.tutorial.stage===6 && backToStageFive && backStageError}
        <span class="back-stage-error" role="alert">{backStageError}</span>
      {/if}
      {#if canRewind && rewindFromStage!==null && rewindTargetStage!==null}
        <button type="button" class="rewind-button" disabled={rewinding}
          title="Developer testing only: reset the current stage to replay the previous one"
          onclick={() => {void rewindOneStage();}}>
          {rewinding?'Rewinding…':'← Back to Stage '+rewindTargetStage}
        </button>
      {/if}
      <div class="scene-journal-bar" aria-label="Personal journal controls">
        <button type="button" class="scene-journal-button" data-pall-sfx="paper"
          aria-expanded={sceneJournal?.open??emptyJournalOpen}
          aria-controls={sceneJournal?.id??'scene-empty-journal'}
          onclick={()=>{
            if(sceneJournal)sceneJournal.toggle();
            else void toggleEmptyJournal();
          }}>
          {(sceneJournal?.open??emptyJournalOpen)?'Close journal':'Review journal'}
        </button>
      </div>
      <a href="/characters" class="exit-link">Character selection</a>
    </div>

    {#if rewindError}<p class="rewind-error" role="alert">{rewindError}</p>{/if}
    <div class="chapter-content" id="pall-activity">
      {@render children()}
    </div>

    {#if !sceneJournal && emptyJournalOpen}
      <section class="empty-journal" id="scene-empty-journal" aria-label="Personal Journal">
        <small>PERSONAL JOURNAL</small>
        <h2>Current scene</h2>
        <p>No journal entry has been recorded for this scene yet.</p>
      </section>
    {/if}

    <footer class="onboarding-footer">GUIDED CHAPTER · Other game systems are still in development.</footer>
  </div>

  {#if dock}
    <aside class="shell-dock" aria-label="Messages dock">{@render dock()}</aside>
  {/if}
</div>

{#snippet mapIcon()}
  <svg class="gateway-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none"
    stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
    <path d="M3.5 6.5 9 4l6 2.5 5.5-2.5v13.5L15 20l-6-2.5-5.5 2.5z"/><path d="M9 4v13.5M15 6.5V20"/>
  </svg>
{/snippet}

{#if welcomeRequired}
  <WelcomeToThePall characterId={character.id} onStarted={beginWelcomeStory}/>
{/if}

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
  /* Shell grid: navigation rail | activity column | optional messages dock.
     Rail width is a token so it stays proportionate rather than growing with
     the window. Activity layouts respond to their own container, so a dock
     column automatically reflows them instead of covering scene targets.
     Owner direction (2026-11-10): on wide windows the WHOLE game, sidebar
     included, is one centred frame with dark gutters on both sides. */
  .frame{--pall-rail-w:216px;--pall-dock-w:clamp(280px,22vw,360px);--pall-frame-max:1680px;
    display:grid;grid-template-columns:var(--pall-rail-w) minmax(0,1fr);
    width:100%;max-width:var(--pall-frame-max);min-width:0;min-height:100vh;min-height:100dvh;
    margin:0 auto;padding:0}
  .frame.has-dock{grid-template-columns:var(--pall-rail-w) minmax(0,1fr) var(--pall-dock-w);
    max-width:calc(var(--pall-frame-max) + var(--pall-dock-w))}
  /* Once gutters exist, a hairline and soft shadow define the frame edge. */
  @media(min-width:1681px){
    .frame{border-inline:1px solid #3a2c20;box-shadow:0 0 56px #000c}
  }
  .rail{position:sticky;top:0;align-self:start;display:flex;flex-direction:column;min-width:0;
    height:100vh;height:100dvh;overflow-y:auto;overscroll-behavior:contain;scrollbar-width:thin;
    scrollbar-color:#5e4630 #171715;background:#171715;border:0;border-right:1px solid #56412d;border-radius:0}
  .identity{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;padding:10px 10px;min-height:104px;text-decoration:none;color:#f0dfc7;border-bottom:1px solid #504030;background:#121211;text-align:center;flex:none}
  .brand-logo{width:94%;max-width:164px;height:auto;max-height:84px;object-fit:contain;display:block;filter:drop-shadow(0 1px 3px #0008)}
  .motto{font:12px/1.2 var(--pall-font-label,'Arial Narrow',sans-serif);letter-spacing:.19em;color:#c09b73}
  .nav-list{display:flex;flex-direction:column;gap:1px;padding:7px}
  .nav-entry{display:flex;align-items:center;gap:10px;min-height:42px;padding:8px 12px;color:#e9dbc7;text-decoration:none;font:16px/1.25 var(--pall-font-reading,Georgia,serif);border:1px solid transparent;border-radius:3px}
  a.nav-entry:hover,a.nav-entry:focus-visible{background:#2e281f;border-color:#836241}
  a.nav-entry:focus-visible,.identity:focus-visible{outline:2px solid #e9be7e;outline-offset:-2px}
  .nav-entry.active{background:#473426;border-color:#9a6b3d}
  .nav-icon{width:24px;text-align:center;font-family:Georgia,serif;font-size:22px;color:#ddbb88;flex-shrink:0}
  .nav-entry.locked{opacity:.45;cursor:not-allowed;font-size:15px}
  .lock{margin-left:auto;font-size:13px}
  .nav-rule{border-top:1px solid #403429;margin:6px 17px 10px}
  .locked-heading{margin:0;padding:0 19px;font:10px/1.5 sans-serif;letter-spacing:.1em;color:#aa8a62}
  .back-stage-error{max-width:360px;padding:6px 8px;border:1px solid #a36b3d;color:#f5ce91;background:#4e241d;font:12px/1.35 sans-serif}
  .rail-footer{margin-top:auto;min-height:168px;flex:none;display:flex;flex-direction:column;justify-content:end;gap:3px;padding:25px 20px 17px;color:#d9b98b;font:13px/1.1 var(--pall-font-label,'Arial Narrow',sans-serif);letter-spacing:.23em;background:linear-gradient(0deg,#100e0df2,#100e0d4a 58%,#100e0dbb),url('/ui-kit/sidebar-illustration.png') center center/cover no-repeat;background-color:#181611}
  /* The activity column is the size container for HUD reflow decisions:
     a dock or a narrower rail changes the HUD exactly as a narrower window would. */
  .right{container:pall-shell / inline-size;display:flex;flex-direction:column;min-width:0;min-height:100vh;min-height:100dvh;border:0;background:#1c1a18;border-radius:0}

  /* Industrial brass-and-charcoal HUD: one compact band on desktop. */
  .topbar{
    display:grid;
    grid-template-columns:minmax(170px,max-content) minmax(300px,760px) minmax(max-content,1fr);
    align-items:stretch;min-height:66px;min-width:0;
    background:linear-gradient(180deg,#292119,#201a15 54%,#161311);
    border-top:1px solid #80623f;
    border-bottom:2px solid #a07a4e;
    box-shadow:inset 0 3px #c09d6720,0 4px 10px #0008;
  }
  .player{
    display:flex;align-items:center;gap:11px;min-width:0;
    padding:8px clamp(10px,1.2vw,20px);
    border-right:1px solid #88643b70;
  }
  .player :global(.portrait){
    width:42px;height:48px;border:2px solid #a67f4f;flex:none;
    box-shadow:0 0 0 2px #150f0b,0 3px 10px #0009;
  }
  .player-label{display:flex;flex-direction:column;min-width:0;gap:3px}
  .player strong{
    color:#f3e1c2;
    font:700 18px/1.17 var(--pall-font-reading,Georgia,serif);
    white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
  }
  .player small{font:13px/1.1 var(--pall-font-reading,Georgia,serif);color:#c7a878}
  .resource-cluster{
    display:flex;flex-direction:column;justify-content:center;
    min-width:0;gap:5px;padding:7px clamp(10px,1.2vw,20px);
    border-right:1px solid #88643b70;
  }
  .resource-strip{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:clamp(10px,1.2vw,20px)}
  .resource-meter{display:flex;flex-direction:column;justify-content:center;gap:4px;min-width:0}
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
    display:flex;align-items:center;justify-content:flex-end;gap:clamp(8px,.8vw,14px);
    min-width:0;padding:6px clamp(8px,1vw,17px);
  }
  .top-stats,.top-tools{display:flex;align-items:center;gap:clamp(7px,.7vw,12px);min-width:0}
  .top-tools{padding-left:clamp(7px,.7vw,12px);border-left:1px solid #82634170}
  .stat{display:flex;align-items:center;gap:6px;flex:none}
  .stat img{width:24px;height:24px;flex:none}
  .stat>span:last-child{display:flex;flex-direction:column;gap:4px}
  .stat strong{color:#f3dcb8;font:700 16px/1.1 var(--pall-font-reading,Georgia,serif);white-space:nowrap}
  .stat small{
    font:12px/1 var(--pall-font-label,'Arial Narrow',sans-serif);
    letter-spacing:.04em;color:#c6a67c;
  }
  .stat.stage{padding-left:10px;border-left:1px solid #82634170}
  .stat.stage strong{font-size:14px}
  .account-link{display:flex;align-items:center}
  .account-link a{display:flex;align-items:center;min-height:40px;padding:0 4px;color:#f0c995;font:13px/1.1 var(--pall-font-reading,Georgia,serif)}
  .account-link a:hover,.account-link a:focus-visible{color:#ffe6be;text-decoration:underline}
  .account-link a:focus-visible{outline:2px solid #e9be7e;outline-offset:2px}

  /* City header = future map gateway. Taller than the HUD band so the city
     reads as a place; the scene below is sized from what remains, so the
     page itself does not grow. The vista keeps the central tower in frame. */
  .city-banner{position:relative;display:flex;align-items:center;justify-content:space-between;gap:16px;
    height:clamp(88px,8.5cqi,136px);padding:10px clamp(14px,1.6vw,26px);border-bottom:1px solid #5f4935;
    background:linear-gradient(90deg,#11110fd0,#14141238 44%,#1715120a 70%,#11110f99),
      url('/ui-kit/resources/TheCityVista.png') center 12%/cover no-repeat;
    background-color:#222321}
  /* Retained for existing workstation callers; same height, tower-centred crop. */
  .city-banner.city-banner-workstation{background-position:center,center 18%}
  .banner-copy{display:flex;flex-direction:column;gap:3px;min-width:0;text-shadow:0 2px 2px #000}
  .banner-overline{font:12px var(--pall-font-label,'Arial Narrow',sans-serif);letter-spacing:.16em;color:#d3ad7c}
  /* The decorative face becomes illegible at banner scale. Prefer a clear
     serif title; the supplied logo and restrained Bebas labels carry identity. */
  .banner-copy strong{font:normal clamp(21px,1.7cqi,29px)/1.12 var(--pall-font-reading,Georgia,serif);letter-spacing:0;text-shadow:0 2px 4px #000a;white-space:nowrap}
  .banner-copy small{font:13px sans-serif;color:#dac1a2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .city-map-gateway{position:relative;display:flex;align-items:center;gap:9px;flex:none;
    min-height:44px;padding:6px 12px;border:1px solid #9c784b;border-radius:3px;
    background:#15100cd6;color:#efd7b0;text-decoration:none;text-align:left;cursor:pointer;
    font:600 14px/1.15 var(--pall-font-reading,Georgia,serif);box-shadow:0 2px 8px #0009}
  .city-map-gateway[aria-disabled="true"]{cursor:not-allowed;border-style:dashed;border-color:#7d6244;color:#d3bc98;background:#120e0bcc}
  /* When a real map exists the whole panorama is the link (stretched target). */
  a.city-map-gateway{position:static}
  a.city-map-gateway::after{content:'';position:absolute;inset:0}
  a.city-map-gateway:hover,a.city-map-gateway:focus-visible{background:#2b1f15e6;border-color:#d8b073}
  .city-map-gateway:focus-visible{outline:2px solid #efd092;outline-offset:2px}
  .gateway-icon{width:22px;height:22px;flex:none;color:#ddb77f}
  .gateway-lock{width:16px;height:16px;flex:none;color:#bca07a}
  .gateway-text{display:flex;flex-direction:column;gap:2px;min-width:0}
  .gateway-title{font-weight:700}
  .gateway-status{font:12px/1.2 var(--pall-font-reading,Georgia,serif);color:#c9b08b;white-space:nowrap}

  /* Location, progress, testing rewind and the permanent journal control
     share one sticky row: no separate decorative strip pushes the scene down. */
  .chapter-bar{position:sticky;top:0;z-index:20;display:flex;align-items:center;flex-wrap:wrap;gap:6px 10px;
    padding:3px clamp(9px,1.3vw,18px);min-height:43px;background:#151513f5;
    border-bottom:1px solid #5b442f;box-shadow:0 3px 8px #0006}
  .chapter-label{display:flex;align-items:center;gap:9px;font-size:18px;min-width:0;flex:0 1 auto}
  .chapter-location{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .location-icon{font-size:19px;color:#d9b782}
  .chapter-meta{color:#c1aa8d;font-size:14px;white-space:nowrap;padding-left:10px;border-left:1px solid #5b442f}
  .exit-link{padding:7px 9px;border:1px solid #705236;color:#e5c39a;text-decoration:none;font-size:12px;white-space:nowrap}
  .exit-link:focus-visible{outline:2px solid #e9be7e;outline-offset:2px}
  .rewind-button{padding:7px 10px;background:#3a2a1b;color:#eed1aa;border:1px solid #aa7841;
    font:12px/1.3 sans-serif;cursor:pointer;white-space:nowrap}
  .rewind-button:hover,.rewind-button:focus-visible{background:#634126;outline:2px solid #d0a678}
  .rewind-button:disabled{opacity:.5;cursor:wait}
  .rewind-error{margin:0;padding:9px 16px;background:#34231c;color:#f0b7a0;font:13px/1.4 sans-serif}
  /* One stable location for Review/Close journal through every illustrated
     scene, conversation, physical task, clinic and active combat. */
  .scene-journal-bar{display:flex;align-items:center;margin-left:auto}
  .scene-journal-button{appearance:none;cursor:pointer;min-height:38px;
    border:solid transparent;border-width:8px 13px;
    border-image-source:url('/ui-kit/buttons/button-normal-trim.png');
    border-image-slice:50 180 45 180 fill;border-image-width:8px 13px;
    background:transparent;color:#2e1d11;white-space:nowrap;
    font:700 14px/1.3 var(--pall-font-reading,Georgia,serif)}
  .scene-journal-button:is(:hover,:focus-visible){border-image-source:url('/ui-kit/buttons/button-hover-trim.png')}
  .scene-journal-button:focus-visible{outline:2px solid #efd092;outline-offset:2px}
  .empty-journal{padding:22px clamp(16px,3vw,45px);background:#e6d5b5;color:#24160e;border-top:2px solid #94704a;scroll-margin-top:56px}
  .empty-journal small{font:700 13px var(--pall-font-label,'Arial Narrow',sans-serif)}
  .empty-journal h2{margin:5px 0 10px;font:600 23px Georgia,serif}
  .empty-journal p{font:600 16px/1.55 Georgia,serif}
  .chapter-content{display:flex;flex-direction:column;flex:1;min-width:0;padding:0}
  .chapter-content :global([id$="-journal"]){scroll-margin-top:56px}
  .onboarding-footer{border-top:1px solid #4d3928;padding:10px 17px;font:11px/1.5 sans-serif;color:#a99783;letter-spacing:.06em}
  .shell-dock{position:sticky;top:0;align-self:start;height:100vh;height:100dvh;min-width:0;overflow:auto;
    border-left:1px solid #56412d;background:#171715}
  .mobile-nav{display:none}

  /* HUD reflow is driven by the activity column's real width (rail, dock and
     window together), not the raw window width. */
  @container pall-shell (max-width:1039px){
    .topbar{grid-template-columns:minmax(0,1fr) auto;min-height:0}
    .player{grid-column:1;grid-row:1;min-height:56px}
    .top-extras{grid-column:2;grid-row:1}
    .resource-cluster{grid-column:1/-1;grid-row:2;border-right:0;border-top:1px solid #59432e;padding:6px 14px 8px}
    .chapter-meta{display:none}
  }
  @container pall-shell (max-width:599px){
    .topbar{grid-template-columns:minmax(0,1fr) auto}
    .player{padding:6px 10px;min-height:52px;border-right:0}
    .player :global(.portrait){width:36px;height:42px}
    .player strong{font-size:16px}
    .player small{font-size:12px}
    /* Stats stay beside the name; tools become one slim right-aligned row. */
    .top-extras{display:contents}
    .top-stats{grid-column:2;grid-row:1;padding:0 10px;gap:8px}
    .resource-cluster{grid-row:2;padding:6px 10px 7px}
    .top-tools{grid-column:1/-1;grid-row:3;justify-content:flex-end;gap:7px;
      padding:4px 10px 5px;border-left:0;border-top:1px solid #59432e}
    .resource-strip{gap:12px}
    .meter-label{font-size:12px}
    .meter-number{font-size:11px}
    .resource-track{height:15px}
    .minor-resources{gap:12px}
    .minor-resource{font-size:11px}
    .stat img{width:21px;height:21px}
    .stat strong{font-size:15px}
    .stat.stage{padding-left:7px}
    .stat.stage strong{font-size:13px}
    .city-banner{height:66px;padding:6px 12px;gap:10px}
    .banner-overline{display:none}
    .banner-copy small{font-size:12px}
    .gateway-text .gateway-status{display:none}
    .city-map-gateway{padding:5px 9px;gap:7px}
    .chapter-label{font-size:16px}
  }
  @container pall-shell (max-width:379px){
    .gateway-title{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}
    .stat small{font-size:11px}
    .meter-heading{flex-direction:column;align-items:flex-start;gap:3px}
  }

  /* Compact icon rail: keeps the shell recognisable while handing the width
     to the activity on small laptops and tablets. Labels stay accessible. */
  @media(max-width:1199px){
    .frame{--pall-rail-w:72px}
    .identity{min-height:72px;padding:8px 6px}
    .brand-logo{width:58px;max-height:44px}
    .motto,.rail-footer,.lock{display:none}
    .nav-list{padding:6px 5px}
    .nav-entry{justify-content:center;min-height:44px;padding:6px 4px}
    .nav-text,.locked-heading{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}
    .nav-rule{margin:6px 12px}
  }
  @media(min-width:1200px) and (max-height:879px){
    .rail-footer{display:none}
  }
  @media(max-width:760px){
    .frame,.frame.has-dock{display:block;width:100%;min-height:100vh;min-height:100dvh;margin:0;padding:0}
    .rail{display:none}
    /* A docked panel cannot fit beside a phone scene; services must use a drawer here. */
    .shell-dock{display:none}
    .right{min-height:100vh;min-height:100dvh;border:0;border-radius:0;padding-bottom:calc(65px + env(safe-area-inset-bottom))}
    .chapter-bar{padding:3px 9px;gap:7px}
    .exit-link{display:none}
    .rewind-button{padding:6px;font-size:11px;white-space:normal;max-width:125px}
    .scene-journal-button{font-size:13px}
    .chapter-content{padding:0}
    .mobile-nav{position:fixed;bottom:0;left:0;right:0;display:grid;grid-template-columns:repeat(4,1fr);background:#11100f;border-top:1px solid #89643c;z-index:30;min-height:65px;padding-bottom:env(safe-area-inset-bottom)}
    .mobile-nav a,.mobile-nav>span{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;padding:7px 2px;color:#dec8aa;text-decoration:none;font:11px sans-serif}
    .mobile-nav a[aria-current]{background:#423020}
    .mobile-nav a span,.mobile-nav>span span{font:21px Georgia,serif}
    .mobile-nav>span{opacity:.45}
  }
  @media(pointer:coarse){
    .scene-journal-button{min-height:44px}
    .account-link a{min-height:44px}
  }
  @media(prefers-reduced-motion:reduce){
    .meter-fill{transition:none}
  }
</style>
