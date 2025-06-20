import { FastifyRequest, FastifyReply } from 'fastify';
import { DATABASE_URL, LOCAL_GAMESERVER_URL } from '../../config';


export async function getDashboard(request: FastifyRequest, reply: FastifyReply) {
	
	try
	{
		// get UserPayload from cookie, this is managed by the JWT server decoration.
		const payload: UserPayload = request.user;

		const user: string = payload.name;
		const id: number = Number(payload.id);
		const response = await fetch(`${DATABASE_URL}/user/${id}`);
	
		if (response.status == 404)
			return reply.viewAsync(
			"errors/error-page.ejs",
			{
				title: "User not found",
				details: "go back to the login page to log in again or register a new account"
			});


    const data = await response.json() as User;
		const is_google_user = (data.password === null);

		return reply.viewAsync("dashboard/dashboard-view.ejs", {
			user,
			id,
			gameserverURL: LOCAL_GAMESERVER_URL,
			google_user: is_google_user
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
		console.log("userData: ", userData);

	return reply.viewAsync("dashboard/profile-button.ejs", { username: userData.username, email: userData.email, img_avatar: userData.avatar });
  }
  catch (error) {
	request.log.error(error);
	return reply.viewAsync("errors/error-500.ejs");
  }
}
