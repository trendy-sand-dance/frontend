import { ColorMatrixFilter } from "pixi.js";
import Player from './player.js';
import Invitation from '../ui/invitation.js';
import { mouse } from '../input/input.js';
import { gameSocket } from "../gameserver/gameconnectionmanager.js";
import PongTable from '../pong/pongtable.js';
import { MessageType } from "../interfaces.js";
import('htmx.org');

const playerInfoBox = document.getElementById("pixi-player-info");

export default class PlayerManager {
  static #instance: PlayerManager;

  public players = new Map<number, Player>;
  public localPlayer: Player | null = null;
  public pongTable: PongTable | null = null;
  public tournamentTable: PongTable | null = null;
  public invites: Invitation[] = [];

  private constructor() {

  }

  public static get instance(): PlayerManager {
    if (!PlayerManager.#instance) {
      PlayerManager.#instance = new PlayerManager();
    }

    return PlayerManager.#instance;
  }

  public addInvite(inviteMessage: GameInviteMessage): Invitation | undefined {

    const player = this.getPlayer(inviteMessage.fromId);
    if (player) {
      const invite = new Invitation(player, this.invites.length);
      this.invites.push(invite);
      return invite;
    }

  }

  public removeInvite(invite: Invitation): void {

    const index = this.invites.indexOf(invite);
    this.invites.splice(index, 1);

  }

  public getInvites(): Invitation[] {

    return this.invites;

  }

  isLocalPlayerInitialized(): boolean {
    if (this.localPlayer) {
      return true;
    }
    return false;
  }

  initLocalPlayer(id: number, username: string, avatar: string, position: Vector2) {
    this.localPlayer = new Player(id, username, avatar, position);
    return this.localPlayer;
  }

  initPongTable(table: PongTable) {
    this.pongTable = table;
  }

  initTournamentTable(table: PongTable) {
    this.tournamentTable = table;
  }

  addPlayer(id: number, username: string, avatar: string, position: Vector2) {
    const player = new Player(id, username, avatar, position);
    const playerSprite = player.getContext();
    const filter = new ColorMatrixFilter();

    playerSprite.interactive = true;
    playerSprite.on('pointerover', () => {
      // console.log(`Player: ${id}`);
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

          // console.log("friendStatus", friendStatus);

          if (infoUsername)
            infoUsername.textContent = `${user.username}`;
          if (infoAvatar) {
            if (user.avatar.includes('https://lh3.googleusercontent.com')) {
              infoAvatar.outerHTML = `<img id="infoAvatar" src="${user.avatar}" class="w-12 h-12 rounded-full" />`;
            }
            else {
              infoAvatar.outerHTML = `<img id="infoAvatar" src="/images/avatars/${user.avatar}" class="w-12 h-12 rounded-full" />`;
            }
          }

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
              btn.setAttribute("class", "bg-[--color-secondary] text-[--color-text] hover:bg-[--color-accent] rounded-md p-2");
              btn.setAttribute("hx-post", `sendReq/${id}/${window.__USER_ID__}`);
              btn.innerHTML = "Send friend request";
              friendReq.appendChild(btn);
            }
            else if (isBtnThere) {
              isBtnThere.innerHTML = "Send friend request";
            }

            // Game Invite btn
            const gameInviteBtn = document.getElementById('gameInviteBtn');
			      const localPlayer = this.getLocalPlayer();

            if (gameInviteBtn && localPlayer) {
				
              gameInviteBtn.onclick = () => {
                const inviteMessage: GameInviteMessage = { type: MessageType.GameInvite, fromId: localPlayer.getId(), toId: user.id };
                gameSocket.send(JSON.stringify(inviteMessage));
              }

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

  getUsernameById(id : number) : string {

	const player = this.players.get(id);
	if (player) {
		return player.getUsername();
	}

	return "";
	
  }

  getId(username : string) : number {

	for (const [id, player] of this.players) {
		
		if (player.getUsername() === username) {
			console.log(id);
			return player.getId();
		}

	}

	return -1;

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
