import * as settings from './settings.js';

export interface Vector2 {
  x: number;
  y: number;
}

export class Point {
  public asCartesian: Vector2;
  public asIsometric: Vector2;

  constructor(x: number, y: number) {
    this.asCartesian = { x, y };
    this.asIsometric = { x: (x * settings.TILESIZE - y * settings.TILESIZE), y: (x * settings.TILESIZE / 2 + y * settings.TILESIZE / 2) };
  }
  add(offset: Vector2) {
    // this.asCartesian = { x: this.asCartesian.x + offset.x, y: this.asCartesian.y + offset.y };
    this.asIsometric = { x: this.asIsometric.x + offset.x, y: this.asIsometric.y + offset.y };
  }
}
