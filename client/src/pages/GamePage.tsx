import { useEffect } from 'react';
import { DialoguePanel } from '@/components/DialoguePanel';
import { DeathOverlay } from '@/components/DeathOverlay';
import { GameCanvas } from '@/components/GameCanvas';
import { Hud } from '@/components/Hud';
import { InventoryWindow } from '@/components/InventoryWindow';
import { QuestPanel } from '@/components/QuestPanel';
import { gameStore, useGameStore } from '@/state/gameStore';

interface GamePageProps {
  onReturnToMenu: () => void;
}

export function GamePage({ onReturnToMenu }: GamePageProps) {
  const levelUpMessage = useGameStore((state) => state.ui.levelUpMessage);
  const notification = useGameStore((state) => state.ui.notification);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
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

  return (
    <div className="game-shell">
      <div className="game-toolbar">
        <button className="secondary-button" type="button" onClick={onReturnToMenu}>
          RETURN TO MENU
        </button>
      </div>
      <GameCanvas initialSceneKey="GameScene" />
      {/* <Hud /> */}
      <InventoryWindow />
      <DialoguePanel />
      <QuestPanel />
      <DeathOverlay />
      {levelUpMessage ? <div className="level-up-toast">{levelUpMessage}</div> : null}
      {notification ? <div className="notification-toast">{notification.message}</div> : null}
    </div>
  );
}