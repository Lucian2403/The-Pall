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
  const recentEvents=$derived(logOpen?snapshot.events:snapshot.events.slice(-6));
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
    <div class="flint" role="img" aria-label="Flint holding his club">
      <img src="/characters/flint/flint-standing.webp" alt="" />
      <span>FLINT · CONTRACTOR'S COLLECTOR</span>
    </div>
    <span class="cart-marker">WORK CART</span>
    <aside class="parchment" aria-label="Current encounter situation">
      <p class="kicker">THE PASSAGE · STAGE 6</p>
      <div class="encounter-line">
        <h2>{ended?'The fight ends':`Round ${String(snapshot.round).padStart(2,'0')}`}</h2>
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

  <div class="combat-console">
    <section class="duel-board" aria-label="Both combatants' condition">
      {#each [{id:'you',value:snapshot.player,title:'You'},{id:'flint',value:snapshot.enemy,title:'Flint'}] as fighter (fighter.id)}
        <div class="fighter" class:opponent={fighter.id==='flint'}>
          <div class="fighter-top">
            <h3>{fighter.title}</h3>
            <strong class="hp-value">{fighter.value.hp} <span>/ {fighter.value.hpMax} HP</span></strong>
          </div>
          <div class="hp-track" role="progressbar" aria-label={`${fighter.title} health`}
            aria-valuemin="0" aria-valuemax={fighter.value.hpMax} aria-valuenow={fighter.value.hp}>
            <span class="hp-fill" class:critical={fighter.value.hp<=fighter.value.hpMax/4}
              style:width={healthWidth(fighter.value.hp,fighter.value.hpMax)}></span>
          </div>
          {#if fighter.value.ceiling<fighter.value.hpMax}
            <p class="ceiling">Health ceiling: {fighter.value.ceiling}</p>
          {/if}
          <dl class="resources">
            <div><dt>Stamina</dt><dd>{fighter.value.stamina}</dd></div>
            <div><dt>Fatigue</dt><dd>{fighter.value.fatigue}</dd></div>
            <div><dt>Momentum</dt><dd>{fighter.value.momentum}</dd></div>
            <div><dt>Composure</dt><dd>{fighter.value.composure}</dd></div>
            <div><dt>Wounds</dt><dd>{fighter.value.wounds.length}{fighter.value.bleed?` · bleeding ${fighter.value.bleed}`:''}</dd></div>
          </dl>
        </div>
      {/each}
    </section>

    <div class="decision-row" class:result-row={ended}>
      {#if !ended}
        <section class="tactics" aria-label="Choose a combat action">
          <div class="section-title">
            <h3>Your next move</h3>
            <span>Choose one action</span>
          </div>
          <div class="choices" role="group" aria-label="Combat action choices">
            {#each [
              {id:'attack',label:'Strike',asset:'strike.webp',enabled:canAttack},
              {id:'guard',label:'Guard',asset:'guard.webp',enabled:true},
              {id:'move',label:'Reposition',asset:'reposition.webp',enabled:canMove},
              {id:'recover',label:'Recover',asset:'recover.webp',enabled:canRecover},
              {id:'technique',label:'Press Advantage',asset:'press-advantage.webp',enabled:canTechnique}
            ] as choice (choice.id)}
              <button class="action-tile" type="button" disabled={pending||!choice.enabled}
                class:chosen={visibleSelection===choice.id}
                aria-pressed={visibleSelection===choice.id}
                aria-label={`Select ${choice.label} action`}
                title={choice.enabled?choice.label:`${choice.label} unavailable`}
                onclick={()=>selected=choice.id as typeof selected}>
                <img src={iconBase+choice.asset} alt="" width="72" height="72" decoding="async" />
                <span class="action-name">{choice.label}</span>
              </button>
            {/each}
          </div>
          <div class="action-details">
            <div class="chosen-heading">{currentActionName}</div>
            {#if visibleSelection==='attack'||visibleSelection==='technique'}
              <label for="battle-zone">Aim</label>
              <select id="battle-zone" bind:value={zone} disabled={pending}>
                <option value="torso">Torso · {snapshot.rules.accuracy.torso}% trial accuracy</option>
                <option value="limbs">Limbs · {snapshot.rules.accuracy.limbs}% trial accuracy</option>
                <option value="head">Head · {snapshot.rules.accuracy.head}% trial accuracy</option>
              </select>
              <p class="cost">{visibleSelection==='attack'
                ?`Costs ${snapshot.rules.strikeCost} Stamina. Repeated strikes cost more.`
                :`Costs 12 Stamina and ${snapshot.rules.techniqueMomentum} Momentum.`}</p>
            {:else if visibleSelection==='move'}
              <label for="battle-move">Position</label>
              <select id="battle-move" bind:value={destination} disabled={pending}>
                {#if snapshot.distance!=='contact'}<option value="close">Close distance</option>{/if}
                <option value="side">Move sideways</option>
                <option value="back">Fall back</option>
                <option value="cover">Move behind cover</option>
              </select>
              <p class="cost">Costs {snapshot.rules.moveCost} Stamina.</p>
            {:else if visibleSelection==='recover'}
              <label for="battle-recovery">Recover</label>
              <select id="battle-recovery" bind:value={reserve} disabled={pending}>
                <option value="breath">Stamina +{snapshot.rules.recoverStamina}</option>
                <option value="nerves">Composure +{snapshot.rules.recoverComposure}</option>
              </select>
            {:else}
              <p class="cost">Guard costs {snapshot.rules.guardCost} Stamina; a protected impact can create an opening.</p>
            {/if}
            <button class="commit" type="button" disabled={pending} onclick={commit}
              aria-label={`Confirm ${currentActionName} action`}>
              <img src={iconBase+'confirm-action.webp'} alt="" width="48" height="48" />
              <span>{pending?'Resolving exchange…':'Confirm action'}</span>
            </button>
          </div>
          {#if errorMessage}<p class="error" role="alert">{errorMessage}</p>{/if}
        </section>
      {/if}

      <section class="chronicle" aria-label="Battle Chronicle">
        <div class="section-title chronicle-heading">
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
        {#if !logOpen && snapshot.events.length>6}
          <p class="history-hint">Showing the latest 6 entries of {snapshot.events.length}.</p>
        {/if}
      </section>
    </div>

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
  .battle{min-width:0;background:#1d1a17;color:#ebd6b3;font-family:var(--pall-font-reading,Georgia,serif)}
  .alley{position:relative;min-height:clamp(270px,30vw,410px);overflow:hidden;background:#1b222b url('/locations/alley/alley-background.webp') center/cover no-repeat}
  .alley::after{content:'';position:absolute;inset:auto 0 0;height:65px;background:linear-gradient(transparent,#1d1a17a8);pointer-events:none}
  .flint{position:absolute;left:3%;bottom:0;width:34%;height:95%;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;z-index:1}
  .flint img{max-height:calc(100% - 24px);max-width:100%;object-fit:contain;object-position:center bottom;filter:drop-shadow(0 7px 10px #000b)}
  .flint span,.cart-marker{font:700 10px/1.3 Arial,sans-serif;letter-spacing:.07em;color:#392616;background:#ead6b4;border:1px solid #88633e;padding:4px 8px}
  .cart-marker{position:absolute;bottom:12%;left:61%;z-index:1}
  .parchment{position:relative;z-index:2;box-sizing:border-box;min-height:0;max-width:630px;width:49%;margin:15px 2% 15px auto;padding:11px 14px;background:#ead8b8;color:#2b1c11;border:solid transparent;border-width:20px 25px;border-image:url('/ui-kit/frames/dialogue-frame.png') 60 fill stretch;box-shadow:0 8px 23px #0008}
  .parchment p{margin:0 0 7px;line-height:1.4}.parchment h2{font:700 clamp(20px,2vw,26px) Georgia,serif;margin:0}
  .encounter-line{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:8px}
  .distance{font:700 11px/1.4 Arial,sans-serif;letter-spacing:.06em;color:#634529;text-transform:uppercase}
  .kicker,.telegraph-title{font:700 11px/1.4 Arial,sans-serif;letter-spacing:.075em}.kicker{color:#624428}
  .parchment .stance{font-style:italic;font-size:13px}.parchment .intent{font-size:clamp(14px,1.15vw,16px);line-height:1.48}
  .heavy{color:#8b2a1f;font-weight:700}.outcome{font-weight:700}.after{border-top:1px solid #bba37e;padding-top:9px;font-size:13px}
  .position{font-size:12px;color:#604531}
  .combat-console{display:grid;gap:10px;padding:10px;min-width:0}
  .duel-board{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;min-width:0}
  .fighter{min-width:0;background:#29231f;border:1px solid #66513d;padding:10px 13px}
  .fighter.opponent{border-color:#79533c}
  .fighter-top{display:flex;justify-content:space-between;align-items:baseline;gap:12px}
  .fighter h3{font:700 18px/1.25 Georgia,serif;margin:0;color:#f3dfb9}
  .hp-value{font:700 19px/1.25 Georgia,serif;font-variant-numeric:tabular-nums;color:#ecd1a1}
  .hp-value span{font-size:12px;font-weight:400;color:#b7a084}
  .hp-track{height:9px;overflow:hidden;margin:8px 0;background:#110f0e;border:1px solid #745638;border-radius:2px}
  .hp-fill{display:block;height:100%;background:linear-gradient(90deg,#b7955c,#dcc18f);transition:width .2s ease}
  .hp-fill.critical{background:#a34d39}
  .ceiling{font:12px/1.4 Arial,sans-serif;color:#c7ab89;margin:4px 0 0}
  .resources{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:5px 10px;margin:9px 0 0}
  .resources div{display:flex;align-items:center;justify-content:space-between;gap:5px;min-width:0;padding:4px 0;border-top:1px solid #483b2f}
  .resources dt{font:11px/1.3 Arial,sans-serif;color:#bda381}
  .resources dd{margin:0;font:700 13px/1.3 Georgia,serif;font-variant-numeric:tabular-nums;text-align:right;color:#efd7b0}
  .decision-row{display:grid;grid-template-columns:minmax(0,1.4fr) minmax(310px,.85fr);gap:10px;align-items:stretch;min-width:0}
  .decision-row.result-row{grid-template-columns:1fr}
  .tactics,.chronicle,.aftermath{min-width:0;background:#29231f;border:1px solid #68513c;padding:11px 13px}
  .section-title{display:flex;align-items:baseline;justify-content:space-between;gap:12px;margin-bottom:10px}
  .section-title h3,.aftermath h3{margin:0;font:700 18px/1.2 Georgia,serif;color:#efd7ad}
  .section-title>span{font:12px/1.4 Arial,sans-serif;color:#bca485}
  .choices{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:7px}
  .action-tile{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;min-width:0;min-height:106px;padding:6px 3px 7px;border:1px solid #77634f;background:#322920;color:#d5be9c;cursor:pointer;transition:background .15s,border-color .15s}
  .action-tile img{width:clamp(50px,4.5vw,68px);height:clamp(50px,4.5vw,68px);object-fit:contain;opacity:.95;pointer-events:none}
  .action-tile .action-name{font:600 11px/1.2 Arial,sans-serif;letter-spacing:.025em;text-align:center;opacity:.76;white-space:normal}
  .action-tile.chosen{background:#493723;border-color:#e3bc7b;box-shadow:inset 0 0 0 1px #e3bc7b}
  .action-tile.chosen .action-name{opacity:1;color:#f7e4c2}
  .action-tile:hover:not(:disabled){background:#453625;border-color:#d0a66c}
  .action-tile:disabled,.commit:disabled{opacity:.35;cursor:not-allowed}
  .action-details{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:5px 13px;align-items:center;margin-top:8px;padding:8px 10px;background:#211c18;border:1px solid #504132;min-height:66px}
  .chosen-heading{font:700 14px/1.2 Georgia,serif;color:#f0d6aa}
  .action-details label{font:12px/1.3 Arial,sans-serif;color:#cfb694}
  .action-details select{grid-column:1;width:100%;min-width:0;min-height:34px;padding:5px;background:#e4cda8;color:#302013;border:1px solid #95704e;font:13px Georgia,serif}
  .cost{grid-column:1;margin:0;font:12px/1.45 Georgia,serif;color:#d4ba96}
  .commit{grid-column:2;grid-row:1/span 3;display:flex;align-items:center;justify-content:center;gap:7px;min-width:146px;min-height:61px;padding:7px 11px;background:#d8bc8b;color:#2d1c10;border:1px solid #a98553;font:700 12px/1.25 Arial,sans-serif;cursor:pointer}
  .commit img{width:37px;height:37px;object-fit:contain;filter:brightness(.68) sepia(.14)}
  .commit:hover:not(:disabled){background:#efce95;border-color:#efce95}
  .commit span{max-width:95px;text-align:center}
  .error{margin:8px 1px 0;color:#ffb4a7;font:13px/1.4 Arial,sans-serif}
  .chronicle{display:flex;flex-direction:column}
  .chronicle-heading button{background:transparent;border:1px solid #7e664c;color:#dac29f;min-height:30px;padding:5px 9px;font:12px Arial,sans-serif;cursor:pointer}
  .chronicle-heading button:hover{border-color:#d4aa72}
  .log-window{min-height:155px;max-height:237px;overflow-y:auto;scrollbar-color:#927452 #302820;scrollbar-width:thin}
  .log-window ol{list-style:none;margin:0;padding:0}
  .log-window li{display:flex;gap:9px;padding:6px 2px;border-bottom:1px solid #4c3e32;font:12px/1.45 Georgia,serif;color:#cbb392}
  .log-window li.latest{color:#f2d8ae;background:#382c21;font-weight:700}
  .round{flex:none;font:700 10px/1.5 Arial,sans-serif;color:#bda27f}
  .no-events{font-size:13px;line-height:1.5}
  .history-hint{margin:auto 0 0;padding-top:8px;font:11px Arial,sans-serif;color:#ac9274}
  .aftermath p{margin:8px 0;line-height:1.55}
  .action-tile:focus-visible,.commit:focus-visible,.chronicle button:focus-visible,.action-details select:focus-visible{outline:2px solid #f2c987;outline-offset:2px}
  @media(max-width:1100px){
    .decision-row{grid-template-columns:minmax(0,1.2fr) minmax(280px,.8fr)}
    .resources{grid-template-columns:repeat(3,minmax(0,1fr))}
    .action-tile{min-height:91px}
  }
  @media(max-width:850px){
    .alley{min-height:0;display:flex;flex-direction:column}
    .flint{position:relative;height:280px;width:100%}
    .flint img{max-height:250px}
    .cart-marker{bottom:auto;top:210px;left:auto;right:12px}
    .parchment{width:100%;max-width:none;margin:0}
    .decision-row{grid-template-columns:1fr}
    .log-window{max-height:200px}
  }
  @media(max-width:520px){
    .combat-console{padding:7px;gap:7px}
    .duel-board{gap:7px}
    .fighter{padding:9px}
    .fighter h3{font-size:15px}.hp-value{font-size:15px}
    .resources{grid-template-columns:repeat(2,minmax(0,1fr))}
    .choices{grid-template-columns:repeat(3,minmax(0,1fr))}
    .action-tile{min-height:90px}
    .action-tile img{width:55px;height:55px}
    .action-details{grid-template-columns:minmax(0,1fr)}
    .commit{grid-column:1;grid-row:auto;min-height:51px;width:100%}
    .commit img{width:30px;height:30px}
    .commit span{max-width:none}
  }
  @media(prefers-reduced-motion:reduce){.hp-fill,.action-tile{transition:none}}
</style>