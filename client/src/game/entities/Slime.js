import Phaser from 'phaser';
import { HealthComponent } from '@/game/systems/HealthComponent';
import { SLIME_CONFIG } from '@/game/config/constants';
export class Slime extends Phaser.Physics.Arcade.Sprite {
    id;
    health;
    damage;
    xpReward;
    goldReward;
    patrolRadius;
    detectionRange;
    attackRange;
    speed;
    state = 'patrol';
    patrolCenterX;
    patrolDirection = -1;
    nextAttackTime = 0;
    hurtUntil = 0;
    onDefeated;
    constructor(scene, x, y, config = {}) {
        super(scene, x, y, 'slime');
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.id = `slime-${crypto.randomUUID()}`;
        this.setDepth(18);
        this.setScale(1.15);
        const body = this.body;
        body.setSize(28, 28, true);
        body.setBounce(0);
        body.setCollideWorldBounds(true);
        this.health = new HealthComponent(config.hp ?? SLIME_CONFIG.hp, {
            onDeath: () => this.die()
        });
        this.damage = config.damage ?? SLIME_CONFIG.damage;
        this.xpReward = config.xpReward ?? SLIME_CONFIG.xpReward;
        this.goldReward = config.goldReward ?? SLIME_CONFIG.goldReward;
        this.patrolRadius = config.patrolRadius ?? SLIME_CONFIG.patrolRadius;
        this.detectionRange = config.detectionRange ?? SLIME_CONFIG.detectionRange;
        this.attackRange = config.attackRange ?? SLIME_CONFIG.attackRange;
        this.speed = config.speed ?? SLIME_CONFIG.speed;
        this.onDefeated = config.onDefeated ?? (() => undefined);
        this.patrolCenterX = x;
    }
    update(time, player) {
        if (this.isDead) {
            return;
        }
        const body = this.body;
        const distanceToPlayer = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
        const distanceFromCenter = this.x - this.patrolCenterX;
        if (time < this.hurtUntil && this.state === 'hurt') {
            return;
        }
        if (distanceToPlayer <= this.attackRange) {
            this.state = 'attack';
            this.setVelocityX(0);
            this.setFlipX(player.x < this.x);
            if (time >= this.nextAttackTime) {
                this.nextAttackTime = time + SLIME_CONFIG.attackCooldown;
                player.takeDamage(this.damage);
                player.applyDamageKnockback(this.x);
            }
            return;
        }
        if (distanceToPlayer <= this.detectionRange) {
            this.state = 'chase';
            const direction = player.x < this.x ? -1 : 1;
            this.setVelocityX(direction * this.speed);
            this.setFlipX(direction < 0);
            if (Math.abs(distanceFromCenter) > this.patrolRadius * 1.5) {
                this.setVelocityX(-Math.sign(distanceFromCenter) * this.speed);
            }
            return;
        }
        this.state = 'patrol';
        if (distanceFromCenter > this.patrolRadius) {
            this.patrolDirection = -1;
        }
        else if (distanceFromCenter < -this.patrolRadius) {
            this.patrolDirection = 1;
        }
        this.setVelocityX(this.patrolDirection * this.speed * 0.72);
        this.setFlipX(this.patrolDirection < 0);
    }
    takeDamage(amount, _source) {
        if (this.isDead) {
            return false;
        }
        const died = this.health.takeDamage(amount);
        this.state = died ? 'dead' : 'hurt';
        this.hurtUntil = this.scene.time.now + 160;
        if (!died) {
            const direction = this.flipX ? 1 : -1;
            this.setVelocityX(direction * 120);
            this.setTint(0xff9595);
            this.scene.time.delayedCall(120, () => this.clearTint());
        }
        return died;
    }
    die() {
        if (this.state === 'dead') {
            return;
        }
        this.state = 'dead';
        this.setVelocity(0, 0);
        this.setTint(0xa0a7be);
        this.disableBody(false, false);
        this.onDefeated(this);
    }
    get isDead() {
        return this.health.isDead;
    }
}
