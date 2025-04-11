import { Sprite, Texture } from "pixi.js";
import { Vector2, Point } from './interfaces.js';
// import * as settings from './settings.js';

export default class Player {
  public id: number;
  public position: Point;

  private context: Sprite;
  constructor(id: number, position: Point, texture: Texture) {
    this.context = new Sprite(texture);
    this.context.anchor.set(-.75, .25); // This is scuffed

    this.position = position;
    this.id = id;
  }

  updatePosition(position: Vector2) {
    this.position = new Point(position.x, position.y);

    this.context.x = this.position.asIsometric.x;
    this.context.y = this.position.asIsometric.y;
  }

  getId() {
    return this.id;
  }

  getPosition() {
    return this.position.asCartesian;
  }

  getContext() {
    return this.context;
  }
}
