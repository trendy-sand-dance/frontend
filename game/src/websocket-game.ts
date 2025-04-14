const socket = new WebSocket("ws://localhost:8003/ws-gameserver");

export function sendToServer(data) {
  if (socket.readyState == WebSocket.OPEN) {
    socket.send(JSON.stringify(data));
  }
}

socket.onopen = () => {
  console.log("Websocket connection opened.");
};

socket.onmessage = (message) => {
  // const data = JSON.parse(message.data);
  console.warn(message.data);
};

socket.onerror = (message) => {
  console.log("Websocket error: ", message);
};

socket.close = (message) => {
  console.log("Websocket closed: ", message);
};
