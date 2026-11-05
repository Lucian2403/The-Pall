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
    this.state='suspended';this.gains=[];this.started=0;this.starts=[];
    this.combatCompressors=[];
    this.currentTime=8;contexts.push(this);
    this.destination={};
  }
  resume(){this.state='running';return Promise.resolve();}
  decodeAudioData(){
    // Non-silent, constant 0.05 PCM gives a deterministic calibration
    // expectation: -20 dBFS active RMS -> 2x file amplitude.
    const channel=new Float32Array(1600).fill(.05);
    return Promise.resolve({
      duration:.23,sampleRate:16000,numberOfChannels:2,length:channel.length,
      getChannelData:()=>channel
    });
  }
  createDynamicsCompressor(){
    const node={
      threshold:{value:0},knee:{value:0},ratio:{value:0},
      attack:{value:0},release:{value:0},
      connect(){},disconnect(){}
    };
    this.combatCompressors.push(node);return node;
  }
  createGain(){
    const node={gain:{value:1},connect(){},disconnect(){}};
    this.gains.push(node);return node;
  }
  createBufferSource(){
    const ctx=this;
    return {buffer:null,onEnd:null,connect(){},disconnect(){},
      addEventListener(name,fn){if(name==='ended')this.onEnd=fn;},
      start(when=0,offset=0){
        ctx.started++;ctx.starts.push({when,offset});
        // End the short sample immediately in this deterministic mock so
        // the real mixer source limit does not permanently mute later tests.
        this.onEnd?.();
      },
      stop(){this.onEnd?.();}};
  }
  close(){this.state='closed';return Promise.resolve();}
}
let currentTime=1000;
const module={exports:{}};
const fetchedUrls=[];
const sandbox={
  module,exports:module.exports,
  require(name){
    if(name!=='svelte/store')throw new Error('Unexpected dependency: '+name);
    return {writable};
  },
  window,document,Audio:MockAudio,AudioContext:MockAudioContext,
  performance:{now:()=>currentTime},
  fetch:async url=>{
    fetchedUrls.push(url);
    return {ok:true,arrayBuffer:async()=>new ArrayBuffer(64)};
  },
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

// Stage 4 depot: one location owns its own streaming player.
assert.equal(find('depot-ambience.mp3'),undefined,'Depot must remain unloaded during previous scenes.');
const releaseDepot=engine.claimDepotAmbience();
const depot=find('depot-ambience.mp3');
assert.ok(depot,'Depot creates the owner recording player.');
assert.equal(depot.loadCount,1,'Depot recording preloads exactly once.');
assert.equal(depot.loop,true,'Depot soundscape loops.');
await flush();
assert.equal(depot.paused,false,'Unlocked session plays Depot ambience.');
assert.equal(ambience.paused,true,'Forge and Depot cannot overlap.');
assert.equal(council.paused,true,'Council and Depot cannot overlap.');
assert.equal(alley.paused,true,'Alley and Depot cannot overlap.');
engine.setPallAudioSettings({ambienceVolume:.55});
assert.equal(depot.volume,.55,'Live Ambience slider controls Depot.');
engine.setPallAudioSettings({enabled:false});
assert.equal(depot.paused,true,'Master mute silences Depot.');
engine.setPallAudioSettings({enabled:true});
await flush();
assert.equal(depot.paused,false,'Master unmute restores Depot.');
document.hidden=true;
document.dispatch('visibilitychange');
assert.equal(depot.paused,true,'Inactive tab pauses Depot.');
document.hidden=false;
document.dispatch('visibilitychange');
await flush();
assert.equal(depot.paused,false,'Visible tab resumes Depot.');
depot.currentTime=67;
releaseDepot();
engine.setPallAudioScene(false);
assert.equal(depot.paused,false,'Short Depot scene remount preserves the loop.');
const releaseDepotAgain=engine.claimDepotAmbience();
engine.setPallAudioScene(true);
await flush();
assert.strictEqual(find('depot-ambience.mp3'),depot,'Depot remount reuses same player.');
assert.equal(depot.currentTime,67,'Depot remount does not rewind.');
releaseDepotAgain();
engine.stopDepotAmbience();
assert.equal(depot.paused,true,'A new location stops Depot immediately.');
assert.equal(depot.currentTime,0,'Confirmed departure resets Depot position.');

// Stage 7: only the illustrated clinic may own the medical background loop.
const releaseClinic=engine.claimMedicalClinicAmbience();
const clinic=find('medical-clinic-ambience.mp3');
assert.ok(clinic,'Clinic scene creates its own audio stream.');
assert.equal(clinic.loop,true,'Medical recording must loop.');
assert.equal(clinic.loadCount,1,'Medical recording preloads once.');
await flush();
assert.equal(clinic.paused,false,'Unlocked clinic starts ambience.');
for(const other of [ambience,council,alley,depot])
  assert.equal(other.paused,true,'Clinic ambience must never overlap another scene.');
engine.setPallAudioSettings({ambienceVolume:.42});
assert.equal(clinic.volume,.42,'Clinic follows the existing ambience slider.');
document.hidden=true;
document.dispatch('visibilitychange');
assert.equal(clinic.paused,true,'Tab-hidden clinic must be quiet.');
document.hidden=false;
document.dispatch('visibilitychange');
await flush();
assert.equal(clinic.paused,false,'Returning to clinic tab resumes ambience.');
engine.setPallAudioSettings({enabled:false});
assert.equal(clinic.paused,true,'Master mute silences clinic.');
engine.setPallAudioSettings({enabled:true});
await flush();
assert.equal(clinic.paused,false,'Unmuting resumes the clinic.');

const startCount=contexts[0].started;
engine.playCoinTransactionSfx();
assert.equal(contexts[0].started,startCount+2,'One confirmed transfer pairs both samples.');
assert.ok(contexts[0].starts.at(-1).when>contexts[0].starts.at(-2).when,
  'Second coin sound is scheduled shortly after the first.');
engine.setPallAudioSettings({sfxVolume:0});
engine.playCoinTransactionSfx();
assert.equal(contexts[0].started,startCount+2,'Muted effects do not play a transaction.');
engine.setPallAudioSettings({sfxVolume:.5});
// All 17 combat sounds, existing and newly supplied, use one calibrated
// playback target, one shared limiter, and the unchanged SFX slider.
const releaseCombat=engine.claimCombatSfx();
await flush();
const combatNames=[
  ...['hit-01','hit-02','hit-03','hit-04',
    'male-grunt-01','male-grunt-02','male-grunt-03','male-grunt-04',
    'miss-01','miss-02','miss-03',
    'male-low-stamina','reposition','guard','fight-finished','focus','recovery']
      .map(name=>'combat/'+name+'.mp3')
];
for(const filename of combatNames){
  assert.ok(fetchedUrls.some(url=>url.endsWith(filename)),
    'Combat clip should be predecoded: '+filename);
}
const combatBefore=contexts[0].started;
const combatGainBefore=contexts[0].gains.length;
for(const cue of ['hit','miss','maleGrunt','maleLowStamina','reposition',
                  'guard','fightFinished','focus','recovery']){
  engine.playCombatSfx(cue);
}
assert.equal(contexts[0].started-combatBefore,9,
  'Nine combat cues produce one actual WebAudio output each');
const combatGains=contexts[0].gains.slice(combatGainBefore).map(x=>x.gain.value);
const expectedGain=.5*(Math.pow(10,-20/20)/.05)*.84;
for(const gain of combatGains)
  assert.ok(Math.abs(gain-expectedGain)<.0001,
    'All old/new combat sounds share one calibrated active-RMS output dB and slider');
assert.equal(contexts[0].combatCompressors.length,1,
  'All combat effects, old and new, must share the same output limiter');
const compressor=contexts[0].combatCompressors[0];
assert.equal(compressor.threshold.value,-12);
assert.equal(compressor.ratio.value,6);
engine.setPallAudioSettings({sfxVolume:.25});
const halfLevel=contexts[0].gains.length;
engine.playCombatSfx('focus');
assert.ok(Math.abs(contexts[0].gains[halfLevel].gain.value-expectedGain*.5)<.0001,
  'Reducing SFX volume must scale all combat sounds by the same factor');
engine.setPallAudioSettings({sfxVolume:0});
engine.playCombatSfx('recovery');
assert.equal(contexts[0].started,combatBefore+10,
  'Muted new combat samples must never play');
engine.setPallAudioSettings({sfxVolume:.5});
releaseCombat();
engine.playCombatSfx('miss');
assert.equal(contexts[0].started,combatBefore+10,
  'Audio outside an active combat claim must be silent');
releaseClinic();
assert.equal(clinic.paused,true,'Leaving the clinic stops ambient playback immediately.');
assert.equal(clinic.currentTime,0,'Leaving the clinic resets the ambient loop.');
assert.equal(status().ambience,'Only in an illustrated environment');

engine.setPallAudioScene(false);
const inactiveCount=contexts[0].started;
engine.playCoinTransactionSfx();
assert.equal(contexts[0].started,inactiveCount,'A non-game page cannot play coin sounds.');
assert.equal(music.paused,true,'Leaving the game must pause music.');
detach();
assert.equal(listeners.get('pointerdown')?.size??0,0,'Release gesture listeners.');
assert.equal(listeners.get('keydown')?.size??0,0,'Release keyboard listeners.');
console.log('PASS: forge, council, alley, depot and clinic soundscapes; all 17 calibrated combat effects, shared limiter, mute, sliders and visibility.');
