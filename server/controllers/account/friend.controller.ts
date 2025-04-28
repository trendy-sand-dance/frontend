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
	// const resData = await res.json() as { friends: { username: string, status: boolean }[] };
	// if (!resData || !resData.friends) {
	// 	console.log("Failed to get friends");
	// 	return reply.code(500).send({ message: "Failed to retrieve friends" });
	// }
	// console.log("resData.friends = ", resData.friends);

	// return reply.viewAsync("partials/sidebar-players.ejs", { friends: resData.friends });
	const raw = await res.json() as {
		friends: {
		  friend: { username: string, wins: number, losses: number },
		  status: string,
		  initiator: number
		}[]
	  };;
	console.log("\x1b[33m%s\x1b[0m", "🔥 raw DB response:", raw);

	const simplifiedFriends = raw.friends.map(entry =>
	({
		username: entry.friend.username,
		status: entry.status,
		wins: entry.friend.wins,
		losses: entry.friend.losses
		 // or make this nicer like "Online"/"Offline" if you want
	}));
	
	return reply.viewAsync("partials/sidebar-players.ejs", {friends: simplifiedFriends});

	// const { friends } = await res.json();
	// return reply.viewAsync("partials/sidebar-players.ejs", { friends });

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
