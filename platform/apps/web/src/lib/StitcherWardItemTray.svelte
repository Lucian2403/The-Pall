<script lang="ts">
  import type {StitcherWardItem,StitcherWardItemKey} from '$lib/stitcher-ward-items';
  let {items,activeKeys,selected=null,busy=false,onChoose}:{
    items:readonly StitcherWardItem[];
    activeKeys:readonly StitcherWardItemKey[];
    selected?:StitcherWardItemKey|null;
    busy?:boolean;
    onChoose:(key:StitcherWardItemKey)=>void;
  }=$props();
</script>

<section class="round-documents" aria-label="Ward supplies">
  <h2 class="documents-title">
    <span class="title-mark" aria-hidden="true">▣</span>
    Ward Supplies
  </h2>
  <div class="document-grid">
    {#each items as item (item.key)}
      <button type="button" class="document-card" data-workshop-object
        class:ready={activeKeys.includes(item.key)} class:selected={selected===item.key}
        aria-label={'Inspect '+item.label} aria-pressed={selected===item.key}
        disabled={busy} onclick={()=>onChoose(item.key)}>
        <span class="document-image">
          <img src={item.image} alt="" loading="eager" draggable="false"/>
        </span>
        <span class="workshop-object-label document-label">{item.label}</span>
        <span class="document-action">
          <svg class="action-mark" aria-hidden="true" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="10.5" cy="10.5" r="6.5"/>
            <path d="m16 16 5 5"/>
          </svg>
          Inspect
        </span>
      </button>
    {/each}
  </div>
</section>

<style>
  /* A framed region of its own: under the art on wide containers, after the
     dialogue when stacked. Card sizes follow the tray's width (cqi). */
  .round-documents{container:round-documents / inline-size;min-width:0;
    padding:10px clamp(9px,1.6cqi,18px) 14px;
    color:#e8ce9e;border:1px solid #63452f;border-top:2px solid #775137;
    background:linear-gradient(180deg,#201a16 0%,#110f0d 100%)}
  .documents-title{display:flex;align-items:center;gap:9px;margin:0 0 9px;
    color:#ecd2a1;font:700 clamp(15px,2cqi,19px)/1.3
    var(--pall-font-reading,Georgia,serif)}
  .title-mark{color:#d4a966;font:22px/1 Arial,sans-serif}
  .document-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));
    gap:clamp(6px,1.1cqi,12px)}
  .document-card{appearance:none;display:flex;flex-direction:column;
    align-items:stretch;min-width:0;padding:6px;
    border:1px solid #674731;border-radius:4px;
    background:linear-gradient(160deg,#32281f,#16120e 90%);
    box-shadow:inset 0 1px #81603a66,0 3px 7px #0008;
    color:#ecd6a8;cursor:pointer;text-align:center}
  .document-card:is(:hover,:focus-visible),.document-card.selected{
    border-color:#d5aa69;background:linear-gradient(160deg,#463226,#21170f 90%)}
  .document-card.ready{border-color:#c39450;box-shadow:0 0 0 1px #946b3599,inset 0 1px #e1ba8055}
  .document-card:focus-visible{outline:2px solid #f1d2a0;outline-offset:2px}
  .document-card:disabled{opacity:.6;cursor:wait}
  .document-image{display:flex;align-items:center;justify-content:center;
    min-height:0;height:clamp(64px,12cqi,128px);width:100%;
    margin-bottom:4px;overflow:hidden}
  .document-image img{max-width:100%;width:100%;height:100%;
    object-fit:contain;filter:drop-shadow(0 3px 4px #080503a8)}
  .document-label{flex:0 0 auto;width:100%;max-width:none;
    min-height:34px;text-transform:capitalize;line-height:1.12;
    font-size:clamp(12px,1.7cqi,16px)}
  .document-action{display:flex;justify-content:center;align-items:center;
    gap:5px;min-height:30px;font:600 clamp(12px,1.6cqi,15px)/1.2
    var(--pall-font-reading,Georgia,serif);color:#dcbc7f}
  .document-card.ready .document-action{color:#ffe1a3}
  .action-mark{display:block;flex:none;width:16px;height:16px}
  /* Four cards keep the Bellrunner framing; on the narrower Clinic column,
     use two rows so captions and Inspect affordances remain legible. */
  @container round-documents (max-width:540px){
    .document-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
  }
  @container round-documents (max-width:480px){
    .round-documents{padding:9px 7px 12px}
    .document-grid{gap:5px}
    .document-card{padding:4px}
    .document-label{min-height:30px;font-size:11px}
    .document-action{min-height:28px;font-size:12px}
    .action-mark{width:13px;height:13px}
  }
  @media(prefers-reduced-motion:no-preference){
    .document-card{transition:border-color .14s,background-color .14s}
  }
</style>
