import {FastifyInstance, FastifyPluginOptions, FastifyReply, FastifyRequest} from 'fastify';
import { DATABASE_URL, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from '../../config';
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
		console.log("Respones_json: ", response_json);


		const login_user_resp = await fetch(`${DATABASE_URL}/login_google`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				email: response_json.email,
				username: response_json.name,
			})
		});

		const filename = response_json.picture;

		if (!login_user_resp.ok)
		{
			console.log("something fucky when ton")
			// TODO: Add Merlin's error handling.
			return;
		}

		const user = await login_user_resp.json() as User;
		console.log("freshly created user : ", user);
		await setJwt(request, reply, user);

		// Change user avatar to Google picture
		const setAvatar = await fetch(`${DATABASE_URL}/editAvatar/${user.username}`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ filename }),
		});
		if (!setAvatar.ok) {
			console.error("Failed to set avatar of Google user");
		}



		// reply.redirect("http://localhost:8000/?access_token=" + token.access_token);
		// reply.redirect("http://localhost:8000/?access_token=" + token.access_token);
		reply.redirect('/dashboard');
	});

	done();
}

