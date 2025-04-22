import Player from './player.js';
import { mouse } from './input.js';
import { Texture, ColorMatrixFilter } from "pixi.js";
import Point from './point.js';

const playerInfoBox = document.getElementById("pixi-player-info");

class PlayerManager {
  static #instance: PlayerManager;

  public players = new Map<number, Player>;
  public localPlayer: Player | null = null;

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

  initLocalPlayer(id: number, position: Vector2, texture: Texture) {
    this.localPlayer = new Player(id, new Point(position.x, position.y), texture);
    return this.localPlayer;
  }

  addPlayer(id: number, position: Vector2, texture: Texture) {
    const player = new Player(id, new Point(position.x, position.y), texture);
    const playerSprite = player.getContext();
    const filter = new ColorMatrixFilter();

    playerSprite.interactive = true;
    playerSprite.on('pointerover', () =>{
      console.log(`Player: ${id}`);
      playerSprite.blendMode = 'color-dodge';
      const { matrix } = filter;
      matrix[1] = 1.0;
      matrix[2] = 1.0;
      matrix[3] = 1.0;
      playerSprite.filters = [filter];
    });

    playerSprite.on('pointerleave', () =>{
      playerSprite.filters = [];
    });


    playerSprite.on('pointerdown', () => { 

    // <p id="infoPlayer">Player: </p>
    // <p id="infoUsername">Username: </p>
    // <p id="infoAvatar">Avatar: </p>
      const infoPlayer = document.getElementById("infoPlayer");
      if (infoPlayer)
      {
        infoPlayer.innerHTML = "Id: " + String(id);
      }
      if (playerInfoBox)
      {
        playerInfoBox.style.display = "block";
        playerInfoBox.style.top = mouse.y + "px";
        playerInfoBox.style.left = mouse.x + "px";
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
