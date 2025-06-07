import { Ticker } from "pixi.js";
// import { pixiApp } from "../main";
import Player from "../player/player";
import TextBox from "./textbox";
import { lerpPosition, lerpNumber } from "../utility/lerp";

export default class Invitation extends TextBox {

  private mouseHoveredOn: boolean = false;
  private lifeTimeExceeded: boolean = false;
  private fadeSpeed: number = 0.05;
  private time: number = 0;
  private moveSpeed: number = 0.1;

  public constructor(player: Player, n: number) {

    super(`${player.getUsername()} wants to play a game!`, 20, 0, 0);
    this.setTextColor('#ffffff');
    this.setBackgroundColor('#000000');
    this.setStrokeColor('#ffffff');
    this.update();

    this.container.interactive = true;
    this.container.x = -100;
    this.container.y = n * this.container.height;
    this.container.on('pointerover', () => {
      this.mouseHoveredOn = true;
    });

  }

  private fade(time: Ticker): void {

    this.time += time.deltaTime * this.fadeSpeed;

    const alpha = lerpNumber(1, 0, this.time);
    this.container.alpha = alpha;
    if (this.container.alpha <= 0) {
      this.lifeTimeExceeded = true;
    }

  }

  private isRead(): boolean {

    return this.mouseHoveredOn;

  }

  public animate(time: Ticker) {

    if (this.container.x < 0) {

      const newPosition = lerpPosition(

        { x: this.container.x, y: this.container.y, },
        { x: 0, y: this.container.y },
        time.deltaTime * this.moveSpeed
      )

      this.container.position.set(newPosition.x, newPosition.y);
    }

    if (this.isRead()) {
      this.fade(time);
    }

  }

  public dead(): boolean {

    return this.lifeTimeExceeded;

  }

}
