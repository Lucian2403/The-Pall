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
  ambience:'Workshop only',
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
let musicError=false;
let ambienceError=false;
let musicBlocked=false;
let ambienceBlocked=false;
let statusSnapshot='';
// A workshop scene claims the soundscape for as long as its illustration
// is visible. Ownership is independent of URL so non-workshop pages stay silent.
const smithingAmbienceOwners=new Set<symbol>();
// SvelteKit briefly unmounts the old stage while the next stage loads.
// Do not replay the 115-second forge recording from its beginning each time.
const WORKSHOP_TRANSITION_GRACE_MS=2400;
let ambienceDepartureTimer:ReturnType<typeof setTimeout>|null=null;
let nextMusicTimer:ReturnType<typeof setTimeout>|null=null;
let lastClickAt=0;

// Short effects are fully fetched and decoded as soon as an in-game scene
// becomes active. Creating a new HTMLAudioElement for each click used to
// incur observable network/decode/startup latency (roughly 300–500 ms).
// Keep the long theme streamed through HTMLAudioElement; only tiny SFX are
// predecoded into Web Audio buffers.
const sfxFiles=[
  ...clickVariants.map(variant=>variant.file),
  ...paperVariants,
  ...smithVariants
];
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
  const ambienceState=unavailable??(settings.ambienceVolume===0?'Off'
    :smithingAmbienceOwners.size===0?'Workshop only'
    :ambienceError?'File unavailable'
    :!unlocked?'Click to start'
    :ambienceBlocked?'Playback blocked — click to retry'
    :ambience&&!ambience.paused?'Playing':'Loading');
  const effectsState=unavailable??(settings.sfxVolume===0?'Off'
    :sfxFailures.size>0?'Sound file unavailable'
    :sfxBuffers.size===sfxFiles.length?'Ready'
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

function prepareSoundEffects(){
  if(!sceneActive||!settings.enabled||typeof window==='undefined')return;
  const context=ensureSfxContext();
  if(!context)return;
  // The seven WAVs are small. Fetch and decode once, well before the player
  // interacts, rather than making the first call to play() load a new file.
  for(const filename of sfxFiles){
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
    smithingAmbienceOwners.size>0 && !document.hidden;
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
/** A confirmed non-forge background must stop the loop immediately. */
export function stopSmithingWorkshopAmbience(){
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
    if(smithingAmbienceOwners.size===0)deferAmbienceDeparture();
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
function playFile(filename:string,gain=1){
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
    source.start(0,offset);
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
    stopSoundEffects();
  }else{
    prepareSoundEffects();
    if(canPlayMusic())startMusic();
    updateMusicVolume();
    updateAmbience();
  }
  publishPlayback();
}
export function setPallAudioScene(active:boolean){
  if(sceneActive===active)return;
  sceneActive=active;
  if(active){
    prepareSoundEffects();
    startMusic();
    updateAmbience();
  }else{
    stopMusic();
    // The incoming stage may render the same painted forge background.
    // Preserve the ambient loop until its new shell can declare the scene.
    deferAmbienceDeparture();
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
  }else{
    startMusic();
    updateAmbience();
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
    stopAmbience(true);
    ambience=null;
    ambienceError=false;
    musicError=false;
    musicBlocked=false;
    ambienceBlocked=false;
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
