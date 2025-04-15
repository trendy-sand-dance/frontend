import { FastifyRequest, FastifyReply } from 'fastify';
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

export async function editAvatar(request: FastifyRequest, reply: FastifyReply) {
	try {
		const { username } = request.params as { username: string };
		
		const contentType = request.headers['content-type'];
		if (!contentType) {
		  throw { code: 400, message: "Missing content-type" };
		}

		const res = await fetch(`${USERMANAGEMENT_URL}/editAvatar/${username}`, {
			method: 'POST',
			headers: {
			  'content-type': contentType,
			},
			// @ts-ignore: `duplex` is not in standard `RequestInit` yet
			duplex: 'half',
			body: request.raw,
		  });
		
		if (!res.ok) {
			const responseBody = await res.json() as { error: string };
			throw { code: res.status, message: responseBody.error };
		}
		const newUserData = await fetch(`${USERMANAGEMENT_URL}/dashboard/${username}`);
		const resData = await newUserData.json() as { email: string, avatar: string };
		return reply.viewAsync("dashboard/profile-button.ejs", { username: username, email: resData.email, img_avatar: resData.avatar });
		//return ({ code: res.status });
	} catch (error) {
		console.error(error);
		const err = error as { code: number, message: string };
		return reply.code(err.code).send({ error: err.message });
	}
};

