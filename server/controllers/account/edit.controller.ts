import { FastifyRequest, FastifyReply, User } from 'fastify';
const USERMANAGEMENT_URL: string = process.env.USERMANAGEMENT_URL || "http://user_container:3000";

export async function editUsername(request: FastifyRequest, reply: FastifyReply) {

  try {
    const { username } = request.params as { username: string };
    const { newUsername } = request.body as { newUsername: string };

    console.log("request.body: ", request.body);
    console.log("username: ", username);
    console.log("newUsername: ", newUsername);

    const dataPackage = JSON.stringify({ username, newUsername });

    console.log("dataPackage: ", dataPackage);
    const response = await fetch(`${USERMANAGEMENT_URL}/editUsername/${username}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: dataPackage
    });

    const newUserData = await fetch(`${USERMANAGEMENT_URL}/dashboard/${newUsername}`);
    const resData = await newUserData.json() as { email: string, avatar: string };
    return reply.viewAsync("dashboard/profile-button.ejs", { username: newUsername, email: resData.email, img_avatar: resData.avatar });

  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({ error: 'Internal Server Error' });
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
    request.log.error(error);
    return reply.code(500).send({ error: 'Internal Server Error' });
  }
};

const DATABASE_URL = 'http://database_container:3000';

export async function editAvatar(request: FastifyRequest, reply: FastifyReply) {
  try {
	console.log("edit avatar triggered");
    const { username } = request.params as { username: string };
    const newAvatar = await request.file();
    if (!newAvatar) {
      return reply.code(400).send({ error: "No file uploaded!" });
    }
	console.log("new avatar file = ", newAvatar);

	
    const avatarBuffer = await newAvatar.toBuffer();
    const form = new FormData();
    form.append('avatar', new Blob([avatarBuffer]), newAvatar.filename);
	console.log("form = ", form, " file = ", newAvatar.filename);
    const res = await fetch(`${DATABASE_URL}/editAvatar/${username}`, {
      method: 'POST',
	  headers: {
        'Content-Type': 'multipart/form-data',
      },
      body: form,
    });

    const result = await res.json() as { email: string, avatar: string };;
	return reply.viewAsync("dashboard/profile-button.ejs", { username: username, email: result.email, img_avatar: result.avatar });
    //return reply.send(result);
  } catch (error) {
    return reply.code(500).send({ error: 'Internal Server Error' });
  }
}

