import {FastifyInstance, FastifyPluginOptions, FastifyReply, FastifyRequest} from 'fastify';

export function googleOAuth2Routes (
    app: FastifyInstance,
    options: FastifyPluginOptions,
    done: () => void,
) {

    // https://developers.google.com/
    // Google OAuth2 JavaScript redirect URI
    app.get('/google/callback',async function (request: FastifyRequest, reply: FastifyReply) {

        // Get the access token from the Google service and save it into the token value
        const { token } = await app.GoogleOAuth2.getAccessTokenFromAuthorizationCodeFlow(request);


        // Redirect to our frontend side
        // You can get the access token from the URI Query and save it as a cookie in the client browser
				// info = fetch("https://www.googleapis.com/oauth2/v3/userinfo?access_token=")
				const user_info = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${token.access_token}`, {
					method: 'GET',
					headers: {
						Accept: '*/*',
					},
				});
				console.log("doxxedd lmao: ", user_info);
        reply.redirect("http://localhost:8000/?access_token=" + token.access_token);
    });

    done();
}

