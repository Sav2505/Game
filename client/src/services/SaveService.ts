import type { SavedGameSnapshot } from '@shared/types';

const SAVE_KEY = 'modern-rpg.save.v1';

export const defaultPlayer = {
  id: 'player-1',
  name: 'Aeris',
  level: 1,
  xp: 0,
  maxXp: 100,
  hp: 100,
  maxHp: 100,
  gold: 100
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

export function loadSavedGame(): SavedGameSnapshot | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw = window.localStorage.getItem(SAVE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<SavedGameSnapshot>;
    if (!parsed.player || !parsed.quest) {
      return null;
    }

    return {
      player: {
        ...defaultPlayer,
        ...parsed.player
      },
      quest: {
        ...defaultQuest,
        ...parsed.quest,
        reward: {
          ...defaultQuest.reward,
          ...parsed.quest.reward
        }
      }
    };
  } catch {
    return null;
  }
}

export function saveGame(snapshot: SavedGameSnapshot): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(SAVE_KEY, JSON.stringify(snapshot));
}

export function clearSavedGame(): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(SAVE_KEY);
}