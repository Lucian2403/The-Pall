import {strict as assert} from 'node:assert';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';

const page=readFileSync(resolve(import.meta.dirname,'../apps/web/src/routes/account/+page.svelte'),'utf8');
const markup=page.slice(0,page.indexOf('<style>'));
const styles=page.slice(page.indexOf('<style>'));

for(const fragment of [
  "requested==='register'",
  "requested==='recover'",
  "authClient.signUp.email",
  "authClient.signIn.email",
  "authClient.requestPasswordReset",
  "authClient.signOut()",
  "await goto('/introduction')",
  "{#if account}",
  "mode==='login'",
  "mode==='register'",
  "mode==='recover'",
  'bind:value={name}',
  'bind:value={email}',
  'bind:value={password}',
  'minlength="12"',
  'role="status"'
]){
  assert.ok(markup.includes(fragment),'Missing account flow or form contract: '+fragment);
}
assert.equal((markup.match(/<form /g)||[]).length,1,'Keep the existing one-form account flow');
assert.ok(markup.includes('class="account-masthead"') &&
  markup.includes('class="entry-nav"') &&
  markup.includes('class="entry-hero"') &&
  markup.includes('class="account-content') &&
  markup.includes('class="account-panel"') &&
  markup.includes('class="account-aside"'),
  'Preserve navigation, city heading and the original form/aside layout');
assert.ok(markup.includes('/ui-kit/branding/logo-compact.png') &&
  !markup.includes('A CITY ENDURES'),'Account header must match approved owner logo');

const accountBackdrop=styles.slice(styles.indexOf('  .account-masthead{'),styles.indexOf('  .account-page .entry-nav{'));
assert.ok(accountBackdrop.includes("background:#24201b url('/ui-kit/resources/TheCityVista.png')") &&
  accountBackdrop.includes('linear-gradient(90deg,#15120fec') &&
  accountBackdrop.includes('linear-gradient(180deg,#100e0cbd'),
  'Single city vista and shared homepage gradient must cover navigation and title');
assert.ok(styles.includes('grid-template-columns:minmax(0,1.35fr) minmax(260px,.7fr)') &&
  styles.includes('grid-template-columns:1fr'),
  'Retain desktop form/aside columns and stack on mobile');
for(const artwork of [
  '/ui-kit/frames/dialogue-frame-trim.png',
  '/ui-kit/buttons/button-normal-trim.png',
  '/ui-kit/buttons/button-hover-trim.png',
  '/ui-kit/buttons/button-pressed-trim.png'
]){
  assert.ok(styles.includes(artwork),'Missing approved nine-slice asset: '+artwork);
}
assert.ok(styles.includes('border-image-slice:145 190 125 190 fill') &&
  styles.includes('border-image-slice:50 180 45 180 fill') &&
  styles.includes('.account-page .account-tabs button.active{') &&
  styles.includes('.account-page .entry-links a:focus-visible') &&
  styles.includes('.account-page form input:focus-visible'),
  'Parchment, frame states, active mode and keyboard contrast must remain usable');
console.log('PASS: Account page layout, all auth modes, shared city masthead, parchment frames, button states and mobile rules.');
