import { FastifyRequest, FastifyReply } from 'fastify';
import { User, UserPayload } from '../../types';
import { DATABASE_URL, LOCAL_GAMESERVER_URL, USERMANAGEMENT_URL } from '../../config';


export async function getDashboard(request: FastifyRequest, reply: FastifyReply) {
	// get UserPayload from cookie, this is managed by the JWT server decoration.
	const payload: UserPayload = request.user;

	console.log("payload", payload)

  try {
		return reply.viewAsync("dashboard/dashboard-view.ejs", {
			user: payload.name,
			gameserverURL: LOCAL_GAMESERVER_URL
		});
	}
  catch (error) {
    request.log.error(error);
    return reply.viewAsync("errors/error-500.ejs");
  }
}

export async function getDashboardUser(request: FastifyRequest, reply: FastifyReply) {

  const { username } = request.params as { username: string };

  try {
    const response = await fetch(`${DATABASE_URL}/dashboard/${username}`);
    const resData = await response.json() as { email: string, avatar: string };
    return reply.viewAsync("dashboard/profile-button.ejs", { username: username, email: resData.email, img_avatar: resData.avatar });
  }
  catch (error) {
    request.log.error(error);
    return reply.viewAsync("errors/error-500.ejs");
  }
}
