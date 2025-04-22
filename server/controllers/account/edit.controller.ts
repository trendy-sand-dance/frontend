import { FastifyRequest, FastifyReply } from 'fastify';
import fsSync from 'fs';
import { promises as fs } from 'fs';
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

export async function editAvatar(request: FastifyRequest, reply: FastifyReply) {
	try {
		const { username } = request.params as { username: string };

		// get file
		const file = await request.file();
		if (!file) {
		  throw { code: 406, message: 'No content' };
		}
		const extension = file.filename.split('.').pop();
		
		// get upload directory
		const buffer = await file.toBuffer();
		const wrkdir = process.cwd();
		const uploadDir = path.join(wrkdir, 'public/images');

		// ensure uploads directory exists
		if (!fsSync.existsSync(uploadDir)) {
			fsSync.mkdirSync(uploadDir, { recursive: true });
		}

		// upload
		const filePath = path.join(uploadDir, file.filename);
		if (!fsSync.existsSync(filePath)) {
			fsSync.writeFile(filePath, buffer, (err) => {
				if (err) {
					throw { code: 500, message: "Erroring uploading file" };
				}});
			}
		
		const userAvatar = (username + "_avatar") as string;
		const rand = (Math.random() * 10).toString(10).substr(0, 5);
		const filename = (username + "_avatar_E" + rand + "." + extension) as string;

		// delete existing avatar
		const files = fsSync.readdirSync(uploadDir);
		files.forEach(f => {
			if (f.split('_E')[0] == userAvatar)
			{
				// find existing with username_avatar name
				const deleteMe = path.join(uploadDir, f);
				fsSync.unlinkSync(deleteMe); // delete file
			}
		});
		
		const oldPath = filePath;
		const newPath = path.join(uploadDir, filename);
		await fs.rename(oldPath, newPath);

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

