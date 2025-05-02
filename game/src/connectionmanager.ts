import { Texture } from "pixi.js";
import { playerManager } from './playermanager.js';
import GameMap from './gamemap.js';
// import Player from './player.js';

const localUser = window.__INITIAL_STATE__;
const gameserverUrl = window.__GAMESERVER_URL__;

// Init WebSocket
let socket: WebSocket;

if (window.__GAMESERVER_URL__)
  socket = new WebSocket(`ws://${gameserverUrl}:8003/ws-gameserver`);
else
  socket = new WebSocket(`ws://localhost:8003/ws-gameserver`);

export function sendToServer(data: ServerMessage) {
  if (socket.readyState == WebSocket.OPEN) {
    socket.send(JSON.stringify(data));
  }
}

export function initializeLocalPlayer(localPlayerData: PlayerData, gameMap: GameMap, texture: Texture) {

  let spawnPosition: Vector2;

  if (localPlayerData.x === 0 && localPlayerData.y === 0) {
    spawnPosition = { x: 36, y: 20 }; // Inits player at entrance
  } else {
    spawnPosition = { x: localPlayerData.x, y: localPlayerData.y };
  }

  const player = playerManager.initLocalPlayer(localPlayerData.id, localUser.username, localUser.avatar, spawnPosition, texture);

  if (player) {
    gameMap.addPlayer(player);
    return player;
  }
}

function initializePlayers(players: Map<number, ServerPlayer>, gameMap: GameMap, texture: Texture) {
  for (const [id, player] of players) {

    console.log(`Player ${id} is at (${player.x}, ${player.y})`);

    if (!isLocalPlayer(id)) {
      const newPlayer = playerManager.addPlayer(id, player.username, player.avatar, { x: player.x, y: player.y }, texture);
      if (newPlayer) {
        gameMap.addPlayer(newPlayer);
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
    sendToServer({ type: "new_connection", id: localUser.id, username: localUser.username, avatar: localUser.avatar, position: player.getPosition() });
  }

  socket.onmessage = (message) => {
    const data = JSON.parse(message.data);
    // console.warn(message.data);

    // PLAYER POSITION SHENANIGANS

    // When a new player joins, we add it to the playerManager and gameMap
    if (data.type === "new_player" && !isLocalPlayer(data.id)) {
      const player = playerManager.addPlayer(data.id, data.username, data.avatar, data.position, texture);
      if (player) {
        gameMap.addPlayer(player);
      }
    }

    // We initialize all other connected players
    if (data.type == "initialize_players") {
      initializePlayers(data.players, gameMap, texture);
    }

    // When a player disconnects, we remove it from the gameMap, playerManager
    if (data.type == "disconnect_player" && !isLocalPlayer(data.id)) {
      const mapContainer = gameMap.getContainer();
      const player = playerManager.getPlayer(data.id);
      if (player) {
        mapContainer.removeChild(player.getContext());
      }
      playerManager.removePlayer(data.id);
    }


    // We update the player position
    if (data.type == "player_move" && !isLocalPlayer(data.id)) {
      const player = playerManager.getPlayer(data.id);
      player?.updatePosition(data.position);
    }


    // PONG SHENANIGANS
    if (data.type == "confirm_pong_player" && isLocalPlayer(data.pongPlayer.id)) {
      const player = playerManager.getLocalPlayer();
      const pongTable = playerManager.pongTable;
      if (pongTable && player) {
        console.log(data.pongPlayer.side)
        pongTable.setPlayerReady(player, data.pongPlayer.side);
      }
    }

    if (data.type == "player_joined_pong" && !isLocalPlayer(data.pongPlayer.id)) {
      const player = playerManager.getPlayer(data.pongPlayer.id);
      const pongTable = playerManager.pongTable;
      if (pongTable && player) {
        console.log(data.pongPlayer.side)
        pongTable.setPlayerReady(player, data.pongPlayer.side);
      }
    }

    if (data.type == "leave_pong") {
      console.log("leave_pong back!!!!");
      const pongTable = playerManager.pongTable;
      pongTable?.removePlayer(data.pongPlayer.side);
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

