<script lang="ts">
  import type {CombatAction} from '@the-pall/game-core/combat-v0.5.1';
  import type {CombatSnapshot} from '$lib/millhand-combat-model';

  let {snapshot,pending,errorMessage,perform}: {
    snapshot:CombatSnapshot;
    pending:boolean;
    errorMessage:string;
    perform:(action:CombatAction)=>Promise<void>;
  }=$props();

  // Action availability and every resource value come from the server-owned
  // v0.5.1 encounter. Icons are visual labels only; they never change rules.
  const ended=$derived(snapshot.status==='finished');
  const canAttack=$derived(snapshot.legalActions.includes('attack'));
  const canTechnique=$derived(snapshot.legalActions.includes('technique'));
  const canMove=$derived(snapshot.legalActions.includes('move'));
  const canRecover=$derived(snapshot.legalActions.includes('recover'));

  let selected=$state<'attack'|'guard'|'move'|'recover'|'technique'>('guard');
  let zone=$state<'head'|'torso'|'limbs'>('torso');
  let destination=$state<'side'|'close'|'cover'|'back'>('side');
  let reserve=$state<'breath'|'nerves'>('breath');
  let logOpen=$state(false);

  const visibleSelection=$derived(snapshot.legalActions.includes(selected)
    ?selected:(canAttack?'attack':'guard'));
  const recentEvents=$derived(logOpen?snapshot.events:snapshot.events.slice(-3));
  const currentActionName=$derived(
    {attack:'Strike',guard:'Guard',move:'Reposition',recover:'Recover',technique:'Press Advantage'}[visibleSelection]
  );
  const stanceText=$derived(snapshot.stance==='brace'
    ?'You raise your arms and brace yourself as Flint approaches.'
    :snapshot.stance==='moving'
      ?'You move along the side of the passage, looking for space to get past Flint.'
      :'You begin the fight with the work cart between you and Flint.');
  const resultText=$derived(snapshot.outcome==='player_defeat'
    ?'You are knocked down and cannot get past Flint. Other workers enter the passage. Flint moves away without collecting money. One of them helps you towards medical care.'
    :snapshot.enemy.hp<=0
      ?'Flint is on the ground and cannot stop you. You move past him and leave the passage.'
      :'Flint steps aside. You wait until there is room to pass, then leave.');
  const toughVictory=$derived(snapshot.player.hp<=snapshot.player.hpMax/2 ||
    snapshot.player.wounds.some(wound=>wound.severity==='serious'));
  const journal=$derived(snapshot.outcome==='player_defeat'
    ?"Flint beat me. Damn it. I thought I could get past him, but I couldn't. Other workers came when they heard the fight, and he left without taking my money. One of them helped me get to medical care. Still not a coin from the council for those plates. A fine day I've had."
    :toughVictory
      ?"I beat Flint and got past him. That was tough. For a moment I didn't think I'd manage it, not with that club of his. Everybody knows how hard he is to beat. Well, he didn't get a coin out of me. And after all that, the council still hasn't paid us for those plates."
      :"I beat Flint and got past him. That club could've done some damage, but I managed to keep him off me. He didn't get a coin out of me. The council still owes us for the plates, of course.");

  const iconBase='/ui-kit/combat-actions/';
  function healthWidth(current:number,maximum:number):string {
    return `${Math.max(0,Math.min(100,Math.round(current/Math.max(1,maximum)*100)))}%`;
  }
  function commit():void {
    let action:CombatAction;
    switch(visibleSelection){
      case 'attack':action={type:'attack',zone};break;
      case 'guard':action={type:'guard'};break;
      case 'move':action={type:'move',to:destination};break;
      case 'recover':action={type:'recover',mode:reserve};break;
      case 'technique':action={type:'technique',zone};break;
    }
    void perform(action);
  }
</script>


<section class="battle" aria-label="Stage 6, the fight with Flint">
  <div class="alley">
    <div class="stage-scenery">
      <div class="flint" role="img" aria-label="Flint holding his club">
        <img src="/characters/flint/flint-standing.webp" alt="" />
        <span class="scene-label flint-label">FLINT · CONTRACTOR'S COLLECTOR</span>
      </div>
      <span class="cart-marker scene-label">WORK CART</span>

      <aside class="parchment" aria-label="Current encounter situation">
        <div class="encounter-line">
          <h2>{ended?'The fight ends':'Round '+String(snapshot.round).padStart(2,'0')}</h2>
          {#if !ended}<span class="distance">{snapshot.distance} range</span>{/if}
        </div>
        {#if snapshot.round===1 && !ended}<p class="stance">{stanceText}</p>{/if}
        {#if ended}
          <p class="outcome">{snapshot.outcome==='player_defeat'?'Flint defeated you. Other workers intervened.':'You defeated Flint.'}</p>
          <p>{resultText}</p>
          <p class="after">Your condition is saved. Stage 7 is not yet connected; no treatment has been simulated.</p>
        {:else}
          <p class="telegraph-title">FLINT'S OBSERVABLE INTENTION</p>
          <p class:heavy={snapshot.intentType==='heavy threat'} class="intent">{snapshot.enemyIntent}</p>
          <p class="position">Opening stance: {snapshot.stance==='cart'?'work cart':snapshot.stance==='moving'?'moving along passage':'braced'}.</p>
        {/if}
      </aside>
    </div>

    {#if !ended}
      <section class="action-zone" aria-label="Combat decisions">
        <div class="actions-row">
          <div class="choices" role="group" aria-label="Choose a combat action">
            {#each [
              {id:'attack',label:'Strike',asset:'strike.webp',enabled:canAttack},
              {id:'guard',label:'Guard',asset:'guard.webp',enabled:true},
              {id:'move',label:'Reposition',asset:'reposition.webp',enabled:canMove},
              {id:'recover',label:'Recover',asset:'recover.webp',enabled:canRecover},
              {id:'technique',label:'Press Advantage',asset:'press-advantage.webp',enabled:canTechnique}
            ] as choice (choice.id)}
              <button class="action-tile" class:chosen={visibleSelection===choice.id}
                type="button" disabled={pending||!choice.enabled}
                aria-pressed={visibleSelection===choice.id}
                aria-label={`Select ${choice.label} action`}
                title={choice.enabled?choice.label:choice.label+' unavailable'}
                onclick={()=>selected=choice.id as typeof selected}>
                <img src={iconBase+choice.asset} alt="" width="58" height="58" decoding="async" />
                <span class="action-name">{choice.label}</span>
              </button>
            {/each}
          </div>

          <div class="confirm-holder">
            <button class="commit" type="button" disabled={pending} onclick={commit}
              aria-label={`Confirm ${currentActionName} action`}>
              <img src={iconBase+'confirm-action.webp'} alt="" width="41" height="41" />
              <span>{pending?'Resolving…':'Confirm action'}</span>
            </button>
          </div>
        </div>

        <div class="action-details" aria-label="Selected combat action details">
          <div class="chosen-heading">
            <img src={iconBase+(
              visibleSelection==='attack'?'strike.webp':
              visibleSelection==='guard'?'guard.webp':
              visibleSelection==='move'?'reposition.webp':
              visibleSelection==='recover'?'recover.webp':'press-advantage.webp'
            )} width="32" height="32" alt="" />
            <strong>{currentActionName}</strong>
          </div>
          {#if visibleSelection==='attack'||visibleSelection==='technique'}
            <div class="detail-field">
              <label for="battle-zone">Target</label>
              <select id="battle-zone" bind:value={zone} disabled={pending}>
                <option value="torso">Torso</option>
                <option value="limbs">Limbs</option>
                <option value="head">Head</option>
              </select>
            </div>
            <span class="detail-text">Accuracy: {snapshot.rules.accuracy[zone]}%</span>
            <span class="detail-text">Stamina: {visibleSelection==='attack'?snapshot.rules.strikeCost:12}{visibleSelection==='technique'?' · Momentum: '+snapshot.rules.techniqueMomentum:''}</span>
            {#if visibleSelection==='attack'}<span class="detail-note">Repeated strikes cost more.</span>{/if}
          {:else if visibleSelection==='move'}
            <div class="detail-field">
              <label for="battle-move">Position</label>
              <select id="battle-move" bind:value={destination} disabled={pending}>
                {#if snapshot.distance!=='contact'}<option value="close">Close distance</option>{/if}
                <option value="side">Move sideways</option>
                <option value="back">Fall back</option>
                <option value="cover">Use cover</option>
              </select>
            </div>
            <span class="detail-text">Stamina: {snapshot.rules.moveCost}</span>
          {:else if visibleSelection==='recover'}
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

  <div class="combat-console">
    <section class="duel-board" aria-label="Both combatants' condition">
      {#each [{id:'you',value:snapshot.player,title:'You'},{id:'flint',value:snapshot.enemy,title:'Flint'}] as fighter (fighter.id)}
        <div class="fighter" class:opponent={fighter.id==='flint'}>
          <div class="fighter-top">
            <h3>{fighter.title}</h3>
            <strong class="hp-value">{fighter.value.hp} <span>/ {fighter.value.hpMax} HP</span></strong>
          </div>
          <div class="hp-track" role="progressbar" aria-label={fighter.title+' health'}
            aria-valuemin="0" aria-valuemax={fighter.value.hpMax} aria-valuenow={fighter.value.hp}>
            <span class="hp-fill" class:critical={fighter.value.hp<=fighter.value.hpMax/4}
              style:width={healthWidth(fighter.value.hp,fighter.value.hpMax)}></span>
          </div>
          <dl class="resources">
            <div><dt>Stamina</dt><dd>{fighter.value.stamina}</dd></div>
            <div><dt>Fatigue</dt><dd>{fighter.value.fatigue}</dd></div>
            <div><dt>Momentum</dt><dd>{fighter.value.momentum}</dd></div>
          </dl>
          <details class="secondary-stats">
            <summary>More condition details</summary>
            <dl>
              <div><dt>Composure</dt><dd>{fighter.value.composure}</dd></div>
              <div><dt>Wounds</dt><dd>{fighter.value.wounds.length}</dd></div>
              {#if fighter.value.bleed>0}<div><dt>Bleeding</dt><dd>{fighter.value.bleed}</dd></div>{/if}
              {#if fighter.value.ceiling<fighter.value.hpMax}
                <div><dt>Health ceiling</dt><dd>{fighter.value.ceiling}</dd></div>
              {/if}
            </dl>
          </details>
        </div>
      {/each}
    </section>

    <section class="chronicle" aria-label="Battle Chronicle">
      <div class="chronicle-heading">
        <h3>Battle Chronicle</h3>
        <button type="button" onclick={()=>logOpen=!logOpen}
          aria-expanded={logOpen} aria-controls="combat-chronicle-list">
          {logOpen?'Latest only':'Full history'}
        </button>
      </div>
      <div id="combat-chronicle-list" class="log-window" role="log" aria-live="off" aria-relevant="additions">
        {#if snapshot.events.length===0}
          <p class="no-events">Flint approaches. The first turn has not been committed.</p>
        {:else}
          <ol>
            {#each recentEvents as event,i (i)}
              <li class:latest={i===recentEvents.length-1}>
                <span class="round">{String(event.round).padStart(2,'0')}</span>
                <span>{event.text}</span>
              </li>
            {/each}
          </ol>
        {/if}
      </div>
      {#if !logOpen && snapshot.events.length>3}
        <p class="history-hint">Latest 3 of {snapshot.events.length} entries.</p>
      {/if}
    </section>

    {#if ended}
      <section class="aftermath" aria-label="Personal journal after the fight">
        <h3>Personal Journal</h3>
        <p>Flint blocked the way home with his club. I told him to move. He wouldn't. So we fought.</p>
        <p>{journal}</p>
      </section>
    {/if}
  </div>
</section>

<style>
  .battle{min-width:0;background:#1b1815;color:#eed8b5;font-family:var(--pall-font-reading,Georgia,serif)}
  .alley{position:relative;min-height:clamp(570px,41vw,690px);isolation:isolate;overflow:hidden;
    background:#1b222b url('/locations/alley/alley-background.webp') center/cover no-repeat}
  .alley::after{content:'';position:absolute;inset:auto 0 0;height:235px;
    background:linear-gradient(transparent,#161410aa 65%,#181512f0);pointer-events:none;z-index:1}
  .stage-scenery{position:absolute;inset:0;pointer-events:none}
  .flint{position:absolute;left:3%;bottom:7%;width:29%;height:84%;display:flex;flex-direction:column;
    align-items:center;justify-content:flex-end;z-index:1}
  .flint img{max-height:calc(100% - 28px);max-width:100%;object-fit:contain;object-position:center bottom;
    filter:drop-shadow(0 7px 11px #000b)}
  .flint span,.cart-marker{font:700 10px/1.3 Arial,sans-serif;letter-spacing:.065em;color:#392616;
    background:#ead6b4;border:1px solid #88633e;padding:5px 9px;text-align:center}
  .cart-marker{position:absolute;top:58%;left:63%;z-index:1}
  .parchment{position:absolute;top:36px;right:2.1%;box-sizing:border-box;z-index:3;
    width:min(35%,570px);min-height:0;padding:13px 17px;color:#2b1c11;background:#ead8b8;
    border:solid transparent;border-width:19px 23px;
    border-image:url('/ui-kit/frames/dialogue-frame.png') 60 fill stretch;
    filter:drop-shadow(0 7px 15px #0008)}
  .parchment h2{font:700 clamp(20px,1.7vw,27px)/1.16 Georgia,serif;margin:0;text-transform:uppercase}
  .parchment p{margin:0 0 8px;line-height:1.44}
  .encounter-line{display:flex;align-items:baseline;justify-content:space-between;gap:15px;margin:3px 0 13px}
  .distance{font:700 11px/1.4 Arial,sans-serif;letter-spacing:.045em;color:#5c3d26;text-transform:uppercase;white-space:nowrap}
  .kicker,.telegraph-title{font:700 11px/1.3 Arial,sans-serif;letter-spacing:.065em;color:#563b26}
  .parchment .kicker{margin:0}
  .parchment .intent{font:16px/1.4 Georgia,serif}
  .parchment .stance{font-style:italic;font-size:14px}
  .parchment .position{font-size:12px;color:#604531}
  .parchment .outcome{font-weight:700}
  .parchment .after{border-top:1px solid #baa17f;padding-top:8px;font-size:12px}
  .heavy{color:#8b2a1f;font-weight:700}

  /* Buttons belong to the battlefield, never to a second panel below it. */
  .action-zone{position:absolute;left:29%;right:2.6%;bottom:18px;z-index:4;display:grid;gap:11px;min-width:0}
  .actions-row{display:grid;grid-template-columns:minmax(0,1fr) minmax(170px,21%);align-items:center;gap:14px;min-width:0}
  .choices{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:7px;min-width:0}
  .action-tile{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:0;
    min-width:0;min-height:92px;padding:9px 5px 10px;color:#ecd0a2;background:#241c17c7;
    border:solid transparent;border-width:11px 13px;
    border-image:url('/ui-kit/buttons/button-normal-trim.png') 50 180 45 180 fill / 11px 13px 11px 13px stretch;
    cursor:pointer;transition:filter .15s ease,transform .15s ease}
  .action-tile img{width:clamp(36px,3.3vw,56px);height:clamp(36px,3.3vw,56px);object-fit:contain;pointer-events:none}
  .action-tile .action-name{font:600 clamp(11px,.92vw,14px)/1.2 var(--pall-font-reading,Georgia,serif);
    opacity:.76;white-space:normal;text-align:center;color:#f0d7b3}
  .action-tile.chosen{filter:brightness(1.25) drop-shadow(0 0 6px #e0a957);transform:translateY(-2px)}
  .action-tile.chosen .action-name{opacity:1;color:#fff1d5}
  .action-tile:hover:not(:disabled){filter:brightness(1.17)}
  .action-tile:disabled,.commit:disabled{opacity:.4;cursor:not-allowed;filter:grayscale(.55)}
  .confirm-holder{border-left:1px solid #9f805e;padding-left:15px;min-width:0}
  .commit{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;min-height:76px;
    color:#2b1b0f;background:#e9cf9f;cursor:pointer;
    border:solid transparent;border-width:11px 15px;
    border-image:url('/ui-kit/buttons/button-normal-trim.png') 50 180 45 180 fill / 11px 15px 11px 15px stretch;
    font:700 clamp(12px,1.05vw,17px)/1.2 Georgia,serif}
  .commit img{width:clamp(28px,2.7vw,43px);height:clamp(28px,2.7vw,43px);object-fit:contain;filter:brightness(.62) sepia(.2)}
  .commit:hover:not(:disabled){filter:brightness(1.12)}
  .action-details{display:flex;align-items:center;justify-content:center;flex-wrap:wrap;gap:7px 18px;
    box-sizing:border-box;min-height:48px;width:min(100%,760px);margin:0 auto;
    border:solid transparent;border-width:8px 14px;padding:3px 12px;
    border-image:url('/ui-kit/buttons/button-normal-trim.png') 50 180 45 180 fill / 8px 14px 8px 14px stretch;
    background:#211b17b5;color:#ead0a9}
  .chosen-heading{display:flex;align-items:center;gap:9px;padding-right:15px;border-right:1px solid #876742;
    font:700 16px/1.25 Georgia,serif}
  .chosen-heading img{width:31px;height:31px;object-fit:contain}
  .detail-field{display:flex;align-items:center;gap:8px}
  .detail-field label{font:13px/1.3 Georgia,serif;color:#d5b88c}
  .detail-field select{max-width:175px;min-height:32px;background:#e7cfaa;color:#291a0e;
    border:1px solid #9d7750;padding:3px 4px;font:13px Georgia,serif}
  .detail-text{font:13px/1.3 Georgia,serif;color:#eed7b3}
  .detail-text+.detail-text{border-left:1px solid #876742;padding-left:15px}
  .detail-note{font:12px/1.3 Georgia,serif;color:#c4a17a}
  .error{margin:0;padding:8px 12px;background:#29140fef;border:1px solid #b45d4a;color:#ffc6ae;
    font:13px/1.45 Arial,sans-serif;text-align:center}
  .action-tile:focus-visible,.commit:focus-visible,.chronicle button:focus-visible,
  .detail-field select:focus-visible,.secondary-stats summary:focus-visible{outline:2px solid #ffda9d;outline-offset:3px}

  /* Three synchronized tiles directly below the alley. */
  .combat-console{display:grid;grid-template-columns:minmax(0,1.9fr) minmax(0,1.15fr);
    align-items:stretch;gap:14px;padding:16px;min-width:0}
  .duel-board{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;min-width:0}
  .fighter,.chronicle,.aftermath{min-width:0;box-sizing:border-box;background:#29221e;
    border:1px solid #8b6847;padding:16px 17px}
  .fighter.opponent{border-color:#92674a}
  .fighter-top{display:flex;align-items:baseline;justify-content:space-between;gap:10px}
  .fighter h3,.chronicle h3,.aftermath h3{margin:0;font:700 clamp(17px,1.35vw,24px)/1.2 Georgia,serif;color:#f4dfb8}
  .hp-value{white-space:nowrap;color:#e8bd7e;font:700 clamp(18px,1.6vw,26px)/1.2 Georgia,serif;font-variant-numeric:tabular-nums}
  .hp-value span{font:400 13px/1.2 Georgia,serif;color:#e4c69a}
  .hp-track{height:13px;border:1px solid #967049;overflow:hidden;background:#0d0c0b;
    border-radius:2px;margin:11px 0 10px}
  .hp-fill{display:block;height:100%;background:linear-gradient(90deg,#b89558,#f4d397);transition:width .2s ease}
  .hp-fill.critical,.opponent .hp-fill{background:linear-gradient(90deg,#783326,#bd4a2e)}
  .resources{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));margin:0;gap:6px}
  .resources div{min-width:0;display:flex;align-items:baseline;justify-content:center;gap:8px}
  .resources div+div{border-left:1px solid #866447}
  .resources dt{color:#d3b182;font:13px/1.25 Georgia,serif}
  .resources dd{margin:0;color:#eed2a5;font:700 16px/1.25 Georgia,serif;font-variant-numeric:tabular-nums}
  .secondary-stats{margin-top:11px;border-top:1px solid #4f3e31;padding-top:6px}
  .secondary-stats summary{cursor:pointer;color:#b99b78;font:11px/1.4 Arial,sans-serif}
  .secondary-stats dl{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px;margin:8px 0 0}
  .secondary-stats dl div{display:flex;justify-content:space-between;gap:6px;font:12px/1.3 Arial,sans-serif}
  .secondary-stats dt{color:#c1a582}.secondary-stats dd{margin:0;color:#f0d7ac;font-variant-numeric:tabular-nums}
  .chronicle-heading{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px}
  .chronicle-heading button{padding:7px 12px;background:#271f19;color:#eed4ae;border:1px solid #927453;
    cursor:pointer;font:13px/1.2 Georgia,serif;white-space:nowrap}
  .chronicle-heading button:hover{background:#403124}
  .log-window{min-height:104px;max-height:220px;overflow:auto;scrollbar-color:#947651 #30281f;scrollbar-width:thin}
  .log-window ol{margin:0;padding:0;list-style:none}
  .log-window li{display:flex;gap:12px;padding:7px 4px;border-bottom:1px solid #49392f;
    font:13px/1.35 Georgia,serif;color:#ecd1a8}
  .log-window li.latest{background:#39291f;color:#ffdfb1;font-weight:700}
  .round{font:700 11px/1.6 Arial,sans-serif;color:#b99770;flex:none}
  .history-hint{margin:8px 0 0;color:#b49773;font:11px/1.2 Arial,sans-serif}
  .no-events{font-size:13px;line-height:1.5}
  .aftermath{grid-column:1/-1}.aftermath p{margin:10px 0;line-height:1.55}

  @media(max-width:1250px){
    .alley{min-height:575px}
    .action-zone{left:24%;right:2%}
    .choices{gap:4px}
    .action-tile{min-height:80px;padding:5px 2px}
    .action-details{gap:6px 11px}
    .detail-note{display:none}
    .combat-console{grid-template-columns:minmax(0,1.7fr) minmax(0,1fr)}
    .resources{grid-template-columns:1fr;gap:5px}
    .resources div{justify-content:space-between}
    .resources div+div{border-left:0}
  }
  @media(max-width:920px){
    .alley{min-height:0}
    .stage-scenery{position:relative;min-height:350px}
    .flint{width:43%;height:89%;bottom:0;left:1%}
    .parchment{width:54%;right:2%;top:15px}
    .cart-marker{top:68%}
    .action-zone{position:relative;left:auto;right:auto;bottom:auto;padding:12px 13px 17px;
      background:#211b17ef}
    .actions-row{grid-template-columns:minmax(0,1fr) 160px}
    .action-tile{min-height:88px}
    .combat-console{grid-template-columns:1fr}
    .resources{grid-template-columns:repeat(3,minmax(0,1fr))}
    .resources div{justify-content:center}
    .resources div+div{border-left:1px solid #866447}
  }
  @media(max-width:640px){
    .stage-scenery{min-height:360px}
    .flint{width:51%;height:71%;bottom:0}
    .parchment{width:94%;top:8px;right:3%;padding:8px 10px;border-width:14px 18px}
    .parchment .intent{font-size:14px}
    .cart-marker{display:none}
    .actions-row{grid-template-columns:1fr}
    .choices{gap:5px}
    .action-tile{min-height:79px;border-width:7px 8px;padding:5px 2px;
      border-image-width:7px 8px 7px 8px}
    .action-tile img{width:37px;height:37px}
    .action-tile .action-name{font-size:10px}
    .confirm-holder{padding:8px 0 0;border-left:0;border-top:1px solid #816748}
    .commit{min-height:53px}
    .action-details{width:100%;justify-content:flex-start}
    .duel-board{grid-template-columns:1fr;gap:8px}
    .resources{grid-template-columns:repeat(3,minmax(0,1fr))}
    .combat-console{padding:9px;gap:9px}
  }
  @media(max-width:370px){
    .choices{grid-template-columns:repeat(3,minmax(0,1fr))}
    .resources{grid-template-columns:1fr}
    .resources div+div{border-left:0}
  }
  @media(prefers-reduced-motion:reduce){.hp-fill,.action-tile{transition:none}}

  /* Owner's trimmed nine-slice replaces the untrimmed frame and opaque
     parchment backing. Text stays within the inner paper, not under metal. */
  .parchment{
    top:25px;right:2%;width:min(37%,525px);max-width:525px;
    background:transparent;border-style:solid;border-color:transparent;
    border-width:21px 25px 20px;padding:12px 15px 13px;
    border-image-source:url('/ui-kit/frames/dialogue-frame-trim.png');
    border-image-slice:145 190 125 190 fill;
    border-image-width:21px 25px 20px;
    border-image-repeat:stretch;
    filter:drop-shadow(0 6px 10px #0008)
  }
  .parchment h2{font-size:clamp(19px,1.5vw,25px);line-height:1.2}
  .parchment p{margin-bottom:7px;line-height:1.4}
  .encounter-line{align-items:center;margin:0 0 10px}
  .flint .scene-label,.cart-marker.scene-label{
    box-sizing:border-box;display:flex;align-items:center;justify-content:center;
    min-height:31px;padding:2px 8px;background:transparent;color:#2e1d11;
    border:solid transparent;border-width:8px 12px 7px;
    border-image-source:url('/ui-kit/frames/dialogue-frame-trim.png');
    border-image-slice:145 190 125 190 fill;
    border-image-width:8px 12px 7px;
    border-image-repeat:stretch;
    font:700 11px/1.15 var(--pall-font-reading,Georgia,serif);
    letter-spacing:.02em;text-align:center
  }
  .flint .scene-label{width:min(100%,250px)}
  .alley{min-height:clamp(505px,36vw,625px)}
  /* Smaller framed action tiles. Icons remain the primary labels, while
     costs and options are still server-derived and keyboard accessible. */
  .action-zone{left:auto;right:2.2%;bottom:22px;width:min(69%,1090px);gap:7px}
  .actions-row{grid-template-columns:minmax(0,1fr) minmax(145px,19%);gap:10px}
  .choices{gap:5px}
  .action-tile{
    min-height:69px;padding:2px 3px 3px;background:transparent;color:#2e1d11;
    border-style:solid;border-color:transparent;border-width:10px 12px 9px;
    border-image-source:url('/ui-kit/frames/dialogue-frame-trim.png');
    border-image-slice:145 190 125 190 fill;
    border-image-width:10px 12px 9px;
    border-image-repeat:stretch
  }
  .action-tile img{width:clamp(27px,2.5vw,38px);height:clamp(27px,2.5vw,38px);
    filter:brightness(.63) sepia(.25)}
  .action-tile .action-name{font-size:clamp(10px,.8vw,12px);color:#312116;opacity:.78}
  .action-tile.chosen{filter:brightness(1.08) drop-shadow(0 0 4px #dca25b);transform:translateY(-1px)}
  .action-tile.chosen .action-name{color:#2d190c;opacity:1}
  .confirm-holder{padding-left:10px}
  .commit{
    min-height:61px;padding:2px 5px;background:transparent;
    border-style:solid;border-color:transparent;border-width:10px 12px 9px;
    border-image-source:url('/ui-kit/frames/dialogue-frame-trim.png');
    border-image-slice:145 190 125 190 fill;
    border-image-width:10px 12px 9px;
    border-image-repeat:stretch;
    font-size:clamp(11px,.93vw,14px)
  }
  .commit img{width:clamp(24px,2.1vw,33px);height:clamp(24px,2.1vw,33px)}
  .action-details{
    width:min(100%,640px);min-height:42px;gap:5px 12px;padding:2px 10px;
    background:transparent;color:#352417;border-style:solid;border-color:transparent;
    border-width:10px 14px 9px;
    border-image-source:url('/ui-kit/frames/dialogue-frame-trim.png');
    border-image-slice:145 190 125 190 fill;
    border-image-width:10px 14px 9px;
    border-image-repeat:stretch
  }
  .chosen-heading{font-size:13px;padding-right:9px;border-right-color:#917153}
  .chosen-heading img{width:23px;height:23px;filter:brightness(.65) sepia(.2)}
  .detail-field label,.detail-text{font-size:12px;color:#4b311c}
  .detail-note{font-size:11px;color:#795438}
  .detail-field select{max-width:145px;min-height:26px;background:#f3e2bf;
    color:#2d1b0f;padding:2px 4px;font-size:12px}
  @media(max-width:1250px){
    .action-zone{width:73%;right:1.7%}
    .action-tile{min-height:63px;padding:2px}
  }
  @media(max-width:920px){
    .action-zone{width:100%;right:auto;left:auto;bottom:auto}
    .parchment{top:12px;right:2%;width:55%;max-width:none}
    .alley{min-height:0}
  }
  @media(max-width:640px){
    .parchment{top:8px;right:3%;width:94%;padding:8px 10px;border-width:15px 18px 14px;
      border-image-width:15px 18px 14px}
    .action-zone{width:100%;padding:10px 9px 14px}
    .action-tile{min-height:59px;border-width:7px 8px 7px;border-image-width:7px 8px 7px}
    .action-tile img{width:29px;height:29px}
    .commit{min-height:48px}
  }

</style>
