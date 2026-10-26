import {randomUUID} from 'node:crypto';
import {deepStrictEqual} from 'node:assert/strict';

const endpoint = 'http://127.0.0.1:8788';
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const get = async url => {
  const response = await fetch(endpoint + url);
  assert(response.ok, `GET ${url} returned HTTP ${response.status}`);
  return response.json();
};
const post = async cmd => {
  const response = await fetch(endpoint + '/api/fixture', {
    method: 'POST',
    headers: {'content-type': 'application/json'},
    body: JSON.stringify(cmd)
  });
  return {status: response.status, body: await response.json()};
};
const detail = value => JSON.stringify(value, null, 2);

try {
  const health = await get('/health');
  assert(health.status === 'ok', 'API health check failed');
  console.log('PASS: API reachable');

  const initial = await get('/api/fixture');
  assert(Number.isSafeInteger(initial.revision) && Number.isSafeInteger(initial.value), 'Invalid fixture snapshot');
  const cmd = {action: 'advance_fixture', requestId: randomUUID(), expectedRevision: initial.revision};

  const first = await post(cmd);
  assert(first.status === 200 && first.body.revision === initial.revision + 1 && first.body.value === initial.value + 1,
    `First command did not commit once: ${detail({initial, first})}`);
  console.log('PASS: Action saved in PostgreSQL');

  // JSONB is an object value, not a stable byte/string representation.
  // A PostgreSQL JSONB round trip may change property insertion order.
  // Compare objects structurally, then independently verify server state.
  const duplicate = await post(cmd);
  assert(duplicate.status === 200,
    `Retry returned HTTP ${duplicate.status}: ${detail(duplicate.body)}`);
  try {
    deepStrictEqual(duplicate.body, first.body);
  } catch {
    throw new Error(`Retry returned a different result. First=${detail(first.body)} Retry=${detail(duplicate.body)}`);
  }
  const afterDuplicate = await get('/api/fixture');
  assert(afterDuplicate.revision === first.body.revision && afterDuplicate.value === first.body.value,
    `Retry advanced server state. First=${detail(first.body)} Current=${detail(afterDuplicate)}`);
  console.log('PASS: Duplicate request returns the same result and does not double-apply');

  const stale = await post({action: 'advance_fixture', requestId: randomUUID(), expectedRevision: initial.revision});
  assert(stale.status === 409 && stale.body.error === 'stale_revision',
    `Stale revision not rejected: ${detail(stale)}`);
  console.log('PASS: Stale revision rejected');

  const reused = await post({...cmd, expectedRevision: cmd.expectedRevision + 1});
  assert(reused.status === 409 && reused.body.error === 'idempotency_key_reuse',
    `Reused key with changed command not rejected: ${detail(reused)}`);
  console.log('PASS: Conflicting idempotency key rejected');

  const bad = await post({...cmd, requestId: randomUUID(), coins: 100000});
  assert(bad.status === 400 && bad.body.error === 'invalid_action',
    `Client-supplied coins not rejected: ${detail(bad)}`);
  console.log('PASS: Client-supplied game rewards rejected');

  const current = await get('/api/fixture');
  const raceRequestA = {action: 'advance_fixture', requestId: randomUUID(), expectedRevision: current.revision};
  const raceRequestB = {action: 'advance_fixture', requestId: randomUUID(), expectedRevision: current.revision};
  const race = await Promise.all([post(raceRequestA), post(raceRequestB)]);
  const successes = race.filter(x => x.status === 200);
  const conflicts = race.filter(x => x.status === 409 && x.body.error === 'stale_revision');
  assert(successes.length === 1 && conflicts.length === 1,
    `Concurrent commands must have one winner and one stale conflict: ${detail(race)}`);
  const end = await get('/api/fixture');
  assert(end.revision === current.revision + 1 && end.value === current.value + 1,
    `Race applied more than once: ${detail({current, end})}`);
  console.log('PASS: Two concurrent actions cannot both commit');
  console.log(`PASS: Fixture revision=${end.revision}, value=${end.value}`);
  console.log('Local API + DB verification passed. Browser checks and restart recovery still require separate confirmation.');
} catch (error) {
  console.error('FAILED:', error?.message ?? String(error));
  console.error('If the API is reachable, inspect the failure above before checking Docker or migrations.');
  process.exitCode = 1;
}
