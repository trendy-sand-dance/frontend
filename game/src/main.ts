import { Application, Assets, Ticker, Texture } from "pixi.js";
import { playerManager } from './playermanager.js';
import { addGameMap } from './gamemap.js';
import GameMap from './gamemap.js';
import * as settings from './settings.js';
import * as mouse from './mouse-interaction.js';
import * as input from './input.js';
import * as cm from './connectionmanager.js';
//import Ball from './ball.js';
import PongTable from './pongtable.js';
// import InfoBox from './infobox.js';
import { initializeLocalPlayer } from './connectionmanager.js';

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
  mouse.setupMapZoom(input.mouse, gameMap);

  //Network business
  if (window.__INITIAL_STATE__) {
    cm.runConnectionManager(gameMap);
  }
  else {
    const player = initializeLocalPlayer({id: 1, userId: 1, x: 0, y: 0}, gameMap, Texture.from('player_bunny'));
    if (player)
      gameMap.moveMap({x: (player.position.asCartesian.x * settings.TILESIZE)/ 2, y: -(player.position.asCartesian.y * settings.TILESIZE)});
  }


  // Testing Pong table
  let pongTable = new PongTable({x: 37, y: 15}, settings.TILEMAP);
  gameMap.container.addChild(pongTable.getContainer());

  //Game Loop
  let prevPos: Vector2 = { x: 0, y: 0 };
  pixiApp.ticker.add((time: Ticker) => {
    const player = playerManager.getLocalPlayer();
    mouse.moveMapWithMouse(input.mouse, gameMap, isGameFocused);
    if (player) {
        input.movePlayer(player, time.deltaTime);

        // PongTable business
        pongTable.updateBall(time.deltaTime);


      //Broadcast new position
      if (prevPos.x != player.position.asCartesian.x || prevPos.y != player.position.asCartesian.y) {
        cm.sendToServer({
          type: "player_move",
          id: player.getId(),
          position: player.getPosition(),
        });
      }

      prevPos = player.getPosition();
    }

    input.resetKeyStates(input.keyWasPressed);
  });

})();
