import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { DialoguePanel } from '@/components/DialoguePanel';
import { DeathOverlay } from '@/components/DeathOverlay';
import { GameCanvas } from '@/components/GameCanvas';
import { Hud } from '@/components/Hud';
import { QuestPanel } from '@/components/QuestPanel';
import { useGameStore } from '@/state/gameStore';
export function GamePage({ onReturnToMenu }) {
    const levelUpMessage = useGameStore((state) => state.ui.levelUpMessage);
    const notification = useGameStore((state) => state.ui.notification);
    return (_jsxs("div", { className: "game-shell", children: [_jsx("div", { className: "game-toolbar", children: _jsx("button", { className: "secondary-button", type: "button", onClick: onReturnToMenu, children: "RETURN TO MENU" }) }), _jsx(GameCanvas, { initialSceneKey: "GameScene" }), _jsx(Hud, {}), _jsx(DialoguePanel, {}), _jsx(QuestPanel, {}), _jsx(DeathOverlay, {}), levelUpMessage ? _jsx("div", { className: "level-up-toast", children: levelUpMessage }) : null, notification ? _jsx("div", { className: "notification-toast", children: notification.message }) : null] }));
}
