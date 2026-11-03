/** The Pall local combat UI v0.5 — browser sends choices, server owns the outcomes. */
const $=id=>document.getElementById(id);
const scenes={
  flint:{title:'Flint at the service passage',description:'The payman has a club; the narrow passage has a cart. He means to turn you back.',origin:'Millhand'},
  boar:{title:'The broken fence',description:'A wounded young boar has nowhere to go but past you. The ground is narrow.',origin:'Squatter'},
  silas:{title:'The sealed coal box',description:'Silas Pumpard holds his work hook close. He will not abandon the lock easily.',origin:'Inkbound'},
};
const STORAGE='the-pall-local-combat-session-v5',PENDING='the-pall-local-pending-action-v5';
let active=null,token=null,busy=false,selected='attack';
const options={attack:['torso','limbs','head'],technique:['torso','limbs','head'],move:['side','cover','back','close'],recover:['breath','nerves']};
const optLabels={torso:'Torso',limbs:'Limbs',head:'Head',side:'Sidestep',cover:'Take cover',back:'Back away',close:'Close in',breath:'Catch breath',nerves:'Steady nerves'};
// Numeric tooltips are based on the server-returned rules, never client combat authority.
const names={attack:'Basic Strike',guard:'Guard',move:'Move',technique:'Press Advantage',recover:'Recover',withdraw:'Withdraw',use:'Dressing'};
const descriptions={
  attack:'A committed unarmed blow; legal at Contact range. Damage is rolled within the shown range and then reduced by actual Guard. Successful ordinary hits earn Momentum. Three or more consecutive strikes cost extra Stamina; two in a row also leave your stance open to an opponent who presses in. Guard or Move breaks the sequence.',
  guard:'Consumes one turn. Against a real hit, reduces the incoming rolled impact by the indicated percentage and earns Momentum only for genuine mitigation. A useful Guard creates a short attacking opportunity; against missed attacks, Guard generates no Momentum.',
  move:'Costs one action. Choose the destination. A sufficiently early move can spoil a committed non-tracking attack and earn Momentum; merely changing position does not. The injured boar also needs its physical route onto firm ground cleared.',
  technique:'Press Advantage: a separate one-action offensive maneuver. Costs both earned Momentum and Stamina; its additional raw impact is shown. A technique can miss, earns no basic-strike Momentum, and uses the selected aim zone.',
  recover:'Use your entire action to restore one resource. Breath and nerves never restore Health or erase an existing wound, Fatigue or Stress. You remain exposed while recovering.',
  withdraw:'An actual escape attempt. At Far distance the local prototype permits disengagement; at closer range the threat can still bar the way. Escaping is not automatically a win.',
  use:'Consumes an actually carried bandage and a combat action. Controls active bleeding, not the underlying injury or lost Health.',
};
const PRESENTATION_MS=1250;
const readJSON=key=>{try{return JSON.parse(localStorage.getItem(key))}catch{return null}};
async function request(path,{method='GET',payload,auth}={}){
  const headers={'Accept':'application/json'};if(payload!==undefined)headers['Content-Type']='application/json';if(auth)headers['X-Session-Token']=auth;
  let resp;try{resp=await fetch(path,{method,headers,body:payload===undefined?undefined:JSON.stringify(payload),cache:'no-store'})}catch{throw Error('Connection interrupted. Your previous action can be retried safely.')}
  const data=await resp.json().catch(()=>({error:'Server returned unreadable data'}));
  if(!resp.ok){const err=Error(data.error||`Request failed (${resp.status})`);err.status=resp.status;throw err;}return data;
}
function message(text,bad=false){$('message').textContent=text;$('message').classList.toggle('error',bad)}
function setBusy(flag){busy=flag;document.querySelectorAll('[data-choice],[data-scene],#fresh,#commit').forEach(b=>b.disabled=flag);if(!flag&&active)updateActions();}
function make(tag,className,text){const x=document.createElement(tag);if(className)x.className=className;if(text!==undefined)x.textContent=text;return x;}
function statBox(target,actor){
  const h=$(target);h.replaceChildren();const stats=[['Health',actor.hp,Math.max(1,actor.ceiling),'hp',`${actor.hp} / ${actor.ceiling}`],['Stamina',actor.stamina,100,'stamina',`${actor.stamina}`],['Composure',actor.composure,100,'composure',`${actor.composure}`],['Momentum',actor.momentum,100,'momentum',`${actor.momentum}`]];
  for(const [name,num,max,tone,label] of stats){const row=make('div','stat-row'),track=make('div','stat-track'),fill=make('div',`stat-fill ${tone}`);fill.style.width=`${Math.min(100,Math.max(0,num/max*100))}%`;track.append(fill);row.append(make('span','stat-label',name),track,make('strong','stat-num',label));h.append(row);}
  const conditions=make('div','conditions');const all=[];
  if(actor.fatigue>0)all.push(`Fatigue ${actor.fatigue}`);if(actor.stress>0)all.push(`Stress ${actor.stress}`);if(actor.bleed>0)all.push(`Bleeding · ${actor.bleed}`);
  if(actor.ceiling<actor.hpMax)all.push(`Health ceiling ${actor.ceiling}`);if(actor.wounds.length)all.push(`${actor.wounds.length} wound${actor.wounds.length>1?'s':''}`);if(actor.bandages>0)all.push(`${actor.bandages} bandage${actor.bandages>1?'s':''}`);
  if(!all.length)return;for(const label of all)conditions.append(make('span',`condition ${label.startsWith('Bleeding')?'bleed':''}`,label));h.append(conditions);
}
function renderLog(events){
  const out=$('log');out.replaceChildren();out.classList.toggle('mechanical-on',$('show-mechanics').checked);
  if(!events.length){out.append(make('p','log-empty','No exchanges yet.'));return;}
  const groups=new Map();for(const event of events){if(!groups.has(event.round))groups.set(event.round,[]);groups.get(event.round).push(event);}
  for(const round of [...groups.keys()].reverse()){
    const block=make('section','round-block');block.append(make('div','round-index',`ROUND ${String(round).padStart(2,'0')}`));
    for(const event of groups.get(round)){
      const row=make('div',`event-item ${event.kind??'narrative'}`),pip=make('span','event-pip'),body=make('div','event-body');body.append(make('p','event-text',event.text));
      if(event.kind==='damage')body.append(make('div','event-metrics',`Resolved impact ${event.raw??'?'}  ·  Health lost ${event.damage}  ·  ${event.zone}${event.guarded?'  ·  Guard reduced damage':''}`));
      row.append(pip,body);block.append(row);
    }
    out.append(block);
  }
}
function getOption(){return document.querySelector('input[name="action-option"]:checked')?.value ?? options[selected]?.[0];}
function updateAbilityInfo(){
  const rules=active?.rules??{},a=rules.attack??{},g=rules.guard??{},m=rules.move??{};
  const option=getOption();const chance=a.accuracy?.[option]??a.accuracy?.torso??70;
  let stat='Prototype values';let cost='—';let details=descriptions[selected]??'';
  if(selected==='attack'){
    stat=`${chance}% ${option} · ${a.minDamage??4}–${a.maxDamage??8} damage`;
    cost=`−${a.cost??11} Stamina`;
    details+=` Current ${option} contact chance: ${chance}%. Impact before Guard: ${a.minDamage??4}–${a.maxDamage??8}. Basic strike Momentum on meaningful hit: +${a.momentumGain??10}. After two consecutive Strikes, the next one costs +${a.repeatedStrikeSurcharge??3} Stamina. All trial values.`;
  } else if(selected==='guard'){
    stat=`${g.mitigationPercent??50}% mitigation · +${g.momentumGain??8} Momentum on useful Guard`;
    cost=`−${g.cost??5} Stamina`;
  } else if(selected==='move'){
    stat=`${option==='back'?'Back away':option==='side'?'Sidestep':option==='cover'?'Take cover':'Close in'} · +${m.momentumGain??5} on avoided attack`;
    cost=`−${m.cost??6} Stamina`;
  } else if(selected==='technique'){
    stat=`${chance}% ${option} base · +${rules.technique?.damageBonus??4} raw impact`;
    cost=`−${rules.technique?.momentumCost??20} Momentum · −${rules.technique?.staminaCost??12} Stamina`;
    details+=` Base contact chance and impact shown for selected aim; techniques may modify them. No automatic success.`;
  } else if(selected==='recover'){
    const nerves=option==='nerves';const v=nerves?rules.recover?.composure??12:rules.recover?.stamina??16;
    stat=nerves?`+${v} Composure · one action`:`+${v} Stamina · one action`;
    cost=nerves?`+${v} Composure`:`+${v} Stamina`;
  } else if(selected==='withdraw') {stat='Far range to escape · 1 action';cost='1 full action';}
  else if(selected==='use'){stat='Control bleeding · 1 real bandage';cost=`−1 bandage · −${rules.use?.cost??2} Stamina`;}
  $('cost-display').textContent=cost;
  $('ability-title').textContent=names[selected]??'Action';
  $('ability-numbers').textContent=stat;
  $('action-description').textContent=details;
}
function showImpactPending(action){
  const cues={attack:'You commit to the strike…',guard:'You set your guard…',move:'You change position…',technique:'You press your advantage…',recover:'You gather yourself…',withdraw:'You look for an escape…',use:'You bind the wound…'};
  $('impact-text').textContent=cues[action.type]??'Resolving the exchange…';
  $('impact-stage').classList.remove('hidden');
}
function hideImpactPending(){ $('impact-stage').classList.add('hidden'); }
function wait(ms){return new Promise(resolve=>setTimeout(resolve,ms));}
function selectedAction(){const type=selected;
  if(type==='attack'||type==='technique')return {type,zone:getOption()};
  if(type==='move')return {type,to:getOption()};
  if(type==='recover')return {type,mode:getOption()};
  if(type==='use')return {type,item:'bandage'};
  return {type};
}
function updateActions(){
  const legal=active?.legalActions??[];
  if(active?.status==='active'&&!legal.includes(selected))selected=legal[0]??'guard';
  for(const button of document.querySelectorAll('[data-choice]')){const permitted=legal.includes(button.dataset.choice);button.disabled=busy||!permitted;button.classList.toggle('hidden',button.dataset.choice==='use'&&!permitted);button.classList.toggle('selected',button.dataset.choice===selected&&permitted);button.setAttribute('aria-pressed',String(button.dataset.choice===selected&&permitted));}
  const labels={attack:'Commit strike',guard:'Take guard',move:'Make your move',technique:'Use technique',recover:'Recover',withdraw:'Attempt withdrawal',use:'Apply dressing'};
  $('commit').disabled=busy||active?.status!=='active'||!legal.includes(selected);
  $('commit').replaceChildren(document.createTextNode(labels[selected]??'Commit action'),make('span','', '→'));
  $('action-phase').textContent=busy?'Resolving':active?.status==='finished'?'Finished':'';
  const setting=$('action-settings');setting.replaceChildren();
  if(options[selected]){
    const destinations=selected==='move'&&active?.distance==='contact'?options.move.filter(x=>x!=='close'):options[selected];
    const row=make('div','choice-pills');destinations.forEach((option,index)=>{
      const label=make('label'),input=make('input');input.type='radio';input.name='action-option';input.value=option;input.checked=index===0;const percent=active?.rules?.attack?.accuracy?.[option];label.append(input,make('span','',selected==='attack'||selected==='technique'?`${optLabels[option]} · ${percent??({torso:70,limbs:58,head:45})[option]}%`:optLabels[option]));row.append(label);
    });setting.append(row);
  }
  document.querySelector('.detail-kicker').textContent=({attack:'AIM AT',technique:'AIM TECHNIQUE AT',move:'CHOOSE DESTINATION',recover:'CHOOSE ONE RESERVE'})[selected]??'TACTICAL EFFECT';
  updateAbilityInfo();
}
function render(state){
  active=state;$('selection').classList.add('hidden');$('arena').classList.remove('hidden');const scene=scenes[state.scene];
  $('scenario-title').textContent=scene.title;$('scene-description').textContent=scene.description+(state.scene==='boar'?` Prior position: ${({'hold':'narrow centre','fence':'behind broken fence','embankment':'firm stone embankment'})[state.approach]??'unknown'}.`:'');
  document.querySelector('.combatant-player .fighter-heading h2').textContent=scene.origin;
  $('round-label').textContent=state.status==='finished'?'COMBAT RESOLVED':`ROUND ${String(state.round).padStart(2,'0')} · CHOOSE A RESPONSE`;
  $('scene-distance').textContent=state.distance.toUpperCase();$('enemy-name').textContent=state.enemy.name;
  $('terrain-status').textContent=state.positionHint??''; $('terrain-status').classList.toggle('hidden',!(state.scene==='boar'&&state.positionHint));
  statBox('player-stats',state.player);statBox('enemy-stats',state.enemy);
  $('stance-warning').classList.toggle('hidden',!state.rules?.stanceOpen);
  $('intent-text').textContent=state.enemyIntent??'The immediate danger has passed.';
  $('intent-type').textContent=(state.intentType??'ended').toUpperCase();
  $('intent-panel').classList.toggle('special-threat',state.intentType==='heavy threat');
  renderLog(state.events);
  const details={player_victory:['Victory','The threat has ended. No loot or coins are awarded in this prototype; clinic and story progression are not connected.'],player_defeat:['Defeat','Your character is downed. The approved story aftermath is not simulated in this local test.'],player_escaped:['You escaped','Getting away does not necessarily accomplish the original objective.']};
  const box=$('result-box');box.replaceChildren();box.classList.toggle('hidden',state.status!=='finished');
  if(state.status==='finished'){
    const info=details[state.outcome]??['Encounter ended',''];
    const head=make('div','result-head');head.append(make('strong','',info[0]),make('small','',info[1]));box.append(head);
    if(state.breakdown){
      const b=state.breakdown;
      const grid=make('div','breakdown-grid');
      const values=[['Rounds',b.rounds],['You dealt',`${b.player.dealt} HP`],['You received',`${b.player.taken} HP`],['Guard saved',`${b.player.blocked} HP`],['Blood loss',`${b.playerBleedingDamage} HP`],['Your hits',`${b.player.hits}/${b.player.strikes}`],['Enemy hits',`${b.enemy.hits}/${b.enemy.strikes}`],['Enemy Momentum spent',b.enemy.momentumSpent]];
      for(const [title,value] of values){const item=make('div','breakdown-item');item.append(make('span','',title),make('b','',String(value)));grid.append(item);}
      box.append(make('div','breakdown-title','Fight breakdown'),grid);
    }
  }
  updateActions();
}
async function start(scene){if(busy)return;setBusy(true);message('');try{const value=await request('/api/encounters',{method:'POST',payload:{scene,...(scene==='boar'?{approach:$('boar-approach').value}:{})}});token=value.token;localStorage.setItem(STORAGE,JSON.stringify({id:value.encounter.id,token}));localStorage.removeItem(PENDING);selected='attack';render(value.encounter);}catch(e){message(e.message,true);window.alert(e.message);}finally{setBusy(false)}}
async function sendAction(pending){
  if(busy)return;
  setBusy(true);message('');showImpactPending(pending.payload.action);
  try{
    const began=performance.now();
    // Server resolution and receipt persistence occur immediately. Only visual reveal is delayed.
    const state=await request(`/api/encounters/${encodeURIComponent(pending.id)}/actions`,{method:'POST',auth:token,payload:pending.payload});
    const prefersReduced=window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches??false;
    const minWait=prefersReduced?0:PRESENTATION_MS;
    if(minWait>0)await wait(Math.max(0,minWait-(performance.now()-began)));
    localStorage.removeItem(PENDING);
    render(state);
    $('arena').classList.add('impact-reveal');
    setTimeout(()=>$('arena').classList.remove('impact-reveal'),310);
    message('');
  } catch(e){
    if(e.status===409){localStorage.removeItem(PENDING);message('Another tab has changed this turn. Loading the saved state.',true);await refresh().catch(()=>{});}
    else if(e.status===422){localStorage.removeItem(PENDING);message(e.message,true);}
    else{message(`${e.message} Your original request can be retried.`,true);const b=make('button','', 'Retry same action');b.type='button';b.onclick=()=>sendAction(pending);$('message').append(b);}
  } finally {hideImpactPending();setBusy(false);}
}
async function refresh(){const session=readJSON(STORAGE);if(!session?.id||!session?.token)return;token=session.token;const state=await request(`/api/encounters/${encodeURIComponent(session.id)}`,{auth:token});render(state)}
async function restore(){const session=readJSON(STORAGE);if(!session)return;try{await refresh();const pending=readJSON(PENDING);if(pending&&pending.id===session.id){message('Replaying the original pending request after interruption…');await sendAction(pending)}}catch(e){localStorage.removeItem(STORAGE);localStorage.removeItem(PENDING);$('selection').classList.remove('hidden');$('arena').classList.add('hidden');message(e.message,true)}}
document.querySelectorAll('[data-scene]').forEach(b=>b.addEventListener('click',()=>start(b.dataset.scene)));
document.querySelectorAll('[data-choice]').forEach(b=>b.addEventListener('click',()=>{if(busy||!active?.legalActions.includes(b.dataset.choice))return;selected=b.dataset.choice;updateActions()}));
$('commit').addEventListener('click',()=>{if(busy||!active||active.status!=='active'||!active.legalActions.includes(selected))return;const pending={id:active.id,payload:{requestId:crypto.randomUUID(),expectedRevision:active.revision,action:selectedAction()}};localStorage.setItem(PENDING,JSON.stringify(pending));void sendAction(pending)});
$('show-mechanics').addEventListener('change',()=>renderLog(active?.events??[]));
$('action-settings').addEventListener('change',updateAbilityInfo);
$('chronicle-toggle').addEventListener('click',()=>{const expanded=$('log').classList.toggle('expanded');$('chronicle-toggle').textContent=expanded?'Collapse':'Expand';$('chronicle-toggle').setAttribute('aria-expanded',String(expanded));});
$('fresh').addEventListener('click',()=>{if(busy)return;if(active?.status==='active'&&!confirm('Leave this encounter? Its saved state will remain on the local server.'))return;active=null;token=null;localStorage.removeItem(STORAGE);localStorage.removeItem(PENDING);$('arena').classList.add('hidden');$('selection').classList.remove('hidden');message('')});
void restore();
