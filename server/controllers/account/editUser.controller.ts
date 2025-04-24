import { FastifyRequest, FastifyReply } from 'fastify';
import getNewAvatar from '../utils/avatarUtils.controller';
const USERMANAGEMENT_URL: string = process.env.USERMANAGEMENT_URL || "http://user_container:3000";

export async function editUsername(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { username } = request.params as { username: string };
    const { newUsername } = request.body as { newUsername: string };
    const dataPackage = JSON.stringify({ username, newUsername });

    const response = await fetch(`${USERMANAGEMENT_URL}/editUsername/${username}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: dataPackage
    });
	if (!response.ok) {
		const responseBody = await response.json() as { error: string };
		throw { code: response.status, message: responseBody.error };
	  }

    const newUserData = await fetch(`${USERMANAGEMENT_URL}/dashboard/${newUsername}`);
    const resData = await newUserData.json() as { email: string, avatar: string };
    return reply.viewAsync("dashboard/profile-button.ejs", { username: newUsername, email: resData.email, img_avatar: resData.avatar });
	} catch (error) {
		console.error(error);
		const err = error as { code: number, message: string };
		return reply.code(err.code).send({ error: err.message });
	}
}

export async function editPassword(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { username } = request.params as { username: string };
    const { newPassword } = request.body as { newPassword: string };
    const dataPackage = JSON.stringify({ username, newPassword });

    const response = await fetch(`${USERMANAGEMENT_URL}/editPassword/${username}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: dataPackage
    });
	if (!response.ok) {
		const responseBody = await response.json() as { error: string };
		throw { code: response.status, message: responseBody.error };
	  }

    const newUserData = await fetch(`${USERMANAGEMENT_URL}/dashboard/${newPassword}`);
    const resData = await newUserData.json() as { email: string, avatar: string };
    return reply.viewAsync("dashboard/profile-button.ejs", { username: username, email: resData.email, img_avatar: resData.avatar });
	} catch (error) {
		console.error(error);
		const err = error as { code: number, message: string };
		return reply.code(err.code).send({ error: err.message });
	}
}

export async function editEmail(request: FastifyRequest, reply: FastifyReply): Promise<any> {
  try {
    const { username } = request.params as { username: string };
    const { newEmail } = request.body as { newEmail: string };

    const res = await fetch(`${USERMANAGEMENT_URL}/editEmail/${username}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newEmail }),
    });
    if (!res.ok) {
      const responseBody = await res.json() as { error: string };
      throw { code: res.status, message: responseBody.error };
    }

    const newUserData = await fetch(`${USERMANAGEMENT_URL}/dashboard/${username}`);
    const resData = await newUserData.json() as { email: string, avatar: string };
    return reply.viewAsync("dashboard/profile-button.ejs", { username: username, email: resData.email, img_avatar: resData.avatar });
	} catch (error) {
		console.error(error);
		const err = error as { code: number, message: string };
		return reply.code(err.code).send({ error: err.message });
	}
};

export async function editAvatar(request: FastifyRequest, reply: FastifyReply) {
	try {
		const { username } = request.params as { username: string };

		const file = await request.file();
		if (!file) {
			throw { code: 406, message: 'No content' };
		}
		const filename = await getNewAvatar(username, file);

		// update dashboard info with new user info + return new view
		const resEdit = await fetch(`${USERMANAGEMENT_URL}/editAvatar/${username}`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ filename }),
		});
		if (!resEdit.ok) {
			const responseBody = await resEdit.json() as { error: string };
			throw { code: resEdit.status, message: responseBody.error };
		}
		const newUserData = await fetch(`${USERMANAGEMENT_URL}/dashboard/${username}`);
		const resData = await newUserData.json() as { email: string, avatar: string };
		console.log("resdata avatar = ", resData.avatar);
		return reply.viewAsync("dashboard/profile-button.ejs", { username: username, email: resData.email, img_avatar: resData.avatar });
	
	} catch (error) {
		console.error(error);
		const err = error as { code: number, message: string };
		return reply.code(err.code).send({ error: err.message });
	}
};

