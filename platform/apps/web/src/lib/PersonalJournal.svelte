<script lang="ts">
  import {tick} from 'svelte';

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
      if(reset)selectedId=null;
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
    void loadPage(id,null,true);
    return ()=>{requestSequence++;activeController?.abort();};
  });
  $effect(()=>{if(section)void tick().then(()=>section?.focus());});
  const selected=$derived(completed.find(item=>item.taskInstanceId===selectedId)??null);
  function handleKey(event:KeyboardEvent){
    if(event.key==='Escape'){event.preventDefault();onClose();}
  }
</script>

<svelte:window onkeydown={handleKey}/>
<section id="personal-journal" class="personal-journal" aria-label="Personal Journal"
  tabindex="-1" bind:this={section}>
  <header class="journal-head">
    <div><small>PERSONAL JOURNAL</small><h2>{tab==='current'?currentTitle:'Completed Tasks'}</h2></div>
  </header>
  <div class="journal-tabs" role="group" aria-label="Journal sections">
    <button type="button" class:chosen={tab==='current'} aria-pressed={tab==='current'}
      onclick={()=>tab='current'}>Current</button>
    <button type="button" class:chosen={tab==='completed'} aria-pressed={tab==='completed'}
      onclick={()=>tab='completed'}>Completed Tasks</button>
  </div>
  {#if tab==='current'}
    <div class="reading-area" aria-label="Current task journal">
      <h3 class="sr-only">{currentTitle}</h3>
      {#if currentEntries.length}
        {#each currentEntries as paragraph,index (index)}
          <p>{paragraph}</p>
        {/each}
      {:else}
        <p>Nothing has been recorded for this task yet.</p>
      {/if}
    </div>
  {:else}
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
      {#if selected}
        <article class="reading-area" aria-label={selected.title+' journal entry'}>
          <small>COMPLETED · STAGE {selected.stage}</small>
          <h3>{selected.title}</h3>
          {#each selected.paragraphs as paragraph,index (index)}
            <p>{paragraph}</p>
          {/each}
        </article>
      {/if}
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
  .personal-journal{box-sizing:border-box;width:100%;background:#e8d6b6;
    color:#24160e;padding:20px clamp(16px,4vw,46px) 28px;
    border-top:2px solid #9a7147;scroll-margin-top:56px;outline-offset:-3px;
    font-family:var(--pall-font-reading,Georgia,serif)}
  .journal-head,.journal-tabs,.reading-area,.completed-area{max-width:930px;margin-inline:auto}
  .journal-head{margin-bottom:13px}
  small{font:700 14px/1.3 var(--pall-font-label,'Arial Narrow',sans-serif);letter-spacing:.09em}
  h2{font:600 24px/1.3 var(--pall-font-reading,Georgia,serif);margin:5px 0}
  h3{font:600 21px/1.35 var(--pall-font-reading,Georgia,serif);margin:8px 0 15px}
  p{font:600 16px/1.55 var(--pall-font-reading,Georgia,serif);margin:9px 0 14px}
  .journal-tabs{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:19px}
  button{cursor:pointer;background:#dbc39e;border:1px solid #86694b;color:#26190f;
    font:700 15px/1.4 var(--pall-font-reading,Georgia,serif);padding:8px 14px;
    min-height:42px;text-align:left}
  button.chosen{background:#b58c59}
  button:focus-visible{outline:2px solid #52351b;outline-offset:3px}
  .task-list{display:flex;flex-direction:column;gap:5px;margin-bottom:19px}
  .task-list button{display:flex;align-items:center;justify-content:space-between;
    gap:16px;width:100%}
  .task-list button span{font:12px/1.35 sans-serif;white-space:nowrap}
  .reading-area{padding:2px 0 0}
  .load-more{margin-top:13px}
  .sr-only{position:absolute;clip:rect(0 0 0 0);clip-path:inset(50%);
    width:1px;height:1px;white-space:nowrap;overflow:hidden}
  @media(max-width:600px){.journal-tabs{gap:6px}.journal-tabs button{flex:1}
    .task-list button{align-items:flex-start;flex-direction:column;gap:3px}}
</style>
