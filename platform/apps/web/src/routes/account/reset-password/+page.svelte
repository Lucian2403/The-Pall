<script lang="ts">
  import {onMount} from 'svelte';
  import {authClient} from '$lib/auth-client';
  let token = $state('');
  let password = $state('');
  let message = $state('');
  let busy = $state(false);
  onMount(() => {
    token = new URLSearchParams(window.location.search).get('token') ?? '';
    if (!token) message = 'Reset link is missing, invalid or expired. Request another reset.';
  });
  async function submit() {
    if (!token || busy) return;
    busy = true;
    const result = await authClient.resetPassword({token, newPassword: password});
    message = result.error ? (result.error.message ?? 'Password reset failed.') : 'Password updated. Return to sign in.';
    password = '';
    busy = false;
  }
</script>

<svelte:head><title>The Pall — Reset password</title></svelte:head>
<main>
  <p class="eyebrow">THE PALL / ACCOUNT</p>
  <h1>Set a new password</h1>
  <form onsubmit={(event) => {event.preventDefault(); void submit();}}>
    <label>New password <input type="password" minlength="12" autocomplete="new-password" bind:value={password} required /></label>
    <button disabled={busy || !token}>{busy ? 'Updating…' : 'Update password'}</button>
  </form>
  <p role="status">{message}</p>
  <a href="/account">Back to sign in</a>
</main>
<style>
  :global(body){margin:0;background:#151617;color:#e6dfce;font-family:Georgia,serif}
  main{max-width:520px;margin:8vh auto;padding:24px;border:1px solid #7b6047;background:#22221f}
  .eyebrow{font:11px sans-serif;letter-spacing:.15em;color:#c8a477}
  h1{font-weight:normal} label{display:block;margin:1rem 0} input{display:block;width:100%;box-sizing:border-box;margin-top:8px;padding:10px}
  button{padding:10px 16px;cursor:pointer}a{color:#d6b58d}p[role=status]{min-height:1.5em}
</style>
