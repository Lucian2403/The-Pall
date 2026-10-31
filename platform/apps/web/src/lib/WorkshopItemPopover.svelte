<script lang="ts">
  import {onMount} from 'svelte';
  import type {Snippet} from 'svelte';

  type WorkshopObjectKey='stamps'|'plates'|'paper'|'hammer';

  let {itemKey,title,description,onClose,children}:{
    itemKey:WorkshopObjectKey;
    title:string;
    description:string;
    onClose:()=>void;
    children?:Snippet;
  }=$props();

  let panel:HTMLElement|undefined;

  // Non-modal CRPG inspection: selecting another object switches the card.
  // A click anywhere else dismisses it without affecting the clicked action.
  function outside(event:PointerEvent){
    const target=event.target;
    if(!(target instanceof Node)||panel?.contains(target))return;
    if(target instanceof Element&&target.closest('[data-workshop-object]'))return;
    onClose();
  }
  function keydown(event:KeyboardEvent){
    if(event.key!=='Escape')return;
    event.preventDefault();
    event.stopPropagation();
    onClose();
  }

  onMount(()=>{
    document.addEventListener('pointerdown',outside,true);
    document.addEventListener('keydown',keydown);
    return ()=>{
      document.removeEventListener('pointerdown',outside,true);
      document.removeEventListener('keydown',keydown);
    };
  });
</script>

<aside bind:this={panel} class="workshop-inspection {itemKey}"
  role="region" aria-label={title+' inspection'} aria-live="polite">
  <div class="inspection-heading">
    <strong>{title}</strong>
    <button class="inspection-close" type="button" aria-label={'Close '+title+' inspection'}
      onclick={onClose}>×</button>
  </div>
  <p class="inspection-copy">{description}</p>
  {#if children}
    <div class="inspection-content">{@render children()}</div>
  {/if}
</aside>

<style>
  /* Shared by Stage 1 and Stage 2. Frame art is the owner's original
     transparent nine-slice dialogue surface, not a new unrelated panel. */
  .workshop-inspection{
    position:absolute;z-index:8;
    box-sizing:border-box;
    width:min(375px,calc(100% - 20px));
    bottom:40%;
    max-height:57%;
    overflow-y:auto;
    overscroll-behavior:contain;
    padding:7px 10px 10px;
    border:solid transparent;
    border-width:21px 23px 19px;
    border-image-source:url('/ui-kit/frames/dialogue-frame-trim.png');
    border-image-slice:145 190 125 190 fill;
    border-image-width:21px 23px 19px;
    border-image-repeat:stretch;
    background:transparent;
    color:#301f12;
    text-shadow:none;
    box-shadow:0 8px 20px #090604ba;
    font-family:var(--pall-font-reading,Georgia,serif);
  }
  .workshop-inspection.stamps{left:2%}
  .workshop-inspection.plates{left:25%}
  .workshop-inspection.paper{right:13%}
  .workshop-inspection.hammer{right:2%}
  .inspection-heading{display:flex;align-items:start;justify-content:space-between;gap:8px}
  .inspection-heading strong{
    padding-top:3px;
    color:#34210f;
    font:700 19px/1.25 var(--pall-font-reading,Georgia,serif);
  }
  .inspection-close{
    display:inline-flex;align-items:center;justify-content:center;
    flex:none;width:29px;height:29px;padding:0;
    border:1px solid #9a744b;background:#e4d0ad;
    color:#4c2b18;font:22px/1 var(--pall-font-reading,Georgia,serif);
    cursor:pointer;
  }
  .inspection-close:hover{background:#f4dfb9;border-color:#6b4324}
  .inspection-close:focus-visible{outline:2px solid #6c4720;outline-offset:2px}
  .inspection-copy{
    margin:7px 0 0;
    color:#332216;
    font:500 15px/1.45 var(--pall-font-reading,Georgia,serif);
  }
  .inspection-content{margin-top:9px;padding-top:8px;border-top:1px solid #b59872}
  .inspection-content:empty{display:none}
  @media(max-width:700px){
    .workshop-inspection{
      left:8px!important;right:8px!important;width:auto;
      bottom:32%;max-height:66%;
      border-width:17px 19px 16px;
      border-image-width:17px 19px 16px;
      padding:5px 7px 8px;
    }
    .inspection-heading strong{font-size:17px}
    .inspection-copy{font-size:13px;line-height:1.4}
  }
  @media(max-width:380px){
    .workshop-inspection{bottom:30%;max-height:70%}
  }
</style>
