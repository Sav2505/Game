import { useState } from 'react';
import { MainMenuPage } from './pages/MainMenuPage';
import { GamePage } from './pages/GamePage';
import { CharacterShowcasePage } from './pages/CharacterShowcasePage';

type Screen = 'menu' | 'game' | 'showcase';

export default function App() {
  const [screen, setScreen] = useState<Screen>('menu');

  if (screen === 'game') {
    return <GamePage onReturnToMenu={() => setScreen('menu')} />;
  }

  if (screen === 'showcase') {
    return <CharacterShowcasePage onReturnToMenu={() => setScreen('menu')} />;
  }

  return <MainMenuPage onPlay={() => setScreen('game')} onShowcase={() => setScreen('showcase')} />;
}