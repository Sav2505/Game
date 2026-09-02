export class CombatSystem {
    scene;
    constructor(scene) {
        this.scene = scene;
    }
    performPlayerAttack(player, slimes) {
        if (!player.beginAttack(this.scene.time.now)) {
            return false;
        }
        const hitWidth = 88;
        const hitHeight = 58;
        const offsetX = player.facing === 'right' ? 54 : -54;
        const hitbox = this.scene.add.zone(player.x + offsetX, player.y - 6, hitWidth, hitHeight);
        this.scene.physics.add.existing(hitbox);
        const body = hitbox.body;
        body.setAllowGravity(false);
        body.setImmovable(true);
        const hitTargets = new Set();
        const overlap = this.scene.physics.add.overlap(hitbox, slimes, (_hitbox, target) => {
            const slime = target;
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
