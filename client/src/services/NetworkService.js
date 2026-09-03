import { getOrCreateClientPlayerId } from '@/services/multiplayerIdentity';
const initialPlayerId = getOrCreateClientPlayerId();
let state = {
    status: 'disconnected',
    playerId: initialPlayerId,
    playerName: 'Adventurer',
    worldPickups: [],
    remotePlayers: [],
    updatedAt: Date.now()
};
const listeners = new Set();
function cloneWorldPickup(pickup) {
    return { ...pickup };
}
function cloneRemotePlayer(player) {
    const clonedEquipmentEntries = Object.entries(player.character.equipment).map(([slot, item]) => {
        if (!item) {
            return [slot, item];
        }
        const clonedItem = {
            ...item,
            statBonuses: { ...item.statBonuses }
        };
        if (item.render) {
            clonedItem.render = { ...item.render };
        }
        return [slot, clonedItem];
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
function setState(updater) {
    state = updater(state);
    const snapshot = networkService.getState();
    for (const listener of listeners) {
        listener(snapshot);
    }
}
class NetworkService {
    socket = null;
    reconnectTimeoutId = null;
    shouldStayConnected = false;
    requestCounter = 0;
    pendingDropRequests = new Map();
    pendingPickupRequests = new Map();
    connect(nextPlayerName) {
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
    disconnect() {
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
    subscribe(listener) {
        listeners.add(listener);
        listener(this.getState());
        return () => {
            listeners.delete(listener);
        };
    }
    getState() {
        return {
            ...state,
            worldPickups: state.worldPickups.map(cloneWorldPickup),
            remotePlayers: state.remotePlayers.map(cloneRemotePlayer)
        };
    }
    getPlayerId() {
        return state.playerId;
    }
    sendPlayerUpdate(snapshot) {
        try {
            const message = {
                type: 'player:update_request',
                payload: cloneRemotePlayer(snapshot)
            };
            this.send(message);
        }
        catch {
            return;
        }
    }
    requestWorldSync() {
        try {
            this.send({ type: 'world:sync_request' });
        }
        catch {
            return;
        }
    }
    requestDrop(itemId, x, y) {
        const requestId = this.createRequestId('drop');
        const message = {
            type: 'item:drop_request',
            payload: {
                requestId,
                playerId: state.playerId,
                itemId,
                x,
                y
            }
        };
        return new Promise((resolve, reject) => {
            this.pendingDropRequests.set(requestId, { resolve, reject });
            try {
                this.send(message);
            }
            catch (error) {
                this.pendingDropRequests.delete(requestId);
                reject(error instanceof Error ? error : new Error('Failed to send drop request.'));
            }
        });
    }
    requestPickup(pickupId) {
        const requestId = this.createRequestId('pickup');
        const message = {
            type: 'item:pickup_request',
            payload: {
                requestId,
                playerId: state.playerId,
                pickupId
            }
        };
        return new Promise((resolve, reject) => {
            this.pendingPickupRequests.set(requestId, { resolve, reject });
            try {
                this.send(message);
            }
            catch (error) {
                this.pendingPickupRequests.delete(requestId);
                reject(error instanceof Error ? error : new Error('Failed to send pickup request.'));
            }
        });
    }
    openSocket() {
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
    handleMessage(rawMessage) {
        let message;
        try {
            message = JSON.parse(rawMessage);
        }
        catch {
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
    applyWorldSnapshot(snapshot) {
        setState((previous) => ({
            ...previous,
            worldPickups: snapshot.worldPickups.map(cloneWorldPickup),
            remotePlayers: snapshot.players.map(cloneRemotePlayer),
            updatedAt: snapshot.updatedAt
        }));
    }
    upsertWorldPickup(pickup) {
        setState((previous) => ({
            ...previous,
            worldPickups: [
                ...previous.worldPickups.filter((entry) => entry.pickupId !== pickup.pickupId),
                cloneWorldPickup(pickup)
            ],
            updatedAt: Date.now()
        }));
    }
    markPickupCollected(pickupId, collectedByPlayerId) {
        setState((previous) => ({
            ...previous,
            worldPickups: previous.worldPickups.map((pickup) => (pickup.pickupId === pickupId
                ? {
                    ...pickup,
                    collected: true,
                    collectedByPlayerId
                }
                : pickup)),
            updatedAt: Date.now()
        }));
    }
    upsertRemotePlayer(player) {
        setState((previous) => ({
            ...previous,
            remotePlayers: [
                ...previous.remotePlayers.filter((entry) => entry.playerId !== player.playerId),
                cloneRemotePlayer(player)
            ],
            updatedAt: Date.now()
        }));
    }
    removeRemotePlayer(playerId) {
        setState((previous) => ({
            ...previous,
            remotePlayers: previous.remotePlayers.filter((player) => player.playerId !== playerId),
            updatedAt: Date.now()
        }));
    }
    rejectRequest(payload) {
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
    rejectPendingRequests(reason) {
        for (const [requestId, request] of this.pendingDropRequests.entries()) {
            this.pendingDropRequests.delete(requestId);
            request.reject(new Error(reason));
        }
        for (const [requestId, request] of this.pendingPickupRequests.entries()) {
            this.pendingPickupRequests.delete(requestId);
            request.reject(new Error(reason));
        }
    }
    scheduleReconnect() {
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
    sendHello() {
        const message = {
            type: 'client:hello',
            payload: {
                playerId: state.playerId,
                name: state.playerName
            }
        };
        this.send(message);
    }
    send(message) {
        if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
            throw new Error('Network connection is not ready.');
        }
        this.socket.send(JSON.stringify(message));
    }
    createRequestId(prefix) {
        this.requestCounter += 1;
        return `${prefix}-${state.playerId}-${this.requestCounter}`;
    }
    getSocketUrl() {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        return `${protocol}//${window.location.host}/ws`;
    }
}
export const networkService = new NetworkService();
