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
interface UserData {
  id: number,
  username: string,
  password: string,
  email: string,
  avatar: string,
  status: boolean,
  player: PlayerData
}

interface PlayerData {
  id: number,
  userId: number,
  x: number,
  y: number,
}

declare global {
  interface Window {
    __INITIAL_STATE__: UserData;
    __GAMESERVER_URL__: string;
  }
}

const localUser = window.__INITIAL_STATE__;
const gameserverUrl = window.__GAMESERVER_URL__;
console.log("LOCAL USER", localUser);

// Init WebSocket
const socket = new WebSocket(`ws://${gameserverUrl}:8003/ws-gameserver`);

function initializeLocalPlayer(localPlayerData: PlayerData, gameMap: GameMap, texture: Texture) {

  let spawnPosition: Vector2;
  if (localPlayerData.x === 0 && localPlayerData.y === 0) {
    spawnPosition = { x: 36, y: 20 }; // Inits player at entrance
  } else {
    spawnPosition = { x: localPlayerData.x, y: localPlayerData.y };
  }

  const player = playerManager.initLocalPlayer(localPlayerData.id, spawnPosition, texture);
  if (player) {
    gameMap.addPlayer(player);
    return player;
  }
}

function initializePlayers(players: Map<number, Vector2>, gameMap: GameMap, texture: Texture) {

  for (const [id, position] of players) {

    console.log(`Player ${id} is at (${position.x}, ${position.y})`);

    if (!isLocalPlayer(id))
    {
      const player = playerManager.addPlayer(id, { x: position.x, y: position.y }, texture);
      if (player)
      {
        gameMap.addPlayer(player);
      }
    }
  }
}

function isLocalPlayer(id: number): boolean {
  return id === localUser.id;
}

export async function runConnectionManager(gameMap: GameMap) {

  // We initialize the local player by grabbing data from the window.__INITIAL_STATE__ which is set when the user logs in.
  // When succesfully initialized, we notice other players that there's a new connection.
  const texture = Texture.from('player_bunny');
  const player = initializeLocalPlayer(localUser.player, gameMap, texture);
  if (player) {
    sendToServer({ type: "newConnection", id: localUser.id, username: localUser.username, avatar: localUser.avatar, position: player.getPosition() });
  }

  socket.onmessage = (message) => {
    const data = JSON.parse(message.data);
    console.warn(message.data);

    // When a new player joins, we add it to the playerManager and gameMap
    if (data.type === "newPlayer" && !isLocalPlayer(data.id)) {
      const player = playerManager.addPlayer(data.id, data.position, texture);
      if (player) {
        gameMap.addPlayer(player);
      }
    }

    // When a player disconnects, we remove it from the gameMap, playerManager
    if (data.type == "disconnectPlayer" && !isLocalPlayer(data.id)) {
      const mapContainer = gameMap.getContainer();
      const player = playerManager.getPlayer(data.id);
      if (player) {
        mapContainer.removeChild(player.getContext());
      }
      playerManager.removePlayer(data.id);
    }

    // We initialize all other connected players
    if (data.type == "initializePlayers") {
      initializePlayers(data.players, gameMap, texture);
    }

    // We update the player position
    if (data.type == "move" && !isLocalPlayer(data.id)) {
      const player = playerManager.getPlayer(data.id);
      player?.updatePosition(data.position);
    }

  };

  // We notify the server when a player suddenly quits the browser
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

  socket.onerror = (message) => {
    console.log("Websocket error: ", message);
  };

}

