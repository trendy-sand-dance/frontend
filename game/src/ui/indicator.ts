import TextBox from './textbox.js';
import * as settings from '../settings.js';
import { PongState } from '../interfaces.js';

export default class PongInfo {

  private box: TextBox;
  private state: PongState;
  private score: number;
  private username: string;

  constructor(size: number, x: number, y: number) {
    this.box = new TextBox("", size, x, y);
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

  getState(): PongState {

    return this.state;

  }

  display() {

    switch (this.state) {

      case PongState.Waiting:
        this.box.setText("Waiting for player");
        this.box.setTextColor(settings.CGA_PINK);
        break;
      case PongState.PlayerNearby:
        this.box.setText("Press 'E'");
        this.box.setTextColor(settings.CGA_CYAN);
        break;
      case PongState.PlayerReady:
        this.box.setText(`${this.username} is ready!`);
        this.box.setTextColor(settings.CGA_CYAN);
        break;
      case PongState.InProgress:
        this.box.setText(`${this.username} Score: ${this.score}`);
        this.box.setTextColor(settings.CGA_PINK);
        break;
      case PongState.Enrolling:
        this.box.setText(`Waiting for tournament to fill up...`);
        this.box.setTextColor(settings.CGA_PINK);
        break;
      case PongState.Announcing:
        if (this.username === "") {
          this.box.setText(`Waiting for tournament to fill up...`);
          this.box.setTextColor(settings.CGA_PINK);
        }
        else {
          this.box.setText(`${this.username}, please ready up!`);
          this.box.setTextColor(settings.CGA_PINK);
        }
        break;
      default:
        break;
    }

    this.box.update();

  }

  getContainer() {

    return this.box.getContainer();

  }

}
