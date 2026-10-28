<script lang="ts">
  import {onMount} from 'svelte';
  import '$lib/pall-owner-ui.css';
  import '$lib/pall-entry-pages.css';
  import {APPROVED_WORLD_INTRO} from '$lib/approved-introductions';
  // Replaying the approved world introduction never changes server progress.
  let status=$state<'checking'|'ready'|'login'|'unavailable'>('checking');
  onMount(()=>{void (async()=>{try{
    const response=await fetch('/api/me',{cache:'no-store'});
    status=response.status===401?'login':response.ok?'ready':'unavailable';
  }catch{status='unavailable';}})();});
</script>
<svelte:head>
  <title>The Pall — World Introduction</title>
  <meta name="description" content="The Pall — Grand Cylinder City" />
</svelte:head>
<div class="entry-page">
  <div class="entry-wrap">
    <nav class="entry-nav" aria-label="Page navigation">
      <a href="/introduction" class="brand">
        <img src="/ui-kit/branding/logo-compact.png" alt="The Pall"/>
        <span>A CITY ENDURES</span>
      </a>
      <div class="entry-links"><a href="/characters">Characters</a><a href="/account">Account</a></div>
    </nav>
    <header class="entry-hero">
      <div><span class="entry-eyebrow">Grand Cylinder City</span><h1>{APPROVED_WORLD_INTRO.heading}</h1></div>
    </header>
    <main class="entry-content">
      {#if status==='checking'}
        <p role="status">Checking your account…</p>
      {:else if status==='login'}
        <h2>Account required</h2>
        <p>Sign in to enter The Pall.</p><a class="entry-button" href="/account">Sign in</a>
      {:else if status==='unavailable'}
        <h2>Account service unavailable</h2>
        <p>Check that the local API and database are running, then refresh.</p>
        <a class="entry-button" href="/account">Return to account</a>
      {:else}
        <span class="entry-eyebrow">The world beyond the walls</span>
        <div class="lore">
          {#each APPROVED_WORLD_INTRO.paragraphs as paragraph,i}
            <p class:ending={i>=APPROVED_WORLD_INTRO.paragraphs.length-2}>
              {#each paragraph as segment}
                {#if segment.style==='strong'}<strong>{segment.text}</strong>
                {:else if segment.style==='em'}<em>{segment.text}</em>
                {:else}{segment.text}{/if}
              {/each}
            </p>
          {/each}
        </div>
        <nav class="continue" aria-label="Continue introduction">
          <a class="entry-button" href="/characters">Continue to character selection</a>
          <a href="/backgrounds">Choose a background</a>
        </nav>
      {/if}
    </main>
  </div>
</div>
<style>
  .entry-hero{background-position:center,center 21%;min-height:clamp(235px,25vw,355px)}
  .lore{max-width:850px;margin:22px auto 20px;font:500 clamp(16px,1.5vw,19px)/1.68 var(--pall-font-reading,Georgia,serif);color:#f0e2ca}
  .lore p{margin:0 0 1.16em}
  .lore p.ending{color:#f5ddb7;font-weight:600}
  .continue{max-width:850px;margin:24px auto 4px;padding-top:18px;border-top:1px solid #66503a;
    display:flex;align-items:center;gap:22px;flex-wrap:wrap}
  .continue a:not(.entry-button){color:#e1bc8c}
</style>