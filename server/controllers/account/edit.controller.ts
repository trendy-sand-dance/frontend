import { FastifyRequest, FastifyReply } from 'fastify';
import fs from 'fs';
import path  from 'path';
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

function fileExists(filename) {
	const wrkdir = process.cwd();
	const uploadDir = path.join(wrkdir, '/public/images');
	const filePath = path.join(uploadDir, filename);
	if (!fs.existsSync(filePath))
			return false;
	return true;
}

function uploadImage(filename, reply) {
	console.log("upload file plz");
	return reply.code(200).sendFile(`images/${filename}`);
}


/** upload new avatar file (if file not exists), update db with new avatar */
export async function editAvatar(request: FastifyRequest, reply: FastifyReply) {
	try {
		const { username } = request.params as { username: string };
		const { filename } = request.body as { filename: string };

		const res = await fetch(`${USERMANAGEMENT_URL}/editAvatar/${username}`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ filename }),
		});
		if (!res.ok) {
			const responseBody = await res.json() as { error: string };
			throw { code: res.status, message: responseBody.error };
		}
		const newUserData = await fetch(`${USERMANAGEMENT_URL}/dashboard/${username}`);
		const resData = await newUserData.json() as { email: string, avatar: string };

		console.log("HEREHHERHERHERE new avatar = ", resData.avatar);
		return reply.viewAsync("dashboard/profile-button.ejs", { username: username, email: resData.email, img_avatar: resData.avatar });
	} catch (error) {
		console.error(error);
		const err = error as { code: number, message: string };
		return reply.code(err.code).send({ error: err.message });
	}
};

export const getImage = async (request: FastifyRequest, reply: FastifyReply): Promise<any> => {
	try{
		const { filename } = request.params as { filename: string };
		const filePath = path.join(process.cwd(), 'public/images', filename);
		
		if (!fs.existsSync(filePath)) {
			throw { code: '404', message: "File doesn't exist" };
		}
		return reply.sendFile(filename);
	} catch (error) {
		console.error(error);
		return reply.code(500).send({ error: "Failed to retrieve image" });
	}
};

export async function uploadAvatar(request: FastifyRequest, reply: FastifyReply) {
	try {
		const file = await request.file();

		if (!file) {
		  return reply.code(400).send({ error: 'No file uploaded' });
		}
	
		const uploadDir = path.join(process.cwd(), 'public/images');
		const filePath = path.join(uploadDir, file.filename);

		if (fs.existsSync(filePath)) {
		  return reply.code(200).send({ avatar: `/images/${file.filename}` });
		}
	
		if (!fs.existsSync(uploadDir)) {
		  fs.mkdirSync(uploadDir, { recursive: true });
		}

		const writeStream = fs.createWriteStream(filePath);
		file.file.pipe(writeStream);
	
		return reply.code(200).send({ avatar: `/images/${file.filename}` });
	} catch (error) {
		console.error(error);
		reply.code(500).send({ error: 'Error saving file' });
	}
};