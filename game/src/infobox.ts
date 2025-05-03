import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import * as settings from './settings.js';

export default class InfoBox {
  public container: Container;
  public graphics: Graphics;
  public position: Vector2;
  public text: Text;
  private textSize: number;

  constructor(text: string, textSize: number, x: number, y: number) {
    this.container = new Container();
    const style = new TextStyle({
      fill: settings.CGA_PINK,
      fontSize: textSize,
    })
    this.position = { x, y };
    this.text = new Text({ text: text, style: style });
    this.text.x = x;
    this.text.y = y;
    this.textSize = textSize;

    this.graphics = new Graphics().roundRect(x, y, this.text.width, textSize * 2, textSize * 2).fill(settings.CGA_BLACK);
    this.container.addChild(this.graphics);
    this.container.addChild(this.text);
  }

  setPosition(x: number, y: number) {
    this.container.x = x;
    this.container.y = y;
  }

  setColor(color: string) {
    this.graphics.clear();
    this.graphics.roundRect(this.position.x, this.position.y, this.text.width, this.textSize * 2, this.textSize * 2).fill(color);
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
