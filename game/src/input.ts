import * as settings from "./settings.js";
import { Vector2 } from "./interfaces.js";
import Player from "./player.js";

type KeyPressState = {
  [key: string]: boolean;
}

export let mouse = { x: 0, y: 0 } as Vector2;

export let keyIsPressed: KeyPressState = {};
// FUNCTIONS
window.addEventListener('keydown', (event) => {
  // console.log(`Key down: ${event.code}`);
  keyIsPressed[event.code] = true;

});
window.addEventListener('keyup', (event) => {
  // console.log(`Key up: ${event.code}`);
  keyIsPressed[event.code] = false;

})

// Quick and dirty. TODO: dedicate separate graphics container for each tile, sort z-index based on y-position;
function dynamicIndexing(player: Player, pos: Vector2) {
  let y = Math.ceil(pos.y + 1);
  let x = Math.ceil(pos.x + 1);
  if (settings.TILEMAP[y - 1][x] > 0 || settings.TILEMAP[y][x] > 0) {
    player.getContext().zIndex = -1;
  }
  else
    player.getContext().zIndex = 5;
}

export function movePlayer(player: Player, deltaTime: number): Vector2 {
  let pos = { x: player.position.asCartesian.x, y: player.position.asCartesian.y };
  if (keyIsPressed['KeyW']) {
    pos.y -= settings.PLAYERSPEED * deltaTime;
  }
  else if (keyIsPressed['KeyS']) {
    pos.y += settings.PLAYERSPEED * deltaTime;
  }
  else if (keyIsPressed['KeyA']) {
    pos.x -= settings.PLAYERSPEED * deltaTime;
  }
  else if (keyIsPressed['KeyD']) {
    pos.x += settings.PLAYERSPEED * deltaTime;
  }

  let x = Math.ceil(pos.x);
  let y = Math.ceil(pos.y);

  let isInBounds = (x >= 0) && (x < settings.GRIDWIDTH) &&
    (y >= 0) && (y < settings.GRIDHEIGHT);

  if (isInBounds && settings.TILEMAP[y][x] === 0) {

    player.updatePosition(pos);

    // Primitive and scuffed depth 
    dynamicIndexing(player, pos);
  }
  return player.position.asCartesian;
}
