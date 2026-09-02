import Phaser from 'phaser';
import { calculateFinalCharacterStats } from './calculateFinalStats';
import type {
  CharacterAnimationState,
  CharacterEquipment,
  CharacterFacingDirection,
  EquipmentItem,
  PlayerCharacter,
} from './types';
import { ensureCharacterTextures } from './ensureCharacterTextures';

type LayerKey =
  | 'shadow'
  | 'cape'
  | 'backLeg'
  | 'frontLeg'
  | 'backShoe'
  | 'frontShoe'
  | 'torso'
  | 'backArm'
  | 'frontArm'
  | 'head'
  | 'body'
  | 'top'
  | 'pants'
  | 'gloves'
  | 'face'
  | 'hair'
  | 'helmet'
  | 'weapon'
  | 'accessory'
  | 'effect';

type RenderLayer = {
  image: Phaser.GameObjects.Image;
  baseX: number;
  baseY: number;
};

export class CharacterRenderer {
  public readonly container: Phaser.GameObjects.Container;

  private readonly scene: Phaser.Scene;

  private readonly layers = new Map<LayerKey, RenderLayer>();

  private character: PlayerCharacter;

  private facingDirection: CharacterFacingDirection = 'right';

  private renderScale = 1;

  private animationState: CharacterAnimationState = 'idle';

  private baseX = 0;

  private baseY = 0;

  private currentTime = 0;

  private expression: 'idle' | 'smile' | 'surprised' | 'hurt' | 'dead' = 'idle';

  public constructor(scene: Phaser.Scene, character: PlayerCharacter, x = 0, y = 0) {
    this.scene = scene;
    this.character = character;
    ensureCharacterTextures(scene);
    this.container = scene.add.container(x, y);
    this.container.setDepth(30);
    this.buildLayers();
    this.setCharacter(character);
    this.setPosition(x, y);
  }

  public setPosition(x: number, y: number): void {
    this.baseX = x;
    this.baseY = y;
    this.container.setPosition(x, y);
  }

  public setFacingDirection(direction: CharacterFacingDirection): void {
    this.facingDirection = direction;
    this.applyTransformScale();
  }

  public setScale(scale: number): void {
    this.renderScale = scale;
    this.applyTransformScale();
  }

  public playAnimation(state: CharacterAnimationState): void {
    this.animationState = state;
    this.applyAnimationState(this.currentTime);
  }

  public setCharacter(character: PlayerCharacter): void {
    this.character = character;
    this.setAppearance(character.appearance);
    this.setEquipment(character.equipment);
  }

  public setAppearance(characterAppearance: PlayerCharacter['appearance']): void {
    this.updateLayerTexture('body', characterAppearance.body, false);
    this.layers.get('shadow')?.image.setVisible(true);
    this.layers.get('body')?.image.setVisible(true);

    const placeholderLayerKeys: LayerKey[] = ['torso', 'head', 'face', 'hair', 'backArm', 'frontArm', 'backLeg', 'frontLeg', 'backShoe', 'frontShoe', 'cape', 'top', 'pants', 'gloves', 'helmet', 'accessory', 'weapon', 'effect'];
    for (const key of placeholderLayerKeys) {
      this.layers.get(key)?.image.setVisible(false);
    }
  }

  public setEquipment(equipmentPatch: Partial<CharacterEquipment>): void {
    const nextEquipment = {
      ...this.character.equipment,
      ...equipmentPatch
    };

    this.character = {
      ...this.character,
      equipment: nextEquipment
    };

    this.updateEquipmentLayer('helmet', nextEquipment.helmet ?? null);
    this.updateEquipmentLayer('top', nextEquipment.top ?? null);
    this.updateEquipmentLayer('pants', nextEquipment.pants ?? null);
    this.updateEquipmentLayer('backShoe', nextEquipment.shoes ?? null);
    this.updateEquipmentLayer('frontShoe', nextEquipment.shoes ?? null);
    this.updateEquipmentLayer('gloves', nextEquipment.gloves ?? null);
    this.updateEquipmentLayer('cape', nextEquipment.cape ?? null);
    this.updateEquipmentLayer('weapon', nextEquipment.weapon ?? null);
    this.updateEquipmentLayer('accessory', nextEquipment.accessory ?? null);
  }

  public getStats(): ReturnType<typeof calculateFinalCharacterStats> {
    return calculateFinalCharacterStats(this.character.baseStats, this.character.equipment);
  }

  public update(time: number): void {
    this.currentTime = time;
    this.applyAnimationState(time);
  }

  public destroy(): void {
    this.container.destroy(true);
  }

  private applyTransformScale(): void {
    const directionMultiplier = this.facingDirection === 'left' ? -1 : 1;
    this.container.setScale(directionMultiplier * this.renderScale, this.renderScale);
  }

  private buildLayers(): void {
    const layerOrder: Array<{ key: LayerKey; textureKey: string; x: number; y: number; scale?: number; alpha?: number }> = [
      { key: 'shadow', textureKey: 'character-shadow', x: 0, y: 66, alpha: 0.85, scale: 1 },
      { key: 'cape', textureKey: 'character-cape-red', x: -10, y: 12, scale: 1 },
      { key: 'backLeg', textureKey: 'character-leg-base', x: -10, y: 30, scale: 1 },
      { key: 'frontLeg', textureKey: 'character-leg-base', x: 10, y: 30, scale: 1 },
      { key: 'backShoe', textureKey: 'character-shoes-basic', x: -10, y: 30, scale: 1 },
      { key: 'frontShoe', textureKey: 'character-shoes-basic', x: 10, y: 30, scale: 1 },
      { key: 'pants', textureKey: 'character-pants-basic', x: 0, y: 26, scale: 1 },
      { key: 'body', textureKey: 'player-base-body', x: 0, y: 8, scale: 1 },
      { key: 'backArm', textureKey: 'character-arm-base', x: -23, y: 6, scale: 1 },
      { key: 'torso', textureKey: 'character-torso-base', x: 0, y: 8, scale: 1 },
      { key: 'top', textureKey: 'character-top-basic', x: 0, y: 8, scale: 1 },
      { key: 'gloves', textureKey: 'character-gloves-basic', x: 0, y: 6, scale: 1 },
      { key: 'frontArm', textureKey: 'character-arm-base', x: 23, y: 6, scale: 1 },
      { key: 'head', textureKey: 'character-head-base', x: 0, y: -28, scale: 1 },
      { key: 'face', textureKey: 'character-face-idle', x: 0, y: -28, scale: 1 },
      { key: 'hair', textureKey: 'character-hair-default', x: 0, y: -33, scale: 1 },
      { key: 'helmet', textureKey: 'character-helmet-basic', x: 0, y: -36, scale: 1 },
      { key: 'accessory', textureKey: 'character-accessory-star', x: 16, y: -10, scale: 1 },
      { key: 'weapon', textureKey: 'character-weapon-wooden-sword', x: 34, y: 14, scale: 1 },
      { key: 'effect', textureKey: 'character-effect-glow', x: 0, y: 8, alpha: 0, scale: 1 }
    ];

    for (const layer of layerOrder) {
      const image = this.scene.add.image(layer.x, layer.y, layer.textureKey);
      image.setOrigin(0.5, 0.5);
      if (layer.key === 'body') {
        image.setDisplaySize(36, 36);
      }
      if (typeof layer.alpha === 'number') {
        image.setAlpha(layer.alpha);
      }
      if (typeof layer.scale === 'number') {
        image.setScale(layer.scale);
      }
      const isVisibleBaseLayer = layer.key === 'shadow' || layer.key === 'body';
      image.setVisible(isVisibleBaseLayer);
      this.container.add(image);
      this.layers.set(layer.key, {
        image,
        baseX: layer.x,
        baseY: layer.y
      });
    }
  }

  private updateLayerTexture(layerKey: LayerKey, textureKey: string, tintable = false, tintColor?: string): void {
    const layer = this.layers.get(layerKey);
    if (!layer) {
      return;
    }

    if (layerKey !== 'body' && layerKey !== 'shadow') {
      layer.image.setVisible(false);
      return;
    }

    layer.image.setTexture(textureKey);
    layer.image.setVisible(true);
    if (tintable && tintColor) {
      layer.image.setTint(Phaser.Display.Color.HexStringToColor(tintColor).color);
    } else {
      layer.image.clearTint();
    }
  }

  private updateEquipmentLayer(slot: LayerKey, item: EquipmentItem | null): void {
    const layer = this.layers.get(slot);
    if (!layer) {
      return;
    }

    const placeholderSlots: LayerKey[] = ['cape', 'pants', 'backShoe', 'frontShoe', 'top', 'helmet', 'weapon', 'accessory', 'gloves'];
    if (placeholderSlots.includes(slot)) {
      layer.image.setVisible(false);
      return;
    }

    if (!item) {
      layer.image.setVisible(false);
      return;
    }

    layer.image.setTexture(item.spriteKey);
    layer.image.setVisible(true);
  }

  private applyAnimationState(time: number): void {
    const shadow = this.layers.get('shadow')?.image;
    const effect = this.layers.get('effect')?.image;
    const weapon = this.layers.get('weapon')?.image;
    const face = this.layers.get('face')?.image;
    const frontArm = this.layers.get('frontArm')?.image;
    const backArm = this.layers.get('backArm')?.image;
    const frontLeg = this.layers.get('frontLeg')?.image;
    const backLeg = this.layers.get('backLeg')?.image;
    const frontShoe = this.layers.get('frontShoe')?.image;
    const backShoe = this.layers.get('backShoe')?.image;
    const head = this.layers.get('head')?.image;
    const body = this.layers.get('body')?.image;

    const walkBob = Math.sin(time / 140) * 2;
    const idleBob = Math.sin(time / 260) * 1.1;
    const attackPulse = Math.sin(time / 45) * 2;
    const walkSwing = Math.sin(time / 130) * 6;

    const resetImage = (key: LayerKey): Phaser.GameObjects.Image | undefined => this.layers.get(key)?.image;

    const backArmBase = this.layers.get('backArm')?.baseX ?? 0;
    const frontArmBase = this.layers.get('frontArm')?.baseX ?? 0;
    const backLegBase = this.layers.get('backLeg')?.baseX ?? 0;
    const frontLegBase = this.layers.get('frontLeg')?.baseX ?? 0;
    const backShoeBase = this.layers.get('backShoe')?.baseX ?? 0;
    const frontShoeBase = this.layers.get('frontShoe')?.baseX ?? 0;
    const weaponBase = this.layers.get('weapon')?.baseX ?? 0;
    const headBase = this.layers.get('head')?.baseY ?? 0;

    const backArmImage = resetImage('backArm');
    const frontArmImage = resetImage('frontArm');
    const backLegImage = resetImage('backLeg');
    const frontLegImage = resetImage('frontLeg');
    const backShoeImage = resetImage('backShoe');
    const frontShoeImage = resetImage('frontShoe');
    const weaponImage = resetImage('weapon');
    const headImage = resetImage('head');

    if (backArmImage) {
      backArmImage.x = backArmBase;
      backArmImage.y = this.layers.get('backArm')?.baseY ?? backArmImage.y;
      backArmImage.rotation = 0;
    }
    if (frontArmImage) {
      frontArmImage.x = frontArmBase;
      frontArmImage.y = this.layers.get('frontArm')?.baseY ?? frontArmImage.y;
      frontArmImage.rotation = 0;
    }
    if (backLegImage) {
      backLegImage.x = backLegBase;
      backLegImage.y = this.layers.get('backLeg')?.baseY ?? backLegImage.y;
      backLegImage.rotation = 0;
    }
    if (frontLegImage) {
      frontLegImage.x = frontLegBase;
      frontLegImage.y = this.layers.get('frontLeg')?.baseY ?? frontLegImage.y;
      frontLegImage.rotation = 0;
    }
    if (backShoeImage) {
      backShoeImage.x = backShoeBase;
      backShoeImage.y = this.layers.get('backShoe')?.baseY ?? backShoeImage.y;
      backShoeImage.rotation = 0;
    }
    if (frontShoeImage) {
      frontShoeImage.x = frontShoeBase;
      frontShoeImage.y = this.layers.get('frontShoe')?.baseY ?? frontShoeImage.y;
      frontShoeImage.rotation = 0;
    }
    if (weaponImage) {
      weaponImage.x = weaponBase;
      weaponImage.y = this.layers.get('weapon')?.baseY ?? weaponImage.y;
      weaponImage.rotation = 0;
    }
    if (headImage) {
      headImage.y = headBase;
    }

    let yOffset = 0;
    let weaponRotation = 0;
    let alpha = 1;
    let nextExpression: typeof this.expression = 'idle';

    switch (this.animationState) {
      case 'walk':
        yOffset = walkBob;
        weaponRotation = Math.sin(time / 90) * 0.1;
        nextExpression = 'smile';
        if (frontArm) {
          frontArm.y = (this.layers.get('frontArm')?.baseY ?? 0) + Math.sin(time / 120) * 2;
          frontArm.rotation = walkSwing * 0.01;
        }
        if (backArm) {
          backArm.y = (this.layers.get('backArm')?.baseY ?? 0) - Math.sin(time / 120) * 2;
          backArm.rotation = -walkSwing * 0.01;
        }
        if (frontLeg) {
          frontLeg.y = (this.layers.get('frontLeg')?.baseY ?? 0) + Math.sin(time / 120) * 3;
          frontLeg.rotation = -walkSwing * 0.012;
        }
        if (backLeg) {
          backLeg.y = (this.layers.get('backLeg')?.baseY ?? 0) - Math.sin(time / 120) * 3;
          backLeg.rotation = walkSwing * 0.012;
        }
        if (frontShoe && frontLeg) {
          frontShoe.y = frontLeg.y;
          frontShoe.rotation = frontLeg.rotation;
        }
        if (backShoe && backLeg) {
          backShoe.y = backLeg.y;
          backShoe.rotation = backLeg.rotation;
        }
        break;
      case 'jump':
        yOffset = -8;
        weaponRotation = -0.3;
        nextExpression = 'surprised';
        if (frontArm) {
          frontArm.y = (this.layers.get('frontArm')?.baseY ?? 0) - 4;
          frontArm.rotation = -0.3;
        }
        if (backArm) {
          backArm.y = (this.layers.get('backArm')?.baseY ?? 0) - 4;
          backArm.rotation = 0.25;
        }
        if (frontShoe && frontLeg) {
          frontShoe.y = frontLeg.y;
          frontShoe.rotation = frontLeg.rotation;
        }
        if (backShoe && backLeg) {
          backShoe.y = backLeg.y;
          backShoe.rotation = backLeg.rotation;
        }
        break;
      case 'attack':
        yOffset = attackPulse * 0.3;
        weaponRotation = this.facingDirection === 'right' ? -0.7 + attackPulse * 0.04 : 0.7 - attackPulse * 0.04;
        nextExpression = 'smile';
        if (frontArm) {
          frontArm.rotation = this.facingDirection === 'right' ? 0.8 : -0.8;
          frontArm.y = (this.layers.get('frontArm')?.baseY ?? 0) - 3;
        }
        if (backArm) {
          backArm.rotation = this.facingDirection === 'right' ? -0.15 : 0.15;
        }
        if (effect) {
          effect.setAlpha(0.8);
          effect.setScale(1.08);
        }
        break;
      case 'hurt':
        yOffset = -1 + Math.sin(time / 40) * 1.2;
        alpha = 0.88;
        nextExpression = 'hurt';
        break;
      case 'death':
        yOffset = 8;
        alpha = 0.72;
        weaponRotation = 0.9;
        nextExpression = 'dead';
        break;
      case 'idle':
      default:
        yOffset = idleBob;
        nextExpression = 'idle';
        break;
    }

    if (face) {
      const faceKey =
        nextExpression === 'smile'
          ? 'character-face-smile'
          : nextExpression === 'surprised'
            ? 'character-face-surprised'
            : nextExpression === 'hurt'
              ? 'character-face-hurt'
              : nextExpression === 'dead'
                ? 'character-face-dead'
                : 'character-face-idle';
      face.setTexture(faceKey);
      face.setScale(this.animationState === 'death' ? 0.98 : this.animationState === 'jump' ? 0.96 : 1);
    }

    if (body) {
      if (this.animationState === 'walk') {
        body.setTexture('player-walk-sprite', Math.floor(time / 80) % 5);
        body.setDisplaySize(220, 220);
      } else {
        body.setTexture('player-base-body');
        body.setDisplaySize(36, 36);
      }
    }

    this.expression = nextExpression;

    this.container.y = this.baseY + yOffset;
    this.container.alpha = alpha;
    if (shadow) {
      shadow.setScale(1 + Math.abs(yOffset) * 0.02, 1);
      shadow.setAlpha(this.animationState === 'death' ? 0.1 : 0.9);
    }
    if (weapon) {
      weapon.rotation = weaponRotation;
      weapon.y = this.layers.get('weapon')?.baseY ?? weapon.y;
    }
    if (effect) {
      effect.setVisible(this.animationState === 'attack');
      if (this.animationState !== 'attack') {
        effect.setAlpha(0);
      }
    }

    if (head) {
      head.y = headBase + (this.animationState === 'jump' ? -3 : 0);
      head.setScale(this.animationState === 'death' ? 0.98 : 1);
    }
  }
}