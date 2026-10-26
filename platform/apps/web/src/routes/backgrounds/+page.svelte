<script lang="ts">
  import {onMount} from 'svelte';
  import {goto} from '$app/navigation';
  import {APPROVED_BACKGROUND_SELECTION} from '$lib/approved-introductions';

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
    if (!selected || !roster || busy || roster.slots.used >= roster.slots.limit) return;
    busy = true;
    creationMessage = '';
    const signature = JSON.stringify([name, selected.origin, selectedSex, roster.revision]);
    if (signature !== pendingSignature || !pendingRequestId) {
      pendingRequestId = crypto.randomUUID();
      pendingSignature = signature;
    }
    try {
      const response = await fetch('/api/characters', {
        method: 'POST',
        headers: {'content-type': 'application/json'},
        body: JSON.stringify({
          name, origin: selected.origin, sex: selectedSex,
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

<div class="shell">
  <main>
    {#if loading === 'checking'}
      <p role="status">Checking your account…</p>
    {:else if loading === 'login'}
      <h1>Account required</h1>
      <p>Sign in before choosing a background.</p>
      <a class="action" href="/account">Sign in</a>
    {:else if loading === 'unavailable' || !catalogue}
      <h1>Account service unavailable</h1>
      <p>Check the local API and PostgreSQL, then refresh.</p>
      <a href="/account">Account</a>
    {:else}
      <p class="eyebrow">THE PALL · CHARACTER CREATION / CHARACTER CREATION</p>
      <h1>{APPROVED_BACKGROUND_SELECTION.heading}</h1>
      <p class="intro">{APPROVED_BACKGROUND_SELECTION.introduction}</p>

      <div class="choices" aria-label="Six backgrounds">
        {#each APPROVED_BACKGROUND_SELECTION.origins as origin}
          <button
            class:active={selectedOrigin === origin.origin}
            aria-pressed={selectedOrigin === origin.origin}
            onclick={() => {selectedOrigin = origin.origin;}}
            type="button">
            <span class="origin-name">{origin.heading}</span>
            <span class="description">{origin.description}</span>
            <span class="advantage"><em>Advantage:</em> {origin.advantage}</span>
          </button>
        {/each}
      </div>

      <section class="approved-ending">
        {#each APPROVED_BACKGROUND_SELECTION.closing as paragraph}
          <p>
            {#each paragraph as segment}
              {#if segment.style === 'strong'}<strong>{segment.text}</strong>
              {:else if segment.style === 'em'}<em>{segment.text}</em>
              {:else}{segment.text}{/if}
            {/each}
          </p>
        {/each}
      </section>

      {#if selected}
        <section class="preview" aria-label="Selected character preview">
          <p class="eyebrow">CHARACTER STARTING PREVIEW</p>
          <h2>{selected.origin}</h2>
          <p class="small">Select the portrait variant. Final portrait artwork has not yet been approved or connected.</p>
          <div class="variant" role="group" aria-label="Portrait sex">
            <button type="button" class:active={selectedSex === 'Male'} aria-pressed={selectedSex === 'Male'} onclick={() => {selectedSex = 'Male';}}>Male</button>
            <button type="button" class:active={selectedSex === 'Female'} aria-pressed={selectedSex === 'Female'} onclick={() => {selectedSex = 'Female';}}>Female</button>
          </div>
          <div class="preview-content">
            <div class="portrait" role="img" aria-label="{selected.origin} {selectedSex} portrait not yet available">
              <span>{selected.origin} · {selectedSex}</span>
              <small>Portrait asset pending</small>
            </div>
            <div class="stats">
              <p><strong>{selected.majorSkill} +{catalogue.startingFacts.originMajorSkillBonusLevels}</strong></p>
              <p>STR {catalogue.startingFacts.attributes.STR} · DEX {catalogue.startingFacts.attributes.DEX} · INT {catalogue.startingFacts.attributes.INT} · RES {catalogue.startingFacts.attributes.RES}</p>
              <p>Maximum Health: {catalogue.startingFacts.maximumHealth}</p>
              <p>Starting coins: {catalogue.startingFacts.startingCoins}</p>
              <p>Starting equipment: {catalogue.startingFacts.starterItemDisplayNames.join(', ')}</p>
              <p class="small">Basic Clothes and Crude Small Bag are recorded as starter requirements, not equippable item IDs yet.</p>
            </div>
          </div>
          <form class="creation" onsubmit={(event) => {event.preventDefault(); void createCharacter();}}>
            <label for="character-name">Character name</label>
            <input id="character-name" type="text" bind:value={name} minlength="3" maxlength="80" autocomplete="off" required placeholder="3–24 visible characters" />
            <p class="small">Character names are globally unique, regardless of case. Character deletion and renaming are not available in this version.</p>
            {#if roster}
              <p class="small">Character slots: {roster.slots.used} / {roster.slots.limit}</p>
              <button class="confirm" type="submit" disabled={busy || roster.slots.used >= roster.slots.limit}>{busy ? 'Creating…' : 'Create character'}</button>
            {:else}
              <p role="alert">Character database unavailable. Run the M1.2 migration and restart the API; preview is still available.</p>
            {/if}
            {#if creationMessage}<p role="alert">{creationMessage}</p>{/if}
          </form>
        </section>
      {/if}

      <nav class="bottom">
        <a href="/introduction">World introduction</a>
        <a href="/characters">Your characters</a>
        <a href="/account">Account</a>
      </nav>
      <p class="development">M1.2 development interface. Background descriptions are approved word for word; layout, assets and unintegrated tutorial scenes are not final.</p>
    {/if}
  </main>
</div>

<style>
  :global(body) {margin: 0; background: #151717; color: #e6dece; font-family: Georgia, 'Times New Roman', serif;}
  :global(a) {color: #ddba88;}
  .shell {min-height: 100vh; padding: 32px 18px 50px; background: radial-gradient(ellipse at 60% 5%, #302b26 0%, #151717 66%); box-sizing: border-box;}
  main {max-width: 1060px; margin: auto; padding: clamp(22px, 4vw, 44px); background: #201f1d; border: 1px solid #675341;}
  .eyebrow {font: 11px/1.5 sans-serif; letter-spacing: .16em; color: #c9a97e;}
  h1 {font-size: clamp(30px, 4vw, 44px); font-weight: normal; margin: 12px 0 18px; letter-spacing: .04em;}
  .intro {font-size: 17px; line-height: 1.55; max-width: 880px; margin-bottom: 26px;}
  .choices {display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 12px;}
  .choices button {padding: 20px; text-align: left; border: 1px solid #64523e; background: #292723; color: #e8dfce; cursor: pointer; font: inherit; display: flex; flex-direction: column; gap: 12px; line-height: 1.42;}
  .choices button:hover {border-color: #be9868; background: #302b25;}
  .choices button.active {background: #3b3128; border-color: #e0b881;}
  .choices button:focus-visible, .variant button:focus-visible {outline: 2px solid #e0b881; outline-offset: 3px;}
  .origin-name {font: bold 16px/1.3 Georgia, serif; color: #f0d6aa;}
  .description, .advantage {font-size: 15px;}
  .advantage {color: #d4c4ad;}
  .approved-ending {padding: 15px 0 0; max-width: 880px; font-size: 16px; line-height: 1.5;}
  .approved-ending p {margin: 15px 0;}
  .preview {margin-top: 32px; padding: 20px; background: #262520; border: 1px solid #6a553b;}
  .preview h2 {margin: 6px 0 14px; font-weight: normal;}
  .variant {display: flex; gap: 8px; margin: 16px 0;}
  .variant button {padding: 10px 22px; background: #342c24; border: 1px solid #816344; color: #e6d6bb; cursor: pointer;}
  .variant button.active {background: #654b31; border-color: #dab780;}
  .preview-content {display: grid; grid-template-columns: 200px 1fr; gap: 24px; align-items: start;}
  .portrait {min-height: 225px; display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 18px; background: #1c1c1b; border: 1px dashed #78644b; color: #d9c39e; text-align: center;}
  .portrait small, .small, .development {font: 12px/1.6 sans-serif; color: #b1a394;}
  .stats {font-size: 16px; line-height: 1.5;}
  .stats p {margin: 0 0 14px;}
  .bottom {display: flex; gap: 24px; flex-wrap: wrap; border-top: 1px solid #5a4837; margin-top: 32px; padding-top: 22px; font: 14px sans-serif;}
  .development {margin-top: 22px;}
  @media (max-width: 700px) {
    .choices {grid-template-columns: 1fr;}
    .preview-content {grid-template-columns: 1fr;}
    .portrait {min-height: 145px;}
  }
  .creation {margin-top:24px;border-top:1px solid #655039;padding-top:24px;max-width:550px;}
  .creation label {display:block;margin-bottom:8px;}
  .creation input {width:100%;box-sizing:border-box;padding:12px;background:#f5f0e6;color:#24211d;font:17px Georgia,serif;}
  .creation .confirm {padding:12px 18px;background:#5b4028;color:#f9e2b9;border:1px solid #b48f60;cursor:pointer;}
  .creation .confirm:disabled {opacity:.5;cursor:not-allowed;}
  .creation [role=alert] {color:#f0b9a9;line-height:1.5;}
</style>
