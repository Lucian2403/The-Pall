/**
 * The Pall: single-process, file-backed DEMO session store.
 * Atomic file replacement and in-process per-session serialization.
 * This is NOT multi-server database transaction isolation.
 */
import {mkdir, open, readFile, rename, unlink} from 'node:fs/promises';
import {join} from 'node:path';
import {randomBytes, randomUUID, createHash, timingSafeEqual} from 'node:crypto';
import {newEncounter,step,CombatError,TEST_CONFIG,testAttackCost} from './combat.mjs';

export class StoreError extends Error {
  constructor(message,status=400){super(message);this.status=status;}
}
const digest = x => createHash('sha256').update(x).digest('hex');
const validId = id => /^[\da-f]{8}-[\da-f]{4}-[1-8][\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/i.test(id);

// Never trust client-supplied speed, reach, tracking, damage or resource data.
// Action timing and combat numbers are exclusively resolved by combat.mjs.
function normalizeAction(a) {
  const fields={attack:['type','zone'],technique:['type','zone'],guard:['type'],move:['type','to'],recover:['type','mode'],use:['type','item'],withdraw:['type']};
  if(!a || typeof a!=='object'||Array.isArray(a) || !Object.hasOwn(fields,a.type))
    throw new StoreError('Unknown action type',422);
  const allowed=fields[a.type];
  if(Object.keys(a).some(k=>!allowed.includes(k)))
    throw new StoreError('Client cannot override action mechanics',422);
  const b={type:a.type};
  if(allowed.includes('zone')) b.zone=a.zone??'torso';
  if(allowed.includes('to'))b.to=a.to;
  if(allowed.includes('mode'))b.mode=a.mode;
  if(allowed.includes('item'))b.item=a.item;
  return b;
}
// Full result statistics are computed from factual persisted events, not log prose.
// This remains a single-process demo; counts are not authoritative MMO telemetry.
export function combatBreakdown(history, state) {
  const per={player:{dealt:0,taken:0,blocked:0,strikes:0,hits:0,misses:0,momentumSpent:0},enemy:{dealt:0,taken:0,blocked:0,strikes:0,hits:0,misses:0,momentumSpent:0}};
  let bleeding=0;
  for(const event of history){
    const who=event.actor;
    if(event.kind==='damage' && (who==='player'||who==='enemy')){
      const other=who==='player'?'enemy':'player';
      per[who].strikes++;per[who].hits++;
      per[who].dealt+=event.damage||0;
      per[other].taken+=event.damage||0;
      if(event.guarded)per[other].blocked+=Math.max(0,(event.raw||0)-(event.damage||0));
    }
    if(event.kind==='miss' && (who==='player'||who==='enemy')){per[who].strikes++;per[who].misses++;}
    if(event.kind==='technique' && (who==='player'||who==='enemy') && event.amount<0)per[who].momentumSpent-=event.amount;
    if(event.kind==='bleed' && (event.target==='player'||event.target==='enemy')){
      per[event.target].taken+=event.damage||0;
      if(event.target==='player')bleeding+=event.damage||0;
    }
  }
  return {rounds:state.round-1,player:per.player,enemy:per.enemy,playerBleedingDamage:bleeding};
}
const view = (state,history=[]) => {
  const takeActor = a=>({name:a.name,hp:a.hp,hpMax:a.hpMax,ceiling:a.ceiling,
    stamina:a.stamina,composure:a.composure,fatigue:a.fatigue,stress:a.stress,
    momentum:a.momentum,bleed:a.bleed,wounds:a.wounds,bandages:a.bandages});
  const allowed=[];
  if(state.status==='active'){
    if(state.distance==='contact')allowed.push('attack');
    allowed.push('guard','move','recover','withdraw');
    if(state.player.bandages>0 && state.player.bleed>0) allowed.push('use');
    if(state.distance==='contact' && state.player.momentum>=20) allowed.push('technique');
  }
  const actualWeapon=state.player.weapon;
  const baseDamage=actualWeapon.damage;
  const edge=state.openings?.player?.expires>=state.round?state.openings.player:null;
  const from=Math.max(1,actualWeapon.minDamage??Math.floor(baseDamage*.72));
  const to=Math.max(from,actualWeapon.maxDamage??Math.ceil(baseDamage*1.3));
  const hitProbability=zone=>Math.round(100*Math.min(.95,Math.max(.05,actualWeapon.accuracy+TEST_CONFIG.aim[zone]+(edge?(edge.accuracyBonus??.20):0))));
  const repeated=(state.lastPlayerActions??[]).slice(-2).length===2&&(state.lastPlayerActions??[]).slice(-2).every(a=>a==='attack');
  const guardReduction={min:Math.round(TEST_CONFIG.guardReduction.min*100),
    max:Math.round(TEST_CONFIG.guardReduction.max*100)};
  const rules={
    attack:{cost:testAttackCost(state,'player'),minDamage:from+(edge?(edge.damageBonus??5):0),maxDamage:to+(edge?(edge.damageBonus??5):0),accuracy:{torso:hitProbability('torso'),limbs:hitProbability('limbs'),head:hitProbability('head')},momentumGain:TEST_CONFIG.strikeMomentum,repeatedStrikeSurcharge:TEST_CONFIG.repeatedStrikeSurcharge,repeatActive:repeated},
    guard:{cost:TEST_CONFIG.guardCost,mitigationPercent:guardReduction,momentumGain:TEST_CONFIG.guardMomentum},
    move:{cost:TEST_CONFIG.moveCost,momentumGain:TEST_CONFIG.moveMomentum},
    technique:{staminaCost:15,momentumCost:20,damageBonus:4},
    recover:{stamina:TEST_CONFIG.recoverGain,composure:TEST_CONFIG.mentalRecoverGain},
    use:{cost:TEST_CONFIG.useCost},
    stanceOpen:state.openings?.enemy?.expires>=state.round && state.openings.enemy.reason==='your repeated attacks leave your stance open',
    prototype:true,
  };
  return {id:state.id,scene:state.scene,round:state.round,revision:state.revision,
    rules,status:state.status,outcome:state.outcome,approach:state.approach,enemyIntent:state.intent?.tell??null,
    intentType:state.intent?.signal??null,distance:state.distance,
    positionHint:state.scene==='boar'? (state.pathOpen?'An actual path to firm ground is open.':state.terrain?.playerSpot==='lane'?'You still occupy the narrow charge lane.':state.terrain?.playerSpot==='shoulder'?'You are out of the charge lane, but the exit remains crowded.':state.terrain?.playerSpot==='fence'?'The fence gives cover; the boar cannot yet get clear.':'The animal still faces an obstructed way.') :null,
    pathOpen:state.pathOpen,side:state.side,player:takeActor(state.player),
    enemy:takeActor(state.enemy),legalActions:allowed,events:history.slice(-100),
    breakdown:state.status==='finished'?combatBreakdown(history,state):null};
};
export function createStore(dir,{seedGenerator=()=>randomBytes(4).readUInt32BE(0)}={}) {
  const locks = new Map();
  const fpath = id=>join(dir,`${id}.json`);
  async function atomicWrite(id,doc){
    await mkdir(dir,{recursive:true});
    const tmp=join(dir,`.${id}.${randomUUID()}.tmp`);
    const h=await open(tmp,'wx',0o600);
    try {await h.writeFile(JSON.stringify(doc));await h.sync();}
    finally {await h.close();}
    try {await rename(tmp,fpath(id));}
    catch(e){await unlink(tmp).catch(()=>{});throw e;}
  }
  async function fetch(id){
    if(!validId(id))throw new StoreError('Invalid encounter identifier',400);
    try{return JSON.parse(await readFile(fpath(id),'utf8'));}
    catch(e){if(e.code==='ENOENT')throw new StoreError('Encounter not found',404);throw e;}
  }
  function authorize(doc,token){
    if(typeof token!=='string'||token.length!==64||! /^[\da-f]{64}$/i.test(token))throw new StoreError('Session token required',401);
    const wanted=Buffer.from(doc.tokenHash,'hex'),got=Buffer.from(digest(token),'hex');
    if(!timingSafeEqual(wanted,got))throw new StoreError('Invalid session token',401);
  }
  async function locked(id,callback){
    const previous=locks.get(id)||Promise.resolve();
    let release;const current=new Promise(resolve=>release=resolve);
    locks.set(id,current);
    await previous;
    try{return await callback();}
    finally {release();if(locks.get(id)===current)locks.delete(id);}
  }
  async function create(scene,approach='hold'){
    if(!['flint','boar','silas'].includes(scene))throw new StoreError('Unknown encounter',422);
    if(scene==='boar'&&!['hold','fence','embankment'].includes(approach))throw new StoreError('Unknown boar approach',422);
    const id=randomUUID(),token=randomBytes(32).toString('hex');
    const state=newEncounter(scene,{id,seed:seedGenerator(),approach});
    const doc={id,tokenHash:digest(token),state,history:[],receipts:{},createdAt:new Date().toISOString()};
    await atomicWrite(id,doc);
    return {token,encounter:view(state)};
  }
  async function get(id,token){
    const doc=await fetch(id);authorize(doc,token);
    return view(doc.state,doc.history);
  }
  async function act(id,token,{requestId,expectedRevision,action}){
    if(typeof requestId!=='string'||! /^[a-zA-Z0-9_-]{1,100}$/.test(requestId))throw new StoreError('Invalid action request identifier',422);
    if(!Number.isSafeInteger(expectedRevision)||expectedRevision<0)throw new StoreError('Invalid revision',422);
    action=normalizeAction(action);
    return locked(id,async()=>{
      const doc=await fetch(id);authorize(doc,token);
      const payloadHash=digest(JSON.stringify({expectedRevision,action}));
      if(Object.hasOwn(doc.receipts,requestId)){
        const receipt=doc.receipts[requestId];
        if(receipt.payloadHash!==payloadHash)throw new StoreError('Request ID was already used for a different action',409);
        return receipt.response;
      }
      if(doc.state.revision!==expectedRevision)throw new StoreError('Stale combat state — refresh before acting',409);
      let next;
      try{next=step(doc.state,action,{requestId,expectedRevision});}
      catch(e){if(e instanceof CombatError)throw new StoreError(e.message,422);throw e;}
      doc.state=next;
      doc.history.push(...next.events);
      const response=view(doc.state,doc.history);
      doc.receipts[requestId]={payloadHash,response};
      await atomicWrite(id,doc);
      return response;
    });
  }
  return {create,get,act};
}
