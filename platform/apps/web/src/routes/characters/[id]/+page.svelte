<script lang="ts">
  import {onMount} from 'svelte';
  import {page} from '$app/state';
  import TutorialShell from '$lib/TutorialShell.svelte';

  type Character = {
    id: string; name: string; sex: string; origin: string;
    attributes: {STR: number; DEX: number; INT: number; RES: number};
    health: {current: number; maximum: number};
    coins: number;
    majorSkillBonuses: Record<string, number>;
    starterItemRequirements: {name: string; quantity: number}[];
    startingLocation: string;
    tutorial: {stage: number; status: string};
  };

  let character = $state<Character | null>(null);
  let status = $state<'loading' | 'ready' | 'unauthorized' | 'missing' | 'error'>('loading');

  onMount(() => {
    void (async () => {
      try {
        const response = await fetch('/api/characters/' + encodeURIComponent(page.params.id), {cache: 'no-store'});
        if (response.status === 401) {status = 'unauthorized'; return;}
        if (response.status === 404) {status = 'missing'; return;}
        if (!response.ok) {status = 'error'; return;}
        const body = await response.json() as {character: Character};
        character = body.character;
        status = 'ready';
      } catch {status = 'error';}
    })();
  });
</script>
<svelte:head><title>The Pall — Your Character</title></svelte:head>

{#if status === 'ready' && character}
  <TutorialShell {character} activePage="character">
    <section class="character-panel">
      <p class="eyebrow">CHARACTER · {character.origin.toUpperCase()}</p>
      <h1>{character.name}</h1>
      <p class="identity">{character.sex} · {character.origin} · {character.startingLocation}</p>

      <div class="cards">
        <section class="panel">
          <h2>Condition</h2>
          <div class="data-row"><span>Health</span><strong>{character.health.current} / {character.health.maximum}</strong></div>
          <div class="data-row"><span>Coins</span><strong>{character.coins}</strong></div>
          <div class="data-row"><span>Introduction</span><strong>Stage {character.tutorial.stage} / 8</strong></div>
          <div class="data-row"><span>Status</span><strong>{character.tutorial.status.replaceAll('_', ' ')}</strong></div>
        </section>
        <section class="panel">
          <h2>Attributes</h2>
          <div class="attributes">
            <div><small>STR</small><strong>{character.attributes.STR}</strong></div>
            <div><small>DEX</small><strong>{character.attributes.DEX}</strong></div>
            <div><small>INT</small><strong>{character.attributes.INT}</strong></div>
            <div><small>RES</small><strong>{character.attributes.RES}</strong></div>
          </div>
          <h2>Starting Major Skill</h2>
          {#each Object.entries(character.majorSkillBonuses) as [skill, levels]}
            <p>{skill} +{levels} levels</p>
          {/each}
        </section>
      </div>
      <section class="panel supplies">
        <h2>Starting equipment requirements</h2>
        <p>{character.starterItemRequirements.map(item => item.name + ' × ' + item.quantity).join(', ')}</p>
        <p class="muted">The actual equippable item records are still pending. No unapproved items have been added to your inventory.</p>
      </section>

      {#if character.tutorial.stage === 1 && character.tutorial.status === 'NOT_STARTED'}
        <p><a class="enter" href={'/characters/' + character.id + '/opening'}>Enter {character.startingLocation}</a></p>
        <p class="muted">This opening is replayable. Stage 2 and server-owned work progression are not connected yet.</p>
      {:else}
        <p class="muted">This character is not at the start of Stage 1. No other origin's opening will be substituted.</p>
      {/if}
    </section>
  </TutorialShell>
{:else}
  <main class="fallback">
    {#if status === 'loading'}
      <p role="status">Loading character…</p>
    {:else if status === 'unauthorized'}
      <h1>Sign in required</h1>
      <p><a href="/account">Go to account</a></p>
    {:else if status === 'missing'}
      <h1>Character not found</h1>
      <p>This character either does not exist or does not belong to your account.</p>
    {:else}
      <h1>Character service unavailable</h1>
      <p>Check the local API and PostgreSQL.</p>
    {/if}
    <nav><a href="/characters">Character selection</a> · <a href="/account">Account</a></nav>
  </main>
{/if}

<style>
  :global(body){margin:0;background:#151717;color:#e9dfcd;font-family:Georgia,serif}
  :global(a){color:#e2bd8d}
  .fallback{max-width:760px;margin:6vh auto;padding:30px;background:#24221f;border:1px solid #756047}
  .fallback h1{font-weight:normal}
  .fallback nav{border-top:1px solid #574633;padding-top:18px;margin-top:20px}
  .character-panel{padding:clamp(18px,3vw,34px);background:#24211e;border:1px solid #57412e}
  .eyebrow{font:11px sans-serif;letter-spacing:.15em;color:#d1ae83}
  h1{font-size:clamp(28px,4vw,40px);font-weight:normal;margin:10px 0 7px}
  .identity{color:#d1bea2;margin-bottom:22px}
  .cards{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}
  .panel{padding:20px;border:1px solid #655039;background:#2b2722;min-width:0}
  .panel h2{margin:0 0 17px;font-size:21px;font-weight:normal;color:#ead0aa}
  .data-row{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:8px 0;border-bottom:1px solid #453a30}
  .data-row strong{font-size:15px;text-align:right}
  .attributes{display:grid;grid-template-columns:repeat(4,1fr);gap:9px;margin-bottom:25px}
  .attributes>div{display:flex;flex-direction:column;align-items:center;gap:7px;padding:12px 5px;border:1px solid #594732}
  .attributes small{font:12px sans-serif;color:#beab91}
  .attributes strong{font-size:22px}
  .supplies{margin-top:16px}
  .supplies p{line-height:1.5}
  .muted{color:#b7afa2;line-height:1.5;font-size:14px}
  .enter{display:inline-block;padding:12px 19px;border:1px solid #b58e56;background:#4c3524;color:#f3d6ae;text-decoration:none;margin-top:20px}
  .enter:hover,.enter:focus-visible{background:#67472d}
  @media(max-width:660px){.cards{grid-template-columns:1fr}.character-panel{padding:13px}.panel{padding:15px}}
</style>
