import type { WebSocket } from 'ws';

export interface PlayerSession {
  playerId: string;
  socket: WebSocket;
}

export class PlayerSessionManager {
  private readonly sessions = new Map<string, WebSocket>();

  public register(playerId: string, socket: WebSocket): void {
    this.sessions.set(playerId, socket);
  }

  public unregister(playerId: string): void {
    this.sessions.delete(playerId);
  }

  public send(playerId: string, message: string): void {
    this.sessions.get(playerId)?.send(message);
  }

  public broadcast(message: string, excludedPlayerId?: string): void {
    for (const [playerId, socket] of this.sessions.entries()) {
      if (playerId === excludedPlayerId) {
        continue;
      }

      socket.send(message);
    }
  }
}