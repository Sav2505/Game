import Phaser from 'phaser';
import { ensureCharacterTextures } from '@/game/character/ensureCharacterTextures';
import { ensureTextures } from '@/game/utils/createTextures';

export class BootScene extends Phaser.Scene {
  public constructor() {
    super('BootScene');
  }

  public create(): void {
    ensureTextures(this);
    ensureCharacterTextures(this);
    this.scene.start('PreloadScene');
  }
}