// M1.2 authenticated catalogue smoke checks.
// No sessions or user credentials are read by this script; no database mutations.
import {strict as assert} from 'node:assert';

const base = 'http://127.0.0.1:8788';
const path = '/api/characters/catalogue';

async function localFetch(url, options) {
  try {
    return await fetch(url, options);
  } catch (error) {
    const cause = error instanceof Error ? error.cause : null;
    const code = cause && typeof cause === 'object' && 'code' in cause ? String(cause.code) : 'connection error';
    const detail = cause instanceof Error ? cause.message : error instanceof Error ? error.message : String(error);
    throw new Error(`Cannot reach ${url} (${code}: ${detail}). Keep "npm run dev:api" running in a separate terminal and check ${base}/health.`);
  }
}

try {
  const health = await localFetch(base + '/health', {cache: 'no-store'});
  assert.equal(health.status, 200, `API health check expected HTTP 200 but returned ${health.status}. Check that the M1.2 API is running.`);
  console.log('PASS: Local API reachable');

  const anonymous = await localFetch(base + path, {cache: 'no-store'});
  assert.equal(anonymous.status, 401, `Anonymous catalogue request must return 401; got ${anonymous.status}. Restart the API after pulling the M1.2 routes.`);
  const anonymousBody = await anonymous.json();
  assert.equal(anonymousBody.error, 'unauthorized');
  console.log('PASS: Anonymous character catalogue access rejected');

  const forged = await localFetch(base + path, {
    headers: {
      'x-account-id': '00000000-0000-4000-8000-000000000001',
      'authorization': 'Bearer fake',
      'cookie': 'better-auth.session_token=fake'
    }
  });
  assert.equal(forged.status, 401, 'Forged catalogue authorization must return 401');
  console.log('PASS: Forged account/session identity rejected');

  console.log('The authenticated browser catalogue and wording require separate manual QA.');
} catch (error) {
  console.error('FAILED:', error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
