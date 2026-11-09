<script lang="ts">
  import {APPROVED_HECTOR_TOPICS,type HectorTopicId} from '$lib/approved-bellrunner-hector';

  // Local conversation state only. No character writes or stage transitions.
  let {characterName,returnToRound}:{
    characterName:string;returnToRound:()=>void
  }=$props();
  let topic=$state<HectorTopicId|null>(null);
  let lineIndex=$state(0);
  const currentTopic=$derived(APPROVED_HECTOR_TOPICS.find(x=>x.id===topic)??null);
  const currentLine=$derived(currentTopic?.lines[lineIndex]??null);

  function beginTopic(id:HectorTopicId){
    topic=id;lineIndex=0;
  }
  function askSomethingElse(){
    topic=null;lineIndex=0;
  }
</script>

<section class="hector-conversation" aria-label="Optional conversation with Hector D. Smoke">
  {#if currentTopic && currentLine}
    <p class="eyebrow">{currentLine.speaker==='Player'?characterName:'HECTOR D. SMOKE'}</p>
    <p class="speech">“{currentLine.text}”</p>
    <div class="responses">
      {#if lineIndex<currentTopic.lines.length-1}
        <button type="button" onclick={()=>{lineIndex+=1;}}>Continue</button>
      {:else}
        <button type="button" onclick={askSomethingElse}>Ask something else</button>
        <button type="button" onclick={returnToRound}>Return to the round</button>
      {/if}
    </div>
  {:else}
    <p class="eyebrow">HECTOR D. SMOKE · DISPATCH MASTER</p>
    <h2>Ask Hector something</h2>
    <div class="responses" aria-label="Optional Hector conversation topics">
      {#each APPROVED_HECTOR_TOPICS as option (option.id)}
        <button type="button" onclick={()=>beginTopic(option.id)}>{option.label}</button>
      {/each}
      <button type="button" onclick={returnToRound}>Return to the round</button>
    </div>
  {/if}
</section>

<style>
  .hector-conversation{min-width:0;color:#251910}
  .eyebrow{font:600 11px/1.3 sans-serif;letter-spacing:.12em;
    color:#614029;margin:0 0 12px}
  h2{margin:0 0 12px;font:600 24px/1.3 var(--pall-font-reading,Georgia,serif);
    color:#25170f}
  .speech{margin:0 0 12px;font:600 clamp(13px,1.2vw,17px)/1.5
    var(--pall-font-reading,Georgia,serif);color:#251910}
  .responses{display:flex;flex-direction:column;gap:6px;margin-top:3px}
  .responses>button{display:block;width:100%;min-height:42px;
    border:1px solid #6d5235;background:#241d16;color:#f7e6c9;
    text-align:left;padding:10px 12px;
    font:14px/1.4 var(--pall-font-reading,Georgia,serif);cursor:pointer}
  .responses>button:hover,.responses>button:focus-visible{
    background:#423022;outline:1px solid #c49d65}
  @media(max-width:700px){.speech{font-size:16px}}
</style>
