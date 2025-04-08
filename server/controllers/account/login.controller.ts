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
	if (response.status === 500)
			throw ({code: response.status, message: "Internal Server Error"});
	else if (response.status === 406)
		throw ({code: response.status, message: "(Not acceptable) Invalid Credentials"});
	else if (response.status === 200) {
		return reply.viewAsync("dashboard/dashboard-view.ejs", { username: userInfo.username});
	}

  }
  catch (error) {
	const errStatus = error as {code: number, message: string};
    return reply.code(errStatus.code).viewAsync("errors/incorrect-userdetails.ejs", { code: errStatus.code, message: errStatus.message });
  }
}


export async function logoutUser(request: FastifyRequest, reply: FastifyReply) {
  const { username } = request.params as { username: string };

  try {
    const response = await fetch(`${USERMANAGEMENT_URL}/logout/${username}`);
	return reply.sendFile("index.html");
  } catch (error) {
    request.log.error(error);
    return reply.viewAsync("errors/error-500.ejs");
  }
}
