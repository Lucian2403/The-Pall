<script lang="ts">
  import {onMount} from 'svelte';
  import type {Snippet} from 'svelte';
  import {connectPallAudio} from '$lib/pall-audio';

  let {children}:{children:Snippet}=$props();
  // Install one persistent player across SvelteKit client navigation.
  // TutorialShell owns in-game activity; the root must never guess it from
  // a URL or override the currently mounted shell's active state.
  onMount(connectPallAudio);
</script>

{@render children()}
