import { FastifyRequest, FastifyReply } from 'fastify';
const USERMANAGEMENT_URL: string = process.env.USERMANAGEMENT_URL || "http://user_container:3000";
const LOCAL_GAMESERVER_URL: string = process.env.LOCAL_GAMESERVER_URL || "localhost";
const TEST: string = process.env.USERMANAGEMENT_URL || "NOOOOO";

const DATABASE_URL = 'http://database_container:3000';

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
    return reply.viewAsync("dashboard/dashboard-view.ejs", { username: userInfo.username });
  } catch (error) {
    const err = error as { code: number, message: string };
    return reply.code(err.code).viewAsync("errors/incorrect-userdetails.ejs", { code: err.code, message: err.message });
  }
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

    const response = await fetch(`${USERMANAGEMENT_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (!response.ok) {
      const responseBody = await response.json() as { error: string };
      throw { code: response.status, message: responseBody.error };
    }

    const user = await response.json() as { user: User };
    const gameserverUrl = LOCAL_GAMESERVER_URL;
    const test = TEST;
    console.log("TEST: ", test);
    console.log("GAMESERVERURL: ", gameserverUrl);
    return reply.viewAsync("dashboard/dashboard-view.ejs", { user, gameserverUrl });
    // return reply.viewAsync("dashboard/dashboard-view.ejs", { user });

  } catch (error) {
    const err = error as { code: number, message: string };
    return reply.code(err.code).viewAsync("errors/incorrect-userdetails.ejs", { code: err.code, message: err.message });
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

