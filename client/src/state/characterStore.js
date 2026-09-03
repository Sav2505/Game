import { useSyncExternalStore } from 'react';
import { calculateFinalCharacterStats } from '@/game/character/calculateFinalStats';
import { DEMO_EQUIPMENT, createDefaultPlayerCharacter } from '@/game/character/catalog';
const initialCharacter = createDefaultPlayerCharacter();
let state = {
    character: initialCharacter,
    finalStats: calculateFinalCharacterStats(initialCharacter.baseStats, initialCharacter.equipment),
    animationState: 'idle',
    facingDirection: 'right'
};
const listeners = new Set();
function emit() {
    for (const listener of listeners) {
        listener();
    }
}
function syncCharacter(character) {
    state = {
        ...state,
        character,
        finalStats: calculateFinalCharacterStats(character.baseStats, character.equipment)
    };
    emit();
}
export const characterStore = {
    getState: () => state,
    subscribe(listener) {
        listeners.add(listener);
        return () => listeners.delete(listener);
    },
    setFacingDirection(facingDirection) {
        if (state.facingDirection === facingDirection) {
            return;
        }
        state = { ...state, facingDirection };
        emit();
    },
    playAnimation(animationState) {
        if (state.animationState === animationState) {
            return;
        }
        state = { ...state, animationState };
        emit();
    },
    setEquipment(slot, item) {
        const nextCharacter = {
            ...state.character,
            equipment: {
                ...state.character.equipment,
                [slot]: item
            }
        };
        syncCharacter(nextCharacter);
    },
    toggleDemoEquipment(slot) {
        const demoItem = DEMO_EQUIPMENT[slot === 'top'
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
                                : 'redCape'];
        const currentItem = state.character.equipment[slot] ?? null;
        characterStore.setEquipment(slot, currentItem ? null : demoItem);
    },
    reset() {
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
export function useCharacterStore(selector) {
    return useSyncExternalStore(characterStore.subscribe, () => selector(characterStore.getState()), () => selector(state));
}
