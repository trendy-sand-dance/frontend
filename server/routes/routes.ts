import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { registerUser, getRegisterView } from '../controllers/account/register.controller.js';
import { login, loginUser, logout, getLoginView } from '../controllers/account/login.controller.js';
import { getStats, updateWins, updateLosses } from '../controllers/account/stats.controller';
import { editUsername, editPassword, editEmail, deleteUser, editAvatar, deleteAvatar } from '../controllers/account/editUser.controller.js';
import { sendFriendReq, acceptFriendReq, rejectFriendReq, blockFriend, viewPlayers, deleteAssociation } from '../controllers/account/friend.controller.js';
import { getPixiGame, getPlayerInfo, getTournamentPlayers } from '../controllers/game/game.controller.js';
import { getDashboard, getDashboardUser } from '../controllers/dashboard/dashboard.controller.js';
// import sidebarController from "../controllers/playground.controller.js";

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
  fastify.get('/logout/:username', logout);
  
  // Stats
  fastify.get('/stats/:username', getStats);
  fastify.post('/addWin/:username', updateWins);
  fastify.post('/addLoss/:username', updateLosses);

  // Editing
  fastify.post('/editUsername/:username', editUsername);
  fastify.post('/editPassword/:username', editPassword);
  fastify.post('/editEmail/:username', editEmail);
  fastify.delete('/delete/:username', deleteUser);
  fastify.post('/editAvatar/:username', editAvatar);
  fastify.post('/deleteAvatar/:username', deleteAvatar);
  
  // Friends
  fastify.post("/sendReq/:receiverId/:userId", sendFriendReq);
  fastify.post('/acceptReq/:senderId/:userId', acceptFriendReq); // sender is person who sent request, this user is accepting their request
  fastify.delete('/rejectReq/:senderId/:userId', rejectFriendReq); // sender is person who sent request, this user is rejecting their request
  fastify.post('/block/:friendId/:userId', blockFriend); // friend is person who user wants to block
  fastify.get('/viewPlayers/:username', viewPlayers);
  fastify.delete("/deleteFriend/:senderId/:userId", deleteAssociation);
 
  // Game
  fastify.get('/game-canvas', getPixiGame);
  fastify.get('/game/playerinfo/:id', getPlayerInfo);
  fastify.get('/getTournamentPlayers', getTournamentPlayers);


  // Dashboard
  fastify.get('/dashboard', getDashboard);
  fastify.get('/dashboard/:username', getDashboardUser);





fastify.get('/placeholder', async (req, reply) => {
	return reply.send("functionality SOON");
  });


  fastify.get('/sidebar/chat', async (req, reply) => {
	return reply.view('/partials/sidebar-chat.ejs');
  });
  
  fastify.get('/sidebar/players', async (req, reply) => {
	return reply.view('/partials/sidebar-players.ejs');
  });
};
