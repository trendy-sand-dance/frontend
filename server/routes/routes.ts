import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { registerUser, getRegisterView } from '../controllers/account/register.controller.js';
import { loginUser, logoutUser, getLoginView } from '../controllers/account/login.controller.js';
import { getDashboard, getDashboardUser } from '../controllers/dashboard/dashboard.controller.js';
import { editUsername, editEmail, editAvatar } from '../controllers/account/edit.controller.js';
import { getPixiGame } from '../controllers/game/game.controller.js';

import FormData from 'form-data';
import fetch from 'node-fetch';

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
  fastify.post('/editEmail/:username', editEmail);


  const DATABASE_URL = 'http://database_container:3000';
//  fastify.post('/editAvatar/:username', editAvatar);
  fastify.post('/editAvatar/:username', async function (request: FastifyRequest, reply: FastifyReply) {
	  
	const { username } = request.params as { username: string };

	const avatarFile = await request.file();
	if (!avatarFile) {
		console.log("no file");
		return reply.code(500);
	}
	console.log("GOT FILE, file = ", avatarFile);


	
	const formData = new FormData();
	const buff = await avatarFile.toBuffer();
	//formData.append('avatar', new Blob([buff]), avatarFile.filename);
	formData.append('avatar', buff, avatarFile.filename);
	//formData.append('avatar', buff, avatarFile.filename);
	//formData.append('avatar', buff, {
	//	filename: avatarFile.filename,
	//	contentType: avatarFile.mimetype,
	//  });

	//formData.append('avatar', new Blob([buff]), avatarFile.filename);

	  const res = await fetch( `${DATABASE_URL}/editAvatar/${username}`, {
			method: 'POST',
			body: formData,
		});
		return reply.code(500);
		//return reply.viewAsync("dashboard/profile-button.ejs", { username: username, avatar: resData.avatar });
	});

	//async function uploadFile() {
	//	const formData = new FormData();
		
	//	// Check if a file has been selected
	//	if (fileInput.files && fileInput.files[0]) {
	//	  // Append the selected file to the FormData object
	//	  formData.append('avatar', fileInput.files[0]);
	
	//	  // Send the FormData object to the server via fetch
	//	  const response = await fetch(`/editAvatar/${username}`, {
	//		method: 'POST',
	//		body: formData,  // Automatically sets the correct 'Content-Type' for multipart form data
	//	  });
	
	//	  if (response.ok) {
	//		console.log('Upload successful');
	//	  } else {
	//		console.error('Upload failed');
	//	  }
	//	} else {
	//	  console.error('No file selected');
	//	}
	//  }
	





  // Game
  fastify.get('/game-canvas', getPixiGame);

  // Dashboard
  fastify.get('/dashboard', getDashboard);
  fastify.get('/dashboard/:username', getDashboardUser);


  fastify.post('/editUsername/:username', editUsername);
};
