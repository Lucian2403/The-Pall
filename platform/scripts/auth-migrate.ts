import {getMigrations} from 'better-auth/db/migration';
import {auth} from '../apps/api/src/auth.js';

// Explicit, developer-run Better Auth migration. Does not touch the M0 fixture.
// Review pending schema output whenever upgrading Better Auth.
const {toBeCreated, toBeAdded, runMigrations} = await getMigrations(auth.options);
console.log('Better Auth migration: tables to create:', toBeCreated.length);
console.log('Better Auth migration: changes to add:', toBeAdded.length);
await runMigrations();
console.log('Better Auth local schema migration finished.');
