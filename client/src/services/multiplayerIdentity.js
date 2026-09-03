const CLIENT_PLAYER_ID_KEY = 'modern-rpg.multiplayer-player-id.v1';
export function getOrCreateClientPlayerId() {
    if (typeof window === 'undefined') {
        return 'player-offline';
    }
    const existingPlayerId = window.localStorage.getItem(CLIENT_PLAYER_ID_KEY);
    if (existingPlayerId) {
        return existingPlayerId;
    }
    const nextPlayerId = `player-${crypto.randomUUID()}`;
    window.localStorage.setItem(CLIENT_PLAYER_ID_KEY, nextPlayerId);
    return nextPlayerId;
}
