<script lang="ts">
  import {CHARACTER_SKILLS} from '$lib/character-skills';

  let {majorSkillBonuses,origin}:{
    majorSkillBonuses:Record<string,number>;
    origin:string;
  }=$props();
  let windowElement:HTMLDialogElement|undefined;
  let dialogPosition=$state({x:100,y:70});
  let dragStart:{x:number;y:number;left:number;top:number}|null=null;

  function displayMajor(major:string){
    const grant=majorSkillBonuses[major];
    // The API stores granted Major Skill levels only, not total XP/level.
    return Number.isFinite(grant)&&grant>0?grant+' / 100':'— / 100';
  }
  // A derived introductory *preview*, not a persisted rank. Roman I-IV are
  // now the proposed tiers; no backend specialization ledger exists yet.
  function specializationLabel(major:string,skill:string){
    return origin==='Millhand'&&(majorSkillBonuses.Craftsmanship??0)>=3&&major==='Craftsmanship'&&skill==='Smithing'
      ? 'I · starting'
      : '—';
  }
  function specializationTitle(major:string,skill:string){
    return origin==='Millhand'&&(majorSkillBonuses.Craftsmanship??0)>=3&&major==='Craftsmanship'&&skill==='Smithing'
      ? 'Starting specialization preview; rank not persisted in the current character API'
      : 'No specialization rank recorded';
  }
  function openWindow(){
    if(!windowElement||windowElement.open)return;
    windowElement.showModal();
    const width=windowElement.getBoundingClientRect().width;
    const height=windowElement.getBoundingClientRect().height;
    dialogPosition={
      x:Math.max(8,Math.round((window.innerWidth-width)/2)),
      y:Math.max(8,Math.round((window.innerHeight-height)/2))
    };
  }
  function dragBegin(event:PointerEvent){
    if(event.button!==0||!windowElement)return;
    const handle=event.currentTarget as HTMLElement;
    dragStart={
      x:event.clientX,y:event.clientY,
      left:dialogPosition.x,top:dialogPosition.y
    };
    handle.setPointerCapture(event.pointerId);
  }
  function dragMove(event:PointerEvent){
    if(!dragStart||!windowElement)return;
    const bounds=windowElement.getBoundingClientRect();
    dialogPosition={
      x:Math.max(0,Math.min(window.innerWidth-Math.min(bounds.width,window.innerWidth),dragStart.left+event.clientX-dragStart.x)),
      y:Math.max(0,Math.min(window.innerHeight-48,dragStart.top+event.clientY-dragStart.y))
    };
  }
  function dragEnd(){dragStart=null}
  function moveKeyboard(event:KeyboardEvent){
    if(!event.altKey||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key))return;
    event.preventDefault();
    const amount=20;
    dialogPosition={
      x:Math.max(0,Math.min(window.innerWidth-100,dialogPosition.x+(event.key==='ArrowLeft'?-amount:event.key==='ArrowRight'?amount:0))),
      y:Math.max(0,Math.min(window.innerHeight-48,dialogPosition.y+(event.key==='ArrowUp'?-amount:event.key==='ArrowDown'?amount:0)))
    };
  }
</script>

<section class="skills-module" aria-label="Major skills and subskills">
  <div class="skills-toolbar">
    <h3>Skills & Specializations</h3>
    <button class="framed-action view-all" type="button" onclick={openWindow}>View all the skills</button>
  </div>
  <div class="skill-accordions">
    {#each CHARACTER_SKILLS as group (group.major)}
      <details class="skill-category">
        <summary>
          <span class="skill-name">{group.major}</span>
          <span class:trained={(majorSkillBonuses[group.major]??0)>0} class="level" title="Recorded Major Skill grant out of the agreed 100-level scale. A dash means no total level is recorded.">
            {displayMajor(group.major)}
          </span>
          <span class="twist" aria-hidden="true">⌄</span>
        </summary>
        <ul class="subskills">
          {#each group.subskills as skill (skill)}
            <li><span>{skill}</span><span class:starting={specializationLabel(group.major,skill)!=='—'} class="tier"
              title={specializationTitle(group.major,skill)}>{specializationLabel(group.major,skill)}</span></li>
          {/each}
        </ul>
      </details>
    {/each}
  </div>
</section>

<dialog bind:this={windowElement} class="skills-window"
  style:left={dialogPosition.x+'px'} style:top={dialogPosition.y+'px'}
  aria-labelledby="all-skills-title">
  <div class="window-top">
    <button class="drag-handle" type="button"
      aria-label="Drag skills window; Alt plus arrow keys also move the window"
      onpointerdown={dragBegin} onpointermove={dragMove}
      onpointerup={dragEnd} onpointercancel={dragEnd}
      onkeydown={moveKeyboard}>
      <span class="grip" aria-hidden="true">⠿</span>
      <span id="all-skills-title">All skills & specializations</span>
    </button>
    <button class="window-close" type="button" aria-label="Close skills window" onclick={()=>windowElement?.close()}>×</button>
  </div>
  <div class="window-body">
    <p class="skill-note">Major Skills: 0–100. Specializations: Roman I–IV (planned). Smithing I on a Millhand is a starting preview, not a saved rank.</p>
    <div class="window-list">
      {#each CHARACTER_SKILLS as group (group.major)}
        <section class="window-skill">
          <h3>{group.major} <span>{displayMajor(group.major)}</span></h3>
          <ul>
            {#each group.subskills as skill (skill)}
              <li><span>{skill}</span><span class:starting={specializationLabel(group.major,skill)!=='—'} class="tier"
                title={specializationTitle(group.major,skill)}>{specializationLabel(group.major,skill)}</span></li>
            {/each}
          </ul>
        </section>
      {/each}
    </div>
  </div>
</dialog>

<style>
  .skills-module{min-width:0}
  .skills-toolbar{
    display:flex;align-items:center;justify-content:space-between;
    gap:10px;flex-wrap:wrap;margin-bottom:15px;
  }
  .skills-toolbar h3{margin:0;color:#efd6b1;font:600 21px/1.25 var(--pall-font-reading,Georgia,serif)}
  .framed-action{
    display:inline-flex;align-items:center;justify-content:center;
    min-height:43px;padding:2px 8px;
    border:solid transparent;border-width:10px 22px 9px;
    border-image-source:url('/ui-kit/buttons/button-normal-trim.png');
    border-image-slice:50 180 45 180 fill;border-image-width:10px 22px 9px;
    background:transparent;color:#2e1a0c;
    font:600 14px/1.3 var(--pall-font-reading,Georgia,serif);cursor:pointer;
  }
  .framed-action:hover{border-image-source:url('/ui-kit/buttons/button-hover-trim.png')}
  .framed-action:active{border-image-source:url('/ui-kit/buttons/button-pressed-trim.png')}
  button:focus-visible,summary:focus-visible{outline:2px solid #f0c38a;outline-offset:3px}
  /* Approved nine-slice dialogue art frames each expandable discipline.
     The paper interior carries dark ink; only the opened list expands. */
  .skill-accordions{
    display:grid;grid-template-columns:repeat(2,minmax(0,1fr));
    gap:11px;align-items:start;
  }
  .skill-category{
    min-width:0;box-sizing:border-box;
    border-style:solid;border-color:transparent;
    border-width:24px 28px 22px;
    border-image-source:url('/ui-kit/frames/dialogue-frame-trim.png');
    border-image-slice:145 190 125 190 fill;
    border-image-width:24px 28px 22px;
    border-image-repeat:stretch;
    border-radius:0;background:transparent;
    color:#29190e;padding:3px 4px 7px;
    box-shadow:0 5px 14px #0006;
  }
  .skill-category[open]{
    box-shadow:0 0 0 1px #b38652,0 7px 18px #0009;
  }
  .skill-category summary{
    display:flex;align-items:center;gap:8px;
    padding:4px 5px;cursor:pointer;list-style:none;
    min-height:32px;color:#2c1c12;
  }
  .skill-category summary:hover{background:#a37a4826}
  .skill-category summary::-webkit-details-marker{display:none}
  .skill-name{
    flex:1;min-width:0;color:#2e1c10;
    font:700 17px/1.27 var(--pall-font-reading,Georgia,serif);
  }
  .level{
    flex:none;color:#664a31;font-variant-numeric:tabular-nums;
    font:700 13px/1.2 var(--pall-font-reading,Georgia,serif);
  }
  .level.trained{color:#684023}
  .twist{color:#694629;font-size:22px;line-height:1;transition:transform .16s ease}
  details[open] .twist{transform:rotate(180deg)}
  .subskills{
    list-style:none;margin:8px 0 0;padding:8px 4px 3px;
    border-top:1px solid #a78661;
  }
  .subskills li,.window-skill li{
    display:flex;align-items:center;justify-content:space-between;gap:12px;
    padding:8px 2px;
    font:600 14px/1.4 var(--pall-font-reading,Georgia,serif);
  }
  .subskills li{border-bottom:1px solid #bca17c;color:#352316}
  .subskills li:last-child,.window-skill li:last-child{border-bottom:0}
  .window-skill ul{list-style:none;margin:0;padding:0}
  .window-skill li{border-bottom:1px solid #594735;color:#e1cfb7}
  .tier{
    flex:none;white-space:nowrap;color:#65492e;
    font:600 12px/1.3 var(--pall-font-reading,Georgia,serif);
    font-variant-numeric:tabular-nums;
  }
  .tier.starting{color:#7b411f;font-weight:700}
  .window-skill .tier{color:#c6ac86}
  .window-skill .tier.starting{color:#f0c88e}
  .skills-window{
    position:fixed;inset:auto;max-width:calc(100vw - 24px);
    width:min(830px,calc(100vw - 24px));max-height:min(84vh,810px);
    overflow:hidden;margin:0;padding:0;
    color:#e7d5b7;background:#241e18;border:2px solid #a67c4e;
    box-shadow:0 25px 85px #000e;
  }
  .skills-window::backdrop{background:#080604bc}
  .window-top{
    display:flex;align-items:stretch;justify-content:space-between;
    background:#57402a;border-bottom:1px solid #af8553;
  }
  .drag-handle{
    flex:1;display:flex;align-items:center;gap:10px;min-width:0;
    text-align:left;touch-action:none;cursor:grab;
    padding:13px 18px;border:0;color:#f5e0bf;background:transparent;
    font:600 20px/1.25 var(--pall-font-reading,Georgia,serif);
  }
  .drag-handle:active{cursor:grabbing}
  .grip{color:#d5b286;font-size:21px}
  .window-close{
    width:54px;flex:none;cursor:pointer;background:#4a3020;
    color:#f1d1a4;border:0;border-left:1px solid #a67c4e;
    font:30px/1 var(--pall-font-reading,Georgia,serif);
  }
  .window-close:hover{background:#734628}
  .window-body{max-height:calc(min(84vh,810px) - 62px);overflow:auto;padding:17px 22px 23px}
  .skill-note{
    font:14px/1.5 var(--pall-font-reading,Georgia,serif);color:#d5bb9a;margin:0 0 14px;
    border-left:2px solid #a0794c;padding-left:12px;
  }
  .window-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:13px}
  .window-skill{min-width:0;padding:12px;border:1px solid #654d37;background:#352b23}
  .window-skill h3{
    display:flex;align-items:baseline;justify-content:space-between;gap:9px;
    color:#f1d9b4;margin:0 0 9px;font:600 18px/1.3 var(--pall-font-reading,Georgia,serif);
  }
  .window-skill h3 span{color:#d5aa70;font:600 13px/1.2 var(--pall-font-reading,Georgia,serif)}
  .window-skill ul{padding:0}
  @media(max-width:700px){
    .skill-accordions,.window-list{grid-template-columns:1fr}
    .skills-window{width:calc(100vw - 16px);max-height:85vh}
    .window-body{padding:13px;max-height:calc(85vh - 62px)}
  }
</style>
