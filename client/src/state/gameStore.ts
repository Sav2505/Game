import { useSyncExternalStore } from 'react';
import type { DroppedPickupState, QuestState, SavedGameSnapshot } from '@shared/types';
import { defaultPlayer, defaultQuest, loadSavedGame, saveGame } from '@/services/SaveService';
import { createInventoryItemById, type InventoryItem } from '@/game/inventory/catalog';
import type { GameState, NotificationState, UiState } from '@/types/game';

type StateListener = () => void;

const savedGame = loadSavedGame();

const initialState: GameState = {
  player: savedGame?.player ?? defaultPlayer,
  quest: savedGame?.quest ?? defaultQuest,
  collectedPickupIds: savedGame?.collectedPickupIds ?? [],
  droppedPickups: savedGame?.droppedPickups ?? [],
  ui: {
    dialogueOpen: false,
    questOpen: false,
    deathOpen: false,
    inventoryOpen: false,
    prompt: null,
    notification: null,
    levelUpMessage: null
  }
};

let state = initialState;
const listeners = new Set<StateListener>();
let notificationTimeoutId: number | null = null;

function emit(): void {
  for (const listener of listeners) {
    listener();
  }
}

function persist(): void {
  saveGame({
    player: state.player,
    quest: state.quest,
    collectedPickupIds: state.collectedPickupIds,
    droppedPickups: state.droppedPickups
  });
}

function setState(updater: (previous: GameState) => GameState): void {
  state = updater(state);
  emit();
}

function patchUi(patch: Partial<UiState>): void {
  const nextUi = {
    ...state.ui,
    ...patch
  };

  if (
    nextUi.dialogueOpen === state.ui.dialogueOpen &&
    nextUi.questOpen === state.ui.questOpen &&
    nextUi.deathOpen === state.ui.deathOpen &&
    nextUi.inventoryOpen === state.ui.inventoryOpen &&
    nextUi.prompt === state.ui.prompt &&
    nextUi.notification === state.ui.notification &&
    nextUi.levelUpMessage === state.ui.levelUpMessage
  ) {
    return;
  }

  setState((previous) => ({
    ...previous,
    ui: nextUi
  }));
}

function patchPlayer(patch: Partial<GameState['player']>): void {
  const nextPlayer = {
    ...state.player,
    ...patch
  };

  if (
    nextPlayer.id === state.player.id &&
    nextPlayer.name === state.player.name &&
    nextPlayer.level === state.player.level &&
    nextPlayer.xp === state.player.xp &&
    nextPlayer.maxXp === state.player.maxXp &&
    nextPlayer.hp === state.player.hp &&
    nextPlayer.maxHp === state.player.maxHp &&
    nextPlayer.gold === state.player.gold &&
    nextPlayer.inventory === state.player.inventory
  ) {
    return;
  }

  setState((previous) => ({
    ...previous,
    player: nextPlayer
  }));
  persist();
}

function patchQuest(patch: Partial<QuestState>): void {
  const nextQuest = {
    ...state.quest,
    ...patch,
    reward: patch.reward ? { ...state.quest.reward, ...patch.reward } : state.quest.reward
  };

  if (
    nextQuest.id === state.quest.id &&
    nextQuest.name === state.quest.name &&
    nextQuest.description === state.quest.description &&
    nextQuest.progress === state.quest.progress &&
    nextQuest.target === state.quest.target &&
    nextQuest.completed === state.quest.completed &&
    nextQuest.rewardClaimed === state.quest.rewardClaimed &&
    nextQuest.reward.xp === state.quest.reward.xp &&
    nextQuest.reward.gold === state.quest.reward.gold
  ) {
    return;
  }

  setState((previous) => ({
    ...previous,
    quest: nextQuest
  }));
  persist();
}

function updateQuest(mutator: (quest: QuestState) => QuestState): void {
  const nextQuest = mutator(state.quest);
  patchQuest(nextQuest);
}

function updatePlayer(mutator: (player: GameState['player']) => GameState['player']): void {
  const nextPlayer = mutator(state.player);
  patchPlayer(nextPlayer);
}

function replaceInventory(inventory: InventoryItem[]): void {
  patchPlayer({
    inventory: inventory.map((item) => ({
      ...item,
      stats: item.stats.map((line) => ({ ...line })),
      bonuses: item.bonuses.map((line) => ({ ...line })),
      powers: [...item.powers],
      attributes: [...item.attributes],
      effects: [...item.effects]
    }))
  });
}

function addInventoryItem(itemId: string, quantity = 1): InventoryItem | null {
  if (quantity <= 0) {
    return null;
  }

  const itemDefinition = createInventoryItemById(itemId);
  if (!itemDefinition) {
    return null;
  }

  let collectedItem: InventoryItem | null = null;
  updatePlayer((player) => {
    const existingItem = player.inventory.find((entry) => entry.id === itemId);
    if (existingItem) {
      collectedItem = { ...existingItem, quantity: existingItem.quantity + quantity };
      return {
        ...player,
        inventory: player.inventory.map((entry) => (
          entry.id === itemId
            ? {
              ...entry,
              quantity: entry.quantity + quantity
            }
            : entry
        ))
      };
    }

    collectedItem = {
      ...itemDefinition,
      quantity
    };
    return {
      ...player,
      inventory: [...player.inventory, collectedItem]
    };
  });

  return collectedItem;
}

function consumeInventoryItem(itemId: string, quantity = 1): boolean {
  if (quantity <= 0) {
    return false;
  }

  let consumed = false;
  updatePlayer((player) => {
    const existingItem = player.inventory.find((entry) => entry.id === itemId);
    if (!existingItem || existingItem.quantity < quantity) {
      return player;
    }

    consumed = true;
    return {
      ...player,
      inventory: player.inventory.flatMap((entry) => {
        if (entry.id !== itemId) {
          return [entry];
        }

        const nextQuantity = entry.quantity - quantity;
        if (nextQuantity <= 0) {
          return [];
        }

        return [{
          ...entry,
          quantity: nextQuantity
        }];
      })
    };
  });

  return consumed;
}

function addCollectedPickupId(pickupId: string): void {
  if (state.collectedPickupIds.includes(pickupId)) {
    return;
  }

  setState((previous) => ({
    ...previous,
    collectedPickupIds: [...previous.collectedPickupIds, pickupId]
  }));
  persist();
}

function addDroppedPickup(pickup: DroppedPickupState): void {
  setState((previous) => ({
    ...previous,
    droppedPickups: [...previous.droppedPickups.filter((entry) => entry.pickupId !== pickup.pickupId), { ...pickup }]
  }));
  persist();
}

function removeDroppedPickup(pickupId: string): void {
  if (!state.droppedPickups.some((pickup) => pickup.pickupId === pickupId)) {
    return;
  }

  setState((previous) => ({
    ...previous,
    droppedPickups: previous.droppedPickups.filter((pickup) => pickup.pickupId !== pickupId)
  }));
  persist();
}

function hydrate(snapshot: SavedGameSnapshot): void {
  setState((previous) => ({
    ...previous,
    player: snapshot.player,
    quest: snapshot.quest,
    collectedPickupIds: snapshot.collectedPickupIds,
    droppedPickups: snapshot.droppedPickups
  }));
}

export const gameStore = {
  getState: () => state,
  subscribe(listener: StateListener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  hydrate,
  patchPlayer,
  updatePlayer,
  replaceInventory,
  addInventoryItem,
  consumeInventoryItem,
  patchQuest,
  updateQuest,
  addCollectedPickupId,
  addDroppedPickup,
  removeDroppedPickup,
  patchUi,
  setPrompt(prompt: string | null) {
    patchUi({ prompt });
  },
  setDialogueOpen(dialogueOpen: boolean) {
    patchUi({ dialogueOpen, questOpen: dialogueOpen });
  },
  setQuestOpen(questOpen: boolean) {
    patchUi({ questOpen });
  },
  setDeathOpen(deathOpen: boolean) {
    patchUi({ deathOpen });
  },
  setInventoryOpen(inventoryOpen: boolean) {
    patchUi({ inventoryOpen });
  },
  toggleInventoryOpen() {
    patchUi({ inventoryOpen: !state.ui.inventoryOpen });
  },
  setNotification(notification: NotificationState | null) {
    if (notificationTimeoutId !== null && typeof window !== 'undefined') {
      window.clearTimeout(notificationTimeoutId);
      notificationTimeoutId = null;
    }

    patchUi({ notification });

    if (!notification || typeof window === 'undefined') {
      return;
    }

    notificationTimeoutId = window.setTimeout(() => {
      notificationTimeoutId = null;
      patchUi({ notification: null });
    }, 2200);
  },
  setLevelUpMessage(levelUpMessage: string | null) {
    patchUi({ levelUpMessage });
  },
  resetUi() {
    patchUi({
      dialogueOpen: false,
      questOpen: false,
      deathOpen: false,
      inventoryOpen: false,
      prompt: null,
      notification: null,
      levelUpMessage: null
    });
  }
};

export function useGameStore<T>(selector: (current: GameState) => T): T {
  return useSyncExternalStore(
    gameStore.subscribe,
    () => selector(gameStore.getState()),
    () => selector(initialState)
  );
}

export function resetQuestProgress(): void {
  gameStore.updateQuest((quest) => ({
    ...quest,
    progress: 0,
    completed: false,
    rewardClaimed: false
  }));
}