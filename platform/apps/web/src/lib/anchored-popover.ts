/**
 * One top-layer popover mechanism for every HUD menu (Sound, Notifications,
 * Chat). The panel is promoted to the browser top layer with the Popover API,
 * so sticky strips, scene overlays and stacking contexts can never paint above
 * it. Placement is anchored to its trigger: below by default, flipped above
 * when that side has more room, clamped to the viewport, height-bounded with
 * internal scrolling. Dismisses on Escape (returning focus), outside pointer,
 * focus leaving both elements, and when the trigger scrolls out of view.
 */
export type PopoverDismissReason='escape'|'outside'|'focus'|'detached';

export type AnchoredPopoverOptions={
  trigger:HTMLElement;
  panel:HTMLElement;
  onDismiss:(reason:PopoverDismissReason)=>void;
  onPlacement?:(placement:'below'|'above')=>void;
  gap?:number;
  edge?:number;
  minHeight?:number;
};

export function openAnchoredPopover({
  trigger,panel,onDismiss,onPlacement,gap=6,edge=8,minHeight=140
}:AnchoredPopoverOptions):()=>void{
  if(typeof panel.showPopover==='function'&&!panel.matches(':popover-open')){
    panel.showPopover();
  }
  let dismissed=false;
  const dismiss=(reason:PopoverDismissReason)=>{
    if(dismissed)return;
    dismissed=true;
    onDismiss(reason);
  };
  const position=()=>{
    if(dismissed)return;
    const anchor=trigger.getBoundingClientRect();
    const viewportWidth=document.documentElement.clientWidth;
    const viewportHeight=window.innerHeight;
    if(anchor.bottom<0||anchor.top>viewportHeight){dismiss('detached');return;}
    // scrollHeight reports the full content height even while max-height
    // constrains the panel, so internal scroll position is never reset.
    const natural=panel.scrollHeight;
    const below=viewportHeight-anchor.bottom-gap-edge;
    const above=anchor.top-gap-edge;
    const flip=natural>below&&above>below;
    const space=Math.max(minHeight,flip?above:below);
    const height=Math.min(natural,space);
    panel.style.maxHeight=space+'px';
    const width=panel.offsetWidth;
    const left=Math.max(edge,Math.min(anchor.right-width,viewportWidth-width-edge));
    panel.style.left=left+'px';
    panel.style.top=(flip?Math.max(edge,anchor.top-gap-height):anchor.bottom+gap)+'px';
    onPlacement?.(flip?'above':'below');
  };
  const scrolled=(event:Event)=>{
    if(event.target instanceof Node&&panel.contains(event.target))return;
    position();
  };
  const outside=(event:PointerEvent)=>{
    const target=event.target as Node|null;
    if(target&&(panel.contains(target)||trigger.contains(target)))return;
    dismiss('outside');
  };
  const keydown=(event:KeyboardEvent)=>{
    if(event.key!=='Escape')return;
    event.preventDefault();
    dismiss('escape');
    trigger.focus();
  };
  // Only a real focus move elsewhere closes the menu; clicking plain text
  // inside the panel blurs with relatedTarget null and must keep it open.
  const focusout=(event:FocusEvent)=>{
    const next=event.relatedTarget as Node|null;
    if(next&&!panel.contains(next)&&!trigger.contains(next))dismiss('focus');
  };
  const observer=new ResizeObserver(position);
  observer.observe(panel);
  window.addEventListener('resize',position);
  window.addEventListener('scroll',scrolled,true);
  document.addEventListener('pointerdown',outside,true);
  document.addEventListener('keydown',keydown);
  panel.addEventListener('focusout',focusout);
  trigger.addEventListener('focusout',focusout);
  position();
  return ()=>{
    dismissed=true;
    observer.disconnect();
    window.removeEventListener('resize',position);
    window.removeEventListener('scroll',scrolled,true);
    document.removeEventListener('pointerdown',outside,true);
    document.removeEventListener('keydown',keydown);
    panel.removeEventListener('focusout',focusout);
    trigger.removeEventListener('focusout',focusout);
    if(typeof panel.hidePopover==='function'&&panel.isConnected&&panel.matches(':popover-open')){
      panel.hidePopover();
    }
  };
}
