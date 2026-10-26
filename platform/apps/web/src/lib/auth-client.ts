import {createAuthClient} from 'better-auth/svelte';

// Browser requests use the existing same-origin Vite proxy (/api -> Fastify).
export const authClient = createAuthClient();
