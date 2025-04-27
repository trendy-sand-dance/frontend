import { FastifyRequest, FastifyReply } from 'fastify';
const USERMANAGEMENT_URL: string = process.env.USERMANAGEMENT_URL || "http://user_container:3000";
const LOCAL_GAMESERVER_URL: string = process.env.LOCAL_GAMESERVER_URL || "localhost:8003";
const TEST: string = process.env.USERMANAGEMENT_URL || "NOOOOO";

const DATABASE_URL = 'http://database_container:3000';

export async function getLoginView(request: FastifyRequest, reply: FastifyReply) {
  return reply.viewAsync("account/login-view.ejs");
}

interface Player {
  id: number,
  userId: number,
  x: number,
  y: number,
}

interface User {
  id: number,
  username: string,
  password: string,
  email: string,
  avatar: string,
  status: boolean,
  player: Player,
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

    return reply.viewAsync("dashboard/dashboard-view.ejs", {
			accesToken: token,
			user: user,
			gameserverUrl: LOCAL_GAMESERVER_URL
		});
		

  } catch (error) {
    const err = error as { code: number, message: string };
    return reply.code(err.code).viewAsync("errors/incorrect-userdetails.ejs", {
			code: err.code,
			message: err.message
		});
  }
}

export async function logout(request: FastifyRequest, reply: FastifyReply) {
  const { username } = request.params as { username: string };

  try {
    const response = await fetch(`${DATABASE_URL}/logout/${username}`);
    return reply.sendFile("index.html");
  } catch (error) {
    request.log.error(error);
    return reply.viewAsync("errors/error-500.ejs");
  }
}

