import { FastifyRequest, FastifyReply } from 'fastify';
const USERMANAGEMENT_URL: string = process.env.USERMANAGEMENT_URL || "http://user_container:3000";

export async function getDashboard(request: FastifyRequest, reply: FastifyReply) {
  console.log("GETTING DASHBOARD, RIGHTTTTTTTTTTTTTTTT?");
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
  console.log("username:? ", username);
  try {
    const response = await fetch(`${USERMANAGEMENT_URL}/dashboard/${username}`);
    const resData = await response.json() as { email: string, avatar: string };
    return reply.viewAsync("dashboard/profile-button.ejs", { username: username, email: resData.email, img_avatar: resData.avatar });
  }
  catch (error) {
    request.log.error(error);
    return reply.viewAsync("errors/error-500.ejs");
  }
}
