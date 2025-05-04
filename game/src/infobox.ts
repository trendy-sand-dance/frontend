import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import * as settings from './settings.js';

export default class InfoBox {
  public container: Container;
  public graphics: Graphics;
  public position: Vector2;
  public text: Text;
  private textSize: number;
  private height: number;
  private width: number;

  constructor(text: string, textSize: number, x: number, y: number) {
    this.container = new Container();
    this.textSize = textSize;
    const style = new TextStyle({
      fill: settings.CGA_PINK,
      fontSize: this.textSize,
    })
    this.text = new Text({ text: text, style: style });
    this.height = this.textSize * 2;
    this.width = this.text.width + this.textSize;
    this.position = { x, y };
    this.text.x = x + this.textSize / 2;
    this.text.y = y + this.textSize / 2;

    this.graphics = new Graphics().roundRect(x, y, this.width, this.height, 5).fill(settings.CGA_BLACK).stroke(settings.CGA_PINK);
    this.container.addChild(this.graphics);
    this.container.addChild(this.text);
  }

  setPosition(x: number, y: number) {
    this.container.x = x;
    this.container.y = y;
  }

  setColor(color: string) {
    this.width = this.text.width + this.textSize;
    this.graphics.clear();
    this.graphics.roundRect(this.position.x, this.position.y, this.width, this.height, 5).fill(color).stroke(settings.CGA_PINK);
  }

  setText(text: string, color: string) {
    this.text.style.fill = color;
    this.text.text = text;
  }

  getContainer(): Container {
    return this.container;
  }

  getGraphics(): Graphics {
    return this.graphics;
  }

}
