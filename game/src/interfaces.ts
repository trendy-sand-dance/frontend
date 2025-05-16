// import * as settings from './settings.js';
import Paddle from './paddle.js';
// import InfoBox from './infobox.js';
import Indicator from './indicator.js';

declare global {

  interface Window {
    __INITIAL_STATE__: UserData;
    __GAMESERVER_URL__: string;
    __FOCUSED_USER__: UserData;
    htmx: typeof import('htmx.org');
  }

  type KeyPressState = {
    [key: string]: boolean;
  }

  interface PongPlayers {
    left: PongPlayer | null,
    right: PongPlayer | null,
  }

  interface Paddles {
    left: Paddle,
    right: Paddle,
  }

  interface Indicators {
    left: Indicator,
    right: Indicator,
  }

  interface PongPlayer {
    id: number,
    username: string,
    paddleY: number,
    ready: boolean,
    score: number,
    side: string,
  }

  interface TournamentPlayer {
    id: number,
    username: string,
    avatar: string,
    wins: number,
    losses: number,
    local: boolean,
  }

  interface Vector2 {
    x: number;
    y: number;
  }

  interface ServerMessage {
    type: string,
    id?: number,
    username?: string,
    side?: string,
    avatar?: string,
    position?: Vector2,
    direction?: string,
    pongPlayer?: PongPlayer,
  }

  interface UserData {
    id: number,
    username: string,
    password: string,
    email: string,
    avatar: string,
    status: boolean,
    player: PlayerData
  }

  interface PlayerData {
    id: number,
    userId: number,
    x: number,
    y: number,
  }

  interface ServerPlayer { // Related to Player (on GameServer)
    id: number,
    username: string,
    avatar: string,
    x: number,
    y: number,
  }

}

export enum CameraMode {
  Locked,
  Free,
}

export enum PongState {
  Waiting,
  PlayerNearby,
  PlayerReady,
  InProgress,
}



