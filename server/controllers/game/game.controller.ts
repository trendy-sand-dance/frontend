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

const DATABASE_URL: string = process.env.DATABASE_URL || "http://ok:3000";

export async function getPlayerInfo(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { id } = request.params as { id: number };

    const response = await fetch(`${DATABASE_URL}/game/playerinfo/${id}`);
    const resData = await response.json() as { username: string, avatar: string };
    return reply.code(200).send({ username: resData.username, avatar: resData.avatar });
  } catch (error) {
    request.log.error(error);
    return reply.viewAsync("errors/error-500.ejs");
  }

}
