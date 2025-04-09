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
	if (response.status !== 200) {
		const responseBody = await response.json() as { error: string};
		throw { code: response.status, message: responseBody.error };
	}
	return reply.code(201).sendFile("index.html");
	} catch (error) {
		const err = error as { code: number, message: string };
		return reply.code(err.code).viewAsync("errors/incorrect-userdetails.ejs", { code: err.code, message: err.message});
	}
}

