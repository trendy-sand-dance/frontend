import { Sprite, Texture } from 'pixi.js';
import Point from '../utility/point.js';
import { mouse } from '../input/input.js';
import('htmx.org');

const tournamentInfoBox = document.getElementById("pixi-tournament-info");
const subscribeBtn = document.getElementById("joinTournamentBtn");
const unsubscribeBtn = document.getElementById("leaveTournamentBtn");

export default class TournamentSubscription {

  private subscriptionBox: Sprite;
  private server: WebSocket;
  private localPlayer: TournamentPlayer;

  constructor(x: number, y: number, server: WebSocket, localPlayer: TournamentPlayer, texture: Texture) {

    this.subscriptionBox = new Sprite(texture);
    this.server = server;
    this.localPlayer = localPlayer;

    this.subscriptionBox.interactive = true;
    this.subscriptionBox.on('pointerdown', async () => {

      if (tournamentInfoBox) {
        tournamentInfoBox.style.display = 'block';
        tournamentInfoBox.style.top = `${mouse.y + 10}px`
        tournamentInfoBox.style.left = `${mouse.x + 10}px`
        const temp = document.getElementById("infoCardTournament");
        if (temp)
          window.htmx.trigger(temp, 'customEvent', null)
      }

    });

    let p = new Point(x, y);
    console.log(this.server.url);

    this.subscriptionBox.x = p.asIsometric.x - 32;
    this.subscriptionBox.y = p.asIsometric.y - 32 * 2;

    if (subscribeBtn) {
      subscribeBtn.addEventListener("click", () => {

        this.subscribe();

      });
    }

    if (unsubscribeBtn) {
      unsubscribeBtn.addEventListener("click", () => {

        this.unsubscribe();

      });
    }
  }

  subscribe() {

    this.server.send(JSON.stringify({ type: "tournament_join", tournamentPlayer: this.localPlayer }))

  }

  unsubscribe() {

    this.server.send(JSON.stringify({ type: "tournament_leave", tournamentPlayer: this.localPlayer }))

  }

  getContext() {

    return this.subscriptionBox;

  }
}
