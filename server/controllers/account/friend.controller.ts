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
    return reply.code(res.status).send("Friend request sent");
  } catch (error) {
    request.log.error(error);
    const err = error as { code: number, message: string };
    return reply.code(err.code).send({ message: err.message});
  }
};

export async function acceptFriendReq(request: FastifyRequest, reply: FastifyReply): Promise<any> {
	try {
	  const { senderId, userId } = request.params as { senderId: number, userId: number };
	  const res = await fetch(`${DATABASE_URL}/acceptReq/${senderId}/${userId}`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ userId: userId }),
	  });
	  if (!res.ok) {
		const responseBody = await res.json() as { error: string };
		throw { code: res.status, message: responseBody.error };
	  }
	  return reply.code(res.status).send("Friend request accepted");
	} catch (error) {
	  request.log.error(error);
	  const err = error as { code: number, message: string };
	  return reply.code(err.code).send({ message: err.message});
	}
  };

export async function rejectFriendReq(request: FastifyRequest, reply: FastifyReply): Promise<any> {
	try {
	  const { senderId, userId } = request.params as { senderId: number, userId: number };
	  const res = await fetch(`${DATABASE_URL}/rejectReq/${senderId}/${userId}`, {
		method: 'DELETE',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ userId: userId }),
	  });
	  if (!res.ok) {
		const responseBody = await res.json() as { error: string };
		throw { code: res.status, message: responseBody.error };
	  }
	  return reply.code(res.status).send("Friend request rejected");
	} catch (error) {
	  request.log.error(error);
	  const err = error as { code: number, message: string };
	  return reply.code(err.code).send({ message: err.message});
	}
  };

export async function blockFriend(request: FastifyRequest, reply: FastifyReply): Promise<any> {
	try {
	  const { friendId, userId } = request.params as { friendId: number, userId: number };
	  const res = await fetch(`${DATABASE_URL}/block/${friendId}/${userId}`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ userId: userId }),
	  });
	  if (!res.ok) {
		const responseBody = await res.json() as { error: string };
		throw { code: res.status, message: responseBody.error };
	  }
	  return reply.code(res.status).send("Successfully blocked user");
	} catch (error) {
	  request.log.error(error);
	  const err = error as { code: number, message: string };
	  return reply.code(err.code).send({ message: err.message});
	}
  };

export async function viewPlayers(request: FastifyRequest, reply: FastifyReply): Promise<any> {
	try {
		const { username } = request.params as { username: string };
		const res = await fetch(`${DATABASE_URL}/viewPlayers/${username}`);
		if (!res.ok) {
			const responseBody = await res.json() as { error: string };
			throw { code: res.status, message: responseBody.error };
		}
		const raw = await res.json() as {
			requests: { 
				request: { avatar: string, username: string },
			}[],
			friends: {
				friend: { avatar: string, username: string, status: number, wins: number, losses: number },
			}[],
			pending: {
				pends: { avatar: string, username: string },
			}[],
			blocked: {
				blocks: { avatar: string, username: string },
			}[],
		  };
		return reply.viewAsync("partials/sidebar-players.ejs", { 
			requests: raw.requests,
			friends: raw.friends,
			pending: raw.pending,
			blocked: raw.blocked,
			 });
	
  } catch (error) {
    request.log.error(error);
    const err = error as { code: number, message: string };
    return reply.code(err.code).send({ message: err.message});
  }
};
