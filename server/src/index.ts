import express from 'express';
import http from 'node:http';
import { healthController } from './controllers/healthController';
import { createWebSocketServer } from './websocket/createWebSocketServer';
import { serverConfig } from './config/serverConfig';
import { WorldStateRepository } from './multiplayer/WorldStateRepository';

const app = express();
app.use(express.json());

app.get('/health', healthController);

const server = http.createServer(app);

async function startServer(): Promise<void> {
  const repository = new WorldStateRepository(serverConfig.worldStateFilePath);
  const websocketServer = await createWebSocketServer(server, repository);
  const shutdown = async () => {
    const extendedServer = websocketServer as typeof websocketServer & { persistWorldState?: () => Promise<void> };
    await extendedServer.persistWorldState?.();
    websocketServer.close();
    server.close(() => process.exit(0));
  };

  process.once('SIGINT', () => {
    void shutdown();
  });
  process.once('SIGTERM', () => {
    void shutdown();
  });

  server.listen(serverConfig.port, () => {
    // eslint-disable-next-line no-console
    console.log(`Server listening on http://localhost:${serverConfig.port}`);
  });
}

void startServer();