import Phaser from 'phaser';

export class ForestGuide extends Phaser.GameObjects.Image {
  public readonly id = 'forest-guide';

  public constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'forest-guide');
    scene.add.existing(this);
    this.setDepth(18);
    this.setScale(1.05);
  }
}