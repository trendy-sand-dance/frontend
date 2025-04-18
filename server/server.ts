import Fastify, { FastifyInstance } from 'fastify';
import { routes } from './routes/routes.js';
import closeWithGrace from 'close-with-grace';

// Plugins
import pluginCORS from '@fastify/cors';
import pluginStatic from '@fastify/static';
import pluginFormbody from '@fastify/formbody';
import pluginView from '@fastify/view';
import pluginMultipart from '@fastify/multipart';


import { FastifyStaticOptions } from '@fastify/static';
import './setUpFetch';

// Utility
import path from 'node:path';
const ADDRESS: string = process.env.LISTEN_ADDRESS ? process.env.LISTEN_ADDRESS : '0.0.0.0';
const PORT: number = process.env.LISTEN_PORT ? parseInt(process.env.LISTEN_PORT, 10) : 3000;

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
    level: 'info'
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

