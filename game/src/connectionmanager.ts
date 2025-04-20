import { Texture } from "pixi.js";
import { playerManager } from './playermanager.js';
import { ServerMessage } from './interfaces.js';
import { Vector2 } from './interfaces.js';
import GameMap from './gamemap.js';


export function sendToServer(data: ServerMessage) {
  if (socket.readyState == WebSocket.OPEN) {
    socket.send(JSON.stringify(data));
  }
}


// Get user data
//
interface User {
  id: number,
  username: string,
  password: string,
  email: string,
  avatar: string,
  status: boolean,
  player: Player
}


interface Player {
  id: number,
  userId: number,
  x: number,
  y: number,
}

declare global {
  interface Window {
    __INITIAL_STATE__: User;
  }
}

const localUser = window.__INITIAL_STATE__;
console.log("LOCAL USER", localUser);

// Init WebSocket
const socket = new WebSocket("ws://localhost:8003/ws-gameserver");

function initializeLocalPlayer(localPlayerData: Player, gameMap: GameMap, texture: Texture) {
  playerManager.setLocalPlayer(localPlayerData.id, { x: localPlayerData.x, y: localPlayerData.y }, Texture.from('player_bunny'));
  const player = playerManager.getLocalPlayer();
  playerManager.addPlayer(localPlayerData.id, { x: localPlayerData.x, y: localPlayerData.y }, texture);
  if (player) {
    const mapContainer = gameMap.getContainer();
    player.updatePosition({ x: localPlayerData.x, y: localPlayerData.y });
    mapContainer.addChild(player.getContext());
    sendToServer({ type: "newConnection" });
  }
}

function initializePlayers(players: Map<number, Vector2>, gameMap: GameMap, texture: Texture) {

  for (const [id, position] of players) {
    console.log(`Player ${id} is at (${position.x}, ${position.y})`);
    if (!isLocalPlayer(id)) {
      const player = playerManager.addPlayer(id, { x: position.x, y: position.y }, texture);
      if (player) {
        const mapContainer = gameMap.getContainer();
        player.updatePosition(position);
        mapContainer.addChild(player.getContext());
      }
    }
  }
}

function isLocalPlayer(id: number): boolean {
  return id === localUser.id;
}

export async function runConnectionManager(gameMap: GameMap) {
  const texture = Texture.from('player_bunny');
  initializeLocalPlayer(localUser.player, gameMap, texture);

  socket.onopen = () => {
    console.log("Websocket connection opened.");
    // socket.send(JSON.stringify({ type: "newConnection", info: "Client connected!", username: 'abusername' }));
  };

  socket.onmessage = (message) => {
    const data = JSON.parse(message.data);
    console.warn(message.data);

    if (data.type == "initializePlayers") {
      initializePlayers(data.players, gameMap, texture);
    }

    if (data.type == "move" && !isLocalPlayer(data.id)) {
      const player = playerManager.getPlayer(data.id);
      player?.updatePosition(data.position);
    }

    if (data.type == "disconnectPlayer" && !isLocalPlayer(data.id)) {
      const mapContainer = gameMap.getContainer();
      const player = playerManager.getPlayer(data.id);
      if (player) {
        mapContainer.removeChild(player.getContext());
      }
      playerManager.removePlayer(data.id);
    }

  };

  socket.onerror = (message) => {
    console.log("Websocket error: ", message);
  };

  socket.onclose = (message) => {
    console.log("Websocket closed: ", message);
    // if (socket.readyState == WebSocket.OPEN) {
    //   socket.send(JSON.stringify({ type: "disconnection", info: "Client disconnected!", id: localUser.id, position: { x: 4.2, y: 4.2 } }));
    // }
  };

  window.addEventListener("beforeunload", () => {
    if (socket.readyState == WebSocket.OPEN) {
      const player = playerManager.getLocalPlayer();
      let pos: Vector2 = { x: 0, y: 0 };
      if (player) {
        pos = player.position.asCartesian;
        socket.send(JSON.stringify({ type: "disconnection", info: "Client disconnected!", id: localUser.id, position: pos }));
        sendToServer({ type: "disconnection", id: localUser.id, position: pos });
      } else {
        socket.send(JSON.stringify({ type: "disconnection", info: "Client disconnected!", id: localUser.id, position: { x: -4.2, y: -4.2 } }));
      }
    }
  });

}

