import { FastifyRequest, FastifyReply } from 'fastify';
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

    // const responseData = await response.json() as { message: string, error: string, statusCode: number };
    const responseData = await response.json() as { message: string, error: string, statusCode: number, email: string, avatar: string };
    if (responseData.statusCode !== 200) {
      console.log("SHOULD GIVE ERRORRRRRRRRRRRRRRRRR");
      return reply.code(responseData.statusCode).viewAsync("errors/incorrect-userdetails.ejs", { code: reply.statusCode, message: responseData.message });
    }
    return reply.viewAsync("dashboard/dashboard-view.ejs", { username: userInfo.username, email: responseData.email, img_avatar: responseData.avatar });
  }
  catch (error) {
    request.log.error(error);
    return reply.viewAsync("errors/error-500.ejs");
  }

}


export async function logoutUser(request: FastifyRequest, reply: FastifyReply) {
  const { username } = request.params as { username: string };

  try {
    const response = await fetch(`${USERMANAGEMENT_URL}/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(username)
    });


  } catch (error) {
    request.log.error(error);
    return reply.viewAsync("errors/error-500.ejs");
  }
}
