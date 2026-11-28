<script lang="ts">
  import {tick,untrack} from 'svelte';

  export type CompletedTask={
    taskInstanceId:string;taskId:string;stage:number;title:string;
    paragraphs:string[];choices:Record<string,string>;outcome:string|null;
    contentVersion:number;completedAt:string;
  };
  type ArchivePage={
    characterId:string;completed:CompletedTask[];nextCursor:string|null;
  };
  let {characterId,currentTitle='Current task',currentEntries=[],onClose}:{
    characterId:string;
    currentTitle?:string;
    currentEntries?:readonly string[];
    onClose:()=>void;
  }=$props();

  let section=$state<HTMLElement|undefined>();
  let tab=$state<'current'|'completed'>('current');
  let completed=$state<CompletedTask[]>([]);
  let nextCursor=$state<string|null>(null);
  let selectedId=$state<string|null>(null);
  let loading=$state(false);
  let error=$state('');
  let requestSequence=0;
  let activeController:AbortController|null=null;

  async function loadPage(id:string,cursor:string|null,reset:boolean){
    activeController?.abort();
    const controller=new AbortController();
    activeController=controller;
    const request=++requestSequence;
    loading=true;error='';
    try{
      const params=new URLSearchParams({limit:'20'});
      if(cursor)params.set('after',cursor);
      const result=await fetch('/api/characters/'+encodeURIComponent(id)+'/journal?'+params,{
        cache:'no-store',credentials:'same-origin',signal:controller.signal
      });
      if(!result.ok)throw new Error(result.status===401?'Sign in required':
        result.status===404?'Character not found':'Journal unavailable');
      const page=await result.json() as ArchivePage;
      // A stale response from another character is never rendered.
      if(controller.signal.aborted||request!==requestSequence||
         id!==characterId||page.characterId!==id)return;
      completed=reset?page.completed:[...completed,...page.completed];
      nextCursor=page.nextCursor;
      if(reset)selectedId=page.completed[0]?.taskInstanceId??null;
    }catch(cause){
      if(!controller.signal.aborted&&request===requestSequence)
        error=cause instanceof Error?cause.message:'Journal unavailable';
    }finally{
      if(!controller.signal.aborted&&request===requestSequence)loading=false;
    }
  }
  $effect(()=>{
    const id=characterId;
    // Each character gets a fresh reader and a new request. No shared cache,
    // account-scoped key, stale selection, or retained previous journal.
    completed=[];selectedId=null;nextCursor=null;tab='current';
    untrack(()=>{void loadPage(id,null,true);});
    return ()=>{requestSequence++;activeController?.abort();};
  });
  $effect(()=>{if(section)void tick().then(()=>section?.focus());});
  const selected=$derived(completed.find(item=>item.taskInstanceId===selectedId)??null);
  function handleKey(event:KeyboardEvent){
    if(event.key==='Escape'&&!event.defaultPrevented&&!(event.target instanceof Element&&event.target.closest('dialog[open]'))){event.preventDefault();onClose();}
  }
</script>

<svelte:window onkeydown={handleKey}/>
<section id="personal-journal" class="personal-journal" aria-label="Personal Journal"
  tabindex="-1" bind:this={section}>
  <header class="journal-head">
    <div><small>PERSONAL JOURNAL</small><h2>{tab==='current'?'Current Tasks':'Completed Tasks'}</h2></div>
  </header>
  <div class="journal-tabs" role="group" aria-label="Journal sections">
    <button type="button" class:chosen={tab==='current'} aria-pressed={tab==='current'}
      onclick={()=>tab='current'}>Current</button>
    <button type="button" class:chosen={tab==='completed'} aria-pressed={tab==='completed'}
      onclick={()=>tab='completed'}>Completed Tasks</button>
  </div>
  <div class="ornament-rule" aria-hidden="true">✥</div>
  {#if tab==='completed'}
    <div class="completed-area" aria-label="Completed task history">
      {#if completed.length}
        <nav class="task-list" aria-label="Completed tasks">
          {#each completed as task (task.taskInstanceId)}
            <button type="button" class:chosen={selectedId===task.taskInstanceId}
              aria-pressed={selectedId===task.taskInstanceId}
              onclick={()=>selectedId=task.taskInstanceId}>
              <strong>{task.title}</strong><span>Stage {task.stage}</span>
            </button>
          {/each}
        </nav>
      {:else if !loading&&!error}
        <p>No completed tasks yet.</p>
      {/if}
    </div>
  {/if}
  {#if tab==='current'||selected}
    <!-- The only diary reader. Both tabs share identical text styles. -->
    <article id="journal-reading" class="reading-area journal-reading"
      aria-label={tab==='current'?'Current task journal':selected?.title+' journal entry'}>
      {#if tab==='completed'&&selected}
        <small>COMPLETED · STAGE {selected.stage}</small>
      {/if}
      <h3>{tab==='current'?currentTitle:selected?.title}</h3>
      {#if tab==='current'&&!currentEntries.length}
        <p>Nothing has been recorded for this task yet.</p>
      {:else}
        {#each (tab==='current'?currentEntries:selected?.paragraphs??[]) as paragraph,index (index)}
          <p>{paragraph}</p>
        {/each}
      {/if}
    </article>
  {/if}
  {#if tab==='completed'}
    <div class="completed-area">
      {#if error}<p role="alert">{error}</p>{/if}
      {#if loading}<p role="status">Reading saved entries…</p>{/if}
      {#if nextCursor&&!loading}
        <button type="button" class="load-more"
          onclick={()=>{void loadPage(characterId,nextCursor,false);}}>
          Load more completed tasks
        </button>
      {/if}
    </div>
  {/if}
</section>

<style>
  /* One shared Journal: presentation only. #62 remains the sole archive owner. */
  .personal-journal{
    --journal-ink:#302114;--journal-rule:#97754d;
    box-sizing:border-box;position:relative;isolation:isolate;
    width:100%;min-width:0;color:var(--journal-ink);
    background-color:#ead8b8;
    background-image:
      radial-gradient(ellipse at 5% 6%,rgba(130,84,36,.11),transparent 45%),
      radial-gradient(ellipse at 94% 90%,rgba(128,83,39,.12),transparent 36%),
      linear-gradient(90deg,rgba(89,52,26,.06),transparent 8%,transparent 92%,rgba(89,52,26,.06));
    padding:clamp(25px,3.6vw,54px);
    border:6px solid #33241b;
    box-shadow:inset 0 0 0 2px #a88453,
      inset 0 0 0 7px rgba(252,234,201,.8),0 7px 25px rgba(0,0,0,.24);
    scroll-margin-top:56px;outline-offset:-3px;
    font-family:var(--pall-font-reading,Georgia,serif);
  }
  .personal-journal::before{
    content:'';position:absolute;inset:11px;pointer-events:none;
    border:1px solid rgba(105,75,43,.5);border-radius:7px;
  }
  .journal-head,.journal-tabs,.completed-area{max-width:1150px;margin-inline:auto}
  .journal-head{margin-bottom:15px}
  .journal-head small{
    font:700 14px/1.3 var(--pall-font-label,'Arial Narrow',sans-serif);
    letter-spacing:.19em;color:#60462d;
  }
  h2{font:600 clamp(23px,2.2vw,29px)/1.2 var(--pall-font-reading,Georgia,serif);
    margin:6px 0 0}
  h3{font:600 clamp(19px,1.7vw,23px)/1.3 var(--pall-font-reading,Georgia,serif);
    margin:7px 0 18px}
  p{font:600 16px/1.55 var(--pall-font-reading,Georgia,serif);margin:9px 0 14px}
  .journal-tabs{display:flex;gap:10px;flex-wrap:wrap}
  button{appearance:none;cursor:pointer;min-height:44px;text-align:left;
    font:600 16px/1.35 var(--pall-font-reading,Georgia,serif)}
  .journal-tabs button{
    padding:10px clamp(13px,1.7vw,24px);border:1px solid #96714b;
    border-radius:3px 3px 0 0;background:rgba(252,237,205,.35);
    color:var(--journal-ink);box-shadow:inset 0 0 0 1px rgba(255,241,211,.3);
  }
  .journal-tabs button:hover:not(.chosen){background:rgba(245,217,174,.68)}
  .journal-tabs button.chosen{
    border-color:#9e7841;color:#f7e8cc;
    background:linear-gradient(165deg,#96703f,#694622 82%);
    box-shadow:inset 0 0 0 2px rgba(215,176,103,.75),
      inset 0 0 0 4px rgba(49,31,16,.25);
  }
  .ornament-rule{
    display:flex;align-items:center;gap:12px;
    max-width:1150px;margin:12px auto 24px;color:#646b53;font:18px/1 Georgia,serif;
  }
  .ornament-rule::before,.ornament-rule::after{
    content:'';height:1px;flex:1;
    background:linear-gradient(90deg,transparent,var(--journal-rule) 9%,
      var(--journal-rule) 91%,transparent);
  }
  .reading-area{box-sizing:border-box;max-width:930px;width:100%;margin:24px auto 0;padding-top:15px}
  .reading-area p{font:600 16px/1.55 var(--pall-font-reading,Georgia,serif);margin:0 0 12px}
  .reading-area small{display:block;margin-bottom:11px;font:700 12px/1.3 var(--pall-font-label,'Arial Narrow',sans-serif);letter-spacing:.1em;color:#59432d}
  .completed-area{min-width:0}
  .task-list{display:flex;flex-direction:column;gap:7px;margin-bottom:22px}
  .task-list button{
    display:flex;align-items:center;justify-content:space-between;
    gap:8px 18px;width:100%;min-width:0;min-height:51px;
    padding:11px clamp(13px,2vw,27px);border:1px solid rgba(110,76,41,.76);
    border-radius:3px;background:rgba(247,231,199,.24);
    color:var(--journal-ink);box-shadow:inset 0 0 0 1px rgba(255,244,216,.18);
  }
  .task-list button:hover:not(.chosen){background:rgba(248,229,190,.73)}
  .task-list button.chosen{
    border-color:#9f7541;color:#f7e7c7;
    background:linear-gradient(160deg,#956d3d,#78502b 78%);
    box-shadow:inset 0 0 0 2px rgba(218,179,106,.72),
      inset 0 0 0 4px rgba(54,31,13,.2);
  }
  .task-list strong{min-width:0;overflow-wrap:anywhere;
    font:600 clamp(17px,1.7vw,22px)/1.3 var(--pall-font-reading,Georgia,serif)}
  .task-list button span{
    margin-left:auto;white-space:nowrap;
    font:italic 16px/1.3 var(--pall-font-reading,Georgia,serif);color:#5e442c;
  }
  .task-list button.chosen span{color:#f4e0bc}
  .completed-area + .journal-reading{margin-top:25px;padding-top:17px;
    border-top:1px solid rgba(142,101,57,.7)}
  .load-more{
    display:inline-flex;align-items:center;margin-top:12px;padding:10px 18px;
    min-height:44px;border:1px solid #93714a;border-radius:3px;
    background:#e0c69d;color:var(--journal-ink);
  }
  .load-more:hover{background:#eed5ac}
  button:focus-visible{outline:3px solid #4c634c;outline-offset:3px}
  .sr-only{position:absolute;clip:rect(0 0 0 0);clip-path:inset(50%);
    width:1px;height:1px;white-space:nowrap;overflow:hidden}
  @media(max-width:600px){
    .personal-journal{padding:25px 18px;border-width:4px}
    .personal-journal::before{inset:7px}
    .journal-tabs{gap:7px}
    .journal-tabs button{flex:1;padding:9px 11px;font-size:15px;text-align:center}
    .task-list button{align-items:flex-start;flex-direction:column;gap:5px}
    .task-list button span{margin-left:0;font-size:14px}
    .ornament-rule{margin-bottom:19px}
    .completed-area + .journal-reading{margin-top:22px;padding-top:15px}
  }
  @media(prefers-reduced-motion:no-preference){
    .journal-tabs button,.task-list button,.load-more{
      transition:background-color .15s,border-color .15s
    }
  }
</style>
