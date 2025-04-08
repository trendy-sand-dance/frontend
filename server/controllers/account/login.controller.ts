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

	//text =  {"id":1,"username":"hi","password":"hi","email":"hi@gmail.com","avatar":"img_avatar.png","status":false}
    // const responseData = await response.json() as { message: string, error: string, statusCode: number };
    //const responseData = await response.json() as { message: string, error: string, statusCode: number, email: string, avatar: string };
   // const responseData = await response.json() as { username: string, password: string, email: string, avatar: string, status: boolean };
	//const responseData = await response.json() as { user: User };
	//console.log("user  ----- ", responseData.email);

	if (response.status === 200) {
		return reply.viewAsync("dashboard/dashboard-view.ejs", { username: userInfo.username});
	}
    //if (response.status !== 200) {
	//	console.error(response.status);
    //  return reply.code(response.status).viewAsync("errors/incorrect-userdetails.ejs", { code: reply.statusCode, message: "Error" });
    //}
    //return reply.viewAsync("dashboard/dashboard-view.ejs", { username: userInfo.username, email: responseData.email, img_avatar: responseData.avatar });
  }
  catch (error) {
    request.log.error(error);
    return reply.viewAsync("errors/error-page.ejs", { code: 500, message: "Internal Server Error" });
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
