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

function isWithinRange(value: number, target: number, range: number) {
  return Math.abs(value - target) <= range;
}

export default class PongTable {

  private container = new Container();
  private worldPosition: Vector2;
  private tableGrid: number[][] = []; //4x2

  private ball: Ball;
  private paddles: Paddles = { left: new Paddle({ x: 0, y: 0 }, 0.5, 0.05), right: new Paddle({ x: 4, y: 0 }, 0.5, 0.05) };
  private players: PongPlayers = { left: null, right: null };
  private indicators: Indicators = { left: new InfoBox(`Waiting for player...`, 12, 0, 0), right: new InfoBox(`Waiting for player...`, 12, settings.TILESIZE * 4, settings.TILESIZE * 2) };
  private countdownTimer: InfoBox = new InfoBox('3', 24, settings.TILESIZE * 2, 0);

  private inProgress: boolean = false;

  constructor(position: Vector2, parentMap: number[][]) {
    this.worldPosition = position;

    // Construct a sub-array from the parent map (4x2)
    let x = Math.round(position.x);
    let y = Math.round(position.y);

    this.tableGrid = slice2DArray(parentMap, x, x + 2, y, y + 2);

    this.ball = new Ball({ x: 2, y: 1 });
    this.container.addChild(this.ball.getContext());

    // Give PongTable position in world
    let point = new Point(this.worldPosition.x, this.worldPosition.y);
    this.container.x += point.asIsometric.x;
    this.container.y += point.asIsometric.y;

    // Add containers/graphics to main container
    this.countdownTimer.container.renderable = false;
    this.container.addChild(this.indicators['left'].getContainer());
    this.container.addChild(this.indicators['right'].getContainer());
    this.container.addChild(this.countdownTimer.getContainer());
    this.container.addChild(this.paddles['left'].getGraphics());
    this.container.addChild(this.paddles['right'].getGraphics());

    this.container.y -= this.tableGrid[0][0] * settings.TILESIZE / 2; // Compensate height for elevated tiles
    this.container.zIndex = 10;
  }

  setCountdownTimer(seconds: number) {

    if (seconds === -1) {
      this.countdownTimer.container.renderable = false;
    }
    else {
      this.countdownTimer.container.renderable = true;
      this.countdownTimer.setText(`Starting in: ${seconds}`, settings.CGA_WHITE);
      this.countdownTimer.setColor(settings.CGA_BLACK);
    }

  }

  isPlayerAtLeft(position: Vector2): boolean {

    let playerPos = { x: Math.round(position.x), y: Math.round(position.y) };

    if (playerPos.x === Math.round(this.worldPosition.x - 1) && playerPos.y === Math.round(this.worldPosition.y)
      || playerPos.x === Math.round(this.worldPosition.x - 1) && playerPos.y === Math.round(this.worldPosition.y + 1)) {
      return true;
    }

    return false;
  }

  isPlayerAtRight(position: Vector2): boolean {

    let playerPos = { x: Math.round(position.x), y: Math.round(position.y) };

    if (playerPos.x === Math.round(this.worldPosition.x + 3) && playerPos.y === Math.round(this.worldPosition.y)
      || playerPos.x === Math.round(this.worldPosition.x + 3) && playerPos.y === Math.round(this.worldPosition.y + 1)) {
      return true;
    }

    return false;

  }

  setPlayerReady(player: Player, side: 'left' | 'right') {

    if (!this.players[side]) {
      this.players[side] = { id: player.getId(), username: player.getUsername(), paddleY: 32, ready: true, score: 0, side: side };
      this.indicators[side].setText(`${player.getUsername()} is ready!`, settings.CGA_CYAN);
      this.indicators[side].setColor(settings.CGA_BLACK);
    }

  }

  joinIndicator(side: 'left' | 'right') {

    this.indicators[side].setText(`Press 'E' to ready up`, settings.CGA_CYAN);
    this.indicators[side].setColor(settings.CGA_BLACK);

  }

  resetIndicator(side: 'left' | 'right') {

    this.indicators[side].setText('Waiting for player...', settings.CGA_PINK);
    this.indicators[side].setColor(settings.CGA_BLACK);

  }

  startGame() {


    if (!this.inProgress) {

      this.indicators['left'].setText(`${this.players['left']?.username} Score: 0`, settings.CGA_PINK);
      this.indicators['left'].setColor(settings.CGA_BLACK);

      this.indicators['right'].setText(`${this.players['right']?.username} Score: 0`, settings.CGA_PINK);
      this.indicators['right'].setColor(settings.CGA_BLACK);

    }

    this.inProgress = true;

  }

  isInProgress() {

    return this.inProgress;

  }

  updateScore(side: 'left' | 'right', score: number) {

    if (this.players[side]) {
      this.players[side].score = score;
      this.indicators[side].setText(`${this.players[side]?.username} Score: ${this.players[side].score}`, settings.CGA_PINK);
      this.indicators[side].setColor(settings.CGA_BLACK);
    }

  }

  removePlayer(side: 'left' | 'right') {

    if (this.players[side]) {
      this.players[side] = null;
      this.indicators[side].setText("Waiting for left-side player...", settings.CGA_PINK);
      this.indicators[side].setColor(settings.CGA_BLACK);
    }

  }

  isSideReady(side: 'left' | 'right') {

    if (this.players[side])
      return this.players[side].ready;

  }

  isPlayerReady(id: number): boolean {

    if (this.players['left'] && this.players['left'].id === id)
      return this.players['left'].ready;

    if (this.players['right'] && this.players['right'].id === id)
      return this.players['right'].ready;

    return false;
  }

  getPongPlayer(side: 'left' | 'right'): PongPlayer | null {

    if (this.players[side])
      return this.players[side];

    return null;

  }

  getPlayerSide(player: Player): string | null {

    let position = player.getPosition();

    if (this.isPlayerAtLeft(position)) {
      return 'left';
    }
    else if (this.isPlayerAtRight(position)) {
      return 'right';
    }

    return null;

  }

  collidesWithPaddle(side: 'left' | 'right'): boolean {

    let ballPos = this.getLocalBallPosition(this.ball);
    let paddlePos = this.getLocalPaddlePosition(this.paddles[side]);
    let pHeight = (this.paddles[side].getPaddleHeight() / 2) * settings.TILESIZE;
    let pBegin = paddlePos.y - pHeight;
    let pEnd = paddlePos.y + pHeight;

    let offset: number = 0;
    if (side === 'right')
      offset = settings.TILESIZE * 4;

    if (ballPos.y > pBegin && ballPos.y < pEnd && isWithinRange(offset, ballPos.x, 2))
      return true;

    return false;

  }

  updateBall(position: Vector2) {

    this.ball.update(position);

  }

  updatePaddle(side: 'left' | 'right' | null, paddleY: number) {

    if (side !== null) {
      this.paddles[side].update(paddleY);
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
