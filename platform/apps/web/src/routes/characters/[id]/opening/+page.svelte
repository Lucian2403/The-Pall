<script lang="ts">
  import {onMount} from 'svelte';
  import {page} from '$app/state';
  import {APPROVED_STAGE_ONE, type StageOneScene} from '$lib/approved-stage-one';
  import WorkshopScene from '$lib/WorkshopScene.svelte';
  import TutorialShell from '$lib/TutorialShell.svelte';

  type Character = {
    id: string; name: string; sex: string; origin: string;
    startingLocation: string;
    coins: number;
    health: {current: number; maximum: number};
    tutorial: {stage: number; status: string};
  };
  let character = $state<Character | null>(null);
  let scene = $state<StageOneScene | null>(null);
  let nodeId = $state('');
  let visited = $state<string[]>([]);
  let status = $state<'checking' | 'ready' | 'login' | 'missing' | 'not-ready' | 'unavailable'>('checking');

  const beat = $derived(scene?.nodes[nodeId] ?? null);
  function advance(next: string) {
    if (!scene?.nodes[next]) return;
    visited = [...visited, nodeId];
    nodeId = next;
  }
  function back() {
    if (!visited.length) return;
    nodeId = visited[visited.length - 1];
    visited = visited.slice(0, -1);
  }

  onMount(() => {
    void (async () => {
      try {
        const response = await fetch('/api/characters/' + encodeURIComponent(page.params.id), {cache: 'no-store'});
        if (response.status === 401) {status = 'login'; return;}
        if (response.status === 404) {status = 'missing'; return;}
        if (!response.ok) {status = 'unavailable'; return;}
        const body = await response.json() as {character: Character};
        character = body.character;
        const originScene = APPROVED_STAGE_ONE[body.character.origin];
        if (!originScene || body.character.tutorial.stage !== 1 || body.character.tutorial.status !== 'NOT_STARTED') {
          status = 'not-ready';
          return;
        }
        // The server's owner-scoped character record chooses the origin and scene.
        // Never accept a client-selected origin, NPC, skill or reward.
        scene = originScene;
        nodeId = originScene.start;
        status = 'ready';
      } catch {
        status = 'unavailable';
      }
    })();
  });

  const displayText = $derived(beat?.text.replaceAll('[player name]', character?.name ?? '[player name]') ?? '');
</script>


<svelte:head><title>The Pall — Origin Opening</title></svelte:head>

{#if status === 'ready' && scene && character && beat}
  <TutorialShell {character}>
    {#if character.origin === 'Millhand'}
      <WorkshopScene
        characterName={character.name}
        {beat}
        {advance}
        goBack={back}
        canGoBack={visited.length > 0}
      />
    {:else}
      <section class="story-scene" aria-label={scene.location + ' opening'}>
        <p class="story-eyebrow">{character.origin} · {scene.npc}</p>
        {#if beat.kind === 'narration'}
          <p class="narration">{displayText}</p>
        {:else if beat.kind === 'speech'}
          <p class="speaker">{beat.speaker === 'Player' ? character.name : beat.speaker}</p>
          <p class="line">“{displayText}”</p>
        {:else if beat.kind === 'choice'}
          <p class="speaker">Your response</p>
        {:else}
          <p class="handoff">[{displayText}]</p>
          <p class="muted">Stage 2 is not yet connected. No work has begun, and no progress, equipment, coins or XP were awarded.</p>
        {/if}
        <div class="actions">
          {#if beat.kind === 'choice' && beat.choices}
            {#each beat.choices as choice}
              <button type="button" onclick={() => advance(choice.next)}>{choice.label}</button>
            {/each}
          {:else if beat.next}
            <button type="button" onclick={() => {if (beat?.next) advance(beat.next);}}>Continue</button>
          {/if}
          {#if visited.length}
            <button class="secondary" type="button" onclick={back}>Previous line</button>
          {/if}
        </div>
      </section>
    {/if}
    <p class="preview-note">This dialogue is a read-only, replayable Stage 1 preview. Choices advance only when clicked; the saved tutorial stage is unchanged.</p>
  </TutorialShell>
{:else}
  <main class="fallback">
    {#if status === 'checking'}
      <p role="status">Loading your character's opening…</p>
    {:else if status === 'login'}
      <h1>Sign in required</h1>
      <p><a href="/account">Sign in</a></p>
    {:else if status === 'missing'}
      <h1>Character not found</h1>
      <p>This character either does not exist or does not belong to this account.</p>
    {:else if status === 'not-ready'}
      <h1>Opening not available</h1>
      <p>The requested character is not at the beginning of an approved origin opening.</p>
    {:else}
      <h1>Character service unavailable</h1>
      <p>Check that the local API and PostgreSQL are running.</p>
    {/if}
    <nav class="fallback-nav">
      <a href={'/characters/' + page.params.id}>Character details</a>
      <a href="/characters">All characters</a>
    </nav>
  </main>
{/if}

<style>
  :global(body){margin:0;background:#151717;color:#e6dece;font-family:Georgia,'Times New Roman',serif}
  :global(a){color:#e0bc8b}
  .fallback{max-width:760px;margin:6vh auto;padding:30px;background:#24221f;border:1px solid #756047}
  .fallback h1{font-weight:normal}
  .fallback-nav{display:flex;gap:24px;flex-wrap:wrap;border-top:1px solid #574633;padding-top:20px;margin-top:22px}
  .story-scene{background:#28241f;border:1px solid #76583a;padding:clamp(20px,4vw,38px);min-height:300px}
  .story-eyebrow,.speaker{font:12px/1.5 sans-serif;letter-spacing:.12em;text-transform:uppercase;color:#d9b88c}
  .narration{font-style:italic;font-size:19px;line-height:1.65;max-width:790px}
  .line{font-size:21px;line-height:1.55;max-width:790px}
  .handoff{font-size:22px;color:#ebd5b3}
  .muted,.preview-note{color:#b7ac9d;font:13px/1.6 sans-serif}
  .preview-note{margin:14px 6px 4px}
  .actions{display:flex;flex-wrap:wrap;gap:12px;margin-top:30px}
  .actions button{background:#5b402b;border:1px solid #a98250;color:#f6dfba;cursor:pointer;padding:12px 17px;font:15px/1.4 Georgia,serif;min-height:44px}
  .actions button:focus-visible{outline:2px solid #ffe2af;outline-offset:2px}
  .actions .secondary{background:#32271f}
</style>
