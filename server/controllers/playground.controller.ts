import { FastifyRequest, FastifyReply, User } from 'fastify';

export async function getplaygroundView(request: FastifyRequest, reply: FastifyReply) {
  return reply.viewAsync("playground.ejs");
}
