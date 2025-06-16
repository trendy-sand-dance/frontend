import { FastifyRequest, FastifyReply } from 'fastify';
import { CHATSERVER_URL } from '../../config.js';
import { RoomType } from '../../types.js';

export async function getRoomMessages(request: FastifyRequest, reply: FastifyReply) {

  try {

    const { id } = request.params as { id : number };
    const response = await fetch(`${CHATSERVER_URL}/getRoomMessages/${id}`);
    const data = await response.json() as { messages : RoomMessage[] };

    return reply.code(200).send({ message: data.messages });

  } catch (error) {

    request.log.error(error);
    return reply.viewAsync("errors/error-500.ejs");

  }

}
