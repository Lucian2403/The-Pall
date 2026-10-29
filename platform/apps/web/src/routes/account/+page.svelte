<script lang="ts">
  import {onMount} from 'svelte';
  import {goto} from '$app/navigation';
  import {authClient} from '$lib/auth-client';
  import '$lib/pall-owner-ui.css';
  import '$lib/pall-entry-pages.css';

  type Account={id:string;email:string;emailVerified:boolean};
  let account=$state<Account|null>(null);
  let mode=$state<'login'|'register'|'recover'>('login');
  let name=$state('');
  let email=$state('');
  let password=$state('');
  let busy=$state(false);
  let message=$state('');

  async function loadAccount(){
    try{
      const response=await fetch('/api/me',{cache:'no-store'});
      account=response.ok?await response.json() as Account:null;
    }catch{account=null;}
  }
  onMount(()=>{
    const requested=new URLSearchParams(window.location.search).get('mode');
    if(requested==='register')mode='register';
    if(requested==='recover')mode='recover';
    void loadAccount();
  });

  async function submit(){
    if(busy)return;
    busy=true;message='';
    try{
      if(mode==='register'){
        const result=await authClient.signUp.email({
          name,email,password,callbackURL:'/account'
        });
        message=result.error?.message??'Account created. Check the local verification inbox for the confirmation message.';
      }else if(mode==='login'){
        const result=await authClient.signIn.email({email,password});
        message=result.error?.message??'Signed in.';
        if(!result.error){
          await loadAccount();
          // Until an approved first-view flag exists, intro remains replayable.
          await goto('/introduction');
        }
      }else{
        const result=await authClient.requestPasswordReset({
          email,redirectTo:'/account/reset-password'
        });
        message=result.error?.message??'If this account exists, a password-reset message has been sent to the local inbox.';
      }
    }catch{
      message='Authentication is unavailable. Check the local API and email service.';
    }finally{
      busy=false;password='';
    }
  }
  async function logout(){
    busy=true;message='';
    try{
      await authClient.signOut();
      await loadAccount();
      message='Signed out.';
    }catch{message='Could not sign out. Check your connection.';}
    finally{busy=false;}
  }
</script>

<svelte:head><title>The Pall — Account Access</title></svelte:head>
<div class="entry-page account-page">
  <div class="entry-wrap">
    <!-- Match the approved homepage: one uninterrupted city vista covers navigation and title. -->
    <div class="account-masthead">
      <nav class="entry-nav" aria-label="Page navigation">
        <a class="brand" href="/" aria-label="The Pall, home">
          <img src="/ui-kit/branding/logo-compact.png" alt="The Pall"/>
        </a>
        <div class="entry-links">
          <a href="/">Home</a>
          <a href="/introduction">The world</a>
          <a href="/characters">Characters</a>
        </div>
      </nav>
      <header class="entry-hero">
        <div>
          <span class="entry-eyebrow">THE PALL · ACCOUNT</span>
          <h1>Enter the world</h1>
        </div>
      </header>
    </div>
    <main class="entry-content account-content">
      <section class="account-panel">
        {#if account}
          <p class="entry-eyebrow">YOUR ACCOUNT</p>
          <h2>Welcome back.</h2>
          <p>Signed in as <strong>{account.email}</strong></p>
          <p class="entry-muted">Email verified: {account.emailVerified?'Yes':'No'}</p>
          <div class="entry-action-row">
            <a class="entry-button" href="/characters">Your characters</a>
            <a class="entry-button" href="/backgrounds">Create a character</a>
            <a class="account-secondary" href="/introduction">Read world introduction</a>
          </div>
          <button class="sign-out" disabled={busy} type="button" onclick={()=>{void logout();}}>Sign out</button>
        {:else}
          <p class="entry-eyebrow">JOIN THE PALL</p>
          <h2>{mode==='login'?'Sign in':mode==='register'?'Create your account':'Recover your account'}</h2>
          <p class="entry-muted">{mode==='login'
            ? 'Return to your characters and continue where you left off.'
            : mode==='register'
              ? 'Your first step into a world of professions, difficult choices and long-term progression.'
              : 'Request a password-reset message for your account.'}</p>
          <nav class="account-tabs" aria-label="Account actions">
            <button type="button" class:active={mode==='login'}
              onclick={()=>{mode='login';message='';}}>Sign in</button>
            <button type="button" class:active={mode==='register'}
              onclick={()=>{mode='register';message='';}}>Create account</button>
            <button type="button" class:active={mode==='recover'}
              onclick={()=>{mode='recover';message='';}}>Forgot password</button>
          </nav>
          <form onsubmit={(event)=>{event.preventDefault();void submit();}}>
            {#if mode==='register'}
              <label>Account label <span>(not your character name)</span>
                <input bind:value={name} minlength="2" maxlength="80" autocomplete="nickname" required/>
              </label>
            {/if}
            <label>Email address
              <input type="email" bind:value={email} autocomplete="email" required/>
            </label>
            {#if mode!=='recover'}
              <label>Password <span>(12 characters minimum)</span>
                <input type="password" bind:value={password} minlength="12"
                  autocomplete={mode==='login'?'current-password':'new-password'} required/>
              </label>
            {/if}
            <button class="entry-button submit" disabled={busy} type="submit">
              {busy?'Working…':mode==='login'?'Sign in':mode==='register'?'Create account':'Request password reset'}
            </button>
          </form>
        {/if}
        {#if message}<p role="status" class="account-message">{message}</p>{/if}
      </section>
      <aside class="account-aside">
        <p class="entry-eyebrow">A PERSISTENT WORLD</p>
        <h2>Your own path.</h2>
        <p>Develop your skills, take on work, trade and prepare for ventures beyond the city. No fixed classes. No pay-to-win mechanics.</p>
        <a class="entry-button aside-link" href="/introduction">Discover the world</a>
        <p class="local-note">Development note: local account verification messages are available in the <a href="http://127.0.0.1:8025" target="_blank" rel="noopener noreferrer">Mailpit inbox</a>. This is not a production email service.</p>
      </aside>
    </main>
  </div>
</div>
<style>
  /* Account keeps its original nav / hero / two-column form hierarchy.
     Only its presentation changes; shared entry-page CSS stays untouched. */
  .account-page{padding-top:13px}
  .account-page .entry-wrap{max-width:1160px}

  /* The same Grand Cylinder panorama and uninterrupted overlay as the homepage. */
  .account-masthead{
    position:relative;
    isolation:isolate;
    overflow:hidden;
    border:1px solid #745538;
    background:#24201b url('/ui-kit/resources/TheCityVista.png') center 31%/cover no-repeat;
  }
  .account-masthead::before{
    content:'';
    position:absolute;
    inset:0;
    z-index:0;
    pointer-events:none;
    background:
      linear-gradient(90deg,#15120fec 0%,#15120fc6 27%,#15120f37 67%,transparent 100%),
      linear-gradient(180deg,#100e0cbd 0%,#100e0c55 25%,transparent 58%);
  }
  .account-page .entry-nav{
    position:relative;
    z-index:1;
    flex-wrap:wrap;
    gap:12px;
    padding:10px clamp(14px,2.4vw,30px) 12px;
    border:0;
    background:transparent;
  }
  .account-page .entry-nav .brand img{
    display:block;
    width:clamp(174px,17vw,228px);
    max-height:118px;
    height:auto;
    object-fit:contain;
    filter:drop-shadow(0 2px 5px #0b0807cc);
  }
  .account-page .entry-links{
    justify-content:flex-end;
    gap:clamp(5px,.7vw,10px);
  }
  /* Reuse the owner's three-state artwork for navigation, at compact scale. */
  .account-page .entry-links a,
  .account-page .entry-button,
  .account-page .account-tabs button,
  .account-page .sign-out{
    display:inline-flex;
    align-items:center;
    justify-content:center;
    border-style:solid;
    border-color:transparent;
    border-image-source:url('/ui-kit/buttons/button-normal-trim.png');
    border-image-slice:50 180 45 180 fill;
    border-image-repeat:stretch;
    border-radius:0;
    background:transparent;
    color:#25170e;
    font:600 15px/1.3 var(--pall-font-reading,Georgia,serif);
    text-align:center;
    text-decoration:none;
    text-shadow:none;
    cursor:pointer;
  }
  .account-page .entry-links a{
    min-height:42px;
    padding:2px 5px;
    border-width:10px 21px 9px;
    border-image-width:10px 21px 9px;
    white-space:nowrap;
  }
  .account-page .entry-links a:hover,
  .account-page .entry-button:hover:not(:disabled),
  .account-page .account-tabs button:hover:not(.active),
  .account-page .sign-out:hover:not(:disabled){
    border-image-source:url('/ui-kit/buttons/button-hover-trim.png');
    color:#170d08;
    background:transparent;
    text-decoration:none;
  }
  .account-page .entry-links a:active,
  .account-page .entry-button:active:not(:disabled),
  .account-page .account-tabs button:active,
  .account-page .sign-out:active:not(:disabled){
    border-image-source:url('/ui-kit/buttons/button-pressed-trim.png');
  }
  .account-page .entry-links a:focus-visible,
  .account-page .entry-button:focus-visible,
  .account-page .account-tabs button:focus-visible,
  .account-page .sign-out:focus-visible{
    outline:2px solid #f0bf7c;
    outline-offset:3px;
  }

  .account-page .entry-hero{
    position:relative;
    z-index:1;
    display:flex;
    align-items:flex-end;
    min-height:clamp(190px,20vw,230px);
    max-height:none;
    border:0;
    padding:clamp(24px,3vw,40px);
    background:transparent;
  }
  .account-page .entry-hero::after{
    content:'';
    position:absolute;
    inset:0;
    z-index:0;
    pointer-events:none;
    background:linear-gradient(0deg,#15120fc9,transparent 67%);
  }
  .account-page .entry-hero > div{position:relative;z-index:1}
  .account-page .entry-hero h1{
    margin:8px 0 0;
    font:600 clamp(34px,4vw,54px)/1.13 var(--pall-font-reading,Georgia,serif);
    letter-spacing:-.02em;
    color:#f7e5cd;
  }

  /* Original form/aside grid retained, with separate parchment frames. */
  .account-page .account-content{
    display:grid;
    grid-template-columns:minmax(0,1.35fr) minmax(260px,.7fr);
    align-items:start;
    gap:clamp(18px,2.8vw,36px);
    padding:clamp(20px,3.2vw,43px);
    border:1px solid #59452f;
    border-top:0;
    background:radial-gradient(ellipse at 52% 0%,#30271d 0%,#1b1916 75%);
  }
  .account-page .account-panel,
  .account-page .account-aside{
    min-width:0;
    border-style:solid;
    border-color:transparent;
    border-width:27px 31px 25px;
    border-image-source:url('/ui-kit/frames/dialogue-frame-trim.png');
    border-image-slice:145 190 125 190 fill;
    border-image-width:27px 31px 25px;
    border-image-repeat:stretch;
    border-radius:0;
    background:transparent;
    box-shadow:0 8px 22px #0007;
    color:#2b1b10;
    padding:14px clamp(11px,1.6vw,21px) 19px;
  }
  .account-page .account-panel{max-width:570px;width:100%}
  .account-page .account-aside{width:100%}
  .account-page .account-panel h2,
  .account-page .account-aside h2{
    margin:8px 0 13px;
    color:#28180e;
    font:600 clamp(24px,2.4vw,31px)/1.18 var(--pall-font-reading,Georgia,serif);
    text-shadow:none;
  }
  .account-page .account-panel p,
  .account-page .account-aside p{
    color:#352519;
    font:400 16px/1.55 Georgia,'Times New Roman',serif;
    overflow-wrap:anywhere;
  }
  .account-page .account-panel .entry-eyebrow,
  .account-page .account-aside .entry-eyebrow{
    color:#654027;
    font-weight:700;
  }
  .account-page .account-panel .entry-muted{color:#604936}
  .account-page .account-panel strong{color:#24150c}
  .account-page .account-aside a:not(.entry-button),
  .account-page .account-secondary{
    color:#613719;
    font-weight:700;
    text-underline-offset:3px;
  }
  .account-page .account-aside .local-note{
    margin:30px 0 0;
    padding-top:15px;
    border-top:1px solid #a48a68;
    color:#594736;
    font:13px/1.5 Georgia,'Times New Roman',serif;
  }

  /* The mode selector reads as three compact, stateful game buttons. */
  .account-page .account-tabs{
    display:flex;
    flex-wrap:wrap;
    gap:7px;
    margin:21px 0 19px;
  }
  .account-page .account-tabs button{
    flex:1 1 auto;
    min-height:44px;
    padding:2px 4px;
    border-width:10px 19px 9px;
    border-image-width:10px 19px 9px;
    font-size:14px;
    white-space:nowrap;
  }
  .account-page .account-tabs button.active{
    border-image-source:url('/ui-kit/buttons/button-pressed-trim.png');
    color:#1e120b;
    filter:brightness(.93);
  }
  .account-page form label{
    display:block;
    margin:0 0 15px;
    color:#352215;
    font:600 15px/1.4 var(--pall-font-reading,Georgia,serif);
  }
  .account-page form label span{font-weight:400;color:#644b37}
  .account-page form input{
    display:block;
    width:100%;
    box-sizing:border-box;
    min-height:46px;
    margin-top:7px;
    padding:10px 12px;
    background:#f8eddb;
    color:#24160f;
    border:1px solid #816144;
    border-radius:0;
    box-shadow:inset 0 2px 4px #3c29141f;
    font:16px/1.4 Georgia,'Times New Roman',serif;
  }
  .account-page form input:focus-visible{
    outline:2px solid #76502d;
    outline-offset:2px;
    border-color:#614124;
  }
  .account-page .entry-button,
  .account-page .sign-out{
    min-height:48px;
    padding:3px 9px;
    border-width:12px 29px 11px;
    border-image-width:12px 29px 11px;
  }
  .account-page .submit{display:flex;width:100%;margin-top:12px}
  .account-page .entry-action-row{gap:8px;flex-wrap:wrap}
  .account-page .entry-action-row .entry-button{flex:1 1 180px}
  .account-page .aside-link{margin-top:6px}
  .account-page .sign-out{margin-top:19px}
  .account-page .entry-button:disabled,
  .account-page .sign-out:disabled{opacity:.57;cursor:wait}
  .account-page .account-message{
    margin:19px 0 0;
    padding:12px;
    border-left:3px solid #8a5530;
    background:#d4bea183;
    color:#372016;
    font:600 14px/1.5 Georgia,'Times New Roman',serif;
    overflow-wrap:anywhere;
  }

  @media(max-width:750px){
    .account-page .entry-nav{padding:8px 13px 10px}
    .account-page .entry-links{width:100%;justify-content:flex-start;gap:5px 8px}
    .account-page .entry-links a{
      min-height:37px;
      padding:1px 3px;
      border-width:8px 17px;
      border-image-width:8px 17px;
      font-size:14px;
    }
    .account-page .entry-nav .brand img{width:clamp(162px,35vw,205px);max-height:110px}
    .account-masthead{background-position:55% 31%}
    .account-masthead::before{
      background:
        linear-gradient(180deg,#15120fdb 0%,#15120f70 38%,transparent 72%),
        linear-gradient(90deg,#15120fd9,#15120f22 100%);
    }
    .account-page .entry-hero{min-height:190px;padding:23px 21px}
    .account-page .account-content{grid-template-columns:1fr;gap:15px}
    .account-page .account-panel,.account-page .account-aside{max-width:100%}
  }
  @media(max-width:420px){
    .account-page{padding:9px}
    .account-page .account-content{padding:12px}
    .account-page .account-panel,.account-page .account-aside{
      border-width:23px 25px 22px;
      border-image-width:23px 25px 22px;
      padding:10px 8px 14px;
    }
    .account-page .account-tabs{gap:5px}
    .account-page .account-tabs button{
      border-width:8px 15px;
      border-image-width:8px 15px;
      min-height:41px;
      padding:1px 2px;
      font-size:13px;
    }
  }
</style>