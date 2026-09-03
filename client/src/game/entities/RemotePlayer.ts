import Phaser from 'phaser';
import type { RemotePlayerSnapshot } from '@shared/types';
import { CharacterRenderer } from '@/game/character/CharacterRenderer';
import { PLAYER_CHARACTER_RENDER_CONFIG } from '@/game/character/renderConfig';
import type { PlayerCharacter } from '@/game/character/types';

export class RemotePlayer {
  public readonly playerId: string;

  private readonly characterRenderer: CharacterRenderer;

  public constructor(scene: Phaser.Scene, snapshot: RemotePlayerSnapshot) {
    this.playerId = snapshot.playerId;
    this.characterRenderer = new CharacterRenderer(scene, snapshot.character as PlayerCharacter, snapshot.x, snapshot.y - 28);
    this.characterRenderer.setScale(PLAYER_CHARACTER_RENDER_CONFIG.rendererScale);
    this.characterRenderer.container.setDepth(16);
    this.applySnapshot(snapshot);
  }

  public applySnapshot(snapshot: RemotePlayerSnapshot): void {
    this.characterRenderer.setCharacter(snapshot.character as PlayerCharacter);
    this.characterRenderer.setPosition(snapshot.x, snapshot.y - 28);
    this.characterRenderer.setFacingDirection(snapshot.facing);
    this.characterRenderer.playAnimation(snapshot.animationState === 'death' ? 'death' : snapshot.animationState);
  }

  public update(time: number): void {
    this.characterRenderer.update(time);
  }

  public destroy(): void {
    this.characterRenderer.destroy();
  }
}