import { CharacterShowcasePanel } from '@/components/CharacterShowcasePanel';
import { GameCanvas } from '@/components/GameCanvas';

interface CharacterShowcasePageProps {
  onReturnToMenu: () => void;
}

export function CharacterShowcasePage({ onReturnToMenu }: CharacterShowcasePageProps) {
  return (
    <div className="game-shell showcase-layout">
      <div className="game-toolbar">
        <button className="secondary-button" type="button" onClick={onReturnToMenu}>
          RETURN TO MENU
        </button>
      </div>
      <div className="showcase-canvas-column">
        <GameCanvas initialSceneKey="CharacterShowcaseScene" />
      </div>
      <CharacterShowcasePanel />
    </div>
  );
}