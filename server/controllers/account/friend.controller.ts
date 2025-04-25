import { FastifyRequest, FastifyReply } from 'fastify';

const DATABASE_URL: string = process.env.DATABASE_URL || "http://database_container:3002";

export async function sendFriendReq(request: FastifyRequest, reply: FastifyReply): Promise<any> {
  try {
    const { receiverId, userId } = request.params as { receiverId: number, userId: number };
    const res = await fetch(`${DATABASE_URL}/sendReq/${receiverId}/${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: userId }),
    });
    if (!res.ok) {
      const responseBody = await res.json() as { error: string };
      throw { code: res.status, message: responseBody.error };
    }
    return reply.code(res.status).send("<p>Friend request sent</p>");
  } catch (error) {
    request.log.error(error);
    const err = error as { code: number, message: string };
    return reply.code(err.code).send({ message: err.message});
  }
};

export async function viewAllFriends(request: FastifyRequest, reply: FastifyReply): Promise<any> {
  try {
    const { username } = request.params as { username: string };
    const res = await fetch(`${DATABASE_URL}/viewAllFriends/${username}`);
    if (!res.ok) {
      const responseBody = await res.json() as { error: string };
      throw { code: res.status, message: responseBody.error };
    }
	//does this work, or is it different when reading multiple entries?
	const resData = await res.json();
	if (!resData)
			console.log("failed to get friend");
	console.log("resdata = ", resData.friends)
	return reply.viewAsync("partials/sidebar-players.ejs", { friends: resData.friends });
} catch (error) {
	request.log.error(error);
    const err = error as { code: number, message: string };
    return reply.code(err.code).send({ message: err.message});
}
};

export async function viewOnlyFriends(request: FastifyRequest, reply: FastifyReply): Promise<any> {
	try {
		const { username } = request.params as { username: string };
		const res = await fetch(`${DATABASE_URL}/viewOnlyFriends/${username}`);
		if (!res.ok) {
			const responseBody = await res.json() as { error: string };
			throw { code: res.status, message: responseBody.error };
		}
		const resData = await res.json() as { username: string, status: boolean };
	return reply.viewAsync("partials/sidebar-players.ejs", { username: resData.username, status: resData.status });
  } catch (error) {
    request.log.error(error);
    const err = error as { code: number, message: string };
    return reply.code(err.code).send({ message: err.message});
  }
};
