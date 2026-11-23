<script lang="ts">
  /** Shared read-only archive; no account-wide storage, no cross-character cache.
   * Only the server may record or complete tasks. */
  type Task={
    taskId:string;taskInstanceId:string;stage:number;title:string;
    paragraphs:string[];choices:Record<string,string>;
    outcome:string|null;completedAt:string;contentVersion:number;
  };
  type Page={characterId:string;tasks:Task[];nextCursor:string|null};
  let {characterId,open,currentJournalId='scene-empty-journal'}: {
    characterId:string;open:boolean;currentJournalId?:string
  }=$props();

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
      // Show the first saved entry immediately; further pages never change
      // the reader's selection or recompute archived first-person prose.
      if(!next)selected=page.tasks[0]?.taskInstanceId??null;
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
  function showCurrent(){
    document.getElementById(currentJournalId)?.scrollIntoView({
      block:'start',behavior:'smooth'
    });
  }
</script>

<section class="journal-history" id="personal-journal-history"
  aria-label="Completed Personal Journal tasks">
  <div class="reading">
    <header class="journal-heading">
      <p class="eyebrow">PERSONAL JOURNAL</p>
      <h2>Completed Tasks</h2>
    </header>

    <nav class="journal-tabs" aria-label="Journal sections">
      <button type="button" class="journal-tab" aria-controls={currentJournalId}
        onclick={showCurrent}>Current</button>
      <span class="journal-tab active" aria-current="page">Completed Tasks</span>
    </nav>

    <div class="ornament-rule" aria-hidden="true"><span>✥</span></div>

    {#if loading&&!tasks.length}
      <p class="task-status" role="status">Reading saved entries…</p>
    {:else if error&&!tasks.length}
      <p class="task-status" role="alert">{error}</p>
    {:else if !tasks.length}
      <p class="task-status">Nothing completed yet.</p>
    {:else}
      <ul class="task-list" aria-label="Completed tasks in chronological order">
        {#each tasks as task (task.taskInstanceId)}
          <li>
            <button type="button" class:chosen={selected===task.taskInstanceId}
              aria-expanded={selected===task.taskInstanceId}
              onclick={()=>selected=selected===task.taskInstanceId?null:task.taskInstanceId}>
              <span class="task-title">{task.title}</span>
              <small>Stage {task.stage}</small>
            </button>
          </li>
        {/each}
      </ul>

      {#if chosen}
        <article class="diary" aria-label={'Diary: '+chosen.title}>
          <p class="diary-meta">COMPLETED · STAGE {chosen.stage}</p>
          <h3>{chosen.title}</h3>
          <div class="diary-paragraphs">
            {#each chosen.paragraphs as paragraph,i (i)}
              <p>{paragraph}</p>
            {/each}
          </div>
        </article>
      {/if}

      {#if cursor}
        <button type="button" class="load-more" disabled={loading}
          onclick={()=>void load(characterId,cursor)}>
          {loading?'Loading…':'Load more completed tasks'}
        </button>
      {/if}
      {#if error}<p class="task-status" role="alert">{error}</p>{/if}
    {/if}
  </div>
</section>

<style>
  /* Shared character-bound journal. The frame is intentionally CSS-only:
     no screenshot texture, copied artwork, or extra close-button widget. */
  .journal-history{
    --paper:#ead8b8;
    --ink:#302114;
    --rule:#97754d;
    --bronze:#78512e;
    box-sizing:border-box;
    position:relative;
    isolation:isolate;
    width:100%;
    min-width:0;
    padding:clamp(24px,3.8vw,56px);
    border:6px solid #33241b;
    color:var(--ink);
    background-color:var(--paper);
    background-image:
      radial-gradient(ellipse at 6% 7%,rgba(134,86,38,.11),transparent 45%),
      radial-gradient(ellipse at 94% 91%,rgba(128,85,46,.12),transparent 37%),
      radial-gradient(ellipse at 60% 30%,rgba(255,247,221,.28),transparent 57%),
      linear-gradient(90deg,rgba(91,55,28,.065),transparent 7%,transparent 93%,rgba(91,55,28,.06));
    box-shadow:
      inset 0 0 0 2px #a88453,
      inset 0 0 0 7px rgba(242,224,189,.8),
      0 7px 25px rgba(0,0,0,.24);
    scroll-margin-top:56px;
    font-family:var(--pall-font-reading,Georgia,serif);
  }
  .journal-history::before{
    content:'';
    position:absolute;
    inset:11px;
    pointer-events:none;
    border:1px solid rgba(105,75,43,.5);
    border-radius:7px;
    box-shadow:inset 0 0 0 2px rgba(255,237,196,.16);
  }
  .reading{position:relative;max-width:1400px;margin:0 auto}
  .journal-heading{margin:0}
  .eyebrow{
    margin:0 0 10px;
    font:400 15px/1.2 var(--pall-font-label,'Arial Narrow',sans-serif);
    letter-spacing:.19em;
    color:#60462d;
  }
  h2{
    margin:0 0 22px;
    font:600 clamp(29px,3.1vw,43px)/1.12 var(--pall-font-reading,Georgia,serif);
    letter-spacing:.005em;
  }
  .journal-tabs{display:flex;align-items:stretch;gap:10px;flex-wrap:wrap}
  .journal-tab{
    display:inline-flex;
    justify-content:center;
    align-items:center;
    box-sizing:border-box;
    min-height:46px;
    padding:9px clamp(14px,1.7vw,23px);
    border:1px solid #93714a;
    border-radius:3px 3px 0 0;
    color:var(--ink);
    background:rgba(252,236,204,.26);
    font:600 17px/1.3 var(--pall-font-reading,Georgia,serif);
    text-decoration:none;
    box-shadow:inset 0 0 0 1px rgba(255,238,202,.3);
  }
  button.journal-tab{cursor:pointer}
  button.journal-tab:hover{background:rgba(245,218,171,.67)}
  .journal-tab.active{
    border-color:#9e7841;
    color:#f7e8cc;
    background:linear-gradient(165deg,#96703f,#694622 80%);
    box-shadow:inset 0 0 0 2px rgba(215,176,103,.75),inset 0 0 0 4px rgba(49,31,16,.28);
  }
  .ornament-rule{display:flex;align-items:center;gap:12px;margin:12px 0 24px;color:#646b53}
  .ornament-rule::before,.ornament-rule::after{
    content:'';display:block;height:1px;flex:1;
    background:linear-gradient(90deg,transparent,var(--rule) 9%,var(--rule) 91%,transparent);
  }
  .ornament-rule span{font:17px/1 Georgia,serif}
  .task-list{list-style:none;padding:0;margin:0;display:grid;gap:7px}
  .task-list li{min-width:0}
  .task-list button{
    display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;
    gap:6px 18px;width:100%;min-width:0;min-height:50px;
    padding:11px clamp(12px,2vw,28px);
    border:1px solid rgba(110,76,41,.76);
    border-radius:3px;
    background:rgba(247,231,199,.24);
    box-shadow:inset 0 0 0 1px rgba(255,244,216,.17);
    color:var(--ink);
    font:600 clamp(17px,1.7vw,22px)/1.3 var(--pall-font-reading,Georgia,serif);
    text-align:left;cursor:pointer;
  }
  .task-list button:hover:not(.chosen){background:rgba(248,229,190,.7)}
  .task-list button.chosen{
    color:#f6e5c5;
    border-color:#9f7541;
    background:linear-gradient(160deg,#956d3d,#78502b 78%);
    box-shadow:inset 0 0 0 2px rgba(218,179,106,.72),inset 0 0 0 4px rgba(54,31,13,.2);
  }
  .task-list small{
    margin-left:auto;white-space:nowrap;
    font:italic 16px/1.3 var(--pall-font-reading,Georgia,serif);
    color:#5e442c;
  }
  .task-list .chosen small{color:#f2e1c0}
  .task-list button:focus-visible,button.journal-tab:focus-visible,
  .load-more:focus-visible{outline:3px solid #4c634c;outline-offset:3px}
  .diary{margin:clamp(26px,3.5vw,44px) 0 0}
  .diary-meta{
    display:flex;align-items:center;gap:20px;
    margin:0 0 19px;
    font:400 15px/1.25 var(--pall-font-label,'Arial Narrow',sans-serif);
    letter-spacing:.17em;
    color:#59432d;
  }
  .diary-meta::after{content:'';height:1px;flex:1;background:rgba(142,101,57,.7)}
  h3{
    margin:0 0 20px;
    font:600 clamp(25px,2.6vw,35px)/1.22 var(--pall-font-reading,Georgia,serif);
  }
  .diary-paragraphs{max-width:84ch}
  .diary-paragraphs p{
    margin:0 0 17px;
    font:500 clamp(17px,1.45vw,20px)/1.63 var(--pall-font-reading,Georgia,serif);
  }
  .task-status{margin:18px 0;font:600 17px/1.5 var(--pall-font-reading,Georgia,serif)}
  .load-more{
    margin-top:20px;min-height:44px;padding:10px 18px;
    border:1px solid #93714a;border-radius:3px;
    background:#e0c69d;color:var(--ink);
    font:600 16px/1.3 var(--pall-font-reading,Georgia,serif);
    cursor:pointer;
  }
  .load-more:hover:not(:disabled){background:#eed5ac}
  .load-more:disabled{opacity:.62;cursor:wait}
  @media(max-width:600px){
    .journal-history{padding:25px 18px;border-width:4px}
    .journal-history::before{inset:7px}
    .journal-tab{font-size:15px;padding:8px 13px;min-height:44px}
    .task-list button{font-size:17px}
    .task-list small{font-size:14px}
    .ornament-rule{margin:12px 0 20px}
    .diary-meta{font-size:13px;gap:9px}
    .diary-paragraphs p{font-size:17px}
  }
  @media(prefers-reduced-motion:no-preference){
    .journal-tab,.task-list button,.load-more{transition:background-color .15s,border-color .15s}
  }
</style>
