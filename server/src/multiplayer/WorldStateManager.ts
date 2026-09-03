import type {
  PersistedWorldState,
  RemotePlayerSnapshot,
  WorldPickupState,
  WorldStateSnapshot
} from '../../../shared/types';

function clonePickup(pickup: WorldPickupState): WorldPickupState {
  return { ...pickup };
}

function clonePlayer(player: RemotePlayerSnapshot): RemotePlayerSnapshot {
  return {
    ...player,
    character: {
      ...player.character,
      appearance: { ...player.character.appearance },
      equipment: Object.fromEntries(
        Object.entries(player.character.equipment).map(([slot, item]) => [
          slot,
          item
            ? {
              ...item,
              render: item.render ? { ...item.render } : undefined,
              statBonuses: { ...item.statBonuses }
            }
            : item
        ])
      ),
      baseStats: { ...player.character.baseStats }
    }
  };
}

export class WorldStateManager {
  private readonly pickups = new Map<string, WorldPickupState>();

  private readonly players = new Map<string, RemotePlayerSnapshot>();

  private updatedAt = Date.now();

  public constructor(initialPickups: WorldPickupState[], persistedState: PersistedWorldState | null) {
    for (const pickup of initialPickups) {
      this.pickups.set(pickup.pickupId, {
        ...pickup,
        spawnedAt: pickup.spawnedAt || Date.now()
      });
    }

    if (persistedState) {
      for (const pickup of persistedState.worldPickups) {
        this.pickups.set(pickup.pickupId, clonePickup(pickup));
      }
      this.updatedAt = persistedState.updatedAt;
    }
  }

  public registerOrUpdatePlayer(snapshot: RemotePlayerSnapshot): { snapshot: RemotePlayerSnapshot; wasNew: boolean } {
    const nextSnapshot = clonePlayer({
      ...snapshot,
      updatedAt: Date.now()
    });
    const wasNew = !this.players.has(snapshot.playerId);
    this.players.set(snapshot.playerId, nextSnapshot);
    this.updatedAt = Date.now();
    return { snapshot: nextSnapshot, wasNew };
  }

  public removePlayer(playerId: string): boolean {
    const removed = this.players.delete(playerId);
    if (removed) {
      this.updatedAt = Date.now();
    }
    return removed;
  }

  public createDroppedPickup(playerId: string, itemId: string, x: number, y: number): WorldPickupState {
    const pickup: WorldPickupState = {
      pickupId: `dropped-${itemId}-${crypto.randomUUID()}`,
      itemId,
      x,
      y,
      source: 'dropped',
      collected: false,
      spawnedAt: Date.now(),
      droppedByPlayerId: playerId
    };

    this.pickups.set(pickup.pickupId, pickup);
    this.updatedAt = Date.now();
    return clonePickup(pickup);
  }

  public collectPickup(playerId: string, pickupId: string): WorldPickupState | null {
    const current = this.pickups.get(pickupId);
    if (!current || current.collected) {
      return null;
    }

    const nextPickup: WorldPickupState = {
      ...current,
      collected: true,
      collectedByPlayerId: playerId
    };
    this.pickups.set(pickupId, nextPickup);
    this.updatedAt = Date.now();
    return clonePickup(nextPickup);
  }

  public getPickup(pickupId: string): WorldPickupState | null {
    const pickup = this.pickups.get(pickupId);
    return pickup ? clonePickup(pickup) : null;
  }

  public getSnapshot(): WorldStateSnapshot {
    return {
      version: 1,
      worldPickups: Array.from(this.pickups.values()).map(clonePickup),
      players: Array.from(this.players.values()).map(clonePlayer),
      updatedAt: this.updatedAt
    };
  }

  public getPersistedState(): PersistedWorldState {
    return {
      version: 1,
      worldPickups: Array.from(this.pickups.values()).map(clonePickup),
      updatedAt: this.updatedAt
    };
  }
}