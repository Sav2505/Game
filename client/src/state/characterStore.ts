import { useSyncExternalStore } from 'react';
import { calculateFinalCharacterStats } from '@/game/character/calculateFinalStats';
import { DEMO_EQUIPMENT, createDefaultPlayerCharacter } from '@/game/character/catalog';
import type { CharacterAnimationState, CharacterFacingDirection, CharacterEquipment, CharacterStats, EquipmentItem, EquipmentType, PlayerCharacter } from '@/game/character/types';

interface CharacterShowcaseState {
  character: PlayerCharacter;
  finalStats: CharacterStats;
  animationState: CharacterAnimationState;
  facingDirection: CharacterFacingDirection;
}

const initialCharacter = createDefaultPlayerCharacter();

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
  state = {
    ...state,
    character,
    finalStats: calculateFinalCharacterStats(character.baseStats, character.equipment)
  };
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
  toggleDemoEquipment(slot: 'top' | 'pants' | 'helmet' | 'weapon' | 'shoes' | 'cape'): void {
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
                ? 'leatherBoots'
                : 'redCape'
    ];
    const currentItem = state.character.equipment[slot] ?? null;
    characterStore.setEquipment(slot, currentItem ? null : demoItem);
  },
  reset(): void {
    const nextCharacter = createDefaultPlayerCharacter();
    state = {
      character: nextCharacter,
      finalStats: calculateFinalCharacterStats(nextCharacter.baseStats, nextCharacter.equipment),
      animationState: 'idle',
      facingDirection: 'right'
    };
    emit();
  }
};

export function useCharacterStore<T>(selector: (current: CharacterShowcaseState) => T): T {
  return useSyncExternalStore(characterStore.subscribe, () => selector(characterStore.getState()), () => selector(state));
}

export type { CharacterShowcaseState };