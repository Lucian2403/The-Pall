import {pallAudioSettings} from './pall-audio';
import {cityMapAssets as assets} from './city-map-assets';
/** One map-owned loop. Sequential fades prevent simultaneous ambience loops.
 * Global settings, user gestures, visibility and unmount all reconcile it. */
export function createCityMapAudio(){
 let mode:'city'|'walking'|null=null;
 let track:HTMLAudioElement|null=null,source='',generation=0,unlocked=false,disposed=false;
 let settings={enabled:false,ambienceVolume:0};
 const failed=new Set<string>();
 let frame=0;
 function stop(){cancelAnimationFrame(frame);if(track){track.pause();track.removeAttribute('src');track.load();}track=null;source='';}
 function fade(audio:HTMLAudioElement,target:number,token:number,done:()=>void){
  cancelAnimationFrame(frame);const from=audio.volume,start=performance.now();
  const step=(now:number)=>{if(token!==generation||disposed)return;
   const t=Math.min(1,(now-start)/Math.max(1,assets.fadeMs));
   audio.volume=Math.min(1,Math.max(0,from+(target-from)*t));
   if(t<1)frame=requestAnimationFrame(step);else done();
  };
  frame=requestAnimationFrame(step);
 }
 function sync(){
  const token=++generation;
  const next=assets.enableAmbience&&settings.enabled&&settings.ambienceVolume>0&&unlocked&&!document.hidden&&mode
   ?(mode==='city'?assets.cityAmbience:assets.walkingAmbience):'';
  if(!next||failed.has(next)){stop();return;}
  if(source===next&&track){
   const audio=track;void audio.play().catch(()=>{});fade(audio,settings.ambienceVolume,token,()=>{});return;
  }
  const begin=()=>{
   if(token!==generation||disposed)return;
   stop();const audio=new Audio(next);track=audio;source=next;audio.loop=true;audio.volume=0;
   audio.addEventListener('error',()=>{failed.add(next);if(track===audio)stop();},{once:true});
   void audio.play().then(()=>{if(token===generation)fade(audio,settings.ambienceVolume,token,()=>{});}).catch(()=>{});
  };
  if(track)fade(track,0,token,begin);else begin();
 }
 const unsubscribe=pallAudioSettings.subscribe(value=>{settings=value;sync();});
 const unlock=()=>{unlocked=true;sync();};
 document.addEventListener('pointerdown',unlock,true);document.addEventListener('keydown',unlock,true);
 document.addEventListener('visibilitychange',sync);
 return {set(next:'city'|'walking'|null){if(mode!==next){mode=next;sync();}},dispose(){
  disposed=true;generation++;unsubscribe();document.removeEventListener('pointerdown',unlock,true);
  document.removeEventListener('keydown',unlock,true);document.removeEventListener('visibilitychange',sync);stop();
 }};
}
