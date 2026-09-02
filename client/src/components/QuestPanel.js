import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { gameRuntime } from '@/game/bridge/GameRuntime';
import { gameStore, useGameStore } from '@/state/gameStore';
export function QuestPanel() {
    const isOpen = useGameStore((state) => state.ui.questOpen);
    const quest = useGameStore((state) => state.quest);
    if (!isOpen) {
        return null;
    }
    return (_jsx("div", { className: "quest-backdrop", children: _jsxs("div", { className: "quest-panel", children: [_jsx("h2", { className: "panel-title", children: quest.name }), _jsx("p", { className: "panel-copy", children: quest.description }), _jsxs("div", { className: "quest-progress", children: ["Progress: ", quest.progress, " / ", quest.target] }), _jsxs("div", { className: "quest-reward", children: [_jsx("span", { children: "Reward" }), _jsxs("span", { children: [quest.reward.xp, " XP"] }), _jsxs("span", { children: [quest.reward.gold, " Gold"] })] }), _jsxs("div", { className: "quest-actions", children: [quest.completed && !quest.rewardClaimed ? (_jsx("button", { className: "primary-button", type: "button", onClick: () => gameRuntime.claimQuestReward(), children: "Claim Reward" })) : null, _jsx("button", { className: "ghost-button", type: "button", onClick: () => {
                                gameStore.setQuestOpen(false);
                            }, children: "Close" })] })] }) }));
}
