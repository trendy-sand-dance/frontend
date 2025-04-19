import { Application, Assets, Ticker } from "pixi.js";
import { playerManager } from './playermanager.js';
import { addGameMap } from './gamemap.js';
import GameMap from './gamemap.js';
import * as settings from './settings.js';
import * as mouse from './mouse-interaction.js';
import * as input from './input.js';
import * as cm from './connectionmanager.js';

const pixiApp: Application = new Application();
let isGameFocused = false;

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
  mouse.setupMapZoom(input.mouse, gameMap);


  // Initialize local player
  // TODO This should happen on inital connection
  // playerManager.setLocalPlayer(1, { x: 4, y: 4 }, Texture.from('player_bunny'));
  // const player = playerManager.getLocalPlayer();
  // if (player) {
  //   gameMap.addToContainer(player.getContext());
  // }

  //Network business
  cm.runConnectionManager(gameMap);

  //Game Loop
  pixiApp.ticker.add((time: Ticker) => {
    const player = playerManager.getLocalPlayer();

    mouse.moveMapWithMouse(input.mouse, gameMap, isGameFocused);
    if (player) {
      input.movePlayer(player, time.deltaTime);
    }

  });

})();
