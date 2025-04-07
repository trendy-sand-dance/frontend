import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { registerUser, getRegisterView } from '../controllers/account/register.controller.js';
import { loginUser, logoutUser, getLoginView } from '../controllers/account/login.controller.js';
import { getDashboard, getDashboardUser } from '../controllers/dashboard/dashboard.controller.js';
import { getPixiGame } from '../controllers/game/game.controller.js';

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
  // fastify.post('/logout/:username', logoutUser);


  // Game
  fastify.get('/game', getPixiGame);

  // Dashboard
  fastify.get('/dashboard', getDashboard);
  fastify.get('/dashboard/:username', getDashboardUser);



  // fastify.get('/dashboard/:username/settings', async function(request: FastifyRequest, reply: FastifyReply) {
  //   const { username } = request.params as { username: string };
  //   return reply.viewAsync("user-settings.ejs", { username: username });
  // });

  // fastify.get('/dashboard/:username', async function(request: FastifyRequest, reply: FastifyReply) {
  //
  //   const { username } = request.params as { username: string };
  //
  //   console.log("Username: ", username);
  //   console.log("request.params: ", request.params);
  //
  //   const response = await fetch(`http://10.11.3.10:8000/dash/${username}`, {
  //     method: 'GET',
  //     headers: {
  //       'Content-Type': 'application/json',
  //     }
  //   });
  //
  //   const responseData = await response.json() as { email: string };
  //
  //   return reply.viewAsync("dashboard.ejs", { username: username, email: JSON.stringify(responseData.email) });
  //
  // });

  // fastify.post('/edit/:username', async function(request: FastifyRequest, reply: FastifyReply) {
  //
  //   try {
  //     const { username } = request.params as { username: string };
  //     const { newUsername, password, newPassword, avatar } = request.body as { newUsername: string, password: string, newPassword: string, avatar: string };
  //
  //     console.log("request.body: ", request.body);
  //     console.log("username: ", username);
  //
  //     const dataPackage = JSON.stringify({ username, newUsername, password, newPassword, avatar });
  //
  //     console.log("dataPackage: ", dataPackage);
  //     const response = await fetch('http://10.11.3.10:8000/edit', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: dataPackage
  //     });
  //
  //     const responseData = await response.json() as { message: string };
  //     console.log(responseData);
  //     return responseData;
  //
  //   } catch (error) {
  //     request.log.error(error);
  //     return reply.code(500).send({ error: 'Internal Server Error' });
  //   }
  //
  // })



};
