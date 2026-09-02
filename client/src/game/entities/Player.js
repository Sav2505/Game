import Phaser from 'phaser';
import { CharacterRenderer } from '@/game/character/CharacterRenderer';
import { createDefaultPlayerCharacter } from '@/game/character/catalog';
import { calculateFinalCharacterStats } from '@/game/character/calculateFinalStats';
import { PLAYER_CHARACTER_RENDER_CONFIG } from '@/game/character/renderConfig';
import { PLAYER_CONFIG } from '@/game/config/constants';
import { HealthComponent } from '@/game/systems/HealthComponent';
export class Player extends Phaser.Physics.Arcade.Sprite {
    static HURT_STUN_MS = 180;
    static HURT_VISUAL_MS = 5000;
    id = 'player-1';
    character;
    characterRenderer;
    finalStats;
    health;
    attackDamage;
    attackCooldown;
    facing = 'right';
    state = 'idle';
    lastAttackTime = -Infinity;
    hurtUntil = 0;
    hurtVisualUntil = 0;
    canDoubleJump = true;
    hasUsedDoubleJump = false;
    jumpWasPressed = false;
    walkAnimationReadyAt = 0;
    wasRunOnGround = false;
    constructor(scene, x, y, config = {}) {
        const character = config.character ?? createDefaultPlayerCharacter();
        const finalStats = calculateFinalCharacterStats(character.baseStats, character.equipment);
        super(scene, x, y, character.appearance.body);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.character = character;
        this.finalStats = finalStats;
        this.characterRenderer = new CharacterRenderer(scene, character, x, y - 28);
        this.characterRenderer.setScale(PLAYER_CHARACTER_RENDER_CONFIG.rendererScale);
        this.setDepth(20);
        this.setCollideWorldBounds(true);
        this.setScale(1.2);
        this.setVisible(false);
        const body = this.body;
        body.setSize(34, 52, true);
        body.setMaxVelocity(360, 900);
        body.setDragX(1400);
        this.attackDamage = config.attackDamage ?? finalStats.attack;
        this.attackCooldown = config.attackCooldown ?? PLAYER_CONFIG.attackCooldown;
        this.health = new HealthComponent(config.maxHp ?? finalStats.maxHp, {
            onDeath: () => this.die()
        });
        body.setGravityY(config.gravity ?? PLAYER_CONFIG.gravity);
        this.canDoubleJump = true;
        this.hasUsedDoubleJump = false;
        this.jumpWasPressed = false;
        this.syncRenderer(0);
    }
    beginAttack(time) {
        if (this.isDead || time < this.lastAttackTime + this.attackCooldown) {
            return false;
        }
        this.lastAttackTime = time;
        this.state = 'attack';
        this.setTint(0xffe07a);
        this.setVelocityX(0);
        this.syncRenderer(time);
        return true;
    }
    takeDamage(amount, source = 'other') {
        const died = this.health.takeDamage(amount);
        if (!died) {
            this.state = 'hurt';
            this.hurtUntil = this.scene.time.now + Player.HURT_STUN_MS;
            if (source === 'monster') {
                this.hurtVisualUntil = this.scene.time.now + Player.HURT_VISUAL_MS;
            }
            this.setTint(0xff7f93);
        }
        this.syncRenderer(this.scene.time.now);
        return died;
    }
    applyDamageKnockback(fromX) {
        const direction = this.x >= fromX ? 1 : -1;
        this.setVelocityX(160 * direction);
        this.setVelocityY(-120);
        this.syncRenderer(this.scene.time.now);
    }
    die() {
        this.state = 'dead';
        this.setVelocity(0, 0);
        this.setTint(0x8e94aa);
        this.disableBody(true, false);
        this.syncRenderer(this.scene.time.now);
        this.emit('death');
    }
    respawn(x, y, maxHp) {
        this.enableBody(true, x, y, true, true);
        this.health.maxHP = maxHp;
        this.health.currentHP = maxHp;
        this.health.isDead = false;
        this.state = 'idle';
        this.setTint(0xffffff);
        this.setVelocity(0, 0);
        this.canDoubleJump = true;
        this.hasUsedDoubleJump = false;
        this.jumpWasPressed = false;
        this.hurtVisualUntil = 0;
        this.syncRenderer(this.scene.time.now);
    }
    updateControls(controls, time) {
        if (this.isDead) {
            return;
        }
        if (time < this.hurtUntil && this.state === 'hurt') {
            this.syncRenderer(time);
            return;
        }
        const body = this.body;
        const moveDirection = controls.left ? -1 : controls.right ? 1 : 0;
        const jumpPressedThisFrame = controls.jumpPressed && !this.jumpWasPressed;
        const isRising = !body.blocked.down && body.velocity.y < -10;
        const isFalling = !body.blocked.down && body.velocity.y > 10;
        this.jumpWasPressed = controls.jumpPressed;
        if (body.blocked.down) {
            this.canDoubleJump = true;
            this.hasUsedDoubleJump = false;
        }
        if (moveDirection !== 0) {
            this.setVelocityX(moveDirection * PLAYER_CONFIG.movementSpeed);
            this.facing = moveDirection < 0 ? 'left' : 'right';
            this.setFlipX(this.facing === 'left');
            if (body.blocked.down) {
                this.state = 'run';
            }
        }
        else {
            this.setVelocityX(0);
            if (body.blocked.down) {
                this.state = 'idle';
            }
        }
        if (jumpPressedThisFrame) {
            if (body.blocked.down) {
                this.setVelocityY(-PLAYER_CONFIG.jumpForce);
                this.state = 'jump';
                this.canDoubleJump = true;
                this.hasUsedDoubleJump = false;
            }
            else if (this.canDoubleJump && !this.hasUsedDoubleJump && isRising) {
                const doubleJumpForce = Math.round(PLAYER_CONFIG.jumpForce * PLAYER_CONFIG.doubleJumpMultiplier);
                this.setVelocityY(-doubleJumpForce);
                this.state = 'doubleJump';
                this.canDoubleJump = false;
                this.hasUsedDoubleJump = true;
            }
        }
        if (this.state === 'doubleJump' && isFalling) {
            this.state = 'fall';
        }
        else if (this.state === 'jump' && isFalling) {
            this.state = 'fall';
        }
        else if (body.blocked.down && moveDirection === 0) {
            this.state = 'idle';
        }
        if (controls.attackPressed) {
            this.beginAttack(time);
        }
        if (time >= this.lastAttackTime + 120 && this.state === 'attack') {
            this.state = body.blocked.down ? 'idle' : 'fall';
            this.clearTint();
        }
        if (time >= this.hurtUntil && this.state === 'hurt') {
            this.state = body.blocked.down ? 'idle' : 'fall';
            this.clearTint();
        }
        const isRunOnGround = this.state === 'run' && body.blocked.down;
        if (isRunOnGround) {
            if (!this.wasRunOnGround) {
                this.walkAnimationReadyAt = time + PLAYER_CONFIG.walkAnimationDelayMs;
            }
        }
        else {
            this.walkAnimationReadyAt = 0;
        }
        this.wasRunOnGround = isRunOnGround;
        this.syncRenderer(time);
    }
    get isDead() {
        return this.health.isDead;
    }
    syncRenderer(time) {
        this.characterRenderer.setPosition(this.x, this.y - 28);
        this.characterRenderer.setFacingDirection(this.facing);
        const hasActiveHurtVisual = time < this.hurtVisualUntil && this.state !== 'dead';
        const animationState = hasActiveHurtVisual
            ? 'hurt'
            : this.state === 'run'
                ? 'idle'
                : this.state === 'jump' || this.state === 'fall'
                    ? 'idle'
                    : this.state === 'doubleJump'
                        ? 'jump'
                        : this.state;
        this.characterRenderer.playAnimation(animationState);
        this.characterRenderer.update(time);
    }
    destroy(fromScene) {
        this.characterRenderer.destroy();
        super.destroy(fromScene);
    }
}
