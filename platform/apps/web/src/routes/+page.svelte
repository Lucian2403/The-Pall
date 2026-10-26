<script lang="ts">
  import {onMount} from 'svelte';
  type Snapshot = {revision: number; value: number};
  let snapshot: Snapshot | null = $state(null);
  let status = $state('Checking local development fixture…');
  let submitting = $state(false);
  async function refresh() {
    try {
      const response = await fetch('/api/fixture');
      if (!response.ok) throw new Error(`API status ${response.status}`);
      snapshot = await response.json() as Snapshot;
      status = 'Connected to the authoritative development API';
    } catch(e) {status = 'API unavailable — start PostgreSQL and the API server';}
  }
  async function advance() {
    if (!snapshot || submitting) return;
    submitting = true;
    try {
      const response = await fetch('/api/fixture', {method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({action:'advance_fixture',requestId:crypto.randomUUID(),expectedRevision:snapshot.revision})});
      if (!response.ok) throw new Error(`Command rejected (${response.status})`);
      snapshot = await response.json() as Snapshot;
      status = 'Server committed one fixture revision';
    } catch (e) {status = String(e); await refresh();}
    finally {submitting = false;}
  }
  onMount(refresh);
</script>
<svelte:head><title>The Pall — M0 Technical Fixture</title></svelte:head>
<main>
  <p class="eyebrow">THE PALL / PRODUCTION FOUNDATION M0</p>
  <h1>Technical connection test</h1>
  <p>This is a temporary developer fixture, <strong>not the Millhand UI</strong>.</p>
  <p role="status">{status}</p>
  {#if snapshot}
    <dl><dt>Server revision</dt><dd>{snapshot.revision}</dd><dt>Fixture value</dt><dd>{snapshot.value}</dd></dl>
    <button disabled={submitting} onclick={advance}>Commit one test action</button>
  {/if}
</main>
<style>
  :global(body){margin:0;background:#151617;color:#e6dfce;font-family:Georgia,serif}
  main{max-width:680px;margin:9vh auto;padding:24px;border:1px solid #7b6047;background:#22221f}
  .eyebrow{font:11px sans-serif;letter-spacing:.15em;color:#c8a477}
  h1{font-weight:normal}dl{display:grid;grid-template-columns:1fr 1fr;gap:8px}dt{color:#b4a996}dd{margin:0;text-align:right}
  button{padding:12px 18px;color:#f2d5ab;background:#3a2e21;border:1px solid #a47b4b;cursor:pointer}button:disabled{opacity:.5}
</style>
