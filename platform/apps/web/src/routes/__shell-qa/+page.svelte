<script lang="ts">
  import {page} from '$app/state';
  import TutorialShell from '$lib/TutorialShell.svelte';
  import BellrunnerOpeningScene from '$lib/BellrunnerOpeningScene.svelte';
  import {APPROVED_STAGE_ONE} from '$lib/approved-stage-one';

  // Development-only fixture for the shell itself: renders the REAL shell and
  // the REAL Stage 1 scene so the reserved dock column and map-gateway states
  // can be browser-checked. No login, API write, chat or map service exists.
  //   ?dock=1      reserve the messages dock column (QA placeholder only)
  //   ?complete=1  a completed introduction (map gateway: "Not available yet")
  const scene=APPROVED_STAGE_ONE.Bellrunner;
  const complete=$derived(page.url.searchParams.get('complete')==='1');
  const withDock=$derived(page.url.searchParams.get('dock')==='1');
  const character=$derived({
    id:'22222222-2222-4222-8222-222222222222',name:'QA shell',origin:'Bellrunner',sex:'Male',
    coins:20,health:{current:50,maximum:50},startingLocation:'Dispatch House',welcomeSeen:true,
    tutorial:complete?{stage:8,status:'COMPLETED'}:{stage:1,status:'NOT_STARTED'}
  });
</script>

<TutorialShell {character} compactCityVista dock={withDock?qaDock:undefined}>
  <BellrunnerOpeningScene characterName={character.name} beat={scene.nodes[scene.start]}
    advance={()=>{}} goBack={()=>{}} canGoBack={false} takeRound={async()=>{}}/>
</TutorialShell>

{#snippet qaDock()}
  <div class="qa-dock">
    <p class="qa-label">QA FIXTURE · DOCK SLOT</p>
    <p>No chat service is connected. This placeholder only proves that a docked
      panel takes its own column and reflows the activity instead of covering it.</p>
  </div>
{/snippet}

<style>
  .qa-dock{padding:16px;color:#d9c3a1;font:14px/1.5 Georgia,serif}
  .qa-label{margin:0 0 8px;color:#e9c486;font:700 12px/1.3 sans-serif;letter-spacing:.1em}
</style>
