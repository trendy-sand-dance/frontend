import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import * as settings from '../settings.js';

export default class TextBox {

  public container: Container;
  public graphics: Graphics;
  public position: Vector2;
  public text: Text;
  private textSize: number;
  private height: number;
  private width: number;

  private backgroundColor: string = settings.CGA_BLACK;
  private strokeColor: string = settings.CGA_PINK;
  private textColor: string = settings.CGA_PINK;

  constructor(text: string, textSize: number, x: number, y: number) {
    this.container = new Container();
    this.textSize = textSize;
    const style = new TextStyle({
      fill: this.textColor,
      fontSize: this.textSize,
    });
    this.text = new Text({ text: text, style: style });
    this.height = this.textSize * 2;
    this.width = this.text.width + this.textSize;
    this.position = { x, y };
    this.text.x = x + this.textSize / 2;
    this.text.y = y + this.textSize / 2;

    this.graphics = new Graphics().roundRect(x, y, this.width, this.height, 5).fill(this.backgroundColor).stroke(this.strokeColor);
    this.container.addChild(this.graphics);
    this.container.addChild(this.text);
  }

  update() {

    this.width = this.text.width + this.textSize;
    this.text.style.fill = this.textColor;
    this.graphics.clear();
    this.graphics.roundRect(this.position.x, this.position.y, this.width, this.height, 5).fill(this.backgroundColor).stroke(this.strokeColor);

  }

  destroy() {

    if (this.container.parent) {
      this.container.parent.removeChild(this.container);
    }
    this.container.destroy();


  }

  setPosition(x: number, y: number) {

    this.container.x = x;
    this.container.y = y;

  }

  setText(text: string) {

    this.text.text = text;

  }

  // Colors
  setBackgroundColor(color: string) {

    this.backgroundColor = color;

  }

  setTextColor(color: string) {

    this.textColor = color;

  }

  setStrokeColor(color: string) {

    this.strokeColor = color;

  }

  getContainer(): Container {

    return this.container;

  }

  getGraphics(): Graphics {

    return this.graphics;

  }

}
