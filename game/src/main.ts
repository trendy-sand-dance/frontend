import { Application, Assets, Ticker, BLEND_MODES } from "pixi.js";
import GameMap from './gamemap.js';
import { Point } from './interfaces.js';
import Player from './player.js';
import * as settings from './settings.js';
import * as mouse from './mouse-interaction.js';
import * as input from './input.js';

let isGameFocused = false;
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
  const map = new GameMap(settings.GRIDHEIGHT, settings.GRIDWIDTH, settings.TILESIZE);
  const texture = await Assets.load('assets/bunny.png');
  const player = new Player(1, new Point(4, 4), texture);
  const mapContainer = map.getContainer();
  const playerContext = player.getContext();

  // map.createSpriteMap(settings.TILEMAP);
  map.createGridFromMap(settings.TILEMAP);

  mapContainer.addChild(playerContext);
  pixiApp.stage.addChild(mapContainer);
  pixiApp.stage.eventMode = 'static';
  pixiApp.stage.hitArea = pixiApp.screen;

  mapContainer.scale = 1.25;
  mouse.setupMapZoom(mousePos, map);

  pixiApp.ticker.add((time: Ticker) => {
    mouse.moveMapWithMouse(mousePos, map, isGameFocused);
    input.movePlayer(player, time.deltaTime);
  });

  return pixiApp;
}

setup().then((pixiApp) => {
  console.log("Pixi app initialized:", pixiApp);
});

