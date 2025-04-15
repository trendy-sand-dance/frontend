import { Application, Assets, Ticker } from "pixi.js";
import { Vector2, Point } from './interfaces.js';
import Player from './player.js';
import { playerManager } from './playermanager.js';
import { gameMap } from './gamemap.js';
import * as settings from './settings.js';
import * as mouse from './mouse-interaction.js';
import * as input from './input.js';
import * as cm from './connectionmanager.js';

let isGameFocused = false;
let pixiApp: Application;
let mousePos = { x: 0, y: 0 };

window.addEventListener('pointermove', (event) => {

  mousePos.x = event.clientX;
  mousePos.y = event.clientY;
})

window.addEventListener('blur', () => {
  isGameFocused = false;
})

window.addEventListener('focus', () => {
  isGameFocused = true;
})

async function setup() {
  const pixiApp = new Application();
  const container = document.getElementById("pixi-container");
  await pixiApp.init({ background: settings.CGA_BLACK, resizeTo: window });

  // if (container) {
  //   await pixiApp.init({ background: settings.CGA_BLACK, resizeTo: container });
  // }
  container?.appendChild(pixiApp.canvas);
  // const map = new GameMap(settings.GRIDHEIGHT, settings.GRIDWIDTH, settings.TILESIZE);
  const texture = await Assets.load('assets/bunny.png');
  const mapContainer = gameMap.getContainer();

  gameMap.createGridFromMap(settings.TILEMAP);

  pixiApp.stage.addChild(mapContainer);
  pixiApp.stage.eventMode = 'static';
  pixiApp.stage.hitArea = pixiApp.screen;

  mapContainer.scale = 1.25;
  mouse.setupMapZoom(mousePos, gameMap);
  playerManager.setLocalPlayer(1, { x: 4, y: 4 }, texture);
  const player = playerManager.getLocalPlayer();
  if (player) {
    mapContainer.addChild((player.getContext()));
  }


  let prevPos: Vector2;
  pixiApp.ticker.add((time: Ticker) => {
    mouse.moveMapWithMouse(mousePos, gameMap, isGameFocused);

    // const player = playerManager.getLocalPlayer();
    if (player) {
      input.movePlayer(player, time.deltaTime);
      // let playerPos = player.getPosition();
      // if (prevPos.x != playerPos.x || prevPos.y != playerPos.y) {
      //   cm.sendToServer({
      //     type: "move",
      //     id: player.id,
      //     position: {
      //       x: playerPos.x,
      //       y: playerPos.y
      //     }
      //   });
      // }
      prevPos = player.getPosition();
    }

  });

  return pixiApp;
}


setup().then((app) => {

  console.log("Pixi app initialized:", app);
  // cm.sendToServer("Hey, from client");
  cm.sendToServer(JSON.stringify({ type: "newConnection" }));
  pixiApp = app;
});

export { pixiApp };
