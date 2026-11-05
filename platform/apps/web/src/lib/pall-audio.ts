import {writable} from 'svelte/store';

/**
 * Browser-only audio prototype. No autoplay and no persistent game mutations.
 * Sound assets belong in static/audio/the-pall (the owner's asset ZIP).
 */
export type PallAudioSettings={
  enabled:boolean;
  musicVolume:number;
  ambienceVolume:number;
  sfxVolume:number;
};
const KEY='the-pall-audio-v1';
const DEFAULT:PallAudioSettings={enabled:true,musicVolume:0.06,ambienceVolume:0.3,sfxVolume:0.55};
const MAX_MUSIC_VOLUME=0.5;
const PREVIOUS_DEFAULT_MUSIC=0.035;
export const pallAudioSettings=writable<PallAudioSettings>({...DEFAULT});

// Browser playback diagnostics. Source checks alone cannot establish whether
// a browser actually loaded or played the owner's sound files.
export type PallAudioPlayback={
  music:string;
  ambience:string;
  effects:string;
};
export const pallAudioPlayback=writable<PallAudioPlayback>({
  music:'Waiting for interaction',
  ambience:'Only in an illustrated environment',
  effects:'Loading'
});

const base='/audio/the-pall/';
const clickVariants=[
  {file:'UI_ClickMain.wav',weight:75,gain:1},
  {file:'UI_Click.wav',weight:15,gain:0.24},
  {file:'UI_Click02.wav',weight:10,gain:0.30}
] as const;
const paperVariants=['UI_PaperJournal.wav','UI_PaperJournal2.wav'] as const;
const smithVariants=['UI-SmithingAction.wav','UI-SmithingAction02.wav'] as const;
const musicFile='music-theme.mp3';
const smithingAmbienceFile='smithing-workshop-ambience.mp3';
// Same owner-provided indoor ambience for the Contracts and Scholarship rooms.
const councilOfficeAmbienceFile='contracts-scholarship-ambience.mp3';
const nightAlleyAmbienceFile='night-alley-ambience.mp3';
const depotAmbienceFile='depot-ambience.mp3';
const medicalClinicAmbienceFile='medical-clinic-ambience.mp3';
const FADE_IN=4;
const FADE_OUT=5;
const MUSIC_PAUSE_MIN_MS=30_000;
const MUSIC_PAUSE_RANGE_MS=45_000;

let settings={...DEFAULT};
let connected=false;
let sceneActive=false;
let unlocked=false;
let music:HTMLAudioElement|null=null;
let ambience:HTMLAudioElement|null=null;
let councilAmbience:HTMLAudioElement|null=null;
let alleyAmbience:HTMLAudioElement|null=null;
let depotAmbience:HTMLAudioElement|null=null;
let clinicAmbience:HTMLAudioElement|null=null;
let musicError=false;
let ambienceError=false;
let councilAmbienceError=false;
let alleyAmbienceError=false;
let depotAmbienceError=false;
let clinicAmbienceError=false;
let musicBlocked=false;
let ambienceBlocked=false;
let councilAmbienceBlocked=false;
let alleyAmbienceBlocked=false;
let depotAmbienceBlocked=false;
let clinicAmbienceBlocked=false;
let statusSnapshot='';
// A workshop scene claims the soundscape for as long as its illustration
// is visible. Ownership is independent of URL so non-workshop pages stay silent.
const smithingAmbienceOwners=new Set<symbol>();
const councilAmbienceOwners=new Set<symbol>();
const alleyAmbienceOwners=new Set<symbol>();
const depotAmbienceOwners=new Set<symbol>();
const clinicAmbienceOwners=new Set<symbol>();
let activeAmbienceScene:'forge'|'council'|'alley'|'depot'|'clinic'|null=null;
// SvelteKit briefly unmounts the old stage while the next stage loads.
// Do not replay the 115-second forge recording from its beginning each time.
const WORKSHOP_TRANSITION_GRACE_MS=2400;
let ambienceDepartureTimer:ReturnType<typeof setTimeout>|null=null;
let councilDepartureTimer:ReturnType<typeof setTimeout>|null=null;
let alleyDepartureTimer:ReturnType<typeof setTimeout>|null=null;
let depotDepartureTimer:ReturnType<typeof setTimeout>|null=null;
let nextMusicTimer:ReturnType<typeof setTimeout>|null=null;
let lastClickAt=0;

// Short effects are fully fetched and decoded as soon as an in-game scene
// becomes active. Creating a new HTMLAudioElement for each click used to
// incur observable network/decode/startup latency (roughly 300–500 ms).
// Keep the long theme streamed through HTMLAudioElement; only tiny SFX are
// predecoded into Web Audio buffers.
const coinSfxFiles=['ui-coins1.wav','ui-coins2.wav'] as const;
const sfxFiles=[
  ...clickVariants.map(variant=>variant.file),
  ...paperVariants,
  ...smithVariants,
  ...coinSfxFiles
];

// Optional Stage 6 cues are predecoded only while a combat scene is mounted.
// They use the same device, mute switch and SFX volume as workshop sounds.
const combatHits=['combat/hit-01.mp3','combat/hit-02.mp3',
  'combat/hit-03.mp3','combat/hit-04.mp3'] as const;
const combatGrunts=['combat/male-grunt-01.mp3','combat/male-grunt-02.mp3',
  'combat/male-grunt-03.mp3','combat/male-grunt-04.mp3'] as const;
const combatSfxFiles=[...combatHits,...combatGrunts,
  'combat/male-low-stamina.mp3','combat/reposition.mp3',
  'combat/fight-finished.mp3','combat/guard.mp3'] as const;
const combatSfxOwners=new Set<symbol>();
export type CombatSfxCue='hit'|'maleGrunt'|'maleLowStamina'|
  'reposition'|'guard'|'fightFinished';
let sfxContext:AudioContext|null=null;
const sfxBuffers=new Map<string,AudioBuffer>();
const sfxLoading=new Map<string,Promise<void>>();
const sfxFailures=new Set<string>();
const activeSources=new Set<AudioBufferSourceNode>();

function publishPlayback(){
  const unavailable=typeof document==='undefined'||!sceneActive?'Game audio inactive'
    :!settings.enabled?'Sound disabled'
    :document.hidden?'Tab inactive':null;
  const musicState=unavailable??(settings.musicVolume===0?'Off'
    :musicError?'File unavailable'
    :!unlocked?'Click to start'
    :nextMusicTimer!==null?'Resting'
    :musicBlocked?'Playback blocked — click to retry'
    :music&&!music.paused?'Playing':'Loading');
  const activeTrack=activeAmbienceScene==='forge'?ambience
    :activeAmbienceScene==='council'?councilAmbience
    :activeAmbienceScene==='alley'?alleyAmbience
    :activeAmbienceScene==='depot'?depotAmbience
    :activeAmbienceScene==='clinic'?clinicAmbience:null;
  const activeError=activeAmbienceScene==='forge'?ambienceError
    :activeAmbienceScene==='council'?councilAmbienceError
    :activeAmbienceScene==='depot'?depotAmbienceError
    :activeAmbienceScene==='clinic'?clinicAmbienceError:alleyAmbienceError;
  const activeBlocked=activeAmbienceScene==='forge'?ambienceBlocked
    :activeAmbienceScene==='council'?councilAmbienceBlocked
    :activeAmbienceScene==='depot'?depotAmbienceBlocked
    :activeAmbienceScene==='clinic'?clinicAmbienceBlocked:alleyAmbienceBlocked;
  const ambienceState=unavailable??(settings.ambienceVolume===0?'Off'
    :activeAmbienceScene===null?'Only in an illustrated environment'
    :activeError?'File unavailable'
    :!unlocked?'Click to start'
    :activeBlocked?'Playback blocked — click to retry'
    :activeTrack&&!activeTrack.paused?'Playing':'Loading');
  const effectsState=unavailable??(settings.sfxVolume===0?'Off'
    :sfxFailures.size>0?'Sound file unavailable'
    :sfxFiles.every(filename=>sfxBuffers.has(filename))?'Ready'
    :'Loading');
  const snapshot=[musicState,ambienceState,effectsState].join('|');
  if(snapshot===statusSnapshot)return;
  statusSnapshot=snapshot;
  pallAudioPlayback.set({music:musicState,ambience:ambienceState,effects:effectsState});
}

function ensureSfxContext():AudioContext|null{
  if(typeof window==='undefined')return null;
  try{
    sfxContext??=new AudioContext({latencyHint:'interactive'});
  }catch{
    // Audio is optional. An unsupported or unavailable device never blocks UI.
    return null;
  }
  return sfxContext;
}

function prepareSoundEffects(files:readonly string[]=sfxFiles){
  if(!sceneActive||!settings.enabled||typeof window==='undefined')return;
  const context=ensureSfxContext();
  if(!context)return;
  // The seven WAVs are small. Fetch and decode once, well before the player
  // interacts, rather than making the first call to play() load a new file.
  for(const filename of files){
    if(sfxBuffers.has(filename)||sfxLoading.has(filename))continue;
    const loading=fetch(base+filename,{cache:'force-cache'})
      .then(response=>{
        if(!response.ok)throw new Error('sound unavailable: '+filename);
        return response.arrayBuffer();
      })
      .then(bytes=>context.decodeAudioData(bytes))
      .then(buffer=>{
        if(sfxContext===context)sfxBuffers.set(filename,buffer);
        sfxFailures.delete(filename);
        publishPlayback();
      })
      .catch(()=>{
        // Never play a delayed cue; report a missing or undecodable WAV.
        // Subsequent scene activation / reenable may attempt a new fetch.
        sfxFailures.add(filename);
        publishPlayback();
      })
      .finally(()=>{
        sfxLoading.delete(filename);
        publishPlayback();
      });
    sfxLoading.set(filename,loading);
  }
}

function stopSoundEffects(){
  for(const source of activeSources){
    try{source.stop();}catch{/* Source already ended. */}
    source.disconnect();
  }
  activeSources.clear();
}

const clamp=(x:number,min:number,max:number)=>Math.min(max,Math.max(min,x));
function canPlayMusic(){
  return typeof document!=='undefined' && settings.enabled && sceneActive &&
    settings.musicVolume>0 && unlocked && !document.hidden;
}
function clearMusicTimer(){
  if(nextMusicTimer!==null){clearTimeout(nextMusicTimer);nextMusicTimer=null;}
}
function updateMusicVolume(){
  if(!music)return;
  const position=Number.isFinite(music.currentTime)?music.currentTime:0;
  const remaining=Number.isFinite(music.duration)?music.duration-position:FADE_OUT;
  const envelope=clamp(Math.min(position/FADE_IN,remaining/FADE_OUT),0,1);
  music.volume=canPlayMusic()?clamp(settings.musicVolume,0,MAX_MUSIC_VOLUME)*envelope:0;
}
function ensureMusic(){
  if(music)return music;
  music=new Audio(base+musicFile);
  music.preload='none';
  music.loop=false;
  music.volume=0;
  music.addEventListener('timeupdate',updateMusicVolume);
  music.addEventListener('playing',publishPlayback);
  music.addEventListener('pause',publishPlayback);
  music.addEventListener('error',()=>{
    musicError=true;
    publishPlayback();
  });
  music.addEventListener('ended',()=>{
    if(!canPlayMusic())return;
    // The supplied 7m27s theme plays in full, then rests before replaying.
    publishPlayback();
    nextMusicTimer=setTimeout(()=>{
      nextMusicTimer=null;
      if(!canPlayMusic()||!music)return;
      music.currentTime=0;
      void music.play().then(updateMusicVolume).catch(()=>{});
    },MUSIC_PAUSE_MIN_MS+Math.random()*MUSIC_PAUSE_RANGE_MS);
  });
  return music;
}
function canPlayAmbience(){
  return typeof document!=='undefined' && settings.enabled &&
    sceneActive && unlocked && settings.ambienceVolume>0 &&
    smithingAmbienceOwners.size>0 && activeAmbienceScene==='forge' && !document.hidden;
}
function ensureAmbience(){
  if(ambience)return ambience;
  ambience=new Audio(base+smithingAmbienceFile);
  ambience.preload='auto';
  ambience.loop=true;
  ambience.volume=0;
  ambience.addEventListener('playing',publishPlayback);
  ambience.addEventListener('pause',publishPlayback);
  ambience.addEventListener('error',()=>{
    ambienceError=true;
    publishPlayback();
  });
  // One preload per player lifetime. Repeated load() calls on every workshop
  // mount would reset even a sound already playing.
  ambience.load();
  publishPlayback();
  return ambience;
}
function cancelAmbienceDeparture(){
  if(ambienceDepartureTimer!==null){
    clearTimeout(ambienceDepartureTimer);
    ambienceDepartureTimer=null;
  }
}
function deferAmbienceDeparture(){
  // Keep an existing loop alive through a short Stage 1→2→3 route handoff.
  // After a longer fetch, merely PAUSE: the next workshop resumes at the
  // same point rather than restarting from time zero.
  if(ambienceDepartureTimer!==null||!ambience||ambience.paused)return;
  ambienceDepartureTimer=setTimeout(()=>{
    ambienceDepartureTimer=null;
    if(!sceneActive||smithingAmbienceOwners.size===0)stopAmbience();
  },WORKSHOP_TRANSITION_GRACE_MS);
}
function startAmbience(){
  if(!canPlayAmbience())return;
  const track=ensureAmbience();
  track.volume=clamp(settings.ambienceVolume,0,1);
  if(track.paused)void track.play().then(()=>{
    ambienceBlocked=false;
    publishPlayback();
  }).catch(()=>{
    // This is different from a missing file: the next real gesture retries.
    ambienceBlocked=true;
    publishPlayback();
  });
  publishPlayback();
}
function stopAmbience(reset=false){
  if(!ambience)return;
  ambience.pause();
  if(reset){try{ambience.currentTime=0;}catch{/* Not loaded yet. */}}
  publishPlayback();
}
function updateAmbience(){
  // Mute, zero volume or a hidden tab stop sound immediately.
  if(typeof document==='undefined'||document.hidden||!settings.enabled||settings.ambienceVolume<=0){
    cancelAmbienceDeparture();
    stopAmbience();
  }else if(canPlayAmbience()){
    cancelAmbienceDeparture();
    startAmbience();
  }else if(!sceneActive||smithingAmbienceOwners.size===0){
    // The backdrop may be temporarily absent during a route data fetch.
    deferAmbienceDeparture();
  }else{
    stopAmbience();
  }
}

/** Same streaming, user-gesture and pause/resume contract as the forge loop.
 * Separate media elements keep their positions while the HUD is remounted. */
function canPlayCouncilAmbience(){
  return typeof document!=='undefined' && settings.enabled &&
    sceneActive && unlocked && settings.ambienceVolume>0 &&
    councilAmbienceOwners.size>0 && activeAmbienceScene==='council' && !document.hidden;
}
function ensureCouncilAmbience(){
  if(councilAmbience)return councilAmbience;
  councilAmbience=new Audio(base+councilOfficeAmbienceFile);
  councilAmbience.preload='auto';
  councilAmbience.loop=true;
  councilAmbience.volume=0;
  councilAmbience.addEventListener('playing',publishPlayback);
  councilAmbience.addEventListener('pause',publishPlayback);
  councilAmbience.addEventListener('error',()=>{councilAmbienceError=true;publishPlayback();});
  councilAmbience.load();
  publishPlayback();
  return councilAmbience;
}
function cancelCouncilDeparture(){
  if(councilDepartureTimer!==null){clearTimeout(councilDepartureTimer);councilDepartureTimer=null;}
}
function stopCouncilAmbience(reset=false){
  if(!councilAmbience)return;
  councilAmbience.pause();
  if(reset){try{councilAmbience.currentTime=0;}catch{/* Not loaded yet. */}}
  publishPlayback();
}
function deferCouncilDeparture(){
  if(councilDepartureTimer!==null||!councilAmbience||councilAmbience.paused)return;
  councilDepartureTimer=setTimeout(()=>{
    councilDepartureTimer=null;
    if(!sceneActive||councilAmbienceOwners.size===0)stopCouncilAmbience();
  },WORKSHOP_TRANSITION_GRACE_MS);
}
function startCouncilAmbience(){
  if(!canPlayCouncilAmbience())return;
  const track=ensureCouncilAmbience();
  track.volume=clamp(settings.ambienceVolume,0,1);
  if(track.paused)void track.play().then(()=>{
    councilAmbienceBlocked=false;
    publishPlayback();
  }).catch(()=>{
    councilAmbienceBlocked=true;
    publishPlayback();
  });
  publishPlayback();
}
function updateCouncilAmbience(){
  if(typeof document==='undefined'||document.hidden||!settings.enabled||settings.ambienceVolume<=0){
    cancelCouncilDeparture();
    stopCouncilAmbience();
  }else if(canPlayCouncilAmbience()){
    cancelCouncilDeparture();
    startCouncilAmbience();
  }else if(!sceneActive||councilAmbienceOwners.size===0){
    deferCouncilDeparture();
  }else{
    stopCouncilAmbience();
  }
}
/** A confirmed non-council backdrop stops the indoor room immediately. */
export function stopCouncilOfficeAmbience(){
  if(activeAmbienceScene==='council')activeAmbienceScene=null;
  cancelCouncilDeparture();
  stopCouncilAmbience(true);
}
/** Contracts and Scholarship share one persistent loop, never two copies. */
export function claimCouncilOfficeAmbience(){
  const owner=Symbol('council-office');
  councilAmbienceOwners.add(owner);
  activeAmbienceScene='council';
  stopClinicTrack(true);
  cancelDepotDeparture();stopDepotTrack(true);
  cancelAlleyDeparture();
  stopAlleyTrack(true);
  cancelAmbienceDeparture();
  stopAmbience(true);
  cancelCouncilDeparture();
  if(typeof window!=='undefined'&&settings.enabled)ensureCouncilAmbience();
  updateCouncilAmbience();
  publishPlayback();
  return ()=>{
    councilAmbienceOwners.delete(owner);
    if(councilAmbienceOwners.size===0){
      if(activeAmbienceScene==='council')activeAmbienceScene=null;
      deferCouncilDeparture();
    }else updateCouncilAmbience();
    publishPlayback();
  };
}

/** The industrial alley is a distinct ambient location. It is audible only
 * while its painted backdrop is mounted; Stages 5 and 6 share one stream. */
function canPlayAlleyAmbience(){
  return typeof document!=='undefined' && settings.enabled &&
    sceneActive && unlocked && settings.ambienceVolume>0 &&
    alleyAmbienceOwners.size>0 && activeAmbienceScene==='alley' && !document.hidden;
}
function ensureAlleyAmbience(){
  if(alleyAmbience)return alleyAmbience;
  alleyAmbience=new Audio(base+nightAlleyAmbienceFile);
  alleyAmbience.preload='auto';
  alleyAmbience.loop=true;
  alleyAmbience.volume=0;
  alleyAmbience.addEventListener('playing',publishPlayback);
  alleyAmbience.addEventListener('pause',publishPlayback);
  alleyAmbience.addEventListener('error',()=>{alleyAmbienceError=true;publishPlayback();});
  // Preload once; remounts must not restart the owner recording.
  alleyAmbience.load();
  publishPlayback();
  return alleyAmbience;
}
function cancelAlleyDeparture(){
  if(alleyDepartureTimer!==null){clearTimeout(alleyDepartureTimer);alleyDepartureTimer=null;}
}
function stopAlleyTrack(reset=false){
  if(!alleyAmbience)return;
  alleyAmbience.pause();
  if(reset){try{alleyAmbience.currentTime=0;}catch{/* Not loaded yet. */}}
  publishPlayback();
}
function deferAlleyDeparture(){
  if(alleyDepartureTimer!==null||!alleyAmbience||alleyAmbience.paused)return;
  alleyDepartureTimer=setTimeout(()=>{
    alleyDepartureTimer=null;
    if(!sceneActive||alleyAmbienceOwners.size===0)stopAlleyTrack();
  },WORKSHOP_TRANSITION_GRACE_MS);
}
function startAlleyAmbience(){
  if(!canPlayAlleyAmbience())return;
  const track=ensureAlleyAmbience();
  track.volume=clamp(settings.ambienceVolume,0,1);
  if(track.paused)void track.play().then(()=>{
    alleyAmbienceBlocked=false;
    publishPlayback();
  }).catch(()=>{
    alleyAmbienceBlocked=true;
    publishPlayback();
  });
  publishPlayback();
}
function updateAlleyAmbience(){
  if(typeof document==='undefined'||document.hidden||!settings.enabled||settings.ambienceVolume<=0){
    cancelAlleyDeparture();
    stopAlleyTrack();
  }else if(canPlayAlleyAmbience()){
    cancelAlleyDeparture();
    startAlleyAmbience();
  }else if(!sceneActive||alleyAmbienceOwners.size===0){
    deferAlleyDeparture();
  }else{
    stopAlleyTrack();
  }
}
/** Only an explicit non-alley backdrop stops and resets the alley recording. */
export function stopNightAlleyAmbience(){
  if(activeAmbienceScene==='alley')activeAmbienceScene=null;
  cancelAlleyDeparture();
  stopAlleyTrack(true);
}
/** Claim only from the actual Flint alley scene, never from a generic character URL. */
export function claimNightAlleyAmbience(){
  const owner=Symbol('night-alley');
  alleyAmbienceOwners.add(owner);
  activeAmbienceScene='alley';
  stopClinicTrack(true);
  cancelDepotDeparture();stopDepotTrack(true);
  cancelAmbienceDeparture();
  cancelCouncilDeparture();
  stopAmbience(true);
  stopCouncilAmbience(true);
  cancelAlleyDeparture();
  if(typeof window!=='undefined'&&settings.enabled)ensureAlleyAmbience();
  updateAlleyAmbience();
  updateDepotAmbience();
  publishPlayback();
  return ()=>{
    alleyAmbienceOwners.delete(owner);
    if(alleyAmbienceOwners.size===0){
      if(activeAmbienceScene==='alley')activeAmbienceScene=null;
      deferAlleyDeparture();
    }else updateAlleyAmbience();
    publishPlayback();
  };
}

/** Loop exclusive to the visible Municipal Depot yard in Stage 4. */
function canPlayDepotAmbience(){
  return typeof document!=='undefined' && settings.enabled && sceneActive && unlocked &&
    settings.ambienceVolume>0 && depotAmbienceOwners.size>0 &&
    activeAmbienceScene==='depot' && !document.hidden;
}
function ensureDepotAmbience(){
  if(depotAmbience)return depotAmbience;
  depotAmbience=new Audio(base+depotAmbienceFile);
  depotAmbience.preload='auto';
  depotAmbience.loop=true;
  depotAmbience.volume=0;
  depotAmbience.addEventListener('playing',publishPlayback);
  depotAmbience.addEventListener('pause',publishPlayback);
  depotAmbience.addEventListener('error',()=>{depotAmbienceError=true;publishPlayback();});
  depotAmbience.load();
  publishPlayback();
  return depotAmbience;
}
function cancelDepotDeparture(){
  if(depotDepartureTimer!==null){clearTimeout(depotDepartureTimer);depotDepartureTimer=null;}
}
function stopDepotTrack(reset=false){
  if(!depotAmbience)return;
  depotAmbience.pause();
  if(reset){try{depotAmbience.currentTime=0;}catch{/* Not loaded. */}}
  publishPlayback();
}
function deferDepotDeparture(){
  if(depotDepartureTimer!==null||!depotAmbience||depotAmbience.paused)return;
  depotDepartureTimer=setTimeout(()=>{
    depotDepartureTimer=null;
    if(!sceneActive||depotAmbienceOwners.size===0)stopDepotTrack();
  },WORKSHOP_TRANSITION_GRACE_MS);
}
function startDepotAmbience(){
  if(!canPlayDepotAmbience())return;
  const track=ensureDepotAmbience();
  track.volume=clamp(settings.ambienceVolume,0,1);
  if(track.paused)void track.play().then(()=>{
    depotAmbienceBlocked=false;publishPlayback();
  }).catch(()=>{depotAmbienceBlocked=true;publishPlayback();});
  publishPlayback();
}
function updateDepotAmbience(){
  if(typeof document==='undefined'||document.hidden||!settings.enabled||settings.ambienceVolume<=0){
    cancelDepotDeparture();stopDepotTrack();
  }else if(canPlayDepotAmbience()){
    cancelDepotDeparture();startDepotAmbience();
  }else if(!sceneActive||depotAmbienceOwners.size===0){
    deferDepotDeparture();
  }else stopDepotTrack();
}
export function stopDepotAmbience(){
  if(activeAmbienceScene==='depot')activeAmbienceScene=null;
  cancelDepotDeparture();stopDepotTrack(true);
}
export function claimDepotAmbience(){
  const owner=Symbol('municipal-depot');
  depotAmbienceOwners.add(owner);
  activeAmbienceScene='depot';
  stopClinicTrack(true);
  cancelAmbienceDeparture();stopAmbience(true);
  cancelCouncilDeparture();stopCouncilAmbience(true);
  cancelAlleyDeparture();stopAlleyTrack(true);
  cancelDepotDeparture();
  if(typeof window!=='undefined'&&settings.enabled)ensureDepotAmbience();
  updateDepotAmbience();publishPlayback();
  return ()=>{
    depotAmbienceOwners.delete(owner);
    if(depotAmbienceOwners.size===0){
      if(activeAmbienceScene==='depot')activeAmbienceScene=null;
      deferDepotDeparture();
    }else updateDepotAmbience();
    publishPlayback();
  };
}

/** Clinic-only ambience, managed by an explicit illustrated-scene owner. */
function canPlayMedicalClinicAmbience(){
  return typeof document!=='undefined'&&settings.enabled&&sceneActive&&
    unlocked&&settings.ambienceVolume>0&&clinicAmbienceOwners.size>0&&
    activeAmbienceScene==='clinic'&&!document.hidden;
}
function ensureMedicalClinicAmbience(){
  if(clinicAmbience)return clinicAmbience;
  clinicAmbience=new Audio(base+medicalClinicAmbienceFile);
  clinicAmbience.preload='auto';
  clinicAmbience.loop=true;
  clinicAmbience.volume=0;
  clinicAmbience.addEventListener('playing',publishPlayback);
  clinicAmbience.addEventListener('pause',publishPlayback);
  clinicAmbience.addEventListener('error',()=>{clinicAmbienceError=true;publishPlayback();});
  clinicAmbience.load();publishPlayback();
  return clinicAmbience;
}
function stopClinicTrack(reset=false){
  if(!clinicAmbience)return;
  clinicAmbience.pause();
  if(reset){try{clinicAmbience.currentTime=0;}catch{/* Not loaded */}}
  publishPlayback();
}
function updateMedicalClinicAmbience(){
  if(!canPlayMedicalClinicAmbience()){stopClinicTrack();return;}
  const track=ensureMedicalClinicAmbience();
  track.volume=clamp(settings.ambienceVolume,0,1);
  if(track.paused)void track.play().then(()=>{
    clinicAmbienceBlocked=false;publishPlayback();
  }).catch(()=>{clinicAmbienceBlocked=true;publishPlayback();});
  publishPlayback();
}
export function stopMedicalClinicAmbience(){
  if(activeAmbienceScene==='clinic')activeAmbienceScene=null;
  stopClinicTrack(true);
}
export function claimMedicalClinicAmbience(){
  const owner=Symbol('medical-clinic');
  clinicAmbienceOwners.add(owner);
  activeAmbienceScene='clinic';
  cancelAmbienceDeparture();stopAmbience(true);
  cancelCouncilDeparture();stopCouncilAmbience(true);
  cancelAlleyDeparture();stopAlleyTrack(true);
  cancelDepotDeparture();stopDepotTrack(true);
  if(typeof window!=='undefined'&&settings.enabled)ensureMedicalClinicAmbience();
  updateMedicalClinicAmbience();publishPlayback();
  return ()=>{
    clinicAmbienceOwners.delete(owner);
    if(clinicAmbienceOwners.size===0){
      if(activeAmbienceScene==='clinic')activeAmbienceScene=null;
      stopClinicTrack(true);
    }else updateMedicalClinicAmbience();
    publishPlayback();
  };
}

/** A confirmed non-forge background must stop the loop immediately. */
export function stopSmithingWorkshopAmbience(){
  if(activeAmbienceScene==='forge')activeAmbienceScene=null;
  cancelAmbienceDeparture();
  stopAmbience(true);
}
/**
 * Connect ambient sound to the visible smithing backdrop, not to generic
 * character routes. The disposer handles navigation and conditional scenes.
 */
export function claimSmithingWorkshopAmbience(){
  const owner=Symbol('smithing-workshop');
  smithingAmbienceOwners.add(owner);
  activeAmbienceScene='forge';
  stopClinicTrack(true);
  cancelDepotDeparture();stopDepotTrack(true);
  cancelAlleyDeparture();
  stopAlleyTrack(true);
  cancelCouncilDeparture();
  stopCouncilAmbience(true);
  cancelAmbienceDeparture();
  if(typeof window!=='undefined'&&settings.enabled){
    // Fetch once when a workshop is displayed; play only after activation.
    ensureAmbience();
  }
  updateAmbience();
  publishPlayback();
  return ()=>{
    smithingAmbienceOwners.delete(owner);
    // Stage transitions momentarily have no owner. Never reset here.
    if(smithingAmbienceOwners.size===0){
      if(activeAmbienceScene==='forge')activeAmbienceScene=null;
      deferAmbienceDeparture();
    }
    else updateAmbience();
    publishPlayback();
  };
}
function startMusic(){
  if(!canPlayMusic()||nextMusicTimer!==null)return;
  const track=ensureMusic();
  if(!track.paused)return;
  if(track.ended)track.currentTime=0;
  void track.play().then(()=>{
    musicBlocked=false;
    updateMusicVolume();
    publishPlayback();
  }).catch(()=>{
    // Gesture listeners retry; a missing file produces a separate error event.
    musicBlocked=true;
    publishPlayback();
  });
  publishPlayback();
}
function stopMusic(){
  clearMusicTimer();
  if(music)music.pause();
  publishPlayback();
}
function unlock(){
  if(!sceneActive)return;
  unlocked=true;
  // Pointerdown/keydown are actual browser user activations. Resume and retry
  // here, before any slider input event or onClick callback runs.
  const context=ensureSfxContext();
  if(context?.state==='suspended')void context.resume().catch(()=>{});
  startMusic();
  updateAmbience();
  updateCouncilAmbience();
  updateAlleyAmbience();
  updateDepotAmbience();
    updateMedicalClinicAmbience();
  publishPlayback();
}
export function activatePallAudio(){
  unlock();
}
// The original soundtrack intentionally rests between playthroughs. A manual
// preview lets players check the Music slider without waiting through that rest.
export function previewPallMusic(){
  unlock();
  if(!canPlayMusic())return;
  clearMusicTimer();
  const track=ensureMusic();
  // A manual audition must produce audible output NOW, not sit through the
  // four-second initial fade or silently do nothing during normal playback.
  const seek=()=>{
    try{track.currentTime=Math.min(8,Math.max(0,track.duration-10));}
    catch{/* The stream is not seekable on this browser yet. */}
    updateMusicVolume();
  };
  if(track.readyState>=1)seek();
  else track.addEventListener('loadedmetadata',seek,{once:true});
  void track.play().then(()=>{
    musicBlocked=false;
    updateMusicVolume();
    publishPlayback();
  }).catch(()=>{
    musicBlocked=true;
    publishPlayback();
  });
  publishPlayback();
}
// An effects-volume slider would otherwise produce no audible feedback until
// a later unrelated button click. Keep the preview explicitly user-initiated.
export async function previewPallEffect(){
  unlock();
  if(!sceneActive||!settings.enabled||settings.sfxVolume<=0)return;
  const file='UI_ClickMain.wav';
  // Test click must audition even on a cold page load. Normal in-world
  // interaction still refuses to fire late while its clip is loading.
  prepareSoundEffects();
  if(!sfxBuffers.has(file))await sfxLoading.get(file);
  if(sfxBuffers.has(file))playFile(file,1);
  else publishPlayback(); // Diagnostic text identifies a missing/invalid WAV.
}
function playFile(filename:string,gain=1,delaySeconds=0){
  if(typeof window==='undefined'||!settings.enabled||!unlocked||settings.sfxVolume<=0)return;
  const context=sfxContext;
  const buffer=sfxBuffers.get(filename);
  // Do not emit a sound hundreds of milliseconds late while a file loads.
  // Subsequent clicks play immediately once the preload completes.
  if(!context||!buffer||activeSources.size>=7)return;
  if(context.state==='suspended')void context.resume().catch(()=>{});
  try{
    const source=context.createBufferSource();
    const volume=context.createGain();
    source.buffer=buffer;
    volume.gain.value=clamp(settings.sfxVolume*gain,0,1);
    source.connect(volume);
    volume.connect(context.destination);
    activeSources.add(source);
    source.addEventListener('ended',()=>{
      activeSources.delete(source);
      source.disconnect();
      volume.disconnect();
    },{once:true});
    // UI_Click02 has ~80 ms of initial silence. Skip that idle pre-roll
    // in the playback buffer without altering the owner's original WAV.
    const offset=filename==='UI_Click02.wav'?Math.min(0.075,buffer.duration*0.5):0;
    if(delaySeconds>0)source.start(context.currentTime+delaySeconds,offset);
    else source.start(0,offset);
  }catch{
    // Browsers without a functional audio output remain fully usable.
  }
}
export function playUiClick(){
  if(typeof performance==='undefined')return;
  const now=performance.now();
  if(now-lastClickAt<55)return;
  lastClickAt=now;
  const value=Math.random()*100;
  let offset=0;
  for(const choice of clickVariants){
    offset+=choice.weight;
    if(value<offset){playFile(choice.file,choice.gain);return;}
  }
}
/** Paired owner samples for one confirmed incoming or outgoing payment.
 * Scheduling on AudioContext survives scene-navigation callback disposal. */
export function playCoinTransactionSfx(){
  if(!sceneActive||!settings.enabled||settings.sfxVolume<=0)return;
  playFile(coinSfxFiles[0],0.65);
  playFile(coinSfxFiles[1],0.48,0.12);
}
export function playPaperSfx(){
  const index=Math.floor(Math.random()*paperVariants.length);
  // The revised second paper clip is about 6 dB stronger at peak than
  // the first. Match the owner's new samples without normalizing files.
  playFile(paperVariants[index],index===0?0.65:0.47);
}
/** Use on workshop entry and after server-confirmed smithing actions.
 * Never play a physical-action cue for a failed work request. */
export function playSmithingSfx(){
  const choice=Math.floor(Math.random()*smithVariants.length);
  playFile(smithVariants[choice],choice===0?0.9:0.42);
}

/** Call from the mounted combat route. A scene claim prevents other chapter
 * views from downloading or accidentally playing Flint's combat effects. */
export function claimCombatSfx():()=>void {
  const owner=Symbol('combat-sfx');
  combatSfxOwners.add(owner);
  prepareSoundEffects(combatSfxFiles);
  return ()=>{combatSfxOwners.delete(owner);};
}

/** Browser-only cue; the caller must have a successful server turn result.
 * Playback is always subject to the existing global mute and volume. */
export function playCombatSfx(cue:CombatSfxCue):void {
  if(combatSfxOwners.size===0||!sceneActive||
     typeof document==='undefined'||document.hidden)return;
  switch(cue){
    case 'hit':
      playFile(combatHits[Math.floor(Math.random()*combatHits.length)],0.75);break;
    case 'maleGrunt':
      playFile(combatGrunts[Math.floor(Math.random()*combatGrunts.length)],0.58);break;
    case 'maleLowStamina':
      playFile('combat/male-low-stamina.mp3',0.56);break;
    case 'reposition':
      playFile('combat/reposition.mp3',0.65);break;
    case 'guard':
      playFile('combat/guard.mp3',0.70);break;
    case 'fightFinished':
      playFile('combat/fight-finished.mp3',0.84);break;
  }
}
export function setPallAudioSettings(next:Partial<PallAudioSettings>){
  settings={
    enabled:typeof next.enabled==='boolean'?next.enabled:settings.enabled,
    musicVolume:typeof next.musicVolume==='number'&&Number.isFinite(next.musicVolume)
      ?clamp(next.musicVolume,0,MAX_MUSIC_VOLUME):settings.musicVolume,
    ambienceVolume:typeof next.ambienceVolume==='number'&&Number.isFinite(next.ambienceVolume)
      ?clamp(next.ambienceVolume,0,1):settings.ambienceVolume,
    sfxVolume:typeof next.sfxVolume==='number'&&Number.isFinite(next.sfxVolume)
      ?clamp(next.sfxVolume,0,1):settings.sfxVolume
  };
  pallAudioSettings.set({...settings});
  if(typeof window==='undefined')return;
  try{window.localStorage.setItem(KEY,JSON.stringify(settings));}catch{/* Browsing without storage. */}
  if(!settings.enabled){
    stopMusic();
    stopAmbience();
    stopCouncilAmbience();
    stopAlleyTrack();
    stopDepotTrack();
    stopClinicTrack();
    stopSoundEffects();
  }else{
    prepareSoundEffects();
    if(combatSfxOwners.size>0)prepareSoundEffects(combatSfxFiles);
    if(canPlayMusic())startMusic();
    updateMusicVolume();
    updateAmbience();
    updateCouncilAmbience();
    updateAlleyAmbience();
    updateDepotAmbience();
    updateMedicalClinicAmbience();
  }
  publishPlayback();
}
export function setPallAudioScene(active:boolean){
  if(sceneActive===active)return;
  sceneActive=active;
  if(active){
    prepareSoundEffects();
    if(combatSfxOwners.size>0)prepareSoundEffects(combatSfxFiles);
    startMusic();
    updateAmbience();
    updateCouncilAmbience();
    updateAlleyAmbience();
    updateDepotAmbience();
    updateMedicalClinicAmbience();
  }else{
    stopMusic();
    // The incoming stage may render the same painted forge background.
    // Preserve the ambient loop until its new shell can declare the scene.
    deferAmbienceDeparture();
    deferCouncilDeparture();
    deferAlleyDeparture();
    deferDepotDeparture();
    stopSoundEffects();
  }
  publishPlayback();
}
// Unlock at the start of a genuine user gesture, including when dragging a
// range input or using its keyboard arrows. Waiting for the *click* event can
// leave every slider apparently inert and prevent the workshop loop starting.
function gesture(event:Event){
  if(!sceneActive)return;
  if(event.type==='keydown'){
    const k=(event as KeyboardEvent).key;
    if(!['Enter',' ','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Home','End'].includes(k))return;
  }
  unlock();
}
function clicked(event:MouseEvent){
  // Prototype soundscape is scoped to in-game routes; no unexpected noises
  // while browsing the public site or creating an account.
  if(!sceneActive)return;
  // The first user gesture unlocks audio; nothing plays on page load.
  unlock();
  const target=event.target instanceof Element?event.target:null;
  const control=target?.closest('button,a,summary,[role="button"]');
  if(!control || target?.closest('[data-pall-audio-control]'))return;
  if(control.matches(':disabled')||control.getAttribute('aria-disabled')==='true')return;
  const kind=target?.closest('[data-pall-sfx]')?.getAttribute('data-pall-sfx');
  if(kind==='none')return;
  if(kind==='paper')playPaperSfx();
  else if(kind==='smithing')playSmithingSfx();
  else playUiClick();
}
function visible(){
  if(typeof document==='undefined')return;
  if(document.hidden){
    stopMusic();
    stopAmbience();
    stopCouncilAmbience();
    stopAlleyTrack();
    stopDepotTrack();
    stopClinicTrack();
  }else{
    startMusic();
    updateAmbience();
    updateCouncilAmbience();
    updateAlleyAmbience();
    updateDepotAmbience();
    updateMedicalClinicAmbience();
  }
  publishPlayback();
}
/** Install once in SvelteKit's root layout; persists across client navigation. */
export function connectPallAudio(){
  if(typeof window==='undefined'||connected)return()=>{};
  connected=true;
  try{
    const raw=window.localStorage.getItem(KEY);
    if(raw){
      const parsed=JSON.parse(raw) as Partial<PallAudioSettings>;
      // Existing users at the previous default hear the slightly louder mix,
      // while every explicitly different volume preference is preserved.
      const musicVolume=parsed.musicVolume===PREVIOUS_DEFAULT_MUSIC
        ?DEFAULT.musicVolume:parsed.musicVolume;
      setPallAudioSettings({...parsed,musicVolume});
    }else pallAudioSettings.set({...settings});
  }catch{pallAudioSettings.set({...settings});}
  prepareSoundEffects();
  document.addEventListener('pointerdown',gesture,true);
  document.addEventListener('keydown',gesture,true);
  document.addEventListener('click',clicked,true);
  document.addEventListener('visibilitychange',visible);
  publishPlayback();
  return ()=>{
    document.removeEventListener('pointerdown',gesture,true);
    document.removeEventListener('keydown',gesture,true);
    document.removeEventListener('click',clicked,true);
    document.removeEventListener('visibilitychange',visible);
    stopMusic();
    cancelAmbienceDeparture();
    cancelCouncilDeparture();
    cancelAlleyDeparture();
    cancelDepotDeparture();
    stopAmbience(true);
    stopCouncilAmbience(true);
    stopAlleyTrack(true);
    stopDepotTrack(true);
    stopClinicTrack(true);
    ambience=null;
    councilAmbience=null;
    alleyAmbience=null;
    depotAmbience=null;
    clinicAmbience=null;
    activeAmbienceScene=null;
    smithingAmbienceOwners.clear();
    councilAmbienceOwners.clear();
    alleyAmbienceOwners.clear();
    depotAmbienceOwners.clear();
    clinicAmbienceOwners.clear();
    ambienceError=false;
    councilAmbienceError=false;
    alleyAmbienceError=false;
    depotAmbienceError=false;
    clinicAmbienceError=false;
    musicError=false;
    musicBlocked=false;
    ambienceBlocked=false;
    councilAmbienceBlocked=false;
    alleyAmbienceBlocked=false;
    depotAmbienceBlocked=false;
    clinicAmbienceBlocked=false;
    stopSoundEffects();
    sfxBuffers.clear();
    sfxLoading.clear();
    sfxFailures.clear();
    if(sfxContext){
      void sfxContext.close().catch(()=>{});
      sfxContext=null;
    }
    music=null;
    unlocked=false;
    connected=false;
    statusSnapshot='';
    publishPlayback();
  };
}
