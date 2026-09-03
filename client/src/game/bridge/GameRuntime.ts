export interface GameRuntimeBridge {
  respawnPlayer(): void;
  claimQuestReward(): void;
  dropInventoryItem(itemId: string): Promise<boolean>;
}

let bridge: GameRuntimeBridge | null = null;

export const gameRuntime = {
  register(nextBridge: GameRuntimeBridge): void {
    bridge = nextBridge;
  },
  unregister(nextBridge: GameRuntimeBridge): void {
    if (bridge === nextBridge) {
      bridge = null;
    }
  },
  respawnPlayer(): void {
    bridge?.respawnPlayer();
  },
  claimQuestReward(): void {
    bridge?.claimQuestReward();
  },
  dropInventoryItem(itemId: string): Promise<boolean> {
    return bridge?.dropInventoryItem(itemId) ?? Promise.resolve(false);
  }
};