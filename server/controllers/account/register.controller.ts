import { FastifyRequest, FastifyReply } from 'fastify';
const USERMANAGEMENT_URL: string = process.env.USERMANAGEMENT_URL || "http://user_container:3000";

export async function getRegisterView(request: FastifyRequest, reply: FastifyReply) {
  return reply.viewAsync("account/register-view.ejs");
}

export async function registerUser(request: FastifyRequest, reply: FastifyReply) {

  try {
    const { username, password, email } = request.body as { username: string, password: string, email: string };

    const dataPackage = JSON.stringify({ username, password, email });
    console.log("dataPackage: ", dataPackage);

    const response = await fetch(`${USERMANAGEMENT_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request.body)
    });

    // const responseData = await response.json();
    return reply.sendFile("index.html");

  } catch (error) {
    request.log.error(error);
    return reply.viewAsync("errors/error-500.ejs");
  }

}

