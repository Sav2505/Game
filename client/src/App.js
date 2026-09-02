import { jsx as _jsx } from "react/jsx-runtime";
import { useState } from 'react';
import { MainMenuPage } from './pages/MainMenuPage';
import { GamePage } from './pages/GamePage';
import { CharacterShowcasePage } from './pages/CharacterShowcasePage';
export default function App() {
    const [screen, setScreen] = useState('menu');
    if (screen === 'game') {
        return _jsx(GamePage, { onReturnToMenu: () => setScreen('menu') });
    }
    if (screen === 'showcase') {
        return _jsx(CharacterShowcasePage, { onReturnToMenu: () => setScreen('menu') });
    }
    return _jsx(MainMenuPage, { onPlay: () => setScreen('game'), onShowcase: () => setScreen('showcase') });
}
