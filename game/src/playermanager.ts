import Player from './player.js';
import { mouse } from './input.js';
import { Texture, ColorMatrixFilter } from "pixi.js";
import Point from './point.js';
import('htmx.org');

// interface PongGame { 
//   table: number,
//   started: boolean,
//   ball: Vector2,
//   startTimer: number,
//   playerOne: {
//     id: number,
//     paddleY: number,
//     ready: boolean,
//   },
//   playerTwo: {
//     id: number,
//     paddleY: number,
//     ready: boolean,
//   },
// }

const playerInfoBox = document.getElementById("pixi-player-info");

class PlayerManager {
  static #instance: PlayerManager;

  public players = new Map<number, Player>;
  public pongGame: PongGame;
  public localPlayer: Player | null = null;

  private constructor() {
    this.pongGame = {table: 1, started: false, ball: {x: 0, y: 0}, startTimer: 5, playerOne: undefined, playerTwo: undefined};
  }

  public static get instance(): PlayerManager {
    if (!PlayerManager.#instance) {
      PlayerManager.#instance = new PlayerManager();
    }

    return PlayerManager.#instance;
  }

  // Pong Thingies
  assignPongPlayer(playerNumber: number, id : number) {
    if (playerNumber === 1)
      this.pongGame.playerOne = {id: id, paddleY: 0, ready: true};
    else if (playerNumber === 2)
      this.pongGame.playerTwo = {id: id, paddleY: 0, ready: true};
  }

  isPlayerReady(playerNumber: number) {
    if (this.pongGame.playerOne && playerNumber === 1)
      return this.pongGame.playerOne.ready;
    if (this.pongGame.playerTwo && playerNumber === 2)
      return this.pongGame.playerTwo.ready;
  }

  isLocalPlayerInitialized(): boolean {
    if (this.localPlayer) {
      return true;
    }
    return false;
  }
  // Pong Thingies end

  initLocalPlayer(id: number, position: Vector2, texture: Texture) {
    this.localPlayer = new Player(id, new Point(position.x, position.y), texture);
    return this.localPlayer;
  }

  addPlayer(id: number, position: Vector2, texture: Texture) {
    const player = new Player(id, new Point(position.x, position.y), texture);
    const playerSprite = player.getContext();
    const filter = new ColorMatrixFilter();

    playerSprite.interactive = true;
    playerSprite.on('pointerover', () => {
      console.log(`Player: ${id}`);
      playerSprite.blendMode = 'color-dodge';
      const { matrix } = filter;
      matrix[1] = 1.0;
      matrix[2] = 1.0;
      matrix[3] = 1.0;
      playerSprite.filters = [filter];
    });

    playerSprite.on('pointerleave', () => {
      playerSprite.filters = [];
    });


    playerSprite.on('pointerdown', async () => {
      // Trigger HTMX request
      if (playerInfoBox) {

        playerInfoBox.style.display = "block";
        playerInfoBox.style.top = `${mouse.y + 10}px`;
        playerInfoBox.style.left = `${mouse.x + 10}px`;

        try {
          console.log("OKKKK, FETCHINGGG");
          const response = await fetch(`/game/playerinfo/${id}`);
          const data = await response.json(); // Username, avatar(filename)

          console.log("OKKKK, DONE: ", data);
          const infoUsername = document.getElementById("infoUsername");
          const infoAvatar = document.getElementById("infoAvatar");
          if (infoUsername)
            infoUsername.textContent = `${data.username}`;
          if (infoAvatar)
            infoAvatar.outerHTML = `<img src="/images/avatars/${data.avatar}" class="w-12 h-12 rounded-full" />`;

          // Set up friend request button
          const friendReqBtn = document.getElementById("friendRequestBtn");
          if (friendReqBtn)
          {
            friendReqBtn.setAttribute("hx-post", `sendReq/${id}/${window.__INITIAL_STATE__.id}`);
            friendReqBtn.setAttribute("hx-target", "#friendRequestBtn");
            friendReqBtn.setAttribute("hx-swap", "outerHTML");
            friendReqBtn.setAttribute("hx-target-error", "#friendRequestBtn");

            window.htmx.process(document.body);
          }

        } catch (err) {
          console.error("Failed to fetch player info", err);
        }
      }
    });

    // playerSprite.eventMode = 'dynamic';
    this.players.set(id, player);
    return this.players.get(id);
  }

  getLocalPlayer() {
    if (this.localPlayer) {
      return this.localPlayer;
    }
  }

  getPlayer(id: number) {
    return this.players.get(id);
  }

  getPlayers() {
    return this.players;
  }

  updatePlayer(id: number, newPosition: Vector2) {
    const player = this.players.get(id);
    if (player) {
      player.updatePosition(newPosition);
    }
  }

  removePlayer(id: number) {
    this.players.delete(id);
  }

}

let playerManager = PlayerManager.instance;

export { playerManager };
