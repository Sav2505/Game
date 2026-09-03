import type http from 'node:http';
import { WebSocketServer } from 'ws';
import type {
  ClientHelloMessage,
  ClientToServerMessage,
  DropItemRequestMessage,
  PickupItemRequestMessage,
  PlayerStateUpdateRequestMessage,
  RemotePlayerSnapshot,
  RequestRejectedMessage,
  ServerHelloMessage,
  ServerToClientMessage,
  WorldSyncMessage
} from '../../../shared/types';
import { PlayerSessionManager } from '../multiplayer/PlayerSessionManager';
import { WorldStateManager } from '../multiplayer/WorldStateManager';
import { WorldStateRepository } from '../multiplayer/WorldStateRepository';
import { createInitialWorldPickups } from '../multiplayer/worldBootstrap';

function serialize(message: ServerToClientMessage): string {
  return JSON.stringify(message);
}

function createRejectedMessage(payload: RequestRejectedMessage['payload']): RequestRejectedMessage {
  return {
    type: 'request:rejected',
    payload
  };
}

export async function createWebSocketServer(server: http.Server, repository: WorldStateRepository): Promise<WebSocketServer> {
  const persistedState = await repository.load();
  const worldStateManager = new WorldStateManager(createInitialWorldPickups(), persistedState);
  const sessionManager = new PlayerSessionManager();

  const websocketServer = new WebSocketServer({
    server,
    path: '/ws'
  });

  const persistWorldState = async (): Promise<void> => {
    await repository.save(worldStateManager.getPersistedState());
  };

  websocketServer.on('connection', (socket) => {
    let playerId: string | null = null;

    socket.on('message', async (rawMessage) => {
      let message: ClientToServerMessage | null = null;

      try {
        message = JSON.parse(rawMessage.toString()) as ClientToServerMessage;
      } catch {
        socket.send(serialize(createRejectedMessage({ code: 'invalid_message', reason: 'Invalid JSON payload.' })));
        return;
      }

      if (!message) {
        return;
      }

      if (message.type === 'client:hello') {
        const hello = message as ClientHelloMessage;
        playerId = hello.payload.playerId;
        sessionManager.register(playerId, socket);

        const bootstrapSnapshot: RemotePlayerSnapshot = {
          playerId,
          name: hello.payload.name,
          x: 160,
          y: 700,
          facing: 'right',
          animationState: 'idle',
          character: {
            id: 'remote-bootstrap',
            name: hello.payload.name,
            appearance: {
              body: 'player-base-body',
              face: 'character-face-idle',
              hair: 'character-hair-default',
              hairColor: '#77543f',
              skinColor: '#f2c49c'
            },
            equipment: {},
            baseStats: {
              strength: 10,
              dexterity: 8,
              intelligence: 4,
              vitality: 10,
              attack: 5,
              defense: 4,
              magicAttack: 1,
              magicDefense: 2,
              maxHp: 100,
              maxMp: 30
            }
          },
          updatedAt: Date.now()
        };

        const result = worldStateManager.registerOrUpdatePlayer(bootstrapSnapshot);
        const helloMessage: ServerHelloMessage = {
          type: 'server:hello',
          payload: {
            status: 'connected',
            playerId,
            serverTime: Date.now()
          }
        };
        const syncMessage: WorldSyncMessage = {
          type: 'world:sync',
          payload: worldStateManager.getSnapshot()
        };

        socket.send(serialize(helloMessage));
        socket.send(serialize(syncMessage));

        if (result.wasNew) {
          sessionManager.broadcast(serialize({ type: 'player:join', payload: result.snapshot }), playerId);
        }
        return;
      }

      if (!playerId) {
        socket.send(serialize(createRejectedMessage({ code: 'player_not_ready', reason: 'client:hello is required before gameplay messages.' })));
        return;
      }

      switch (message.type) {
        case 'world:sync_request': {
          const syncMessage: WorldSyncMessage = {
            type: 'world:sync',
            payload: worldStateManager.getSnapshot()
          };
          socket.send(serialize(syncMessage));
          return;
        }
        case 'player:update_request': {
          const updateMessage = message as PlayerStateUpdateRequestMessage;
          if (updateMessage.payload.playerId !== playerId) {
            socket.send(serialize(createRejectedMessage({
              playerId,
              code: 'invalid_message',
              reason: 'Player ID mismatch.'
            })));
            return;
          }

          const result = worldStateManager.registerOrUpdatePlayer(updateMessage.payload);
          sessionManager.broadcast(serialize({ type: 'player:update', payload: result.snapshot }), playerId);
          return;
        }
        case 'item:drop_request': {
          const dropMessage = message as DropItemRequestMessage;
          if (dropMessage.payload.playerId !== playerId) {
            socket.send(serialize(createRejectedMessage({
              requestId: dropMessage.payload.requestId,
              playerId,
              code: 'drop_denied',
              reason: 'Cannot drop items for another player.'
            })));
            return;
          }

          const pickup = worldStateManager.createDroppedPickup(playerId, dropMessage.payload.itemId, dropMessage.payload.x, dropMessage.payload.y);
          await persistWorldState();
          sessionManager.broadcast(serialize({
            type: 'item:dropped',
            payload: {
              requestId: dropMessage.payload.requestId,
              playerId,
              pickup
            }
          }));
          return;
        }
        case 'item:pickup_request': {
          const pickupMessage = message as PickupItemRequestMessage;
          if (pickupMessage.payload.playerId !== playerId) {
            socket.send(serialize(createRejectedMessage({
              requestId: pickupMessage.payload.requestId,
              playerId,
              code: 'pickup_missing',
              reason: 'Cannot pick items for another player.'
            })));
            return;
          }

          const collectedPickup = worldStateManager.collectPickup(playerId, pickupMessage.payload.pickupId);
          if (!collectedPickup) {
            socket.send(serialize(createRejectedMessage({
              requestId: pickupMessage.payload.requestId,
              playerId,
              code: 'pickup_already_collected',
              reason: 'Pickup is no longer available.'
            })));
            return;
          }

          await persistWorldState();
          sessionManager.broadcast(serialize({
            type: 'item:picked',
            payload: {
              requestId: pickupMessage.payload.requestId,
              playerId,
              pickupId: collectedPickup.pickupId,
              itemId: collectedPickup.itemId
            }
          }));
          return;
        }
        default:
          socket.send(serialize(createRejectedMessage({ code: 'invalid_message', reason: 'Unsupported message type.' })));
      }
    });

    socket.on('close', () => {
      if (!playerId) {
        return;
      }

      sessionManager.unregister(playerId);
      if (worldStateManager.removePlayer(playerId)) {
        sessionManager.broadcast(serialize({
          type: 'player:leave',
          payload: { playerId }
        }), playerId);
      }
    });
  });

  (websocketServer as WebSocketServer & { persistWorldState?: () => Promise<void> }).persistWorldState = persistWorldState;
  return websocketServer;
}