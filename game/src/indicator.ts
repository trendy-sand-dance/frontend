import InfoBox from './infobox.js';
import * as settings from './settings.js';
import { PongState } from './interfaces.js';

export default class PongInfo {

  private box: InfoBox;
  // private size: number;
  // private position: Vector2;
  // private state: PongState;

  constructor(size: number, x: number, y: number) {
    this.box = new InfoBox("", size, x, y);
    // this.size = size;
    // this.position = { x, y };
    // this.state = PongState.Waiting;
  }

  displayPongState(state: PongState, username: string | null, score: number | null) {

    switch (state) {

      case PongState.Waiting:
        this.box.setText("Waiting for player", settings.CGA_PINK);
        break;
      case PongState.PlayerNearby:
        this.box.setText("Press 'E'", settings.CGA_CYAN);
        break;
      case PongState.PlayerReady:
        if (username) {
          this.box.setText(`${username} is ready!`, settings.CGA_CYAN);
        }
        break;
      case PongState.InProgress:
        if (username !== null && score !== null)
          this.box.setText(`${username} Score: ${score}`, settings.CGA_PINK);
        break;
      default:
        break;

    }

  }

  getContainer() {

    return this.box.getContainer();

  }

}
