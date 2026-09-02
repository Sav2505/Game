import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from './constants';
import { BootScene } from '@/game/scenes/BootScene';
import { PreloadScene } from '@/game/scenes/PreloadScene';
import { GameScene } from '@/game/scenes/GameScene';
import { CharacterShowcaseScene } from '@/game/scenes/CharacterShowcaseScene';

export function createGameConfig(parent: HTMLElement, launchScene: 'GameScene' | 'CharacterShowcaseScene' = 'GameScene'): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO,
    parent,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    transparent: false,
    backgroundColor: '#8ed6ff',
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { x: 0, y: 1200 },
        debug: false
      }
    },
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: GAME_WIDTH,
      height: GAME_HEIGHT
    },
    render: {
      antialias: false,
      pixelArt: true,
      roundPixels: true
    },
    scene: [BootScene, PreloadScene, GameScene, CharacterShowcaseScene],
    callbacks: {
      postBoot(game) {
        game.registry.set('launchScene', launchScene);
      }
    },
    dom: {
      createContainer: false
    }
  };
}