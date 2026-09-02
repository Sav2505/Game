import express from 'express';
import http from 'node:http';
import { healthController } from './controllers/healthController';
import { createWebSocketServer } from './websocket/createWebSocketServer';
import { serverConfig } from './config/serverConfig';

const app = express();
app.use(express.json());

app.get('/health', healthController);

const server = http.createServer(app);
createWebSocketServer(server);

server.listen(serverConfig.port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on http://localhost:${serverConfig.port}`);
});