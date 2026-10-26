// M1.2 authenticated catalogue smoke checks.
// No sessions or user credentials are read by this script; no database mutations.
import {strict as assert} from 'node:assert';

const base = 'http://127.0.0.1:8788';
const path = '/api/characters/catalogue';

try {
  const anonymous = await fetch(base + path, {cache: 'no-store'});
  assert.equal(anonymous.status, 401, 'Anonymous catalogue request must return 401');
  const anonymousBody = await anonymous.json();
  assert.equal(anonymousBody.error, 'unauthorized');
  console.log('PASS: Anonymous character catalogue access rejected');

  const forged = await fetch(base + path, {
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
