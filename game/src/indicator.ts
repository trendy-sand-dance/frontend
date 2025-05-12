import InfoBox from './infobox.js';
import * as settings from './settings.js';
import { PongState } from './interfaces.js';

export default class PongInfo {

  private box: InfoBox;
  private state: PongState;
  private score: number;
  private username: string;

  constructor(size: number, x: number, y: number) {
    this.box = new InfoBox("", size, x, y);
    this.score = 0;
    this.username = "";
    this.state = PongState.Waiting;
  }

  setPongPlayer(pongPlayer: PongPlayer) {

    if (pongPlayer) {
      this.score = pongPlayer.score;
      this.username = pongPlayer.username;
    }

  }

  setScore(score: number) {

    this.score = score;

  }

  setState(state: PongState) {

    if (state === PongState.Waiting) {
      this.score = 0;
      this.username = "";
    }

    this.state = state;

  }

  display() {

    switch (this.state) {

      case PongState.Waiting:
        this.box.setText("Waiting for player", settings.CGA_PINK);
        break;
      case PongState.PlayerNearby:
        this.box.setText("Press 'E'", settings.CGA_CYAN);
        break;
      case PongState.PlayerReady:
        this.box.setText(`${this.username} is ready!`, settings.CGA_CYAN);
        break;
      case PongState.InProgress:
        this.box.setText(`${this.username} Score: ${this.score}`, settings.CGA_PINK);
        break;
      default:
        break;
    }

  }

  getContainer() {

    return this.box.getContainer();

  }

}
