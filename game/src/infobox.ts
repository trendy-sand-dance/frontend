import { Container, Graphics, Text, TextStyle } from 'pixi.js';

export default class InfoBox {
  public container : Container;
  public graphics : Graphics;
  public text : Text;

  constructor(text : string, textSize : number, x: number, y :number) {
    this.container = new Container();
    const style = new TextStyle({
        fill: '#000000',
        fontSize: textSize,
    })
    this.text = new Text({text: text, style: style});
    this.text.x = x;
    this.text.y = y;

    this.graphics = new Graphics().roundRect(x, y, this.text.width, textSize * 2, 20).fill(0xffffff);
    this.container.addChild(this.graphics);
    this.container.addChild(this.text);
    // this.graphics.addChild(this.text);
  }

  setPosition(x: number, y: number) {
    this.container.x = x;
    this.container.y = y;
  }

  setColor(color : number) {
    let x = this.graphics.x;
    let y = this.graphics.y;

    this.graphics.clear();
    this.graphics.roundRect(x, y, this.text.width, 24, 20).fill(color);
  }

  setText(text : string) {
    this.text.text = text;
  }

  getContainer() : Container {
    return this.container;
  }

  getGraphics() : Graphics {
    return this.graphics;
  }

}
