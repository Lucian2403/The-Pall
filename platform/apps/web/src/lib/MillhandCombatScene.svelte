<script lang="ts">
  import type {CombatAction} from '@the-pall/game-core/combat-v0.5.1';

  type Actor={name:string;hp:number;hpMax:number;ceiling:number;stamina:number;
    composure:number;fatigue:number;stress:number;momentum:number;bleed:number;
    wounds:Array<{type:string;zone?:string;severity:string}>};
  type Event={round:number;text:string;kind:string};
  type CombatSnapshot={status:'active'|'finished';outcome:string|null;stance:'brace'|'moving'|'cart';
    round:number;revision:number;distance:string;enemyIntent:string|null;intentType:string|null;
    player:Actor;enemy:Actor;legalActions:string[];events:Event[];
    rules:{strikeCost:number;guardCost:number;moveCost:number;recoverStamina:number;
      recoverComposure:number;techniqueMomentum:number;repeatedStrikeSurcharge:number;
      accuracy:{head:number;torso:number;limbs:number};guardMitigationPercent:number;prototype:boolean}};
  let {snapshot,pending,errorMessage,perform}: {
    snapshot:CombatSnapshot;pending:boolean;errorMessage:string;
    perform:(action:CombatAction)=>Promise<void>
  }=$props();
  const ended=$derived(snapshot.status==='finished');
  const canAttack=$derived(snapshot.legalActions.includes('attack'));
  const canTechnique=$derived(snapshot.legalActions.includes('technique'));
  const canMove=$derived(snapshot.legalActions.includes('move'));
  const canRecover=$derived(snapshot.legalActions.includes('recover'));
  let selected=$state<'attack'|'guard'|'move'|'recover'|'technique'>('guard');
  let zone=$state<'head'|'torso'|'limbs'>('torso');
  let destination=$state<'side'|'close'|'cover'|'back'>('side');
  let reserve=$state<'breath'|'nerves'>('breath');
  let logOpen=$state(true);
  const visibleSelection=$derived(snapshot.legalActions.includes(selected)?selected:
    (canAttack?'attack':'guard'));
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
  const journal=$derived(snapshot.outcome==='player_defeat'
    ?"Flint beat me. Damn it. I thought I could get past him, but I couldn't. Other workers came when they heard the fight, and he left without taking my money. One of them helped me get to medical care. Still not a coin from the council for those plates. A fine day I've had."
    :"I beat Flint and got past him. That club could've done some damage, but I managed to keep him off me. He didn't get a coin out of me. The council still owes us for the plates, of course.");
  function commit(){
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
      <img src="/characters/flint/flint-standing.webp" alt="Flint stands in the service passage, holding his club" />
      <span>FLINT · CONTRACTOR'S COLLECTOR</span>
    </div>
    <div class="cart-marker">WORK CART</div>
    <aside class="parchment" aria-label="Combat situation">
      <p class="kicker">THE PASSAGE · STAGE 6</p>
      <h2>{ended?'The fight ends':`Round ${String(snapshot.round).padStart(2,'0')}`}</h2>
      {#if snapshot.round===1 && !ended}<p class="stance">{stanceText}</p>{/if}
      {#if ended}
        <p class="outcome">{snapshot.outcome==='player_defeat'?'Flint defeated you. Other workers intervened.':'You defeated Flint.'}</p>
        <p>{resultText}</p>
        <p class="after">Your condition is saved. The next stage is an examination at the clinic; Stage 7 is not yet connected.</p>
      {:else}
        <p class="telegraph-title">Flint's observable intention</p>
        <p class:heavy={snapshot.intentType==='heavy threat'} class="intent">{snapshot.enemyIntent}</p>
        <p class="position">Distance: {snapshot.distance}. Current position: {snapshot.stance==='cart'?'work cart':snapshot.stance==='moving'?'moving along passage':'braced'}.</p>
      {/if}
    </aside>
  </div>

  <div class="combat-ui">
    <section class="vitals" aria-label="Combatant condition">
      {#each [{id:'you',value:snapshot.player,title:'You'},{id:'flint',value:snapshot.enemy,title:'Flint'}] as fighter (fighter.id)}
        <div class="fighter">
          <h3>{fighter.title}</h3>
          <dl>
            <div><dt>Health</dt><dd>{fighter.value.hp} / {fighter.value.hpMax}{fighter.value.ceiling<fighter.value.hpMax?' (ceiling '+fighter.value.ceiling+')':''}</dd></div>
            <div><dt>Stamina</dt><dd>{fighter.value.stamina}</dd></div>
            <div><dt>Fatigue</dt><dd>{fighter.value.fatigue}</dd></div>
            <div><dt>Momentum</dt><dd>{fighter.value.momentum}</dd></div>
            <div><dt>Composure</dt><dd>{fighter.value.composure}</dd></div>
            <div><dt>Wounds</dt><dd>{fighter.value.wounds.length}{fighter.value.bleed?` · bleeding ${fighter.value.bleed}`:''}</dd></div>
          </dl>
        </div>
      {/each}
    </section>
    {#if !ended}
      <section class="tactics" aria-label="Choose a combat action">
        <h3>Choose one action</h3>
        <div class="choices">
          {#each [
            {id:'attack',label:'Strike',enabled:canAttack},
            {id:'guard',label:'Guard',enabled:true},
            {id:'move',label:'Reposition',enabled:canMove},
            {id:'recover',label:'Recover',enabled:canRecover},
            {id:'technique',label:'Press Advantage',enabled:canTechnique}
          ] as choice (choice.id)}
            <button type="button" disabled={pending||!choice.enabled} class:chosen={visibleSelection===choice.id}
              onclick={()=>selected=choice.id as typeof selected}>{choice.label}</button>
          {/each}
        </div>
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
            <option value="side">Move sideways</option><option value="back">Fall back</option>
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
        <button class="commit" type="button" disabled={pending} onclick={commit}>
          {pending?'Resolving the exchange…':'Commit action'}
        </button>
        {#if errorMessage}<p class="error" role="alert">{errorMessage}</p>{/if}
      </section>
    {/if}
    <section class="chronicle" aria-label="Battle Chronicle">
      <div class="chronicle-heading"><h3>Battle Chronicle</h3><button type="button" onclick={()=>logOpen=!logOpen} aria-expanded={logOpen}>{logOpen?'Collapse':'Expand'}</button></div>
      {#if logOpen}
        {#if snapshot.events.length===0}<p>Flint approaches. The first turn has not been committed.</p>
        {:else}
          <ol>{#each snapshot.events as event,i (i)}
            <li><span class="round">{event.round}</span> {event.text}</li>
          {/each}</ol>
        {/if}
      {/if}
    </section>
    {#if ended}
      <section class="aftermath" aria-label="Personal journal after the fight">
        <h3>Personal Journal</h3><p>{journal}</p>
      </section>
    {/if}
  </div>
</section>

<style>
  .battle{min-width:0;background:#191715;color:#edd9b6;font-family:var(--pall-font-reading,Georgia,serif)}
  .alley{position:relative;min-height:clamp(420px,47vw,640px);overflow:hidden;background:#1b222b url('/locations/alley/alley-background.webp') center/cover no-repeat}
  .flint{position:absolute;left:2%;bottom:0;width:39%;height:91%;display:flex;flex-direction:column;align-items:center;justify-content:flex-end}
  .flint img{max-height:calc(100% - 42px);max-width:100%;object-fit:contain;object-position:center bottom;filter:drop-shadow(0 8px 12px #0009)}
  .flint span,.cart-marker{font:700 12px/1.4 Arial,sans-serif;letter-spacing:.08em;color:#372517;background:#ead6b4;border:2px solid #88633e;padding:4px 10px}
  .cart-marker{position:absolute;bottom:9%;left:62%}
  .parchment{position:relative;box-sizing:border-box;min-height:220px;max-width:630px;width:47%;margin:26px 2% 20px auto;padding:22px;background:#ead8b8;color:#2b1c11;border:solid transparent;border-width:20px 25px;border-image:url('/ui-kit/frames/dialogue-frame.png') 60 fill stretch;box-shadow:0 8px 23px #0008}
  .parchment h2{font:700 24px Georgia,serif;margin:0 0 10px}.parchment p{margin:0 0 13px;line-height:1.5}
  .kicker,.telegraph-title{font:700 12px Arial,sans-serif;letter-spacing:.08em}.heavy{color:#8b2a1f;font-weight:700}.outcome{font-weight:700}.after{border-top:1px solid #bba37e;padding-top:12px}
  .combat-ui{display:grid;grid-template-columns:minmax(220px,0.9fr) minmax(340px,1.1fr);gap:12px;padding:15px;align-items:start}
  .vitals{display:grid;grid-template-columns:1fr 1fr;gap:11px;grid-column:1/-1}
  .fighter,.tactics,.chronicle,.aftermath{border:1px solid #786047;background:#2a241e;padding:15px;min-width:0}
  h3{font:700 18px Georgia,serif;margin:0 0 12px}.fighter dl{margin:0}.fighter dl div{display:flex;justify-content:space-between;gap:10px;border-bottom:1px solid #594838;padding:7px 0}
  dt{color:#c2aa88}dd{margin:0;font-variant-numeric:tabular-nums;text-align:right}
  .choices{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px;margin-bottom:15px}
  button,select{font:15px Georgia,serif}.choices button,.commit,.chronicle button{background:#e4cba3;color:#24190e;border:1px solid #947047;min-height:42px;padding:7px 10px;cursor:pointer}
  .choices .chosen{background:#9c7650;color:#fff6dd}.choices button:disabled,.commit:disabled{opacity:.45;cursor:not-allowed}
  .tactics label{display:block;margin:0 0 6px}.tactics select{width:100%;padding:9px;background:#eed7b6;color:#261a12;border:1px solid #95704e}
  .cost{font-size:13px;color:#dac4a4}.commit{margin-top:9px;width:100%;font-weight:700}.error{color:#ffb9a7}
  .chronicle-heading{display:flex;align-items:center;justify-content:space-between;gap:10px}.chronicle-heading h3{margin:0}
  .chronicle ol{max-height:300px;overflow-y:auto;list-style:none;padding:0;margin:12px 0 0}
  .chronicle li{padding:7px 2px;border-bottom:1px solid #5a493a;font:14px/1.4 Georgia,serif}.round{color:#b9a184;font:700 11px Arial,sans-serif;padding-right:7px}
  .aftermath{grid-column:1/-1}.aftermath p{line-height:1.55}.position{font-size:13px;color:#604531}
  @media(max-width:810px){.alley{min-height:0;display:flex;flex-direction:column}.flint{position:relative;height:300px;width:100%}.flint img{height:260px}.cart-marker{bottom:auto;top:230px;left:auto;right:12px}.parchment{width:100%;max-width:none;margin:0;min-height:0}.combat-ui{grid-template-columns:1fr}.vitals{grid-column:auto;grid-template-columns:1fr}}
</style>
