import type {FastifyInstance} from 'fastify';
import {fromNodeHeaders} from 'better-auth/node';
import {auth} from './auth.js';

export function registerAuthRoutes(app: FastifyInstance) {
  app.route({
    method: ['GET', 'POST'],
    url: '/api/auth/*',
    async handler(request, reply) {
      const url = new URL(request.url, process.env.AUTH_BASE_URL ?? 'http://127.0.0.1:5173');
      const response = await auth.handler(new Request(url, {
        method: request.method,
        headers: fromNodeHeaders(request.headers),
        ...(request.method === 'POST' ? {body: JSON.stringify(request.body ?? {})} : {})
      }));
      reply.code(response.status);
      response.headers.forEach((value, key) => { if (key.toLowerCase() !== 'set-cookie') reply.header(key, value); });
      const cookies = response.headers.getSetCookie();
      if (cookies.length) reply.header('set-cookie', cookies);
      return reply.send(response.body ? await response.text() : null);
    }
  });
  app.get('/api/me', async (request, reply) => {
    const current = await auth.api.getSession({headers: fromNodeHeaders(request.headers)});
    if (!current) return reply.code(401).send({error: 'unauthorized'});
    return {id: current.user.id, email: current.user.email, emailVerified: current.user.emailVerified};
  });
}
