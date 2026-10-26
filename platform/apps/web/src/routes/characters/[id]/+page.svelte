<script lang="ts">
  import {onMount} from 'svelte';
  import {page} from '$app/state';

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
<svelte:head><title>The Pall — Character Selection</title></svelte:head>
<main>
  <p class="eyebrow">THE PALL · CHARACTER SELECTION</p>
  {#if status === 'loading'}
    <p role="status">Loading character…</p>
  {:else if status === 'unauthorized'}
    <h1>Sign in required</h1>
    <p><a href="/account">Go to account</a></p>
  {:else if status === 'missing'}
    <h1>Character not found</h1>
    <p>This character either does not exist or does not belong to your account.</p>
  {:else if status === 'error' || !character}
    <h1>Character service unavailable</h1>
    <p>Check the local API and PostgreSQL.</p>
  {:else}
    <h1>{character.name}</h1>
    <p>{character.origin} · {character.sex}</p>
    <h2>{character.startingLocation}</h2>
    <p>Stage {character.tutorial.stage} · {character.tutorial.status}</p>
    <section>
      <h2>Starting state</h2>
      <p>STR {character.attributes.STR} · DEX {character.attributes.DEX} · INT {character.attributes.INT} · RES {character.attributes.RES}</p>
      <p>Health: {character.health.current} / {character.health.maximum}</p>
      <p>Coins: {character.coins}</p>
      {#each Object.entries(character.majorSkillBonuses) as [skill, bonus]}
        <p>{skill}: +{bonus} starting Major Skill levels</p>
      {/each}
      <p>Starting equipment requirements: {character.starterItemRequirements.map(item => item.name + ' × ' + item.quantity).join(', ')}</p>
      <p class="muted">Items are not equippable or tradable until their authoritative records are defined.</p>
    </section>
    <p class="muted">This character is saved to your account. The origin-specific Stage 1 scene is not yet connected to this authenticated state; gameplay entry will follow in M1.3/M1.4. Selecting an origin does not start another character's tutorial.</p>
  {/if}
  <nav><a href="/characters">Return to character selection</a> · <a href="/account">Account</a></nav>
</main>
<style>
  :global(body){margin:0;background:#151717;color:#e9dfcd;font-family:Georgia,serif}
  :global(a){color:#e1bc8a}
  main{max-width:760px;margin:6vh auto;padding:30px;background:#24221f;border:1px solid #756047}
  h1,h2{font-weight:normal}
  h2{color:#d7bc91}
  section{border:1px solid #564632;background:#2b2925;padding:20px;margin:22px 0}
  .eyebrow{font:11px sans-serif;letter-spacing:.16em;color:#c7a37a}
  .muted{color:#b6ad9c;line-height:1.5}
  nav{border-top:1px solid #574633;padding-top:20px;margin-top:28px}
</style>
