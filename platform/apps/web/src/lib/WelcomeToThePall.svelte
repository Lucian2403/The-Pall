<script lang="ts">
  import {onMount} from 'svelte';

  let {characterId,onStarted}:{
    characterId:string;
    onStarted:()=>void|Promise<void>;
  }=$props();
  let dialog:HTMLDialogElement;
  let pending=$state(false);
  let errorMessage=$state('');

  onMount(()=>{
    // showModal makes the entire underlying interface inert to pointer and
    // keyboard input, traps focus, and supplies the blocking backdrop.
    dialog.showModal();
    return ()=>{if(dialog.open)dialog.close();};
  });

  async function beginStory(){
    if(pending)return;
    pending=true;errorMessage='';
    try{
      const response=await fetch('/api/characters/'+encodeURIComponent(characterId)+'/welcome',{
        method:'POST',headers:{'content-type':'application/json'},body:'{}'
      });
      const result=await response.json() as {welcomeSeen?:boolean;error?:string};
      if(!response.ok||result.welcomeSeen!==true){
        errorMessage='Your introduction could not be saved. Try again before entering the story.';
        return;
      }
      // Never dismiss until the acknowledgement has been committed.
      await onStarted();
    }catch{
      errorMessage='Connection interrupted. Your introduction remains open until it can be saved.';
    }finally{
      pending=false;
    }
  }
</script>

<dialog bind:this={dialog} class="welcome-dialog" aria-labelledby="welcome-title"
  aria-describedby="welcome-subtitle" oncancel={(event)=>event.preventDefault()}>
  <div class="welcome-inner">
    <h1 id="welcome-title">WELCOME TO THE PALL</h1>
    <h2 id="welcome-subtitle">YOUR STORY BEGINS HERE</h2>
    <div class="welcome-copy">
      <p>You've created your character and chosen your background. This decides where your journey begins, the people you'll meet, and the kind of work you'll face first. It gives you an advantage in a specific skill, but it won't decide who you'll become.</p>
      <p>Your first steps won't be easy. You'll meet people, face trouble, and make choices that can develop other skills and shape your path.</p>
      <p>First, you must complete your background's <strong>story stages</strong>. The rest of the game remains locked until you've finished them.</p>
      <p>Once you've completed the introduction, the wider world of The Pall opens up. What you do next is up to you.</p>
    </div>
    {#if errorMessage}<p class="welcome-error" role="alert">{errorMessage}</p>{/if}
    <button type="button" class="welcome-begin" disabled={pending} onclick={beginStory}>
      {pending?'Saving…':'Begin Your Story'}
    </button>
  </div>
</dialog>

<style>
  .welcome-dialog{
    position:fixed;inset:0;margin:auto;
    box-sizing:border-box;width:min(760px,calc(100vw - 20px));
    max-width:760px;max-height:min(94dvh,820px);
    overflow-y:auto;overscroll-behavior:contain;
    padding:0;border:solid transparent;border-width:30px 34px 29px;
    border-image-source:url('/ui-kit/frames/dialogue-frame-trim.png');
    border-image-slice:145 190 125 190 fill;
    border-image-repeat:stretch;
    /* Nine-slice fill already paints the parchment. A solid dialog background
       leaks through the frame's transparent corner pixels as pale squares. */
    color:#302015;background:transparent;
    box-shadow:0 18px 65px #000b;
  }
  .welcome-dialog::backdrop{background:#0c0b0ae8;backdrop-filter:blur(4px)}
  .welcome-inner{padding:clamp(12px,2.4vw,27px);min-width:0;text-align:center}
  .welcome-inner h1{font:700 clamp(25px,3.6vw,38px)/1.2 var(--pall-font-reading,Georgia,serif);
    letter-spacing:.025em;color:#2f1e10;margin:0}
  .welcome-inner h2{font:700 clamp(15px,2.1vw,20px)/1.3 var(--pall-font-reading,Georgia,serif);
    color:#6c4526;letter-spacing:.08em;margin:12px 0 18px}
  .welcome-copy{text-align:left;max-width:610px;margin:0 auto 23px;
    padding-top:14px;border-top:1px solid #b2946b}
  .welcome-copy p{margin:0 0 13px;font:700 clamp(15px,1.75vw,17px)/1.58
    var(--pall-font-reading,Georgia,serif);color:#352315}
  .welcome-copy strong{font-weight:700;color:#2c1b0e}
  .welcome-begin{appearance:none;display:block;margin:0 auto;min-height:55px;
    width:min(315px,100%);cursor:pointer;box-sizing:border-box;
    border:solid transparent;border-width:13px 27px 12px;
    border-image-source:url('/ui-kit/buttons/button-normal-trim.png');
    border-image-slice:50 180 45 180 fill;
    color:#2f1b0e;background:transparent;
    font:700 17px/1.25 var(--pall-font-reading,Georgia,serif)}
  .welcome-begin:hover:not(:disabled),.welcome-begin:focus-visible{
    border-image-source:url('/ui-kit/buttons/button-hover-trim.png')}
  .welcome-begin:focus-visible{outline:3px solid #9f6535;outline-offset:3px}
  .welcome-begin:disabled{opacity:.7;cursor:wait}
  .welcome-error{font:700 14px/1.45 var(--pall-font-reading,Georgia,serif);
    color:#782817;margin:0 auto 16px;max-width:530px}
  @media(max-width:520px){
    .welcome-dialog{width:calc(100vw - 12px);max-height:96dvh;
      border-width:17px 16px 17px}
    .welcome-inner{padding:8px}
    .welcome-copy p{font-size:15px;line-height:1.48}
    .welcome-inner h2{margin:8px 0 12px}
  }
</style>
