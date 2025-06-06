import { Texture, Container, Graphics, Sprite } from 'pixi.js';
import Ball from './ball.js';
import Point from '../utility/point.js';
import Paddle from './paddle.js';
import Indicator from '../ui/indicator.js';
import Player from '../player/player.js';
import * as cm from '../gameserver/connectionmanager.ts'
import * as settings from '../settings.js';
import { PongState, TournamentState } from '../interfaces.js';
import { gameSocket } from '../gameserver/connectionmanager.ts';
import TextBox from '../ui/textbox.js';

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
  private indicators: Indicators = { left: new Indicator(12, 0, 0), right: new Indicator(12, settings.TILESIZE * 4, settings.TILESIZE * 2) };

  private countdownTimer: TextBox = new TextBox('3', 24, settings.TILESIZE * 2, 0);

  private net: Sprite;

  private inProgress: boolean = false;

  // State in case of tournament
  private isTournament: boolean = false;
  private state: TournamentState = TournamentState.Enrolling;
  private expectedTournamentPlayers: PongPlayers = { left: null, right: null };


  constructor(position: Vector2, parentMap: number[][], isTournament: boolean) {
    this.isTournament = isTournament;
    this.worldPosition = position;

    // Construct a sub-array from the parent map (4x2)
    let x = Math.round(position.x);
    let y = Math.round(position.y);

    this.tableGrid = slice2DArray(parentMap, x, x + 2, y, y + 2);

    this.ball = new Ball({ x: 2, y: 1 });

    // Give PongTable position in world
    let point = new Point(this.worldPosition.x, this.worldPosition.y);
    this.container.x += point.asIsometric.x;
    this.container.y += point.asIsometric.y;

    // Net sprit
    const texture = Texture.from('pong_net');
    this.net = new Sprite(texture);
    this.net.x -= 16;
    this.net.y += 32;

    // Add containers/graphics to main container
    this.countdownTimer.container.renderable = false;
    this.container.addChild(this.net);
    this.container.addChild(this.ball.getContext());
    this.container.addChild(this.indicators['left'].getContainer());
    this.container.addChild(this.indicators['right'].getContainer());
    this.container.addChild(this.countdownTimer.getContainer());
    this.container.addChild(this.paddles['left'].getGraphics());
    this.container.addChild(this.paddles['right'].getGraphics());

    this.container.y -= this.tableGrid[0][0] * settings.TILESIZE / 2; // Compensate height for elevated tiles
    // this.container.zIndex = 10;

  }

  transitionTo(newState: TournamentState) {

    console.log(`Transitioning from ${this.state} to ${newState}`);
    this.state = newState;

  }

  setCountdownTimer(seconds: number) {

    if (seconds === -1) {
      this.countdownTimer.container.renderable = false;
    }
    else {
      this.countdownTimer.container.renderable = true;
      this.countdownTimer.setText(`Starting in: ${seconds}`);
      this.countdownTimer.setTextColor(settings.CGA_WHITE);
      this.countdownTimer.update();
    }

  }

  isPlayerAtLeft(position: Vector2): boolean {

    let playerPos = { x: Math.ceil(position.x), y: Math.ceil(position.y) };

    if (playerPos.x === Math.ceil(this.worldPosition.x - 1) && playerPos.y === Math.ceil(this.worldPosition.y)
      || playerPos.x === Math.ceil(this.worldPosition.x - 1) && playerPos.y === Math.ceil(this.worldPosition.y + 1)) {
      return true;
    }

    return false;
  }

  isPlayerAtRight(position: Vector2): boolean {

    let playerPos = { x: Math.ceil(position.x), y: Math.ceil(position.y) };

    if (playerPos.x === Math.ceil(this.worldPosition.x + 4) && playerPos.y === Math.ceil(this.worldPosition.y)
      || playerPos.x === Math.ceil(this.worldPosition.x + 4) && playerPos.y === Math.ceil(this.worldPosition.y + 1)) {
      return true;
    }

    return false;

  }

  setPlayerReady(player: Player, side: 'left' | 'right') {

    if (!this.players[side]) {
      this.players[side] = { id: player.getId(), username: player.getUsername(), paddleY: 32, ready: true, score: 0, side: side };
      this.indicators[side].setPongPlayer(this.players[side]);
      this.indicators[side].setState(PongState.PlayerReady);
    }

  }

  setExpectedTournamentPlayers(left: Player, right: Player): void {

    this.expectedTournamentPlayers['left'] = { id: left.getId(), username: left.getUsername(), paddleY: 32, ready: false, score: 0, side: 'left' };
    this.expectedTournamentPlayers['right'] = { id: right.getId(), username: right.getUsername(), paddleY: 32, ready: false, score: 0, side: 'right' };

    this.indicators['left'].setPongPlayer(this.expectedTournamentPlayers['left']);
    this.indicators['right'].setPongPlayer(this.expectedTournamentPlayers['right']);

    if (!this.players['left'])
      this.indicators['left'].setState(PongState.Announcing);
    if (!this.players['right'])
      this.indicators['right'].setState(PongState.Announcing);

  }

  isExpectedTournamentPlayer(player: Player, side: 'left' | 'right'): boolean {

    if (this.expectedTournamentPlayers[side]) {
      return player.getId() === this.expectedTournamentPlayers[side].id;
    }

    return false;

  }

  setIndicator(side: 'left' | 'right' | null, state: PongState) {

    if (side === null) {
      return;
    }

    this.indicators[side].setState(state);

  }

  displayPongState() {

    this.indicators['left'].display();
    this.indicators['right'].display();

  }

  startGame() {


    if (!this.inProgress) {
      this.indicators['left'].setState(PongState.InProgress);
      this.indicators['right'].setState(PongState.InProgress);
    }

    this.inProgress = true;

  }

  stopGame() {

    if (this.inProgress) {
      this.indicators['left'].setState(PongState.Waiting);
      this.indicators['right'].setState(PongState.Waiting);
    }

    this.players['left'] = null;
    this.players['right'] = null;

    this.inProgress = false;
    this.countdownTimer.container.renderable = false;

  }

  finishGame(winnerId: number, finals: boolean) {

    this.countdownTimer.container.renderable = true;

    if (this.players['left'] && this.players['right']) {

      const min = Math.min(this.players['left'].score, this.players['right'].score);
      const max = Math.max(this.players['left'].score, this.players['right'].score);

      if (this.players['left'].id === winnerId) {
        this.countdownTimer.setTextColor(settings.CGA_WHITE);
        if (finals)
          this.countdownTimer.setText(`${this.players['left'].username} has won the tournament!`);
        else
          this.countdownTimer.setText(`${this.players['left'].username} has won with ${max} - ${min}!`);
      }
      else {
        this.countdownTimer.setTextColor(settings.CGA_WHITE);
        if (finals)
          this.countdownTimer.setText(`${this.players['right'].username} has won the tournament!`);
        else
          this.countdownTimer.setText(`${this.players['right'].username} has won with ${max} - ${min}!`);
      }

      setTimeout(() => {
        this.countdownTimer.container.renderable = false;
      }, 2000)

    }

    this.players['left'] = null;
    this.players['right'] = null;
    this.expectedTournamentPlayers['left'] = null;
    this.expectedTournamentPlayers['right'] = null;
    this.inProgress = false;

  }

  isInProgress() {

    return this.inProgress;

  }

  updateScore(side: 'left' | 'right', score: number) {

    console.log("Updating score on side: ", side);
    console.log("This concerns player: ", this.players[side]);

    if (this.players[side]) {
      this.players[side].score = score;
      this.indicators[side].setPongPlayer(this.players[side]);
    }

  }

  removePlayer(side: 'left' | 'right') {

    if (this.players[side]) {
      this.players['left'] = null;
      this.players['right'] = null;
      this.indicators['left'].setState(PongState.Waiting);
      this.indicators['right'].setState(PongState.Waiting);
      this.inProgress = false;
      this.countdownTimer.container.renderable = false;
    }

  }

  sendPaddleUpdate(keyIsPressed: KeyPressState, side: 'left' | 'right') {

    if (side !== null && keyIsPressed['ArrowUp']) {
      console.log("We are sending up");
      cm.sendToServer(gameSocket, {
        type: "paddle_move",
        side: side,
        direction: "up",
        tournament: this.isTournament,
      });
    }

    if (side !== null && keyIsPressed['ArrowDown']) {
      console.log("We are sending down");
      cm.sendToServer(gameSocket, {
        type: "paddle_move",
        side: side,
        direction: "down",
        tournament: this.isTournament,
      });
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

    if (ballPos.y > pBegin && ballPos.y < pEnd && isWithinRange(offset, ballPos.x, 1.5))
      return true;

    return false;

  }

  updateBall(position: Vector2) {

    this.ball.update(position);

  }

  updatePaddle(side: 'left' | 'right' | null, paddleY: number) {

    if (side !== null) {

      this.paddles[side].update(paddleY);

      console.log("updatePaddleY client: ", this.paddles[side].getPaddleHeight());
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

  getBallContext(): Graphics {

    return this.ball.getContext();

  }

}
