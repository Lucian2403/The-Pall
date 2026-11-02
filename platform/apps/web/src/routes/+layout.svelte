<script lang="ts">
  import {onMount} from 'svelte';
  import type {Snippet} from 'svelte';
  import {beforeNavigate} from '$app/navigation';
  import {connectPallAudio,stopSmithingWorkshopAmbience,stopCouncilOfficeAmbience,stopNightAlleyAmbience,stopDepotAmbience} from '$lib/pall-audio';

  let {children}:{children:Snippet}=$props();

  // Root owns the persistent browser player, never the active backdrop.
  onMount(connectPallAudio);
  // Navigating to a page without an in-game backdrop (roster, account,
  // marketing) is an explicit departure: stop immediately, not after the
  // short grace period reserved for workshop-to-workshop loading transitions.
  beforeNavigate(({to})=>{
    if(!to||!/^\/characters\/[^/]+(?:\/|$)/.test(to.url.pathname)){
      stopSmithingWorkshopAmbience();
      stopCouncilOfficeAmbience();
      stopNightAlleyAmbience();
      stopDepotAmbience();
    }
  });
</script>

{@render children()}
