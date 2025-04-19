import { FastifyRequest, FastifyReply } from 'fastify';
import { getBundledFile } from '../../utility/utility.js';

export async function getPixiGame(request: FastifyRequest, reply: FastifyReply) {
  try {
    const file = await getBundledFile();
    return reply.viewAsync("game/game-canvas.ejs", { file });
  } catch (error) {
    request.log.error(error);
    return reply.viewAsync("errors/error-500.ejs");
  }

}
