import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { gameRuntime } from '@/game/bridge/GameRuntime';
import { useGameStore } from '@/state/gameStore';
export function DeathOverlay() {
    const deathOpen = useGameStore((state) => state.ui.deathOpen);
    if (!deathOpen) {
        return null;
    }
    return (_jsx("div", { className: "death-backdrop", children: _jsxs("div", { className: "death-panel", style: { textAlign: 'center' }, children: [_jsx("h2", { className: "panel-title", style: { color: '#ff8f99', fontSize: '2.5rem' }, children: "YOU DIED" }), _jsx("p", { className: "panel-copy", children: "The forest is dangerous. Respawn at the entrance and try again." }), _jsx("div", { className: "dialogue-actions", style: { justifyContent: 'center' }, children: _jsx("button", { className: "primary-button", type: "button", onClick: () => gameRuntime.respawnPlayer(), children: "RESPAWN" }) })] }) }));
}
