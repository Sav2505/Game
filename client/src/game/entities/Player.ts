import Phaser from 'phaser';
import { CharacterRenderer } from '@/game/character/CharacterRenderer';
import { createDefaultPlayerCharacter } from '@/game/character/catalog';
import { calculateFinalCharacterStats } from '@/game/character/calculateFinalStats';
import type { CharacterAnimationState, CharacterFacingDirection, PlayerCharacter } from '@/game/character/types';
import { PLAYER_CONFIG } from '@/game/config/constants';
import { HealthComponent } from '@/game/systems/HealthComponent';

export interface PlayerControls {
  left: boolean;
  right: boolean;
  jumpPressed: boolean;
  attackPressed: boolean;
}

export interface PlayerConfig {
  movementSpeed: number;
  jumpForce: number;
  gravity: number;
  maxHp?: number;
  attackDamage?: number;
  attackCooldown: number;
  character?: PlayerCharacter;
}

export class Player extends Phaser.Physics.Arcade.Sprite {
  public readonly id = 'player-1';

  public readonly character: PlayerCharacter;

  public readonly characterRenderer: CharacterRenderer;

  public readonly finalStats: ReturnType<typeof calculateFinalCharacterStats>;

  public readonly health: HealthComponent;

  public readonly attackDamage: number;

  public readonly attackCooldown: number;

  public facing: 'left' | 'right' = 'right';

  public state: 'idle' | 'run' | 'jump' | 'doubleJump' | 'fall' | 'attack' | 'hurt' | 'dead' = 'idle';

  private lastAttackTime = -Infinity;

  private hurtUntil = 0;

  private canDoubleJump = true;

  private hasUsedDoubleJump = false;

  private jumpWasPressed = false;

  public constructor(scene: Phaser.Scene, x: number, y: number, config: Partial<PlayerConfig> = {}) {
    const character = config.character ?? createDefaultPlayerCharacter();
    const finalStats = calculateFinalCharacterStats(character.baseStats, character.equipment);
    super(scene, x, y, character.appearance.body);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.character = character;
    this.finalStats = finalStats;
    this.characterRenderer = new CharacterRenderer(scene, character, x, y - 28);
    this.characterRenderer.setScale(3);
    this.setDepth(20);
    this.setCollideWorldBounds(true);
    this.setScale(1.2);
    this.setVisible(false);

    const body = this.body as Phaser.Physics.Arcade.Body;
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

  public beginAttack(time: number): boolean {
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

  public takeDamage(amount: number): boolean {
    const died = this.health.takeDamage(amount);
    if (!died) {
      this.state = 'hurt';
      this.hurtUntil = this.scene.time.now + 180;
      this.setTint(0xff7f93);
    }
    this.syncRenderer(this.scene.time.now);
    return died;
  }

  public applyDamageKnockback(fromX: number): void {
    const direction = this.x >= fromX ? 1 : -1;
    this.setVelocityX(160 * direction);
    this.setVelocityY(-120);
    this.syncRenderer(this.scene.time.now);
  }

  public die(): void {
    this.state = 'dead';
    this.setVelocity(0, 0);
    this.setTint(0x8e94aa);
    this.disableBody(true, false);
    this.syncRenderer(this.scene.time.now);
    this.emit('death');
  }

  public respawn(x: number, y: number, maxHp: number): void {
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
    this.syncRenderer(this.scene.time.now);
  }

  public updateControls(controls: PlayerControls, time: number): void {
    if (this.isDead) {
      return;
    }

    if (time < this.hurtUntil && this.state === 'hurt') {
      this.syncRenderer(time);
      return;
    }

    const body = this.body as Phaser.Physics.Arcade.Body;
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
    } else {
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
      } else if (this.canDoubleJump && !this.hasUsedDoubleJump && isRising) {
        const doubleJumpForce = PLAYER_CONFIG.jumpForce * 1.18;
        this.setVelocityY(-doubleJumpForce);
        this.state = 'doubleJump';
        this.canDoubleJump = false;
        this.hasUsedDoubleJump = true;
      }
    }

    if (this.state === 'doubleJump' && isFalling) {
      this.state = 'fall';
    } else if (this.state === 'jump' && isFalling) {
      this.state = 'fall';
    } else if (body.blocked.down && moveDirection === 0) {
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

    this.syncRenderer(time);
  }

  public get isDead(): boolean {
    return this.health.isDead;
  }

  private syncRenderer(time: number): void {
    this.characterRenderer.setPosition(this.x, this.y - 28);
    this.characterRenderer.setFacingDirection(this.facing as CharacterFacingDirection);
    const animationState = this.state === 'run' ? 'walk' : this.state;
    this.characterRenderer.playAnimation(animationState as CharacterAnimationState);
    this.characterRenderer.update(time);
  }

  public override destroy(fromScene?: boolean): void {
    this.characterRenderer.destroy();
    super.destroy(fromScene);
  }
}