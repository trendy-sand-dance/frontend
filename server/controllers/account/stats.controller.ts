import { FastifyRequest, FastifyReply } from 'fastify';
const DATABASE_URL: string = "http://database_container:3000";

// get this from global/shared file
interface Player {
	id: number,
	userId: number,
	x: number,
	y: number,
  }

interface User {
	id: number,
	username: string,
	password: string,
	email: string,
	avatar: string,
	status: boolean,
	player: Player,
  }

export async function getStats(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { username } = request.params as { username: string };

    const response = await fetch(`${DATABASE_URL}/getStats/${username}`);
	if (!response.ok) {
		const responseBody = await response.json() as { error: string };
		throw { code: response.status, message: responseBody.error };
	  }
	  const user = await response.json() as { user: User };
	  return reply.send(user); // check how/what - view?
    
	} catch (error) {
		console.error(error);
		const err = error as { code: number, message: string };
		return reply.code(err.code).send({ error: err.message });
	}
}

export async function updateWins(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { username } = request.params as { username: string };
	const dataPackage = JSON.stringify({ username });

    const response = await fetch(`${DATABASE_URL}/updateWins/${username}`, {
		method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: dataPackage
	});
	if (!response.ok) {
		const responseBody = await response.json() as { error: string };
		throw { code: response.status, message: responseBody.error };
	  }
	  const user = await response.json() as { user: User };
	  return reply.send({ message: "successfully updated win count"}); // check what the return is
    
	} catch (error) {
		console.error(error);
		const err = error as { code: number, message: string };
		return reply.code(err.code).send({ error: err.message });
	}
}

export async function updateLosses(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { username } = request.params as { username: string };
	const dataPackage = JSON.stringify({ username });

    const response = await fetch(`${DATABASE_URL}/updateLosses/${username}`, {
		method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: dataPackage
	});
	if (!response.ok) {
		const responseBody = await response.json() as { error: string };
		throw { code: response.status, message: responseBody.error };
	  }
	  const user = await response.json() as { user: User };
	  return reply.send({ message: "successfully updated loss count"}); // check what the return is
    
	} catch (error) {
		console.error(error);
		const err = error as { code: number, message: string };
		return reply.code(err.code).send({ error: err.message });
	}
}
