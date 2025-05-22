
import { FastifyRequest, FastifyReply } from 'fastify';

const DATABASE_URL: string = "http://database_container:3000";

export async function viewMatchHistory(request: FastifyRequest, reply: FastifyReply): Promise<any>
{
	try {
		const userID = request.params as {id: number};
	
		const matches = await fetch(`${DATABASE_URL}getUserMatches/${userID}`);
		return reply.viewAsync("partials/sidebar-match-history.ejs", {matches})
		
	} catch (error) {
		return reply.send("erorr loading match history :S");
	}
}
