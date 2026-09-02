import Phaser from 'phaser';
import { calculateFinalCharacterStats } from './calculateFinalStats';
import { ensureCharacterTextures } from './ensureCharacterTextures';
export class CharacterRenderer {
    container;
    scene;
    layers = new Map();
    character;
    facingDirection = 'right';
    animationState = 'idle';
    baseX = 0;
    baseY = 0;
    currentTime = 0;
    constructor(scene, character, x = 0, y = 0) {
        this.scene = scene;
        this.character = character;
        ensureCharacterTextures(scene);
        this.container = scene.add.container(x, y);
        this.container.setDepth(30);
        this.buildLayers();
        this.setCharacter(character);
        this.setPosition(x, y);
    }
    setPosition(x, y) {
        this.baseX = x;
        this.baseY = y;
        this.container.setPosition(x, y);
    }
    setFacingDirection(direction) {
        this.facingDirection = direction;
        this.container.setScale(direction === 'left' ? -1 : 1, 1);
    }
    playAnimation(state) {
        this.animationState = state;
        this.applyAnimationState(this.currentTime);
    }
    setCharacter(character) {
        this.character = character;
        this.setAppearance(character.appearance);
        this.setEquipment(character.equipment);
    }
    setAppearance(characterAppearance) {
        this.updateLayerTexture('body', characterAppearance.body, true, characterAppearance.skinColor);
        this.updateLayerTexture('face', characterAppearance.face, true);
        this.updateLayerTexture('hair', characterAppearance.hair, true, characterAppearance.hairColor);
    }
    setEquipment(equipmentPatch) {
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
        this.updateEquipmentLayer('shoes', nextEquipment.shoes ?? null);
        this.updateEquipmentLayer('gloves', nextEquipment.gloves ?? null);
        this.updateEquipmentLayer('cape', nextEquipment.cape ?? null);
        this.updateEquipmentLayer('weapon', nextEquipment.weapon ?? null);
        this.updateEquipmentLayer('accessory', nextEquipment.accessory ?? null);
    }
    getStats() {
        return calculateFinalCharacterStats(this.character.baseStats, this.character.equipment);
    }
    update(time) {
        this.currentTime = time;
        this.applyAnimationState(time);
    }
    destroy() {
        this.container.destroy(true);
    }
    buildLayers() {
        const layerOrder = [
            { key: 'shadow', textureKey: 'character-shadow', x: 0, y: 44, alpha: 0.9 },
            { key: 'cape', textureKey: 'character-cape-red', x: -8, y: 12 },
            { key: 'body', textureKey: 'character-body-base', x: 0, y: 0 },
            { key: 'pants', textureKey: 'character-pants-basic', x: 0, y: 0 },
            { key: 'shoes', textureKey: 'character-shoes-basic', x: 0, y: 0 },
            { key: 'top', textureKey: 'character-top-basic', x: 0, y: 0 },
            { key: 'gloves', textureKey: 'character-gloves-basic', x: 0, y: 0 },
            { key: 'face', textureKey: 'character-face-default', x: 0, y: 0 },
            { key: 'hair', textureKey: 'character-hair-default', x: 0, y: 0 },
            { key: 'helmet', textureKey: 'character-helmet-basic', x: 0, y: 0 },
            { key: 'weapon', textureKey: 'character-weapon-wooden-sword', x: 30, y: 14 },
            { key: 'accessory', textureKey: 'character-accessory-star', x: 14, y: -10 },
            { key: 'effect', textureKey: 'character-effect-glow', x: 0, y: 2, alpha: 0 }
        ];
        for (const layer of layerOrder) {
            const image = this.scene.add.image(layer.x, layer.y, layer.textureKey);
            image.setOrigin(0.5, 0.5);
            if (typeof layer.alpha === 'number') {
                image.setAlpha(layer.alpha);
            }
            this.container.add(image);
            this.layers.set(layer.key, {
                image,
                baseX: layer.x,
                baseY: layer.y
            });
        }
    }
    updateLayerTexture(layerKey, textureKey, tintable = false, tintColor) {
        const layer = this.layers.get(layerKey);
        if (!layer) {
            return;
        }
        layer.image.setTexture(textureKey);
        layer.image.setVisible(true);
        if (tintable && tintColor) {
            layer.image.setTint(Phaser.Display.Color.HexStringToColor(tintColor).color);
        }
        else {
            layer.image.clearTint();
        }
    }
    updateEquipmentLayer(slot, item) {
        const layer = this.layers.get(slot);
        if (!layer) {
            return;
        }
        if (!item) {
            layer.image.setVisible(false);
            return;
        }
        layer.image.setTexture(item.spriteKey);
        layer.image.setVisible(true);
    }
    applyAnimationState(time) {
        const shadow = this.layers.get('shadow')?.image;
        const effect = this.layers.get('effect')?.image;
        const weapon = this.layers.get('weapon')?.image;
        const walkBob = Math.sin(time / 140) * 2;
        const idleBob = Math.sin(time / 260) * 1.1;
        const attackPulse = Math.sin(time / 45) * 2;
        let yOffset = 0;
        let weaponRotation = 0;
        let alpha = 1;
        switch (this.animationState) {
            case 'walk':
                yOffset = walkBob;
                weaponRotation = Math.sin(time / 90) * 0.1;
                break;
            case 'jump':
                yOffset = -8;
                weaponRotation = -0.3;
                break;
            case 'attack':
                yOffset = attackPulse * 0.3;
                weaponRotation = this.facingDirection === 'right' ? -0.7 + attackPulse * 0.04 : 0.7 - attackPulse * 0.04;
                if (effect) {
                    effect.setAlpha(0.8);
                    effect.setScale(1.08);
                }
                break;
            case 'hurt':
                yOffset = -1 + Math.sin(time / 40) * 1.2;
                alpha = 0.88;
                break;
            case 'death':
                yOffset = 8;
                alpha = 0.72;
                weaponRotation = 0.9;
                break;
            case 'idle':
            default:
                yOffset = idleBob;
                break;
        }
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
    }
}
