import {strict as assert} from 'node:assert';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import vm from 'node:vm';
import ts from 'typescript';

// Execute the real pall-audio.ts runtime with deterministic browser mocks.
// Unlike source-string assertions, this verifies player/slider state changes,
// gesture activation, stopping sound outside the workshop, and effect gain.
const source=readFileSync(resolve(import.meta.dirname,'../apps/web/src/lib/pall-audio.ts'),'utf8');
const compiled=ts.transpileModule(source,{compilerOptions:{
  target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,
  strict:true,esModuleInterop:true
}}).outputText;

function writable(initial){
  let value=initial;
  const subs=new Set();
  return {
    set(next){value=next;for(const sub of subs)sub(next);},
    subscribe(fn){subs.add(fn);fn(value);return()=>subs.delete(fn);},
    peek(){return value;}
  };
}
const listeners=new Map();
const document={
  hidden:false,
  addEventListener(name,fn){
    if(!listeners.has(name))listeners.set(name,new Set());
    listeners.get(name).add(fn);
  },
  removeEventListener(name,fn){listeners.get(name)?.delete(fn);},
  dispatch(name,extra={}){
    for(const fn of listeners.get(name)??[])fn({type:name,...extra});
  }
};
const values=new Map();
const window={localStorage:{
  getItem(key){return values.get(key)??null;},
  setItem(key,v){values.set(key,v);}
}};
const players=[];
class MockAudio{
  constructor(src){
    this.src=src;this.paused=true;this.volume=1;this.currentTime=0;
    this.duration=src.includes('music-theme')?447:115;
    this.listeners=new Map();this.loadCount=0;players.push(this);
  }
  addEventListener(name,fn){this.listeners.set(name,fn);}
  emit(name){this.listeners.get(name)?.();}
  load(){this.loadCount++;}
  play(){this.paused=false;this.emit('playing');return Promise.resolve();}
  pause(){this.paused=true;this.emit('pause');}
}
const contexts=[];
class MockAudioContext{
  constructor(){
    this.state='suspended';this.gains=[];this.started=0;contexts.push(this);
    this.destination={};
  }
  resume(){this.state='running';return Promise.resolve();}
  decodeAudioData(){return Promise.resolve({duration:.23});}
  createGain(){
    const node={gain:{value:1},connect(){},disconnect(){}};
    this.gains.push(node);return node;
  }
  createBufferSource(){
    const ctx=this;
    return {buffer:null,connect(){},disconnect(){},addEventListener(){},
      start(){ctx.started++;},stop(){}};
  }
  close(){this.state='closed';return Promise.resolve();}
}
let currentTime=1000;
const module={exports:{}};
const sandbox={
  module,exports:module.exports,
  require(name){
    if(name!=='svelte/store')throw new Error('Unexpected dependency: '+name);
    return {writable};
  },
  window,document,Audio:MockAudio,AudioContext:MockAudioContext,
  performance:{now:()=>currentTime},
  fetch:async()=>({ok:true,arrayBuffer:async()=>new ArrayBuffer(64)}),
  setTimeout,clearTimeout,
  Math:Object.assign(Object.create(Math),{random:()=>0.1}),
  Symbol,Number,String,Map,Set,Promise,Error,JSON
};
vm.runInNewContext(compiled,sandbox,{filename:'pall-audio.transpiled.js'});
const engine=module.exports;
const find=filename=>players.find(p=>p.src.endsWith(filename));
const flush=async()=>{for(let i=0;i<20;i++)await Promise.resolve();};
const status=()=>engine.pallAudioPlayback.peek();
const settings=()=>engine.pallAudioSettings.peek();

const detach=engine.connectPallAudio();
engine.setPallAudioScene(true);
assert.equal(find('music-theme.mp3'),undefined,'Music must not autoplay.');
assert.equal(find('smithing-workshop-ambience.mp3'),undefined,'No forge = no forge audio.');
await flush();

const release=engine.claimSmithingWorkshopAmbience();
const ambience=find('smithing-workshop-ambience.mp3');
assert.ok(ambience,'Workshop must instantiate its own dedicated ambience player.');
assert.equal(ambience.loadCount,1,'Workshop ambience must preload once.');
assert.equal(ambience.paused,true,'Ambient playback needs a genuine user gesture.');
assert.equal(ambience.loop,true,'The ambience must loop continuously.');
document.dispatch('pointerdown');
await flush();
assert.equal(ambience.paused,false,'Pointer drag / click should start workshop ambience.');
assert.equal(ambience.volume,0.3,'Starting ambience volume must be independent of music.');
const music=find('music-theme.mp3');
assert.ok(music&&!music.paused,'A user gesture should also start the music.');
music.currentTime=10;
music.emit('timeupdate');
assert.ok(Math.abs(music.volume-.06)<.0001,'Music starts at owner-approved 6%.');

engine.setPallAudioSettings({ambienceVolume:.85});
assert.equal(settings().ambienceVolume,.85,'Ambience slider value must update store.');
assert.ok(Math.abs(ambience.volume-.85)<.0001,
  'Ambience volume must change on the *already-playing* track.');
engine.setPallAudioSettings({musicVolume:.4});
music.emit('timeupdate');
assert.equal(settings().musicVolume,.4);
assert.ok(Math.abs(music.volume-.4)<.0001,
  'Music slider must update current playback rather than just persist preferences.');
engine.setPallAudioSettings({sfxVolume:.8});
await flush();
currentTime+=1000;
engine.previewPallEffect();
assert.ok(contexts[0].started>0,'Effects preview should play the decoded sample.');
assert.ok(contexts[0].gains.some(node=>Math.abs(node.gain.value-.8)<.0001),
  'Effects slider must alter the gain of the next click.');
assert.equal(status().ambience,'Playing');
assert.equal(status().music,'Playing');

engine.setPallAudioSettings({ambienceVolume:0});
assert.equal(ambience.paused,true,'Ambience zero must mute the loop.');
engine.setPallAudioSettings({ambienceVolume:.4});
await flush();
assert.equal(ambience.paused,false,'Raising ambience from zero must resume playback.');
assert.ok(Math.abs(ambience.volume-.4)<.0001);
engine.setPallAudioSettings({enabled:false});
assert.equal(ambience.paused,true,'Master mute must stop workshop ambience.');
assert.equal(music.paused,true,'Master mute must stop music.');
engine.setPallAudioSettings({enabled:true});
await flush();
assert.equal(ambience.paused,false,'Sound enable must resume claimed ambience.');

// The player is a singleton across SvelteKit Stage 1→2→3 remounts. The
// transient loss of the old backdrop claim must neither pause nor reset it.
ambience.currentTime=47;
release();
engine.setPallAudioScene(false);
assert.equal(ambience.paused,false,'Short workshop stage transition must not stop the forge loop.');
assert.equal(ambience.currentTime,47,'Stage exit must not rewind ambience.');
const nextForge=engine.claimSmithingWorkshopAmbience();
engine.setPallAudioScene(true);
await flush();
assert.strictEqual(find('smithing-workshop-ambience.mp3'),ambience,
  'A later workshop stage must use the existing media element.');
assert.equal(ambience.paused,false,'A subsequent workshop must keep the existing loop playing.');
assert.equal(ambience.currentTime,47,'Entering Stage 2 must resume at the original playback position.');
nextForge();
// The new *non-workshop* backdrop has explicit authority to stop the loop
// immediately. This must not depend on a route path, timer or chance.
engine.stopSmithingWorkshopAmbience();
assert.equal(ambience.paused,true,'Switching to depot/other backdrop must stop ambience immediately.');
assert.equal(ambience.currentTime,0,'A confirmed departure should reset for a future independent visit.');
assert.equal(status().ambience,'Only in an illustrated environment');

const releaseCouncil=engine.claimCouncilOfficeAmbience();
const council=find('contracts-scholarship-ambience.mp3');
assert.ok(council,'Council ambience must use the uploaded owner recording.');
assert.equal(council.loadCount,1,'Council recording preloads exactly once.');
assert.equal(council.loop,true,'Council recording loops, like the workshop.');
await flush();
assert.equal(council.paused,false,'An already-unlocked browser starts council ambience.');
assert.equal(ambience.paused,true,'Forge ambience must not overlap the council.');
assert.equal(status().ambience,'Playing');
assert.ok(Math.abs(council.volume-.4)<.0001,'Office respects saved ambience slider.');

engine.setPallAudioSettings({ambienceVolume:.65});
await flush();
assert.ok(Math.abs(council.volume-.65)<.0001,'Council slider controls the live player.');
engine.setPallAudioSettings({enabled:false});
assert.equal(council.paused,true,'Master mute also stops office ambience.');
engine.setPallAudioSettings({enabled:true});
await flush();
assert.equal(council.paused,false,'Master unmute resumes the current office.');

document.hidden=true;
document.dispatch('visibilitychange');
assert.equal(council.paused,true,'Hidden tab pauses indoor sound.');
document.hidden=false;
document.dispatch('visibilitychange');
await flush();
assert.equal(council.paused,false,'Visible tab resumes indoor sound.');

council.currentTime=38;
releaseCouncil();
engine.setPallAudioScene(false);
assert.equal(council.paused,false,'Brief Contracts→Scholarship handoff keeps the loop.');
const releaseScholarship=engine.claimCouncilOfficeAmbience();
engine.setPallAudioScene(true);
await flush();
assert.strictEqual(find('contracts-scholarship-ambience.mp3'),council,
  'Both council rooms reuse the exact same player.');
assert.equal(council.currentTime,38,'Scholarship should not restart the recording.');
releaseScholarship();
engine.stopCouncilOfficeAmbience();
assert.equal(council.paused,true,'A confirmed depot/background change stops office ambience.');
assert.equal(council.currentTime,0,'A confirmed departure resets office playback.');
assert.equal(status().ambience,'Only in an illustrated environment');

// The uploaded NightAlley recording belongs only to the visible Flint passage.
// Switching in from Council must not leave either other location audible.
const releaseAlley=engine.claimNightAlleyAmbience();
const alley=find('night-alley-ambience.mp3');
assert.ok(alley,'Stage 5/6 must use the owner-provided alley stream.');
assert.equal(alley.loadCount,1,'Alley media preloads once.');
assert.equal(alley.loop,true,'Alley stream repeats like forge and Council.');
await flush();
assert.equal(alley.paused,false,'Unlocked session starts alley loop.');
assert.equal(council.paused,true,'Alley must not overlap Council.');
assert.equal(ambience.paused,true,'Alley must not overlap forge.');
assert.equal(alley.volume,.65,'Alley uses the existing Ambience slider.');
engine.setPallAudioSettings({ambienceVolume:.35});
assert.equal(alley.volume,.35,'Slider updates alley player volume without recreating it.');
engine.setPallAudioSettings({enabled:false});
assert.equal(alley.paused,true,'Master mute silences alley.');
engine.setPallAudioSettings({enabled:true});
await flush();
assert.equal(alley.paused,false,'Master unmute resumes alley.');
document.hidden=true;
document.dispatch('visibilitychange');
assert.equal(alley.paused,true,'Hidden tab silences the alley.');
document.hidden=false;
document.dispatch('visibilitychange');
await flush();
assert.equal(alley.paused,false,'Visible tab resumes alley.');
alley.currentTime=54;
releaseAlley();
engine.setPallAudioScene(false);
assert.equal(alley.paused,false,'Short Stage 5→6 remount preserves alley loop.');
const releaseAlleySix=engine.claimNightAlleyAmbience();
engine.setPallAudioScene(true);
await flush();
assert.equal(find('night-alley-ambience.mp3'),alley,'Stage 6 reuses the same media element.');
assert.equal(alley.currentTime,54,'Stage 6 must not rewind the recording.');
releaseAlleySix();
engine.stopNightAlleyAmbience();
assert.equal(alley.paused,true,'Confirmed departure immediately stops alley.');
assert.equal(alley.currentTime,0,'New location resets alley stream.');
assert.equal(status().ambience,'Only in an illustrated environment');
const releaseForgeAgain=engine.claimSmithingWorkshopAmbience();
await flush();
assert.equal(alley.paused,true,'Alley must stay stopped after returning to forge.');
assert.equal(ambience.paused,false,'Forge resumes after alley departure.');
releaseForgeAgain();
engine.stopSmithingWorkshopAmbience();

engine.setPallAudioScene(false);
assert.equal(music.paused,true,'Leaving the game must pause music.');
detach();
assert.equal(listeners.get('pointerdown')?.size??0,0,'Release gesture listeners.');
assert.equal(listeners.get('keydown')?.size??0,0,'Release keyboard listeners.');
console.log('PASS: forge, council and dark-alley loops are exclusive; stage handoffs, mute, slider, visibility and reset.');
