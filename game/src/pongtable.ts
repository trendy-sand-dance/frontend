import { Container } from 'pixi.js';
import Ball from './ball.js';
import Point from './point.js';
import Paddle from './paddle.js';
import InfoBox from './infobox.js';
import Player from './player.js';
// import Player from './player.js';
import * as settings from './settings.js';

function slice2DArray(array: number[][], fromX: number, toX: number, fromY: number, toY: number) {
  const slicedRows = array.slice(fromY, toY);
  return slicedRows.map(row => row.slice(fromX, toX));
}

enum Side {
  Left,
  Right,
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
  private playerLeftInfoBox: InfoBox;
  // private playerRightInfoBox : InfoBox;

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
    this.playerLeftInfoBox = new InfoBox(`Waiting for left-side player...`, 12, 0, 0);
    this.container.addChild(this.playerLeftInfoBox.getContainer());
    let p1Paddle = new Paddle({ x: 0, y: 0 }, 0.5, 0.05);
    this.paddles.push(p1Paddle);
    this.container.addChild(this.paddles[0].getGraphics());
    this.container.y -= this.tableGrid[0][0] * settings.TILESIZE / 2; // Compensate height for elevated tiles

  }

  isPlayerAtLeft(player: Player) {
    let playerPos = { x: Math.round(player.getPosition().x), y: Math.round(player.getPosition().y) };

    if (playerPos.x === Math.round(this.worldPosition.x - 1) && playerPos.y === Math.round(this.worldPosition.y)
      || playerPos.x === Math.round(this.worldPosition.x - 1) && playerPos.y === Math.round(this.worldPosition.y + 1)) {
      return true;
    }
    return false;
  }

  setPlayerReady(player: Player, side: 'left' | 'right') {
    let pSide: Side = side === 'left' ? Side.Left : Side.Right;

    if (!this.players[pSide]) {
      this.players[pSide] = { id: player.getId(), username: player.getUsername(), paddleY: 32, ready: true, score: 0, side: side };
      this.playerLeftInfoBox.setColor(0x00ff00);
      this.playerLeftInfoBox.setText(`${player.getUsername()} is ready!`);
    }
  }

  removePlayer(side: 'left' | 'right') {
    let pSide: Side = side === 'left' ? Side.Left : Side.Right;

    console.log("b4 this.players[side]: ", this.players[pSide]);
    if (this.players[pSide]) {
      console.log("should be null now!");
      this.players[pSide] = null;
      this.playerLeftInfoBox.setColor(0xff0000);
      this.playerLeftInfoBox.setText("Waiting for left-side player...");
      console.log("this.players[side]: ", this.players[pSide]);
    }
  }

  isPlayerReady(side: 'left' | 'right') {
    let pSide: Side = side === 'left' ? Side.Left : Side.Right;
    if (this.players[pSide])
      return this.players[pSide].ready;
  }

  getPongPlayer(side: 'left' | 'right') {
    let pSide: Side = side === 'left' ? Side.Left : Side.Right;

    if (this.players[pSide])
      return this.players[pSide];

  }

  collidesWithPaddle(paddle: Paddle) {
    let ballPos = this.getLocalBallPosition(this.ball);
    let paddlePos = this.getLocalPaddlePosition(paddle);
    let pHeight = (paddle.getPaddleHeight() / 2) * settings.TILESIZE;
    let pBegin = paddlePos.y - pHeight;
    let pEnd = paddlePos.y + pHeight;

    if (ballPos.y > pBegin && ballPos.y < pEnd)
      return true;

    return false;
  }

  updateBall(deltaTime: number) {
    let localBallPos = this.getLocalBallPosition(this.ball);

    if (localBallPos.x <= 0) { // Flip x dir
      if (this.collidesWithPaddle(this.paddles[0])) {
        console.log("BOUNCE!");
        this.ball.bounceX();
      }
      else {
        // alert("P2 WON!");
        this.ball.bounceX();
      }
    }

    if (localBallPos.x > this.tableWidth) { // Flip x dir
      this.ball.bounceX();
    }

    if (localBallPos.y < 0 || localBallPos.y > this.tableHeight) { // Flip y dir
      this.ball.bounceY();
    }

    this.ball.move(deltaTime);
  }

  updatePaddle(paddleNumber: number, keyIsPressed: KeyPressState, deltaTime: number) {
    let paddle = this.paddles[paddleNumber];
    let paddlePos = this.getLocalPaddlePosition(paddle);
    let pHeight = (paddle.getPaddleHeight() / 2) * settings.TILESIZE;
    let pBegin = paddlePos.y - pHeight;
    let pEnd = paddlePos.y + pHeight;

    if (keyIsPressed['ArrowUp'] && pBegin > 0) {
      paddle.move(-1, deltaTime);
    }

    if (keyIsPressed['ArrowDown'] && pEnd < this.tableHeight) {
      paddle.move(1, deltaTime);
    }
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
