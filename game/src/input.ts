import * as settings from "./settings.js";
import Player from "./player.js";

type KeyPressState = {
  [key: string]: boolean;
}

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

export function movePlayer(player: Player, deltaTime: number) {
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
  let isInBounds = (x >= 0) && (x < settings.GRIDSIZE) &&
    (y >= 0) && (y < settings.GRIDSIZE);

  if (isInBounds && settings.TILEMAP[y][x] === 0) {
    player.updatePosition(pos);
  }
}
