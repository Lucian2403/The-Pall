<script lang="ts">
  import {onMount} from 'svelte';
  import {page} from '$app/state';
  import TutorialShell from '$lib/TutorialShell.svelte';
  import CharacterHome from '$lib/CharacterHome.svelte';

  type Character = {
    id: string; name: string; sex: string; origin: string; avatarId?: string | null;
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
    <CharacterHome {character}/>
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
  :global(body){margin:0;background:#151717;color:#e9dfcd;font-family:var(--pall-font-reading,Georgia,serif)}
  .fallback{max-width:760px;margin:6vh auto;padding:30px;background:#24221f;border:1px solid #756047}
  .fallback h1{font-weight:normal}
  .fallback nav{border-top:1px solid #574633;padding-top:18px;margin-top:20px}
  .fallback a{color:#e2bd8d}
</style>
