// Non-destructive M1.2 smoke check. Never uses player credentials or mutates state.
import {strict as assert} from 'node:assert';

const origin = 'http://127.0.0.1:8788';
async function request(path, options = {}) {
  try {
    const response = await fetch(origin + path, {...options, redirect: 'manual'});
    return {status: response.status, body: await response.json().catch(() => null)};
  } catch (error) {
    const reason = error instanceof Error && error.cause instanceof Error ? error.cause.message : String(error);
    throw new Error(`API unavailable at ${origin}: ${reason}. Start npm run dev:api in another terminal.`);
  }
}
function unauthorized(result, what) {
  assert.equal(result.status, 401, `${what}: expected 401, got ${result.status}`);
  assert.equal(result.body?.error, 'unauthorized', `${what}: expected unauthenticated response`);
}
try {
  const health = await request('/health');
  assert.equal(health.status, 200);
  console.log('PASS: API reachable');
  unauthorized(await request('/api/characters'), 'Anonymous roster');
  console.log('PASS: Anonymous character roster rejected');
  unauthorized(await request('/api/characters/00000000-0000-4000-8000-000000000001'), 'Anonymous character detail');
  console.log('PASS: Anonymous character detail rejected');
  unauthorized(await request('/api/characters', {
    method: 'POST', headers: {'content-type':'application/json','origin':'http://127.0.0.1:5173'},
    body: JSON.stringify({requestId:'b3bc8b6f-b9c3-4f37-94eb-47b455c9a394',expectedRevision:0,
      name:'Fake Character', sex:'Male', origin:'Millhand'})
  }), 'Anonymous creation');
  console.log('PASS: Anonymous character creation rejected');
  unauthorized(await request('/api/characters', {headers: {
    'x-account-id': '00000000-0000-4000-8000-000000000001',
    'authorization': 'Bearer forged', 'cookie': 'better-auth.session_token=forged'
  }}), 'Forged identity');
  console.log('PASS: Forged user/session cannot list characters');
  console.log('M1.2 anonymous character API smoke check passed; owned creation/races require logged-in browser QA.');
} catch (error) {
  console.error('FAILED:', error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
