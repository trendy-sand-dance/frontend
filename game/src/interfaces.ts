// import * as settings from './settings.js';

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

  interface PongPlayer {
    id: number,
    username: string,
    paddleY: number,
    ready: boolean,
    score: number,
    side: string,
  }

  interface Vector2 {
    x: number;
    y: number;
  }

  interface ServerMessage {
    type: string,
    id?: number,
    username?: string,
    avatar?: string,
    position?: Vector2,
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

export enum Side {
  Left,
  Right,
}

export enum CameraMode {
  Locked,
  Free,
}


