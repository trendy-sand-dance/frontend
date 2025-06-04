import { Graphics, Text } from "pixi.js";
import GameMap from './gamemap.js';

import { pixiApp, localPlayerPos} from './main.js';

export class MouseData {

  public textInfo: Text;
  public graphicsSelector: Graphics;
  public position: Vector2;

  constructor(x: number, y: number) {
    this.textInfo = new Text({
      text: "Default text", style: {
        fontSize: 16,
      },
      position: {
        x: x,
        y: y,
      }
    });
    this.graphicsSelector = new Graphics();
    this.position = { x: 0, y: 0 };
  }

  setMousePosition(pos: Vector2) {
    this.position = pos;
  }

  getGraphicsContext() {
    return this.graphicsSelector;
  }
}


export function moveMapWithMouse(mousePos: Vector2, map: GameMap, focused: boolean) {
  if (!focused)
    return;

  let bufferHorizontal = window.innerWidth * 0.1;
  let bufferVertical = window.innerHeight * 0.1;
  let dir = { x: 0, y: 0 };
  let moveIntensity = 5;

  // Right-hand side
  if (mousePos.x >= (window.innerWidth - bufferHorizontal)) {
    let fraction = (mousePos.x - (window.innerWidth - bufferHorizontal)) / bufferHorizontal;
    dir.x -= fraction * moveIntensity;
  }

  // Left-hand side
  if (mousePos.x <= bufferHorizontal) {
    let fraction = (bufferHorizontal - mousePos.x) / bufferHorizontal;
    dir.x += fraction * moveIntensity;
  }

  // Top side
  if (mousePos.y <= bufferVertical) {
    let fraction = (bufferVertical - mousePos.y) / bufferVertical;
    dir.y += fraction * moveIntensity;
  }

  // Bot side
  if (mousePos.y >= (window.innerHeight - bufferVertical)) {
    let fraction = (mousePos.y - (window.innerHeight - bufferVertical)) / bufferVertical;
    dir.y -= fraction * moveIntensity;
  }
  map.moveMap(dir);
}

export function setupMapZoom() {

  pixiApp.stage.scale = 2.5;

  window.addEventListener('wheel', (event) => {
    let zoomIntensity = 0.05;
    let minZoom = 2;
    let maxZoom = 4;
    let scrollDir = event.deltaY / Math.abs(event.deltaY);

    enum Dir {
      Up = -1,
      Down = 1,
    }

    let container = pixiApp.stage;
    // let container = gameMap.container;
    let wOffset = localPlayerPos.asCartesian.x + pixiApp.screen.width / 2;
    let hOffset = localPlayerPos.asCartesian.y + pixiApp.screen.height / 2;

    if (scrollDir == Dir.Up && container.scale.x < maxZoom) {
      const scaleFactor = 1 - (container.scale.x / (container.scale.x + zoomIntensity));
      container.scale.x += zoomIntensity;
      container.scale.y += zoomIntensity;
      container.x -= (wOffset - container.x) * scaleFactor;
      container.y -= (hOffset - container.y) * scaleFactor;
    }
    else if (scrollDir == Dir.Down && container.scale.x > minZoom) {
      const scaleFactor = 1 - (container.scale.x / (container.scale.x + zoomIntensity));
      container.scale.x -= zoomIntensity;
      container.scale.y -= zoomIntensity;

      container.x += (wOffset - container.x) * scaleFactor;
      container.y += (hOffset - container.y) * scaleFactor;
    }
  });

}

