<script lang="ts">
  /** Reusable Dispatch House job papers. One native button per object:
   * the artwork, caption and action are a single hit target. Stage 1 may
   * give the Route Sheet its one canonical server-backed take_round action;
   * Stage 2 keeps all three available for optional inspection only.
   */
  type PaperKey='notices'|'sealed'|'route';
  type Paper={label:string;src:string};
  let {papers,onChoose,selected=null,routeReady=false,busy=false}:{
    papers:Record<PaperKey,Paper>;
    onChoose:(key:PaperKey)=>void;
    selected?:PaperKey|null;
    routeReady?:boolean;
    busy?:boolean;
  }=$props();
  const keys=['notices','sealed','route'] as const;
</script>

<section class="round-documents" aria-label="Round documents">
  <h2 class="documents-title">
    <span class="title-mark" aria-hidden="true">▣</span>
    Round Documents
  </h2>
  <div class="document-grid">
    {#each keys as key (key)}
      <button type="button" class="document-card" data-workshop-object data-pall-sfx="paper"
        class:ready={routeReady&&key==='route'} class:selected={selected===key}
        aria-label={routeReady&&key==='route'
          ?'Take the Route Sheet to begin Shift Dispatch'
          :'Inspect '+papers[key].label}
        aria-pressed={routeReady&&key==='route'?undefined:selected===key}
        disabled={busy&&key==='route'&&routeReady}
        onclick={()=>onChoose(key)}>
        <span class="document-image">
          <img src={papers[key].src} alt="" loading="eager" draggable="false"/>
        </span>
        <span class="workshop-object-label document-label">{papers[key].label}</span>
        <span class="document-action">
          <span class="action-mark" aria-hidden="true">{routeReady&&key==='route'?'↗':'⌕'}</span>
          {routeReady&&key==='route'?'Take Route Sheet':'Inspect'}
        </span>
      </button>
    {/each}
  </div>
</section>

<style>
  .round-documents{min-width:0;padding:12px clamp(9px,1.15vw,18px) 16px;
    color:#e8ce9e;
    border-top:2px solid #775137;
    background:linear-gradient(180deg,#201a16 0%,#110f0d 100%)}
  .documents-title{display:flex;align-items:center;gap:9px;margin:0 0 10px;
    color:#ecd2a1;font:700 clamp(15px,1.25vw,19px)/1.3
    var(--pall-font-reading,Georgia,serif)}
  .title-mark{color:#d4a966;font:22px/1 Arial,sans-serif}
  .document-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));
    gap:clamp(6px,.8vw,12px)}
  .document-card{appearance:none;display:flex;flex-direction:column;
    align-items:stretch;min-width:0;min-height:178px;padding:6px;
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
    min-height:0;height:clamp(92px,9vw,145px);width:100%;
    margin-bottom:4px;overflow:hidden}
  .document-image img{max-width:100%;width:100%;height:100%;
    object-fit:contain;filter:drop-shadow(0 3px 4px #080503a8)}
  .document-label{flex:0 0 auto;width:100%;max-width:none;
    min-height:36px;text-transform:capitalize;line-height:1.1}
  .document-action{display:flex;justify-content:center;align-items:center;
    gap:5px;min-height:32px;font:600 clamp(12px,1vw,15px)/1.2
    var(--pall-font-reading,Georgia,serif);color:#dcbc7f}
  .document-card.ready .document-action{color:#ffe1a3}
  .action-mark{font:19px/1 Arial,sans-serif}
  @media(max-width:1180px){
    .document-card{min-height:148px}
    .document-image{height:100px}
    .document-label{font-size:12px}
  }
  @media(max-width:560px){
    .round-documents{padding:10px 7px 13px}
    .document-grid{gap:5px}
    .document-card{padding:4px;min-height:116px}
    .document-image{height:clamp(60px,18vw,83px)}
    .document-label{min-height:30px;font-size:10px}
    .document-action{min-height:26px;font-size:11px}
    .action-mark{font-size:15px}
  }
  @media(prefers-reduced-motion:no-preference){
    .document-card{transition:border-color .14s,background-color .14s}
  }
</style>
