import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { CharacterShowcasePanel } from '@/components/CharacterShowcasePanel';
import { GameCanvas } from '@/components/GameCanvas';
export function CharacterShowcasePage({ onReturnToMenu }) {
    return (_jsxs("div", { className: "game-shell showcase-layout", children: [_jsx("div", { className: "game-toolbar", children: _jsx("button", { className: "secondary-button", type: "button", onClick: onReturnToMenu, children: "RETURN TO MENU" }) }), _jsx("div", { className: "showcase-canvas-column", children: _jsx(GameCanvas, { initialSceneKey: "CharacterShowcaseScene" }) }), _jsx(CharacterShowcasePanel, {})] }));
}
