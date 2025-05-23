import Player from './player.js';
import { mouse } from './input.js';
import { Texture, ColorMatrixFilter } from "pixi.js";
import PongTable from './pongtable.js';
//import Point from './point.js';
import('htmx.org');

const playerInfoBox = document.getElementById("pixi-player-info");

class PlayerManager {
  static #instance: PlayerManager;

  public players = new Map<number, Player>;
  public localPlayer: Player | null = null;
  public pongTable: PongTable | null = null;
  public tournamentTable: PongTable | null = null;

  private constructor() {

  }

  public static get instance(): PlayerManager {
    if (!PlayerManager.#instance) {
      PlayerManager.#instance = new PlayerManager();
    }

    return PlayerManager.#instance;
  }

  isLocalPlayerInitialized(): boolean {
    if (this.localPlayer) {
      return true;
    }
    return false;
  }

  initLocalPlayer(id: number, username: string, avatar: string, position: Vector2, texture: Texture) {
    this.localPlayer = new Player(id, username, avatar, position, texture);
    return this.localPlayer;
  }

  initPongTable(table: PongTable) {
    this.pongTable = table;
  }

  initTournamentTable(table: PongTable) {
    this.tournamentTable = table;
  }

  addPlayer(id: number, username: string, avatar: string, position: Vector2, texture: Texture) {
    const player = new Player(id, username, avatar, position, texture);
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

          const response = await fetch(`/game/userinfo/${id}`);
          const responseFriends = await fetch(`/areFriends/${id}/${window.__USER_ID__}`);
          const friendStatus = await responseFriends.json();
          const { user } = await response.json() as { user: User };

          const infoUsername = document.getElementById("infoUsername");
          const infoAvatar = document.getElementById("infoAvatar");

          const stats = document.getElementById("winsAndLosses");
          const status = document.getElementById("status");
          const friends = document.getElementById("friends");

          if (stats && status && friends) {

            stats.textContent = `Wins: ${user.wins} | Losses: ${user.losses}`;
            if (user.status)
              status.textContent = `Online`;
            else
              status.textContent = `Offline`;

            if (friendStatus.status !== null) {
              friends.textContent = `Friends: ${friendStatus.status}`;
            }
            else {
              friends.textContent = ``;
            }

          }

          console.log("friendStatus", friendStatus);

          if (infoUsername)
            infoUsername.textContent = `${username}`;
          if (infoAvatar)
            infoAvatar.outerHTML = `<img src="/images/avatars/${avatar}" class="w-12 h-12 rounded-full" />`;

          // Set up friend request button
          // const friendReqBtn = document.getElementById("friendRequestBtn");
          const friendReq = document.getElementById("friendRequest");

          if (friendReq && friendStatus.friend == false) {
            friendReq.style.display = "block";
            // Friend Req Btn
            const isBtnThere = document.getElementById('friendReqBtn');
            if (!isBtnThere) {
              const btn = document.createElement('button');
              btn.setAttribute("id", "friendReqBtn");
              btn.setAttribute("type", "button");
              btn.setAttribute("class", "bg-[#FF55FE] text-white rounded-md p-2");
              btn.setAttribute("hx-post", `sendReq/${id}/${window.__USER_ID__}`);
              btn.innerHTML = "Send friend request";
              friendReq.appendChild(btn);
            }
            else if (isBtnThere) {
              isBtnThere.innerHTML = "Send friend request";
            }

            window.htmx.process(document.body);
          }
          else if (friendReq && friendStatus.friend) {
            friendReq.style.display = "none";
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

    if (this.localPlayer && id === this.localPlayer.id)
      return this.localPlayer;
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
