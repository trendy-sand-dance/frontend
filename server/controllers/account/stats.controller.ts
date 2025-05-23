import { FastifyRequest, FastifyReply } from 'fastify';
const DATABASE_URL: string = "http://database_container:3000";

export async function getStats(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { username } = request.params as { username: string };

    const response = await fetch(`${DATABASE_URL}/getStats/${username}`);
	if (!response.ok) {
		const responseBody = await response.json() as { error: string };
		throw { code: response.status, message: responseBody.error };
	  }
	  const userStats = await response.json() as { wins: number, losses: number };
	  return reply.send({wins: userStats.wins, losses: userStats.losses});
    
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
	  return reply.send({ message: "successfully updated win count"});
    
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
	  return reply.send({ message: "successfully updated loss count"});
    
	} catch (error) {
		console.error(error);
		const err = error as { code: number, message: string };
		return reply.code(err.code).send({ error: err.message });
	}
}
