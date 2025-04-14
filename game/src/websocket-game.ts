const socket = new WebSocket("ws://localhost:8003/ws-gameserver");

export function sendToServer(data) {
  if (socket.readyState == WebSocket.OPEN) {
    socket.send(JSON.stringify(data));
  }
}

socket.onopen = () => {
  console.log("Websocket connection opened.");
  socket.send(JSON.stringify({ type: "newConnection", info: "Client connected!", username: 'abusername' }));
};

socket.onmessage = (message) => {
  // const data = JSON.parse(message.data);
  console.warn(message.data);
};

socket.onerror = (message) => {
  console.log("Websocket error: ", message);
};

socket.onclose = (message) => {
  console.log("Websocket closed: ", message);
  socket.send(JSON.stringify({ type: "disconnection", info: "Client disconnected!", username: 'abusername', position: { x: 420, y: 420 } }));
};

socket.close = (message) => {
  console.log("Websocket closed: ", message);
  socket.send(JSON.stringify({ type: "disconnection", info: "Client disconnected!", username: 'abusername', position: { x: 420, y: 420 } }));
};


function closeIt() {
  socket.close();
}

// const dc = setTimeout(socket.close, 5000);
const dc = setTimeout(closeIt, 5000);

