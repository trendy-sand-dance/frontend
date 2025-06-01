import * as settings from "./settings.js";
import Player from "./player.js";
import Point from './point.js';
import { CameraMode } from './interfaces.js';

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

// Quick and dirty. TODO: dedicate separate graphics container for each tile, sort z-index based on y-position;
// function dynamicIndexing(player: Player, pos: Vector2) {
//   let y = Math.ceil(pos.y + 1);
//   let x = Math.ceil(pos.x + 1);
//   if (settings.TILEMAP[y - 1][x] > 0 || settings.TILEMAP[y][x] > 0 || settings.TILEMAP[y][x - 1] > 0) {
//     player.getContext().zIndex = -1;
//   }
//   else
//     player.getContext().zIndex = 5;
// }

export function movePlayer(player: Player, deltaTime: number): Point {
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

    // Primitive and scuffed depth 
    // dynamicIndexing(player, pos);
  }
  return player.position;
}

export function handleAnimation(keyIsPressed: KeyPressState, player: Player) {

  if (keyIsPressed['KeyW']) {
    player.setAnimation('north');
  }
  else if (keyIsPressed['KeyS']) {
    player.setAnimation('south');
  }
  else if (keyIsPressed['KeyA']) {
    player.setAnimation('west');
  }
  else if (keyIsPressed['KeyD']) {
    player.setAnimation('east');
  }
  else {
    player.setAnimation('idle');
  }

}

export function switchCameraMode(currentMode: CameraMode): CameraMode {
  return currentMode === CameraMode.Locked ? CameraMode.Free : CameraMode.Locked;
}
