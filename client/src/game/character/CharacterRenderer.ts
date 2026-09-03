import Phaser from 'phaser';
import { calculateFinalCharacterStats } from './calculateFinalStats';
import type {
    CharacterAnimationState,
    CharacterEquipment,
    CharacterFacingDirection,
    EquipmentItem,
    EquipmentRenderConfig,
    PlayerCharacter,
} from './types';
import { ensureCharacterTextures } from './ensureCharacterTextures';
import {
    PLAYER_CHARACTER_ANIMATION_TIMING,
    PLAYER_CHARACTER_BODY_TEXTURE_KEYS,
    PLAYER_CHARACTER_DEBUG,
    PLAYER_CHARACTER_RENDER_CONFIG,
} from './renderConfig';

type LayerKey =
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
    | 'eyes'
    | 'hair'
    | 'helmet'
    | 'weapon'
    | 'accessory'
    | 'effect';

type RenderLayer = {
    image: Phaser.GameObjects.Image;
    baseX: number;
    baseY: number;
    baseScale: number;
    baseOriginX: number;
    baseOriginY: number;
};

type BodyTextureWithOffsets = Phaser.Textures.Texture & {
    playerFrameOffsetX?: number[];
};

const CHARACTER_CANVAS_SIZE = 512;

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

    private lastBodyTextureKey: string | null = null;

    private debugText?: Phaser.GameObjects.Text;

    private debugGraphics?: Phaser.GameObjects.Graphics;

    public constructor(scene: Phaser.Scene, character: PlayerCharacter, x = 0, y = 0) {
        this.scene = scene;
        this.character = character;
        ensureCharacterTextures(scene);
        this.container = scene.add.container(x, y);
        this.container.setDepth(30);
        this.buildLayers();
        this.setCharacter(character);
        this.setPosition(x, y);
        this.createDebugText();
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
        this.layers.get('body')?.image.setVisible(true);

        const placeholderLayerKeys: LayerKey[] = ['torso', 'head', 'eyes', 'hair', 'backArm', 'frontArm', 'backLeg', 'frontLeg', 'backShoe', 'frontShoe', 'cape', 'top', 'pants', 'gloves', 'helmet', 'accessory', 'weapon', 'effect'];
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
        this.debugGraphics?.destroy();
        this.debugText?.destroy();
        this.container.destroy(true);
    }

    private applyTransformScale(): void {
        const directionMultiplier = this.facingDirection === 'left' ? -1 : 1;
        this.container.setScale(directionMultiplier * this.renderScale, this.renderScale);
    }

    private getFrameCount(textureKey: string, fallback: number): number {
        if (!this.scene.textures.exists(textureKey)) {
            return fallback;
        }

        const texture = this.scene.textures.get(textureKey);
        const frameNames = texture.getFrameNames().filter((name) => name !== '__BASE');
        return frameNames.length > 0 ? frameNames.length : fallback;
    }

    private applyBodyFrame(textureKey: string, frameIndex: number): void {
        const body = this.layers.get('body')?.image;
        if (!body) {
            return;
        }

        if (this.lastBodyTextureKey !== textureKey) {
            body.setTexture(textureKey);
            body.setFlipX(false);
            body.setFlipY(false);
            this.setBodyDisplaySize(body);
            body.setOrigin(PLAYER_CHARACTER_RENDER_CONFIG.bodyOriginX, PLAYER_CHARACTER_RENDER_CONFIG.bodyOriginY);
            this.lastBodyTextureKey = textureKey;
        }

        body.setFrame(frameIndex);

        const baseBodyX = this.layers.get('body')?.baseX ?? 0;
        body.x = baseBodyX + this.getBodyFrameOffsetX(textureKey, frameIndex, body);
    }

    private getBodyFrameOffsetX(textureKey: string, frameIndex: number, body: Phaser.GameObjects.Image): number {
        if (!this.scene.textures.exists(textureKey)) {
            return 0;
        }

        const texture = this.scene.textures.get(textureKey) as BodyTextureWithOffsets;
        const frameOffsets = texture.playerFrameOffsetX;
        if (!frameOffsets || frameOffsets.length === 0) {
            return 0;
        }

        const sourceOffset = frameOffsets[frameIndex] ?? 0;
        if (sourceOffset === 0) {
            return 0;
        }

        const sourceFrame = texture.get(frameIndex);
        const sourceFrameWidth = sourceFrame?.width ?? sourceFrame?.cutWidth ?? 1;
        return sourceOffset * (body.displayWidth / sourceFrameWidth);
    }

    private createDebugText(): void {
        if (!PLAYER_CHARACTER_DEBUG) {
            return;
        }

        this.debugGraphics = this.scene.add.graphics().setDepth(499).setScrollFactor(1);

        this.debugText = this.scene.add
            .text(0, 0, '', {
                fontFamily: 'monospace',
                fontSize: '12px',
                color: '#d9faff',
                backgroundColor: 'rgba(7, 12, 20, 0.7)',
                padding: { left: 6, right: 6, top: 4, bottom: 4 },
            })
            .setDepth(500)
            .setScrollFactor(1)
            .setOrigin(0, 1);
    }

    private updateDebugText(frameIndex: number): void {
        if (!this.debugText) {
            return;
        }

        const body = this.layers.get('body')?.image;
        const cameraZoom = this.scene.cameras.main.zoom;
        const screenWidth = (body?.displayWidth ?? 0) * Math.abs(this.container.scaleX) * cameraZoom;
        const screenHeight = (body?.displayHeight ?? 0) * Math.abs(this.container.scaleY) * cameraZoom;

        this.debugText.setPosition(this.container.x + 56, this.container.y - 92);
        this.debugText.setText([
            `state: ${this.animationState}`,
            `tex: ${this.lastBodyTextureKey ?? '-'}`,
            `frame: ${frameIndex}`,
            `scale: ${Math.abs(this.container.scaleX).toFixed(2)}`,
            `world: ${this.container.x.toFixed(1)}, ${this.container.y.toFixed(1)}`,
            `display: ${body?.displayWidth.toFixed(1) ?? '0'} x ${body?.displayHeight.toFixed(1) ?? '0'}`,
            `screen: ${screenWidth.toFixed(1)} x ${screenHeight.toFixed(1)}`,
        ]);

        if (this.debugGraphics && body) {
            const halfBodyWidth = (body.displayWidth * Math.abs(this.container.scaleX)) * 0.5;
            const bodyHeight = body.displayHeight * Math.abs(this.container.scaleY);
            const bodyTop = this.container.y - (PLAYER_CHARACTER_RENDER_CONFIG.bodyOriginY * bodyHeight);
            const bodyBottom = bodyTop + bodyHeight;

            this.debugGraphics.clear();
            this.debugGraphics.lineStyle(1, 0x59dcff, 0.95);
            this.debugGraphics.strokeRect(this.container.x - halfBodyWidth, bodyTop, halfBodyWidth * 2, bodyHeight);
            this.debugGraphics.lineStyle(1, 0xffdf6a, 0.95);
            this.debugGraphics.lineBetween(this.container.x - 28, bodyBottom, this.container.x + 28, bodyBottom);
            this.debugGraphics.lineStyle(1, 0xf88ca1, 0.95);
            this.debugGraphics.strokeCircle(this.container.x, this.container.y, 2.5);
        }
    }

    private buildLayers(): void {
        const layerOrder: Array<{ key: LayerKey; textureKey: string; x: number; y: number; scale?: number; alpha?: number }> = [
            { key: 'cape', textureKey: 'character-cape-red', x: -10, y: 12, scale: 1 },
            { key: 'backLeg', textureKey: 'character-leg-base', x: -10, y: 30, scale: 1 },
            { key: 'frontLeg', textureKey: 'character-leg-base', x: 10, y: 30, scale: 1 },
            { key: 'body', textureKey: PLAYER_CHARACTER_BODY_TEXTURE_KEYS.stand, x: 0, y: 8, scale: 1 },
            { key: 'pants', textureKey: 'character-pants-basic', x: 0, y: 26, scale: 1 },
            { key: 'backShoe', textureKey: 'character-shoes-basic', x: -10, y: 30, scale: 1 },
            { key: 'frontShoe', textureKey: 'character-shoes-basic', x: 10, y: 30, scale: 1 },
            { key: 'backArm', textureKey: 'character-arm-base', x: -23, y: 6, scale: 1 },
            { key: 'torso', textureKey: 'character-torso-base', x: 0, y: 8, scale: 1 },
            { key: 'top', textureKey: 'character-top-basic', x: 0, y: 8, scale: 1 },
            { key: 'gloves', textureKey: 'character-gloves-basic', x: 0, y: 6, scale: 1 },
            { key: 'frontArm', textureKey: 'character-arm-base', x: 23, y: 6, scale: 1 },
            { key: 'head', textureKey: 'character-head-base', x: 0, y: -28, scale: 1 },
            { key: 'eyes', textureKey: 'character-eyes-1', x: 0, y: -28, scale: 1 },
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
                this.setBodyDisplaySize(image);
            }
            if (layer.key === 'eyes') {
                image.setDepth(10);
            }
            if (typeof layer.alpha === 'number') {
                image.setAlpha(layer.alpha);
            }
            if (typeof layer.scale === 'number') {
                image.setScale(layer.scale);
            }
            const isVisibleBaseLayer = layer.key === 'body';
            image.setVisible(isVisibleBaseLayer);
            this.container.add(image);
            this.layers.set(layer.key, {
                image,
                baseX: layer.x,
                baseY: layer.y,
                baseScale: layer.scale ?? 1,
                baseOriginX: 0.5,
                baseOriginY: 0.5,
            });
        }
    }

    private setBodyDisplaySize(bodyImage: Phaser.GameObjects.Image): void {
        const sourceWidth = Math.max(1, bodyImage.width);
        const sourceHeight = Math.max(1, bodyImage.height);
        const targetWidth = PLAYER_CHARACTER_RENDER_CONFIG.bodyDisplayWidth;
        const targetHeight = PLAYER_CHARACTER_RENDER_CONFIG.bodyDisplayHeight;
        const scale = Math.min(targetWidth / sourceWidth, targetHeight / sourceHeight);
        const finalWidth = Math.max(1, Math.round(sourceWidth * scale));
        const finalHeight = Math.max(1, Math.round(sourceHeight * scale));

        bodyImage.setDisplaySize(finalWidth, finalHeight);
    }

    private updateLayerTexture(layerKey: LayerKey, textureKey: string, tintable = false, tintColor?: string): void {
        const layer = this.layers.get(layerKey);
        if (!layer) {
            return;
        }

        if (layerKey !== 'body') {
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

    private resolveEquipmentTextureKey(slot: LayerKey, fallbackTextureKey: string): string {
        if ((this.animationState === 'jump' || this.animationState === 'doubleJump') && slot === 'top' && fallbackTextureKey === 'character-top-shirt-1') {
            return 'character-top-shirt-1-jump';
        }

        if ((this.animationState === 'jump' || this.animationState === 'doubleJump') && slot === 'pants' && fallbackTextureKey === 'character-pants-1') {
            return 'character-pants-1-jump';
        }

        return fallbackTextureKey;
    }

    private updateEquipmentLayer(slot: LayerKey, item: EquipmentItem | null): void {
        const layer = this.layers.get(slot);
        if (!layer) {
            return;
        }

        this.resetLayerTransform(slot);

        if (!item) {
            layer.image.setVisible(false);
            return;
        }

        const textureKey = this.resolveEquipmentTextureKey(slot, item.spriteKey);
        layer.image.setTexture(textureKey);
        layer.image.setVisible(true);
        this.applyEquipmentRender(slot, item.render);
    }

    private syncDynamicEquipmentForAnimationState(): void {
        if (this.character.equipment.top) {
            this.updateEquipmentLayer('top', this.character.equipment.top);
        }
        if (this.character.equipment.pants) {
            this.updateEquipmentLayer('pants', this.character.equipment.pants);
        }
    }

    private resetLayerTransform(layerKey: LayerKey): void {
        const layer = this.layers.get(layerKey);
        if (!layer) {
            return;
        }

        layer.image.x = layer.baseX;
        layer.image.y = layer.baseY;
        layer.image.setScale(layer.baseScale);
        layer.image.setOrigin(layer.baseOriginX, layer.baseOriginY);
    }

    private applyEquipmentRender(layerKey: LayerKey, render?: EquipmentRenderConfig): void {
        if (!render) {
            return;
        }

        if (render.coordinateSpace === 'characterCanvas512') {
            this.applyCharacterCanvasEquipmentRender(layerKey, render);
            return;
        }

        const layer = this.layers.get(layerKey);
        if (!layer) {
            return;
        }

        const scale = render.scale ?? layer.baseScale;
        layer.image.setScale(scale);
        layer.image.setOrigin(render.originX ?? layer.baseOriginX, render.originY ?? layer.baseOriginY);
        layer.image.x = layer.baseX + (render.offsetX ?? 0);
        layer.image.y = layer.baseY + (render.offsetY ?? 0);
    }

    private applyCharacterCanvasEquipmentRender(layerKey: LayerKey, render: EquipmentRenderConfig): void {
        const layer = this.layers.get(layerKey);
        const body = this.layers.get('body')?.image;
        if (!layer || !body) {
            return;
        }

        const layerScale = render.scale ?? 1;
        const ratioX = body.displayWidth / CHARACTER_CANVAS_SIZE;
        const ratioY = body.displayHeight / CHARACTER_CANVAS_SIZE;

        layer.image.setDisplaySize(body.displayWidth * layerScale, body.displayHeight * layerScale);
        layer.image.setOrigin(render.originX ?? body.originX, render.originY ?? body.originY);
        layer.image.x = body.x + ((render.offsetX ?? 0) * ratioX);
        layer.image.y = body.y + ((render.offsetY ?? 0) * ratioY);
    }

    private syncCharacterCanvasEquipmentLayers(): void {
        const equipmentLayers: Array<[LayerKey, EquipmentItem | null]> = [
            ['helmet', this.character.equipment.helmet ?? null],
            ['top', this.character.equipment.top ?? null],
            ['backShoe', this.character.equipment.shoes ?? null],
            ['frontShoe', this.character.equipment.shoes ?? null],
            ['pants', this.character.equipment.pants ?? null],
            ['gloves', this.character.equipment.gloves ?? null],
            ['cape', this.character.equipment.cape ?? null],
            ['weapon', this.character.equipment.weapon ?? null],
            ['accessory', this.character.equipment.accessory ?? null],
        ];

        for (const [layerKey, item] of equipmentLayers) {
            if (!item?.render || item.render.coordinateSpace !== 'characterCanvas512') {
                continue;
            }

            this.applyCharacterCanvasEquipmentRender(layerKey, item.render);
        }
    }

    private applyAnimationState(time: number): void {
        this.syncDynamicEquipmentForAnimationState();

        const effect = this.layers.get('effect')?.image;
        const weapon = this.layers.get('weapon')?.image;
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
        let bodyTextureKey: string = PLAYER_CHARACTER_BODY_TEXTURE_KEYS.stand;
        let bodyFrameIndex = 0;
        let nextExpression: typeof this.expression = 'idle';

        switch (this.animationState) {
            case 'walk':
                yOffset = walkBob;
                weaponRotation = Math.sin(time / 90) * 0.1;
                nextExpression = 'smile';
                {
                    const walkFrameCount = this.getFrameCount(
                        PLAYER_CHARACTER_BODY_TEXTURE_KEYS.walk,
                        PLAYER_CHARACTER_ANIMATION_TIMING.fallbackWalkFrameCount,
                    );
                    bodyTextureKey = PLAYER_CHARACTER_BODY_TEXTURE_KEYS.walk;
                    bodyFrameIndex = Math.floor((time / PLAYER_CHARACTER_ANIMATION_TIMING.walkFrameMs) % walkFrameCount);
                }
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
            case 'doubleJump':
            case 'jump':
                yOffset = this.animationState === 'doubleJump' ? -12 : -8;
                weaponRotation = this.animationState === 'doubleJump' ? -0.45 : -0.3;
                nextExpression = 'surprised';
                {
                    const jumpFrameCount = this.getFrameCount(
                        PLAYER_CHARACTER_BODY_TEXTURE_KEYS.jump,
                        PLAYER_CHARACTER_ANIMATION_TIMING.fallbackJumpFrameCount,
                    );
                    bodyTextureKey = PLAYER_CHARACTER_BODY_TEXTURE_KEYS.jump;
                    const normalizedFrame = Math.floor((time / PLAYER_CHARACTER_ANIMATION_TIMING.jumpFrameMs) % jumpFrameCount);
                    bodyFrameIndex = Math.max(0, jumpFrameCount - 1 - normalizedFrame);
                }
                if (frontArm) {
                    frontArm.y = (this.layers.get('frontArm')?.baseY ?? 0) - (this.animationState === 'doubleJump' ? 6 : 4);
                    frontArm.rotation = this.animationState === 'doubleJump' ? -0.55 : -0.3;
                }
                if (backArm) {
                    backArm.y = (this.layers.get('backArm')?.baseY ?? 0) - (this.animationState === 'doubleJump' ? 6 : 4);
                    backArm.rotation = this.animationState === 'doubleJump' ? 0.45 : 0.25;
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
                yOffset = idleBob * 0.4;
                alpha = 1;
                nextExpression = 'hurt';
                bodyTextureKey = PLAYER_CHARACTER_BODY_TEXTURE_KEYS.hurt;
                bodyFrameIndex = 0;
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

        const eyes = this.layers.get('eyes')?.image;
        if (eyes) {
            eyes.setVisible(true);
            eyes.setScale(0.09);
            eyes.x = 1;
            eyes.y = -18;
            eyes.setDepth(1);
        }

        if (body) {
            this.applyBodyFrame(bodyTextureKey, bodyFrameIndex);
        }
        this.syncCharacterCanvasEquipmentLayers();

        this.expression = nextExpression;

        const nextX = PLAYER_CHARACTER_RENDER_CONFIG.snapToPixels ? Math.round(this.baseX) : this.baseX;
        const nextY = PLAYER_CHARACTER_RENDER_CONFIG.snapToPixels ? Math.round(this.baseY + yOffset) : this.baseY + yOffset;
        this.container.setPosition(nextX, nextY);
        this.container.alpha = alpha;
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
            head.setScale(1);
        }

        this.updateDebugText(bodyFrameIndex);
    }
}