export interface GameRuntimeBridge {
  respawnPlayer(): void;
  claimQuestReward(): void;
  dropInventoryItem(itemId: string): void;
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
  dropInventoryItem(itemId: string): void {
    bridge?.dropInventoryItem(itemId);
  }
};