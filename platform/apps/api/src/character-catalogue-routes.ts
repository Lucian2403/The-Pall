import type {FastifyInstance} from 'fastify';
import {fromNodeHeaders} from 'better-auth/node';
import {APPROVED_STARTING_FACTS, ORIGIN_CATALOGUE} from '@the-pall/game-core';
import {auth} from './auth.js';

// Authenticated, read-only design preview. No character table or mutations yet.
export function registerCharacterCatalogueRoutes(app: FastifyInstance) {
  app.get('/api/characters/catalogue', async (request, reply) => {
    const session = await auth.api.getSession({headers: fromNodeHeaders(request.headers)});
    if (!session) return reply.code(401).send({error: 'unauthorized'});
    return {
      origins: ORIGIN_CATALOGUE,
      startingFacts: APPROVED_STARTING_FACTS,
      status: 'read_only_preview'
    };
  });
}
