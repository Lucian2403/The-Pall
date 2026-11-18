<script lang="ts">
  import {dialogueSpeakerLabel} from '$lib/dialogue-speaker';
  import type {StageOneBeat} from '$lib/approved-stage-one';
  import ActivityLayout from '$lib/ActivityLayout.svelte';
  import '$lib/workshop-object-labels.css';
  import '$lib/pall-story-landscape.css';

  let {characterName,beat,advance,goBack,canGoBack}:{
    characterName:string;beat:StageOneBeat;
    advance:(next:string,fromChoice?:boolean)=>void;
    goBack:()=>void;canGoBack:boolean;
  }=$props();

  let inspectingClaudia=$state(false);
  const text=$derived(beat.text.replaceAll('[player name]',characterName));
  function next(id:string,fromChoice=false){
    inspectingClaudia=false;
    advance(id,fromChoice);
  }
</script>

<section class="workshop stitcher-opening" aria-label="Stitcher Stage I — Cinder Row Infirmary">
  <ActivityLayout mode="scene" class="pall-story-sections" stageAspect={1672/941}>
    {#snippet stage()}
      <section class="scene-visuals pall-story-visuals" aria-label="Cinder Row Infirmary with Claudia Cyka">
        <div class="illustration pall-story-landscape">
          <img class="ward" src="/locations/clinic/clinic-workshop-cold.webp"
            alt="Cinder Row Infirmary, with two patient beds, linen, shelves and a wash station"
            draggable="false"/>
          <div class="scene-shade" aria-hidden="true"></div>
          <img class="claudia" src="/characters/claudia/claudia-front.webp"
            alt="Claudia Cyka, the infirmary's stern senior nurse" draggable="false"/>
          <img class="ward ward-foreground" src="/locations/clinic/clinic-workshop-cold.webp"
            alt="" aria-hidden="true" draggable="false"/>
          <button type="button" class="npc-hotspot"
            title="Inspect Claudia Cyka" aria-label="Inspect Claudia Cyka"
            aria-pressed={inspectingClaudia}
            onclick={()=>{inspectingClaudia=!inspectingClaudia;}}>
            <span class="workshop-npc-label">Claudia Cyka</span>
          </button>
        </div>
      </section>
    {/snippet}
    {#snippet panel()}
      <section class="dialogue-section pall-story-dialogue-section" aria-label="Claudia Cyka dialogue">
        <aside class="work-card parchment">
          {#if inspectingClaudia}
            <p class="eyebrow">CINDER ROW INFIRMARY · STAGE I</p>
            <h2>Claudia Cyka</h2>
            <p class="narration">The senior nurse keeps her uniform immaculate, even in this overcrowded ward. She watches the work without much patience for excuses.</p>
            <div class="responses">
              <button type="button" class="primary-choice" onclick={()=>{inspectingClaudia=false;}}>
                Return to the round
              </button>
            </div>
          {:else}
            <p class="eyebrow">STITCHER · STAGE I</p>
            <h2>Claudia Cyka</h2>
            {#if beat.kind==='speech'}
              <p class="speaker">{dialogueSpeakerLabel(beat.speaker)}</p>
              <p class="speech">“{text}”</p>
            {:else if beat.kind==='narration'}
              <p class="narration">{text}</p>
            {:else if beat.kind==='choice'}
              <p class="narration">Your response</p>
            {:else}
              <p class="narration">The ordinary ward round is the next stage.</p>
              <p class="note">The Stage II handoff is not connected yet. No coins, XP, supplies or tutorial progress have been granted.</p>
            {/if}
            <div class="responses">
              {#if beat.kind==='choice'&&beat.choices}
                {#each beat.choices as choice}
                  <button type="button" class="primary-choice"
                    onclick={()=>next(choice.next,true)}>{choice.label}</button>
                {/each}
              {:else if beat.next}
                <button type="button" class="primary-choice"
                  onclick={()=>{if(beat.next)next(beat.next);}}>Continue</button>
              {/if}
            </div>
          {/if}
          {#if canGoBack}
            <div class="dialogue-navigation">
              <button type="button" onclick={()=>{inspectingClaudia=false;goBack();}}>
                <span aria-hidden="true">‹</span> Previous line
              </button>
            </div>
          {/if}
        </aside>
      </section>
    {/snippet}
  </ActivityLayout>
</section>

<style>
  .stitcher-opening{display:flex;flex:1;min-width:0;width:100%;
    font-family:var(--pall-font-reading,Georgia,serif)}
  .scene-visuals{min-width:0}
  .illustration{position:relative;width:100%;aspect-ratio:1672 / 941;overflow:hidden}
  .ward{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;
    pointer-events:none}
  .scene-shade{position:absolute;inset:0;z-index:1;pointer-events:none;
    background:linear-gradient(90deg,#15100d3d,transparent 70%,#130e0c22)}
  .claudia{position:absolute;z-index:2;left:5%;bottom:0;
    height:92%;width:auto;max-width:40%;object-fit:contain;
    object-position:bottom center;pointer-events:none;
    filter:drop-shadow(1px 5px 8px #0b08077a)}
  .ward-foreground{z-index:3;clip-path:inset(88% 0 0 0)}
  .npc-hotspot{position:absolute;z-index:4;left:4%;top:7%;
    width:39%;height:84%;padding:0 0 6px;
    border:0;background:transparent;color:#f9dfb2;cursor:pointer;
    display:flex;align-items:flex-end;justify-content:center}
  .npc-hotspot:focus-visible{outline:2px solid #efd092;outline-offset:2px}
  .parchment{display:flex;flex-direction:column;box-sizing:border-box;
    width:100%;max-width:980px;margin:0 auto;
    min-height:0;max-height:none;overflow:visible;
    padding:clamp(20px,2.3vw,39px) clamp(19px,2.35vw,40px) 25px;
    border:2px solid #654022;border-radius:5px;
    background:#efdfbb;color:#251910;box-shadow:0 7px 15px #0008}
  .eyebrow{font:600 14px/1.25 var(--pall-font-label,'Arial Narrow',sans-serif);
    letter-spacing:.12em;color:#614029;margin:0 0 16px;padding:0 0 10px;
    border-bottom:1px solid #9e815955}
  h2{margin:0 0 12px;font:600 var(--dialogue-title,21px)/1.3
    var(--pall-font-reading,Georgia,serif)}
  .speaker{font:normal var(--dialogue-label,15px)/1.15
    var(--pall-font-label,'Arial Narrow',sans-serif);
    letter-spacing:.09em;color:#624328;margin:0 0 8px}
  .speech,.narration{font:600 var(--dialogue-text,17px)/1.55
    var(--pall-font-reading,Georgia,serif);margin:0 0 14px;color:#251910}
  .narration{font-style:italic}
  .note{font:13px/1.4 Georgia,serif;color:#765137}
  .responses{display:flex;flex-direction:column;gap:9px;margin-top:18px}
  .dialogue-navigation{border-top:1px solid #9e8159;margin-top:auto;padding-top:12px}
  .dialogue-navigation button{border:0;background:transparent;cursor:pointer;
    color:#543820;text-align:left;min-height:44px;
    font:600 var(--dialogue-text,17px)/1.3 var(--pall-font-reading,Georgia,serif)}
  .dialogue-navigation button span{font:24px/1 Georgia,serif}
  .dialogue-navigation button:focus-visible{outline:2px solid #b58e59}
  @container activity-panel (max-width:560px){.parchment{padding:20px 18px}}
  @container activity-stage (max-width:680px){
    .claudia{left:1%;height:95%;max-width:48%}
    .npc-hotspot{left:0;width:48%;top:5%;height:86%}
  }
</style>