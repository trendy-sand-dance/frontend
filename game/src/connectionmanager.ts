import { Texture } from "pixi.js";
import { playerManager } from './playermanager.js';
import GameMap from './gamemap.js';


function initializeWebsocket(gameserverURL: string): WebSocket {

  if (gameserverURL) {
    console.log("Succesfully connected with the gameserver");
    return new WebSocket(`ws://${gameserverURL}:8003/ws-gameserver`);
  }
  else {
    console.warn("GameserverURL not defined... this may cause issues with the websocket connection");
    return new WebSocket(`ws://localhost:8003/ws-gameserver`);
  }

}

export function sendToServer(data: ServerMessage) {
  if (socket.readyState == WebSocket.OPEN) {
    socket.send(JSON.stringify(data));
  }
}

async function getUserInfo(id: number): Promise<User> {
  try {
    const response = await fetch(`/game/userinfo/${id}`);
    const { user } = await response.json() as { user: User };
    return user;
  }
  catch (error) {
    console.log("We don't got the user :(");
    return { id: 420, username: "testUser", password: "", email: "", avatar: "", status: false, wins: 0, losses: 0, player: { id: 420, userId: 420, x: 0, y: 0 } };

  }
}

export function initializeLocalPlayer(localUser: User, gameMap: GameMap, texture: Texture) {

  let pos: Vector2 = { x: localUser.player.x, y: localUser.player.y };

  if (pos.x === 0 && pos.y === 0) {
    pos = { x: 36, y: 20 };
  }

  const player = playerManager.initLocalPlayer(localUser.id, localUser.username, localUser.avatar, pos, texture);

  if (player) {
    gameMap.addPlayer(player);
    return player;
  }

}

export let socket: WebSocket = initializeWebsocket(window.__GAMESERVER_URL__);

function initializePlayers(players: Map<number, ServerPlayer>, gameMap: GameMap, texture: Texture) {
  for (const [id, player] of players) {

    console.log(`Player ${id} is at (${player.x}, ${player.y})`);

    if (!isLocalPlayer(id)) {
      console.log("Adding player: ", id, player);
      const newPlayer = playerManager.addPlayer(id, player.username, player.avatar, { x: player.x, y: player.y }, texture);
      if (newPlayer) {
        gameMap.addPlayer(newPlayer);
      }
    }
  }

}

function isLocalPlayer(id: number): boolean {
  return id == window.__USER_ID__;
}

export async function runConnectionManager(gameMap: GameMap) {

  // We initialize the local player by grabbing data from the window.__INITIAL_STATE__ which is set when the user logs in.
  // When succesfully initialized, we notice other players that there's a new connection.
  const localUser: User = await getUserInfo(window.__USER_ID__);
  const texture = Texture.from('player_bunny');
  const player = initializeLocalPlayer(localUser, gameMap, texture);
  if (player) {
    sendToServer({ type: "new_connection", id: localUser.id, username: localUser.username, avatar: localUser.avatar, position: player.getPosition() });
  }

  socket.onmessage = (message) => {
    const data = JSON.parse(message.data);
    // console.warn(message.data);

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

    // We initialize all pong players that are currently playing or are waiting for another player
    if (data.type == "initialize_pong") {
      const pongTable = playerManager.pongTable;
      if (pongTable) {
        const pongPlayer = data.left as PongPlayer || data.right as PongPlayer;
        console.log("pongPlayer: ", pongPlayer);
        const player = playerManager.getPlayer(pongPlayer.id);
        console.log("player: ", player);
        if (pongPlayer && player) {
          const side = pongPlayer.side as 'left' | 'right';
          pongTable.setPlayerReady(player, side);
        }

      }

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
      const pongTable = playerManager.pongTable;
      if (pongTable) {
        pongTable.removePlayer(data.pongPlayer.side);
      }
    }

    if (data.type == "countdown_pong") {
      // console.log("seconds: ", data.timer);
      const pongTable = playerManager.pongTable;
      if (pongTable) {
        pongTable.setCountdownTimer(Number(data.timer));
      }
    }

    if (data.type == "start_pong_game") {
      // alert("Start!");
      const pongTable = playerManager.pongTable;
      if (pongTable) {
        pongTable.startGame();
      }
    }

    if (data.type == "pong_update") {
      const pongTable = playerManager.pongTable;
      if (pongTable) {
        pongTable.updatePaddle('left', data.pongState.paddles.left);
        pongTable.updatePaddle('right', data.pongState.paddles.right);
      }
    }

    if (data.type == "player_disconnected_pong") {

      const pongTable = playerManager.pongTable;
      if (pongTable) {
        pongTable.stopGame();
      }
    }

    if (data.type == "score_update") {
      const pongTable = playerManager.pongTable;
      if (pongTable) {
        console.log("Data: ", data);
        if (data.side == 'left')
          pongTable.updateScore('right', data.score);
        if (data.side == 'right')
          pongTable.updateScore('left', data.score);
      }
    }

    if (data.type == "ball_move") {
      const pongTable = playerManager.pongTable;
      if (pongTable) {
        let ballPos: Vector2 = { x: data.ball.x, y: data.ball.y };
        pongTable.updateBall(ballPos);
      }
    }

    if (data.type == "finish_game") {

      const pongTable = playerManager.pongTable;
      if (pongTable) {
        pongTable.finishGame(data.winnerId);
      }

    }

    // Tournament
    if (data.type == "announce_match") {
      console.log(`(left) ${data.players.left.username} is playing against (right) ${data.players.right.username}. Time left to ready up: ${data.seconds}`)
      const tournamentTable = playerManager.tournamentTable;
      if (tournamentTable) {
        const pl = playerManager.getPlayer(data.players.left.id);
        const pr = playerManager.getPlayer(data.players.right.id);
        if (pl && pr) {
          tournamentTable.setExpectedTournamentPlayers(pl, pr);
        }
      }

    }

    if (data.type == "confirm_pong_player_tournament" && isLocalPlayer(data.pongPlayer.id)) {
      const player = playerManager.getLocalPlayer();
      const tournamentTable = playerManager.tournamentTable;
      if (tournamentTable && player) {
        console.log(data.pongPlayer.side)
        tournamentTable.setPlayerReady(player, data.pongPlayer.side);
      }
    }

    if (data.type == "player_joined_pong_tournament" && !isLocalPlayer(data.pongPlayer.id)) {
      const player = playerManager.getPlayer(data.pongPlayer.id);
      const tournamentTable = playerManager.tournamentTable;
      if (tournamentTable && player) {
        console.log(data.pongPlayer.side)
        tournamentTable.setPlayerReady(player, data.pongPlayer.side);
      }
    }

    if (data.type == "leave_pong_tournament") {
      const tournamentTable = playerManager.tournamentTable;
      if (tournamentTable) {
        tournamentTable.removePlayer(data.pongPlayer.side);
      }
    }

    if (data.type == "countdown_pong_tournament") {
      console.log("seconds: ", data.timer);
      const tournamentTable = playerManager.tournamentTable;
      if (tournamentTable) {
        tournamentTable.setCountdownTimer(Number(data.timer));
      }
    }

    if (data.type == "ball_move_tournament") {
      const tournamentTable = playerManager.tournamentTable;
      if (tournamentTable) {
        let ballPos: Vector2 = { x: data.ball.x, y: data.ball.y };
        tournamentTable.updateBall(ballPos);
      }
    }

    if (data.type == "pong_update_tournament") {
      const tournamentTable = playerManager.tournamentTable;
      if (tournamentTable) {
        tournamentTable.updatePaddle('left', data.pongState.paddles.left);
        tournamentTable.updatePaddle('right', data.pongState.paddles.right);
      }
    }

    if (data.type == "score_update_tournament") {
      const tournamentTable = playerManager.tournamentTable;
      if (tournamentTable) {
        console.log("Data: ", data);
        if (data.side == 'left')
          tournamentTable.updateScore('right', data.score);
        if (data.side == 'right')
          tournamentTable.updateScore('left', data.score);
      }
    }

    if (data.type == "finish_game_tournament") {

      const tournamentTable = playerManager.tournamentTable;
      if (tournamentTable) {
        tournamentTable.finishGame(data.winnerId);
      }

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

