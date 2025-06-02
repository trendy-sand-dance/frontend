import { Texture, Graphics, Sprite } from 'pixi.js';
import Point from '../point.js';

export default class Paddle {
  public position: Point;
  private graphics: Graphics;
  private sprite: Sprite;
  private paddleHeight: number;
  private paddleSpeed: number;

  constructor(position: Vector2, paddleHeight: number, paddleSpeed: number) {

    this.position = new Point(position.x, position.y);
    this.paddleHeight = paddleHeight;
    this.paddleSpeed = paddleSpeed;

    let pBegin = new Point(0, position.y - paddleHeight / 2);
    let pEnd = new Point(0, position.y + paddleHeight / 2);

    this.graphics = new Graphics()
      .moveTo(pBegin.asIsometric.x, pBegin.asIsometric.y)
      .lineTo(pEnd.asIsometric.x, pEnd.asIsometric.y)
      .stroke(0xffffff);

    const texture = Texture.from('floppy_paddle');
    this.sprite = new Sprite(texture);
    this.sprite.anchor.set(0.5);
    this.sprite.x = this.position.asIsometric.x;
    this.sprite.y = this.position.asIsometric.y;

    // this.graphics.x = this.position.asIsometric.x;
    // this.graphics.y = this.position.asIsometric.y;

  }

  move(direction: number, deltaTime: number) {
    let newPos = { x: this.position.asCartesian.x, y: this.position.asCartesian.y };

    newPos.y += this.paddleSpeed * direction * deltaTime;

    this.position.update(newPos);
    this.graphics.x = this.position.asIsometric.x;
    this.graphics.y = this.position.asIsometric.y;

    this.sprite.x = this.position.asIsometric.x;
    this.sprite.y = this.position.asIsometric.y;
  }

  update(paddleY: number) {
    this.position.update({ x: this.position.asCartesian.x, y: paddleY });
    this.graphics.x = this.position.asIsometric.x;
    this.graphics.y = this.position.asIsometric.y;

    this.sprite.x = this.position.asIsometric.x;
    this.sprite.y = this.position.asIsometric.y;
  }

  getPaddleHeight() {
    return this.paddleHeight;
  }

  getPoint() {
    return this.position;
  }

  getGraphics() {
    // return this.graphics;
    return this.sprite;
  }

}
