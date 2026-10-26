<script lang="ts">
  import {onMount} from 'svelte';
  import {page} from '$app/state';
  import {APPROVED_STAGE_ONE, type StageOneScene} from '$lib/approved-stage-one';
  import WorkshopScene from '$lib/WorkshopScene.svelte';

  type Character = {
    id: string; name: string; sex: string; origin: string;
    startingLocation: string;
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
<main>
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
  {:else if status === 'unavailable' || !scene || !character || !beat}
    <h1>Character service unavailable</h1>
    <p>Check that the local API and PostgreSQL are running.</p>
  {:else}
    <p class="eyebrow">THE PALL · {character.origin.toUpperCase()} · STAGE 1</p>
    <h1>{scene.location}</h1>
    <p class="context">{character.name} · {character.sex} · {scene.npc}</p>
    {#if character.origin === 'Millhand'}
      <WorkshopScene
        characterName={character.name}
        beat={beat}
        advance={advance}
        goBack={back}
        canGoBack={visited.length > 0}
      />
    {:else}
    <section class="setting" aria-label="Scene">
      <p class="state-note">APPROVED SCRIPT PREVIEW · STAGE 1 NOT YET COMMITTED</p>
      {#if beat.kind === 'narration'}
        <p class="narration">{displayText}</p>
      {:else if beat.kind === 'speech'}
        <div class="dialogue">
          <p class="speaker">{beat.speaker === 'Player' ? character.name : beat.speaker}</p>
          <p class="line">“{displayText}”</p>
        </div>
      {:else if beat.kind === 'choice'}
        <p class="prompt">{displayText}</p>
      {:else}
        <p class="handoff">[{displayText}]</p>
        <p class="muted">The Stage 2 work interaction is not connected to saved character state yet. No job began and no progress, money, items or XP were awarded.</p>
      {/if}
      <div class="actions">
        {#if beat.kind === 'choice' && beat.choices}
          {#each beat.choices as choice}
            <button type="button" onclick={() => advance(choice.next)}>{choice.label}</button>
          {/each}
        {:else if beat.next}
          <button type="button" onclick={() => advance(beat.next)}>Continue</button>
        {/if}
        {#if visited.length}
          <button class="secondary" type="button" onclick={back}>Previous line</button>
        {/if}
      </div>
    </section>
    {/if}
    <p class="muted">Dialogue is advanced only by your choices. This preview is replayable and does not update your saved tutorial stage.</p>
  {/if}
  <nav>
    <a href={'/characters/' + page.params.id}>Character details</a>
    <a href="/characters">All characters</a>
  </nav>
</main>

<style>
  :global(body){margin:0;background:#151717;color:#e6dece;font-family:Georgia,'Times New Roman',serif}
  :global(a){color:#e0bc8b}
  main{max-width:860px;margin:5vh auto;padding:clamp(20px,4vw,38px);box-sizing:border-box;background:#24221f;border:1px solid #756047}
  h1{font-weight:normal;font-size:clamp(30px,4vw,42px);margin:10px 0 12px}
  .eyebrow{font:11px/1.6 sans-serif;letter-spacing:.15em;color:#c7a37a}
  .context{color:#d4c0a0;margin-bottom:24px}
  .setting{border:1px solid #756047;background:#2b2925;padding:clamp(20px,4vw,36px);min-height:220px}
  .state-note{font:11px/1.5 sans-serif;letter-spacing:.08em;color:#aaa092;margin:0 0 24px}
  .narration{font-style:italic;line-height:1.7;font-size:19px;max-width:650px}
  .dialogue{max-width:650px}
  .speaker{font:12px/1.5 sans-serif;letter-spacing:.12em;text-transform:uppercase;color:#d5b184}
  .line{font-size:22px;line-height:1.55}
  .prompt{font-size:17px;color:#d3be9e}
  .handoff{font-size:22px;color:#ebd5b3}
  .muted{color:#b7ac9d;font:13px/1.6 sans-serif}
  .actions{display:flex;flex-wrap:wrap;gap:12px;margin-top:32px}
  button{background:#5c422e;color:#f6dfba;border:1px solid #b08d5f;cursor:pointer;padding:12px 17px;min-height:44px;font:15px/1.4 Georgia,serif;text-align:left}
  button:hover{background:#785738}
  button:focus-visible{outline:2px solid #ffe2af;outline-offset:2px}
  button.secondary{background:#2c2925;color:#c5b4a0;border-color:#65513d}
  nav{display:flex;gap:26px;flex-wrap:wrap;border-top:1px solid #594a39;padding-top:22px;margin-top:24px;font:14px sans-serif}
</style>
