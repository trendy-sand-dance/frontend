import { initializeWebsocket } from "../connectionmanager";

class MessageHandler {
  static #instance: MessageHandler;
  private _socket: WebSocket;

  private constructor() {
    this._socket = initializeWebsocket(window.__GAMESERVER_URL__, "8004", "ws-chatserver");
  }

  public static get instance(): MessageHandler {
    if (!MessageHandler.#instance) {
      MessageHandler.#instance = new MessageHandler();
    }

    return MessageHandler.#instance;
  }

  public get socket(): WebSocket {

    return this._socket;

  }

  public initialize(): void {

    this._socket.onmessage = (message) => {
      const data = JSON.parse(message.data);
      console.log("On message: ", data);
    };

    // We notify the server when a player suddenly quits the browser
    window.addEventListener("beforeunload", () => {
      console.log("Beforeunload: ");
    });

    this._socket.onerror = (message) => {
      console.log("Websocket error: ", message);
    };

  }

  public send(message: ChatServerMessage): void {

    if (this._socket.readyState == WebSocket.OPEN) {
      this._socket.send(JSON.stringify(message));
    }
    else {
      console.error("Error sending ChatServerMessage to chat server");
    }

  }

}

export let messageHandler = MessageHandler.instance;

