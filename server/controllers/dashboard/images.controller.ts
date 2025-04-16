import { FastifyRequest, FastifyReply } from 'fastify';
import fs from 'fs';
import path  from 'path';

export async function uploadFile(request: FastifyRequest, reply: FastifyReply) {
	try {
		const file = await request.file();

		if (!file) {
		  return reply.code(400).send({ error: 'No file uploaded' });
		}

		const buffer = await file.toBuffer();
		const wrkdir = process.cwd();
		const uploadDir = path.join(wrkdir, 'public/images');
		if (!fs.existsSync(uploadDir)) {
			fs.mkdirSync(uploadDir, { recursive: true });
		}
		
		const filePath = path.join(uploadDir, file.filename);
		if (fs.existsSync(filePath))
			return reply.code(204).send({ message: "File already exists in uploads directory", filename: file.filename });
		
		fs.writeFile(filePath, buffer, (err) => {
		if (err) {
			throw { code: 500, message: "Erroring writing file" };
		}});
		return reply.code(200).send({ message: "File successfully uploaded to server, yay", filename: file.filename });
	} catch (error) {
		console.error(error);
		reply.code(500).send({ error: 'Error uploading file to server' });
	}
};

export async function getImage(request: FastifyRequest, reply: FastifyReply) {
	try {
		const { filename } = request.params as { filename: string };
		const wrkdir = process.cwd();
		const uploadDir = path.join(wrkdir, '/public/images');
		const filePath = path.join(uploadDir, filename);
		if (!fs.existsSync( filePath ))
			throw { code: 404, message: "File doesn't exist"};
		
		return reply.code(200).sendFile(`images/${filename}`);//.send({ message: "successfully sent image"});


		//return reply.code(200).send({ message: "sent image successfully"});
	} catch (error) {
		console.error(error);
		return reply.code(500).send({ error: "Failed to send image" });
	}
};
