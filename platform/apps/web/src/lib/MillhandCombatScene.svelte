<script lang="ts">
  import {getContext,tick} from 'svelte';
  import {SCENE_JOURNAL_CONTEXT,type SceneJournalRegistrar} from '$lib/scene-journal';
  import type {CombatAction} from '@the-pall/game-core/combat-v0.5.1';
  import type {CombatActorView,CombatSnapshot} from '$lib/millhand-combat-model';
  import {COMBAT_RESOURCE_SCALE} from '$lib/millhand-combat-model';
  import {combatActionLabel,isEnemyCombatAction} from '$lib/millhand-combat-chronicle';
  import type {CombatFloatingFeedback} from '$lib/millhand-combat-feedback';

  let {snapshot, feedback, pending, errorMessage, perform, characterId}: {
    snapshot: CombatSnapshot;
    characterId: string;
    feedback: CombatFloatingFeedback[];
    pending: boolean;
    errorMessage: string;
    perform: (action: CombatAction) => Promise<void>;
  } = $props();

  // The server determines every value, legal action, and actual result.
  const ended = $derived(snapshot.status === 'finished');
  const flintDefeated = $derived(ended && snapshot.outcome === 'player_victory');

  let selected = $state<'attack'|'guard'|'move'|'recover'|'technique'|'focus'>('guard');
  let detailsOpen=$state(false);
  let zone = $state<'head'|'torso'|'limbs'>('torso');
  let destination = $state<'side'|'close'|'cover'|'back'>('side');
  let reserve = $state<'breath'|'nerves'>('breath');
  let logOpen = $state(false);
  let fatigueInfoDialog:HTMLDialogElement|undefined;
  const fatigueMilestones=[0,20,40,60,80,100] as const;
  function openFatigueInfo(){
    if(fatigueInfoDialog&&!fatigueInfoDialog.open)fatigueInfoDialog.showModal();
  }
  let journalOpen=$state(false);
  let journalElement:HTMLElement|undefined;
  let completedJournalShown=$state(false);
  async function toggleJournal(){
    journalOpen=!journalOpen;
    await tick();
    if(journalOpen)journalElement?.scrollIntoView({block:'start',behavior:'smooth'});
  }
  const registerSceneJournal=getContext<SceneJournalRegistrar|undefined>(SCENE_JOURNAL_CONTEXT);
  // Preserve the existing automatic outcome journal once, but allow the
  // persistent shell control to close or reopen it during/after combat.
  $effect(()=>{
    if(ended&&!completedJournalShown){
      journalOpen=true;
      completedJournalShown=true;
    }
  });
  $effect(()=>{
    registerSceneJournal?.({id:'combat-personal-journal',open:journalOpen,
      toggle:()=>{void toggleJournal();}});
    return ()=>registerSceneJournal?.(null);
  });

  // Disabled actions remain inspectable; only Confirm is blocked.
  const visibleSelection = $derived(selected);
  const recentEvents = $derived(logOpen ? snapshot.events : snapshot.events.slice(-6));
  const actionName = $derived({
    attack: 'Attack', guard: 'Guard', move: 'Reposition',
    recover: 'Recover', technique: 'Press Advantage',focus:'Focused Stance'
  }[visibleSelection]);
  const targetZones=['torso','limbs','head'] as const;
  const selectedDamage=$derived(visibleSelection==='technique'
    ?snapshot.rules.techniqueByZone[zone]:snapshot.rules.strikeByZone[zone]);
  const openingBonus=$derived(snapshot.rules.openingDamageBonus);
  const damageMin=$derived(selectedDamage.min+openingBonus);
  const damageMax=$derived(selectedDamage.max+openingBonus);
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
    {id:'attack',label:'Attack',short:'Attack',asset:'strike.webp'},
    {id:'guard',label:'Guard',short:'Guard',asset:'guard.webp'},
    {id:'move',label:'Reposition',short:'Move',asset:'reposition.webp'},
    {id:'recover',label:'Recover',short:'Rest',asset:'recover.webp'},
    {id:'technique',label:'Press Advantage',short:'Press',asset:'press-advantage.webp'},
    {id:'focus',label:'Focused Stance',short:'Focus',asset:null}
  ] as const;
  const selectedAsset=$derived(actionChoices.find(choice=>choice.id===visibleSelection)?.asset??null);
  const focusedTurns=$derived(snapshot.rules.focus?.remaining??0);

  function available(action: (typeof actionChoices)[number]['id']): boolean {
    return snapshot.legalActions.includes(action);
  }
  function handleHotbarKey(event:KeyboardEvent):void{
    if(ended||pending||event.altKey||event.ctrlKey||event.metaKey||event.repeat||
       fatigueInfoDialog?.open)return;
    if(!/^[1-6]$/.test(event.key))return;
    const target=event.target;
    if(target instanceof HTMLElement &&
      target.closest('input,select,textarea,[contenteditable="true"],dialog'))return;
    const choice=actionChoices[Number(event.key)-1];
    if(!choice)return;
    event.preventDefault();
    selected=choice.id;
  }
  function healthWidth(current: number, maximum: number): string {
    return `${Math.max(0, Math.min(100, Math.round(current / Math.max(1, maximum) * 100)))}%`;
  }

  // Fatigue is now capped at 100; keep the meter resilient to legacy saves.
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
      case 'focus': action = {type:'focus'}; break;
    }
    void perform(action);
  }
</script>

<svelte:window onkeydown={handleHotbarKey} />

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
            <dt class="resource-label">
              {resource.label}
              {#if resource.key==='fatigue'}
                <button class="fatigue-info-trigger" type="button"
                  aria-label="About Fatigue" title="About Fatigue"
                  data-pall-sfx="paper" disabled={!snapshot.rules.fatigue}
                  onclick={openFatigueInfo}>
                  <span aria-hidden="true">i</span>
                </button>
              {/if}
            </dt>
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
        {#if (actor.focusedTurnsRemaining??0)>0}
          <div><dt>Focused Stance</dt><dd>{actor.focusedTurnsRemaining} turns</dd></div>
        {/if}
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
          <p class="after">Your actual fight condition is saved. Both outcomes lead to a clinic examination.</p>
          <a class="pall-framed-button clinic-link" href={'/characters/'+encodeURIComponent(characterId)+'/millhand/clinic'}>Continue to medical care</a>
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
            {#each actionChoices as choice, i (choice.id)}
              <button class="action-tile" class:chosen={visibleSelection===choice.id}
                class:unavailable={!available(choice.id)}
                type="button" disabled={pending} aria-disabled={!available(choice.id)}
                aria-pressed={visibleSelection===choice.id}
                aria-label={`Select ${choice.label} action`}
                title={(i+1)+': '+(available(choice.id)?choice.label:choice.label+' unavailable')}
                onclick={()=>selected=choice.id}>
                <span class="hotkey" aria-hidden="true">{i+1}</span>
                {#if choice.asset}
                  <img src={iconBase+choice.asset} alt="" width="32" height="32" decoding="async" />
                {:else}
                  <span class="focus-symbol" aria-hidden="true">◎</span>
                {/if}
                <span class="action-name">{choice.short}</span>
                {#if choice.id==='focus'&&focusedTurns>0}
                  <span class="focus-timer" aria-label={`Focused Stance: ${focusedTurns} turns remaining`}>{focusedTurns}</span>
                {/if}
              </button>
            {/each}
          </div>
          <div class="confirm-holder">
            <button class="commit" type="button" data-pall-sfx="none"
              disabled={pending || !available(visibleSelection)} onclick={commit}
              aria-label={`Confirm ${actionName} action`}>
              <img src={iconBase+'confirm-action.webp'} alt="" width="26" height="26" />
              <span>{pending?'Wait':'Confirm'}</span>
            </button>
            <button type="button" class="details-toggle"
              aria-expanded={detailsOpen} aria-controls="combat-action-detail-panel"
              onclick={()=>detailsOpen=!detailsOpen}>
              {detailsOpen?'Hide details':'Details'}
            </button>
          </div>
        </div>

        {#if detailsOpen}
        <div class="action-details" id="combat-action-detail-panel" aria-label="Selected combat action details">
          <div class="chosen-heading">
            <div class="heading-title">
              {#if selectedAsset}
                <img src={iconBase + selectedAsset} width="24" height="24" alt="" />
              {:else}
                <span class="focus-heading-symbol" aria-hidden="true">◎</span>
              {/if}
              <strong>{actionName}</strong>
            </div>
            {#if visibleSelection==='attack'||visibleSelection==='technique'}
              <img class="weapon-icon" src={iconBase + (snapshot.rules.unarmed?'unarmed-fists.webp':'rifle.webp')}
                alt={snapshot.rules.weaponLabel} width="48" height="48" />
            {/if}
          </div>
          {#if !available(visibleSelection)}
            <p class="detail-note action-unavailable">
              {snapshot.player.fatigue>=snapshot.rules.fatigue.recoverOnlyAt
                ?'At 100 Fatigue, only Recover is possible.'
                :snapshot.player.fatigue>=snapshot.rules.fatigue.limitedAt
                ?'At 70 Fatigue, only Reposition and Recover remain available.'
                :visibleSelection==='focus'
                ?focusedTurns>0?'Focused Stance is already active for '+focusedTurns+' turns.'
                  :'Requires '+(snapshot.rules.focus?.cost??10)+' Composure.'
                :visibleSelection==='technique'
                ?'Requires contact range and '+snapshot.rules.techniqueMomentum+' Momentum (currently '+snapshot.player.momentum+').'
                :visibleSelection==='attack'
                ?'Move into contact range before attacking.'
                :'This action is unavailable now.'}
            </p>
          {/if}
          {#if visibleSelection==='attack'||visibleSelection==='technique'}
            <div class="target-list" role="group" aria-label="Choose the body part to target">
              {#each targetZones as target (target)}
                <button type="button" class="target-line" class:selected-target={zone===target}
                  aria-pressed={zone===target} disabled={pending} onclick={()=>zone=target}>
                  <span><b>Target:</b> {target==='limbs'?'Arms':target==='head'?'Head':'Torso'}</span>
                  <span><b>Accuracy:</b> {snapshot.rules.accuracy[target]}%</span>
                  <span><b>Base Damage:</b>
                    {visibleSelection==='attack'
                      ?snapshot.rules.strikeByZone[target].min
                      :snapshot.rules.techniqueByZone[target].min}–{visibleSelection==='attack'
                      ?snapshot.rules.strikeByZone[target].max
                      :snapshot.rules.techniqueByZone[target].max}</span>
                  {#if openingBonus>0}
                    <span class="opening-stat"><b>Opening:</b> +{openingBonus}</span>
                    <span class="potential-stat"><b>Total:</b>
                      {visibleSelection==='attack'
                        ?snapshot.rules.strikeByZone[target].min+openingBonus
                        :snapshot.rules.techniqueByZone[target].min+openingBonus}–{visibleSelection==='attack'
                        ?snapshot.rules.strikeByZone[target].max+openingBonus
                        :snapshot.rules.techniqueByZone[target].max+openingBonus}</span>
                  {/if}
                  <span><b>Cost:</b> {visibleSelection==='attack'?snapshot.rules.strikeCost:15} Stamina{visibleSelection==='technique'?' + '+snapshot.rules.techniqueMomentum+' Momentum':''}</span>
                </button>
              {/each}
            </div>
            {#if visibleSelection==='attack'}
              <p class="action-explanation">Strike the selected body part. Repeated Arms hits impair
                attack accuracy and speed. Head hits deal more damage but are harder to land.
                A damaging hit grants +10 Momentum. Base Damage is before an Opening bonus
                or the opponent's Guard. Accuracy includes the current Fatigue penalty.</p>
            {:else}
              <p class="action-explanation">A powerful strike that deals increased damage.
                Requires {snapshot.rules.techniqueMomentum} Momentum.
                Accuracy and damage depend on the selected body part.
                {openingBonus>0?'A current opening adds '+openingBonus+' damage.':''}
                Base Damage excludes the separate Opening bonus and enemy Guard.
                Accuracy includes the current Fatigue penalty.</p>
            {/if}
            {#if snapshot.rules.openingReason}
              <p class="detail-note">Opening: {snapshot.rules.openingReason}.
                Shown accuracy includes its accuracy bonus; the damage rows show
                base damage, bonus and total separately.</p>
            {/if}
          {:else if visibleSelection==='guard'}
            <div class="stat-line">
              <span><b>Damage Reduction:</b> {snapshot.rules.guardMitigationPercent}%</span>
              <span><b>Duration:</b> 1 Turn</span>
              <span><b>Cost:</b> {snapshot.rules.guardCost} Stamina</span>
            </div>
            <p class="action-explanation">Reduce damage from incoming attacks.
              Does not prevent all damage. Guard reduction is rolled within the shown range for every landed blow. A successful block may create an opening
              and grant +8 Momentum.</p>
          {:else if visibleSelection==='focus'}
            <div class="stat-line">
              <span><b>Composure:</b> −{snapshot.rules.focus?.cost??10}</span>
              <span><b>Accuracy:</b> +{snapshot.rules.focus?.accuracyBonusPercent??10} percentage points</span>
              <span><b>Duration:</b> {snapshot.rules.focus?.duration??3} subsequent turns</span>
              <span><b>Activation:</b> 1 Turn</span>
            </div>
            <p class="action-explanation">
              Steady your breathing and focus on your timing. Your attacks are
              more accurate for three turns, including misses and special attacks.
              Damage does not increase. Focused Stance does not stack or protect
              you while preparing; Flint may still strike normally.
            </p>
            {#if focusedTurns>0}
              <p class="detail-note">Focused Stance active: {focusedTurns} turns remaining.</p>
            {/if}
          {:else if visibleSelection==='move'}
            <div class="stat-line">
              <span><b>Cost:</b> {snapshot.rules.moveCost} Stamina</span>
              <span><b>Dodge Chance:</b> {snapshot.rules.dodgeChance.side}–{snapshot.rules.dodgeChance.back}%</span>
              <span><b>Range:</b> Variable</span>
            </div>
            <div class="detail-field">
              <label for="battle-move">Move:</label>
              <select id="battle-move" bind:value={destination} disabled={pending}>
                {#if snapshot.distance!=='contact'}<option value="close">Close distance</option>{/if}
                <option value="side">Move sideways</option>
                <option value="back">Fall back</option>
                <option value="cover">Use cover</option>
              </select>
              <span class="detail-text">Selected dodge: {snapshot.rules.dodgeChance[destination]}%</span>
            </div>
            <p class="action-explanation">Move sideways to attempt a dodge, or fall back
              to increase distance from your opponent. A dodge roll applies only when
              you move before Flint's committed attack. Close distance gives no dodge chance.</p>
          {:else}
            <div class="stat-line">
              <span><b>Current Fatigue:</b> {snapshot.player.fatigue}</span>
              <span><b>Removes:</b> Up to {snapshot.rules.fatigue.recovery} Fatigue</span>
              <span><b>Duration:</b> 1 Turn</span>
            </div>
            <div class="detail-field">
              <label for="battle-recovery">Recover:</label>
              <select id="battle-recovery" bind:value={reserve} disabled={pending}>
                <option value="breath">Stamina</option>
                <option value="nerves">Composure</option>
              </select>
              {#if reserve==='breath'}
                <span class="detail-text"><b>Stamina:</b> Up to +{snapshot.rules.recoverStamina}</span>
              {:else}
                <span class="detail-text"><b>Composure:</b> Up to +{snapshot.rules.recoverComposure} (no Stamina)</span>
              {/if}
            </div>
            <ul class="recover-tiers" aria-label="Recover benefits by Fatigue">
              <li><strong>Fatigue 0–49:</strong>
                −{snapshot.rules.fatigue.recoveryBelow50} Fatigue,
                +{snapshot.rules.recoverStaminaBelow50} Stamina</li>
              <li><strong>Fatigue 50–100:</strong>
                −{snapshot.rules.fatigue.recoveryFrom50} Fatigue,
                +{snapshot.rules.recoverStaminaFrom50} Stamina</li>
              <li><strong>Composure:</strong> Restore
                {snapshot.rules.recoverComposure} Composure instead of Stamina,
                with the same Fatigue reduction.</li>
            </ul>
            <p class="recover-cost"><strong>Cost:</strong> 1 Turn. Does not restore Health.</p>
            <p class="action-explanation">Take a turn to catch your breath,
              adding Stamina and shake off some Fatigue. The more exhausted you are,
              the harder it is to regain your strength.</p>
            {#if snapshot.distance==='contact'}
              <p class="recovery-risk">Flint is in striking range.
                Recover is not Guard: his club can still hit you for full,
                unguarded damage.</p>
            {/if}
          {/if}
        </div>
        {/if}
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
                <span class="event-body">
                  <span class="event-action" class:enemy-action={isEnemyCombatAction(event)}>
                    [{combatActionLabel(event)}]
                  </span>
                  <span>{event.text}</span>
                </span>
              </li>
            {/each}
          </ol>
        {/if}
      </div>
      {#if !logOpen && snapshot.events.length > 6}
        <p class="history-hint">Latest 6 of {snapshot.events.length} entries.</p>
      {/if}
    </section>

    <section class="player-status" aria-label="Player combat condition">
      {@render combatant(snapshot.player, 'You', false)}
      {#each feedback.filter(item => item.target === 'player') as cue (cue.id)}
        <span class="combat-float" class:missed={cue.kind === 'miss'} aria-hidden="true">{cue.label}</span>
      {/each}
    </section>

    {#if journalOpen}
      <section id="combat-personal-journal" class="aftermath"
        bind:this={journalElement} aria-label="The Fight with Flint personal journal">
        <header class="journal-head">
          <div>
            <small>PERSONAL JOURNAL</small>
            <h2>The Fight with Flint</h2>
          </div>
        </header>
        <div class="journal-entries">
          {#if ended}
            <p>Flint blocked the way home with his club. I told him to move. He wouldn't. So we fought.</p>
            <p>{journal}</p>
          {:else}
            <p>The fight with Flint is still going on. I haven't recorded how it ends.</p>
          {/if}
        </div>
      </section>
    {/if}
  </div>
</section>

{#if snapshot.rules.fatigue}
<dialog bind:this={fatigueInfoDialog} class="fatigue-info-dialog"
  aria-labelledby="fatigue-help-title" aria-describedby="fatigue-help-description">
  <div class="fatigue-info-heading">
    <h2 id="fatigue-help-title">Fatigue</h2>
    <button type="button" class="fatigue-info-close" onclick={()=>fatigueInfoDialog?.close()}>
      Close
    </button>
  </div>
  <p id="fatigue-help-description">Fighting wears you down. As Fatigue builds,
    your attacks become less accurate and your body struggles to keep up.</p>
  <p><strong>Accuracy Penalty:</strong>
    −{snapshot.rules.fatigue.accuracyLossPerTen} percentage points for every 10 Fatigue.</p>
  <table class="fatigue-info-table">
    <thead><tr><th scope="col">Fatigue</th><th scope="col">Accuracy Penalty</th></tr></thead>
    <tbody>
      {#each fatigueMilestones as level (level)}
        <tr>
          <th scope="row">{level}</th>
          <td>{level===0?'0%':'−'+Math.floor(level/10)*snapshot.rules.fatigue.accuracyLossPerTen+'%'}</td>
        </tr>
      {/each}
    </tbody>
  </table>
  <p>Recovering reduces Fatigue, but heavy exhaustion takes more than one
    breather to shake off.</p>
  <p class="fatigue-info-summary"><strong>Range:</strong> 0–{snapshot.rules.fatigue.cap}
    <span aria-hidden="true"> | </span>
    <strong>Maximum Accuracy Penalty:</strong>
    −{Math.floor(snapshot.rules.fatigue.cap/10)*snapshot.rules.fatigue.accuracyLossPerTen}
    percentage points.</p>
</dialog>
{/if}

<style>
  .battle{min-width:0;background:#1b1815;color:#eed8b5;font-family:var(--pall-font-reading,Georgia,serif)}
  .alley{position:relative;min-height:clamp(505px,36vw,625px);isolation:isolate;overflow:hidden;
    background:#1b222b url('/locations/alley/alley-background.webp') center/cover no-repeat}
  .alley::after{content:'';position:absolute;inset:auto 0 0;height:235px;
    background:linear-gradient(transparent,#161410aa 65%,#181512f0);pointer-events:none;z-index:1}
  /* Scenery remains non-interactive; its framed outcome card must receive
     real pointer hits, including all descendants and the clinic link. */
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
    pointer-events:auto;filter:drop-shadow(0 6px 10px #0008)}
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
  .recover-tiers{margin:2px 0 0;padding:0 0 0 19px;color:#50331c;
    font:600 12px/1.45 Georgia,serif}
  .recover-tiers li{margin:2px 0}
  .recover-tiers strong,.recover-cost strong{font-weight:700}
  .recover-cost{margin:0;color:#4e301b;font:600 12px/1.4 Georgia,serif}
  .recovery-risk{margin:0;color:#8c3424;font:700 12px/1.4 Georgia,serif}
  .fatigue-info-dialog{box-sizing:border-box;width:min(540px,calc(100vw - 24px));
    max-width:540px;max-height:calc(100dvh - 28px);overflow:auto;overscroll-behavior:contain;
    padding:clamp(16px,3vw,27px);margin:auto;background:#e9d6b5;color:#302114;
    border:2px solid #8a6040;box-shadow:0 20px 75px #000a;
    font:600 14px/1.5 Georgia,serif}
  .fatigue-info-dialog::backdrop{background:#0d0b09bb}
  .fatigue-info-dialog p{margin:0 0 15px}
  .fatigue-info-heading{display:flex;align-items:center;justify-content:space-between;
    gap:12px;margin:0 0 15px;padding:0 0 10px;border-bottom:1px solid #aa8561}
  .fatigue-info-heading h2{margin:0;font:700 26px/1.2 Georgia,serif}
  .fatigue-info-close{cursor:pointer;padding:7px 13px;border:1px solid #8a6040;
    color:#342116;background:#f0ddbd;font:700 13px/1.2 Georgia,serif}
  .fatigue-info-close:hover{background:#fff1d2}
  .fatigue-info-close:focus-visible,.fatigue-info-trigger:focus-visible{
    outline:2px solid #aa6c36;outline-offset:3px}
  .fatigue-info-table{border-collapse:collapse;width:100%;margin:4px 0 16px;
    font:600 14px/1.35 Georgia,serif}
  .fatigue-info-table th,.fatigue-info-table td{padding:7px 10px;
    text-align:left;border-bottom:1px solid #b99e7e}
  .fatigue-info-table thead th{background:#d6ba92;font-weight:700}
  .fatigue-info-table tbody th{font-weight:600}
  .fatigue-info-summary{margin-bottom:0!important;padding-top:12px;
    border-top:1px solid #aa8561}
  .fatigue-info-summary span{margin:0 5px;color:#805d3c}
  /* Compact six-slot MMO hotbar: no large framed cards unless details are requested. */
  .action-zone{position:absolute;right:2.2%;bottom:16px;z-index:4;
    display:grid;justify-items:end;gap:5px;min-width:0;width:min(74%,790px)}
  .actions-row{display:flex;justify-content:flex-end;align-items:stretch;gap:7px;
    box-sizing:border-box;width:max-content;max-width:100%;margin:0 0 0 auto;
    padding:5px;background:#1d1815ed;border:1px solid #9c7649;
    border-radius:5px;box-shadow:0 3px 16px #000b}
  .choices{display:grid;grid-template-columns:repeat(6,minmax(0,54px));gap:4px;min-width:0}
  .action-tile{position:relative;display:flex;flex-direction:column;
    align-items:center;justify-content:center;gap:0;box-sizing:border-box;
    width:54px;height:57px;min-width:0;padding:6px 2px 2px;
    background:linear-gradient(#403026,#201b18);color:#f2dbb2;
    border:2px solid #7a5e40;border-radius:3px;
    cursor:pointer;transition:border-color .12s ease,background .12s ease}
  .action-tile img{width:30px;height:30px;object-fit:contain;
    filter:sepia(.35) brightness(1.3);pointer-events:none}
  .action-tile .action-name{font:700 9px/1.12 Georgia,serif;color:#f3dcad;
    text-align:center;white-space:nowrap}
  .action-tile .hotkey{position:absolute;top:1px;left:3px;color:#ccad7c;
    font:700 9px/1 Arial,sans-serif}
  .action-tile .focus-symbol{display:grid;place-items:center;width:30px;height:30px;
    font:700 33px/1 Georgia,serif;color:#e9d9ad;text-shadow:0 0 7px #cba35f}
  .action-tile .focus-timer{position:absolute;top:1px;right:3px;min-width:13px;
    color:#fff2d1;background:#695123;border:1px solid #c4a064;border-radius:2px;
    font:700 10px/1.2 Arial,sans-serif}
  .action-tile.chosen{border-color:#f0c77f;box-shadow:inset 0 0 0 1px #d2ac64,
    0 0 7px #e7b45885;background:linear-gradient(#5b422a,#30251b)}
  .action-tile.unavailable:not(.chosen){opacity:.42;filter:saturate(.55)}
  .action-tile.unavailable.chosen{border-color:#b76b51}
  .action-tile:hover:not(:disabled),.commit:hover:not(:disabled){border-color:#e9c68d}
  .action-tile:disabled,.commit:disabled{opacity:.4;cursor:not-allowed}
  .confirm-holder{display:flex;flex-direction:column;gap:3px;flex:none;
    width:74px;min-width:0;padding:0 0 0 6px;border-left:1px solid #856448}
  .commit{display:flex;align-items:center;justify-content:center;gap:3px;
    box-sizing:border-box;width:100%;height:36px;min-height:0;padding:2px 4px;
    color:#f5dfb4;background:linear-gradient(#5d472a,#3b2b1b);
    border:1px solid #b38d52;border-radius:3px;cursor:pointer;
    font:700 10px/1 Georgia,serif}
  .commit img{width:21px;height:21px;object-fit:contain;
    filter:brightness(1.5) sepia(.25)}
  .details-toggle{width:100%;min-height:18px;padding:1px 3px;
    color:#dec49d;background:#2d241e;border:1px solid #7c6349;
    border-radius:2px;cursor:pointer;font:700 10px/1.1 Georgia,serif}
  .details-toggle:hover{background:#4a3629}
  .focus-heading-symbol{font:700 27px/1 Georgia,serif;color:#6d4b20}
  .action-details{display:flex;flex-direction:column;align-items:stretch;justify-content:center;gap:7px;
    box-sizing:border-box;max-height:320px;overflow-y:auto;min-height:0;
    width:min(100%,680px);margin:0 0 0 auto;padding:8px 15px;
    background:transparent;color:#352417;border:solid transparent;border-width:10px 14px 9px;
    border-image-source:url('/ui-kit/frames/dialogue-frame-trim.png');
    border-image-slice:145 190 125 190 fill;
    border-image-width:10px 14px 9px;border-image-repeat:stretch}
  .chosen-heading{display:flex;align-items:center;justify-content:space-between;gap:8px;
    padding:0 0 5px;border-bottom:1px solid #b18f69;font:700 18px/1.2 Georgia,serif}
  .heading-title{display:flex;align-items:center;gap:8px}
  .chosen-heading .weapon-icon{width:39px;height:39px;object-fit:contain;filter:none}
  .target-list{display:grid;gap:3px}
  .target-line{display:flex;align-items:center;gap:10px;flex-wrap:wrap;width:100%;
    text-align:left;padding:5px 8px;border:1px solid transparent;background:transparent;
    color:#382318;cursor:pointer;font:600 12px/1.35 Georgia,serif}
  .target-line span{white-space:nowrap}
  .target-line span+span{padding-left:9px;border-left:1px solid #b69a77}
  .target-line b,.stat-line b{font-weight:700}
  .target-line .opening-stat{color:#70441e;font-weight:700}
  .target-line .potential-stat{color:#493013;font-weight:700}
  .target-line.selected-target{background:#ecd4a5;border-color:#b68b55;border-radius:3px}
  .target-line:hover:not(:disabled){background:#f6e5c6}
  .target-line:focus-visible{outline:2px solid #855a31;outline-offset:2px}
  .stat-line{display:flex;align-items:center;gap:9px 14px;flex-wrap:wrap;
    font:600 13px/1.4 Georgia,serif}
  .stat-line span+span{padding-left:13px;border-left:1px solid #b69a77}
  .action-explanation{margin:4px 0 0;font:italic 600 12px/1.42 Georgia,serif;color:#563721}
  .detail-options{display:flex;align-items:center;justify-content:flex-start;flex-wrap:wrap;gap:6px 13px}
  .heading-title img{width:24px;height:24px;object-fit:contain;filter:brightness(.65) sepia(.2)}
  .detail-field{display:flex;align-items:center;gap:8px}
  .detail-field label,.detail-text{font:600 12px/1.3 Georgia,serif;color:#4b311c}
  .detail-field select{max-width:145px;min-height:26px;padding:2px 4px;
    background:#f3e2bf;color:#2d1b0f;border:1px solid #9d7750;font:12px Georgia,serif}
  .detail-options .detail-text+.detail-text{border-left:1px solid #927251;padding-left:10px}
  .detail-note{margin:0;font:600 12px/1.4 Georgia,serif;color:#624226}
  .action-unavailable{color:#842a21;font-weight:700}
  .error{margin:0;padding:8px 12px;background:#29140fef;border:1px solid #b45d4a;
    color:#ffc6ae;font:13px/1.45 Arial,sans-serif;text-align:center}
  .action-tile:focus-visible,.commit:focus-visible,.details-toggle:focus-visible,
  .chronicle button:focus-visible,
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
  .resource-label{display:flex;align-items:center;gap:5px;min-width:0}
  .fatigue-info-trigger{display:inline-grid;place-items:center;flex:none;
    box-sizing:border-box;width:19px;height:19px;padding:0;border:1px solid #bfa478;
    border-radius:50%;color:#f1d3a4;background:#30271f;
    font:italic 700 12px/1 Georgia,serif;cursor:pointer}
  .fatigue-info-trigger:hover:not(:disabled){background:#60412a;color:#fff0cf}
  .fatigue-info-trigger:disabled{opacity:.4;cursor:not-allowed}
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
  .log-window{min-height:150px;max-height:310px;overflow:auto;scrollbar-color:#947651 #30281f;scrollbar-width:thin}
  .log-window ol{margin:0;padding:0;list-style:none}
  .log-window li{display:flex;gap:12px;padding:7px 4px;border-bottom:1px solid #49392f;
    font:13px/1.35 Georgia,serif;color:#ecd1a8}
  .log-window li.latest{background:#39291f;color:#ffdfb1;font-weight:700}
  .log-window li.impact{border-left:3px solid #ce5d4c;padding-left:7px;color:#ffd4c8;
    background:#552a2580}
  .log-window li.evaded{border-left:3px solid #d7b97b;padding-left:7px;
    color:#f4e1bf;background:#493c2b72}
  .round{font:700 11px/1.6 Arial,sans-serif;color:#b99770;flex:none}
  .event-body{min-width:0;display:flex;align-items:baseline;flex-wrap:wrap;column-gap:6px;row-gap:2px}
  .event-action{flex:none;font:700 12px/1.35 Georgia,serif;color:#e6d3a9}
  .event-action.enemy-action{color:#ff7468;text-shadow:0 1px 2px #200804}
  .history-hint{margin:8px 0 0;color:#b49773;font:11px/1.2 Arial,sans-serif}
  .no-events{font-size:13px;line-height:1.5}
  .clinic-link{position:relative;z-index:1;max-width:100%;margin:12px 0 1px;pointer-events:auto}
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
    .action-zone{right:1.7%;width:77%}
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
      justify-items:center;padding:9px 10px;background:#211b17ef}
    .actions-row{margin:0 auto}
    .action-details{margin:0 auto}
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
    .actions-row{width:100%;flex-wrap:wrap;justify-content:center}
    .choices{width:100%;grid-template-columns:repeat(6,minmax(0,1fr));gap:3px}
    .action-tile{width:100%;height:53px;padding:5px 1px 1px}
    .action-tile img{width:27px;height:27px}
    .action-tile .focus-symbol{font-size:29px;height:27px}
    .action-tile .action-name{font-size:8px}
    .confirm-holder{display:flex;flex-direction:row;align-items:stretch;width:100%;
      padding:4px 0 0;border-left:0;border-top:1px solid #816748}
    .commit{width:60%;height:31px}
    .details-toggle{width:40%;min-height:31px}
    .action-details{width:100%;justify-content:flex-start}
    .detail-options{align-items:flex-start}
    .detail-options .detail-text+.detail-text{border:0;padding:0}
    .target-line span+span{border:0;padding:0}
    .stat-line span+span{border:0;padding:0}
    .combat-console{padding:9px;gap:9px}
  }
  @media(max-width:370px){
    .resources{grid-template-columns:1fr}
    .resource+.resource{border-left:0;padding-left:0}
  }
  @media(prefers-reduced-motion:reduce){
    .hp-fill,.mini-fill,.action-tile{transition:none}
    .combat-float{animation:combat-feedback-reduced 1100ms linear both}
  }
</style>
