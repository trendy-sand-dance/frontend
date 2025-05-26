import PlayerManager from "../playermanager.js";
import { MessageType, RoomType } from "../interfaces";

export default class Chat {

  private textInput : HTMLInputElement;
  private sendButton : HTMLButtonElement;
  private messages : string[] = [];
  private socket : WebSocket | null = null;

  public constructor(inputElementId : string, sendButtonElementId : string) {

    this.textInput = document.getElementById(inputElementId) as HTMLInputElement;
    if (this.textInput === null) {
      console.error("Couldn't get textInput for Chat");
    }
    this.sendButton = document.getElementById(sendButtonElementId) as HTMLButtonElement;
    if (this.sendButton === null) {
      console.error("Couldn't get sendButton for Chat");
    }


  }

  private getTextInput() : string | undefined{

    if (this.textInput) {
      return this.textInput.value;
    }

    return undefined;

  }

  public bind(chatServer : WebSocket, playerManager : PlayerManager) : void {

    this.socket = chatServer;

    this.sendButton.addEventListener("click", () => {

      const chatMessage = this.getTextInput();
      if (chatMessage) {
        this.textInput.value = "";
        this.messages.push(chatMessage);


        while (this.messages.length != 0) {
          const message = this.messages.pop();
          const player = playerManager.getLocalPlayer();
          if (player && this.socket && message) {
            // TODO: Write function to determine which room the player is and whether it's a PM or a RM
            const roomMessage : RoomMessage = {type: MessageType.RoomChat, id: player.getId(), message: message, timestamp: new Date().toLocaleString(), room: RoomType.Hall};
            this.socket.send(JSON.stringify(roomMessage));
          }
        }

      }

    });

  }

}
