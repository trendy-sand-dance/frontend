import { Application, Container, Graphics, Sprite, Texture } from "pixi.js";
import MapRegion from './mapregion.js';
import Point from '../utility/point.js';
import Player from '../player/player.js';
import * as settings from '../settings.js';
import { RoomType } from "../interfaces.js";

export default class GameMap {
  static #instance: GameMap;

  public container: Container;


  private graphicsContext: Graphics;
  private rows: number;
  private cols: number;
  private tileSize: number;
  private mapRegions: Map<RoomType, MapRegion> = new Map<RoomType, MapRegion>();

  private constructor(rows: number, cols: number, tileSize: number) {

    this.container = new Container({ isRenderGroup: true });
    this.container.sortableChildren = true;

    this.graphicsContext = new Graphics();
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

  private initMapRegions(): void {

    const bocal = new MapRegion({ x: 52, y: 0 }, 12, 24);
    const game = new MapRegion({ x: 22, y: 15 }, 12, 9);
    const cluster = new MapRegion({ x: 0, y: 0 }, 16, 23);
    const server = new MapRegion({ x: 21, y: 0 }, 3, 5);
    const hall = new MapRegion({ x: 0, y: 0 }, 0, 0);
    const toilet = new MapRegion({ x: 16, y: 0 }, 4, 5);

    this.mapRegions.set(RoomType.Bocal, bocal);
    this.mapRegions.set(RoomType.Game, game);
    this.mapRegions.set(RoomType.Cluster, cluster);
    this.mapRegions.set(RoomType.Server, server);
    this.mapRegions.set(RoomType.Hall, hall);
    this.mapRegions.set(RoomType.Toilet, toilet);

  }

  public getMapRegion(position: Vector2): RoomType {

    for (const [room, region] of this.mapRegions) {

      if (region.isInRegion(position)) {
        return room;
      }

    }

    return RoomType.Hall;

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
        // Init point and graphics
        const context = new Graphics();
        let point = new Point(col, row);

        // Get room
        const room = this.getMapRegion(point.asCartesian);
        const mapRegion = this.mapRegions.get(room);

        // Raise Y 
        const currentHeightOffset = this.getHeightOffset(col, row, tileMap);
        point.asIsometric.y -= currentHeightOffset;

        // Draw pong table tiles
        if (tileMap[row][col] === 1.01 && room === RoomType.Hall) {
          context.zIndex = point.asIsometric.y;
          this.drawIsometricTile(context, point.asIsometric, this.tileSize, this.tileSize, true);
          mapRegion?.addToContainer(context);
          continue;
        }
        if (tileMap[row][col] === 1.02 && room === RoomType.Hall) {
          context.zIndex = point.asIsometric.y;
          this.drawIsometricTile(context, point.asIsometric, this.tileSize, this.tileSize, false);
          mapRegion?.addToContainer(context);
          continue;
        }

        if (tileMap[row][col] == -1) {
          const texture = Texture.from('cardboard_blackhole');

          const pileHeight = Math.random() * 3;
          for (let i = 0; i < pileHeight; i++) {
            const sprite = new Sprite(texture);
            sprite.x = point.asIsometric.x - 32;
            sprite.y = point.asIsometric.y - 24 - (i * 16);
            sprite.scale = 0.5;
            sprite.zIndex = 1000;
            mapRegion?.addToContainer(sprite);
          }
          tileMap[row][col] = 0;
        }


        // Draw walls
        // TODO: Turn the following scoped bits into functions
        //
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

        mapRegion?.addToContainer(context);


      }
    }

    for (const [room, region] of this.mapRegions) {

      const container = region.getContainer();
      if (room !== RoomType.Hall) {
        container.renderable = false;
      }
      this.container.addChild(container);
    }
  }

  setRegionOpacity(room: RoomType, opacity: number): void {

    const region = this.mapRegions.get(room);

    if (region) {
      region.getContainer().alpha = opacity;
    }

  }

  setRegionRenderable(room: RoomType, state: boolean): void {

    const region = this.mapRegions.get(room);

    if (region) {
      region.getContainer().renderable = state;
    }


  }

  addPlayer(player: Player) {

    const room = this.getMapRegion(player.getPosition());
    this.mapRegions.get(room)?.addToContainer(player.getContext());

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

  getRoomContainer(room: RoomType) {

    return this.mapRegions.get(room)?.getContainer();

  }

  addToContainer(context: Sprite) {
    this.container.addChild(context);
  }

  removeFromRoomContainer(room: RoomType, context: Sprite | Container): void {

    const mapRegion = this.mapRegions.get(room);
    if (mapRegion) {
      const container = mapRegion.getContainer();
      container.removeChild(context);
    }

  }

  addToRoomContainer(room: RoomType, context: Sprite | Container): void {

    const mapRegion = this.mapRegions.get(room);
    mapRegion?.addToContainer(context);

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

