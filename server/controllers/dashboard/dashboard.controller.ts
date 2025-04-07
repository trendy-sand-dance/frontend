import { FastifyRequest, FastifyReply } from 'fastify';
// const USERMANAGEMENT_URL: string = process.env.USERMANAGEMENT_URL || "http://user_container:3000";

export async function getDashboard(request: FastifyRequest, reply: FastifyReply) {
  try {
    return reply.viewAsync("dashboard/dashboard-view.ejs", { username: "Test", email: "test@test.com", img_avatar: "/img_avatar.png" });
  }
  catch (error) {
    request.log.error(error);
    return reply.viewAsync("errors/error-500.ejs");
  }
}
