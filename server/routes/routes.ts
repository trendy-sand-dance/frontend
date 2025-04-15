import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { registerUser, getRegisterView } from '../controllers/account/register.controller.js';
import { loginUser, logoutUser, getLoginView } from '../controllers/account/login.controller.js';
import { getDashboard, getDashboardUser } from '../controllers/dashboard/dashboard.controller.js';
import { editUsername, editEmail, editAvatar } from '../controllers/account/edit.controller.js';
import { getPixiGame } from '../controllers/game/game.controller.js';
import { getImage } from "../controllers/dashboard/images.controller"

export async function routes(fastify: FastifyInstance) {

  // Root
  fastify.get('/', async function(request: FastifyRequest, reply: FastifyReply) {
    return reply.sendFile('index.html');
  });

  // Account
  fastify.get('/login-view', getLoginView);
  fastify.get('/register-view', getRegisterView);
  fastify.post('/register-user', registerUser);
  fastify.post('/login-user', loginUser);
  fastify.get('/logout/:username', logoutUser);
  // Editing

  fastify.post('/editUsername/:username', editUsername);
  fastify.post('/editEmail/:username', editEmail);
  fastify.post('/editAvatar/:username', editAvatar);

  // Game
  fastify.get('/game-canvas', getPixiGame);

  // Dashboard
  fastify.get('/dashboard', getDashboard);
  fastify.get('/dashboard/:username', getDashboardUser);
  fastify.get('/images/:filename', getImage);

};
