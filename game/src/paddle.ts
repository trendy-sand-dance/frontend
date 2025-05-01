import { Graphics } from 'pixi.js';
import Point from './point.js';

export default class Paddle {
  public position : Point;
  private graphics: Graphics;
  private paddleHeight : number;
  private paddleSpeed : number;

  constructor(position: Vector2, paddleHeight : number, paddleSpeed : number) {
    this.position = new Point(position.x, position.y);
    this.paddleHeight = paddleHeight;
    this.paddleSpeed = paddleSpeed;

    let pBegin = new Point(position.x, position.y - paddleHeight / 2);
    let pEnd = new Point(position.x, position.y + paddleHeight / 2);

    this.graphics = new Graphics()
      .moveTo(pBegin.asIsometric.x, pBegin.asIsometric.y)
      .lineTo(pEnd.asIsometric.x, pEnd.asIsometric.y)
      .stroke(0xffffff);
  }

  move(direction : number, deltaTime : number) {
    let currentPos = this.position.asCartesian;
    let newPos =  {x: currentPos.x, y: currentPos.y};

    newPos.y += this.paddleSpeed * direction * deltaTime;

    this.position.update(newPos);
    this.graphics.x = this.position.asIsometric.x;
    this.graphics.y = this.position.asIsometric.y;
  }

  getPaddleHeight() {
    return this.paddleHeight;
  }

  getPoint() {
    return this.position;
  }

  getGraphics() {
    return this.graphics;
  }

}
