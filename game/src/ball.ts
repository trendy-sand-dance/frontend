import { Graphics } from "pixi.js";
import Point from './point.js';
// import * as settings from './settings.js';

export default class Ball {
  public position: Point;
  private context: Graphics;
  private direction: Vector2;
  private speed: number;

  constructor(position: Vector2) {
    this.context = new Graphics();
    this.position = new Point(position.x, position.y);
    this.speed = 0.05;
    this.direction = { x: (Math.random() * 2) - 1, y: (Math.random() * 2) - 1 };
    this.context.circle(0, 0, 3.5).fill(0xffffff);
    this.context.zIndex = 100;
  }

  // move(deltaTime: number, tileMap: number[][]) {
  //   let currentPos: Vector2 = this.position.asCartesian;
  //   let newPos: Vector2 = { x: currentPos.x + this.direction.x * this.speed * deltaTime, y: currentPos.y + this.direction.y * this.speed * deltaTime }
  //
  //   // check if newPosition.x collides with wall
  //   if (tileMap[Math.round(currentPos.y)][Math.round(newPos.x)] != 1) {
  //     this.direction.x = -this.direction.x;
  //     newPos.x = currentPos.x;
  //   }
  //   // check if newPosition.y collides with wall
  //   if (tileMap[Math.round(newPos.y)][Math.round(currentPos.x)] != 1) {
  //     this.direction.y = -this.direction.y;
  //     newPos.y = currentPos.y
  //   }
  //
  //   this.position = new Point(newPos.x, newPos.y);
  //   this.context.x = this.position.asIsometric.x;
  //   this.context.y = this.position.asIsometric.y;
  // }

  move(deltaTime: number) {
    let currentPos: Vector2 = this.position.asCartesian;
    let newPos: Vector2 = { x: currentPos.x + this.direction.x * this.speed * deltaTime, y: currentPos.y + this.direction.y * this.speed * deltaTime }

    this.position = new Point(newPos.x, newPos.y);
    this.context.x = this.position.asIsometric.x;
    this.context.y = this.position.asIsometric.y;
  }

  bounceX() {
    this.direction.x = -this.direction.x;
  }

  bounceY() {
    this.direction.y = -this.direction.y;
  }

  getContext() {
    return this.context;
  }

  getPoint() {
    return this.position;
  }

}
