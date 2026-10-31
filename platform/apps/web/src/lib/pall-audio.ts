import {writable} from 'svelte/store';

/**
 * Browser-only audio prototype. No autoplay and no persistent game mutations.
 * Sound assets belong in static/audio/the-pall (the owner's asset ZIP).
 */
export type PallAudioSettings={
  enabled:boolean;
  musicVolume:number;
  sfxVolume:number;
};
const KEY='the-pall-audio-v1';
const DEFAULT:PallAudioSettings={enabled:true,musicVolume:0.06,sfxVolume:0.55};
const MAX_MUSIC_VOLUME=0.5;
const PREVIOUS_DEFAULT_MUSIC=0.035;
export const pallAudioSettings=writable<PallAudioSettings>({...DEFAULT});

const base='/audio/the-pall/';
const clickVariants=[
  {file:'UI_ClickMain.wav',weight:75,gain:1},
  {file:'UI_Click.wav',weight:15,gain:0.24},
  {file:'UI_Click02.wav',weight:10,gain:0.30}
] as const;
const paperVariants=['UI_PaperJournal.wav','UI_PaperJournal2.wav'] as const;
const smithVariants=['UI-SmithingAction.wav','UI-SmithingAction02.wav'] as const;
const musicFile='music-theme.mp3';
const FADE_IN=4;
const FADE_OUT=5;
const MUSIC_PAUSE_MIN_MS=30_000;
const MUSIC_PAUSE_RANGE_MS=45_000;

let settings={...DEFAULT};
let connected=false;
let sceneActive=false;
let unlocked=false;
let music:HTMLAudioElement|null=null;
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
const activeSources=new Set<AudioBufferSourceNode>();

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
      .then(buffer=>{if(sfxContext===context)sfxBuffers.set(filename,buffer);})
      .catch(()=>{
        // No sound is preferable to a late effect on a failed network load.
        // A later scene activation or sound re-enable may retry.
      })
      .finally(()=>{sfxLoading.delete(filename);});
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
  music.addEventListener('ended',()=>{
    if(!canPlayMusic())return;
    // The supplied 7m27s theme plays in full, then rests before replaying.
    nextMusicTimer=setTimeout(()=>{
      nextMusicTimer=null;
      if(!canPlayMusic()||!music)return;
      music.currentTime=0;
      void music.play().then(updateMusicVolume).catch(()=>{});
    },MUSIC_PAUSE_MIN_MS+Math.random()*MUSIC_PAUSE_RANGE_MS);
  });
  return music;
}
function startMusic(){
  if(!canPlayMusic()||nextMusicTimer!==null)return;
  const track=ensureMusic();
  if(!track.paused)return;
  if(track.ended)track.currentTime=0;
  void track.play().then(updateMusicVolume).catch(()=>{
    // Autoplay-denied browsers simply remain quiet until a later gesture.
  });
}
function stopMusic(){
  clearMusicTimer();
  if(music)music.pause();
}
function unlock(){
  if(unlocked)return;
  unlocked=true; // Invoked synchronously from a real click / keyboard activation.
  // The context may have been created while suspended for decoding. Resume
  // synchronously from this gesture; no await between click and SFX start.
  const context=ensureSfxContext();
  if(context?.state==='suspended')void context.resume().catch(()=>{});
  startMusic();
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
    sfxVolume:typeof next.sfxVolume==='number'&&Number.isFinite(next.sfxVolume)
      ?clamp(next.sfxVolume,0,1):settings.sfxVolume
  };
  pallAudioSettings.set({...settings});
  if(typeof window==='undefined')return;
  try{window.localStorage.setItem(KEY,JSON.stringify(settings));}catch{/* Browsing without storage. */}
  if(!settings.enabled){
    stopMusic();
    stopSoundEffects();
  }else{
    prepareSoundEffects();
    if(canPlayMusic())startMusic();
    updateMusicVolume();
  }
}
export function setPallAudioScene(active:boolean){
  if(sceneActive===active)return;
  sceneActive=active;
  if(active){
    prepareSoundEffects();
    startMusic();
  }else{
    stopMusic();
    stopSoundEffects();
  }
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
  if(document.hidden)stopMusic();
  else startMusic();
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
  document.addEventListener('click',clicked,true);
  document.addEventListener('visibilitychange',visible);
  return ()=>{
    document.removeEventListener('click',clicked,true);
    document.removeEventListener('visibilitychange',visible);
    stopMusic();
    stopSoundEffects();
    sfxBuffers.clear();
    sfxLoading.clear();
    if(sfxContext){
      void sfxContext.close().catch(()=>{});
      sfxContext=null;
    }
    music=null;
    unlocked=false;
    connected=false;
  };
}
