<script lang="ts">
 import {onMount,untrack} from 'svelte';
 import {dev} from '$app/environment';
 import type {CityPointOfInterest} from '@the-pall/game-core';
 import {cityMapAssets as assets} from './city-map-assets';
 let {points,width,height,selectedId,currentId,travelId,onSelect}:{
  points:readonly CityPointOfInterest[];width:number;height:number;selectedId:string;
  currentId:string;travelId:string|null;onSelect:(id:string)=>void
 }=$props();
 let viewport:HTMLDivElement;
 let w=$state(1),h=$state(1),zoom=$state(1),x=$state(0),y=$state(0);
 let fit=$derived(Math.min(w/width,h/height)),scale=$derived(fit*zoom);
 let mapSource=$state<string>(assets.useFinalMap?assets.map:assets.fallbackMap);
 let videoElement:HTMLVideoElement|undefined=$state();
 let videoFailed=$state(false),videoReady=$state(false),motionEnabled=$state(false);
 let pageVisible=$state(true);
 let failedIcons=$state<Record<string,boolean>>({});
 // The video and static artwork always share the exact same camera geometry.
 const showVideo=$derived(assets.useAnimatedMap&&motionEnabled&&pageVisible&&!videoFailed);
 $effect(()=>{
  if(!showVideo||!videoElement){videoReady=false;return;}
  const video=videoElement;
  video.muted=true;
  let active=true;
  void video.play().catch(()=>{if(active){videoFailed=true;videoReady=false;}});
  return ()=>{active=false;video.pause();};
 });
 function toggleAnimation(){
  const retry=videoFailed;videoFailed=false;videoReady=false;motionEnabled=retry||!motionEnabled;
 }

 let artFailed=$state(false),calibrating=$state(false),coordinate=$state('');
 const pointers=new Map<number,{x:number;y:number}>();
 let moved=false, suppressUntil=0;
 const clamp=(v:number,min:number,max:number)=>Math.min(max,Math.max(min,v));
 function constrain(){
  const sw=width*scale,sh=height*scale;
  x=sw<=w?(w-sw)/2:clamp(x,w-sw,0);
  y=sh<=h?(h-sh)/2:clamp(y,h-sh,0);
 }
 function reset(){zoom=1; x=(w-width*fit)/2;y=(h-height*fit)/2;constrain();}
 function zoomAt(next:number,cx=w/2,cy=h/2){
  const old=scale,n=clamp(next,assets.zoomMin,assets.zoomMax);
  const newScale=fit*n;
  x=cx-(cx-x)*newScale/old;y=cy-(cy-y)*newScale/old;zoom=n;constrain();
 }
 function centre(id:string){
  const p=points.find(p=>p.id===id);
  if(p){x=w/2-p.position.x*width*scale;y=h/2-p.position.y*height*scale;constrain();}
 }
 $effect(()=>{const id=selectedId;if(id)untrack(()=>centre(id));});
 onMount(()=>{
  const motion=window.matchMedia('(prefers-reduced-motion: reduce)');
  const syncMotion=()=>{motionEnabled=!motion.matches;};
  const syncVisibility=()=>{pageVisible=!document.hidden;};
  syncMotion();syncVisibility();
  motion.addEventListener('change',syncMotion);
  document.addEventListener('visibilitychange',syncVisibility);
  const observer=new ResizeObserver(([entry])=>{
   const cx=(w/2-x)/(width*scale),cy=(h/2-y)/(height*scale);
   w=Math.max(1,entry.contentRect.width);h=Math.max(1,entry.contentRect.height);
   if(zoom===1)reset();else{x=w/2-cx*width*scale;y=h/2-cy*height*scale;constrain();}
  });
  observer.observe(viewport);
  const wheel=(event:WheelEvent)=>{
   event.preventDefault();const r=viewport.getBoundingClientRect();
   zoomAt(zoom*Math.exp(-event.deltaY*.0015),event.clientX-r.left,event.clientY-r.top);
  };
  viewport.addEventListener('wheel',wheel,{passive:false});
  return ()=>{observer.disconnect();viewport.removeEventListener('wheel',wheel);motion.removeEventListener('change',syncMotion);document.removeEventListener('visibilitychange',syncVisibility);};
 });
 function point(event:PointerEvent){const r=viewport.getBoundingClientRect();return {x:event.clientX-r.left,y:event.clientY-r.top};}
 function down(event:PointerEvent){
  if(event.button!==0)return;
  if((event.target as HTMLElement).closest('.map-controls'))return;
  if(pointers.size===0)moved=false;
  pointers.set(event.pointerId,point(event));
  if(pointers.size>1){moved=true;for(const id of pointers.keys())viewport.setPointerCapture(id);}
 }
 function move(event:PointerEvent){
  const old=pointers.get(event.pointerId);if(!old)return;
  const next=point(event),dx=next.x-old.x,dy=next.y-old.y;
  if(pointers.size===1){
   if(!moved&&Math.hypot(dx,dy)<4)return;
   if(!moved){moved=true;viewport.setPointerCapture(event.pointerId);}
   x+=dx;y+=dy;constrain();
  }else{
   const other=[...pointers.entries()].find(([id])=>id!==event.pointerId)?.[1];
   if(other){
    const before=Math.hypot(old.x-other.x,old.y-other.y),after=Math.hypot(next.x-other.x,next.y-other.y);
    const mx=(old.x+other.x)/2,my=(old.y+other.y)/2;
    if(before>0)zoomAt(zoom*after/before,mx,my);
    x+=dx/2;y+=dy/2;constrain();
   }
  }
  pointers.set(event.pointerId,next);
 }
 function up(event:PointerEvent){
  if(!pointers.has(event.pointerId))return;
  if(moved)suppressUntil=performance.now()+250;
  else if(dev&&calibrating){
   const p=point(event);
   coordinate=JSON.stringify({x:Number(clamp((p.x-x)/(width*scale),0,1).toFixed(4)),y:Number(clamp((p.y-y)/(height*scale),0,1).toFixed(4))});
  }
  pointers.delete(event.pointerId);
  if(viewport.hasPointerCapture(event.pointerId))viewport.releasePointerCapture(event.pointerId);
 }
 function select(event:MouseEvent,id:string){
  if((event.detail!==0&&performance.now()<suppressUntil)||(dev&&calibrating))return;
  onSelect(id);
 }
 function imageError(){if(mapSource!==assets.fallbackMap)mapSource=assets.fallbackMap;else artFailed=true;}
</script>
<div class="map-frame">
 <div class="viewport" bind:this={viewport} role="group" aria-label="Interactive city map"
  onpointerdown={down} onpointermove={move} onpointerup={up} onpointercancel={up} onlostpointercapture={up}>
  {#if !artFailed}<img class="map-art" src={mapSource} alt="" draggable="false" onerror={imageError}
   style:left={x+'px'} style:top={y+'px'} style:width={width*scale+'px'} style:height={height*scale+'px'}/>{/if}
  {#if showVideo}
   <video bind:this={videoElement} class="map-art animated-art" class:ready={videoReady}
    src={assets.video} autoplay loop muted playsinline preload="metadata" aria-hidden="true" tabindex="-1"
    onplaying={()=>{videoReady=true;}} onerror={()=>{videoFailed=true;videoReady=false;}}
    style:left={x+'px'} style:top={y+'px'} style:width={width*scale+'px'} style:height={height*scale+'px'}></video>
  {/if}
  {#each points as p (p.id)}
   <button type="button" class="marker" class:selected={selectedId===p.id} class:current={currentId===p.id}
    class:unavailable={p.availability==='unavailable'} class:travelling={travelId===p.id}
    style:left={x+p.position.x*width*scale+'px'} style:top={y+p.position.y*height*scale+'px'}
    aria-label={p.name+(currentId===p.id?' — current location':'')+(p.availability==='unavailable'?' — unavailable':'')}
    aria-pressed={selectedId===p.id} title={p.name} onclick={(e)=>select(e,p.id)}>
    {#if assets.useFinalIcons&&!failedIcons[p.id]}
     <img src={p.icon} alt="" onerror={()=>{failedIcons={...failedIcons,[p.id]:true};}}/>
    {:else}<span aria-hidden="true">{p.symbol}</span>{/if}
    {#if currentId===p.id}<i class="current-dot" aria-hidden="true"></i>{/if}
   </button>
  {/each}
  <div class="map-controls" aria-label="Map controls">
   <button type="button" aria-label="Zoom in" disabled={zoom>=assets.zoomMax} onclick={()=>zoomAt(zoom*assets.zoomStep)}>+</button>
   <button type="button" aria-label="Zoom out" disabled={zoom<=assets.zoomMin} onclick={()=>zoomAt(zoom/assets.zoomStep)}>−</button>
   <button type="button" onclick={reset}>Reset</button>
   <button type="button" onclick={()=>centre(currentId)}>Player</button>
   {#if assets.useAnimatedMap}<button type="button" aria-pressed={motionEnabled&&!videoFailed} onclick={toggleAnimation}>{videoFailed?'Retry animation':motionEnabled?'Pause animation':'Animate'}</button>{/if}
   {#if dev}<button type="button" aria-pressed={calibrating} onclick={()=>{calibrating=!calibrating;}}>Calibrate</button>{/if}
  </div>
  {#if dev&&calibrating}<output class="coordinates">{coordinate||'Click map for normalized coordinates'}</output>{/if}
 </div>
</div>
<style>
 .map-frame{box-sizing:border-box;min-width:0;min-height:0;border:9px solid transparent;
  border-image:var(--city-frame,url('/ui-kit/city/engraved-frame.svg')) 24 stretch;
  background:var(--city-paper,url('/ui-kit/city/parchment-grain.svg')) repeat,radial-gradient(ellipse,#ebcfa0,#bc9663);
  background-clip:padding-box}
 .viewport{position:relative;width:100%;height:100%;min-height:320px;overflow:hidden;touch-action:none;user-select:none;isolation:isolate;
  background:var(--city-paper,url('/ui-kit/city/parchment-grain.svg')) repeat,radial-gradient(ellipse at 50% 48%,#ecd0a0,#d7b580);
  box-shadow:inset 0 0 22px #6f49282e;cursor:grab}
 .viewport:active{cursor:grabbing}.map-art{position:absolute;max-width:none;pointer-events:none;user-select:none}
 .animated-art{opacity:0;object-fit:fill}.animated-art.ready{opacity:1}
 .marker{position:absolute;transform:translate(-50%,calc(-100% - 7px));z-index:2;width:44px;height:48px;padding:0;display:grid;place-items:center;color:#f3d9a5;background:#312417;border:2px solid #e6c88e;border-radius:50% 50% 45% 45%;box-shadow:0 2px 5px #412c17aa;cursor:pointer;line-height:1;font:700 25px Georgia,serif}
 .marker::after{content:'';position:absolute;bottom:-7px;left:calc(50% - 5px);width:10px;height:10px;background:inherit;border-right:2px solid #e6c88e;border-bottom:2px solid #e6c88e;transform:rotate(45deg);z-index:-1}
 .marker img{width:32px;height:32px;object-fit:contain;pointer-events:none}
 .marker.unavailable{color:#e0c594;background:#352b20}
 .marker:hover,.marker.selected,.marker:focus-visible{z-index:4;outline:2px solid #e9ac37;outline-offset:3px;color:#ffedb9}
 .marker.selected{background:#65401b;border-color:#ffdb80;box-shadow:0 0 0 3px #eab74b66,0 0 18px 5px #e3a72d99}
 .marker.selected::after{border-color:#ffdb80}
 .marker.travelling{border-color:#f5a82b}
 .current-dot{position:absolute;right:-4px;top:-3px;border-radius:50%;width:12px;height:12px;background:#53835b;border:2px solid #f4e7bb}
 .map-controls{position:absolute;top:7px;right:7px;z-index:6;display:flex;gap:5px;flex-wrap:wrap;justify-content:flex-end;max-width:calc(100% - 14px)}
 .map-controls button{box-sizing:border-box;min-height:39px;min-width:38px;padding:5px 8px;
  background:var(--city-paper,url('/ui-kit/city/parchment-grain.svg')) repeat,linear-gradient(#f7e1b9,#dcb985);
  color:#302015;border:1px solid #6c4828;border-radius:4px;
  box-shadow:inset 0 0 0 2px #e2bd85,inset 0 0 0 3px #9d754c,0 2px 4px #39271899;
  cursor:pointer;font:700 14px/1.2 var(--pall-font-reading,Georgia,serif)}
 .map-controls button:hover:not(:disabled){background-color:#f5dbab;box-shadow:inset 0 0 0 2px #f3cf8d,inset 0 0 0 3px #b17b35,0 2px 5px #39271899}
 .map-controls button:active:not(:disabled),.map-controls button[aria-pressed="true"]{box-shadow:inset 0 2px 5px #53391d70,inset 0 0 0 2px #c79b61}
 .map-controls button:disabled{opacity:.6;cursor:default}
 button:focus-visible{outline:2px solid #a26112;outline-offset:2px}
 .coordinates{position:absolute;z-index:7;bottom:8px;left:8px;background:#f5dfb6;color:#362719;padding:8px;font:12px monospace}
 @container (max-width:1000px){.map-frame{height:clamp(420px,60dvh,680px)}}
 @container (max-width:620px){.map-frame{height:clamp(320px,54dvh,460px)}.viewport{min-height:0}.marker{width:40px;height:43px;font-size:22px}.map-controls button{min-height:36px;min-width:33px;padding:4px 6px;font-size:12px}}
 @media(prefers-reduced-motion:reduce){*{scroll-behavior:auto}}
</style>
