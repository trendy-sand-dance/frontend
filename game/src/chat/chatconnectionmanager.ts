import { initializeWebsocket } from "../gameserver/connectionmanager";
import { messageHandlers } from "./messagehandler";
import { MessageType } from "../interfaces";
import { RoomType } from "../interfaces";
import { localUser } from '../gameserver/connectionmanager';
import Chat from './chat';
import { playerManager } from "../player/playermanager";
import GameMap from '../map/gamemap';

export const chat = new Chat("text-input-chat", "send-button-chat");
export let chatSocket: WebSocket;

export function runChatConnectionManager(gameMap: GameMap) {

  chatSocket = initializeWebsocket(window.__GAMESERVER_URL__, "8004", "ws-chatserver");
  if (chatSocket) {
    console.info(`Sucessfully connected to the chat server ${chatSocket.url}`);
  }

  if (chat) {
    chat.bind(chatSocket, playerManager, gameMap.container);
  }

  chatSocket.onopen = (message: Event) => {

    console.log(message);
    const player = playerManager.getLocalPlayer();
    if (player) {
      const room: RoomType = player.getRegion();
      const msg: ConnectMessage = { type: MessageType.Connect, user: localUser, room: room };
      chatSocket.send(JSON.stringify(msg));
    }

  }

  chatSocket.onmessage = (message: MessageEvent) => {

    try {

      const data: ChatServerMessage = JSON.parse(message.data);
      const handler = messageHandlers[data.type];

      if (handler) {
        handler(data, chatSocket);
      }
      else {
        console.error(`Unhandled message type: ${data.type}`);
      }

    }
    catch (error) {

      console.error("Failed to process message: ", error);

    }

  };

  // We notify the server when a player suddenly quits the browser
  window.addEventListener("beforeunload", () => {
    console.log("Beforeunload: ");
  });


  chatSocket.onerror = (message) => {
    console.log("Websocket error: ", message);
  };

};


