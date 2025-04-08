import { FastifyInstance } from "fastify";

declare module "fastify" {
	interface FastifyRequest {
		server: FastifyInstance;
	}
	interface User {
		username: string;
		password: string;
		email: string;
		avatar: string;
		status: boolean;
	}
};