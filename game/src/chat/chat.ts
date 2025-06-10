import { Container } from 'pixi.js';
import PlayerManager from "../player/playermanager.js";
import ChatBubble from '../chat/chatbubble.js';
import { MessageType } from "../interfaces";

export default class Chat {

  private textInput: HTMLInputElement;
  private sendButton: HTMLButtonElement;
  // private chatDisplay: HTMLElement;
  // private messages : string[] = [];
  private chatBubbles: ChatBubble[] = [];
  private socket: WebSocket | null = null;
  private bubbleSize: number = 20;

  public constructor(inputElementId: string, sendButtonElementId: string) {

    this.textInput = document.getElementById(inputElementId) as HTMLInputElement;
    if (this.textInput === null) {
      console.error("Couldn't get textInput for Chat");
    }
    this.sendButton = document.getElementById(sendButtonElementId) as HTMLButtonElement;
    if (this.sendButton === null) {
      console.error("Couldn't get sendButton for Chat");
    }
    // this.chatDisplay = document.getElementById("chat-message-display") as HTMLElement;
    // if (this.chatDisplay === null) {
    //   console.error("Couldn't get chatDisplay for Chat");
    // }

  }

  private getTextInput(): string | undefined {

    if (this.textInput) {
      return this.textInput.value;
    }

    return undefined;

  }

  private handleTextInput(playerManager: PlayerManager, mapContainer: Container): void {

    const chatMessage = this.getTextInput();

    if (chatMessage) {

      const player = playerManager.getLocalPlayer();

      if (player && this.socket) {
        // TODO: Write function to determine which room the player is and whether it's a PM or a RM
        const roomMessage: RoomMessage = { type: MessageType.RoomChat, id: player.getId(), message: chatMessage, timestamp: new Date().toLocaleString(), room: player.getRegion() };
        this.socket.send(JSON.stringify(roomMessage));
        const b = new ChatBubble(player, chatMessage, this.bubbleSize);
        this.chatBubbles.push(b);
        mapContainer.addChild(b.getContainer());
        console.log("We pushing");
      }

    }

    this.textInput.value = "";

  }

  public bind(chatServer: WebSocket, playerManager: PlayerManager, mapContainer: Container): void {

    this.socket = chatServer;

    this.sendButton.addEventListener("click", () => {
      this.handleTextInput(playerManager, mapContainer);
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === 'Enter') {
        this.handleTextInput(playerManager, mapContainer);
      }
    });

  }

  public createChatBubble(message: RoomMessage, playerManager: PlayerManager, mapContainer: Container) {

    const player = playerManager.getPlayer(message.id);
    if (player) {
      const b = new ChatBubble(player, message.message, this.bubbleSize);
      this.chatBubbles.push(b);
      mapContainer.addChild(b.getContainer());
    }

  }

  public getChatBubbles(): ChatBubble[] {

    return this.chatBubbles;

  }

  public destroyBubble(bubble: ChatBubble): void {

    const index = this.chatBubbles.indexOf(bubble);
    if (index !== -1) {

      bubble.destroy();
      this.chatBubbles.splice(index, 1);

    }

  }

  public availableChatBubbles(): boolean {

    return this.chatBubbles.length > 0;

  }

  public popChatBubble(): ChatBubble | undefined {

    return this.chatBubbles.pop();

  }

}
