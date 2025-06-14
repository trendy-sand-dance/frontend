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


				const response = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${token.access_token}`);
				
				console.log("doxxedd lmao: ", await response.json());
        reply.redirect("http://localhost:8000/?access_token=" + token.access_token);
    });

    done();
}

