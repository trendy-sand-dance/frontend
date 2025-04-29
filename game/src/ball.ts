import { Graphics } from "pixi.js";
import Point from './point.js';
// import * as settings from './settings.js';

export default class Ball {
  public position: Point;
  private graphics: Graphics;
  private direction: Vector2;
  private speed: number;

  constructor(position: Vector2) {
    this.graphics = new Graphics();
    this.position = new Point(position.x, position.y);
    this.speed = 0.05;
    this.direction = { x: (Math.random() * 2) - 1, y: (Math.random() * 2) - 1 };
    this.graphics.circle(0, 0, 3.5).fill(0xffffff);
    this.graphics.zIndex = 100;
  }

  move(deltaTime: number) {
    let currentPos: Vector2 = this.position.asCartesian;
    let newPos: Vector2 = { x: currentPos.x + this.direction.x * this.speed * deltaTime, y: currentPos.y + this.direction.y * this.speed * deltaTime }

    this.position = new Point(newPos.x, newPos.y);
    this.graphics.x = this.position.asIsometric.x;
    this.graphics.y = this.position.asIsometric.y;
  }

  bounceX() {
    this.direction.x = -this.direction.x;
  }

  bounceY() {
    this.direction.y = -this.direction.y;
  }

  getContext() {
    return this.graphics;
  }

  getPoint() {
    return this.position;
  }

}
