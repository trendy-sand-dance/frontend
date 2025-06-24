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

export async function getMessageHistory(req: FastifyRequest, reply: FastifyReply)
{
	try {

    const { id } = req.params as { id : number };

    // console.log(`${CHATSERVER_URL}`);

    const response = await fetch(`${CHATSERVER_URL}/getMessageHistory/${id}`);
    const data = await response.json() as { messages: Array<RoomMessage | WhisperMessage> };
    // console.log("data in async route", data.messages);

	


    return reply.view('/partials/sidebar-chat.ejs', {messages: data.messages, userId: id});

  } catch (error) {

    req.log.error(error);
    return reply.view("errors/error-500.ejs");

  }

	  // console.log("triggering chat");
    // return reply.viewAsync('/partials/sidebar-chat.ejs', {id: id});
};

 