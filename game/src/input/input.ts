import * as settings from "../settings.js";
import Player from "../player/player.js";
import Point from '../utility/point.js';
import { CameraMode } from '../interfaces.js';

type KeyPressState = {
  [key: string]: boolean;
}

export let mouse = { x: 0, y: 0 } as Vector2;

export let keyIsPressed: KeyPressState = {};
export let keyWasPressed: KeyPressState = {};
// FUNCTIONS
window.addEventListener('keydown', (event) => {
  if (!keyIsPressed[event.code]) {
    keyWasPressed[event.code] = true;
  }

  // console.log(`Key down: ${event.code}`);
  keyIsPressed[event.code] = true;

});

window.addEventListener('keyup', (event) => {
  // console.log(`Key up: ${event.code}`);
  keyIsPressed[event.code] = false;

})

export function resetKeyStates(keyWasPressed: KeyPressState) {
  for (const key in keyWasPressed) {
    keyWasPressed[key] = false;
  }
}

// Update mouse position
window.addEventListener('pointermove', (event) => {

  mouse.x = event.clientX;
  mouse.y = event.clientY;
})


export function movePlayer(player: Player, deltaTime: number, isGameFocused: boolean): Point | undefined {
  if (!isGameFocused)
    return;
  let pos = { x: player.position.asCartesian.x, y: player.position.asCartesian.y };

  if (keyIsPressed['KeyW']) {
    pos.y -= settings.PLAYERSPEED * deltaTime;
    player.setAnimation('north');
  }
  else if (keyIsPressed['KeyS']) {
    pos.y += settings.PLAYERSPEED * deltaTime;
    player.setAnimation('south');
  }
  else if (keyIsPressed['KeyA']) {
    pos.x -= settings.PLAYERSPEED * deltaTime;
    player.setAnimation('west');
  }
  else if (keyIsPressed['KeyD']) {
    pos.x += settings.PLAYERSPEED * deltaTime;
    player.setAnimation('east');
  }

  let x = Math.ceil(pos.x);
  let y = Math.ceil(pos.y);

  let isInBounds = (x >= 0) && (x < settings.GRIDWIDTH) &&
    (y >= 0) && (y < settings.GRIDHEIGHT);

  if (isInBounds && settings.TILEMAP[y][x] === 0) {

    player.updatePosition(pos);

  }
  return player.position;
}

export function switchCameraMode(currentMode: CameraMode): CameraMode {
  return currentMode === CameraMode.Locked ? CameraMode.Free : CameraMode.Locked;
}
