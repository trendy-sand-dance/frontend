import { Application, Assets, Container, Ticker, Texture, Filter, Graphics, GlProgram } from "pixi.js";
import { playerManager } from './player/playermanager.js';
import { addGameMap } from './map/gamemap.js';
import GameMap from './map/gamemap.js';
import * as settings from './settings.js';
import * as mouse from './input/mouse-interaction.js';
import * as input from './input/input.js';
import * as gameCM from './gameserver/gameconnectionmanager.js';
import * as chatCM from './chat/chatconnectionmanager.js';
import PongTable from './pong/pongtable.js';
import Point from './utility/point.js';
import Player from './player/player.js';
import Invitation from "./ui/invitation.js";
import { PongState, CameraMode, RoomType, MessageType } from './interfaces.js';
import TournamentSubscription from "./pong/tournamentsubscription.js";
import { gameSocket } from './gameserver/gameconnectionmanager.js'
import { chatSocket } from './chat/chatconnectionmanager.js';
import { fragmentShader, vertexShader } from "./shaders/shaders.js";
import { lerpNumber } from "./utility/lerp.js";

// Globals
const pixiApp: Application = new Application();
let prevPos: Vector2 = { x: 0, y: 0 };
export let localPlayerPos: Point = new Point(0, 0);
let isGameFocused = true;
let screenShake = false;
let cameraMode: CameraMode = CameraMode.Locked;
export let uiContainer = new Container();

async function preload() {

  const assets = [

    // Player Assets
    { alias: 'player_spritesheet', src: '/assets/player_spritesheet.json' },

    // Props
    { alias: 'floppy_paddle', src: '/assets/floppy_paddle.png' },
    { alias: 'pong_net', src: '/assets/pong_net.png' },
    { alias: 'cardboard_blackhole', src: '/assets/cardboard_blackhole.png' },
    { alias: 'tv_tournament', src: '/assets/tv_tournament.png' },

    // Overlay
    { alias: 'overlay', src: '/assets/overlay.png' },

    // Map Assets
    { alias: 'block_empty_black', src: '/assets/block_empty_black.png' },
    { alias: 'block_empty_white', src: '/assets/block_empty_white.png' },
    { alias: 'block_opaque_coloured', src: '/assets/block_opaque_coloured.png' },
    { alias: 'block_opaque_white', src: '/assets/block_opaque_white.png' },
    { alias: 'block_half_opaque_coloured', src: '/assets/block_half_opaque_coloured.png' },

  ];

  await Assets.load(assets);
}

async function setup() {

  const container = document.getElementById("pixi-container");
  if (container) {

    const canvas = document.getElementById("pixi-canvas");

    if (canvas)
      canvas.remove();

    await pixiApp.init({ background: settings.CGA_BLACK, resizeTo: container });
    container.appendChild(pixiApp.canvas);
    pixiApp.canvas.setAttribute("id", "pixi-canvas");

  }

  pixiApp.stage.eventMode = 'static';
  pixiApp.stage.hitArea = pixiApp.screen;


  // Disables controls when game is not focused
  const textInput = document.getElementById('text-input-chat');
  if (textInput) {

    textInput.addEventListener('blur', () => {
      isGameFocused = true;
    })

    textInput.addEventListener('focus', () => {
      isGameFocused = false;
    })

  }

  // Setup Map Zoom Callback
  mouse.setupMapZoom();

  // Setting up UI container
  uiContainer.position.set(0, 0);
  uiContainer.zIndex = 100000;
  uiContainer.label = "ui";
  pixiApp.stage.addChild(uiContainer);

  console.log("Pixi app initialized:", pixiApp);
}

function joinOrLeavePongTable(player: Player, pongTable: PongTable) {

  const side = pongTable.getPlayerSide(player) as 'left' | 'right';

  if (side === null) {
    return;
  }
  else {

    const newPlayer: PongPlayer = { id: player.getId(), username: player.getUsername(), paddleY: 1, ready: false, score: 0, side: side };

    if (!pongTable.isSideReady(side)) {
      gameCM.sendToServer(gameSocket, { type: "join_pong", pongPlayer: newPlayer });
    }
    else {
      const existingPlayer: PongPlayer | null = pongTable.getPongPlayer(side);
      if (existingPlayer && existingPlayer.id !== player.id) {
        alert("There's already another player at the table!");
      }
      else if (existingPlayer) {
        gameCM.sendToServer(gameSocket, { type: "leave_pong", pongPlayer: existingPlayer });
      }
    }

  }

}


function joinOrLeaveTournamentTable(tournamentTable: PongTable, player: Player) {

  const side = tournamentTable.getPlayerSide(player) as 'left' | 'right';

  if (side === null) {
    return;
  }
  else {
    if (tournamentTable.isExpectedTournamentPlayer(player, side)) {

      const newPlayer: PongPlayer = { id: player.getId(), username: player.getUsername(), paddleY: 1, ready: false, score: 0, side: side };

      if (!tournamentTable.isSideReady(side)) {
        gameCM.sendToServer(gameSocket, { type: "join_pong_tournament", pongPlayer: newPlayer });
      }
      else {
        const existingPlayer: PongPlayer | null = tournamentTable.getPongPlayer(side);
        if (existingPlayer && existingPlayer.id !== player.id) {
          alert("There's already another player at the table!");
        }
        else if (existingPlayer) {
          gameCM.sendToServer(gameSocket, { type: "leave_pong_tournament", pongPlayer: existingPlayer });
        }
      }

    }

  }

}

function handlePongUI(pongTable: PongTable, player: Player) {

  if (pongTable.isInProgress()) {
    pongTable.setIndicator('left', PongState.InProgress);
    pongTable.setIndicator('right', PongState.InProgress);
  }
  else if (!pongTable.isPlayerReady(player.id)) {

    if (pongTable.isPlayerAtLeft(player.getPosition()) && !pongTable.isSideReady('left')) {
      pongTable.setIndicator('left', PongState.PlayerNearby);
    }
    else if (!pongTable.isSideReady('left')) {
      pongTable.setIndicator('left', PongState.Waiting);
    }

    if (pongTable.isPlayerAtRight(player.getPosition()) && !pongTable.isSideReady('right')) {
      pongTable.setIndicator('right', PongState.PlayerNearby);
    }
    else if (!pongTable.isSideReady('right')) {
      pongTable.setIndicator('right', PongState.Waiting);
    }

  }

  // Pong join table
  if (input.keyWasPressed['KeyE']) {
    joinOrLeavePongTable(player, pongTable);
  }


  pongTable.displayPongState();

}


function handleTournamentUI(tournamentTable: PongTable, player: Player) {

  if (tournamentTable.isInProgress()) {
    tournamentTable.setIndicator('left', PongState.InProgress);
    tournamentTable.setIndicator('right', PongState.InProgress);
  }
  else if (!tournamentTable.isPlayerReady(player.id)) {

    if (tournamentTable.isPlayerAtLeft(player.getPosition()) && !tournamentTable.isSideReady('left')) {
      tournamentTable.setIndicator('left', PongState.PlayerNearby);
    }
    else if (!tournamentTable.isSideReady('left')) {
      tournamentTable.setIndicator('left', PongState.Announcing);
    }

    if (tournamentTable.isPlayerAtRight(player.getPosition()) && !tournamentTable.isSideReady('right')) {
      tournamentTable.setIndicator('right', PongState.PlayerNearby);
    }
    else if (!tournamentTable.isSideReady('right')) {
      tournamentTable.setIndicator('right', PongState.Announcing);
    }

  }

  // tournament join table
  if (input.keyWasPressed['KeyE']) {
    joinOrLeaveTournamentTable(tournamentTable, player);
  }

  tournamentTable.displayPongState();


}

function handleCamera(player: Player, gameMap: GameMap) {

  if (cameraMode === CameraMode.Locked) {
    let p = player.getPoint();

    localPlayerPos.update({ x: p.asCartesian.x, y: p.asCartesian.y });

    const stageScale = pixiApp.stage.scale.x;
    const adjustedScreenCenterX = (pixiApp.screen.width / 2 - pixiApp.stage.x) / stageScale;
    const adjustedScreenCenterY = (pixiApp.screen.height / 2 - pixiApp.stage.y) / stageScale;

    gameMap.container.x = -p.asIsometric.x + adjustedScreenCenterX;
    gameMap.container.y = -p.asIsometric.y + adjustedScreenCenterY;
  }
  else {
    mouse.moveMapWithMouse(input.mouse, gameMap, isGameFocused);
  }

  // Switch camera mode
  if (input.keyWasPressed['KeyC'] && isGameFocused) {
    cameraMode = input.switchCameraMode(cameraMode);
  }


}

function handleChatBubbles(time: Ticker): void {

  const bubbles = chatCM.chat.getChatBubbles();
  for (const b of bubbles) {

    if (!b.dead()) {
      b.float(time);
    }
    else {
      chatCM.chat.destroyBubble(b);
    }

  }

}

function handleScreenshake(table: PongTable, side: 'left' | 'right', driver: number): void {
  if (!table.isInProgress())
    return;

  if (table.collidesWithPaddle(side) && !screenShake) {

    screenShake = true;
    setTimeout(() => {
      screenShake = false;
    }, 200)

  }

  if (screenShake) {
    pixiApp.stage.x += Math.sin(driver);
  }

}

function playerHasMoved(prevPos: Vector2, playerPos: Vector2): boolean {

  return prevPos.x != playerPos.x || prevPos.y != playerPos.y;

}

let transitionTimer = 0;
let fade: boolean = false;
let previousRoom: RoomType | null = null;
let currentRoom: RoomType | null = null;


function fadeRoom(ticker: Ticker) {

  if (fade && previousRoom !== null && currentRoom !== null) {
    transitionTimer += ticker.deltaTime * 0.05;
    const alpha = lerpNumber(0, 1, transitionTimer);
    gameMap.setRegionOpacity(currentRoom, alpha);
    gameMap.setRegionOpacity(previousRoom, 1 - alpha);
    if (alpha >= 1) {
      fade = false;
      transitionTimer = 0;
      previousRoom = null;
      currentRoom = null;
    }
  }

}

function broadcastPositionUpdates(player: Player) {

  //Broadcast new position
  const pos: Vector2 = player.getPosition();
  const id: number = player.getId();

  if (playerHasMoved(prevPos, pos)) {

    const newRoom: RoomType = gameMap.getMapRegion(pos);
    const oldRoom: RoomType = player.getRegion();

    if (oldRoom != newRoom) {
      currentRoom = newRoom;
      previousRoom = oldRoom;
      gameMap.setRegionRenderable(oldRoom, false);
      gameMap.setRegionRenderable(newRoom, true);
      gameMap.setRegionOpacity(oldRoom, 1);
      gameMap.setRegionOpacity(newRoom, 0);
      gameMap.removeFromRoomContainer(oldRoom, player.getContext());
      gameMap.addToRoomContainer(newRoom, player.getContext());
      fade = true;
      player.setRegion(newRoom);

      if (!window.__DEV__) {
        const transitionMessage: TransitionMessage = { type: MessageType.Transition, id, from: oldRoom, to: newRoom };
        if (chatSocket.readyState === 1 || chatSocket.readyState === WebSocket.OPEN) {
          chatSocket.send(JSON.stringify(transitionMessage));
        }
      }
    }

    if (!window.__DEV__) {
      gameCM.sendToServer(gameSocket, {
        type: "player_move",
        id: player.getId(),
        position: player.getPosition(),
      });
    }

  }


}

function isAtTable(id: number, table: PongTable) {

  if (table.getPongPlayer('left') && table.getPongPlayer('right'))
    return table.getPongPlayer('left')!.id === id || table.getPongPlayer('right')!.id === id
  return false;

}

function handleInvites(time: Ticker, invites: Invitation[]): void {

  for (const invite of invites) {

    if (!invite.dead()) {
      invite.animate(time);
    } else {
      invite.destroy();
      playerManager.removeInvite(invite);
    }

  }

}




export let gameMap: GameMap;

(async () => {

  await setup();
  await preload();

  // Dithering
  const customFilter = new Filter({
    glProgram: new GlProgram({
      fragment: fragmentShader,
      vertex: vertexShader,
    }),
    resources: {
      timeUniforms: {
        uWidth: { value: pixiApp.screen.width, type: 'f32' },
        uHeight: { value: pixiApp.screen.height, type: 'f32' }
      }
    }
  });
  pixiApp.stage.filters = [customFilter];
  pixiApp.stage.addChild(new Graphics().rect(-500, -500, 3500, 3500).fill(settings.CGA_CYAN_DARK_BG));

  // Initialize map and add to pixi.stage
  gameMap = addGameMap(pixiApp);

  // Setup Culling for optimized rendering of the map
  gameMap.container.cullable = true;
  gameMap.container.cullableChildren = true;

  //Network business
  if (window.__USER_ID__ && !window.__DEV__) {
    await gameCM.runGameConnectionManager(gameMap);
    chatCM.runChatConnectionManager(gameMap);

    // Testing tournamentSubscription box
    let p = playerManager.getLocalPlayer();
    if (p) {
      let tournamentBox = new TournamentSubscription(28.5, 1, gameSocket, { id: p.id, username: p.getUsername(), avatar: p.getAvatar(), wins: 0, losses: 0, local: false }, Texture.from('tv_tournament'));
      const context = tournamentBox.getContext();
      context.zIndex = 10000;
      gameMap.addToRoomContainer(RoomType.Hall, context);
      const room = gameMap.getMapRegion(p.getPosition());
      gameMap.setRegionRenderable(room, true);
      gameMap.setRegionOpacity(room, 1);
    }
  }
  else {
    gameCM.initializeLocalPlayer({
      id: 420,
      username: "dev",
      avatar: "none",
      status: true,
      wins: 0,
      losses: 0,
      player: {
        id: 420,
        userId: 420,
        x: 37,
        y: 18,
      }
    }, gameMap)
  }


  // Testing Pong table
  let pongTable = new PongTable({ x: 37, y: 15 }, settings.TILEMAP, false);
  const pongTableContainer = pongTable.getContainer();
  pongTableContainer.zIndex = 10000;
  gameMap.addToRoomContainer(RoomType.Hall, pongTableContainer);
  playerManager.initPongTable(pongTable);

  // Testing tournament table
  let tournamentTable = new PongTable({ x: 27, y: 2 }, settings.TILEMAP, true);
  const tournamentTableContainer = tournamentTable.getContainer();
  tournamentTableContainer.zIndex = 10000;
  gameMap.addToRoomContainer(RoomType.Hall, tournamentTableContainer);
  playerManager.initTournamentTable(tournamentTable);


  const player = playerManager.getLocalPlayer();
  let driver: number = 0;

  //Game Loop
  pixiApp.ticker.add((time: Ticker) => {

    customFilter.resources.timeUniforms.uniforms.uWidth = pixiApp.screen.width;
    customFilter.resources.timeUniforms.uniforms.uHeight = pixiApp.screen.height;;

    if (player) {

      fadeRoom(time);
      handleCamera(player, gameMap);
      handlePongUI(pongTable, player);
      handleTournamentUI(tournamentTable, player);
      handleChatBubbles(time);
      handleInvites(time, playerManager.getInvites());

      // Move around
      if (!pongTable.isPlayerReady(player.id) && !tournamentTable.isPlayerReady(player.id)) {

        input.movePlayer(player, time.deltaTime, isGameFocused);
        broadcastPositionUpdates(player);

      }
      else { // We're in a 1v1 or Tournament game

        if (isAtTable(player.id, tournamentTable)) {

          const side = tournamentTable.getPlayerSide(player) as 'left' | 'right';
          tournamentTable.sendPaddleUpdate(input.keyIsPressed, side);
          handleScreenshake(tournamentTable, side, driver);

        }
        else {

          const side = pongTable.getPlayerSide(player) as 'left' | 'right';
          pongTable.sendPaddleUpdate(input.keyIsPressed, side);
          handleScreenshake(pongTable, side, driver);

        }

      }
      prevPos = player.getPosition();
    }

    driver += time.deltaTime;
    input.resetKeyStates(input.keyWasPressed);
  });

})();

export { pixiApp };
