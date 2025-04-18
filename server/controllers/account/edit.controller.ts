import { FastifyRequest, FastifyReply } from 'fastify';
import fs from 'fs';
import path  from 'path';
//import utils from '../utils/file.controller';
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

// add username to uploaded file -- todo

//const getExtension = str => { str.slice(str.lastIndexOf("."))};
//var fileExt = filename.split('.').pop()

// get file, check if upload is needed, pass filename on to edit endpoints for um + db, update user info then send the new info to dashboard for update
export async function editAvatar(request: FastifyRequest, reply: FastifyReply) {
	try {
		const { username } = request.params as { username: string };

		// get file
		const file = await request.file();
		if (!file) {
		  throw { code: 406, message: 'No content' };
		}

		const extension = file.filename.split('.').pop();
		const fileName = (username + "_avatar." + extension) as string;
		const buffer = await file.toBuffer();
		const wrkdir = process.cwd();
		const uploadDir = path.join(wrkdir, 'public/images');
		if (!fs.existsSync(uploadDir)) {
			fs.mkdirSync(uploadDir, { recursive: true });
		}
		
		// check if upload is needed
		const filePath = path.join(uploadDir, fileName);
		if (!fs.existsSync(filePath)) {

			fs.writeFile(filePath, buffer, (err) => {
				if (err) {
					throw { code: 500, message: "Erroring uploading file" };
				}});
			}
		console.log("filename from file.filename in FE = ", file.filename);
		console.log("filename in FE = ", fileName);
		// send via um to db to update user info
		const filename = fileName;
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
