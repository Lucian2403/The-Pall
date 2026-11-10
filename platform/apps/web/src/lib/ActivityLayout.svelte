<script lang="ts" module>
  /**
   * scene      — illustrated location/NPC is the anchor; dialogue/decisions and
   *              contextual documents share the adjacent reading column.
   *              Narrow: stage → panel → supplement (art, dialogue, documents).
   * workspace  — encounter / bench / expedition board gets the area; tools,
   *              abilities, log or supplies beside it only when the stage keeps
   *              a viable width, otherwise below. Narrow: stage → panel.
   * management — tables, lists, slots and prices dominate; a details/filter
   *              panel sits beside (start side), stacked first when narrow.
   */
  export type ActivityMode='scene'|'workspace'|'management';
</script>

<script lang="ts">
  import type {Snippet} from 'svelte';
  let {
    mode,stage,panel,supplement,stageAspect,
    class:className='',stageClass='',panelClass='',supplementClass=''
  }:{
    mode:ActivityMode;
    /** Primary region: scene art, battlefield, bench or the main table. */
    stage:Snippet;
    /** Adjacent reading/tool/detail region. */
    panel?:Snippet;
    /** Secondary region that belongs with the stage (e.g. document cards). */
    supplement?:Snippet;
    /** Width/height of fixed-ratio stage art. When given, the stage is sized so
        art + supplement fit the first viewport before the page needs to scroll. */
    stageAspect?:number;
    class?:string;
    stageClass?:string;
    panelClass?:string;
    supplementClass?:string;
  }=$props();

  let host=$state<HTMLDivElement>();
  let stageBox=$state<HTMLDivElement>();
  let supplementBox=$state<HTMLDivElement>();
  let stageFit=$state<number|null>(null);

  // Measured, not guessed: the real document offset of this layout (HUD,
  // banner, sticky row, errors) and, when the supplement really sits under
  // the stage in the same column, its real height.
  $effect(()=>{
    if(!host||!stageAspect)return;
    const layout=host.firstElementChild as HTMLElement|null;
    if(!layout)return;
    let raf=0;
    const measure=()=>{
      cancelAnimationFrame(raf);
      raf=requestAnimationFrame(()=>{
        if(!host)return;
        const style=getComputedStyle(layout);
        const padding=parseFloat(style.paddingTop)+parseFloat(style.paddingBottom);
        const gap=parseFloat(style.rowGap)||0;
        const top=host.getBoundingClientRect().top+window.scrollY;
        let reserve=0;
        if(supplementBox&&stageBox){
          const s=stageBox.getBoundingClientRect();
          const extra=supplementBox.getBoundingClientRect();
          if(extra.left<s.right-1&&extra.right>s.left+1)reserve=extra.height+gap;
        }
        const next=Math.max(0,Math.floor((window.innerHeight-top-padding-reserve)*stageAspect));
        if(stageFit===null||Math.abs(next-stageFit)>2)stageFit=next;
      });
    };
    measure();
    const observer=new ResizeObserver(measure);
    observer.observe(document.body);
    if(supplementBox)observer.observe(supplementBox);
    window.addEventListener('resize',measure);
    return ()=>{
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener('resize',measure);
    };
  });
</script>

<div class="activity-host" bind:this={host}
  style:--stage-fit={stageFit===null?undefined:stageFit+'px'}>
  <div class={'activity-layout '+className} data-activity-mode={mode}>
    {#if mode==='management'&&panel}
      <div class={'activity-panel '+panelClass}>{@render panel()}</div>
    {/if}
    <div class={'activity-stage '+stageClass} bind:this={stageBox}>{@render stage()}</div>
    {#if mode!=='management'&&panel}
      <div class={'activity-panel '+panelClass}>{@render panel()}</div>
    {/if}
    {#if supplement}
      <div class={'activity-supplement '+supplementClass} bind:this={supplementBox}>{@render supplement()}</div>
    {/if}
  </div>
</div>

<style>
  /* The host is the size container: column decisions follow the space the
     activity really has after rail, dock and padding — never the window. */
  .activity-host{container:activity / inline-size;width:100%;min-width:0}
  /* Activities may tune spacing by setting --activity-gap / --activity-padding
     on an ancestor (e.g. a full-bleed battlefield uses 0). */
  .activity-layout{
    --gap:var(--activity-gap,clamp(6px,.7vw,12px));
    display:grid;grid-template-columns:minmax(0,1fr);
    grid-template-areas:"stage" "panel" "supplement";
    align-items:start;gap:var(--gap);
    width:100%;min-width:0;padding:var(--activity-padding,clamp(5px,.65vw,10px));
    box-sizing:border-box;
  }
  /* Regions are containers too, so their contents adapt to the slot they
     were given (beside or below) rather than to the viewport. */
  .activity-stage{grid-area:stage;container:activity-stage / inline-size;min-width:0}
  .activity-panel{grid-area:panel;container:activity-panel / inline-size;min-width:0}
  .activity-supplement{grid-area:supplement;container:activity-supplement / inline-size;min-width:0}
  .activity-layout[data-activity-mode="management"]{grid-template-areas:"panel" "stage" "supplement"}

  /* SCENE: two columns once the art keeps >=460px and the reading panel
     >=380px (measured: nine-slice frame + ~32 characters of 18px text).
     The art spans the left; dialogue and its contextual documents share the
     adjacent reading column, so neither column is padded to match the other.
     The art grows to the measured first-viewport fit while the reading column
     keeps a preferred 30% (380–560px) and never exceeds 44%; any width left
     over (ultrawide, or a short window that limits the art) is split into
     symmetrical gutters instead of an empty strip on one side. */
  @container activity (min-width:880px){
    .activity-layout[data-activity-mode="scene"]{
      --stage-min:460px;--panel-min:380px;--panel-max:min(860px,44%);
      --panel-pref:clamp(var(--panel-min),30%,560px);
      --stage-w:min(calc(100% - var(--panel-pref) - var(--gap)),
        max(var(--stage-min),var(--stage-fit,62%)));
      grid-template-columns:var(--stage-w) minmax(var(--panel-min),var(--panel-max));
      grid-template-rows:auto 1fr;
      grid-template-areas:"stage panel" "stage supplement";
      justify-content:center;
    }
  }
  /* WORKSPACE: tools move beside the stage only when the stage still keeps
     >=1000px (the widest geometry existing encounter overlays were tuned at). */
  @container activity (min-width:1480px){
    .activity-layout[data-activity-mode="workspace"]{
      grid-template-columns:minmax(0,1fr) clamp(360px,26%,460px);
      grid-template-areas:"stage panel" "supplement panel";
      grid-template-rows:auto 1fr;
    }
  }
  /* MANAGEMENT: details/filters panel beside the dominant list or table. */
  @container activity (min-width:760px){
    .activity-layout[data-activity-mode="management"]{
      grid-template-columns:clamp(230px,28%,340px) minmax(0,1fr);
      grid-template-areas:"panel stage" "panel supplement";
      grid-template-rows:auto 1fr;
    }
  }
</style>
