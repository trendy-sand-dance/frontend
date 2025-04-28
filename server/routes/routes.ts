import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { registerUser, getRegisterView } from '../controllers/account/register.controller.js';
import { getStats, updateWins, updateLosses } from '../controllers/account/stats.controller';
import { login, loginUser, logout, getLoginView } from '../controllers/account/login.controller.js';
import { getDashboard, getDashboardUser } from '../controllers/dashboard/dashboard.controller.js';
import { editUsername, editPassword, editEmail, editAvatar } from '../controllers/account/editUser.controller.js';
import { getPixiGame, getPlayerInfo } from '../controllers/game/game.controller.js';
import { sendFriendReq, acceptFriendReq, rejectFriendReq, blockFriend, viewPlayers } from '../controllers/account/friend.controller.js';
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
  fastify.get('/stats/:username', getStats);
  fastify.post('/addWin/:username', updateWins);
  fastify.post('/addLoss/:username', updateLosses);

  // Friends
  fastify.post("/sendReq/:receiverId/:userId", sendFriendReq);
  fastify.post('/acceptReq/:senderId/:userId', acceptFriendReq); // sender is person who sent request, this user is accepting their request
  fastify.delete('/rejectReq/:senderId/:userId', rejectFriendReq); // sender is person who sent request, this user is rejecting their request
  fastify.post('/block/:friendId/:userId', blockFriend); // friend is person who user wants to block
  fastify.get('/viewPlayers/:username', viewPlayers);
 
  // fastify.post('/login-user', loginUser);
  fastify.post('/login-user', login);
  fastify.get('/logout/:username', logout);
  
  // Editing
  fastify.post('/editUsername/:username', editUsername);
  fastify.post('/editPassword/:username', editPassword);
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

  fastify.get('/sidebar/chat', async (req, reply) => {
	return reply.view('/partials/sidebar-chat.ejs');
  });
  
  fastify.get('/sidebar/players', async (req, reply) => {
	return reply.view('/partials/sidebar-players.ejs');
  });
};
