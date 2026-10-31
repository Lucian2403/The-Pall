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
const DEFAULT:PallAudioSettings={enabled:true,musicVolume:0.035,sfxVolume:0.55};
export const pallAudioSettings=writable<PallAudioSettings>({...DEFAULT});

const base='/audio/the-pall/';
const clickVariants=[
  {file:'UI_ClickMain.wav',weight:75,gain:1},
  {file:'UI_Click.wav',weight:15,gain:0.55},
  {file:'UI_Click02.wav',weight:10,gain:0.50}
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
const activeClips=new Set<HTMLAudioElement>();

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
  music.volume=canPlayMusic()?clamp(settings.musicVolume,0,0.12)*envelope:0;
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
  startMusic();
}
function playFile(filename:string,gain=1){
  if(typeof window==='undefined'||!settings.enabled||!unlocked||settings.sfxVolume<=0)return;
  if(activeClips.size>=7)return;
  const audio=new Audio(base+filename);
  audio.volume=clamp(settings.sfxVolume*gain,0,1);
  audio.preload='auto';
  activeClips.add(audio);
  const done=()=>activeClips.delete(audio);
  audio.addEventListener('ended',done,{once:true});
  audio.addEventListener('error',done,{once:true});
  void audio.play().catch(done);
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
  // The second supplied paper clip measures about 7 dB quieter.
  playFile(paperVariants[index],index===0?0.48:0.85);
}
/** Use only after the server acknowledges a physical smithing action. */
export function playSmithingSfx(){
  const choice=Math.floor(Math.random()*smithVariants.length);
  playFile(smithVariants[choice],choice===0?0.9:0.42);
}
export function setPallAudioSettings(next:Partial<PallAudioSettings>){
  settings={
    enabled:typeof next.enabled==='boolean'?next.enabled:settings.enabled,
    musicVolume:typeof next.musicVolume==='number'&&Number.isFinite(next.musicVolume)
      ?clamp(next.musicVolume,0,0.12):settings.musicVolume,
    sfxVolume:typeof next.sfxVolume==='number'&&Number.isFinite(next.sfxVolume)
      ?clamp(next.sfxVolume,0,1):settings.sfxVolume
  };
  pallAudioSettings.set({...settings});
  if(typeof window==='undefined')return;
  try{window.localStorage.setItem(KEY,JSON.stringify(settings));}catch{/* Browsing without storage. */}
  if(!settings.enabled){
    stopMusic();
    for(const clip of activeClips)clip.pause();
    activeClips.clear();
  }else{
    if(canPlayMusic())startMusic();
    updateMusicVolume();
  }
}
export function setPallAudioScene(active:boolean){
  if(sceneActive===active)return;
  sceneActive=active;
  if(active)startMusic();
  else stopMusic();
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
      setPallAudioSettings(parsed);
    }else pallAudioSettings.set({...settings});
  }catch{pallAudioSettings.set({...settings});}
  document.addEventListener('click',clicked,true);
  document.addEventListener('visibilitychange',visible);
  return ()=>{
    document.removeEventListener('click',clicked,true);
    document.removeEventListener('visibilitychange',visible);
    stopMusic();
    for(const clip of activeClips)clip.pause();
    activeClips.clear();
    music=null;
    connected=false;
  };
}
