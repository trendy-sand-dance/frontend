import { Assets, Container, Graphics, Texture, TilingSprite } from "pixi.js";
import { Point, Vector2 } from './interfaces.js';
import * as settings from './settings.js';

enum TextureId {
  BlockTransparent,
  BlockOpaque,
  BlockOpaqueColor,
  BlockHalfOpaqueColor,
  Player,
};

const textureMap = new Map<TextureId, string>([
  // Blocks
  [TextureId.BlockOpaque, "/assets/block_opaque_w.png"],
  [TextureId.BlockOpaqueColor, "/assets/block_opaque_c.png"],
  [TextureId.BlockHalfOpaqueColor, "/assets/block_opaque_half_c.png"],
  [TextureId.BlockTransparent, "/assets/block_empty_w.png"],
  // Players
  [TextureId.Player, "/assets/bunny.png"],
]);

export default class GameMap {
  static #instance: GameMap;

  public container: Container;

  private graphicsContext: Graphics;
  private tilingSprites: TilingSprite[][] = [];
  private rows: number;
  private cols: number;
  private tileSize: number;

  private constructor(rows: number, cols: number, tileSize: number) {

    this.container = new Container();

    this.graphicsContext = new Graphics();
    this.container.addChild(this.graphicsContext);

    this.rows = rows;
    this.cols = cols;
    this.tileSize = tileSize;
  }

  public static get instance(): GameMap {
    if (!GameMap.#instance) {
      GameMap.#instance = new GameMap(settings.GRIDHEIGHT, settings.GRIDWIDTH, settings.TILESIZE);
    }
    return GameMap.#instance;
  }

  async initSpriteTiles(rows: number, cols: number) {
    try {
      const path = textureMap.get(TextureId.Player)!;
      const texture = await Assets.load(path);
      if (!texture) {
        console.error("Failed to load texture.");
        return;
      }
      this.tilingSprites = Array.from({ length: rows }, () =>
        Array.from({ length: cols }, () => new TilingSprite({ texture, width: 64, height: 64 }))
      );

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          // this.tilingSprites[row][col].anchor.set(0, 0);

          this.container.addChild(this.tilingSprites[row][col]);
        }
      }
    } catch (error) {
      console.error("Error initializing sprite tiles:", error);
    }
  }
  async loadTextures() {
    let textures: Texture[] = new Array<Texture>;

    for (const [key, path] of textureMap) {
      console.log("TextureId: " + key + ", path: " + path);
      try {
        let texture = await Assets.load(path);
        textures.push(texture);
      } catch (error) {
        console.log("Hmvve", error);
      }
    }
    return textures;
  }

  async initTilingSpritesFromMap(tileMap: number[][]) {
    const rows = tileMap.length;
    const cols = tileMap[0].length;

    try {
      const textures = await this.loadTextures();
      if (!textures) {
        console.error("Failed to load texture.");
        return;
      }
      this.tilingSprites = tileMap.map(row => {
        return row.map(value => new TilingSprite({ texture: textures[value], width: 64, height: 64 }))
      })

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          // this.tilingSprites[row][col].anchor.set(0, -0.5);

          this.container.addChild(this.tilingSprites[row][col]);
        }
      }
    } catch (error) {
      console.error("Error initializing sprite tiles:", error);
    }
  }

  drawIsometricTile(context: Graphics, point: Vector2, w: number, h: number, outline: boolean) {
    context.poly([point.x, point.y, point.x + w, point.y + h / 2, point.x, point.y + h, point.x - w, point.y + h / 2, point.x, point.y]);
    if (outline) {
      context.fill(settings.CGA_BLACK);
      context.stroke({ color: settings.CGA_CYAN });
    }
    else {
      // context.fill(settings.CGA_PINK);
      // context.fill(settings.CGA_BLACK);
      context.stroke({ color: settings.CGA_PINK });
    }
  }

  async createSpriteMap(tileMap: number[][]) {

    await this.initTilingSpritesFromMap(tileMap);
    // await this.initSpriteTiles(this.rows, this.cols);

    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        let point = new Point(col, row);

        // Raise Y 
        point.asIsometric.y -= tileMap[row][col] * this.tileSize;

        this.tilingSprites[row][col].x = point.asIsometric.x;
        this.tilingSprites[row][col].y = point.asIsometric.y;
      }
    }
  }


  getHeightOffset(col: number, row: number, tileMap: number[][]) {
    return tileMap[row][col] * this.tileSize / 4;
  }

  async createGridFromMap(tileMap: number[][]) {

    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        let point = new Point(col, row);

        // Raise Y 
        const currentHeightOffset = this.getHeightOffset(col, row, tileMap);
        point.asIsometric.y -= currentHeightOffset;

        // Draw walls

        // // LB
        //South Face
        {
          const p1 = new Point(col, row + 1);
          const p2 = new Point(col, row + 1);
          const p3 = new Point(col + 1, row + 1);
          const p4 = new Point(col + 1, row + 1);
          p1.asIsometric.y -= currentHeightOffset;
          p4.asIsometric.y -= currentHeightOffset;


          // this.graphicsContext.poly([p1.asIsometric.x, p1.asIsometric.y, p2.asIsometric.x, p2.asIsometric.y, p3.asIsometric.x, p3.asIsometric.y, p4.asIsometric.x, p4.asIsometric.y]).stroke(settings.CGA_CYAN).fill('0xFF0000');
          this.graphicsContext.poly([p1.asIsometric.x, p1.asIsometric.y, p2.asIsometric.x, p2.asIsometric.y, p3.asIsometric.x, p3.asIsometric.y, p4.asIsometric.x, p4.asIsometric.y]).stroke(settings.CGA_BLACK).fill(settings.CGA_PINK);
        }

        // East Face
        {
          const p1 = new Point(col + 1, row + 1);
          const p2 = new Point(col + 1, row + 1);
          const p3 = new Point(col + 1, row);
          const p4 = new Point(col + 1, row);
          p1.asIsometric.y -= currentHeightOffset;
          p4.asIsometric.y -= currentHeightOffset;
          this.graphicsContext.poly([p1.asIsometric.x, p1.asIsometric.y, p2.asIsometric.x, p2.asIsometric.y, p3.asIsometric.x, p3.asIsometric.y, p4.asIsometric.x, p4.asIsometric.y]).stroke(settings.CGA_BLACK).fill(settings.CGA_CYAN);
        }

        // // RB
        // this.graphicsContext.moveTo(point.asIsometric.x - this.tileSize, point.asIsometric.y + this.tileSize / 2)
        //   .lineTo(point.asIsometric.x - this.tileSize, (point.asIsometric.y + (this.tileSize / 2 * (tileMap[row][col] + 1))));
        // // RT
        // this.graphicsContext.moveTo(point.asIsometric.x + this.tileSize, point.asIsometric.y + this.tileSize / 2)
        //   .lineTo(point.asIsometric.x + this.tileSize, (point.asIsometric.y + (this.tileSize / 2 * (tileMap[row][col] + 1))));
        // this.graphicsContext.stroke({ color: settings.CGA_CYAN });
        //

        if (tileMap[row][col] != 0)
          this.drawIsometricTile(this.graphicsContext, point.asIsometric, this.tileSize, this.tileSize, true);
        else
          this.drawIsometricTile(this.graphicsContext, point.asIsometric, this.tileSize, this.tileSize, false);
      }
    }
  }

  moveMap(offset: Vector2) {
    this.container.x += offset.x;
    this.container.y += offset.y;
  }

  getContainer() {
    return this.container;
  }
}

let gameMap = GameMap.instance;
export { gameMap };
