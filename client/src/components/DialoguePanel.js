import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { gameRuntime } from '@/game/bridge/GameRuntime';
import { gameStore, useGameStore } from '@/state/gameStore';
export function DialoguePanel() {
    const isOpen = useGameStore((state) => state.ui.dialogueOpen);
    const quest = useGameStore((state) => state.quest);
    if (!isOpen) {
        return null;
    }
    return (_jsx("div", { className: "dialogue-backdrop", children: _jsxs("div", { className: "dialogue-layout", children: [_jsxs("div", { className: "dialogue-panel", children: [_jsx("h2", { className: "panel-title npc-name", children: "Forest Guide" }), _jsx("p", { className: "panel-copy", children: "Welcome, adventurer!" }), _jsx("p", { className: "panel-copy", children: "The forest is full of dangerous Slimes." }), _jsx("p", { className: "panel-copy", children: "Can you defeat 3 of them?" }), _jsxs("div", { className: "dialogue-actions", children: [_jsx("button", { className: "primary-button", type: "button", onClick: () => gameRuntime.claimQuestReward(), children: "Claim Quest Reward" }), _jsx("button", { className: "secondary-button", type: "button", onClick: () => gameRuntime.respawnPlayer(), children: "Respawn" }), _jsx("button", { className: "ghost-button", type: "button", onClick: () => {
                                        gameStore.setDialogueOpen(false);
                                        gameStore.setQuestOpen(false);
                                        gameStore.setPrompt(null);
                                    }, children: "Close" })] })] }), _jsxs("div", { className: "quest-panel", children: [_jsx("h2", { className: "panel-title", children: "Quest" }), _jsx("div", { className: "panel-copy", children: quest.name }), _jsxs("div", { className: "quest-progress", children: ["Defeat 3 Slimes.", _jsx("br", {}), "Progress: ", quest.progress, " / ", quest.target] }), _jsxs("div", { className: "quest-reward", children: [_jsx("span", { children: "Reward" }), _jsxs("span", { children: [quest.reward.xp, " XP"] }), _jsxs("span", { children: [quest.reward.gold, " Gold"] })] }), _jsx("div", { className: "quest-actions", children: _jsx("button", { className: "secondary-button", type: "button", onClick: () => gameRuntime.claimQuestReward(), children: "Claim Reward" }) })] })] }) }));
}
