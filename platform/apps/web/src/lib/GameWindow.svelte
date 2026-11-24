<script lang="ts">
 import {onMount,tick} from 'svelte';
 import type {Snippet} from 'svelte';
 import type {GameWindowRecord} from './game-window-state';
 import {positionGameWindow,frontGameWindow} from './game-window-state';
 let {record,title,children,onClose,mobileHidden=false}:{
  record:GameWindowRecord;title:string;children:Snippet;onClose:()=>void;
  mobileHidden?:boolean;
 }=$props();
 let header:HTMLButtonElement;
 let drag:{pointer:number;x:number;y:number;left:number;top:number}|null=null;
 const bounds=()=>{
  const width=window.innerWidth,height=window.innerHeight;
  return {x:Math.max(8,width-record.width-8),y:Math.max(8,height-60)};
 };
 const clamp=(x:number,y:number)=>{
  const limit=bounds();
  positionGameWindow(record.id,
   Math.min(Math.max(8,Math.round(x)),limit.x),
   Math.min(Math.max(8,Math.round(y)),limit.y));
 };
 function start(event:PointerEvent){
  if(event.button!==0)return;
  frontGameWindow(record.id);
  if(window.matchMedia('(max-width:700px)').matches)return;
  drag={pointer:event.pointerId,x:event.clientX,y:event.clientY,left:record.x,top:record.y};
  header.setPointerCapture(event.pointerId);
 }
 function move(event:PointerEvent){
  if(!drag||drag.pointer!==event.pointerId)return;
  clamp(drag.left+event.clientX-drag.x,drag.top+event.clientY-drag.y);
 }
 function stop(event:PointerEvent){
  if(drag?.pointer!==event.pointerId)return;
  drag=null;
  if(header.hasPointerCapture(event.pointerId))header.releasePointerCapture(event.pointerId);
 }
 function keyboard(event:KeyboardEvent){
  if(event.altKey&&['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key)){
   event.preventDefault();
   const dx=event.key==='ArrowLeft'?-16:event.key==='ArrowRight'?16:0;
   const dy=event.key==='ArrowUp'?-16:event.key==='ArrowDown'?16:0;
   clamp(record.x+dx,record.y+dy);
  }
 }
 function fit(){clamp(record.x,record.y);}
 onMount(async()=>{
  await tick();
  fit();
  header?.focus({preventScroll:true});
 });
</script>
<svelte:window onresize={fit}/>
<section class="game-window" class:mobile-hidden={mobileHidden}
  id={'game-window-'+(record.kind==='inventory'?'inventory':'storage-home-chest')}
  data-game-window={record.id} aria-label={title}
  style={'left:'+record.x+'px;top:'+record.y+'px;width:'+record.width+'px;z-index:'+(620+record.z)}
  onpointerdown={()=>frontGameWindow(record.id)}
  onfocusin={()=>frontGameWindow(record.id)}>
 <header class="game-window-title">
   <button type="button" class="window-grip" bind:this={header}
     aria-label={'Move '+title+'; hold Alt and arrow keys to move'}
     onpointerdown={start} onpointermove={move} onpointerup={stop}
     onpointercancel={stop} onkeydown={keyboard}
     onclick={()=>frontGameWindow(record.id)}>
     <strong>{title}</strong>
     <span class="drag-note">Move</span>
   </button>
   <button type="button" class="close-window" aria-label={'Close '+title}
     onclick={onClose}>×</button>
 </header>
 <div class="game-window-content">
  {@render children()}
 </div>
</section>
<style>
 .game-window{position:fixed;max-width:calc(100vw - 16px);max-height:calc(100dvh - 16px);
  display:flex;flex-direction:column;overflow:hidden;pointer-events:auto;
  background:#211c19;border:1px solid #90704b;box-shadow:0 12px 34px #000d,0 0 0 1px #130e0b;
  color:#e9d7b7;font:14px/1.45 var(--pall-font-reading,Georgia,serif)}
 .game-window:focus-within{border-color:#c19c65}
 .game-window-title{display:flex;align-items:center;gap:10px;flex:none;min-height:44px;
  padding:4px 6px 4px 13px;border-bottom:1px solid #826440;background:#30251c;
  color:#eed2a5;user-select:none;touch-action:none;cursor:grab}
 .window-grip{appearance:none;border:0;background:transparent;color:inherit;
  display:flex;align-items:center;gap:10px;flex:1;min-width:0;
  min-height:38px;text-align:left;cursor:grab;touch-action:none}
 .window-grip:active{cursor:grabbing}
 .window-grip:focus-visible{outline:2px solid #efd092;outline-offset:-3px}
 .game-window-title strong{font:600 17px var(--pall-font-reading,Georgia,serif)}
 .drag-note{font:11px var(--pall-font-label,Arial,sans-serif);color:#ae987b;margin-left:auto}
 .close-window{width:36px;height:34px;border:1px solid #816448;background:#473325;
  color:#f1d9b0;font-size:22px;cursor:pointer}
 .close-window:focus-visible,.close-window:hover{outline:2px solid #d8b57b}
 .game-window-content{min-height:0;overflow-y:auto;overscroll-behavior:contain;padding:12px}
 @media(max-width:700px){
  .game-window{inset:52px 6px 6px!important;width:auto!important;max-width:none;
   max-height:none;border-radius:0}
  .game-window.mobile-hidden{display:none}
  .drag-note{display:none}
  .game-window-content{padding:10px}
 }
</style>
