import { playerManager } from './playermanager.js';

import { gameMap } from './gamemap.js';
import { pixiApp } from './main.js';
import { Assets } from "pixi.js";
const socket = new WebSocket("ws://localhost:8003/ws-gameserver");
const texture = await Assets.load('assets/bunny.png');

export function sendToServer(data) {
  if (socket.readyState == WebSocket.OPEN) {
    socket.send(JSON.stringify(data));
  }
}

socket.onopen = () => {
  console.log("Websocket connection opened.");
  socket.send(JSON.stringify({ type: "newConnection", info: "Client connected!", username: 'abusername' }));
};

socket.onmessage = (message) => {
  const data = JSON.parse(message.data);
  console.warn(message.data);

  if (data.type == "init") {
    console.log(`Initialized player: ${data.player.id} at pos (${data.player.position.x}, ${data.player.position.y})`);

    playerManager.setLocalPlayer(data.player.id, data.player.position, texture);
    const player = playerManager.getLocalPlayer();
    const mapContainer = gameMap.getContainer();
    if (player) {
      mapContainer.addChild(player.getContext());
    }


    // Object.entries(data.playerManager.players).forEach(([id, position]) => {
    //   if (playerManager.getLocalPlayerID() !== id) {
    //     console.log("Id, Position: ", id, position);
    //     let otherPlayer = playerManager.addPlayer(id, position);
    //     pixiApp.stage.addChild(otherPlayer.context);
    //   }
    // });
  }

};

socket.onerror = (message) => {
  console.log("Websocket error: ", message);
};

socket.onclose = (message) => {
  console.log("Websocket closed: ", message);
  socket.send(JSON.stringify({ type: "disconnection", info: "Client disconnected!", username: 'abusername', position: { x: 420, y: 420 } }));
};


// const dc = setTimeout(socket.close, 5000);
// const dc = setTimeout(closeIt, 5000);

