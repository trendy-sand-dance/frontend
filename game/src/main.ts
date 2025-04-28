import { Application, Assets, Ticker } from "pixi.js";
import { playerManager } from './playermanager.js';
import { addGameMap } from './gamemap.js';
import GameMap from './gamemap.js';
import * as settings from './settings.js';
import * as mouse from './mouse-interaction.js';
import * as input from './input.js';
import * as cm from './connectionmanager.js';
import Ball from './ball.js';

const pixiApp: Application = new Application();
let isGameFocused = true;

async function preload() {
  const assets = [
    // Player Assets
    { alias: 'player_bunny', src: '/assets/bunny.png' },
    // Map Assets
    { alias: 'block_empty_black', src: '/assets/block_empty_black.png' },
    { alias: 'block_empty_white', src: '/assets/block_empty_white.png' },
    { alias: 'block_opaque_coloured', src: '/assets/block_opaque_coloured.png' },
    { alias: 'block_opaque_white', src: '/assets/block_opaque_white.png' },
    { alias: 'block_half_opaque_coloured', src: '/assets/block_half_opaque_coloured.png' },
  ];
  await Assets.load(assets);
}

async function setup() {
  const container = document.getElementById("pixi-container");
  if (container) {
    await pixiApp.init({ background: settings.CGA_BLACK, resizeTo: container });
  }
  container?.appendChild(pixiApp.canvas);
  pixiApp.stage.eventMode = 'static';
  pixiApp.stage.hitArea = pixiApp.screen;

  // Callback functions
  window.addEventListener('pointermove', (event) => {

    input.mouse.x = event.clientX;
    input.mouse.y = event.clientY;
  })

  window.addEventListener('blur', () => {
    isGameFocused = false;
  })

  window.addEventListener('focus', () => {
    isGameFocused = true;
  })
  console.log("Pixi app initialized:", pixiApp);
}


(async () => {
  await setup();
  await preload();

  // Initialize map and add to pixi.stage
  let gameMap = GameMap.instance;
  addGameMap(pixiApp, gameMap);
  // gameMap.moveMap({ x: -(30 * settings.TILESIZE / 2), y: -(22 * settings.TILESIZE) });
  mouse.setupMapZoom(input.mouse, gameMap);

  //Network business
  // cm.runConnectionManager(gameMap);
  let ball = new Ball({ x: 37, y: 16 });
  // let ball = new Ball({ x: 1, y: 1 });
  gameMap.container.addChild(ball.getContext());

  //Game Loop
  let prevPos: Vector2 = { x: 0, y: 0 };
  pixiApp.ticker.add((time: Ticker) => {
    const player = playerManager.getLocalPlayer();
    mouse.moveMapWithMouse(input.mouse, gameMap, isGameFocused);
    ball.move(time.deltaTime, settings.TILEMAP);
    if (player) {
      input.movePlayer(player, time.deltaTime);

      if (prevPos.x != player.position.asCartesian.x || prevPos.y != player.position.asCartesian.y) {
        cm.sendToServer({
          type: "move",
          id: player.getId(),
          position: player.getPosition(),
        });
      }

      prevPos = player.getPosition();
    }

  });

})();
