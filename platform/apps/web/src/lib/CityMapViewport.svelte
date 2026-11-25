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
 let failedIcons=$state<Record<string,boolean>>({});
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
  return ()=>{observer.disconnect();viewport.removeEventListener('wheel',wheel);};
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
   <button type="button" aria-label="Zoom in" onclick={()=>zoomAt(zoom*assets.zoomStep)}>+</button>
   <button type="button" aria-label="Zoom out" onclick={()=>zoomAt(zoom/assets.zoomStep)}>−</button>
   <button type="button" onclick={reset}>Reset</button>
   <button type="button" onclick={()=>centre(currentId)}>Player</button>
   {#if dev}<button type="button" aria-pressed={calibrating} onclick={()=>{calibrating=!calibrating;}}>Calibrate</button>{/if}
  </div>
  {#if dev&&calibrating}<output class="coordinates">{coordinate||'Click map for normalized coordinates'}</output>{/if}
 </div>
</div>
<style>
 .map-frame{min-width:0;min-height:0;border:3px double #765538;background:#b59a6d;padding:3px}
 .viewport{position:relative;width:100%;height:100%;min-height:320px;overflow:hidden;touch-action:none;user-select:none;isolation:isolate;background:#c9b287;cursor:grab}
 .viewport:active{cursor:grabbing}.map-art{position:absolute;max-width:none;pointer-events:none;user-select:none}
 .marker{position:absolute;transform:translate(-50%,calc(-100% - 7px));z-index:2;width:44px;height:48px;padding:0;display:grid;place-items:center;color:#f3d9a5;background:#312417;border:2px solid #e6c88e;border-radius:50% 50% 45% 45%;box-shadow:0 2px 5px #412c17aa;cursor:pointer;line-height:1;font:700 25px Georgia,serif}
 .marker::after{content:'';position:absolute;bottom:-7px;left:calc(50% - 5px);width:10px;height:10px;background:inherit;border-right:2px solid #e6c88e;border-bottom:2px solid #e6c88e;transform:rotate(45deg);z-index:-1}
 .marker img{width:32px;height:32px;object-fit:contain;pointer-events:none}
 .marker.unavailable{color:#b9a98d;background:#514535}
 .marker:hover,.marker.selected,.marker:focus-visible{z-index:4;outline:2px solid #e9ac37;outline-offset:3px;color:#ffedb9}
 .marker.selected{background:#543510;box-shadow:0 0 15px #e3a72d}
 .marker.travelling{border-color:#f5a82b}
 .current-dot{position:absolute;right:-4px;top:-3px;border-radius:50%;width:12px;height:12px;background:#53835b;border:2px solid #f4e7bb}
 .map-controls{position:absolute;top:8px;right:8px;z-index:6;display:flex;gap:4px;flex-wrap:wrap;justify-content:flex-end;max-width:calc(100% - 16px)}
 .map-controls button{min-height:40px;min-width:40px;padding:4px 8px;background:#f0d8ac;color:#37271a;border:1px solid #74573a;border-radius:2px;cursor:pointer;font:600 14px Georgia,serif}
 button:focus-visible{outline:2px solid #a26112;outline-offset:2px}
 .coordinates{position:absolute;z-index:7;bottom:8px;left:8px;background:#f5dfb6;color:#362719;padding:8px;font:12px monospace}
 @media(max-width:600px){.viewport{min-height:300px}.marker{width:40px;height:43px;font-size:22px}}
 @media(prefers-reduced-motion:reduce){*{scroll-behavior:auto}}
</style>
