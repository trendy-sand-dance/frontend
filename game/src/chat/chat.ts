import { Container } from 'pixi.js';
import PlayerManager from "../player/playermanager.js";
import ChatBubble from '../chat/chatbubble.js';
import { MessageType } from "../interfaces";
import { DATABASE_URL } from '../../../server/config';
import Player from '../player.js';

export default class Chat {

  private textInput: HTMLInputElement;
  private sendButton: HTMLButtonElement;
  private chatDisplay: HTMLElement;
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
    this.chatDisplay = document.getElementById("chat-message-display") as HTMLElement;
    if (this.chatDisplay === null) {
      console.error("Couldn't get chatDisplay for Chat");
    }

  }

  private getTextInput(): string | undefined {

    if (this.textInput) {
      return this.textInput.value;
    }

    return undefined;

  }

private async sendIfWhisper(message : string, player : Player)
{

	if (message.charAt(0) != '@' || message.length < 2)
	return false;

	let nameEnd : number = message.indexOf(" "); //can users have spaces in names?

	if (nameEnd === -1)
	return false;

	const targetName : string = message.slice(1, nameEnd);

	const response = await fetch(`${DATABASE_URL}/game/players/${targetName}`);

		if (!response.ok)
		{

		//make it give a specific "user not found" feedback to user in future

		console.log("Can't find user: ", targetName);

		return false;

		}

		const msgContent : string = message.slice(nameEnd);

		const targetPlayer = await response.json() as Player;

		const whisper : ChatMessage =

		{   type: MessageType.PersonalChat,

		fromId: player.getId(),

		toId: targetPlayer.id,

		message: msgContent,

		timestamp: new Date().toLocaleString()

		};

	this.socket!.send(JSON.stringify(whisper)); //! cause socket existence gets checked in parent func, should i keep check in case of dc?

	this.chatBubbles.push(new ChatBubble(player, "pst pst", 10));

	console.log("%cwhisper send!", "color: purple");

}

private handleTextInput(playerManager : PlayerManager, mapContainer : Container) : void 
{

	const chatMessage = this.getTextInput();

	if (chatMessage)
	{

		const player = playerManager.getLocalPlayer();

		if (player && this.socket && !this.sendIfWhisper(chatMessage, player)) {

			// TODO: Write function to determine which room the player is and whether it's a PM or a RM

			const roomMessage : RoomMessage = {type: MessageType.RoomChat, id: player.getId(), message: chatMessage, timestamp: new Date().toLocaleString(), room: player.getRegion()};

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
