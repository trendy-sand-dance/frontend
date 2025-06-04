import  Fastify, { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { JWT_SECRET, PORT, ADDRESS, LOCAL_GAMESERVER_URL, USERMANAGEMENT_URL } from './config';

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


import { FastifyStaticOptions } from '@fastify/static';
import './setUpFetch';

// Utility
import path from 'node:path';

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
  }
});

fastify.register(pluginMultipart), {
  limits: { fileSize: 10 * 1024 * 1024 }
};

fastify.register(pluginFormbody);


fastify.register(pluginCORS), {
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
	// TODO: Add proper unauthorized page
	async (request: FastifyRequest, reply: FastifyReply) => {
		const token = request.cookies.access_token
		if (!token) {
			return reply.status(401).viewAsync(
				"errors/error-page.ejs",
			{
				title: "Not logged in",
				details: "Please log in before accessing the dashboard"
			});
		}
		// here decoded will be a different type by default but we want it to be of user-payload type
		const decoded = request.jwt.verify<FastifyJWT['user']>(token)
		request.user = decoded
	},
)


fastify.register(routes);

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

