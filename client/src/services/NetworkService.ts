import type {
  ClientHelloMessage,
  ClientToServerMessage,
  DropItemRequestMessage,
  PickupItemRequestMessage,
  PlayerStateUpdateRequestMessage,
  RemotePlayerSnapshot,
  RequestRejectedMessage,
  ServerToClientMessage,
  WorldPickupState,
  WorldStateSnapshot
} from '@shared/types';
import { getOrCreateClientPlayerId } from '@/services/multiplayerIdentity';

type NetworkStatus = 'disconnected' | 'connecting' | 'connected';

type NetworkListener = (state: NetworkState) => void;

type PickupRequestResult = {
  pickupId: string;
  itemId: string;
};

interface PendingDropRequest {
  resolve: (pickup: WorldPickupState) => void;
  reject: (error: Error) => void;
}

interface PendingPickupRequest {
  resolve: (result: PickupRequestResult) => void;
  reject: (error: Error) => void;
}

export interface NetworkState {
  status: NetworkStatus;
  playerId: string;
  playerName: string;
  worldPickups: WorldPickupState[];
  remotePlayers: RemotePlayerSnapshot[];
  updatedAt: number;
}

const initialPlayerId = getOrCreateClientPlayerId();

let state: NetworkState = {
  status: 'disconnected',
  playerId: initialPlayerId,
  playerName: 'Adventurer',
  worldPickups: [],
  remotePlayers: [],
  updatedAt: Date.now()
};

const listeners = new Set<NetworkListener>();

function cloneWorldPickup(pickup: WorldPickupState): WorldPickupState {
  return { ...pickup };
}

function cloneRemotePlayer(player: RemotePlayerSnapshot): RemotePlayerSnapshot {
  const clonedEquipmentEntries = Object.entries(player.character.equipment).map(([slot, item]) => {
    if (!item) {
      return [slot, item] as const;
    }

    const clonedItem: typeof item = {
      ...item,
      statBonuses: { ...item.statBonuses }
    };

    if (item.render) {
      clonedItem.render = { ...item.render };
    }

    return [slot, clonedItem] as const;
  });

  return {
    ...player,
    character: {
      ...player.character,
      appearance: { ...player.character.appearance },
      equipment: Object.fromEntries(clonedEquipmentEntries),
      baseStats: { ...player.character.baseStats }
    }
  };
}

function setState(updater: (previous: NetworkState) => NetworkState): void {
  state = updater(state);
  const snapshot = networkService.getState();
  for (const listener of listeners) {
    listener(snapshot);
  }
}

class NetworkService {
  private socket: WebSocket | null = null;

  private reconnectTimeoutId: number | null = null;

  private shouldStayConnected = false;

  private requestCounter = 0;

  private pendingDropRequests = new Map<string, PendingDropRequest>();

  private pendingPickupRequests = new Map<string, PendingPickupRequest>();

  public connect(nextPlayerName: string): void {
    this.shouldStayConnected = true;

    if (nextPlayerName && nextPlayerName !== state.playerName) {
      setState((previous) => ({
        ...previous,
        playerName: nextPlayerName,
        updatedAt: Date.now()
      }));
    }

    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      if (this.socket.readyState === WebSocket.OPEN) {
        this.sendHello();
      }
      return;
    }

    this.openSocket();
  }

  public disconnect(): void {
    this.shouldStayConnected = false;
    if (this.reconnectTimeoutId !== null) {
      window.clearTimeout(this.reconnectTimeoutId);
      this.reconnectTimeoutId = null;
    }

    this.socket?.close();
    this.socket = null;
    this.rejectPendingRequests('Network disconnected.');
    setState((previous) => ({
      ...previous,
      status: 'disconnected',
      remotePlayers: [],
      updatedAt: Date.now()
    }));
  }

  public subscribe(listener: NetworkListener): () => void {
    listeners.add(listener);
    listener(this.getState());
    return () => {
      listeners.delete(listener);
    };
  }

  public getState(): NetworkState {
    return {
      ...state,
      worldPickups: state.worldPickups.map(cloneWorldPickup),
      remotePlayers: state.remotePlayers.map(cloneRemotePlayer)
    };
  }

  public getPlayerId(): string {
    return state.playerId;
  }

  public sendPlayerUpdate(snapshot: RemotePlayerSnapshot): void {
    try {
      const message: PlayerStateUpdateRequestMessage = {
        type: 'player:update_request',
        payload: cloneRemotePlayer(snapshot)
      };
      this.send(message);
    } catch {
      return;
    }
  }

  public requestWorldSync(): void {
    try {
      this.send({ type: 'world:sync_request' });
    } catch {
      return;
    }
  }

  public requestDrop(itemId: string, x: number, y: number): Promise<WorldPickupState> {
    const requestId = this.createRequestId('drop');
    const message: DropItemRequestMessage = {
      type: 'item:drop_request',
      payload: {
        requestId,
        playerId: state.playerId,
        itemId,
        x,
        y
      }
    };

    return new Promise<WorldPickupState>((resolve, reject) => {
      this.pendingDropRequests.set(requestId, { resolve, reject });
      try {
        this.send(message);
      } catch (error) {
        this.pendingDropRequests.delete(requestId);
        reject(error instanceof Error ? error : new Error('Failed to send drop request.'));
      }
    });
  }

  public requestPickup(pickupId: string): Promise<PickupRequestResult> {
    const requestId = this.createRequestId('pickup');
    const message: PickupItemRequestMessage = {
      type: 'item:pickup_request',
      payload: {
        requestId,
        playerId: state.playerId,
        pickupId
      }
    };

    return new Promise<PickupRequestResult>((resolve, reject) => {
      this.pendingPickupRequests.set(requestId, { resolve, reject });
      try {
        this.send(message);
      } catch (error) {
        this.pendingPickupRequests.delete(requestId);
        reject(error instanceof Error ? error : new Error('Failed to send pickup request.'));
      }
    });
  }

  private openSocket(): void {
    setState((previous) => ({
      ...previous,
      status: 'connecting',
      updatedAt: Date.now()
    }));

    const socket = new WebSocket(this.getSocketUrl());
    this.socket = socket;

    socket.addEventListener('open', () => {
      if (this.socket !== socket) {
        return;
      }

      this.sendHello();
    });

    socket.addEventListener('message', (event) => {
      if (typeof event.data === 'string') {
        this.handleMessage(event.data);
      }
    });

    socket.addEventListener('close', () => {
      if (this.socket === socket) {
        this.socket = null;
      }

      this.rejectPendingRequests('Connection closed before the request completed.');
      setState((previous) => ({
        ...previous,
        status: 'disconnected',
        remotePlayers: [],
        updatedAt: Date.now()
      }));

      if (this.shouldStayConnected) {
        this.scheduleReconnect();
      }
    });
  }

  private handleMessage(rawMessage: string): void {
    let message: ServerToClientMessage;

    try {
      message = JSON.parse(rawMessage) as ServerToClientMessage;
    } catch {
      return;
    }

    switch (message.type) {
      case 'server:hello':
        setState((previous) => ({
          ...previous,
          status: 'connected',
          updatedAt: Date.now()
        }));
        this.requestWorldSync();
        return;
      case 'world:sync':
        this.applyWorldSnapshot(message.payload);
        return;
      case 'player:join':
      case 'player:update':
        this.upsertRemotePlayer(message.payload);
        return;
      case 'player:leave':
        this.removeRemotePlayer(message.payload.playerId);
        return;
      case 'item:dropped':
        this.upsertWorldPickup(message.payload.pickup);
        if (message.payload.requestId && message.payload.playerId === state.playerId) {
          const request = this.pendingDropRequests.get(message.payload.requestId);
          if (request) {
            this.pendingDropRequests.delete(message.payload.requestId);
            request.resolve(cloneWorldPickup(message.payload.pickup));
          }
        }
        return;
      case 'item:picked':
        this.markPickupCollected(message.payload.pickupId, message.payload.playerId);
        if (message.payload.requestId && message.payload.playerId === state.playerId) {
          const request = this.pendingPickupRequests.get(message.payload.requestId);
          if (request) {
            this.pendingPickupRequests.delete(message.payload.requestId);
            request.resolve({
              pickupId: message.payload.pickupId,
              itemId: message.payload.itemId
            });
          }
        }
        return;
      case 'request:rejected':
        this.rejectRequest(message.payload);
        return;
      default:
        return;
    }
  }

  private applyWorldSnapshot(snapshot: WorldStateSnapshot): void {
    setState((previous) => ({
      ...previous,
      worldPickups: snapshot.worldPickups.map(cloneWorldPickup),
      remotePlayers: snapshot.players.map(cloneRemotePlayer),
      updatedAt: snapshot.updatedAt
    }));
  }

  private upsertWorldPickup(pickup: WorldPickupState): void {
    setState((previous) => ({
      ...previous,
      worldPickups: [
        ...previous.worldPickups.filter((entry) => entry.pickupId !== pickup.pickupId),
        cloneWorldPickup(pickup)
      ],
      updatedAt: Date.now()
    }));
  }

  private markPickupCollected(pickupId: string, collectedByPlayerId: string): void {
    setState((previous) => ({
      ...previous,
      worldPickups: previous.worldPickups.map((pickup) => (
        pickup.pickupId === pickupId
          ? {
            ...pickup,
            collected: true,
            collectedByPlayerId
          }
          : pickup
      )),
      updatedAt: Date.now()
    }));
  }

  private upsertRemotePlayer(player: RemotePlayerSnapshot): void {
    setState((previous) => ({
      ...previous,
      remotePlayers: [
        ...previous.remotePlayers.filter((entry) => entry.playerId !== player.playerId),
        cloneRemotePlayer(player)
      ],
      updatedAt: Date.now()
    }));
  }

  private removeRemotePlayer(playerId: string): void {
    setState((previous) => ({
      ...previous,
      remotePlayers: previous.remotePlayers.filter((player) => player.playerId !== playerId),
      updatedAt: Date.now()
    }));
  }

  private rejectRequest(payload: RequestRejectedMessage['payload']): void {
    if (!payload.requestId) {
      return;
    }

    const dropRequest = this.pendingDropRequests.get(payload.requestId);
    if (dropRequest) {
      this.pendingDropRequests.delete(payload.requestId);
      dropRequest.reject(new Error(payload.reason));
      return;
    }

    const pickupRequest = this.pendingPickupRequests.get(payload.requestId);
    if (pickupRequest) {
      this.pendingPickupRequests.delete(payload.requestId);
      pickupRequest.reject(new Error(payload.reason));
    }
  }

  private rejectPendingRequests(reason: string): void {
    for (const [requestId, request] of this.pendingDropRequests.entries()) {
      this.pendingDropRequests.delete(requestId);
      request.reject(new Error(reason));
    }

    for (const [requestId, request] of this.pendingPickupRequests.entries()) {
      this.pendingPickupRequests.delete(requestId);
      request.reject(new Error(reason));
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimeoutId !== null) {
      return;
    }

    this.reconnectTimeoutId = window.setTimeout(() => {
      this.reconnectTimeoutId = null;
      if (this.shouldStayConnected) {
        this.openSocket();
      }
    }, 1200);
  }

  private sendHello(): void {
    const message: ClientHelloMessage = {
      type: 'client:hello',
      payload: {
        playerId: state.playerId,
        name: state.playerName
      }
    };
    this.send(message);
  }

  private send(message: ClientToServerMessage): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      throw new Error('Network connection is not ready.');
    }

    this.socket.send(JSON.stringify(message));
  }

  private createRequestId(prefix: string): string {
    this.requestCounter += 1;
    return `${prefix}-${state.playerId}-${this.requestCounter}`;
  }

  private getSocketUrl(): string {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${window.location.host}/ws`;
  }
}

export const networkService = new NetworkService();