import { Sprite, Texture } from "pixi.js";
import Point from './point.js';

export default class Player {
  public id: number;
  public position: Point;
  private username: string;
  private avatar: string;

  private context: Sprite;
  constructor(id: number, username: string, avatar: string, position: Vector2, texture: Texture) {
    this.id = id;
    this.position = new Point(position.x, position.y);
    this.username = username;
    this.avatar = avatar;

    // Sprite Context
    this.context = new Sprite(texture);
    this.context.anchor.set(0.75, 0);
    this.context.x = this.position.asIsometric.x;
    this.context.y = this.position.asIsometric.y;
  }

  updatePosition(position: Vector2) {
    this.position.update(position);
    this.context.x = this.position.asIsometric.x;
    this.context.y = this.position.asIsometric.y;
  }

  getId() {
    return this.id;
  }

  getAvatar() {
    return this.avatar;
  }

  getUsername() {
    return this.username;
  }

  getPoint() {
    return this.position;
  }

  getPosition() {
    return this.position.asCartesian;
  }

  getIsometricPosition() {
    return this.position.asIsometric;
  }

  getContext() {
    return this.context;
  }
}
