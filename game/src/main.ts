import { Application, Assets, Ticker, Texture } from "pixi.js";
import { playerManager } from './playermanager.js';
import { addGameMap } from './gamemap.js';
import GameMap from './gamemap.js';
import * as settings from './settings.js';
import * as mouse from './mouse-interaction.js';
import * as input from './input.js';
import * as cm from './connectionmanager.js';
import PongTable from './pongtable.js';
import Point from './point.js';
import Player from './player.js';
import { initializeLocalPlayer } from './connectionmanager.js';
import { PongState, CameraMode } from './interfaces.js';
//import Ball from './ball.js';
// import InfoBox from './infobox.js';

// Globals
const pixiApp: Application = new Application();
let prevPos: Vector2 = { x: 0, y: 0 };
export let localPlayerPos: Point = new Point(0, 0);
let isGameFocused = true;
let screenShake = false;
let cameraMode: CameraMode = CameraMode.Locked;

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
    container.appendChild(pixiApp.canvas);
  }

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

  // Setup Map Zoom Callback
  mouse.setupMapZoom();

  console.log("Pixi app initialized:", pixiApp);
}

function joinOrLeavePongTable(player: Player, pongTable: PongTable) {

  const side = pongTable.getPlayerSide(player) as 'left' | 'right';

  if (side === null) {
    return;
  }
  else {

    const newPlayer: PongPlayer = { id: player.getId(), username: player.getUsername(), paddleY: 1, ready: false, score: 0, side: side };

    if (!pongTable.isSideReady(side)) {
      cm.sendToServer({ type: "join_pong", pongPlayer: newPlayer });
    }
    else {
      const existingPlayer: PongPlayer | null = pongTable.getPongPlayer(side);
      if (existingPlayer && existingPlayer.id !== player.id) {
        alert("There's already another player at the table!");
      }
      else if (existingPlayer) {
        cm.sendToServer({ type: "leave_pong", pongPlayer: existingPlayer });
      }
    }

  }

}

function handlePong(pongTable: PongTable, player: Player) {

  if (!pongTable.isPlayerReady(player.id)) {

    if (pongTable.isPlayerAtLeft(player.getPosition()) && !pongTable.isSideReady('left')) {
      pongTable.setIndicator('left', PongState.PlayerNearby);
    }
    else if (!pongTable.isSideReady('left')) {
      pongTable.setIndicator('left', PongState.Waiting);
    }

    if (pongTable.isPlayerAtRight(player.getPosition()) && !pongTable.isSideReady('right')) {
      pongTable.setIndicator('right', PongState.PlayerNearby);
    }
    else if (!pongTable.isSideReady('right')) {
      pongTable.setIndicator('right', PongState.Waiting);
    }

  }

  // Pong join table
  if (input.keyWasPressed['KeyE']) {
    joinOrLeavePongTable(player, pongTable);
  }

  pongTable.displayPongState();

}

function handleCamera(player: Player, gameMap: GameMap) {

  if (cameraMode === CameraMode.Locked) {
    let p = player.getPoint();
    localPlayerPos.update({ x: p.asCartesian.x, y: p.asCartesian.y });
    gameMap.container.x = -p.asIsometric.x + pixiApp.screen.width / 2;
    gameMap.container.y = -p.asIsometric.y + pixiApp.screen.height / 2;
  }
  else {
    mouse.moveMapWithMouse(input.mouse, gameMap, isGameFocused);
  }

  // Switch camera mode
  if (input.keyWasPressed['KeyC']) {
    cameraMode = input.switchCameraMode(cameraMode);
  }


}

(async () => {

  await setup();
  await preload();

  // Initialize map and add to pixi.stage
  let gameMap: GameMap = addGameMap(pixiApp);

  //Network business
  if (window.__INITIAL_STATE__) {
    cm.runConnectionManager(gameMap);
  }
  else { // We set up a test player for dev mode
    initializeLocalPlayer({ id: -1, userId: -1, x: 0, y: 0 }, gameMap, Texture.from('player_bunny'));
  }

  // Testing Pong table
  let pongTable = new PongTable({ x: 37, y: 15 }, settings.TILEMAP);
  gameMap.container.addChild(pongTable.getContainer());
  playerManager.initPongTable(pongTable);

  let driver: number = 0;

  //Game Loop
  pixiApp.ticker.add((time: Ticker) => {

    const player = playerManager.getLocalPlayer();

    if (player) {

      handleCamera(player, gameMap);
      handlePong(pongTable, player);

      // Pong move paddle
      if (!pongTable.isPlayerReady(player.id)) {
        input.movePlayer(player, time.deltaTime);
      }
      else {

        const side = pongTable.getPlayerSide(player) as 'left' | 'right';

        if (side !== null) {

          if (input.keyIsPressed['ArrowUp']) {
            cm.sendToServer({
              type: "paddle_move",
              side: side,
              direction: "up",
            });
          }
          if (input.keyIsPressed['ArrowDown']) {
            cm.sendToServer({
              type: "paddle_move",
              side: side,
              direction: "down",
            });
          }

          if (pongTable.collidesWithPaddle(side)) {
            screenShake = true;
            setTimeout(() => {
              screenShake = false;
            }, 250)
          }

        }

      }

      if (screenShake) {
        pixiApp.stage.x += Math.sin(driver);
      }

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

    driver += time.deltaTime;
    input.resetKeyStates(input.keyWasPressed);
  });

})();

export { pixiApp };
