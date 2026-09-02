import type http from 'node:http';
import { WebSocketServer } from 'ws';

export function createWebSocketServer(server: http.Server): WebSocketServer {
  const websocketServer = new WebSocketServer({
    server,
    path: '/ws'
  });

  websocketServer.on('connection', (socket) => {
    socket.send(JSON.stringify({ type: 'server:hello', payload: { status: 'connected' } }));

    socket.on('message', (rawMessage) => {
      const text = rawMessage.toString();
      if (text === 'ping') {
        socket.send('pong');
      }
    });
  });

  return websocketServer;
}