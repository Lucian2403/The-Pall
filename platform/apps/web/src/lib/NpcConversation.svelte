<script lang="ts">
  import {NPC_DIALOGUE_STATUS, PROPOSED_NPC_DIALOGUE} from '$lib/proposed-npc-dialogue';
  let {origin, close}: {origin:string;close:()=>void} = $props();
  const speaker = $derived(PROPOSED_NPC_DIALOGUE[origin]);
  let topic = $state<'work'|'city'|'lore'|null>(null);
  const current = $derived(speaker?.topics.find(x=>x.id===topic) ?? null);
</script>

<section class="conversation" aria-label="Optional conversation">
  {#if speaker}
    <p class="review-note">{NPC_DIALOGUE_STATUS}</p>
    <p class="name">{speaker.npc} <span>· {speaker.role}</span></p>
    {#if current}
      <p class="speech">“{current.reply}”</p>
      <div class="choices">
        <button type="button" onclick={() => {topic=null;}}>Ask something else</button>
        <button type="button" onclick={close}>Return to work</button>
      </div>
    {:else}
      <p class="instruction">What do you want to ask?</p>
      <div class="choices">
        {#each speaker.topics as option (option.id)}
          <button type="button" onclick={() => {topic=option.id;}}>{option.prompt}</button>
        {/each}
        <button type="button" onclick={close}>Leave the conversation</button>
      </div>
    {/if}
  {:else}
    <p>There is no approved conversation for this person yet.</p>
    <button type="button" onclick={close}>Close</button>
  {/if}
</section>

<style>
  .conversation {width:100%;min-width:0;color:#2b1d13;font-family:Georgia,'Times New Roman',serif}
  .review-note{font:10px/1.4 sans-serif;letter-spacing:.06em;color:#855334;margin:0 0 8px}
  .name{font:bold 13px/1.4 sans-serif;color:#523522;margin:0 0 12px}
  .name span{font-weight:normal;color:#674f37}
  .speech{font-size:clamp(15px,1.35vw,18px);line-height:1.53;margin:7px 0 17px}
  .instruction{font:14px/1.45 sans-serif;margin:6px 0 12px}
  .choices{display:flex;flex-direction:column;gap:6px}
  .choices button{width:100%;border:1px solid #624b35;background:#241d16;color:#f5e3c8;text-align:left;cursor:pointer;
    padding:10px 12px;min-height:40px;font:14px/1.4 Georgia,serif}
  .choices button:hover,.choices button:focus-visible{background:#503927;outline:2px solid #d9a76e;outline-offset:1px}
</style>
