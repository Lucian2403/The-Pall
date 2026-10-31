<script lang="ts">
  import TutorialShell from '$lib/TutorialShell.svelte';

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
  let forgeVisible=$state(true);
  let stage=$state(1);
</script>

{#key stage}
  <TutorialShell {character} sceneLocation={forgeVisible?'Smithing Workshop':'Municipal depot'} smithingBackdrop={forgeVisible}>
    <div class="audio-qa-scene" class:depot={!forgeVisible}>
      <h1>Audio diagnostics · Stage {stage}</h1>
      <p>Development fixture. Open Sound settings in the header. Music, Ambience and Effects should respond independently to user clicks and slider changes.</p>
      <div class="qa-actions">
        <button type="button" onclick={()=>{stage++;}}>Next forge stage</button>
        {#if forgeVisible}
          <button type="button" onclick={()=>{forgeVisible=false;}}>Switch to depot</button>
        {:else}
          <button type="button" onclick={()=>{forgeVisible=true;}}>Return to forge</button>
        {/if}
      </div>
    </div>
  </TutorialShell>
{/key>

<style>
  .audio-qa-scene{
    min-height:350px;
    padding:35px 45px;
    color:#ebd5b1;
    background:linear-gradient(105deg,#15120f99,#24160988),url('/workshop/environment.webp') center/cover;
  }
  .audio-qa-scene.depot{
    background:linear-gradient(105deg,#15120f99,#24160988),url('/locations/depot/depot-background-cold.webp') center/cover;
  }
  .qa-actions{display:flex;gap:12px;flex-wrap:wrap;margin-top:24px}
  .qa-actions button{background:#3c2c20;border:1px solid #a77f4d;color:#efdeba;padding:10px 13px;cursor:pointer}
  h1{font:700 26px/1.2 var(--pall-font-reading,Georgia,serif)}
  p{max-width:60ch;line-height:1.6}
</style>
