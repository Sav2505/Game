import Phaser from 'phaser';

export interface WorldPickupItemConfig {
  pickupId: string;
  itemId: string;
  textureKey: string;
  scale?: number;
}

export class WorldPickupItem extends Phaser.Physics.Arcade.Sprite {
  public readonly pickupId: string;

  public readonly itemId: string;

  private collected = false;

  private floatTween?: Phaser.Tweens.Tween;

  public constructor(scene: Phaser.Scene, x: number, y: number, config: WorldPickupItemConfig) {
    super(scene, x, y, config.textureKey);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.pickupId = config.pickupId;
    this.itemId = config.itemId;

    this.setDepth(19);
    this.setScale(config.scale ?? 0.18);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setImmovable(true);
    body.setSize(Math.max(18, Math.round(this.width * 0.6)), Math.max(20, Math.round(this.height * 0.72)), true);

    this.floatTween = scene.tweens.add({
      targets: this,
      y: y - 8,
      duration: 1200,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1
    });
  }

  public collectTo(targetX: number, targetY: number, onComplete: () => void): void {
    if (this.collected) {
      return;
    }

    this.collected = true;
    this.floatTween?.stop();

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.enable = false;

    this.scene.tweens.add({
      targets: this,
      x: targetX,
      y: targetY,
      angle: this.angle + 18,
      scale: 0.35,
      alpha: 0,
      duration: 260,
      ease: 'Cubic.easeIn',
      onComplete: () => {
        this.destroy();
        onComplete();
      }
    });
  }

  public get isCollected(): boolean {
    return this.collected;
  }
}