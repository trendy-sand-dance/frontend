import { Application, Container, Graphics, Sprite, Texture } from "pixi.js";
import MapRegion from './mapregion.js';
import Point from './point.js';
import Player from './player.js';
import * as settings from './settings.js';

export default class GameMap {
  static #instance: GameMap;

  public container: Container;

  private wallsContainer: Container;

  private graphicsContext: Graphics;
  private rows: number;
  private cols: number;
  private tileSize: number;
  private mapRegions : Map<string, MapRegion> = new Map<string, MapRegion>();

  private constructor(rows: number, cols: number, tileSize: number) {

    this.wallsContainer = new Container();
    this.wallsContainer.sortableChildren = true;
    this.container = new Container();

    this.graphicsContext = new Graphics();
    this.container.addChild(this.wallsContainer);
    this.container.addChild(this.graphicsContext);

    this.rows = rows;
    this.cols = cols;
    this.tileSize = tileSize;

    this.initMapRegions();
  }

  public static get instance(): GameMap {
    if (!GameMap.#instance) {
      GameMap.#instance = new GameMap(settings.GRIDHEIGHT, settings.GRIDWIDTH, settings.TILESIZE);
    }
    return GameMap.#instance;
  }

  private initMapRegions() : void {

    const bocal =  new MapRegion({x: 51, y: 0}, 12, 24);
    const game = new MapRegion({x: 23, y: 14}, 12, 9);
    const cluster = new MapRegion({x: 0, y: 0}, 16, 23);
    const server =  new MapRegion({x: 21, y: 0}, 4, 6);
    
    this.mapRegions.set("bocal", bocal);
    this.mapRegions.set("game", game);
    this.mapRegions.set("cluster", cluster);
    this.mapRegions.set("server", server);

    console.log(this.mapRegions.get("bocal"));
    console.log(this.mapRegions.get("game"));
    console.log(this.mapRegions.get("cluster"));
    console.log(this.mapRegions.get("server"));

  }

  public getMapRegion(position: Vector2) : string {

    for (const [room, region] of this.mapRegions) {

      if (region.isPlayerPresent(position)) {
        return room;
      }

    }

    return "hall";
      
  }

  drawIsometricTile(context: Graphics, point: Vector2, w: number, h: number, outline: boolean) {
    context.poly([point.x, point.y, point.x + w, point.y + h / 2, point.x, point.y + h, point.x - w, point.y + h / 2, point.x, point.y]);
    if (outline) {
      context.fill(settings.CGA_PINK_DARK);
      context.stroke({ color: settings.CGA_BLACK });
    }
    else {
      context.fill(settings.CGA_CYAN_DARK);
      context.stroke({ color: settings.CGA_BLACK });
    }
  }


  async createGraphicsGrid(tileMap: number[][]) {

    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        const context = new Graphics();
        let point = new Point(col, row);


        if (tileMap[row][col] == -1) {
          const texture = Texture.from('cardboard_blackhole');

          const pileHeight = Math.random() * 3;
          for (let i = 0; i < pileHeight; i++) {
            const sprite = new Sprite(texture);
            sprite.x = point.asIsometric.x - 32;
            sprite.y = point.asIsometric.y - 24 - (i * 16);
            sprite.scale = 0.5;
            this.container.addChild(sprite);
          }
          tileMap[row][col] = 0;
        }

        // Raise Y 
        const currentHeightOffset = this.getHeightOffset(col, row, tileMap);
        point.asIsometric.y -= currentHeightOffset;

        // Draw walls
        // TODO Turn the following scoped bits into functions
        //South Face
        {
          const p1 = new Point(col, row + 1);
          const p2 = new Point(col, row + 1);
          const p3 = new Point(col + 1, row + 1);
          const p4 = new Point(col + 1, row + 1);
          p1.asIsometric.y -= currentHeightOffset;
          p4.asIsometric.y -= currentHeightOffset;
          context.poly([p1.asIsometric.x, p1.asIsometric.y, p2.asIsometric.x, p2.asIsometric.y, p3.asIsometric.x, p3.asIsometric.y, p4.asIsometric.x, p4.asIsometric.y]).stroke(settings.CGA_BLACK).fill(settings.CGA_BLACK);
        }
        // East Face
        {
          const p1 = new Point(col + 1, row + 1);
          const p2 = new Point(col + 1, row + 1);
          const p3 = new Point(col + 1, row);
          const p4 = new Point(col + 1, row);
          p1.asIsometric.y -= currentHeightOffset;
          p4.asIsometric.y -= currentHeightOffset;
          context.poly([p1.asIsometric.x, p1.asIsometric.y, p2.asIsometric.x, p2.asIsometric.y, p3.asIsometric.x, p3.asIsometric.y, p4.asIsometric.x, p4.asIsometric.y]).stroke(settings.CGA_BLACK).fill(settings.CGA_CYAN);
        }

        if (tileMap[row][col] != 0) {
          context.zIndex = point.asIsometric.y;
          this.drawIsometricTile(context, point.asIsometric, this.tileSize, this.tileSize, true);
        }
        else {
          context.zIndex = -100;
          this.drawIsometricTile(context, point.asIsometric, this.tileSize, this.tileSize, false);
        }

        this.wallsContainer.addChild(context);
      }
    }
  }

  addPlayer(player: Player) {
    this.wallsContainer.addChild(player.getContext());
  }

  getHeightOffset(col: number, row: number, tileMap: number[][]) {
    return tileMap[row][col] * this.tileSize / 4;
  }

  moveMap(offset: Vector2) {
    this.container.x += offset.x;
    this.container.y += offset.y;
  }

  getContainer() {
    return this.container;
  }

  addToContainer(context: Sprite) {
    this.container.addChild(context);
  }
}

export function addGameMap(pixiApp: Application): GameMap {
  let gameMap = GameMap.instance;
  const mapContainer = gameMap.getContainer();
  gameMap.createGraphicsGrid(settings.TILEMAP);
  // gameMap.createSpriteGrid(settings.TILEMAP);
  pixiApp.stage.addChild(mapContainer);
  return gameMap;
}

