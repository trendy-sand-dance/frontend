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

private getWhisperTarget(textInput : string) : string {

	const nameEnd = textInput.indexOf(" ");
	if (nameEnd === -1) 
		return "";

	return textInput.slice(1, nameEnd);

}

private removeNameFromText(textInput : string) : string {

	const nameEnd = textInput.indexOf(" ");
	return textInput.slice(nameEnd);

}

private handleRendering(player : Player, chatMessage : RoomMessage | WhisperMessage | undefined, size : number, container : Container, playerManager : PlayerManager) : void {

	if (chatMessage) { 
		const bubble: ChatBubble = new ChatBubble(player, chatMessage.message, size);
		this.chatBubbles.push(bubble);
		container.addChild(bubble.getContainer());
	}
	this.renderMessageAsHtml(chatMessage, playerManager);

}

public renderMessageAsHtml(chatMessage : RoomMessage | WhisperMessage | undefined, playerManager : PlayerManager)
{

	this.chatDisplay = document.getElementById("chat-message-display") as HTMLElement;
    if (this.chatDisplay === null) {
      console.error("Couldn't get chatDisplay for Chat");
	  return;
    }
	const chatdiv = document.createElement("div") as HTMLElement;
	if (!chatMessage) {
		chatdiv.setAttribute("class", "text-[--color-text-muted]");
		chatdiv!.innerHTML = "Message could not be sent: user is offline or invalid...";
		this.chatDisplay.appendChild(chatdiv);
		return;
	}
	const spanUsername = document.createElement("span") as HTMLElement;
	spanUsername!.setAttribute("class", "font-bold text-[--color-accent]");
	const spanMessage = document.createElement("span") as HTMLElement;
	spanMessage!.setAttribute("class", "break-all overflow-wrap-anywhere inline");
	const spanTimestamp = document.createElement("span") as HTMLElement;
	spanTimestamp!.setAttribute("class", "block text-xs text-gray-400 text-right");

	if (chatMessage.type === MessageType.RoomChat) {
		const msg : RoomMessage = chatMessage as RoomMessage;
		chatdiv.setAttribute("class", "bg-[--color-secondary] text-[--color-text] rounded p-2");
		spanUsername!.innerHTML = `${msg.username}: `;
		spanMessage!.innerHTML = `${msg.message}`;
		spanTimestamp!.innerHTML = `${msg.room + ", " + msg.timestamp}`;
	}
	if (chatMessage.type === MessageType.PersonalChat) {
		const msg : WhisperMessage = chatMessage as WhisperMessage;
		chatdiv.setAttribute("class", "bg-[--color-background] text-[--color-text] border border-[--color-accent] rounded p-2");
		const localId = playerManager.getLocalPlayer()?.getId();
		if (localId === msg.fromId) { // I'm whispering
			spanUsername!.innerHTML = `Whisper to ${msg.toUsername}: `;
		} 
		else {
			spanUsername!.innerHTML = `${msg.fromUsername} whispers: `;
		}
		spanMessage!.innerHTML = `${msg.message}`;
		spanTimestamp!.innerHTML = `${msg.timestamp}`;
	}

	chatdiv.appendChild(spanUsername);
	chatdiv.appendChild(spanMessage);
	chatdiv.appendChild(spanTimestamp);
	this.chatDisplay.appendChild(chatdiv);
}

private isWhisper(message : string) : boolean {

	if (message.charAt(0) != '@' || message.length < 2 || message.indexOf(" ") === -1)
		return false;

	return true;
}

private handleTextInput(playerManager : PlayerManager, mapContainer : Container) : void 
{

	const textInput = this.getTextInput();
	const player = playerManager.getLocalPlayer();

	if (textInput && player && this.socket)
	{
		let chatMessage : RoomMessage | WhisperMessage | undefined;

		if (this.isWhisper(textInput)) {
			const message = this.removeNameFromText(textInput);
			const targetName = this.getWhisperTarget(textInput);
			const toId = playerManager.getId(targetName);
			if (toId === -1 || toId === player.getId()) {
				console.log(`${targetName} is offline or doesn't exist!`);
			}
			else {
				chatMessage = { type: MessageType.PersonalChat, fromId: player.getId(), fromUsername: player.getUsername(), toId: toId, toUsername: targetName, message: message, timestamp: new Date().toISOString()};
			}
		}
		else {
			chatMessage = {type: MessageType.RoomChat, id: player.getId(), username: player.getUsername(), message: textInput, timestamp: new Date().toISOString(), room: player.getRegion()};
		}

		this.handleRendering(player, chatMessage, this.bubbleSize, mapContainer, playerManager);
		if (chatMessage)
			this.socket.send(JSON.stringify(chatMessage));
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
