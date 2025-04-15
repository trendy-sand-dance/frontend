import Player from './player.js';
import { Texture } from "pixi.js";
import { Vector2, Point } from './interfaces.js';

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

  setLocalPlayer(id: number, position: Vector2, texture: Texture) {
    this.localPlayer = new Player(id, new Point(position.x, position.y), texture);
  }

  addPlayer(id: number, position: Vector2, texture: Texture) {
    const player = new Player(id, new Point(position.x, position.y), texture);
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
