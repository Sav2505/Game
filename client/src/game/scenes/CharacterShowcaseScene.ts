import Phaser from 'phaser';
import { CharacterRenderer } from '@/game/character/CharacterRenderer';
import { characterStore } from '@/state/characterStore';

export class CharacterShowcaseScene extends Phaser.Scene {
  private characterRenderer!: CharacterRenderer;

  private unsubscribeStore?: () => void;

  private keys!: {
    one: Phaser.Input.Keyboard.Key;
    two: Phaser.Input.Keyboard.Key;
    three: Phaser.Input.Keyboard.Key;
    four: Phaser.Input.Keyboard.Key;
    five: Phaser.Input.Keyboard.Key;
    left: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
    attack: Phaser.Input.Keyboard.Key;
    hurt: Phaser.Input.Keyboard.Key;
    idle: Phaser.Input.Keyboard.Key;
  };

  public constructor() {
    super('CharacterShowcaseScene');
  }

  public create(): void {
    const width = this.scale.width;
    const height = this.scale.height;

    this.add.rectangle(0, 0, width, height, 0x0b1328).setOrigin(0).setDepth(-50);
    this.add.rectangle(0, height - 170, width, 170, 0x2e5740).setOrigin(0).setDepth(-40);
    this.add.circle(width * 0.18, height * 0.24, 120, 0x7cc9ff, 0.18).setDepth(-45);
    this.add.circle(width * 0.74, height * 0.2, 180, 0xfff0a8, 0.08).setDepth(-45);
    this.add.text(32, 28, 'Character Showcase', {
      fontFamily: 'Inter, sans-serif',
      fontSize: '28px',
      color: '#fff7d5'
    }).setDepth(5);
    this.add.text(32, 64, '1-5 toggle demo equipment | arrows face | A/D animate | Z=death pose', {
      fontFamily: 'Inter, sans-serif',
      fontSize: '15px',
      color: '#aab6d6'
    }).setDepth(5);

    this.characterRenderer = new CharacterRenderer(this, characterStore.getState().character, width * 0.5, height * 0.82);
    this.characterRenderer.setScale(5.2);
    this.characterRenderer.setFacingDirection('right');
    this.characterRenderer.playAnimation('idle');

    this.unsubscribeStore = characterStore.subscribe(() => {
      const current = characterStore.getState();
      this.characterRenderer.setCharacter(current.character);
      this.characterRenderer.setFacingDirection(current.facingDirection);
      this.characterRenderer.playAnimation(current.animationState);
    });

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.unsubscribeStore?.();
    });

    this.keys = this.input.keyboard?.addKeys({
      one: Phaser.Input.Keyboard.KeyCodes.ONE,
      two: Phaser.Input.Keyboard.KeyCodes.TWO,
      three: Phaser.Input.Keyboard.KeyCodes.THREE,
      four: Phaser.Input.Keyboard.KeyCodes.FOUR,
      five: Phaser.Input.Keyboard.KeyCodes.FIVE,
      left: Phaser.Input.Keyboard.KeyCodes.LEFT,
      right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
      attack: Phaser.Input.Keyboard.KeyCodes.A,
      hurt: Phaser.Input.Keyboard.KeyCodes.Z,
      idle: Phaser.Input.Keyboard.KeyCodes.SPACE
    }) as CharacterShowcaseScene['keys'];
  }

  public update(time: number): void {
    if (Phaser.Input.Keyboard.JustDown(this.keys.one)) {
      characterStore.toggleDemoEquipment('top');
    }
    if (Phaser.Input.Keyboard.JustDown(this.keys.two)) {
      characterStore.toggleDemoEquipment('helmet');
    }
    if (Phaser.Input.Keyboard.JustDown(this.keys.three)) {
      characterStore.toggleDemoEquipment('weapon');
    }
    if (Phaser.Input.Keyboard.JustDown(this.keys.four)) {
      characterStore.toggleDemoEquipment('shoes');
    }
    if (Phaser.Input.Keyboard.JustDown(this.keys.five)) {
      characterStore.toggleDemoEquipment('cape');
    }

    if (this.keys.left.isDown) {
      characterStore.setFacingDirection('left');
      characterStore.playAnimation('walk');
    } else if (this.keys.right.isDown) {
      characterStore.setFacingDirection('right');
      characterStore.playAnimation('walk');
    } else if (Phaser.Input.Keyboard.JustDown(this.keys.attack)) {
      characterStore.playAnimation('attack');
    } else if (Phaser.Input.Keyboard.JustDown(this.keys.hurt)) {
      characterStore.playAnimation('hurt');
    } else if (Phaser.Input.Keyboard.JustDown(this.keys.idle)) {
      characterStore.playAnimation('idle');
    }

    const bob = Math.sin(time / 220) * 2;
    this.characterRenderer.setPosition(this.scale.width * 0.5, this.scale.height * 0.82 + bob);
    this.characterRenderer.update(time);
  }
}