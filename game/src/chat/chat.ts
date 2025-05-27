import { Container} from 'pixi.js';
import PlayerManager from "../playermanager.js";
import ChatBubble from '../chat/chatbubble.js';
import { MessageType, RoomType } from "../interfaces";

export default class Chat {

  private textInput : HTMLInputElement;
  private sendButton : HTMLButtonElement;
  // private messages : string[] = [];
  private chatBubbles : ChatBubble[] = [];
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

  public bind(chatServer : WebSocket, playerManager : PlayerManager, mapContainer : Container) : void {

    this.socket = chatServer;

    this.sendButton.addEventListener("click", () => {

      const chatMessage = this.getTextInput();

      if (chatMessage) {

        const player = playerManager.getLocalPlayer();

        if (player && this.socket) {
          // TODO: Write function to determine which room the player is and whether it's a PM or a RM
          const roomMessage : RoomMessage = {type: MessageType.RoomChat, id: player.getId(), message: chatMessage, timestamp: new Date().toLocaleString(), room: RoomType.Hall};
          this.socket.send(JSON.stringify(roomMessage));
          const b = new ChatBubble(player, chatMessage, 20);
          this.chatBubbles.push(b);
          mapContainer.addChild(b.getContainer());
          console.log("We pushing");
        }

      }

      this.textInput.value = "";

    });

  }

  public getChatBubbles() : ChatBubble[] {

    return this.chatBubbles;

  }

  public destroyBubble(bubble : ChatBubble) : void {

    const index = this.chatBubbles.indexOf(bubble);
    if (index !== -1) {

      bubble.destroy();
      this.chatBubbles.splice(index, 1);

    }

  }

  public availableChatBubbles() : boolean {

    return this.chatBubbles.length > 0;

  }

  public popChatBubble() : ChatBubble | undefined {

    return this.chatBubbles.pop();

  }

}
