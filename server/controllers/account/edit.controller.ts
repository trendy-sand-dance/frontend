import { FastifyRequest, FastifyReply, User } from 'fastify';
const USERMANAGEMENT_URL: string = process.env.USERMANAGEMENT_URL || "http://user_container:3000";

export async function editUsername(request: FastifyRequest, reply: FastifyReply) {

  try {
    const { username } = request.params as { username: string };
    const { newUsername } = request.body as { newUsername: string };

    console.log("request.body: ", request.body);
    console.log("username: ", username);
	console.log("newUsername: ", newUsername);

    const dataPackage = JSON.stringify({ username, newUsername });

    console.log("dataPackage: ", dataPackage);
    const response = await fetch(`${USERMANAGEMENT_URL}/editUsername/${username}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: dataPackage
    });

    const responseData = await response.json() as { message: string };
    console.log(responseData);
    return responseData;
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({ error: 'Internal Server Error' });
  }
}
