<script lang="ts">
  import type {CombatAction} from '@the-pall/game-core/combat-v0.5.1';
  import type {CombatActorView,CombatSnapshot} from '$lib/millhand-combat-model';
  import {COMBAT_RESOURCE_SCALE} from '$lib/millhand-combat-model';
  import type {CombatFloatingFeedback} from '$lib/millhand-combat-feedback';

  let {snapshot, feedback, pending, errorMessage, perform}: {
    snapshot: CombatSnapshot;
    feedback: CombatFloatingFeedback[];
    pending: boolean;
    errorMessage: string;
    perform: (action: CombatAction) => Promise<void>;
  } = $props();

  // The server determines every value, legal action, and actual result.
  const ended = $derived(snapshot.status === 'finished');
  const flintDefeated = $derived(ended && snapshot.outcome === 'player_victory');
  const canAttack = $derived(snapshot.legalActions.includes('attack'));

  let selected = $state<'attack'|'guard'|'move'|'recover'|'technique'>('guard');
  let zone = $state<'head'|'torso'|'limbs'>('torso');
  let destination = $state<'side'|'close'|'cover'|'back'>('side');
  let reserve = $state<'breath'|'nerves'>('breath');
  let logOpen = $state(false);

  const visibleSelection = $derived(snapshot.legalActions.includes(selected)
    ? selected : (canAttack ? 'attack' : 'guard'));
  const recentEvents = $derived(logOpen ? snapshot.events : snapshot.events.slice(-3));
  const actionName = $derived({
    attack: 'Strike', guard: 'Guard', move: 'Reposition',
    recover: 'Recover', technique: 'Press Advantage'
  }[visibleSelection]);
  const stanceText = $derived(snapshot.stance === 'brace'
    ? 'You raise your arms and brace yourself as Flint approaches.'
    : snapshot.stance === 'moving'
      ? 'You move along the side of the passage, looking for space to get past Flint.'
      : 'You begin the fight with the work cart between you and Flint.');
  const resultText = $derived(snapshot.outcome === 'player_defeat'
    ? 'You are knocked down and cannot get past Flint. Other workers enter the passage. Flint moves away without collecting money. One of them helps you towards medical care.'
    : snapshot.enemy.hp <= 0
      ? 'Flint is on the ground and cannot stop you. You move past him and leave the passage.'
      : 'Flint steps aside. You wait until there is room to pass, then leave.');
  const toughVictory = $derived(snapshot.player.hp <= snapshot.player.hpMax / 2 ||
    snapshot.player.wounds.some(wound => wound.severity === 'serious'));
  const journal = $derived(snapshot.outcome === 'player_defeat'
    ? "Flint beat me. Damn it. I thought I could get past him, but I couldn't. Other workers came when they heard the fight, and he left without taking my money. One of them helped me get to medical care. Still not a coin from the council for those plates. A fine day I've had."
    : toughVictory
      ? "I beat Flint and got past him. That was tough. For a moment I didn't think I'd manage it, not with that club of his. Everybody knows how hard he is to beat. Well, he didn't get a coin out of me. And after all that, the council still hasn't paid us for those plates."
      : "I beat Flint and got past him. That club could've done some damage, but I managed to keep him off me. He didn't get a coin out of me. The council still owes us for the plates, of course.");

  const iconBase = '/ui-kit/combat-actions/';
  const displayedResources=[
    {key:'stamina',label:'Stamina'},
    {key:'fatigue',label:'Fatigue'},
    {key:'momentum',label:'Momentum'}
  ] as const;
  const actionChoices = [
    {id:'attack',label:'Strike',asset:'strike.webp'},
    {id:'guard',label:'Guard',asset:'guard.webp'},
    {id:'move',label:'Reposition',asset:'reposition.webp'},
    {id:'recover',label:'Recover',asset:'recover.webp'},
    {id:'technique',label:'Press Advantage',asset:'press-advantage.webp'}
  ] as const;
  const selectedAsset = $derived(actionChoices.find(choice => choice.id === visibleSelection)?.asset ?? 'guard.webp');

  function available(action: (typeof actionChoices)[number]['id']): boolean {
    return snapshot.legalActions.includes(action);
  }
  function healthWidth(current: number, maximum: number): string {
    return `${Math.max(0, Math.min(100, Math.round(current / Math.max(1, maximum) * 100)))}%`;
  }

  // Visual fill is capped, but the numeric value is never truncated:
  // combat v0.5.1 can accumulate Fatigue beyond the 100-point reference scale.
  function resourceWidth(value:number):string{
    const scaled=Number.isFinite(value)?value:0;
    return `${Math.max(0,Math.min(100,scaled/COMBAT_RESOURCE_SCALE*100))}%`;
  }
  function commit(): void {
    let action: CombatAction;
    switch (visibleSelection) {
      case 'attack': action = {type:'attack',zone}; break;
      case 'guard': action = {type:'guard'}; break;
      case 'move': action = {type:'move',to:destination}; break;
      case 'recover': action = {type:'recover',mode:reserve}; break;
      case 'technique': action = {type:'technique',zone}; break;
    }
    void perform(action);
  }
</script>

{#snippet combatant(actor: CombatActorView, title: string, opponent: boolean)}
  <div class="fighter" class:opponent>
    <div class="fighter-top">
      <h3>{title}</h3>
      <strong class="hp-value">{actor.hp} <span>/ {actor.hpMax} HP</span></strong>
    </div>
    <div class="hp-track" role="progressbar" aria-label={title + ' health'}
      aria-valuemin="0" aria-valuemax={actor.hpMax} aria-valuenow={actor.hp}>
      <span class="hp-fill" class:critical={actor.hp <= actor.hpMax/4}
        style:width={healthWidth(actor.hp, actor.hpMax)}></span>
    </div>
    <dl class="resources" aria-label={title+' combat resources'}>
      {#each displayedResources as resource (resource.key)}
        <div class="resource">
          <div class="resource-top">
            <dt>{resource.label}</dt>
            <dd>{actor[resource.key]}</dd>
          </div>
          <span class="mini-track" aria-hidden="true">
            <span class={'mini-fill '+resource.key}
              style:width={resourceWidth(actor[resource.key])}></span>
          </span>
        </div>
      {/each}
    </dl>
    <details class="secondary-stats">
      <summary>More condition details</summary>
      <dl>
        <div><dt>Composure</dt><dd>{actor.composure}</dd></div>
        <div><dt>Wounds</dt><dd>{actor.wounds.length}</dd></div>
        {#if actor.bleed > 0}<div><dt>Bleeding</dt><dd>{actor.bleed}</dd></div>{/if}
        {#if actor.ceiling < actor.hpMax}
          <div><dt>Health ceiling</dt><dd>{actor.ceiling}</dd></div>
        {/if}
      </dl>
    </details>
  </div>
{/snippet}

<section class="battle" aria-label="Stage 6, the fight with Flint">
  <div class="alley">
    <div class="stage-scenery">
      <div class="flint" role="img"
        aria-label={flintDefeated ? 'Flint defeated in the passage' : 'Flint holding his club'}>
        <img src={flintDefeated
          ? '/characters/flint/flint-defeated.webp'
          : '/characters/flint/flint-standing.webp'} alt="" />
        <span class="scene-label flint-label">FLINT · CONTRACTOR'S COLLECTOR</span>
        {#each feedback.filter(item => item.target === 'enemy') as cue (cue.id)}
          <span class="combat-float" class:missed={cue.kind === 'miss'} aria-hidden="true">{cue.label}</span>
        {/each}
      </div>
      <span class="cart-marker scene-label">WORK CART</span>

      <aside class="parchment" aria-label="Current encounter situation">
        <div class="encounter-line">
          <h2>{ended ? 'The fight ends' : 'Round ' + String(snapshot.round).padStart(2, '0')}</h2>
          {#if !ended}<span class="distance">{snapshot.distance} range</span>{/if}
        </div>
        {#if snapshot.round === 1 && !ended}<p class="stance">{stanceText}</p>{/if}
        {#if ended}
          <p class="outcome">{snapshot.outcome === 'player_defeat'
            ? 'Flint defeated you. Other workers intervened.' : 'You defeated Flint.'}</p>
          <p>{resultText}</p>
          <p class="after">Your condition is saved. Stage 7 is not yet connected; no treatment has been simulated.</p>
        {:else}
          <p class="telegraph-title">FLINT'S OBSERVABLE INTENTION</p>
          <p class:heavy={snapshot.intentType === 'heavy threat'} class="intent">{snapshot.enemyIntent}</p>
          <p class="position">Opening stance: {snapshot.stance === 'cart'
            ? 'work cart' : snapshot.stance === 'moving' ? 'moving along passage' : 'braced'}.</p>
        {/if}
      </aside>
    </div>

    <!-- Enemy status belongs to Flint and stays near him on wide screens. -->
    <section class="enemy-status" aria-label="Flint combat condition">
      {@render combatant(snapshot.enemy, 'Flint', true)}
    </section>

    {#if !ended}
      <section class="action-zone" aria-label="Combat decisions">
        <div class="actions-row">
          <div class="choices" role="group" aria-label="Choose a combat action">
            {#each actionChoices as choice (choice.id)}
              <button class="action-tile" class:chosen={visibleSelection === choice.id}
                type="button" disabled={pending || !available(choice.id)}
                aria-pressed={visibleSelection === choice.id}
                aria-label={`Select ${choice.label} action`}
                title={available(choice.id) ? choice.label : choice.label + ' unavailable'}
                onclick={() => selected = choice.id}>
                <img src={iconBase + choice.asset} alt="" width="58" height="58" decoding="async" />
                <span class="action-name">{choice.label}</span>
              </button>
            {/each}
          </div>
          <div class="confirm-holder">
            <button class="commit" type="button" data-pall-sfx="none"
              disabled={pending} onclick={commit}
              aria-label={`Confirm ${actionName} action`}>
              <img src={iconBase + 'confirm-action.webp'} alt="" width="41" height="41" />
              <span>{pending ? 'Resolving…' : 'Confirm action'}</span>
            </button>
          </div>
        </div>

        <div class="action-details" aria-label="Selected combat action details">
          <div class="chosen-heading">
            <img src={iconBase + selectedAsset} width="32" height="32" alt="" />
            <strong>{actionName}</strong>
          </div>
          {#if visibleSelection === 'attack' || visibleSelection === 'technique'}
            <div class="detail-field">
              <label for="battle-zone">Target</label>
              <select id="battle-zone" bind:value={zone} disabled={pending}>
                <option value="torso">Torso</option>
                <option value="limbs">Limbs</option>
                <option value="head">Head</option>
              </select>
            </div>
            <span class="detail-text">Accuracy: {snapshot.rules.accuracy[zone]}%</span>
            <span class="detail-text">Stamina: {visibleSelection === 'attack'
              ? snapshot.rules.strikeCost : 12}{visibleSelection === 'technique'
              ? ' · Momentum: ' + snapshot.rules.techniqueMomentum : ''}</span>
            {#if visibleSelection === 'attack'}<span class="detail-note">Repeated strikes cost more.</span>{/if}
          {:else if visibleSelection === 'move'}
            <div class="detail-field">
              <label for="battle-move">Position</label>
              <select id="battle-move" bind:value={destination} disabled={pending}>
                {#if snapshot.distance !== 'contact'}<option value="close">Close distance</option>{/if}
                <option value="side">Move sideways</option>
                <option value="back">Fall back</option>
                <option value="cover">Use cover</option>
              </select>
            </div>
            <span class="detail-text">Stamina: {snapshot.rules.moveCost}</span>
          {:else if visibleSelection === 'recover'}
            <div class="detail-field">
              <label for="battle-recovery">Restore</label>
              <select id="battle-recovery" bind:value={reserve} disabled={pending}>
                <option value="breath">Stamina +{snapshot.rules.recoverStamina}</option>
                <option value="nerves">Composure +{snapshot.rules.recoverComposure}</option>
              </select>
            </div>
          {:else}
            <span class="detail-text">Stamina: {snapshot.rules.guardCost}</span>
            <span class="detail-note">A protected impact can create an opening.</span>
          {/if}
        </div>
        {#if errorMessage}<p class="error" role="alert">{errorMessage}</p>{/if}
      </section>
    {/if}
  </div>

  <!-- Chronicle on the left, player status beneath the actions on the right. -->
  <div class="combat-console">
    <section class="chronicle" aria-label="Battle Chronicle">
      <div class="chronicle-heading">
        <h3>Battle Chronicle</h3>
        <button type="button" onclick={() => logOpen = !logOpen}
          aria-expanded={logOpen} aria-controls="combat-chronicle-list">
          {logOpen ? 'Latest only' : 'Full history'}
        </button>
      </div>
      <div id="combat-chronicle-list" class="log-window" role="log" aria-live="off" aria-relevant="additions">
        {#if snapshot.events.length === 0}
          <p class="no-events">Flint approaches. The first turn has not been committed.</p>
        {:else}
          <ol>
            {#each recentEvents as event, i (i)}
              <li class:latest={i === recentEvents.length - 1}
                class:impact={event.kind === 'damage'} class:evaded={event.kind === 'miss'}>
                <span class="round">{String(event.round).padStart(2, '0')}</span>
                <span>{event.text}</span>
              </li>
            {/each}
          </ol>
        {/if}
      </div>
      {#if !logOpen && snapshot.events.length > 3}
        <p class="history-hint">Latest 3 of {snapshot.events.length} entries.</p>
      {/if}
    </section>

    <section class="player-status" aria-label="Player combat condition">
      {@render combatant(snapshot.player, 'You', false)}
      {#each feedback.filter(item => item.target === 'player') as cue (cue.id)}
        <span class="combat-float" class:missed={cue.kind === 'miss'} aria-hidden="true">{cue.label}</span>
      {/each}
    </section>

    {#if ended}
      <section class="aftermath" aria-label="The Fight with Flint personal journal">
        <header class="journal-head">
          <div>
            <small>PERSONAL JOURNAL</small>
            <h2>The Fight with Flint</h2>
          </div>
        </header>
        <div class="journal-entries">
          <p>Flint blocked the way home with his club. I told him to move. He wouldn't. So we fought.</p>
          <p>{journal}</p>
        </div>
      </section>
    {/if}
  </div>
</section>

<style>
  .battle{min-width:0;background:#1b1815;color:#eed8b5;font-family:var(--pall-font-reading,Georgia,serif)}
  .alley{position:relative;min-height:clamp(505px,36vw,625px);isolation:isolate;overflow:hidden;
    background:#1b222b url('/locations/alley/alley-background.webp') center/cover no-repeat}
  .alley::after{content:'';position:absolute;inset:auto 0 0;height:235px;
    background:linear-gradient(transparent,#161410aa 65%,#181512f0);pointer-events:none;z-index:1}
  .stage-scenery{position:absolute;inset:0;pointer-events:none}
  .flint{position:absolute;left:3%;bottom:7%;width:29%;height:84%;display:flex;flex-direction:column;
    align-items:center;justify-content:flex-end;z-index:1}
  .flint img{max-height:calc(100% - 28px);max-width:100%;object-fit:contain;object-position:center bottom;
    filter:drop-shadow(0 7px 11px #000b)}
  .scene-label{box-sizing:border-box;display:flex;align-items:center;justify-content:center;
    min-height:31px;padding:2px 8px;background:transparent;color:#2e1d11;text-align:center;
    border:solid transparent;border-width:8px 12px 7px;
    border-image-source:url('/ui-kit/frames/dialogue-frame-trim.png');
    border-image-slice:145 190 125 190 fill;
    border-image-width:8px 12px 7px;border-image-repeat:stretch;
    font:700 11px/1.15 var(--pall-font-reading,Georgia,serif)}
  .flint-label{width:min(100%,250px)}
  .cart-marker{position:absolute;top:58%;left:63%;z-index:1}
  .parchment{position:absolute;top:25px;right:2%;width:min(37%,525px);box-sizing:border-box;z-index:3;
    padding:12px 15px 13px;color:#2b1c11;background:transparent;border:solid transparent;
    border-width:21px 25px 20px;border-image-source:url('/ui-kit/frames/dialogue-frame-trim.png');
    border-image-slice:145 190 125 190 fill;
    border-image-width:21px 25px 20px;border-image-repeat:stretch;
    filter:drop-shadow(0 6px 10px #0008)}
  .parchment h2{font:700 clamp(19px,1.5vw,25px)/1.2 Georgia,serif;margin:0;text-transform:uppercase}
  .parchment p{margin:0 0 7px;line-height:1.4}
  .encounter-line{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:0 0 10px}
  .distance{font:700 11px/1.4 Arial,sans-serif;letter-spacing:.045em;color:#5c3d26;text-transform:uppercase;white-space:nowrap}
  .telegraph-title{font:700 11px/1.3 Arial,sans-serif;letter-spacing:.065em;color:#563b26}
  .parchment .intent{font:16px/1.4 Georgia,serif}
  .parchment .stance{font-style:italic;font-size:14px}
  .parchment .position{font-size:12px;color:#604531}
  .parchment .outcome{font-weight:700}
  .parchment .after{border-top:1px solid #baa17f;padding-top:8px;font-size:12px}
  .heavy{color:#8b2a1f;font-weight:700}

  /* Enemy condition is physically linked to Flint, not the player controls. */
  .enemy-status{position:absolute;z-index:3;top:30px;left:31%;width:min(25%,380px);min-width:260px}
  .action-zone{position:absolute;right:2.2%;bottom:22px;z-index:4;display:grid;gap:7px;
    min-width:0;width:min(69%,1090px)}
  .actions-row{display:grid;grid-template-columns:minmax(0,1fr) minmax(145px,19%);
    align-items:center;gap:10px;min-width:0}
  .choices{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:5px;min-width:0}
  .action-tile{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:0;
    min-width:0;min-height:69px;padding:2px 3px 3px;background:transparent;color:#2e1d11;
    border:solid transparent;border-width:10px 12px 9px;
    border-image-source:url('/ui-kit/frames/dialogue-frame-trim.png');
    border-image-slice:145 190 125 190 fill;
    border-image-width:10px 12px 9px;border-image-repeat:stretch;
    cursor:pointer;transition:filter .15s ease,transform .15s ease}
  .action-tile img{width:clamp(27px,2.5vw,38px);height:clamp(27px,2.5vw,38px);
    object-fit:contain;filter:brightness(.63) sepia(.25);pointer-events:none}
  .action-tile .action-name{font:700 clamp(10px,.8vw,12px)/1.15 var(--pall-font-reading,Georgia,serif);
    color:#312116;opacity:.76;text-align:center}
  .action-tile.chosen{filter:brightness(1.08) drop-shadow(0 0 4px #dca25b);transform:translateY(-1px)}
  .action-tile.chosen .action-name{opacity:1;color:#2d190c}
  .action-tile:hover:not(:disabled),.commit:hover:not(:disabled){filter:brightness(1.12)}
  .action-tile:disabled,.commit:disabled{opacity:.4;cursor:not-allowed;filter:grayscale(.55)}
  .confirm-holder{border-left:1px solid #9f805e;padding-left:10px;min-width:0}
  .commit{display:flex;align-items:center;justify-content:center;gap:5px;width:100%;min-height:61px;
    padding:2px 5px;background:transparent;color:#2b1b0f;cursor:pointer;
    border:solid transparent;border-width:10px 12px 9px;
    border-image-source:url('/ui-kit/frames/dialogue-frame-trim.png');
    border-image-slice:145 190 125 190 fill;
    border-image-width:10px 12px 9px;border-image-repeat:stretch;
    font:700 clamp(11px,.93vw,14px)/1.2 Georgia,serif}
  .commit img{width:clamp(24px,2.1vw,33px);height:clamp(24px,2.1vw,33px);
    object-fit:contain;filter:brightness(.6) sepia(.2)}
  .action-details{display:flex;align-items:center;justify-content:center;flex-wrap:wrap;gap:5px 12px;
    box-sizing:border-box;min-height:42px;width:min(100%,640px);margin:0 auto;padding:2px 10px;
    background:transparent;color:#352417;border:solid transparent;border-width:10px 14px 9px;
    border-image-source:url('/ui-kit/frames/dialogue-frame-trim.png');
    border-image-slice:145 190 125 190 fill;
    border-image-width:10px 14px 9px;border-image-repeat:stretch}
  .chosen-heading{display:flex;align-items:center;gap:6px;padding-right:9px;
    border-right:1px solid #917153;font:700 13px/1.2 Georgia,serif}
  .chosen-heading img{width:23px;height:23px;object-fit:contain;filter:brightness(.65) sepia(.2)}
  .detail-field{display:flex;align-items:center;gap:8px}
  .detail-field label,.detail-text{font:12px/1.3 Georgia,serif;color:#4b311c}
  .detail-field select{max-width:145px;min-height:26px;padding:2px 4px;
    background:#f3e2bf;color:#2d1b0f;border:1px solid #9d7750;font:12px Georgia,serif}
  .detail-text+.detail-text{border-left:1px solid #927251;padding-left:12px}
  .detail-note{font:11px/1.3 Georgia,serif;color:#795438}
  .error{margin:0;padding:8px 12px;background:#29140fef;border:1px solid #b45d4a;
    color:#ffc6ae;font:13px/1.45 Arial,sans-serif;text-align:center}
  .action-tile:focus-visible,.commit:focus-visible,.chronicle button:focus-visible,
  .detail-field select:focus-visible,.secondary-stats summary:focus-visible{
    outline:2px solid #ffda9d;outline-offset:3px}

  /* Each fighter has a single reusable status template; their positions differ. */
  .fighter,.chronicle{min-width:0;box-sizing:border-box;background:#29221eea;
    border:1px solid #8b6847;padding:15px 16px}
  .fighter.opponent{border-color:#92674a}
  .fighter-top{display:flex;align-items:baseline;justify-content:space-between;gap:10px}
  .fighter h3,.chronicle h3,.aftermath h3{margin:0;font:700 clamp(17px,1.35vw,23px)/1.2 Georgia,serif;color:#f4dfb8}
  .hp-value{white-space:nowrap;color:#e8bd7e;font:700 clamp(18px,1.6vw,25px)/1.2 Georgia,serif;
    font-variant-numeric:tabular-nums}
  .hp-value span{font:400 13px/1.2 Georgia,serif;color:#e4c69a}
  .hp-track{height:12px;border:1px solid #967049;overflow:hidden;background:#0d0c0b;
    border-radius:2px;margin:10px 0}
  .hp-fill{display:block;height:100%;background:linear-gradient(90deg,#b89558,#f4d397);transition:width .2s ease}
  .hp-fill.critical,.opponent .hp-fill{background:linear-gradient(90deg,#783326,#bd4a2e)}
  .resources{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));margin:0;gap:8px}
  .resource{min-width:0}
  .resource+.resource{border-left:1px solid #866447;padding-left:8px}
  .resource-top{display:flex;justify-content:space-between;align-items:baseline;gap:6px;min-width:0}
  .resource-top dt{color:#d3b182;font:12px/1.25 Georgia,serif}
  .resource-top dd{margin:0;color:#eed2a5;font:700 15px/1.25 Georgia,serif;
    font-variant-numeric:tabular-nums}
  .mini-track{display:block;height:7px;margin-top:6px;background:#0d0c0b;
    border:1px solid #967049;border-radius:3px;overflow:hidden}
  .mini-fill{display:block;height:100%;transition:width .2s ease}
  .mini-fill.stamina{background:linear-gradient(90deg,#326343,#71a67c)}
  .mini-fill.fatigue{background:linear-gradient(90deg,#8e542b,#d59a52)}
  .mini-fill.momentum{background:linear-gradient(90deg,#8b733d,#e6cb7c)}
  .secondary-stats{margin-top:11px;border-top:1px solid #4f3e31;padding-top:6px}
  .secondary-stats summary{cursor:pointer;color:#b99b78;font:11px/1.4 Arial,sans-serif}
  .secondary-stats dl{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px;margin:8px 0 0}
  .secondary-stats dl div{display:flex;justify-content:space-between;gap:6px;font:12px/1.3 Arial,sans-serif}
  .secondary-stats dt{color:#c1a582}.secondary-stats dd{margin:0;color:#f0d7ac;font-variant-numeric:tabular-nums}

  /* Battle Chronicle sits left of the player's status, below the alley. */
  .combat-console{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(0,1fr);
    align-items:stretch;gap:14px;padding:14px 16px;min-width:0}
  .player-status{min-width:0;position:relative}
  .player-status .fighter{height:100%}
  .chronicle-heading{display:flex;align-items:center;justify-content:space-between;
    gap:10px;margin-bottom:10px}
  .chronicle-heading button{padding:7px 12px;background:#271f19;color:#eed4ae;
    border:1px solid #927453;cursor:pointer;font:13px/1.2 Georgia,serif;white-space:nowrap}
  .chronicle-heading button:hover{background:#403124}
  .log-window{min-height:104px;max-height:220px;overflow:auto;scrollbar-color:#947651 #30281f;scrollbar-width:thin}
  .log-window ol{margin:0;padding:0;list-style:none}
  .log-window li{display:flex;gap:12px;padding:7px 4px;border-bottom:1px solid #49392f;
    font:13px/1.35 Georgia,serif;color:#ecd1a8}
  .log-window li.latest{background:#39291f;color:#ffdfb1;font-weight:700}
  .log-window li.impact{border-left:3px solid #ce5d4c;padding-left:7px;color:#ffd4c8;
    background:#552a2580}
  .log-window li.evaded{border-left:3px solid #d7b97b;padding-left:7px;
    color:#f4e1bf;background:#493c2b72}
  .round{font:700 11px/1.6 Arial,sans-serif;color:#b99770;flex:none}
  .history-hint{margin:8px 0 0;color:#b49773;font:11px/1.2 Arial,sans-serif}
  .no-events{font-size:13px;line-height:1.5}
  /* Transient hit/miss overlays are anchored to the target, never to a guessed
     attack roll. Actual damage comes from the committed combat Chronicle. */
  .combat-float{position:absolute;z-index:6;top:29%;left:52%;
    pointer-events:none;user-select:none;white-space:nowrap;
    color:#ff786a;font:900 clamp(22px,2.6vw,44px)/1.1 Georgia,serif;
    font-variant-numeric:tabular-nums;letter-spacing:.03em;
    -webkit-text-stroke:1px #47160c;
    text-shadow:0 2px 3px #160705,0 0 12px #e72e2b8c;
    animation:combat-feedback-float 1100ms ease-out both}
  .combat-float.missed{color:#f1e4ca;font-size:clamp(18px,2vw,33px);
    -webkit-text-stroke:1px #422e1c;text-shadow:0 2px 5px #120d07}
  .player-status .combat-float{top:-28px;left:50%}
  @keyframes combat-feedback-float{
    0%{opacity:0;transform:translate(-50%,18px) scale(.75)}
    18%{opacity:1;transform:translate(-50%,0) scale(1.14)}
    67%{opacity:1;transform:translate(-50%,-20px) scale(1)}
    100%{opacity:0;transform:translate(-50%,-49px) scale(.98)}
  }
  @keyframes combat-feedback-reduced{
    0%{opacity:0}10%{opacity:1}80%{opacity:1}100%{opacity:0}
  }
  /* Match the parchment, reading width and typography of the Stage 4–5 Journal. */
  .aftermath{grid-column:1/-1;background:#e6d5b5;color:#24160e;
    padding:23px clamp(16px,3vw,45px);border-top:2px solid #94704a;
    scroll-margin-top:14px}
  .journal-head{max-width:960px;margin:0 auto 15px}
  .journal-head small{font:700 13px/1.3 var(--pall-font-label,'Arial Narrow',sans-serif);
    letter-spacing:.09em;color:#47301d}
  .journal-head h2{margin:4px 0;font:600 24px/1.3 var(--pall-font-reading,Georgia,serif);
    color:#25170f}
  .journal-entries{max-width:960px;margin:0 auto}
  .journal-entries p{margin:0 0 10px;font:600 16px/1.55 var(--pall-font-reading,Georgia,serif);
    color:#24160e}

  @media(max-width:1220px){
    .enemy-status{left:29%;width:27%;min-width:230px}
    .action-zone{right:1.7%;width:72%}
    .choices{gap:4px}
    .resources{grid-template-columns:1fr}
    .resource{padding-left:0}
    .resource+.resource{border-left:0;padding-left:0}
  }
  @media(max-width:920px){
    .alley{min-height:0}
    .stage-scenery{position:relative;min-height:350px}
    .flint{width:43%;height:89%;bottom:0;left:1%}
    .parchment{width:54%;right:2%;top:15px}
    .cart-marker{top:68%}
    .enemy-status{position:relative;left:auto;top:auto;width:auto;min-width:0;margin:0 12px 8px}
    .action-zone{position:relative;left:auto;right:auto;bottom:auto;width:auto;
      padding:12px 13px 17px;background:#211b17ef}
    .actions-row{grid-template-columns:minmax(0,1fr) 160px}
    .combat-console{grid-template-columns:1fr}
    .resources{grid-template-columns:repeat(3,minmax(0,1fr))}
    .resource+.resource{border-left:1px solid #866447;padding-left:8px}
  }
  @media(max-width:640px){
    .stage-scenery{min-height:360px}
    .flint{width:51%;height:71%;bottom:0}
    .parchment{width:94%;top:8px;right:3%;padding:8px 10px;
      border-width:15px 18px 14px;border-image-width:15px 18px 14px}
    .parchment .intent{font-size:14px}
    .cart-marker{display:none}
    .actions-row{grid-template-columns:1fr}
    .choices{gap:5px}
    .action-tile{min-height:59px;border-width:7px 8px;padding:2px;
      border-image-width:7px 8px}
    .action-tile img{width:29px;height:29px}
    .action-tile .action-name{font-size:10px}
    .confirm-holder{padding:8px 0 0;border-left:0;border-top:1px solid #816748}
    .commit{min-height:48px}
    .action-details{width:100%;justify-content:flex-start}
    .combat-console{padding:9px;gap:9px}
  }
  @media(max-width:370px){
    .choices{grid-template-columns:repeat(3,minmax(0,1fr))}
    .resources{grid-template-columns:1fr}
    .resource+.resource{border-left:0;padding-left:0}
  }
  @media(prefers-reduced-motion:reduce){
    .hp-fill,.mini-fill,.action-tile{transition:none}
    .combat-float{animation:combat-feedback-reduced 1100ms linear both}
  }
</style>
