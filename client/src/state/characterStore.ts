import { useSyncExternalStore } from 'react';
import { calculateFinalCharacterStats } from '@/game/character/calculateFinalStats';
import { DEMO_EQUIPMENT, createDefaultPlayerCharacter } from '@/game/character/catalog';
import type { CharacterAnimationState, CharacterFacingDirection, CharacterEquipment, CharacterStats, EquipmentItem, EquipmentType, PlayerCharacter } from '@/game/character/types';
import { loadSavedGame } from '@/services/SaveService';

interface CharacterShowcaseState {
  character: PlayerCharacter;
  finalStats: CharacterStats;
  animationState: CharacterAnimationState;
  facingDirection: CharacterFacingDirection;
}

const CHARACTER_SAVE_KEY = 'modern-rpg.character.v1';

function cloneEquipmentItem(item: EquipmentItem): EquipmentItem {
  const nextItem: EquipmentItem = {
    ...item,
    statBonuses: { ...item.statBonuses }
  };

  if (item.render) {
    nextItem.render = { ...item.render };
  }

  return nextItem;
}

function cloneCharacter(character: PlayerCharacter): PlayerCharacter {
  return {
    ...character,
    appearance: { ...character.appearance },
    baseStats: { ...character.baseStats },
    equipment: Object.fromEntries(
      Object.entries(character.equipment).map(([slot, item]) => [slot, item ? cloneEquipmentItem(item) : item])
    )
  } as PlayerCharacter;
}

function sanitizeEquipment(character: PlayerCharacter): PlayerCharacter {
  const savedInventory = loadSavedGame()?.player.inventory ?? [];
  const inventoryItemIds = new Set(
    savedInventory
      .filter((item) => item.quantity > 0)
      .map((item) => item.id)
  );

  const nextEquipment: CharacterEquipment = { ...character.equipment };
  for (const [slot, item] of Object.entries(nextEquipment)) {
    if (!item || inventoryItemIds.has(item.id)) {
      continue;
    }

    nextEquipment[slot as EquipmentType] = null;
  }

  return {
    ...character,
    equipment: nextEquipment
  };
}

function loadSavedCharacter(): PlayerCharacter {
  const fallbackCharacter = sanitizeEquipment(createDefaultPlayerCharacter());
  if (typeof window === 'undefined') {
    return fallbackCharacter;
  }

  const raw = window.localStorage.getItem(CHARACTER_SAVE_KEY);
  if (!raw) {
    return fallbackCharacter;
  }

  try {
    const parsed = JSON.parse(raw) as PlayerCharacter;
    return sanitizeEquipment({
      ...fallbackCharacter,
      ...parsed,
      appearance: {
        ...fallbackCharacter.appearance,
        ...parsed.appearance
      },
      baseStats: {
        ...fallbackCharacter.baseStats,
        ...parsed.baseStats
      },
      equipment: {
        ...fallbackCharacter.equipment,
        ...parsed.equipment
      }
    });
  } catch {
    return fallbackCharacter;
  }
}

function persistCharacter(character: PlayerCharacter): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(CHARACTER_SAVE_KEY, JSON.stringify(character));
}

const initialCharacter = loadSavedCharacter();

let state: CharacterShowcaseState = {
  character: initialCharacter,
  finalStats: calculateFinalCharacterStats(initialCharacter.baseStats, initialCharacter.equipment),
  animationState: 'idle',
  facingDirection: 'right'
};

const listeners = new Set<() => void>();

function emit(): void {
  for (const listener of listeners) {
    listener();
  }
}

function syncCharacter(character: PlayerCharacter): void {
  const nextCharacter = sanitizeEquipment(cloneCharacter(character));
  state = {
    ...state,
    character: nextCharacter,
    finalStats: calculateFinalCharacterStats(nextCharacter.baseStats, nextCharacter.equipment)
  };
  persistCharacter(nextCharacter);
  emit();
}

export const characterStore = {
  getState: () => state,
  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  setFacingDirection(facingDirection: CharacterFacingDirection): void {
    if (state.facingDirection === facingDirection) {
      return;
    }

    state = { ...state, facingDirection };
    emit();
  },
  playAnimation(animationState: CharacterAnimationState): void {
    if (state.animationState === animationState) {
      return;
    }

    state = { ...state, animationState };
    emit();
  },
  setEquipment(slot: EquipmentType, item: EquipmentItem | null): void {
    const nextCharacter: PlayerCharacter = {
      ...state.character,
      equipment: {
        ...state.character.equipment,
        [slot]: item
      }
    };

    syncCharacter(nextCharacter);
  },
  toggleDemoEquipment(slot: 'top' | 'pants' | 'helmet' | 'weapon' | 'shoes' | 'gloves' | 'cape'): void {
    const demoItem = DEMO_EQUIPMENT[
      slot === 'top'
        ? 'basicShirt'
        : slot === 'pants'
          ? 'basicPants'
          : slot === 'helmet'
            ? 'ironHelmet'
            : slot === 'weapon'
              ? 'woodenSword'
              : slot === 'shoes'
                ? 'shoes1'
                : slot === 'gloves'
                  ? 'leatherGloves'
                  : 'redCape'
    ];
    const currentItem = state.character.equipment[slot] ?? null;
    characterStore.setEquipment(slot, currentItem ? null : demoItem);
  },
  reset(): void {
    const nextCharacter = sanitizeEquipment(createDefaultPlayerCharacter());
    state = {
      character: nextCharacter,
      finalStats: calculateFinalCharacterStats(nextCharacter.baseStats, nextCharacter.equipment),
      animationState: 'idle',
      facingDirection: 'right'
    };
    persistCharacter(nextCharacter);
    emit();
  }
};

export function useCharacterStore<T>(selector: (current: CharacterShowcaseState) => T): T {
  return useSyncExternalStore(characterStore.subscribe, () => selector(characterStore.getState()), () => selector(state));
}

export type { CharacterShowcaseState };