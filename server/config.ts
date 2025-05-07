// file containing global settings for this service.

// TODO: Rename
// fastify specs
export const ADDRESS: string = process.env.LISTEN_ADDRESS ? process.env.LISTEN_ADDRESS : '0.0.0.0';
export const PORT: number = process.env.LISTEN_PORT ? parseInt(process.env.LISTEN_PORT, 10) : 3000;


// TODO: Actually use ENV for this and throw error if not set (same for all the others actually)
export const JWT_SECRET:						string = process.env.JWT_SECRET 					|| "some-secret-key";


// Endpoints
export const DATABASE_URL:					string = process.env.DATABASE_URL 					|| "http://database_container:3000";
export const USERMANAGEMENT_URL:		string = process.env.USERMANAGEMENT_URL 		|| "http://user_container:3000";
export const LOCAL_GAMESERVER_URL:	string = process.env.LOCAL_GAMESERVER_URL 	|| "localhost:8003";

