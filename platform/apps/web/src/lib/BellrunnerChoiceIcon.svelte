<script lang="ts">
  /** Decorative, consistent ink-line pictograms for framed Bellrunner choices.
   * Buttons own the accessible name; never replace their textual labels.
   */
  let {kind='chat'}:{kind?:'chat'|'book'|'back'|'route'|'mark'}=$props();
</script>

<svg class="choice-icon" xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 24 24" fill="none" stroke="currentColor"
  stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"
  aria-hidden="true" focusable="false">
  {#if kind==='chat'}
    <path d="M20.3 11.1a8.3 8.3 0 0 1-8.3 8.3 10 10 0 0 1-3.1-.5L3 21l1.8-5.1a8.3 8.3 0 1 1 15.5-4.8Z"/>
  {:else if kind==='book'}
    <path d="M12 6.2c-2.4-2-5.3-2.7-9-2.3v14c3.7-.4 6.6.3 9 2.3 2.4-2 5.3-2.7 9-2.3v-14c-3.7-.4-6.6.3-9 2.3Z"/>
    <path d="M12 6.2v14"/>
  {:else if kind==='back'}
    <path d="m14.5 5-7 7 7 7"/>
    <path d="M8 12h13"/>
  {:else if kind==='route'}
    <path d="M6.5 20V5m0 0-3 3m3-3 3 3"/>
    <path d="M6.5 12h7.7c3 0 4.5-1.5 4.5-4.5V5"/>
    <circle cx="18.7" cy="4" r="1.7"/>
  {:else}
    <path d="M4 5h16v14H4z"/>
    <path d="m7 12 3.1 3 6.9-7"/>
  {/if}
</svg>

<style>
  .choice-icon{display:block;flex:0 0 auto;width:23px;height:23px;pointer-events:none}
  @media(max-width:700px){.choice-icon{width:20px;height:20px}}
</style>
