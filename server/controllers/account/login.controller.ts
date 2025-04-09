import { FastifyRequest, FastifyReply, User } from 'fastify';
const USERMANAGEMENT_URL: string = process.env.USERMANAGEMENT_URL || "http://user_container:3000";

export async function getLoginView(request: FastifyRequest, reply: FastifyReply) {
  return reply.viewAsync("account/login-view.ejs");
}

export async function loginUser(request: FastifyRequest, reply: FastifyReply) {
  const userInfo = request.body as { username: string, password: string };

  try {
    if (userInfo.username === "admin" && userInfo.password === "123") {
      return reply.viewAsync("dashboard/dashboard-view.ejs", { username: userInfo.username, email: "test@test.com", img_avatar: "img_avatar.png" });
    }
    const response = await fetch(`${USERMANAGEMENT_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userInfo)
    });
	if (!response.ok) {
		const responseBody = await response.json() as { error: string };
		throw { code: response.status, message: responseBody.error };
	}
	return reply.viewAsync("dashboard/dashboard-view.ejs", { username: userInfo.username});
	} catch (error) {
		const err = error as { code: number, message: string };
		return reply.code(err.code).viewAsync("errors/incorrect-userdetails.ejs", { code: err.code, message: err.message});
	}
}

export async function logoutUser(request: FastifyRequest, reply: FastifyReply) {
  const { username } = request.params as { username: string };

  try {
    console.log("USERNAME: ", username);
    const response = await fetch(`${USERMANAGEMENT_URL}/logout/${username}`);
    if (!response.ok) {
      return reply.sendFile("index.html");
    }
  } catch (error) {
    request.log.error(error);
    return reply.viewAsync("errors/error-500.ejs");
  }
}
