import { useSyncExternalStore } from 'react';
import { defaultPlayer, defaultQuest, loadSavedGame, saveGame } from '@/services/SaveService';
const savedGame = loadSavedGame();
const initialState = {
    player: savedGame?.player ?? defaultPlayer,
    quest: savedGame?.quest ?? defaultQuest,
    ui: {
        dialogueOpen: false,
        questOpen: false,
        deathOpen: false,
        prompt: null,
        notification: null,
        levelUpMessage: null
    }
};
let state = initialState;
const listeners = new Set();
function emit() {
    for (const listener of listeners) {
        listener();
    }
}
function persist() {
    saveGame({
        player: state.player,
        quest: state.quest
    });
}
function setState(updater) {
    state = updater(state);
    emit();
}
function patchUi(patch) {
    const nextUi = {
        ...state.ui,
        ...patch
    };
    if (nextUi.dialogueOpen === state.ui.dialogueOpen &&
        nextUi.questOpen === state.ui.questOpen &&
        nextUi.deathOpen === state.ui.deathOpen &&
        nextUi.prompt === state.ui.prompt &&
        nextUi.notification === state.ui.notification &&
        nextUi.levelUpMessage === state.ui.levelUpMessage) {
        return;
    }
    setState((previous) => ({
        ...previous,
        ui: nextUi
    }));
}
function patchPlayer(patch) {
    const nextPlayer = {
        ...state.player,
        ...patch
    };
    if (nextPlayer.id === state.player.id &&
        nextPlayer.name === state.player.name &&
        nextPlayer.level === state.player.level &&
        nextPlayer.xp === state.player.xp &&
        nextPlayer.maxXp === state.player.maxXp &&
        nextPlayer.hp === state.player.hp &&
        nextPlayer.maxHp === state.player.maxHp &&
        nextPlayer.gold === state.player.gold) {
        return;
    }
    setState((previous) => ({
        ...previous,
        player: nextPlayer
    }));
    persist();
}
function patchQuest(patch) {
    const nextQuest = {
        ...state.quest,
        ...patch,
        reward: patch.reward ? { ...state.quest.reward, ...patch.reward } : state.quest.reward
    };
    if (nextQuest.id === state.quest.id &&
        nextQuest.name === state.quest.name &&
        nextQuest.description === state.quest.description &&
        nextQuest.progress === state.quest.progress &&
        nextQuest.target === state.quest.target &&
        nextQuest.completed === state.quest.completed &&
        nextQuest.rewardClaimed === state.quest.rewardClaimed &&
        nextQuest.reward.xp === state.quest.reward.xp &&
        nextQuest.reward.gold === state.quest.reward.gold) {
        return;
    }
    setState((previous) => ({
        ...previous,
        quest: nextQuest
    }));
    persist();
}
function updateQuest(mutator) {
    const nextQuest = mutator(state.quest);
    patchQuest(nextQuest);
}
function updatePlayer(mutator) {
    const nextPlayer = mutator(state.player);
    patchPlayer(nextPlayer);
}
function hydrate(snapshot) {
    setState((previous) => ({
        ...previous,
        player: snapshot.player,
        quest: snapshot.quest
    }));
}
export const gameStore = {
    getState: () => state,
    subscribe(listener) {
        listeners.add(listener);
        return () => listeners.delete(listener);
    },
    hydrate,
    patchPlayer,
    updatePlayer,
    patchQuest,
    updateQuest,
    patchUi,
    setPrompt(prompt) {
        patchUi({ prompt });
    },
    setDialogueOpen(dialogueOpen) {
        patchUi({ dialogueOpen, questOpen: dialogueOpen });
    },
    setQuestOpen(questOpen) {
        patchUi({ questOpen });
    },
    setDeathOpen(deathOpen) {
        patchUi({ deathOpen });
    },
    setNotification(notification) {
        patchUi({ notification });
    },
    setLevelUpMessage(levelUpMessage) {
        patchUi({ levelUpMessage });
    },
    resetUi() {
        patchUi({
            dialogueOpen: false,
            questOpen: false,
            deathOpen: false,
            prompt: null,
            notification: null,
            levelUpMessage: null
        });
    }
};
export function useGameStore(selector) {
    return useSyncExternalStore(gameStore.subscribe, () => selector(gameStore.getState()), () => selector(initialState));
}
export function resetQuestProgress() {
    gameStore.updateQuest((quest) => ({
        ...quest,
        progress: 0,
        completed: false,
        rewardClaimed: false
    }));
}
