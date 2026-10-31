<script lang="ts">
  import {onMount} from 'svelte';
  import {goto} from '$app/navigation';
  import {APPROVED_BACKGROUND_SELECTION} from '$lib/approved-introductions';
  import '$lib/pall-owner-ui.css';
  import '$lib/pall-entry-pages.css';
  import PortraitCarousel from '$lib/PortraitCarousel.svelte';
  import {originVisual} from '$lib/origin-visuals';

  type OriginFact = {origin: string; socialRole: string; majorSkill: string};
  type Catalogue = {
    status: 'read_only_preview';
    origins: OriginFact[];
    startingFacts: {
      attributes: {STR: number; DEX: number; INT: number; RES: number};
      maximumHealth: number;
      startingCoins: number;
      starterItemDisplayNames: string[];
      originMajorSkillBonusLevels: number;
    };
  };

  let catalogue = $state<Catalogue | null>(null);
  let loading = $state<'checking' | 'ready' | 'login' | 'unavailable'>('checking');
  let selectedOrigin = $state<string | null>(null);
  let selectedSex = $state<'Male' | 'Female'>('Male');
  let selectedAvatarId = $state<string | null>(null);
  const selected = $derived(catalogue?.origins.find(o => o.origin === selectedOrigin) ?? null);
  type Roster = {revision: number; slots: {used: number; limit: number}};
  let roster = $state<Roster | null>(null);
  let name = $state('');
  let busy = $state(false);
  let creationMessage = $state('');
  let pendingRequestId: string | null = null;
  let pendingSignature: string | null = null;

  async function refreshRoster() {
    const response = await fetch('/api/characters', {cache: 'no-store'});
    if (!response.ok) {roster = null; return;}
    roster = await response.json() as Roster;
  }

  async function createCharacter() {
    if (!selected || !selectedAvatarId || !roster || busy || roster.slots.used >= roster.slots.limit) return;
    busy = true;
    creationMessage = '';
    const signature = JSON.stringify([name, selected.origin, selectedSex, selectedAvatarId, roster.revision]);
    if (signature !== pendingSignature || !pendingRequestId) {
      pendingRequestId = crypto.randomUUID();
      pendingSignature = signature;
    }
    try {
      const response = await fetch('/api/characters', {
        method: 'POST',
        headers: {'content-type': 'application/json'},
        body: JSON.stringify({
          name, origin: selected.origin, sex: selectedSex, avatarId: selectedAvatarId,
          requestId: pendingRequestId, expectedRevision: roster.revision
        })
      });
      const body = await response.json() as {error?: string; character?: {id: string}};
      if (response.ok && body.character) {
        pendingRequestId = null;
        pendingSignature = null;
        await goto('/characters');
        return;
      }
      const errors: Record<string, string> = {
        invalid_name: 'Name must be 3–24 characters and contain letters with internal spaces, apostrophes or hyphens.',
        name_taken: 'That character name is already in use.',
        slots_full: 'All six character slots are occupied.',
        stale_revision: 'Your character list changed. Review it and try again.',
        invalid_origin: 'Select an approved origin.',
        invalid_sex: 'Select a portrait variant.',
        invalid_avatar: 'Choose one of the available portraits.',
        idempotency_key_reuse: 'This request was already used for another character. Review the form.'
      };
      creationMessage = errors[body.error ?? ''] ?? 'Character creation failed: ' + (body.error ?? 'server error');
      if (body.error === 'stale_revision' || body.error === 'slots_full' || body.error === 'idempotency_key_reuse') {
        await refreshRoster();
        pendingRequestId = null;
      }
    } catch {
      creationMessage = 'Cannot reach the API. You can retry with the same request; it will not duplicate a saved character.';
    } finally {
      busy = false;
    }
  }


  onMount(() => {
    void (async () => {
      try {
        const response = await fetch('/api/characters/catalogue', {cache: 'no-store'});
        if (response.status === 401) {loading = 'login'; return;}
        if (!response.ok) {loading = 'unavailable'; return;}
        const data = await response.json() as Catalogue;
        // Malformed data should not cause a false claim about approved origins.
        if (data.status !== 'read_only_preview' || data.origins.length !== 6) {
          loading = 'unavailable';
          return;
        }
        catalogue = data;
        await refreshRoster();
        loading = 'ready';
      } catch {loading = 'unavailable';}
    })();
  });
</script>

<svelte:head>
  <title>The Pall — Choose Your Background</title>
  <meta name="description" content="The Pall — approved six-background introduction" />
</svelte:head>

<div class="entry-page backgrounds-page">
  <div class="entry-wrap">
    <!-- The approved city masthead spans both navigation and title. -->
    <div class="backgrounds-masthead">
      <nav class="entry-nav" aria-label="Page navigation">
        <a class="brand" href="/introduction" aria-label="The Pall, world introduction">
          <img src="/ui-kit/branding/logo-compact.png" alt="The Pall"/>
        </a>
        <div class="entry-links">
          <a href="/characters">Your characters</a>
          <a href="/account">Account</a>
        </div>
      </nav>
      <header class="entry-hero">
        <div>
          <span class="entry-eyebrow">Character creation</span>
          <h1>{APPROVED_BACKGROUND_SELECTION.heading}</h1>
        </div>
      </header>
    </div>
    <main class="entry-content backgrounds-content">
      {#if loading==='checking'}
        <div class="state-notice"><p role="status">Checking your account…</p></div>
      {:else if loading==='login'}
        <div class="state-notice">
          <h2>Account required</h2><p>Sign in before choosing a background.</p>
          <a class="entry-button" href="/account">Sign in</a>
        </div>
      {:else if loading==='unavailable'||!catalogue}
        <div class="state-notice">
          <h2>Account service unavailable</h2><p>Check the local API and database, then refresh.</p>
        </div>
      {:else}
        <p class="intro">{APPROVED_BACKGROUND_SELECTION.introduction}</p>
        <div class="origin-layout">
          <section class="origin-section" aria-label="Choose one of six backgrounds">
            <div class="origin-grid">
              {#each APPROVED_BACKGROUND_SELECTION.origins as origin (origin.origin)}
                <button type="button" class="origin-card" class:active={selectedOrigin===origin.origin}
                  aria-pressed={selectedOrigin===origin.origin}
                  onclick={()=>{selectedOrigin=origin.origin;creationMessage='';}}>
                  <span class="origin-art" style={'background-image:linear-gradient(0deg,#17140fef,#17140f3e),url("'+originVisual(origin.origin).src+'")'}></span>
                  <span class="origin-text">
                    <strong>{origin.heading}</strong>
                    <span>{origin.description}</span>
                    <small><em>Advantage:</em> {origin.advantage}</small>
                  </span>
                </button>
              {/each}
            </div>
            <div class="approved-ending">
              {#each APPROVED_BACKGROUND_SELECTION.closing as paragraph}
                <p>{#each paragraph as segment}
                  {#if segment.style==='strong'}<strong>{segment.text}</strong>
                  {:else if segment.style==='em'}<em>{segment.text}</em>
                  {:else}{segment.text}{/if}
                {/each}</p>
              {/each}
            </div>
          </section>
          <aside class="character-preview" aria-label="Character preview and portrait selection">
            {#if selected}
              <span class="entry-eyebrow">Starting character · {selected.origin}</span>
              <h2>{selected.origin}</h2>
              <div class="sex-selector" role="group" aria-label="Character sex">
                <button type="button" class:active={selectedSex==='Male'}
                  aria-pressed={selectedSex==='Male'}
                  onclick={()=>{selectedSex='Male';selectedAvatarId=null;}}>Male</button>
                <button type="button" class:active={selectedSex==='Female'}
                  aria-pressed={selectedSex==='Female'}
                  onclick={()=>{selectedSex='Female';selectedAvatarId=null;}}>Female</button>
              </div>
              <p class="entry-muted">Choose your portrait with the arrows, or select the one displayed. All eight portraits in each set are available to every background.</p>
              <PortraitCarousel sex={selectedSex} selectedId={selectedAvatarId}
                onSelect={(id)=>{selectedAvatarId=id;}}/>
              <div class="starting-facts">
                <p><strong>{selected.majorSkill} +{catalogue.startingFacts.originMajorSkillBonusLevels}</strong></p>
                <p>STR {catalogue.startingFacts.attributes.STR} · DEX {catalogue.startingFacts.attributes.DEX} · INT {catalogue.startingFacts.attributes.INT} · RES {catalogue.startingFacts.attributes.RES}</p>
                <p>Maximum Health: {catalogue.startingFacts.maximumHealth}</p>
                <p>Starting coins: {catalogue.startingFacts.startingCoins}</p>
                <p>Starting equipment: {catalogue.startingFacts.starterItemDisplayNames.join(', ')}</p>
                <p class="entry-muted">Equipment names are starter requirements; inventory item IDs are not yet implemented.</p>
              </div>
              <form class="creation" onsubmit={(event)=>{event.preventDefault();void createCharacter();}}>
                <label for="character-name">Character name</label>
                <input id="character-name" type="text" bind:value={name} minlength="3"
                  maxlength="80" autocomplete="off" required placeholder="3–24 visible characters"/>
                {#if roster}
                  <p class="entry-muted">Character slots: {roster.slots.used} / {roster.slots.limit}</p>
                  <button class="entry-button" type="submit"
                    disabled={busy||!selectedAvatarId||roster.slots.used>=roster.slots.limit}>
                    {busy?'Creating…':'Create character'}
                  </button>
                  {#if !selectedAvatarId}<p class="entry-muted">Choose a portrait to continue.</p>{/if}
                {:else}
                  <p role="alert" class="entry-error">Character database unavailable.</p>
                {/if}
                {#if creationMessage}<p role="alert" class="entry-error">{creationMessage}</p>{/if}
              </form>
            {:else}
              <span class="entry-eyebrow">Your beginning</span>
              <h2>Choose a background</h2>
              <p>Choose one of the six backgrounds to see your starting attributes and select a portrait.</p>
            {/if}
          </aside>
        </div>
        <nav class="bottom"><a href="/introduction">World introduction</a><a href="/characters">Your characters</a></nav>
      {/if}
    </main>
  </div>
</div>

<style>
  /* Restyle only the /backgrounds route. Canonical copy and character rules live
     elsewhere; visual selection must retain the existing button semantics. */
  .backgrounds-page{padding-top:13px}
  .backgrounds-page .entry-wrap{max-width:1160px}

  /* Shared full-width masthead: no separate dark bar above the city. */
  .backgrounds-masthead{
    position:relative;
    isolation:isolate;
    overflow:hidden;
    border:1px solid #745538;
    background:#24201b url('/ui-kit/resources/TheCityVista.png') center 31%/cover no-repeat;
  }
  .backgrounds-masthead::before{
    content:'';
    position:absolute;
    inset:0;
    z-index:0;
    pointer-events:none;
    background:
      linear-gradient(90deg,#15120fec 0%,#15120fc6 27%,#15120f37 67%,transparent 100%),
      linear-gradient(180deg,#100e0cbd 0%,#100e0c55 25%,transparent 58%);
  }
  .backgrounds-page .entry-nav{
    position:relative;
    z-index:1;
    flex-wrap:wrap;
    gap:12px;
    padding:10px clamp(14px,2.4vw,30px) 12px;
    border:0;
    background:transparent;
  }
  .backgrounds-page .entry-nav .brand img{
    display:block;
    width:clamp(174px,17vw,228px);
    max-height:118px;
    height:auto;
    object-fit:contain;
    filter:drop-shadow(0 2px 5px #0b0807cc);
  }
  .backgrounds-page .entry-links{justify-content:flex-end;gap:clamp(5px,.7vw,10px)}
  .backgrounds-page .entry-hero{
    position:relative;
    z-index:1;
    display:flex;
    align-items:flex-end;
    min-height:clamp(190px,20vw,230px);
    max-height:none;
    border:0;
    padding:clamp(24px,3vw,40px);
    background:transparent;
  }
  .backgrounds-page .entry-hero::after{
    content:'';
    position:absolute;
    inset:0;
    z-index:0;
    pointer-events:none;
    background:linear-gradient(0deg,#15120fc9,transparent 67%);
  }
  .backgrounds-page .entry-hero > div{position:relative;z-index:1}
  .backgrounds-page .entry-hero h1{
    margin:8px 0 0;
    font:600 clamp(30px,4vw,54px)/1.13 var(--pall-font-reading,Georgia,serif);
    letter-spacing:-.02em;
    color:#f7e5cd;
  }

  /* Grey Marches scene is already an approved roster asset: place it behind
     the parchment surfaces rather than misassigning it to any origin. */
  .backgrounds-page .backgrounds-content{
    padding:clamp(16px,3vw,36px);
    border:1px solid #59452f;
    border-top:0;
    background:
      linear-gradient(180deg,#15130fe0 0%,#17130fcc 48%,#15120ff2 100%),
      url('/locations/characters/GreyMarches_background01.png') center 38%/cover no-repeat,
      #211d1a;
  }

  /* Nine-slice art is reused only on actual action controls, not portraits. */
  .backgrounds-page .entry-links a,
  .backgrounds-page .entry-button,
  .backgrounds-page .sex-selector button,
  .backgrounds-page .bottom a{
    display:inline-flex;
    align-items:center;
    justify-content:center;
    border-style:solid;
    border-color:transparent;
    border-image-source:url('/ui-kit/buttons/button-normal-trim.png');
    border-image-slice:50 180 45 180 fill;
    border-image-repeat:stretch;
    border-radius:0;
    background:transparent;
    color:#25170e;
    font:600 15px/1.3 var(--pall-font-reading,Georgia,serif);
    text-align:center;
    text-decoration:none;
    text-shadow:none;
    cursor:pointer;
  }
  .backgrounds-page .entry-links a{
    min-height:42px;
    padding:2px 5px;
    border-width:10px 21px 9px;
    border-image-width:10px 21px 9px;
    white-space:nowrap;
  }
  .backgrounds-page .entry-button,
  .backgrounds-page .bottom a{
    min-height:48px;
    padding:3px 8px;
    border-width:12px 27px 11px;
    border-image-width:12px 27px 11px;
    max-width:100%;
  }
  .backgrounds-page .entry-links a:hover,
  .backgrounds-page .entry-button:hover:not(:disabled),
  .backgrounds-page .sex-selector button:hover,
  .backgrounds-page .bottom a:hover{
    border-image-source:url('/ui-kit/buttons/button-hover-trim.png');
    color:#170d08;
    background:transparent;
    text-decoration:none;
  }
  .backgrounds-page .entry-links a:active,
  .backgrounds-page .entry-button:active:not(:disabled),
  .backgrounds-page .sex-selector button:active,
  .backgrounds-page .bottom a:active{
    border-image-source:url('/ui-kit/buttons/button-pressed-trim.png');
  }
  .backgrounds-page .entry-links a:focus-visible,
  .backgrounds-page .entry-button:focus-visible,
  .backgrounds-page .sex-selector button:focus-visible,
  .backgrounds-page .bottom a:focus-visible,
  .backgrounds-page .creation input:focus-visible{
    outline:2px solid #a66d36;
    outline-offset:3px;
  }
  .backgrounds-page .entry-button:disabled{opacity:.58;cursor:not-allowed}

  /* A single introductory parchment plaque. */
  .backgrounds-page .intro,
  .backgrounds-page .approved-ending,
  .backgrounds-page .character-preview,
  .backgrounds-page .state-notice{
    min-width:0;
    border-style:solid;
    border-color:transparent;
    border-image-source:url('/ui-kit/frames/dialogue-frame-trim.png');
    border-image-slice:145 190 125 190 fill;
    border-image-repeat:stretch;
    border-radius:0;
    background:transparent;
    color:#332217;
    box-shadow:0 7px 19px #0006;
  }
  .backgrounds-page .intro{
    max-width:none;
    margin:0 0 23px;
    padding:11px clamp(12px,2vw,22px);
    border-width:23px 29px 22px;
    border-image-width:23px 29px 22px;
    font:400 clamp(16px,1.5vw,18px)/1.55 Georgia,'Times New Roman',serif;
    color:#342216;
  }
  .backgrounds-page .state-notice{
    max-width:640px;
    margin:0 auto;
    border-width:25px 29px 23px;
    border-image-width:25px 29px 23px;
    padding:15px 18px 20px;
  }
  .backgrounds-page .state-notice h2{color:#29190e}
  .backgrounds-page .state-notice p{color:#332217}

  /* Preserve the real six-option selection, two-column card arrangement. */
  .backgrounds-page .origin-layout{
    display:grid;
    grid-template-columns:minmax(0,1.3fr) minmax(315px,.9fr);
    gap:clamp(14px,2vw,23px);
    align-items:start;
  }
  .backgrounds-page .origin-section{min-width:0}
  .backgrounds-page .origin-grid{
    display:grid;
    grid-template-columns:repeat(2,minmax(0,1fr));
    gap:clamp(10px,1.25vw,15px);
    align-items:stretch;
  }
  .backgrounds-page .origin-card{
    display:flex;
    flex-direction:column;
    min-width:0;
    width:100%;
    padding:0;
    overflow:hidden;
    border:1px solid #886743;
    border-radius:0;
    background:#231c16;
    color:#f1e3cb;
    text-align:left;
    cursor:pointer;
    box-shadow:0 6px 16px #0007;
    transition:border-color .12s ease,box-shadow .12s ease;
  }
  .backgrounds-page .origin-card:hover{
    border-color:#dfad6b;
    box-shadow:0 0 0 1px #c48d4e,0 8px 22px #0009;
  }
  .backgrounds-page .origin-card:focus-visible{
    outline:3px solid #f0bc76;
    outline-offset:3px;
  }
  .backgrounds-page .origin-card.active{
    border:2px solid #f0c084;
    box-shadow:0 0 0 2px #876038,0 0 21px #c08c4560;
  }
  .backgrounds-page .origin-art{
    display:block;
    width:100%;
    height:clamp(112px,11vw,150px);
    flex:none;
    background-size:cover;
    background-position:center 43%;
  }
  /* Plain parchment underneath each scene. Keep the metal frame for the
     main character preview, not for each of the six descriptions. */
  .backgrounds-page .origin-text{
    display:flex;
    flex:1;
    flex-direction:column;
    gap:10px;
    width:100%;
    min-width:0;
    padding:17px clamp(15px,1.7vw,20px) 20px;
    border:0;
    border-radius:0;
    background:linear-gradient(160deg,#f3e5cf 0%,#ead8b9 65%,#dfc6a2 100%);
    box-shadow:none;
    color:#352519;
    overflow-wrap:anywhere;
  }
  .backgrounds-page .origin-text strong{
    font:700 15px/1.35 var(--pall-font-reading,Georgia,serif);
    color:#27180e;
  }
  .backgrounds-page .origin-text>span{
    font:400 15px/1.45 Georgia,'Times New Roman',serif;
    color:#352519;
  }
  .backgrounds-page .origin-text small{
    display:block;
    margin-top:auto;
    padding-top:8px;
    border-top:1px solid #b79a72;
    font:400 14px/1.45 Georgia,'Times New Roman',serif;
    color:#4b3321;
  }
  .backgrounds-page .origin-text small em{
    color:#3b2517;
    font-style:normal;
    font-weight:700;
  }
  .backgrounds-page .approved-ending{
    margin:19px 0 0;
    padding:13px 18px 14px;
    border-width:25px 29px 23px;
    border-image-width:25px 29px 23px;
    font:400 15px/1.55 Georgia,'Times New Roman',serif;
  }
  .backgrounds-page .approved-ending p{
    margin:0 0 10px;
    color:#3b291b;
  }
  .backgrounds-page .approved-ending p:last-child{margin-bottom:0}
  .backgrounds-page .approved-ending strong{color:#27170e}

  /* Live preview stays alongside the grid on desktop; all server-authoritative
     starting facts and portrait choices remain data-driven. */
  .backgrounds-page .character-preview{
    position:sticky;
    top:14px;
    border-width:27px 31px 25px;
    border-image-width:27px 31px 25px;
    padding:13px clamp(10px,1.2vw,18px) 17px;
    color:#2b1c12;
  }
  .backgrounds-page .character-preview .entry-eyebrow{
    color:#614127;
    font-weight:700;
    overflow-wrap:anywhere;
  }
  .backgrounds-page .character-preview h2{
    color:#28180e;
    font:600 clamp(24px,2.4vw,30px)/1.18 var(--pall-font-reading,Georgia,serif);
    margin:8px 0 14px;
    overflow-wrap:anywhere;
  }
  .backgrounds-page .character-preview p{
    color:#352519;
    font:400 15px/1.53 Georgia,'Times New Roman',serif;
    overflow-wrap:anywhere;
  }
  .backgrounds-page .character-preview .entry-muted{
    color:#604630;
    font-size:14px;
  }
  .backgrounds-page .sex-selector{
    display:flex;
    gap:8px;
    margin:8px 0 15px;
    flex-wrap:wrap;
  }
  .backgrounds-page .sex-selector button{
    flex:1 1 90px;
    min-height:43px;
    border-width:10px 19px 9px;
    border-image-width:10px 19px 9px;
    padding:2px 5px;
  }
  .backgrounds-page .sex-selector button.active{
    border-image-source:url('/ui-kit/buttons/button-pressed-trim.png');
    color:#1e120b;
    filter:brightness(.93);
  }
  /* AvatarPicker owns its own selectable, contrast-safe portrait buttons;
     never override those with full-width parchment button styling. */
  .backgrounds-page .starting-facts{
    margin-top:19px;
    padding:14px 0 10px;
    border-top:1px solid #a58a67;
    border-bottom:1px solid #a58a67;
  }
  .backgrounds-page .starting-facts p{
    margin:0 0 9px;
    color:#352519;
  }
  .backgrounds-page .starting-facts strong{color:#24150c}
  .backgrounds-page .creation{padding:17px 0 2px}
  .backgrounds-page .creation label{
    display:block;
    margin:0 0 8px;
    color:#342215;
    font:600 16px/1.3 var(--pall-font-reading,Georgia,serif);
  }
  .backgrounds-page .creation input{
    width:100%;
    min-height:46px;
    padding:11px 12px;
    border:1px solid #876546;
    border-radius:0;
    background:#f8eddb;
    box-shadow:inset 0 2px 5px #3c291423;
    color:#24160f;
    font:16px/1.35 Georgia,'Times New Roman',serif;
  }
  .backgrounds-page .creation .entry-button{
    width:100%;
    margin-top:10px;
  }
  .backgrounds-page .creation .entry-error{
    background:#4f2921;
    color:#fff0e4;
    border-left:3px solid #9c3f2c;
    padding:10px 12px;
  }
  .backgrounds-page .bottom{
    display:flex;
    flex-wrap:wrap;
    gap:8px;
    padding:18px 0 0;
    margin:24px 0 0;
    border-top:1px solid #947047;
  }

  @media(max-width:920px){
    .backgrounds-page .origin-layout{grid-template-columns:1fr}
    .backgrounds-page .character-preview{position:static}
    .backgrounds-page .origin-art{height:145px}
  }
  @media(max-width:750px){
    .backgrounds-page .entry-nav{padding:8px 13px 10px}
    .backgrounds-page .entry-links{width:100%;justify-content:flex-start;gap:5px 8px}
    .backgrounds-page .entry-links a{
      min-height:37px;
      padding:1px 3px;
      border-width:8px 17px;
      border-image-width:8px 17px;
      font-size:14px;
    }
    .backgrounds-page .entry-nav .brand img{
      width:clamp(162px,35vw,205px);
      max-height:110px;
    }
    .backgrounds-masthead{background-position:55% 31%}
    .backgrounds-masthead::before{
      background:
        linear-gradient(180deg,#15120fdb 0%,#15120f70 38%,transparent 72%),
        linear-gradient(90deg,#15120fd9,#15120f22 100%);
    }
    .backgrounds-page .entry-hero{min-height:190px;padding:23px 21px}
  }
  @media(max-width:540px){
    .backgrounds-page .origin-grid{grid-template-columns:1fr}
    .backgrounds-page .origin-art{height:160px}
  }
  @media(max-width:420px){
    .backgrounds-page{padding:9px}
    .backgrounds-page .backgrounds-content{padding:12px}
    .backgrounds-page .intro,
    .backgrounds-page .approved-ending,
    .backgrounds-page .character-preview,
    .backgrounds-page .state-notice{
      border-width:23px 25px 22px;
      border-image-width:23px 25px 22px;
      padding:10px 9px 13px;
    }
    .backgrounds-page .origin-text{
      border-width:21px 22px 20px;
      border-image-width:21px 22px 20px;
    }
    .backgrounds-page .bottom a{width:100%}
  }
</style>