<script lang="ts">
  import {onMount} from 'svelte';
  let {title,durationSeconds,description,onConfirm,onCancel}:{
    title:string;durationSeconds:number;description:string;onConfirm:()=>void;onCancel:()=>void;
  }=$props();
  let dialog:HTMLDialogElement;
  let cancelButton:HTMLButtonElement;
  const duration=$derived(durationSeconds>=60
    ?Math.floor(durationSeconds/60)+' min'+(durationSeconds%60?' '+durationSeconds%60+' sec':'')
    :durationSeconds+' seconds');
  onMount(()=>{
    const previous=document.activeElement;
    dialog.showModal();
    cancelButton.focus();
    return ()=>{
      dialog.close();
      if(previous instanceof HTMLElement&&previous.isConnected)previous.focus();
    };
  });
</script>

<dialog bind:this={dialog} aria-labelledby="activity-confirm-title" aria-describedby="activity-confirm-description"
  oncancel={(event)=>{event.preventDefault();onCancel();}}>
  <p class="eyebrow">CONFIRM ACTIVITY</p>
  <h2 id="activity-confirm-title">{title}</h2>
  <p id="activity-confirm-description">{description}</p>
  <p><strong>Duration: {duration}</strong></p>
  <div class="actions">
    <button type="button" bind:this={cancelButton} class="pall-framed-button" onclick={onCancel}>Cancel</button>
    <button type="button" class="pall-framed-button" onclick={onConfirm}>Confirm</button>
  </div>
</dialog>

<style>
  dialog{box-sizing:border-box;width:min(460px,calc(100vw - 24px));max-height:calc(100dvh - 24px);overflow:auto;
    color:#2b1c11;background:#ead5af;border:solid transparent;border-width:21px 25px 20px;
    border-image-source:url('/ui-kit/frames/dialogue-frame-trim.png');border-image-slice:145 190 125 190 fill;
    border-image-width:21px 25px 20px;border-image-repeat:stretch;padding:16px 18px;
    font:17px/1.5 var(--pall-font-reading,Georgia,serif);box-shadow:0 8px 32px #0009}
  dialog::backdrop{background:#100d09b8}
  h2{font-size:24px;line-height:1.2;margin:0 0 14px}
  p{margin:0 0 14px}
  .eyebrow{font:600 14px/1.2 var(--pall-font-label,Georgia,serif);letter-spacing:.07em}
  .actions{display:flex;gap:10px;flex-wrap:wrap;justify-content:flex-end}
  button{min-height:44px;flex:1}
  button:focus-visible{outline:2px solid #956728;outline-offset:3px}
</style>
