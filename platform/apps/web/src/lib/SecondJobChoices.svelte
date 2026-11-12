<script lang="ts">
  /** Shared Stage 3 second-job choice presentation across player origins.
   * This component only displays canonical option text and skill labels;
   * the parent owns server authorization, idempotency and progression.
   */
  type Choice={id:string;line:string;skill:string;disabled?:boolean};
  let {choices,onChoose}:{
    choices:readonly Choice[];
    onChoose:(choiceId:string)=>void;
  }=$props();
</script>

<div class="choices second-job-choices" role="group" aria-label="Choose your second job">
  {#each choices as choice (choice.id)}
    <button type="button" disabled={choice.disabled??false}
      onclick={()=>{onChoose(choice.id);}}>
      <span class="choice-line">“{choice.line}”</span>
      <span class="route">{choice.skill}</span>
    </button>
  {/each}
</div>

<style>
  /* Exact owner-supplied nine-slice card art used by The Missing Stamp.
     Never substitute Bellrunner's smaller generic action buttons here. */
  .second-job-choices{
    display:flex;
    flex-direction:column;
    gap:7px;
    margin-top:4px;
  }
  .second-job-choices>button{
    display:block;
    box-sizing:border-box;
    width:100%;
    min-height:94px;
    border-style:solid;
    border-color:transparent;
    border-width:13px 34px 12px;
    border-image-source:url('/ui-kit/buttons/button-normal-trim.png');
    border-image-slice:50 180 45 180 fill;
    border-image-width:13px 34px 12px;
    border-image-repeat:stretch;
    border-radius:0;
    background-color:transparent;
    color:#21140d;
    padding:6px 12px 5px;
    text-align:left;
    font:600 var(--dialogue-text,17px)/1.38
      var(--pall-font-reading,Georgia,serif);
    cursor:pointer;
    text-shadow:none;
  }
  .choice-line{display:block;min-width:0;overflow-wrap:break-word}
  .route{
    display:block;
    box-sizing:border-box;
    width:fit-content;
    max-width:100%;
    margin-top:6px;
    padding:2px 8px;
    background:#49301d;
    border:1px solid #63472a;
    color:#fff1d7;
    font:700 12px/1.45 sans-serif;
    text-shadow:none;
  }
  .second-job-choices>button:hover:not(:disabled),
  .second-job-choices>button:focus-visible{
    border-image-source:url('/ui-kit/buttons/button-hover-trim.png');
    color:#170d08;
    background-color:transparent;
  }
  .second-job-choices>button:active:not(:disabled){
    border-image-source:url('/ui-kit/buttons/button-pressed-trim.png');
  }
  .second-job-choices>button:focus-visible{
    outline:2px solid #e6ba75;
    outline-offset:2px;
  }
  .second-job-choices>button:disabled{opacity:.55;cursor:default}
</style>
