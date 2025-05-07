import { FastifyRequest, FastifyReply } from 'fastify';
const DATABASE_URL: string = "http://database_container:3000";

export async function getDashboard(request: FastifyRequest, reply: FastifyReply) {
  try {
    if (request.headers['hx-request']) {
      return reply.viewAsync("dashboard/dashboard-view.ejs");
    }
    return reply.sendFile("dashboard.html");
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
