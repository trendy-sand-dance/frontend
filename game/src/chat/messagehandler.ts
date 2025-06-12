import { chat } from './chatconnectionmanager';
import { playerManager } from '../player/playermanager';
import { gameMap } from '../main';

// Message Handler
type MessageHandler = (data: ChatServerMessage, server: WebSocket) => void;

export const messageHandlers: Record<string, MessageHandler> = {

  "connect": (data: ChatServerMessage, server: WebSocket) => {
    const msg: ConnectMessage = data as ConnectMessage;
    if (msg) {
      console.log("Sucessfully created a session on the chat server", msg);
    }
    else {
      console.log("Couldn't create a session on the chat server :(");
    }
    server.send(`${server.url} connected`);
  },
  "confirm": (data: ChatServerMessage, server: WebSocket) => {
    console.log(`MessageHandler: ${data.type}, from ${server.url}`);
  },
  // "disconnect": (data: ChatServerMessage, server: WebSocket) => {
  //   const msg: DisconnectMessage = data as DisconnectMessage;
  // },
  "room_chat": (data: ChatServerMessage, server: WebSocket) => {
    console.log(`RoomChat message from ${server.url}`);
    const msg: RoomMessage = data as RoomMessage;
    chat.createChatBubble(msg, playerManager, gameMap.container);
    console.log(msg);
  },

};


