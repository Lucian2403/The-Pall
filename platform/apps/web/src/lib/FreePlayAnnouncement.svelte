<script lang="ts">
  import {onMount} from 'svelte';

  let {characterId,onAcknowledged}:{
    characterId:string;
    onAcknowledged:()=>void|Promise<void>;
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

  async function enterCity(){
    if(pending)return;
    pending=true;errorMessage='';
    try{
      const response=await fetch('/api/characters/'+encodeURIComponent(characterId)+'/free-play/announcement',{
        method:'POST',headers:{'content-type':'application/json'},body:'{}'
      });
      const result=await response.json() as {unlocked?:boolean;announcementSeen?:boolean;error?:string};
      if(!response.ok||result.unlocked!==true||result.announcementSeen!==true){
        errorMessage='Your Free Play acknowledgement could not be saved. Try again before entering the city.';
        return;
      }
      // Never dismiss until the acknowledgement has been committed.
      await onAcknowledged();
    }catch{
      errorMessage='Connection interrupted. The announcement remains open until your acknowledgement can be saved.';
    }finally{
      pending=false;
    }
  }
</script>

<dialog bind:this={dialog} class="free-play-dialog" aria-labelledby="free-play-title"
  aria-describedby="free-play-copy" oncancel={(event)=>event.preventDefault()}>
  <div class="free-play-inner">
    <h1 id="free-play-title">You're on your own now.</h1>
    <div id="free-play-copy" class="free-play-copy">
      <p>Your introduction to Grand Cylinder City is over. You've finished your first jobs, dealt with your share of trouble, and finally have some control over what happens next.</p>
      <p>You have a place to sleep, but the rent is due. You'll need money, and nobody is going to hand it to you.</p>
      <p>There's paid work to find. You can develop your skills, learn trades, craft equipment, repair what you own, and take on more dangerous jobs when you're ready.</p>
      <p>Almost every action takes real time. Your equipment has limits. Poor preparation and bad decisions can cost you money, supplies, or your life.</p>
      <p>You decide what work to accept, where to go, and how much risk you're willing to take.</p>
      <p>Grand Cylinder City is open to you.</p>
    </div>
    {#if errorMessage}<p class="free-play-error" role="alert">{errorMessage}</p>{/if}
    <button type="button" class="free-play-begin" disabled={pending} onclick={enterCity}>
      {pending?'Saving…':'Enter the City'}
    </button>
  </div>
</dialog>

<style>
  .free-play-dialog{
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
  .free-play-dialog::backdrop{background:#0c0b0ae8;backdrop-filter:blur(4px)}
  .free-play-inner{padding:clamp(12px,2.4vw,27px);min-width:0;text-align:center}
  .free-play-inner h1{font:700 clamp(25px,3.6vw,38px)/1.2 var(--pall-font-reading,Georgia,serif);
    letter-spacing:.025em;color:#2f1e10;margin:0}
  .free-play-copy{text-align:left;max-width:610px;margin:18px auto 23px;
    padding-top:14px;border-top:1px solid #b2946b}
  .free-play-copy p{margin:0 0 13px;font:700 clamp(15px,1.75vw,17px)/1.58
    var(--pall-font-reading,Georgia,serif);color:#352315}
  .free-play-begin{appearance:none;display:block;margin:0 auto;min-height:55px;
    width:min(315px,100%);cursor:pointer;box-sizing:border-box;
    border:solid transparent;border-width:13px 27px 12px;
    border-image-source:url('/ui-kit/buttons/button-normal-trim.png');
    border-image-slice:50 180 45 180 fill;
    color:#2f1b0e;background:transparent;
    font:700 17px/1.25 var(--pall-font-reading,Georgia,serif)}
  .free-play-begin:hover:not(:disabled),.free-play-begin:focus-visible{
    border-image-source:url('/ui-kit/buttons/button-hover-trim.png')}
  .free-play-begin:focus-visible{outline:3px solid #9f6535;outline-offset:3px}
  .free-play-begin:disabled{opacity:.7;cursor:wait}
  .free-play-error{font:700 14px/1.45 var(--pall-font-reading,Georgia,serif);
    color:#782817;margin:0 auto 16px;max-width:530px}
  @media(max-width:520px){
    .free-play-dialog{width:calc(100vw - 12px);max-height:96dvh;
      border-width:17px 16px 17px}
    .free-play-inner{padding:8px}
    .free-play-copy p{font-size:15px;line-height:1.48}
  }
</style>
