import { FastifyRequest, FastifyReply } from 'fastify';

const DATABASE_URL: string = "http://database_container:3000";

export async function sendFriendReq(request: FastifyRequest, reply: FastifyReply): Promise<any> {
  try {
    const { receiverId, userId } = request.params as { receiverId: number, userId: number };
    const res = await fetch(`${DATABASE_URL}/sendReq/${receiverId}/${userId}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userId }),
      });
    if (!res.ok) {
      const responseBody = await res.json() as { error: string };
      throw { code: res.status, message: responseBody.error };
    }
    return reply
      .code(res.status)
      .header("HX-Trigger", "refreshSidebar")
      .send("Friend request sent");
  }
  catch (error) {
    request.log.error(error);
    const err = error as { code: number, message: string };
    return reply.code(err.code).send({ message: err.message });
  }
};

export async function acceptFriendReq(request: FastifyRequest, reply: FastifyReply): Promise<any> {
  try {
    const { senderId, userId } = request.params as { senderId: number, userId: number };
    const res = await fetch(`${DATABASE_URL}/acceptReq/${senderId}/${userId}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userId }),
      });
    if (!res.ok) {
      const responseBody = await res.json() as { error: string };
      throw { code: res.status, message: responseBody.error };
    }
    return reply
      .code(res.status)
      .header("HX-Trigger", "refreshSidebar")
      .send("Friend request accepted");
  } catch (error) {
    request.log.error(error);
    const err = error as { code: number, message: string };
    return reply.code(err.code).send({ message: err.message });
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
    return reply
      .code(res.status)
      .header("HX-Trigger", "refreshSidebar")
      .send("Friend request rejected");
  } catch (error) {
    request.log.error(error);
    const err = error as { code: number, message: string };
    return reply
      .code(err.code)
      .send({ message: err.message });
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
    return reply
      .code(res.status)
      .header("HX-Trigger", "refreshSidebar")
      .send("Successfully blocked user");
  } catch (error) {
    request.log.error(error);
    const err = error as { code: number, message: string };
    return reply.code(err.code).send({ message: err.message });
  }
};

export async function deleteAssociation(request: FastifyRequest, reply: FastifyReply): Promise<any> {
  try {
    const { senderId, userId } = request.params as { senderId: number, userId: number };
    const res = await fetch(`${DATABASE_URL}/deletefriend/${senderId}/${userId}`,
      {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userId }),
      });

    if (!res.ok) {
      const responseBody = await res.json() as { error: string };
      throw { code: res.status, message: responseBody.error };
    }

    return reply
      .header("HX-Trigger", "refreshSidebar")
      .code(res.status);

  } catch (error) {
    request.log.error(error);
    const err = error as { code: number, message: string };
    return reply.code(err.code).send({ message: err.message });
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

		const raw = await res.json() as 
		{
			requests: { 
				request: { avatar: string, username: string, id: number},
			}[],
			friends: {
				friend: { avatar: string, username: string, id: number, status: number, wins: number, losses: number },
			}[],
			pending: {
				pends: { avatar: string, username: string, id: number },
			}[],
			blocked: {
				blocks: { avatar: string, username: string, id: number },
			}[],
			userId: number,
		  };
		
		return reply.viewAsync("partials/sidebar-players.ejs", { 
			requests: raw.requests,
			friends: raw.friends,
			pending: raw.pending,
			blocked: raw.blocked,
			userId: raw.userId,
			username: username,
			 });
	
	}
	catch (error)
	{
		request.log.error(error);
		const err = error as { code: number, message: string };
		return reply.code(err.code).send({ message: err.message});
	}
};


export const areFriends = async (request: FastifyRequest, reply: FastifyReply): Promise<any> => {

  const ids = request.params as { userId1: number, userId2: number };

  try {

    const areFriends = await fetch(`${DATABASE_URL}/areFriends/${ids.userId1}/${ids.userId2}`)
    const status = await areFriends.json();
    console.log("Status frontend: ", status);

    reply.code(200).send(status);
  } catch (error) {
    reply.status(500).send({ error: 'Failed to check if ids are friends' });
  }
}
