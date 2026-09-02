import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { createGameConfig } from '@/game/config/createGameConfig';

let activeGame: Phaser.Game | null = null;

interface GameCanvasProps {
  initialSceneKey?: 'GameScene' | 'CharacterShowcaseScene';
}

export function GameCanvas({ initialSceneKey = 'GameScene' }: GameCanvasProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || activeGame) {
      return undefined;
    }

    const game = new Phaser.Game(createGameConfig(host, initialSceneKey));
    activeGame = game;

    const resizeObserver = new ResizeObserver(() => {
      const width = host.clientWidth;
      const height = host.clientHeight;
      if (width > 0 && height > 0) {
        game.scale.resize(width, height);
      }
    });

    resizeObserver.observe(host);

    return () => {
      resizeObserver.disconnect();
      if (activeGame === game) {
        activeGame = null;
      }
      game.destroy(true);
    };
  }, [initialSceneKey]);

  return <div className="game-canvas-host" ref={hostRef} />;
}