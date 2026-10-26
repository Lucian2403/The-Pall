<script lang="ts">
  import {onMount} from 'svelte';

  type Character = {
    id: string; name: string; origin: string; sex: string;
    startingLocation: string; coins: number;
    tutorial: {stage: number; status: string};
    majorSkillBonuses: Record<string, number>;
  };
  type Roster = {revision: number; slots: {used: number; limit: number}; characters: Character[]};

  let roster = $state<Roster | null>(null);
  let state = $state<'checking' | 'ready' | 'login' | 'unavailable'>('checking');
  onMount(() => {
    void (async () => {
      try {
        const response = await fetch('/api/characters', {cache: 'no-store'});
        if (response.status === 401) {state = 'login'; return;}
        if (!response.ok) {state = 'unavailable'; return;}
        roster = await response.json() as Roster;
        state = 'ready';
      } catch {state = 'unavailable';}
    })();
  });
</script>

<svelte:head><title>The Pall — Your Characters</title></svelte:head>
<main>
  <p class="eyebrow">THE PALL · ACCOUNT CHARACTERS</p>
  <h1>Your characters</h1>
  {#if state === 'checking'}
    <p role="status">Loading your characters…</p>
  {:else if state === 'login'}
    <p>Sign in to view your characters.</p>
    <a href="/account">Account access</a>
  {:else if state === 'unavailable' || !roster}
    <p role="alert">The character service is unavailable. Check the API and run the M1.2 migration.</p>
  {:else}
    <p class="muted">{roster.slots.used} of {roster.slots.limit} character slots occupied. Deletion and renaming are unavailable during this development milestone.</p>
    {#if roster.characters.length === 0}
      <p>You haven't created a character yet.</p>
    {:else}
      <div class="roster">
        {#each roster.characters as character (character.id)}
          <article>
            <h2>{character.name}</h2>
            <p>{character.origin} · {character.sex}</p>
            <p class="muted">Starting hub: {character.startingLocation}</p>
            <p class="muted">Tutorial: Stage {character.tutorial.stage}, {character.tutorial.status}</p>
            <a class="action" href={'/characters/' + character.id}>Select character</a>
          </article>
        {/each}
      </div>
    {/if}
    {#if roster.slots.used < roster.slots.limit}
      <p><a class="action" href="/backgrounds">Create a character</a></p>
    {:else}
      <p role="status">All initial character slots are occupied.</p>
    {/if}
  {/if}
  <nav><a href="/introduction">World introduction</a> · <a href="/account">Account</a></nav>
  <p class="muted">Development UI only; approved illustrated character portraits are pending.</p>
</main>
<style>
  :global(body){margin:0;background:#151717;color:#e9dfcd;font-family:Georgia,serif}
  :global(a){color:#e1bc8a}
  main{max-width:900px;margin:5vh auto;padding:28px;background:#24221f;border:1px solid #756047}
  h1{font-weight:normal;margin:12px 0 24px}
  h2{font-weight:normal;margin:0;font-size:22px}
  .eyebrow{font:11px sans-serif;letter-spacing:.18em;color:#c7a37a}
  .muted{color:#b7afa2;line-height:1.5}
  .roster{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:14px;margin:24px 0}
  article{border:1px solid #6e5940;padding:20px;background:#2b2925}
  .action{display:inline-block;padding:10px 15px;border:1px solid #a38253;background:#403325;text-decoration:none;margin-top:10px}
  nav{border-top:1px solid #574633;padding-top:22px;margin-top:28px}
</style>
