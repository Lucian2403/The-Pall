<script lang="ts">
  import {onMount} from 'svelte';
  import TutorialShell from '$lib/TutorialShell.svelte';
  import {claimSmithingWorkshopAmbience} from '$lib/pall-audio';

  // Development-only fixture for *real browser* audio testing. It mounts
  // the production TutorialShell and Sound settings with an actual claimed
  // forge backdrop, without requiring accounts or an API server.
  const character={
    id:'audio-qa-millhand',
    name:'Workshop Test',
    origin:'Millhand',
    sex:'Male',
    coins:20,
    health:{current:50,maximum:50},
    stamina:{current:100,maximum:100},
    startingLocation:'Smithing Workshop',
    tutorial:{stage:1,status:'NOT_STARTED'}
  };
  onMount(claimSmithingWorkshopAmbience);
</script>

<TutorialShell {character} sceneLocation="Smithing Workshop">
  <div class="audio-qa-scene">
    <h1>Audio diagnostics</h1>
    <p>Development fixture. Open Sound settings in the header. Music, Ambience and Effects should respond independently to user clicks and slider changes.</p>
  </div>
</TutorialShell>

<style>
  .audio-qa-scene{
    min-height:350px;
    padding:35px 45px;
    color:#ebd5b1;
    background:linear-gradient(105deg,#15120f99,#24160988),url('/workshop/environment.webp') center/cover;
  }
  h1{font:700 26px/1.2 var(--pall-font-reading,Georgia,serif)}
  p{max-width:60ch;line-height:1.6}
</style>
