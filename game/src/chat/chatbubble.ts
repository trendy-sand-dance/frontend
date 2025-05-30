import TextBox from '../ui/textbox';
import Player from '../player';
import { Ticker } from "pixi.js";

export default class ChatBubble extends TextBox {

  private lifetimeExceeded : boolean = false;

  public constructor(player : Player, text : string, size : number) {
    super(`${player.getUsername()}: ${text}`, size, player.getIsometricPosition().x, player.getIsometricPosition().y - 25);
    this.setTextColor('#000000');
    this.setBackgroundColor('#ffffff');
    this.setStrokeColor('#000000');
    this.update();
  }

  public float(time : Ticker) {
    this.container.y -= time.deltaTime * 0.25;
    this.container.alpha -= time.deltaTime * 0.001;
    if (this.container.alpha <= 0) {
      this.lifetimeExceeded = true;
    }
  }

  public dead() : boolean {

    return this.lifetimeExceeded;

  }
  

}
