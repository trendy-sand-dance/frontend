import { FastifyRequest, FastifyReply } from 'fastify';
// import { User } from '../../types';
import { USERMANAGEMENT_URL, DATABASE_URL } from '../../config';


export async function getLoginView(request: FastifyRequest, reply: FastifyReply) {
  return reply.viewAsync("account/login-view.ejs");
}


export async function login(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { username, password } = request.body as { username: string, password: string };

    const response = await fetch(`${DATABASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const responseBody = await response.json() as { error: string };
      throw {
        code: response.status,
        message: responseBody.error
      };
    }

    const user = await response.json() as { user: User };

    const payload = {
      id: user["id"],
      email: user["email"],
      name: user["username"],
    }

    const token = request.jwt.sign(payload)
    reply.setCookie('access_token', token, {
      path: '/',
      httpOnly: true,
      secure: true,
    })

    return reply.redirect('/dashboard');

  } catch (error) {
    const err = error as { code: number, message: string };
    return reply.code(err.code).viewAsync("errors/incorrect-userdetails.ejs", {
      code: err.code,
      message: err.message
    });
  }
}

export async function logout(request: FastifyRequest, reply: FastifyReply) {
  const payload: UserPayload = request.user;
  const username = payload.name;
  console.log("payload from logout: ", payload);
  reply.clearCookie('access_token')
  try {
    await fetch(`${DATABASE_URL}/logout/${username}`);
    return reply.sendFile("index.html");
  } catch (error) {
    request.log.error(error);
    return reply.viewAsync("errors/error-500.ejs");
  }
}

