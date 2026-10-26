<script lang="ts">
  import {onMount} from 'svelte';
  import {APPROVED_WORLD_INTRO} from '$lib/approved-introductions';

  // Temporary first-entry presentation. We have NOT yet approved/stored a
  // permanent first-login completion flag or skip/replay policy.
  let status = $state<'checking' | 'ready' | 'login' | 'unavailable'>('checking');
  onMount(() => {
    void (async () => {
      try {
        const response = await fetch('/api/me', {cache: 'no-store'});
        if (response.status === 401) status = 'login';
        else status = response.ok ? 'ready' : 'unavailable';
      } catch {
        status = 'unavailable';
      }
    })();
  });
</script>

<svelte:head>
  <title>The Pall — World Introduction</title>
  <meta name="description" content="The Pall — approved introduction to Grand Cylinder City" />
</svelte:head>

<div class="shell">
  <main class="folio">
    {#if status === 'checking'}
      <p role="status">Checking your account…</p>
    {:else if status === 'login'}
      <h1>Account required</h1>
      <p>Sign in to enter The Pall.</p>
      <a class="action" href="/account">Sign in</a>
    {:else if status === 'unavailable'}
      <h1>Account service unavailable</h1>
      <p>Check that the local API and database are running, then refresh.</p>
      <a href="/account">Return to account</a>
    {:else}
      <p class="eyebrow">THE PALL · APPROVED WORLD INTRODUCTION</p>
      <h1>{APPROVED_WORLD_INTRO.heading}</h1>
      <div class="narrative">
        {#each APPROVED_WORLD_INTRO.paragraphs as paragraph, i}
          <p class:ending={i >= APPROVED_WORLD_INTRO.paragraphs.length - 2}>
            {#each paragraph as segment}
              {#if segment.style === 'strong'}<strong>{segment.text}</strong>
              {:else if segment.style === 'em'}<em>{segment.text}</em>
              {:else}{segment.text}{/if}
            {/each}
          </p>
        {/each}
      </div>
      <nav class="bottom">
        <a class="action" href="/backgrounds">Continue to background selection</a>
        <a class="secondary" href="/account">Account</a>
      </nav>
      <p class="development">M1.2 presentation preview. The text is approved; layout, repeat-on-login behaviour and final artwork are not.</p>
    {/if}
  </main>
</div>

<style>
  :global(body) {margin: 0; color: #e7dfd1; background: #151717; font-family: Georgia, 'Times New Roman', serif;}
  :global(a) {color: #e7c896;}
  .shell {min-height: 100vh; padding: 30px 16px 54px; box-sizing: border-box; background: radial-gradient(ellipse at 60% 5%, #302b26 0%, #151717 65%);}
  .folio {max-width: 730px; margin: auto; padding: clamp(24px, 5vw, 58px); box-sizing: border-box; border: 1px solid #675341; background: #201f1d; box-shadow: 0 12px 45px #0005;}
  .eyebrow {font: 11px/1.5 sans-serif; letter-spacing: .17em; color: #bda27d; text-transform: uppercase;}
  h1 {font-size: clamp(32px, 5vw, 51px); font-weight: normal; letter-spacing: .08em; margin: 18px 0 30px; color: #f2e7d5;}
  .narrative {font-size: clamp(16px, 2vw, 18px); line-height: 1.73;}
  .narrative p {margin: 0 0 1.3em;}
  .narrative .ending {margin-bottom: .4em; font-size: 1.05em;}
  .bottom {border-top: 1px solid #5c4b3a; margin-top: 35px; padding-top: 25px; display: flex; flex-wrap: wrap; align-items: center; gap: 18px;}
  .action {display: inline-block; padding: 12px 18px; border: 1px solid #a48150; background: #403326; text-decoration: none; color: #f3d6ab; font: 14px/1.3 sans-serif;}
  .action:hover {background: #53402e;}
  .secondary {font: 13px sans-serif;}
  .development {font: 12px/1.5 sans-serif; color: #aaa094; margin: 28px 0 0;}
</style>
