// Non-mutating M1.1 security smoke checks. This is NOT a full auth/security audit.
// Native node fetch does not inherit cookies from the user's browser session.
import { strict as assert } from 'node:assert';

const base = 'http://127.0.0.1:8788';
async function get(path, headers = {}) {
  const response = await fetch(base + path, { headers, redirect: 'manual' });
  const body = await response.json().catch(() => null);
  return {status: response.status, body};
}
function expectUnauthorized(result, reason) {
  assert.equal(result.status, 401, `${reason}: expected 401, got ${result.status}`);
  assert.equal(result.body?.error, 'unauthorized', `${reason}: unexpected response body`);
}

try {
  const health = await get('/health');
  assert.equal(health.status, 200, 'API /health must be reachable');
  console.log('PASS: API health endpoint reachable');

  expectUnauthorized(await get('/api/me'), 'Unauthenticated session');
  console.log('PASS: /api/me rejects requests without a session cookie');

  expectUnauthorized(
    await get('/api/me', {'x-account-id': '00000000-0000-4000-8000-000000000001', 'x-user-id': 'someone-else'}),
    'Forged account identity headers'
  );
  console.log('PASS: Client-controlled identity headers cannot authenticate');

  expectUnauthorized(
    await get('/api/me', {'authorization': 'Bearer not-a-valid-session'}),
    'Invented bearer token'
  );
  console.log('PASS: Invented bearer token cannot authenticate');

  console.log('M1.1 unauthenticated access smoke checks passed. Two-account browser isolation still requires separate QA.');
} catch (err) {
  console.error('FAILED:', err instanceof Error ? err.message : String(err));
  process.exitCode = 1;
}
