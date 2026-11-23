<script lang="ts">
  /** Shared read-only archive; no account-wide storage, no cross-character cache.
   * Only the server may record or complete tasks. */
  type Task={
    taskId:string;taskInstanceId:string;stage:number;title:string;
    paragraphs:string[];choices:Record<string,string>;
    outcome:string|null;completedAt:string;contentVersion:number;
  };
  type Page={characterId:string;tasks:Task[];nextCursor:string|null};
  let {characterId,open}: {characterId:string;open:boolean}=$props();

  let tasks=$state<Task[]>([]);
  let selected=$state<string|null>(null);
  let cursor=$state<string|null>(null);
  let loading=$state(false);
  let error=$state('');
  let loadedCharacter=$state<string|null>(null);
  let requestSerial=0;

  async function load(character:string,next:string|null,signal?:AbortSignal){
    if(loading)return;
    const serial=++requestSerial;
    loading=true;error='';
    try{
      const params=new URLSearchParams({limit:'20'});
      if(next)params.set('cursor',next);
      const response=await fetch('/api/characters/'+encodeURIComponent(character)+'/journal?'+params,{
        cache:'no-store',credentials:'same-origin',signal
      });
      if(!response.ok)throw Error(response.status===401?'Sign in to read this journal.':
        response.status===404?'This character is unavailable.':'Could not load the saved journal.');
      const page=await response.json() as Page;
      if(serial!==requestSerial||page.characterId!==character||loadedCharacter!==character)return;
      tasks=next?[...tasks,...page.tasks]:page.tasks;
      cursor=page.nextCursor;
    }catch(e){
      if(serial!==requestSerial||(e instanceof Error&&e.name==='AbortError'))return;
      error=e instanceof Error?e.message:'Could not load the saved journal.';
    }finally{if(serial===requestSerial)loading=false;}
  }

  // Clearing happens synchronously in this reactive run, BEFORE any fetch.
  // A late response from character A can never populate character B's panel.
  $effect(()=>{
    const character=characterId;
    const visible=open;
    const controller=new AbortController();
    ++requestSerial;
    tasks=[];selected=null;cursor=null;error='';loading=false;
    loadedCharacter=character;
    if(visible)void Promise.resolve().then(()=>{
      if(!controller.signal.aborted)void load(character,null,controller.signal);
    });
    return ()=>{controller.abort();++requestSerial;};
  });
  const chosen=$derived(tasks.find(task=>task.taskInstanceId===selected)??null);
</script>

<section class="journal-history" id="personal-journal-history" aria-label="Completed Personal Journal tasks">
  <div class="reading">
    <p class="eyebrow">PERSONAL JOURNAL</p>
    <h2>Completed Tasks</h2>
    {#if loading&&!tasks.length}
      <p role="status">Reading saved entries…</p>
    {:else if error&&!tasks.length}
      <p role="alert">{error}</p>
    {:else if !tasks.length}
      <p>Nothing completed yet.</p>
    {:else}
      <ul class="task-list" aria-label="Completed tasks in chronological order">
        {#each tasks as task (task.taskInstanceId)}
          <li>
            <button type="button" class:chosen={selected===task.taskInstanceId}
              aria-expanded={selected===task.taskInstanceId}
              onclick={()=>selected=selected===task.taskInstanceId?null:task.taskInstanceId}>
              <span>{task.title}</span><small>Stage {task.stage} · Completed</small>
            </button>
          </li>
        {/each}
      </ul>
      {#if chosen}
        <article class="diary" aria-label={'Diary: '+chosen.title}>
          <h3>{chosen.title}</h3>
          {#each chosen.paragraphs as paragraph,i (i)}
            <p>{paragraph}</p>
          {/each}
        </article>
      {/if}
      {#if cursor}
        <button type="button" class="load-more" disabled={loading}
          onclick={()=>void load(characterId,cursor)}>{loading?'Loading…':'Load more completed tasks'}</button>
      {/if}
      {#if error}<p role="alert">{error}</p>{/if}
    {/if}
  </div>
</section>

<style>
  .journal-history{box-sizing:border-box;width:100%;background:#e8d6b6;color:#24160e;
    padding:19px clamp(16px,4vw,46px) 25px;border-top:2px solid #9a7147;
    scroll-margin-top:56px;font-family:var(--pall-font-reading,Georgia,serif)}
  .reading{max-width:930px;margin:0 auto}
  .eyebrow{font:700 13px/1.3 var(--pall-font-label,'Arial Narrow',sans-serif);
    letter-spacing:.09em;margin:0 0 5px}
  h2{font-size:24px;margin:0 0 15px}
  h3{font-size:21px;margin:20px 0 12px}
  .task-list{list-style:none;padding:0;margin:0;display:grid;gap:8px}
  .task-list button,.load-more{display:flex;width:100%;text-align:left;gap:10px;
    align-items:center;justify-content:space-between;flex-wrap:wrap;
    font:600 16px/1.4 var(--pall-font-reading,Georgia,serif);
    border:1px solid #99764c;background:#f5e6c9;color:#24160e;
    cursor:pointer;padding:11px 14px;min-height:44px}
  .task-list button.chosen{background:#dbbd88}
  .task-list small{font:12px Arial,sans-serif;color:#62472b}
  .task-list button:focus-visible,.load-more:focus-visible{outline:2px solid #58351c;outline-offset:2px}
  .diary{border-top:1px solid #9a7147;margin-top:16px}
  .diary p{font:600 16px/1.55 var(--pall-font-reading,Georgia,serif);margin:0 0 12px}
  .load-more{margin-top:14px}
  @media(max-width:600px){.task-list button{align-items:flex-start;flex-direction:column;gap:2px}}
</style>
