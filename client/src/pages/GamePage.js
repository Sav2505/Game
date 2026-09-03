import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
import { DialoguePanel } from '@/components/DialoguePanel';
import { DeathOverlay } from '@/components/DeathOverlay';
import { GameCanvas } from '@/components/GameCanvas';
import { InventoryWindow } from '@/components/InventoryWindow';
import { QuestPanel } from '@/components/QuestPanel';
import { gameStore, useGameStore } from '@/state/gameStore';
export function GamePage({ onReturnToMenu }) {
    const levelUpMessage = useGameStore((state) => state.ui.levelUpMessage);
    const notification = useGameStore((state) => state.ui.notification);
    useEffect(() => {
        const onKeyDown = (event) => {
            const isInventoryKey = event.code === 'KeyI' || event.key.toLowerCase() === 'i';
            if (event.repeat || !isInventoryKey) {
                return;
            }
            const target = event.target;
            if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement) {
                return;
            }
            event.preventDefault();
            gameStore.toggleInventoryOpen();
        };
        window.addEventListener('keydown', onKeyDown);
        return () => {
            window.removeEventListener('keydown', onKeyDown);
        };
    }, []);
    return (_jsxs("div", { className: "game-shell", children: [_jsx("div", { className: "game-toolbar", children: _jsx("button", { className: "secondary-button", type: "button", onClick: onReturnToMenu, children: "RETURN TO MENU" }) }), _jsx(GameCanvas, { initialSceneKey: "GameScene" }), _jsx(InventoryWindow, {}), _jsx(DialoguePanel, {}), _jsx(QuestPanel, {}), _jsx(DeathOverlay, {}), levelUpMessage ? _jsx("div", { className: "level-up-toast", children: levelUpMessage }) : null, notification ? _jsx("div", { className: "notification-toast", children: notification.message }) : null] }));
}
