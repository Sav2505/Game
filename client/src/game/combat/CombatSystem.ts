import Phaser from 'phaser';
import type { Player } from '@/game/entities/Player';
import type { Slime } from '@/game/entities/Slime';

export class CombatSystem {
  public constructor(private readonly scene: Phaser.Scene) {}

  public performPlayerAttack(player: Player, slimes: Slime[]): boolean {
    if (!player.beginAttack(this.scene.time.now)) {
      return false;
    }

    const hitWidth = 88;
    const hitHeight = 58;
    const offsetX = player.facing === 'right' ? 54 : -54;
    const hitbox = this.scene.add.zone(player.x + offsetX, player.y - 6, hitWidth, hitHeight);
    this.scene.physics.add.existing(hitbox);

    const body = hitbox.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setImmovable(true);

    const hitTargets = new Set<Slime>();

    const overlap = this.scene.physics.add.overlap(hitbox, slimes, (_hitbox, target) => {
      const slime = target as Slime;
      if (hitTargets.has(slime) || slime.isDead) {
        return;
      }

      hitTargets.add(slime);
      slime.takeDamage(player.attackDamage, player);
      this.scene.events.emit('combat:damage', {
        sourceId: player.id,
        targetId: slime.id,
        amount: player.attackDamage
      });
      this.scene.events.emit('combat:impact', slime.x, slime.y - 8);
    });

    this.scene.time.delayedCall(120, () => {
      overlap.destroy();
      hitbox.destroy();
    });

    return true;
  }
}