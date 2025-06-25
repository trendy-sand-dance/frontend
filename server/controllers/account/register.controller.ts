import { FastifyRequest, FastifyReply } from 'fastify';
const DATABASE_URL: string = "http://database_container:3000";

export async function getRegisterView(request: FastifyRequest, reply: FastifyReply) {
  return reply.viewAsync("account/register-view.ejs");
}

export async function registerUser(request: FastifyRequest, reply: FastifyReply) {
  try {
    //const { username, password, email } = request.body as { username: string, password: string, email: string };
    request.body as { username: string, password: string, email: string };
    //const dataPackage = JSON.stringify({ username, password, email });
	// why do we have this dataPackage? why arent we sending this as body?
    const response = await fetch(`${DATABASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request.body)
    });
    if (!response.ok) {
      const responseBody = await response.json() as { error: string };
      throw { code: response.status, message: responseBody.error };
    }
	return reply.viewAsync("account/login-view.ejs");
    } catch (error) {
    	const err = error as { code: number, message: string };
    	return reply.code(err.code).viewAsync("errors/incorrect-userdetails.ejs", { code: err.code, message: err.message });
	}
}

