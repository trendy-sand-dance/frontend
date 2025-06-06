import Paddle from './pong/paddle.js';
import Indicator from './ui/indicator.js';
import MapRegion from './map/mapregion.js';

declare global {

  interface Window {
    __INITIAL_STATE__: UserData;
    __GAMESERVER_URL__: string;
    __USER_ID__: number;
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

  interface GameServerMessage {
    type: string,
    id?: number,
    username?: string,
    side?: string,
    avatar?: string,
    position?: Vector2,
    direction?: string,
    pongPlayer?: PongPlayer,
    tournament?: boolean,
  }

  type GameInviteMessage = {
    type: string,
    id: number,
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

  interface User {
    id: number,
    username: string,
    password?: string,
    email?: string,
    avatar: string,
    status: boolean,
    wins: number,
    losses: number,
    player: PlayerData,
  }


  interface MapRegions {
    bocal: MapRegion,
    game: MapRegion,
    cluster: MapRegion,
    server: MapRegion,
  }


  // Chat

  type ChatServerMessage = ConnectMessage | DisconnectMessage | TransitionMessage | RoomMessage | ChatMessage;

  type ConnectMessage = {
    type: string,
    user: User,
    room: RoomType,
  }

  type DisconnectMessage = {
    type: string,
    id: number,
  }

  type TransitionMessage = {
    type: string,
    id: number,
    from: RoomType,
    to: RoomType,
  }

  type RoomMessage = {
    type: string,
    id: number,
    message: string,
    timestamp: string,
    room: RoomType,
  }

  type ChatMessage = {
    type: string,
    fromId: number,
    toId: number,
    message: string,
    timestamp: string,
  }

}

// type ChatServerMessage = ConnectMessage | DisconnectMessage | TransitionMessage | RoomMessage | ChatMessage;

export enum MessageType {
  Connect = "connect",
  Disconnect = "disconnect",
  Transition = "transition",
  RoomChat = "room_chat",
  PersonalChat = "personal_chat",
}

export enum RoomType {
  Cluster = "cluster",
  Server = "server",
  Game = "game",
  Bocal = "bocal",
  Hall = "hall",
  Toilet = "toilet",
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
  Enrolling,
  Announcing,
}

export enum TournamentState {
  Enrolling = "Enrolling",
  Scheduling = "Scheduling",
  Announcing = "Announcing",
  Playing = "Playing",
  Concluding = "Concluding",
}


