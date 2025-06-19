import Fastify, { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { JWT_SECRET, PORT, ADDRESS, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from './config';

import { routes } from './routes/routes.js';
import closeWithGrace from 'close-with-grace';

// Plugins
import pluginCORS from '@fastify/cors';
import pluginStatic from '@fastify/static';
import pluginFormbody from '@fastify/formbody';
import pluginView from '@fastify/view';
import pluginMultipart from '@fastify/multipart';
import pluginJwt, { FastifyJWT } from '@fastify/jwt'
import pluginCookie from '@fastify/cookie'
import OAuth2, { OAuth2Namespace } from "@fastify/oauth2";


import { FastifyStaticOptions } from '@fastify/static';
import './setUpFetch';

// Utility
import path from 'node:path';
// import fs from 'fs';
// const key =  path.join(path.dirname(__dirname), './server/server.key');
// const cert = path.join(path.dirname(__dirname), './server/server.crt');
import { googleOAuth2Routes } from './controllers/oauth2/google.controller';


const fastify: FastifyInstance = Fastify({
  logger: {
    transport: {
      target: 'pino-pretty',
      options: {
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
        colorize: true,
      }
    },
    level: 'warn'
  },
  // https: {
  //   key: fs.readFileSync(key),
  //   cert: fs.readFileSync(cert),
  // }
});

fastify.register(pluginMultipart), {
	limits: { fileSize: 10 * 1024 * 1024 }
};

fastify.register(pluginFormbody);

const corsOptions = {
	// Allow all origins
	// VERY IMPORTANT: In response, the server returns an Access-Control-Allow-Origin header with Access-Control-Allow-Origin: *
	// which means that the resource can be accessed by any origin. (VERY DANGER!)
	// You can read more about in:
	// https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
	origin: "*"
}

fastify.register(pluginCORS, corsOptions), {
	origin: true, // Specify domains for production
	methods: ['GET', 'POST', 'PUT', 'DELETE'],
	credentials: true
};

fastify.register(pluginStatic, {
	root: path.join(path.dirname(__dirname), 'public'),
	// prefix: "/public"
} as FastifyStaticOptions)

fastify.register(pluginView, {
	engine: {
		ejs: require("ejs")
	},
	root: path.join(path.dirname(__dirname), 'server/views'),
	viewExt: "ejs"
})


fastify.register(pluginJwt, {
	// TODO: Mabye this secret should be different than the one on line 76
	secret: JWT_SECRET
})

fastify.addHook('preHandler', (req, res, next) => {
	req.jwt = fastify.jwt
	return next()
})

fastify.register(pluginCookie, {
	secret: JWT_SECRET,
	hook: 'preHandler',
})

fastify.decorate(
	'authenticate',
	async (request: FastifyRequest, reply: FastifyReply) => {
		const token = request.cookies.access_token
		try {
			if (!token)
				// haha I love javascript
				throw {};
			request.user = request.jwt.verify<FastifyJWT['user']>(token)
		} catch (error) {
			// delete invalid cookie
  		reply.clearCookie('access_token')
			await reply.view(
				"errors/error-page.ejs",
			{
				title: "Not logged in (silly)",
				details: "Please log in before accessing the dashboard"
			});
			return;
		}
	},
)

// Google OAuth2 Options
const googleOAuth2Options = {
	// Namespace
	name: 'GoogleOAuth2',
	// Scopes
	scope: ['profile', 'email'],
	credentials: {
		client: {
			// Put in your client id here
			id: GOOGLE_CLIENT_ID,
			// Put in your client secret here
			secret: GOOGLE_CLIENT_SECRET
		},
		// @fastify/oauth2 google provider
		auth: OAuth2.GOOGLE_CONFIGURATION
	},
	// This option will create a new root with the GET method to log in through Google.
	// Make sure you don't have any other routes in this path with the GET method.
	startRedirectPath: '/oauth2/google',
	// Here you specify the Google callback route.
	// All logics will be checked after the success login or failure login in this path.
	callbackUri: `https://localhost:8000/frontend/oauth2/google/callback`,
	// The following 2 functions are check in detail whether the input parameters from Google include the state query parameter or not

	// TODO: Make this shit work

	// generateStateFunction: (request: FastifyRequest, reply: FastifyReply) => {
	// reply == reply;
	//     // @ts-ignore
	//     return request.query.state
	// },
	// checkStateFunction: (request: FastifyRequest, callback: any) => {
	//     // @ts-ignore
	//     if (request.query.state) {
	//         callback()
	//         return;
	//     }
	//     callback(new Error('Invalid state'))
	// }
};

fastify.register(OAuth2, googleOAuth2Options)

fastify.register(routes);

fastify.register(googleOAuth2Routes, { prefix: "/oauth2" });

async function startServer() {
	closeWithGrace(
		{ delay: 1000 },
		async ({ err }) => {
			if (err != null) {
				fastify.log.error(err)
			}

			await fastify.close()
		}
	)

	await fastify.ready();

	try {
		await fastify.listen({ port: PORT, host: ADDRESS });
	}
	catch (err) {
		fastify.log.error(err);
		process.exit(1);
	}
}

process.on('SIGTERM', () => {
	console.log('SIGTERM signal received: closing HTTP server');
	fastify.close(() => {
		console.log('HTTP server closed');
	});
});

process.on('SIGINT', () => {
	console.log('SIGINT signal received: closing HTTP server');
	fastify.close(() => {
		console.log('HTTP server closed');
	});
});

startServer();
