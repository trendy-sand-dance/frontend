import { FastifyReply, FastifyRequest} from 'fastify';


export async function setJwt(request: FastifyRequest, reply: FastifyReply, user: User)
{
	const payload = {
		id: user["id"],
		email: user["email"],
		name: user["username"],
	}

	const token = request.jwt.sign(payload)
	reply.setCookie('access_token', token, {
		path: '/',
		httpOnly: true,
		secure: true,
	})
}
