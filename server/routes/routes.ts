import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { registerUser, getRegisterView } from '../controllers/account/register.controller.js';
import { login, loginUser, logoutUser, getLoginView } from '../controllers/account/login.controller.js';
import { getDashboard, getDashboardUser } from '../controllers/dashboard/dashboard.controller.js';
import { editUsername, editEmail, editAvatar } from '../controllers/account/edit.controller.js';
import { getPixiGame, getPlayerInfo } from '../controllers/game/game.controller.js';
import { getImage } from "../controllers/dashboard/images.controller"
import { getPixiGame } from '../controllers/game/game.controller.js';
import { getImage } from "../controllers/dashboard/images.controller";
import { getplaygroundView } from "../controllers/playground.controller.js";
import sidebarController from "../controllers/playground.controller.js";

export async function routes(fastify: FastifyInstance) {

  // Root
  fastify.get('/', async function(request: FastifyRequest, reply: FastifyReply) {
    return reply.sendFile('index.html');
  });

  // Account
  fastify.get('/login-view', getLoginView);
  fastify.get('/register-view', getRegisterView);
  fastify.post('/register-user', registerUser);
  // fastify.post('/login-user', loginUser);
  fastify.post('/login-user', login);
  fastify.get('/logout/:username', logoutUser);
  
  // Editing
  fastify.post('/editUsername/:username', editUsername);
  fastify.post('/editEmail/:username', editEmail);
  fastify.post('/editAvatar/:username', editAvatar);
  
  // Game
  fastify.get('/game-canvas', getPixiGame);
  fastify.get('/game/playerinfo/:id', getPlayerInfo);

  // Dashboard
  fastify.get('/dashboard', getDashboard);
  fastify.get('/dashboard/:username', getDashboardUser);

  //scooby doo!
  fastify.get('/playground', getplaygroundView);
  fastify.get('/toggle-sidebar', sidebarController);
};
