import { initializeWebsocket } from "../connectionmanager";
import { messageHandlers } from "./messagehandler";
import { MessageType } from "../interfaces";
import { RoomType } from "../interfaces";
import { localUser } from '../connectionmanager';
import Chat from './chat';
import { playerManager } from "../playermanager";
import GameMap from '../gamemap';

export const chat = new Chat("text-input-chat", "send-button-chat");

export function runChatConnectionManager(gameMap : GameMap) {

  const chatSocket = initializeWebsocket(window.__GAMESERVER_URL__, "8004", "ws-chatserver");

  if (chat) {
    console.log("Initialized Chat object");
    chat.bind(chatSocket, playerManager, gameMap.container);
  }

  chatSocket.onopen = (message : Event) => {

    console.log("onopen message: ", message);
    const msg : ConnectMessage = {type: MessageType.Connect, user: localUser, room: RoomType.Hall};
    chatSocket.send(JSON.stringify(msg));

  }

  chatSocket.onmessage = (message: MessageEvent) => {

    try {

      const data: ChatServerMessage = JSON.parse(message.data);
      console.log("Message: ", data);
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


