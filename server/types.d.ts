import { FastifyInstance } from "fastify";

declare module "fastify" {
	interface FastifyRequest {
		server: FastifyInstance;
		file: (otions?: {
			fieldName?: string, 
			fileSize?: number, 
			mimetypeLimit?: string[]
		}) => Promise<MultipartFile | undefined>; 
	}
	interface User {
		username: string;
		password: string;
		email: string;
		avatar: string;
		status: boolean;
	}
};
