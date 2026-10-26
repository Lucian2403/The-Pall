import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const docker = process.platform === 'win32' ? 'docker.exe' : 'docker';
const run = args => execFileSync(docker, ['compose', ...args], {cwd: root, stdio: 'inherit'});
try {
  run(['cp', 'db/migrations/0001_dev_fixture.sql', 'postgres:/tmp/the-pall-m0.sql']);
  run(['exec', '-T', 'postgres', 'psql', '-v', 'ON_ERROR_STOP=1', '-U', 'pall_dev', '-d', 'pall_dev', '-f', '/tmp/the-pall-m0.sql']);
  console.log('M0 test database initialized.');
} catch (err) {
  console.error('Database setup failed. Check that Docker Desktop is running and run npm run db:up first.');
  process.exitCode = 1;
}
