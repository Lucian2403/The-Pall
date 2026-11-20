<script lang="ts">
  import type {CombatEventView} from '$lib/millhand-combat-model';
  import {combatActionLabel,isEnemyCombatAction,groupCombatRounds}
    from '$lib/millhand-combat-chronicle';

  let {events,emptyText}:{events:CombatEventView[];emptyText:string}=$props();
  let fullHistory=$state(false);
  const rounds=$derived(groupCombatRounds(events));
  // Complete rounds, never the last six individual system messages.
  const shown=$derived(fullHistory?rounds:rounds.slice(-3));
</script>

<section class="chronicle" aria-label="Battle Chronicle">
  <div class="chronicle-heading">
    <h3>Battle Chronicle</h3>
    <button type="button" onclick={()=>fullHistory=!fullHistory}
      aria-expanded={fullHistory} aria-controls="combat-chronicle-list">
      {fullHistory?'Latest rounds':'Full history'}
    </button>
  </div>
  <div id="combat-chronicle-list" class="log-window" role="log" aria-live="off" aria-relevant="additions">
    {#if !rounds.length}
      <p class="no-events">{emptyText}</p>
    {:else}
      <ol class="round-list">
        {#each shown as round (round.key)}
          <li class="round-entry" class:impact={round.events.some(e=>e.kind==='damage')}
            class:latest={round.key===rounds.at(-1)?.key}>
            <div class="round-heading">Round {String(round.round).padStart(2,'0')}</div>
            <p class="round-story">{round.main}</p>
            {#if round.detail}<p class="round-numbers">{round.detail}</p>{/if}
            {#if round.tactical.length}
              <p class="round-tactics">{round.tactical.join(' · ')}</p>
            {/if}
            <details class="round-expanded">
              <summary>Details · {round.events.length} events</summary>
              <ol>
                {#each round.events as event, i (i)}
                  <li class:enemy-action={isEnemyCombatAction(event)}>
                    <span class="event-action">[{combatActionLabel(event)}]</span>
                    <span class="event-text">{event.text}</span>
                    {#if event.story?.detail}
                      <span class="event-numbers">{event.story.detail}</span>
                    {/if}
                  </li>
                {/each}
              </ol>
            </details>
          </li>
        {/each}
      </ol>
    {/if}
  </div>
  {#if !fullHistory&&rounds.length>3}
    <p class="history-hint">Latest 3 of {rounds.length} complete rounds.</p>
  {/if}
</section>

<style>
  .chronicle{min-width:0;box-sizing:border-box;background:#29221eea;
    color:#ecd1a8;border:1px solid #8c6947;padding:12px;box-shadow:0 8px 20px #120d0c60}
  .chronicle-heading{display:flex;gap:12px;align-items:center;justify-content:space-between;
    border-bottom:1px solid #70543d;padding-bottom:8px}
  .chronicle-heading h3{margin:0;color:#edc898;font:700 17px/1.2 Georgia,serif}
  .chronicle-heading button{padding:7px 12px;background:#271f19;color:#eed4ae;
    border:1px solid #856446;cursor:pointer;font:700 12px Georgia,serif}
  .chronicle-heading button:hover{background:#403124}
  .log-window{min-height:150px;max-height:310px;overflow:auto;
    scrollbar-color:#947651 #30281f;scrollbar-width:thin}
  ol{margin:0;padding:0;list-style:none}
  .round-entry{padding:10px 6px 12px;border-bottom:1px solid #49392f;color:#ecd1a8;
    font:13px/1.45 Georgia,serif}
  .round-entry.latest{background:#39291f}
  .round-entry.impact{border-left:3px solid #bc6546;padding-left:9px}
  .round-heading{font:700 11px/1.6 Arial,sans-serif;color:#c49a66;letter-spacing:.04em}
  .round-story{margin:4px 0;color:#f5dcba;font:14px/1.48 Georgia,serif}
  .round-numbers{margin:5px 0 0;color:#e0b882;font:700 12px/1.55 Georgia,serif}
  .round-tactics{margin:5px 0 0;color:#d9c49e;font:12px/1.45 Arial,sans-serif}
  .round-expanded{margin:8px 0 0;border-top:1px solid #4e3e31}
  .round-expanded summary{padding:7px 2px 3px;cursor:pointer;color:#d1b48d;
    font:700 12px/1.4 Georgia,serif}
  .round-expanded summary:hover{color:#fff1d6}
  .round-expanded ol{padding:2px 0 0 8px}
  .round-expanded li{padding:5px 3px;border-bottom:1px solid #3c322b;
    display:flex;flex-wrap:wrap;gap:3px 7px}
  .event-action{color:#dec39e;font:700 11px/1.4 Arial,sans-serif;flex:none}
  .enemy-action .event-action{color:#ef9782}
  .event-text{flex:1 1 65%;color:#dbc7a9;font:12px/1.4 Georgia,serif}
  .event-numbers{display:block;flex:1 1 100%;margin-left:4px;color:#d9b884;
    font:11px/1.4 Arial,sans-serif}
  .history-hint{margin:8px 0 0;color:#b49773;font:11px/1.2 Arial,sans-serif}
  .no-events{font:13px/1.5 Georgia,serif}
</style>
