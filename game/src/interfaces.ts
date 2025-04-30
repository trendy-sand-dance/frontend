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

  interface PongGame { 
    table: number,
    started: boolean,
    ball: Vector2,
    startTimer: number,
    playerOne?: {
      id: number,
      paddleY: number,
      ready: boolean,
    },
    playerTwo?: {
      id: number,
      paddleY: number,
      ready: boolean,
    },
  }

  interface Vector2 {
    x: number;
    y: number;
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

}


