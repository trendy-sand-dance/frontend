import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import fs from 'node:fs';

function getBundledFile() {
  return new Promise((resolve, reject) => {
    fs.readdir('./public', (err, files) => {
      if (err) {
        reject(err);
        return;
      }

      for (const file of files) {
        if (file.includes('index') && file.endsWith('.js')) {
          console.log(file);
          resolve(file);
          return;
        }
      }
      resolve(null);
    });
  });
}

export async function routes(fastify: FastifyInstance) {
  fastify.get('/game', async function(request: FastifyRequest, reply: FastifyReply) {
    try {

      const file = await getBundledFile();
      let html = `<div id="pixi-container" class="bg-black border border-[#FF55FE] text-white w-full">
                  <script type="module" src="${file}"></script>
                  </div>`

      console.log(html);
      return reply.send(html);

    } catch (err) {

      console.log("MAYDAY!!!!!!!");
      return reply.send("MAYDAY!");

    }

  });

  fastify.get('/', async function(request: FastifyRequest, reply: FastifyReply) {
    return reply.sendFile('index.html');
  });


  fastify.get('/dashboard', async function(request: FastifyRequest, reply: FastifyReply) {
    return reply.viewAsync("dashboard/dashboard-view.ejs", { username: "Flip", email: "flop@gmail.com", img_avatar: "img_avatar.png" });
  })

  fastify.post('/dashboard', async function(request: FastifyRequest, reply: FastifyReply) {
    const userInfo = request.body as { username: string, password: string };

    if (userInfo.username === "admin" && userInfo.password === "123") {
      return reply.viewAsync("dashboard/dashboard-view.ejs", { username: userInfo.username, email: "unknown@gmail.com", img_avatar: "img_avatar.png" });
    }

    try {
      const response = await fetch('http://user-management:3000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userInfo)
      });

      const responseData = await response.json() as { message: string, error: string, statusCode: number };
      console.log("statusCode: ", responseData.statusCode);


      if (responseData.statusCode !== 200) {
        // return reply.viewAsync("account/login-view.ejs", { login_failed: true });
        console.log("ResponseData: ", responseData);
        return reply.code(404).viewAsync("errors/incorrect-userdetails.ejs", { code: reply.statusCode, message: responseData.message });
      }
      return reply.viewAsync("dashboard/dashboard-view.ejs", { username: userInfo.username, email: "unknown@gmail.com", img_avatar: "img_avatar.png" });
    } catch (error) {
      request.log.error(error);
      // reply.code(500).send({ error: 'Internal Server Error' });
      return reply.viewAsync("errors/error-500.ejs");
    }

  })

  // Logging and signing in
  fastify.get('/login-view', async function(request: FastifyRequest, reply: FastifyReply) {
    return reply.viewAsync("account/login-view.ejs", { login_failed: false });
  })

  fastify.get('/register-view', async function(request: FastifyRequest, reply: FastifyReply) {
    return reply.viewAsync("account/register-view.ejs");
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
