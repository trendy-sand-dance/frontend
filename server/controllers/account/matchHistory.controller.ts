
import { FastifyRequest, FastifyReply } from 'fastify';

const DATABASE_URL: string = "http://database_container:3000";

export async function viewMatchHistory(request: FastifyRequest, reply: FastifyReply): Promise<any>
{
	try {
		const { userid } = request.params as {userid: number};
		console.log("userid:", userid, typeof userid);
	
		const res = await fetch(`${DATABASE_URL}/getUserMatches/${userid}`);
		const { matches } = await res.json() as any; //needs interface
		console.log("✅ matches:", matches);
		return reply.viewAsync("partials/sidebar-match-history.ejs", {matches: matches})
		
	} catch (error) {
		request.log.error(error);
		const err = error as { code: number, message: string };
		return reply.code(err.code).send({ message: err.message});
	}
}

