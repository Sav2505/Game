let bridge = null;
export const gameRuntime = {
    register(nextBridge) {
        bridge = nextBridge;
    },
    unregister(nextBridge) {
        if (bridge === nextBridge) {
            bridge = null;
        }
    },
    respawnPlayer() {
        bridge?.respawnPlayer();
    },
    claimQuestReward() {
        bridge?.claimQuestReward();
    },
    dropInventoryItem(itemId) {
        return bridge?.dropInventoryItem(itemId) ?? Promise.resolve(false);
    }
};
