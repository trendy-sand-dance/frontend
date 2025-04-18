import { FastifyRequest, FastifyReply } from 'fastify';
import fs from 'fs';
import path  from 'path';
import parseFile from '../utils/file.controller';
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

		// get file
		const file = await request.file();
		if (!file) {
		  throw { code: 406, message: 'No content' };
		}
		
		//TODO Check file even has exnesiton?
		const extension = file.filename.split('.').pop();
		//if (!extension)
	
		const userAvatar = (username + "_avatar") as string;
		const filename = (username + "_avatar." + extension) as string;

		// PARSE FILE
		//const buffer = await file.toBuffer();
		//const wrkdir = process.cwd();
		//const uploadDir = path.join(wrkdir, 'public/images');
		const uploadDir = parseFile(file);

		// ensure uploads directory exists
		if (!fs.existsSync(uploadDir)) {
			fs.mkdirSync(uploadDir, { recursive: true });
		}

		// delete existing avatar
		const files = fs.readdirSync(uploadDir);
		files.forEach(f => {
			if (f.split('.')[0] == userAvatar)
			{
				const deleteMe = path.join(uploadDir, f);
				fs.unlinkSync(deleteMe); // delete file
			}
		});

		// upload
		const buffer = await file.toBuffer();
		const filePath = path.join(uploadDir, filename);
		fs.writeFile(filePath, buffer, (err) => {
			if (err) {
				throw { code: 500, message: "Erroring uploading file" };
			}});

		const resEdit = await fetch(`${USERMANAGEMENT_URL}/editAvatar/${username}`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ filename }),
		});
		if (!resEdit.ok) {
			const responseBody = await resEdit.json() as { error: string };
			throw { code: resEdit.status, message: responseBody.error };
		}

		// update dashboard info with new user info + return new view
		const newUserData = await fetch(`${USERMANAGEMENT_URL}/dashboard/${username}`);
		const resData = await newUserData.json() as { email: string, avatar: string };
		return reply.viewAsync("dashboard/profile-button.ejs", { username: username, email: resData.email, img_avatar: resData.avatar });
	
	} catch (error) {
		console.error(error);
		const err = error as { code: number, message: string };
		return reply.code(err.code).send({ error: err.message });
	}
};
