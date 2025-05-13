import * as settings from './settings.js';

export default class Point {
  public asCartesian: Vector2;
  public asIsometric: Vector2;

  constructor(x: number, y: number) {
    this.asCartesian = { x, y };
    this.asIsometric = { x: (x * settings.TILESIZE - y * settings.TILESIZE), y: (x * settings.TILESIZE / 2 + y * settings.TILESIZE / 2) };
  }

  update(position: Vector2) {
    this.asCartesian = position;
    this.asIsometric = { x: (position.x * settings.TILESIZE - position.y * settings.TILESIZE), y: (position.x * settings.TILESIZE / 2 + position.y * settings.TILESIZE / 2) };
  }

  add(offset: Vector2) {
    // this.asCartesian = { x: this.asCartesian.x + offset.x, y: this.asCartesian.y + offset.y };
    this.asIsometric = { x: this.asIsometric.x + offset.x, y: this.asIsometric.y + offset.y };
  }
}
