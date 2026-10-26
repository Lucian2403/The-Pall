<script lang="ts">
  let {kind}: {kind: 'stamps' | 'plates' | 'paper' | 'hammer'} = $props();
</script>
<svg aria-hidden="true" viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
  {#if kind === 'stamps'}
    <path d="M3 8h18v12H3z M6 8V4h3v4 M11 8V4h3v4 M16 8V4h3v4 M7 13h2 M12 13h2 M17 13h1 M7 17h2 M12 17h2 M17 17h1"/>
  {:else if kind === 'plates'}
    <path d="M4 6h15v11H4z M7 3h13v12 M9 9h0 M16 9h0 M9 14h0 M16 14h0 M4 20h15"/>
  {:else if kind === 'paper'}
    <path d="M6 2h9l4 4v16H6z M15 2v5h4 M9 11h7 M9 15h7 M9 19h5"/>
  {:else if kind === 'hammer'}
    <path d="M13 5l4-3 5 5-4 3 M3 21l12-12 M11 7l6 6 M2 21l3 1"/>
  {/if}
</svg>
