import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { registerUser, getRegisterView } from '../controllers/account/register.controller.js';
import { login, logout, getLoginView } from '../controllers/account/login.controller.js';
import { editUsername, editPassword, editEmail, deleteUser, editAvatar, deleteAvatar } from '../controllers/account/editUser.controller.js';
import { areFriends, sendFriendReq, acceptFriendReq, rejectFriendReq, blockFriend, viewPlayers, deleteAssociation } from '../controllers/account/friend.controller.js';
import { getStats, updateWins, updateLosses } from '../controllers/account/stats.controller';
import { getPixiGame, getPlayerInfo, getUserInfo, getTournamentPlayers } from '../controllers/game/game.controller.js';
import { getDashboard, getDashboardUser } from '../controllers/dashboard/dashboard.controller.js';
import { viewMatchHistory } from '../controllers/account/matchHistory.controller.js';
import { FastifyJWT } from '@fastify/jwt';
import { getRoomMessages, getMessageHistory } from '../controllers/chat/chat.controller.js';
import { CHATSERVER_URL } from '../config.js';
// import sidebarController from "../controllers/playground.controller.js";


export async function routes(fastify: FastifyInstance) {

  // Root
	// auto redirect when token is set (pretty gnarly but it do be workin)
  fastify.get('/', async function(request: FastifyRequest, reply: FastifyReply) {
		const token = request.cookies.access_token
		if (!token)
			return reply.sendFile('index.html');
		request.user = request.jwt.verify<FastifyJWT['user']>(token)

		return reply.redirect('/dashboard');
  });

  // Account
  fastify.get('/login-view', getLoginView);
  fastify.get('/register-view', getRegisterView);
  fastify.post('/register-user', registerUser);

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
  fastify.get('/areFriends/:userId1/:userId2', areFriends);

  fastify.post('/login', login);
  fastify.get('/logout', {
    preHandler: [fastify.authenticate],
  }, logout);


  // Game
  fastify.get('/game-canvas', getPixiGame);
  fastify.get('/game/playerinfo/:id', getPlayerInfo);
  fastify.get('/game/userinfo/:id', getUserInfo);
  fastify.get('/getTournamentPlayers', getTournamentPlayers);

  // Chat
  fastify.get('/getRoomMessages/:id', getRoomMessages);



  // Dashboard
  fastify.get('/dashboard', {
    preHandler: [fastify.authenticate],
  }, getDashboard);
  fastify.get('/dashboard/:userid', getDashboardUser);


  fastify.get('/viewMatchHistory/:userid', viewMatchHistory);


  //can we delete these?
 
  fastify.get('/sidebar/chat/:id', getMessageHistory);

	fastify.get('/sidebar/players', async (req, reply) => {
	return reply.view('/partials/sidebar-players.ejs');
  	});

}
