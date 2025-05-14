import { FederatedPointerEvent, Sprite, Texture } from 'pixi.js';
import Player from './player';
import Point from './point.js';

export default class TournamentSubscription {

  private subscriptionBox : Sprite;
  private players : PongPlayer[] = [];
  private server : WebSocket;
  private player : Player;

  constructor(x: number, y: number, server : WebSocket, player : Player, texture : Texture) {

    this.subscriptionBox = new Sprite(texture);
    this.server = server;
    this.player = player;

    this.subscriptionBox.interactive = true;
    this.subscriptionBox.on('pointerdown', async (event : FederatedPointerEvent) => {

      if (event.button === 0) {
        this.subscribe();
      }

      if (event.button == 2) {
        this.unsubscribe();
      }

    });

    let p = new Point(x, y);

    this.subscriptionBox.x = p.asIsometric.x;
    this.subscriptionBox.y = p.asIsometric.y + 32;


  }

  subscribe() {

    alert("Subscribing...");
    const localPongPlayer : PongPlayer = {id: this.player.id, username: this.player.getUsername(), paddleY: 0, ready: false, score: 0, side: ""};
    this.server.send(JSON.stringify({type: "tournament_join", pongPlayer: localPongPlayer }))
    if (this.players.length > 1) 
      console.log("JO");

  }

  unsubscribe() {

    alert("Unsubscribing...");
    const localPongPlayer : PongPlayer = {id: this.player.id, username: this.player.getUsername(), paddleY: 0, ready: false, score: 0, side: ""};
    this.server.send(JSON.stringify({type: "tournament_leave", pongPlayer: localPongPlayer }))

  }

  getContext() {

    return this.subscriptionBox;

  }
}
