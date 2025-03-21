import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

export async function routes(fastify: FastifyInstance) {
  fastify.get('/', async function(request: FastifyRequest, reply: FastifyReply) {
    return reply.sendFile('index.html');
  });

  fastify.get('/login', async function(request: FastifyRequest, reply: FastifyReply) {
    return reply.sendFile('login.html');
  });

  fastify.get('/register', async function(request: FastifyRequest, reply: FastifyReply) {
    return reply.sendFile('register.html');
  });

  fastify.get('/dashboard', async function(request: FastifyRequest, reply: FastifyReply) {
    return reply.viewAsync("dashboard-view.ejs", { username: "Flip", email: "flop@gmail.com" });
    // return reply.sendFile("dashboard-view.html");
  })

  fastify.get('/login-view', async function(request: FastifyRequest, reply: FastifyReply) {
    return reply.viewAsync("login-view.ejs");
  })

  fastify.get('/register-view', async function(request: FastifyRequest, reply: FastifyReply) {
    return reply.viewAsync("register-view.ejs");
  })

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

  // fastify.post('/login-user', async function(request: FastifyRequest, reply: FastifyReply) {
  //   try {
  //     const { username, password } = request.body as { username: string, password: string };
  //
  //     console.log("request.body: ", request.body);
  //
  //     const dataPackage = JSON.stringify({ username, password });
  //
  //     console.log("dataPackage: ", dataPackage);
  //     const response = await fetch('http://10.11.3.10:8000/login', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify(request.body)
  //     });
  //
  //     // const responseData = await response.json();
  //
  //     return reply.redirect(`/dashboard/${username}`);
  //   } catch (error) {
  //     request.log.error(error);
  //     return reply.code(500).send({ error: 'Internal Server Error' });
  //   }
  //
  // });

  // fastify.post('/register-user', async function(request: FastifyRequest, reply: FastifyReply) {
  //   try {
  //     const { username, password, email } = request.body as { username: string, password: string, email: string };
  //
  //     console.log("request.body: ", request.body);
  //
  //     const dataPackage = JSON.stringify({ username, password, email });
  //
  //     console.log("dataPackage: ", dataPackage);
  //     const response = await fetch('http://10.11.3.10:8000/register', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify(request.body)
  //     });
  //
  //     const responseData = await response.json();
  //
  //     // return responseData;
  //     return reply.sendFile("index.html");
  //
  //   } catch (error) {
  //     request.log.error(error);
  //     return reply.code(500).send({ error: 'Internal Server Error' });
  //   }
  //
  // });
};
