import { createInitialInventoryItems } from '@/game/inventory/catalog';
const SAVE_KEY = 'modern-rpg.save.v1';
export const defaultPlayer = {
    id: 'player-1',
    name: 'Aeris',
    level: 1,
    xp: 0,
    maxXp: 100,
    hp: 100,
    maxHp: 100,
    gold: 100,
    inventory: createInitialInventoryItems()
};
export const defaultQuest = {
    id: 'slime-trouble',
    name: 'Slime Trouble',
    description: 'Defeat 3 Slimes.',
    progress: 0,
    target: 3,
    completed: false,
    rewardClaimed: false,
    reward: {
        xp: 100,
        gold: 50
    }
};
export function loadSavedGame() {
    if (typeof window === 'undefined') {
        return null;
    }
    const raw = window.localStorage.getItem(SAVE_KEY);
    if (!raw) {
        return null;
    }
    try {
        const parsed = JSON.parse(raw);
        if (!parsed.player || !parsed.quest) {
            return null;
        }
        return {
            player: {
                ...defaultPlayer,
                ...parsed.player,
                inventory: Array.isArray(parsed.player.inventory)
                    ? parsed.player.inventory.map((item) => ({
                        ...item,
                        stats: item.stats.map((line) => ({ ...line })),
                        bonuses: item.bonuses.map((line) => ({ ...line })),
                        powers: [...item.powers],
                        attributes: [...item.attributes],
                        effects: [...item.effects]
                    }))
                    : createInitialInventoryItems()
            },
            quest: {
                ...defaultQuest,
                ...parsed.quest,
                reward: {
                    ...defaultQuest.reward,
                    ...parsed.quest.reward
                }
            },
            collectedPickupIds: Array.isArray(parsed.collectedPickupIds) ? [...parsed.collectedPickupIds] : [],
            droppedPickups: Array.isArray(parsed.droppedPickups)
                ? parsed.droppedPickups.map((pickup) => ({ ...pickup }))
                : []
        };
    }
    catch {
        return null;
    }
}
export function saveGame(snapshot) {
    if (typeof window === 'undefined') {
        return;
    }
    window.localStorage.setItem(SAVE_KEY, JSON.stringify(snapshot));
}
export function clearSavedGame() {
    if (typeof window === 'undefined') {
        return;
    }
    window.localStorage.removeItem(SAVE_KEY);
}
