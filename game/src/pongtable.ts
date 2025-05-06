import { Container } from 'pixi.js';
import Ball from './ball.js';
import Point from './point.js';
import Paddle from './paddle.js';
import InfoBox from './infobox.js';
import Player from './player.js';
// import Player from './player.js';
import * as settings from './settings.js';
import { Side } from './interfaces.js';

function slice2DArray(array: number[][], fromX: number, toX: number, fromY: number, toY: number) {
  const slicedRows = array.slice(fromY, toY);
  return slicedRows.map(row => row.slice(fromX, toX));
}

function isWithinRange(value: number, target: number, range: number) {
  return Math.abs(value - target) <= range;
}

export default class PongTable {
  private container = new Container();
  private tableGrid: number[][] = []; //4x2
  private tableWidth: number;
  private tableHeight: number;
  private worldPosition: Vector2;
  private ball: Ball;
  private paddles: Paddle[] = [];
  private players: [PongPlayer | null, PongPlayer | null] = [null, null];
  private indicators: InfoBox[] = [];

  constructor(position: Vector2, parentMap: number[][]) {
    this.worldPosition = position;
    this.tableWidth = 4 * settings.TILESIZE;
    this.tableHeight = 2 * settings.TILESIZE;

    // Construct a sub-array from the parent map (4x2)
    let x = Math.round(position.x);
    let y = Math.round(position.y);

    this.tableGrid = slice2DArray(parentMap, x, x + 2, y, y + 2);

    this.ball = new Ball({ x: 2, y: 1 });
    this.container.addChild(this.ball.getContext());
    let point = new Point(this.worldPosition.x, this.worldPosition.y);
    this.container.x += point.asIsometric.x;
    this.container.y += point.asIsometric.y;

    // Create Player Left 
    this.indicators.push(new InfoBox(`Waiting for left-side player...`, 12, 0, 0));
    this.container.addChild(this.indicators[Side.Left].getContainer());
    let p1Paddle = new Paddle({ x: 0, y: 0 }, 0.5, 0.05);
    this.paddles.push(p1Paddle);
    this.container.addChild(this.paddles[Side.Left].getGraphics());

    this.indicators.push(new InfoBox('Waiting for right-side player...', 12, 4 * settings.TILESIZE, 4 * settings.TILESIZE / 2));
    this.container.addChild(this.indicators[Side.Right].getContainer());
    let p2Paddle = new Paddle({ x: 4, y: 0 }, 0.5, 0.05);
    this.paddles.push(p2Paddle);
    this.container.addChild(this.paddles[Side.Right].getGraphics());


    this.container.y -= this.tableGrid[0][0] * settings.TILESIZE / 2; // Compensate height for elevated tiles
    this.container.zIndex = 1000;
  }

  isPlayerAtLeft(position: Vector2) {
    let playerPos = { x: Math.round(position.x), y: Math.round(position.y) };

    if (playerPos.x === Math.round(this.worldPosition.x - 1) && playerPos.y === Math.round(this.worldPosition.y)
      || playerPos.x === Math.round(this.worldPosition.x - 1) && playerPos.y === Math.round(this.worldPosition.y + 1)) {
      return true;
    }
    return false;
  }

  isPlayerAtRight(position: Vector2) {
    let playerPos = { x: Math.round(position.x), y: Math.round(position.y) };

    if (playerPos.x === Math.round(this.worldPosition.x + 3) && playerPos.y === Math.round(this.worldPosition.y)
      || playerPos.x === Math.round(this.worldPosition.x + 3) && playerPos.y === Math.round(this.worldPosition.y + 1)) {
      return true;
    }
    return false;
  }

  setPlayerReady(player: Player, side: 'left' | 'right') {
    let pSide: Side = side === 'left' ? Side.Left : Side.Right;

    if (!this.players[pSide]) {
      this.players[pSide] = { id: player.getId(), username: player.getUsername(), paddleY: 32, ready: true, score: 0, side: side };
      this.indicators[pSide].setText(`${player.getUsername()} is ready!`, settings.CGA_CYAN);
      this.indicators[pSide].setColor(settings.CGA_BLACK);
    }
  }

  removePlayer(side: 'left' | 'right') {
    let pSide: Side = side === 'left' ? Side.Left : Side.Right;

    if (this.players[pSide]) {
      this.players[pSide] = null;
      this.indicators[pSide].setText("Waiting for left-side player...", settings.CGA_PINK);
      this.indicators[pSide].setColor(settings.CGA_BLACK);
    }
  }

  isSideReady(side: Side) {
    if (this.players[side])
      return this.players[side].ready;
  }

  isPlayerReady(id: number): boolean {
    for (const player of this.players) {
      if (player && player.id === id && player.ready) {
        return true;
      }
    }
    return false;
  }

  getPongPlayer(side: Side): PongPlayer | null {
    if (this.players[side])
      return this.players[side];
    return null;
  }

  getPlayerSide(player: Player): Side | null {
    let position = player.getPosition();

    if (this.isPlayerAtLeft(position)) {
      return Side.Left;
    }
    else if (this.isPlayerAtRight(position)) {
      return Side.Right;
    }
    return null;
  }

  collidesWithPaddle(side: Side) {
    let ballPos = this.getLocalBallPosition(this.ball);
    let paddlePos = this.getLocalPaddlePosition(this.paddles[side]);
    let pHeight = (this.paddles[side].getPaddleHeight() / 2) * settings.TILESIZE;
    let pBegin = paddlePos.y - pHeight;
    let pEnd = paddlePos.y + pHeight;

    let offset: number = 0;
    if (side === Side.Right)
      offset = settings.TILESIZE * 4;

    if (ballPos.y > pBegin && ballPos.y < pEnd && isWithinRange(offset, ballPos.x, 2))
      return true;

    return false;
  }

  updateBall(deltaTime: number) {
    let localBallPos = this.getLocalBallPosition(this.ball);

    if (localBallPos.x <= 0) { // Flip x dir
      if (this.collidesWithPaddle(Side.Left)) {
        console.log("Left-side BOUNCE!");
        this.ball.bounceX();
      }
      else {
        // alert("Left-side WON!");
        this.ball.bounceX();
      }
    }

    if (localBallPos.x > this.tableWidth) { // Flip x dir
      if (this.collidesWithPaddle(Side.Right)) {
        console.log("Right-side BOUNCE!");
        this.ball.bounceX();
      }
      else {
        // alert("Right-side WON!");
        this.ball.bounceX();
      }
    }

    if (localBallPos.y < 0 || localBallPos.y > this.tableHeight) { // Flip y dir
      this.ball.bounceY();
    }

    this.ball.move(deltaTime);
  }

  // updatePaddle(side: Side | null, keyIsPressed: KeyPressState, deltaTime: number) {
  //   if (side === null)
  //     return;
  //
  //   let paddle = this.paddles[side];
  //   let paddlePos = this.getLocalPaddlePosition(paddle);
  //   let pHeight = (paddle.getPaddleHeight() / 2) * settings.TILESIZE;
  //   let pBegin = paddlePos.y - pHeight;
  //   let pEnd = paddlePos.y + pHeight;
  //
  //   if (keyIsPressed['ArrowUp'] && pBegin > 0) {
  //     paddle.move(-1, deltaTime);
  //   }
  //
  //   if (keyIsPressed['ArrowDown'] && pEnd < this.tableHeight) {
  //     paddle.move(1, deltaTime);
  //   }
  // }

  updatePaddle(side: Side | null, paddleY: number) {
    if (side)
      this.paddles[side].update(paddleY);
  }

  getLocalBallPosition(ball: Ball): Vector2 {
    let pos = ball.getPoint().asCartesian;
    return { x: pos.x * settings.TILESIZE, y: pos.y * settings.TILESIZE };
  }

  getLocalPaddlePosition(paddle: Paddle): Vector2 {
    let pos = paddle.getPoint().asCartesian;
    return { x: pos.x * settings.TILESIZE, y: pos.y * settings.TILESIZE };
  }

  getContainer(): Container {
    return this.container;
  }

}
