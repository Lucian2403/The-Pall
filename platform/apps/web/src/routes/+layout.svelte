<script lang="ts">
  import {onMount} from 'svelte';
  import type {Snippet} from 'svelte';
  import {page} from '$app/state';
  import {connectPallAudio,setPallAudioScene} from '$lib/pall-audio';

  let {children}:{children:Snippet}=$props();
  onMount(connectPallAudio);
  // First prototype is confined to authenticated in-game character routes.
  // Public marketing, registration and character creation stay silent.
  $effect(()=>{
    setPallAudioScene(/^\/characters\/[^/]+(?:\/|$)/.test(page.url.pathname));
  });
</script>

{@render children()}
