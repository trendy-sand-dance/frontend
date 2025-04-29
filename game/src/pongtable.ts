import {Container } from 'pixi.js';
import Ball from './ball.js';
import * as settings from './settings.js';


export default class PongTable 
{
  private container = new Container();
  private tableGrid : number[][] = [];
  private tableWidth : number;
  private tableHeight : number;
  private worldPosition : Vector2; //4x2
  private ball : Ball;

  constructor (position : Vector2, parentMap : number[][]) {
    this.worldPosition = position;
    this.tableWidth = 4 * settings.TILESIZE;
    this.tableHeight = 2 * settings.TILESIZE;

    // Construct a sub-array from the parent map (4x2)
    this.tableGrid = parentMap.slice(position.x, position.x + 4).map(i => i.slice(position.y, position.y + 2)); //4x2
    this.ball = new Ball({x: 2, y: 1});
    this.container.addChild(this.ball.getContext());
  }

  updateBall(deltaTime: number) {
    let localBallPos = this.getLocalBallPosition(this.ball);

    if (localBallPos.x < 0 || localBallPos.x > this.tableWidth) { // Flip x dir
      this.ball.bounceX();
    }

    if (localBallPos.y < 0 || localBallPos.y > this.tableHeight) { // Flip y dir
      this.ball.bounceY();
    }

    this.ball.move(deltaTime);
  }

  getLocalBallPosition(ball : Ball) : Vector2 {
    let pos = ball.getPoint().asCartesian;
    return {x: pos.x * settings.TILESIZE, y: pos.y * settings.TILESIZE};
  }
  
  getContainer() : Container {
    return this.container;
  }

}
