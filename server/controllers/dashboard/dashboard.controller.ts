import { FastifyRequest, FastifyReply } from 'fastify';
// import { User, UserPayload } from '../../types';
import { DATABASE_URL, LOCAL_GAMESERVER_URL, USERMANAGEMENT_URL } from '../../config';


export async function getDashboard(request: FastifyRequest, reply: FastifyReply) {
  // get UserPayload from cookie, this is managed by the JWT server decoration.
  const payload: UserPayload = request.user;

  console.log("payload", payload)
  console.log("gameserverURL", LOCAL_GAMESERVER_URL);
  const user: string = payload.name;
  const id: number = Number(payload.id);

  try {
    return reply.viewAsync("dashboard/dashboard-view.ejs", {
      user,
      id,
      gameserverURL: LOCAL_GAMESERVER_URL
    });
  }
  catch (error) {
    request.log.error(error);
    return reply.viewAsync("errors/error-500.ejs");
  }
}

export async function getDashboardUser(request: FastifyRequest, reply: FastifyReply) {

  const { userid } = request.params as { userid: number };


  try {
    const response = await fetch(`${DATABASE_URL}/user/${userid}`);
    const userData = await response.json() as { username: string, email: string, avatar: string };
    console.log("userData", userData)
    return reply.viewAsync("dashboard/profile-button.ejs", { username: userData.username, email: userData.email, img_avatar: userData.avatar });
  }
  catch (error) {
    request.log.error(error);
    return reply.viewAsync("errors/error-500.ejs");
  }
}
