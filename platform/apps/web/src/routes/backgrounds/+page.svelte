<script lang="ts">
  import {onMount} from 'svelte';
  import {goto} from '$app/navigation';
  import {APPROVED_BACKGROUND_SELECTION} from '$lib/approved-introductions';
  import '$lib/pall-owner-ui.css';
  import '$lib/pall-entry-pages.css';
  import AvatarPicker from '$lib/AvatarPicker.svelte';
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

<div class="entry-page">
  <div class="entry-wrap">
    <nav class="entry-nav" aria-label="Page navigation">
      <a class="brand" href="/introduction"><img src="/ui-kit/branding/logo-compact.png" alt="The Pall"/><span>A CITY ENDURES</span></a>
      <div class="entry-links"><a href="/characters">Your characters</a><a href="/account">Account</a></div>
    </nav>
    <header class="entry-hero">
      <div><span class="entry-eyebrow">Character creation</span><h1>{APPROVED_BACKGROUND_SELECTION.heading}</h1></div>
    </header>
    <main class="entry-content">
      {#if loading==='checking'}
        <p role="status">Checking your account…</p>
      {:else if loading==='login'}
        <h2>Account required</h2><p>Sign in before choosing a background.</p>
        <a class="entry-button" href="/account">Sign in</a>
      {:else if loading==='unavailable'||!catalogue}
        <h2>Account service unavailable</h2><p>Check the local API and database, then refresh.</p>
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
              <p class="entry-muted">Choose your portrait. All eight portraits in each set are available to every background.</p>
              <AvatarPicker sex={selectedSex} selectedId={selectedAvatarId}
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
  .entry-hero{min-height:210px;max-height:255px}
  .intro{max-width:880px;margin:0 0 22px;font:500 18px/1.52 var(--pall-font-reading,Georgia,serif)}
  .origin-layout{display:grid;grid-template-columns:minmax(0,1.3fr) minmax(330px,.9fr);gap:19px;align-items:start}
  .origin-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:11px}
  .origin-card{display:flex;flex-direction:column;overflow:hidden;text-align:left;min-width:0;padding:0;
    background:#28231d;border:1px solid #725639;color:#f0e1c9;cursor:pointer}
  .origin-card:hover,.origin-card:focus-visible{border-color:#cb9f68}
  .origin-card.active{border:2px solid #efbd80;background:#372a20}
  .origin-art{display:block;height:105px;background-size:cover;background-position:center 43%}
  .origin-text{display:flex;flex-direction:column;gap:8px;padding:13px}
  .origin-text strong{font:600 16px/1.3 var(--pall-font-reading,Georgia,serif);color:#f7daaf}
  .origin-text>span{font:15px/1.42 var(--pall-font-reading,Georgia,serif)}
  .origin-text small{font:14px/1.42 var(--pall-font-reading,Georgia,serif);color:#d5c1a2}
  .approved-ending{border-top:1px solid #634a33;margin-top:20px;padding-top:8px;font-size:15px}
  .approved-ending p{margin:8px 0}
  .character-preview{border:1px solid #876b4a;background:#2b261f;padding:20px;position:sticky;top:14px}
  .character-preview h2{margin:7px 0 14px}
  .sex-selector{display:flex;gap:8px;margin:9px 0 13px}
  .sex-selector button{padding:9px 20px;border:1px solid #9a754d;color:#e9d1b1;
    background:#3c2e22;cursor:pointer;font:600 15px var(--pall-font-reading,Georgia,serif)}
  .sex-selector button.active{background:#70492b;border-color:#e4b477}
  .starting-facts{padding:15px 0 3px;border-bottom:1px solid #624a37}
  .starting-facts p{margin:0 0 9px}
  .creation{padding:18px 0 3px}
  .creation label{display:block;margin:0 0 8px}
  .creation input{width:100%;padding:11px;background:#eee4d1;border:1px solid #9d7b51;
    font:17px var(--pall-font-reading,Georgia,serif);color:#261b12}
  .creation .entry-button{margin-top:10px}
  .bottom{display:flex;gap:20px;border-top:1px solid #664b35;margin-top:22px;padding-top:16px}
  .bottom a{color:#e7c08b}
  @media(max-width:920px){.origin-layout{grid-template-columns:1fr}.character-preview{position:static}}
  @media(max-width:540px){.origin-grid{grid-template-columns:1fr}.origin-art{height:115px}}
</style>