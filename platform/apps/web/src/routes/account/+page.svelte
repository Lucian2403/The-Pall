<script lang="ts">
  import {onMount} from 'svelte';
  import {authClient} from '$lib/auth-client';

  type Account = {id: string; email: string; emailVerified: boolean};
  let account = $state<Account | null>(null);
  let mode = $state<'login' | 'register' | 'recover'>('login');
  let name = $state('');
  let email = $state('');
  let password = $state('');
  let busy = $state(false);
  let message = $state('');

  async function loadAccount() {
    const response = await fetch('/api/me');
    account = response.ok ? await response.json() as Account : null;
  }
  onMount(() => { void loadAccount(); });

  async function submit() {
    if (busy) return;
    busy = true;
    message = '';
    try {
      if (mode === 'register') {
        const result = await authClient.signUp.email({
          name, email, password, callbackURL: '/account'
        });
        message = result.error?.message ?? 'Account created. Open the verification message in Mailpit (http://127.0.0.1:8025).';
      } else if (mode === 'login') {
        const result = await authClient.signIn.email({email, password});
        message = result.error?.message ?? 'Signed in.';
        if (!result.error) await loadAccount();
      } else {
        const result = await authClient.requestPasswordReset({
          email, redirectTo: '/account/reset-password'
        });
        message = result.error?.message ?? 'If this account exists, its password-reset link has been sent to Mailpit.';
      }
    } catch {
      message = 'The authentication API is unavailable. Check the server and Mailpit.';
    } finally {
      busy = false;
      password = '';
    }
  }
  async function logout() {
    busy = true;
    await authClient.signOut();
    await loadAccount();
    message = 'Signed out.';
    busy = false;
  }
</script>

<svelte:head><title>The Pall — Account</title></svelte:head>
<main>
  <p class="eyebrow">THE PALL / M1.1 LOCAL ACCOUNT TEST</p>
  <h1>Account access</h1>
  <p>This is a local authentication test, not the final game's login design.</p>

  {#if account}
    <p>Signed in as <strong>{account.email}</strong></p>
    <p>Email verified: {account.emailVerified ? 'Yes' : 'No'}</p>
    <button disabled={busy} onclick={() => {void logout();}}>Sign out</button>
  {:else}
    <nav aria-label="Account actions">
      <button class:active={mode === 'login'} onclick={() => {mode = 'login'; message = '';}}>Sign in</button>
      <button class:active={mode === 'register'} onclick={() => {mode = 'register'; message = '';}}>Register</button>
      <button class:active={mode === 'recover'} onclick={() => {mode = 'recover'; message = '';}}>Forgot password</button>
    </nav>
    <form onsubmit={(event) => {event.preventDefault(); void submit();}}>
      {#if mode === 'register'}
        <label>Account label (not character name)
          <input bind:value={name} minlength="2" maxlength="80" autocomplete="nickname" required />
        </label>
      {/if}
      <label>Email address
        <input type="email" bind:value={email} autocomplete="email" required />
      </label>
      {#if mode !== 'recover'}
        <label>Password (12 characters minimum)
          <input type="password" bind:value={password} minlength="12" autocomplete={mode === 'login' ? 'current-password' : 'new-password'} required />
        </label>
      {/if}
      <button disabled={busy} type="submit">{busy ? 'Working…' : mode === 'login' ? 'Sign in' : mode === 'register' ? 'Create account' : 'Request password reset'}</button>
    </form>
  {/if}
  <p role="status">{message}</p>
  <p class="help">Local verification emails: <a href="http://127.0.0.1:8025" target="_blank" rel="noopener noreferrer">Mailpit inbox</a>. Emails are not delivered to real addresses.</p>
  <p><a href="/">Return to M0 test fixture</a></p>
</main>
<style>
  :global(body){margin:0;background:#151617;color:#e6dfce;font-family:Georgia,serif}
  main{max-width:580px;margin:6vh auto;padding:26px;border:1px solid #7b6047;background:#22221f}
  h1{font-weight:normal}.eyebrow{font:11px sans-serif;letter-spacing:.15em;color:#c8a477}
  nav{display:flex;gap:8px;flex-wrap:wrap;margin:20px 0}
  label{display:block;margin:15px 0}input{display:block;box-sizing:border-box;width:100%;margin-top:7px;padding:11px;font:inherit;background:#f8f5ec;color:#1e1e1e}
  button{background:#3a2e21;color:#f2d5ab;border:1px solid #a47b4b;padding:10px 14px;cursor:pointer}
  button.active{background:#6a4e2c}button:disabled{opacity:.6}
  a{color:#dfbb8c}.help{font-size:13px;color:#b4a996}p[role=status]{min-height:1.5em}
</style>
