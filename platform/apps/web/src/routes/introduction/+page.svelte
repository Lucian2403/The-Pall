<script lang="ts">
  import {onMount} from 'svelte';
  import '$lib/pall-owner-ui.css';
  import '$lib/pall-entry-pages.css';
  import {APPROVED_WORLD_INTRO} from '$lib/approved-introductions';

  // The canonical world introduction is publicly readable. Only choosing
  // characters requires authentication; replaying lore never mutates progress.
  let signedIn=$state(false);
  onMount(()=>{void (async()=>{
    try{
      const response=await fetch('/api/me',{cache:'no-store'});
      signedIn=response.ok;
    }catch{signedIn=false;}
  })();});
</script>
<svelte:head>
  <title>The Pall — World Introduction</title>
  <meta name="description" content="Enter the world of The Pall and Grand Cylinder City." />
</svelte:head>
<div class="entry-page">
  <div class="entry-wrap">
    <nav class="entry-nav" aria-label="Page navigation">
      <a href="/" class="brand">
        <img src="/ui-kit/branding/logo-compact.png" alt="The Pall"/>
        <span>A CITY ENDURES</span>
      </a>
      <div class="entry-links">
        <a href="/">Home</a>
        <a href="/characters">Characters</a>
        <a href="/account">Account</a>
      </div>
    </nav>
    <header class="entry-hero">
      <div><span class="entry-eyebrow">Grand Cylinder City</span><h1>{APPROVED_WORLD_INTRO.heading}</h1></div>
    </header>
    <main class="entry-content">
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
        {#if signedIn}
          <a class="entry-button" href="/characters">Continue to character selection</a>
          <a href="/backgrounds">Choose a background</a>
        {:else}
          <a class="entry-button" href="/account?mode=register">Create account to play</a>
          <a href="/account">Sign in</a>
        {/if}
      </nav>
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