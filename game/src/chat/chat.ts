import { Container } from 'pixi.js';
import PlayerManager from "../player/playermanager.js";
import ChatBubble from '../chat/chatbubble.js';
import { MessageType } from "../interfaces";
// import { DATABASE_URL } from '../../../server/config';
import Player from '../player/player.js';
// import { chat } from './chatconnectionmanager.js';

export default class Chat {

  private textInput: HTMLInputElement;
  private sendButton: HTMLButtonElement;
  private chatDisplay: HTMLElement | null = null;
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

  }

  private getTextInput(): string | undefined {

    if (this.textInput) {
      return this.textInput.value;
    }

    return undefined;

  }

private sendIfWhisper(message : string, player : Player, playerManager : PlayerManager, mapContainer : Container) : boolean
{

	// playerManager.getPlayer

	console.log("entered whisper func");

	if (message.charAt(0) != '@' || message.length < 2)
	return false;

	let nameEnd : number = message.indexOf(" "); //can users have spaces in names?

	if (nameEnd === -1)
	return false;

	const targetName : string = message.slice(1, nameEnd);

	const targetID : number = playerManager.getId(targetName);

	// const response = await fetch(`${DATABASE_URL}/game/players/${targetName}`);
	// const targetPlayer = await response.json() as Player;
	
	if (targetID === -1)
	{
		//make it give a specific "user not found" feedback to user in future
		
		console.log("Can't find user: ", targetName);
		
		return false;
		
	}
		console.log(`${targetName}'s id: ${targetID}`);
		
		const msgContent : string = message.slice(nameEnd);


		const whisper : WhisperMessage =	{type: MessageType.PersonalChat, fromId: player.getId(), fromUsername: targetName,
												toId: targetID, message: msgContent, timestamp: new Date().toLocaleString()};

	this.socket!.send(JSON.stringify(whisper)); //! cause socket existence gets checked in parent func, should i keep check in case of dc?

	const bubble : ChatBubble = new ChatBubble(player, "pst pst", 10)
	
	this.chatBubbles.push(bubble);
	mapContainer.addChild(bubble.getContainer());

	console.log("%cwhisper send!", "color: purple");
	this.renderMsgHTML(msgContent, player.getUsername());

	return true;

}

public renderMsgHTML(msg : string, senderName: string)
{
	this.chatDisplay = document.getElementById("chat-message-display") as HTMLElement;
    if (this.chatDisplay === null) {
      console.error("Couldn't get chatDisplay for Chat");
    }
	const chatdiv = document.createElement("div") as HTMLElement;
	chatdiv.setAttribute("class", "bg-[--color-secondary] text-[--color-text] rounded p-2");
	chatdiv.innerHTML = `${senderName}: ${msg}`;
	this.chatDisplay.appendChild(chatdiv);
	// this.chatDisplay
}

private handleTextInput(playerManager : PlayerManager, mapContainer : Container) : void 
{

	const chatMessage = this.getTextInput();

	if (chatMessage)
	{

		const player = playerManager.getLocalPlayer();
		if (player && this.socket && !this.sendIfWhisper(chatMessage, player, playerManager, mapContainer)) {
			
			// TODO: Write function to determine which room the player is and whether it's a PM or a RM


			const roomMessage : RoomMessage = {type: MessageType.RoomChat, id: player.getId(), username: player.getUsername(), message: chatMessage, timestamp: new Date().toLocaleString(), room: player.getRegion()};

			this.socket.send(JSON.stringify(roomMessage));

			const b = new ChatBubble(player, chatMessage, this.bubbleSize);

			this.chatBubbles.push(b);

			mapContainer.addChild(b.getContainer());
			this.renderMsgHTML(chatMessage, player.getUsername());

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

  public createChatBubble(message: string, toId : number, playerManager: PlayerManager, mapContainer: Container) {
	
    const player = playerManager.getPlayer(toId);
    if (player) {
      const b = new ChatBubble(player, message, this.bubbleSize);
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
