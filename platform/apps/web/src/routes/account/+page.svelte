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
    <nav class="entry-nav" aria-label="Page navigation">
      <a class="brand" href="/">
        <img src="/ui-kit/branding/logo-compact.png" alt="The Pall"/>
        <span>A CITY ENDURES</span>
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
        <a href="/introduction">Discover the world</a>
        <p class="local-note">Development note: local account verification messages are available in the <a href="http://127.0.0.1:8025" target="_blank" rel="noopener noreferrer">Mailpit inbox</a>. This is not a production email service.</p>
      </aside>
    </main>
  </div>
</div>
<style>
  .account-page .entry-wrap{max-width:1160px}
  .entry-hero{min-height:205px;max-height:250px}
  .account-content{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(260px,.7fr);
    gap:clamp(22px,4vw,65px);align-items:start;padding:clamp(22px,3.2vw,45px)}
  .account-panel{max-width:570px}
  .account-panel h2{margin:8px 0 11px}
  .account-panel p{line-height:1.5}
  .account-tabs{display:flex;flex-wrap:wrap;gap:8px;margin:22px 0 21px}
  .account-tabs button{appearance:none;cursor:pointer;padding:9px 12px;
    border:1px solid #8b6d49;background:#322a20;color:#dfc7a3;
    font:600 14px/1.3 var(--pall-font-reading,Georgia,serif)}
  .account-tabs button.active{background:#735339;border-color:#e5ba83;color:#fff0d8}
  form label{display:block;margin:0 0 15px;font:600 15px/1.4 var(--pall-font-reading,Georgia,serif)}
  form label span{font-weight:400;color:#cfb99b}
  form input{display:block;width:100%;box-sizing:border-box;margin-top:8px;padding:12px;
    background:#f0e5d1;color:#271c13;border:1px solid #91734f;
    font:16px/1.4 var(--pall-font-reading,Georgia,serif)}
  .submit{width:100%;margin-top:8px}
  .account-message{border-left:3px solid #c99b61;background:#30271e;padding:12px;color:#f3d4a7}
  .account-secondary,.account-aside a{color:#e5bd88}
  .sign-out{display:block;margin-top:22px;background:none;border:none;padding:6px 0;
    color:#e2bb83;cursor:pointer;text-decoration:underline;
    font:600 14px var(--pall-font-reading,Georgia,serif)}
  .account-aside{border-left:1px solid #644c35;padding-left:clamp(18px,2.6vw,38px)}
  .account-aside h2{margin:8px 0 13px}
  .account-aside p{color:#d6c2a9;font:16px/1.58 var(--pall-font-reading,Georgia,serif)}
  .account-aside .local-note{margin-top:36px;font:13px/1.45 var(--pall-font-reading,Georgia,serif);color:#b7a28c}
  @media(max-width:750px){.account-content{grid-template-columns:1fr}.account-aside{border-left:0;border-top:1px solid #644c35;padding:18px 0 0}}
</style>