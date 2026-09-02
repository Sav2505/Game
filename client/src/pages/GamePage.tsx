import { DialoguePanel } from '@/components/DialoguePanel';
import { DeathOverlay } from '@/components/DeathOverlay';
import { GameCanvas } from '@/components/GameCanvas';
import { Hud } from '@/components/Hud';
import { QuestPanel } from '@/components/QuestPanel';
import { useGameStore } from '@/state/gameStore';

interface GamePageProps {
  onReturnToMenu: () => void;
}

export function GamePage({ onReturnToMenu }: GamePageProps) {
  const levelUpMessage = useGameStore((state) => state.ui.levelUpMessage);
  const notification = useGameStore((state) => state.ui.notification);

  return (
    <div className="game-shell">
      <div className="game-toolbar">
        <button className="secondary-button" type="button" onClick={onReturnToMenu}>
          RETURN TO MENU
        </button>
      </div>
      <GameCanvas initialSceneKey="GameScene" />
      {/* <Hud /> */}
      <DialoguePanel />
      <QuestPanel />
      <DeathOverlay />
      {levelUpMessage ? <div className="level-up-toast">{levelUpMessage}</div> : null}
      {notification ? <div className="notification-toast">{notification.message}</div> : null}
    </div>
  );
}