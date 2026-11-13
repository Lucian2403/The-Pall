<script lang="ts">
  import {dialogueSpeakerLabel} from '$lib/dialogue-speaker';
  import {APPROVED_HECTOR_TOPICS,type HectorTopicId} from '$lib/approved-bellrunner-hector';
  import BellrunnerChoiceIcon from '$lib/BellrunnerChoiceIcon.svelte';

  // Local conversation state only. No character writes or stage transitions.
  let {returnToRound}:{returnToRound:()=>void}=$props();
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
    {#if currentLine.speaker==='Player'}
      <p class="eyebrow">{dialogueSpeakerLabel(currentLine.speaker)}</p>
    {:else}
      <h2 class="speaker-heading">HECTOR D. SMOKE</h2>
    {/if}
    <p class="speech">“{currentLine.text}”</p>
    <div class="responses">
      {#if lineIndex<currentTopic.lines.length-1}
        <button type="button" class="primary-choice" onclick={()=>{lineIndex+=1;}}>Continue</button>
      {:else}
        <button type="button" class="secondary-choice" onclick={askSomethingElse}>
          <BellrunnerChoiceIcon kind="chat"/>Ask something else
        </button>
        <button type="button" class="secondary-choice" onclick={returnToRound}>
          <BellrunnerChoiceIcon kind="back"/>Return to the round
        </button>
      {/if}
    </div>
  {:else}
    <p class="eyebrow">HECTOR D. SMOKE · DISPATCH MASTER</p>
    <h2>Ask Hector something</h2>
    <div class="responses" aria-label="Optional Hector conversation topics">
      {#each APPROVED_HECTOR_TOPICS as option (option.id)}
        <button type="button" class="secondary-choice" onclick={()=>beginTopic(option.id)}>
          <BellrunnerChoiceIcon kind={option.id==='routes'?'route':option.id==='marks'?'mark':'chat'}/>
          {option.label}
        </button>
      {/each}
      <button type="button" class="secondary-choice" onclick={returnToRound}>
          <BellrunnerChoiceIcon kind="back"/>Return to the round
        </button>
    </div>
  {/if}
</section>

<style>
  /* Same fixed reading scale as the surrounding Bellrunner dialogue
     (tokens in pall-story-landscape.css): a topic line is never larger
     than the round's own lines or its choices. */
  .hector-conversation{min-width:0;color:#251910}
  .eyebrow{font:normal var(--dialogue-label,15px)/1.15
    var(--pall-font-label,'Arial Narrow',sans-serif);letter-spacing:.09em;
    color:#624328;margin:0 0 16px;padding-bottom:10px;
    border-bottom:1px solid #9e815955}
  h2{margin:0 0 12px;font:600 var(--dialogue-title,21px)/1.3 var(--pall-font-reading,Georgia,serif);
    color:#25170f}
  .speaker-heading{margin:0 0 16px;padding:0 0 10px;
    border-bottom:1px solid #9e815955;text-transform:uppercase;
    font:normal var(--dialogue-label,15px)/1.15
    var(--pall-font-label,'Arial Narrow',sans-serif);letter-spacing:.09em;color:#624328}
  .speech{margin:0 0 14px;font:600 var(--dialogue-text,17px)/1.55
    var(--pall-font-reading,Georgia,serif);color:#251910}
  .responses{display:flex;flex-direction:column;gap:9px;margin-top:18px}
</style>
