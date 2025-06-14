import {FastifyInstance, FastifyPluginOptions, FastifyReply, FastifyRequest} from 'fastify';
import { DATABASE_URL } from '../../config';
import { User } from '../../types';
import { setJwt } from '../../utility/jwt';

type googleOauth2Response = {
	sub: number,
	name: string,
	given_name: string,
	family_name: string,
	picture: URL,
	email: string,
	email_verified: boolean,
};

export function googleOAuth2Routes (
	app: FastifyInstance,
	options: FastifyPluginOptions,
	done: () => void,
) {

	// https://developers.google.com/
	// Google OAuth2 JavaScript redirect URI
	app.get('/google/callback', async function (request: FastifyRequest, reply: FastifyReply) {

		// Get the access token from the Google service and save it into the token value
		const { token } = await app.GoogleOAuth2.getAccessTokenFromAuthorizationCodeFlow(request);


		const response = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${token.access_token}`);
		const response_json = await response.json() as googleOauth2Response;


		const login_user_resp = await fetch(`${DATABASE_URL}/login`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				username: response_json.name,
				gooAuth: true
			})
		});

		// TODO: check if user exists if not create it.
    if (response.status == 401)
		{

    }

		const user = await login_user_resp.json() as User;
		await setJwt(request, reply, user);

		// console.log("username : ", response_json);
		//
		// const register_user_resp = await fetch(`${DATABASE_URL}/register`, {
		// 	method: 'POST',
		// 	headers: {
		// 		'Content-Type': 'application/json',
		// 	},
		// 	body: JSON.stringify({
		//     username: response_json.name,
		//     email: response_json.email,
		// 		gooAuth: true
		//  })
		// });

		// reply.redirect("http://localhost:8000/?access_token=" + token.access_token);
		// reply.redirect("http://localhost:8000/?access_token=" + token.access_token);
		reply.redirect('/dashboard');
	});

	done();
}

