import Phaser from 'phaser';
import {
  PLAYER_CHARACTER_ANIMATION_TIMING,
  PLAYER_CHARACTER_BODY_TEXTURE_KEYS,
} from './renderConfig';

type SheetFrameSpec = {
  frameWidth: number;
  frameHeight: number;
  frameCount: number;
};

type BodyTextureWithOffsets = Phaser.Textures.Texture & {
  playerFrameOffsetX?: number[];
};

const PREFERRED_FRAME_WIDTH = 512;
const PREFERRED_FRAME_HEIGHT = 512;
const LEGACY_FRAME_WIDTH = 400;
const LEGACY_FRAME_HEIGHT = 392;
const SPRITESHEET_EXTRUDE_PADDING = 1;
const SPRITESHEET_EXTRUDE_SPACING = 2;

function generateTexture(scene: Phaser.Scene, key: string, width: number, height: number, draw: (graphics: Phaser.GameObjects.Graphics) => void): void {
  if (scene.textures.exists(key)) {
    scene.textures.remove(key);
  }

  const graphics = scene.add.graphics();
  draw(graphics);
  graphics.generateTexture(key, width, height);
  graphics.destroy();
}

function drawBody(graphics: Phaser.GameObjects.Graphics): void {
  graphics.clear();
  graphics.fillStyle(0xf2c49c, 1);
  graphics.fillRoundedRect(34, 28, 28, 38, 12);
  graphics.fillRoundedRect(40, 22, 16, 10, 5);
  graphics.fillStyle(0xe1b691, 0.45);
  graphics.fillRoundedRect(46, 30, 4, 32, 2);
  graphics.fillStyle(0xffffff, 0.16);
  graphics.fillEllipse(43, 36, 8, 6);
}

function drawHead(graphics: Phaser.GameObjects.Graphics): void {
  graphics.clear();
  graphics.fillStyle(0xf7d3b1, 1);
  graphics.fillCircle(28, 49, 5);
  graphics.fillCircle(68, 49, 5);
  graphics.fillEllipse(48, 48, 34, 40);
  graphics.fillStyle(0xe8b996, 0.35);
  graphics.fillEllipse(48, 56, 20, 12);
  graphics.fillStyle(0xfce7d0, 0.55);
  graphics.fillEllipse(40, 36, 9, 7);
  graphics.fillStyle(0x000000, 0.08);
  graphics.fillEllipse(48, 66, 20, 6);
}

function drawTorso(graphics: Phaser.GameObjects.Graphics): void {
  graphics.clear();
  graphics.fillStyle(0x3e79ba, 1);
  graphics.fillRoundedRect(31, 32, 34, 36, 12);
  graphics.fillStyle(0x5f9cd9, 0.85);
  graphics.fillRoundedRect(35, 36, 26, 16, 8);
  graphics.fillStyle(0x2c5f97, 0.75);
  graphics.fillRoundedRect(45, 34, 6, 28, 3);
  graphics.fillStyle(0xa7cdf0, 0.35);
  graphics.fillRect(38, 40, 20, 2);
}

function drawArm(graphics: Phaser.GameObjects.Graphics): void {
  graphics.clear();
  graphics.fillStyle(0xf2c49c, 1);
  graphics.fillRoundedRect(42, 28, 12, 28, 6);
  graphics.fillCircle(48, 58, 6);
  graphics.fillStyle(0xe6b18c, 0.7);
  graphics.fillRoundedRect(46, 31, 4, 22, 2);
}

function drawLeg(graphics: Phaser.GameObjects.Graphics): void {
  graphics.clear();
  graphics.fillStyle(0xe6b18c, 1);
  graphics.fillRoundedRect(42, 28, 12, 24, 6);
  graphics.fillStyle(0xd4a57e, 0.72);
  graphics.fillRoundedRect(46, 31, 4, 18, 2);
}

function drawFaceIdle(graphics: Phaser.GameObjects.Graphics): void {
  graphics.clear();
  graphics.fillStyle(0x2e221b, 1);
  graphics.fillCircle(42, 47, 2.1);
  graphics.fillCircle(54, 47, 2.1);
  graphics.fillStyle(0xffffff, 0.65);
  graphics.fillCircle(42, 46, 0.9);
  graphics.fillCircle(54, 46, 0.9);
  graphics.fillStyle(0xba8162, 0.65);
  graphics.fillEllipse(48, 52, 5, 3);
  graphics.fillStyle(0x7f4a3b, 1);
  graphics.fillRoundedRect(44, 57, 8, 2, 1);
}

function drawFaceSmile(graphics: Phaser.GameObjects.Graphics): void {
  graphics.clear();
  graphics.fillStyle(0x2e221b, 1);
  graphics.fillCircle(42, 47, 2.1);
  graphics.fillCircle(54, 47, 2.1);
  graphics.fillStyle(0xffffff, 0.65);
  graphics.fillCircle(42, 46, 0.9);
  graphics.fillCircle(54, 46, 0.9);
  graphics.fillStyle(0xba8162, 0.55);
  graphics.fillEllipse(48, 52, 5, 3);
  graphics.fillStyle(0x7f4a3b, 1);
  graphics.fillRoundedRect(43, 57, 10, 2, 1);
  graphics.fillStyle(0xe49ba0, 0.6);
  graphics.fillEllipse(48, 58, 8, 2);
}

function drawFaceHurt(graphics: Phaser.GameObjects.Graphics): void {
  graphics.clear();
  graphics.fillStyle(0x2e221b, 1);
  graphics.fillEllipse(42, 47, 2.4, 1.8);
  graphics.fillEllipse(54, 47, 2.4, 1.8);
  graphics.fillStyle(0xba8162, 0.6);
  graphics.fillEllipse(48, 52, 5.5, 3.4);
  graphics.fillStyle(0x7f4a3b, 1);
  graphics.fillRoundedRect(44, 58, 8, 2, 1);
  graphics.fillStyle(0xd1707b, 0.55);
  graphics.fillEllipse(36, 53, 5, 3);
}

function drawFaceSurprised(graphics: Phaser.GameObjects.Graphics): void {
  graphics.clear();
  graphics.fillStyle(0x2e221b, 1);
  graphics.fillCircle(42, 47, 2.4);
  graphics.fillCircle(54, 47, 2.4);
  graphics.fillStyle(0xffffff, 0.65);
  graphics.fillCircle(42, 46, 1);
  graphics.fillCircle(54, 46, 1);
  graphics.fillStyle(0xba8162, 0.55);
  graphics.fillEllipse(48, 52, 5, 3.2);
  graphics.fillStyle(0x8a4e3d, 1);
  graphics.fillCircle(48, 58, 2.2);
}

function drawFaceDead(graphics: Phaser.GameObjects.Graphics): void {
  graphics.clear();
  graphics.fillStyle(0x6e5a53, 1);
  graphics.fillRect(39, 46, 6, 2);
  graphics.fillRect(51, 46, 6, 2);
  graphics.fillStyle(0x9f7b6f, 0.6);
  graphics.fillEllipse(48, 52, 5, 3);
  graphics.fillStyle(0x7b635c, 1);
  graphics.fillRoundedRect(44, 58, 8, 2, 1);
}

function drawFace(graphics: Phaser.GameObjects.Graphics): void {
  drawFaceIdle(graphics);
}

function drawHair(graphics: Phaser.GameObjects.Graphics): void {
  graphics.clear();
  graphics.fillStyle(0xffffff, 1);
  graphics.fillRoundedRect(30, 28, 36, 20, 10);
  graphics.fillEllipse(48, 31, 34, 16);
  graphics.fillTriangle(34, 40, 40, 54, 44, 40);
  graphics.fillTriangle(46, 40, 52, 55, 56, 40);
  graphics.fillTriangle(58, 40, 62, 51, 64, 40);
  graphics.fillRoundedRect(30, 42, 5, 10, 2);
  graphics.fillRoundedRect(61, 42, 5, 12, 2);
  graphics.fillStyle(0xffffff, 0.25);
  graphics.fillEllipse(40, 32, 8, 4);
}

function drawTop(graphics: Phaser.GameObjects.Graphics): void {
  graphics.clear();
  graphics.fillStyle(0x4a88cc, 1);
  graphics.fillRoundedRect(30, 33, 36, 34, 12);
  graphics.fillStyle(0x7cb4ea, 0.95);
  graphics.fillRoundedRect(35, 38, 26, 14, 6);
  graphics.fillStyle(0x2f669e, 0.8);
  graphics.fillRoundedRect(45, 35, 6, 26, 3);
}

function drawPants(graphics: Phaser.GameObjects.Graphics): void {
  graphics.clear();
  graphics.fillStyle(0x45567a, 1);
  graphics.fillRoundedRect(30, 46, 16, 22, 6);
  graphics.fillRoundedRect(50, 46, 16, 22, 6);
  graphics.fillStyle(0x5f739b, 0.9);
  graphics.fillRect(46, 47, 4, 20);
}

function drawShoes(graphics: Phaser.GameObjects.Graphics): void {
  graphics.clear();
  graphics.fillStyle(0x6f4f33, 1);
  graphics.fillRoundedRect(39, 52, 18, 8, 4);
  graphics.fillStyle(0x9a7353, 1);
  graphics.fillRect(42, 54, 12, 2);
}

function drawGloves(graphics: Phaser.GameObjects.Graphics): void {
  graphics.clear();
  graphics.fillStyle(0xc68759, 1);
  graphics.fillRoundedRect(18, 50, 10, 10, 4);
  graphics.fillRoundedRect(68, 50, 10, 10, 4);
  graphics.fillStyle(0xf2bf90, 0.45);
  graphics.fillCircle(23, 55, 2);
  graphics.fillCircle(73, 55, 2);
}

function drawHelmet(graphics: Phaser.GameObjects.Graphics): void {
  graphics.clear();
  graphics.fillStyle(0x99a4b8, 1);
  graphics.fillRoundedRect(30, 24, 36, 18, 8);
  graphics.fillStyle(0xdce4f5, 0.85);
  graphics.fillRoundedRect(38, 29, 20, 5, 2);
  graphics.fillStyle(0x67748d, 1);
  graphics.fillRect(30, 38, 36, 3);
}

function drawCape(graphics: Phaser.GameObjects.Graphics): void {
  graphics.clear();
  graphics.fillStyle(0xd84e5a, 1);
  graphics.fillRoundedRect(20, 30, 20, 34, 10);
  graphics.fillTriangle(30, 64, 12, 84, 42, 84);
  graphics.fillStyle(0xff8a96, 0.6);
  graphics.fillRect(24, 36, 4, 24);
}

function drawWeapon(graphics: Phaser.GameObjects.Graphics): void {
  graphics.clear();
  graphics.fillStyle(0x8b5b33, 1);
  graphics.fillRoundedRect(56, 28, 5, 32, 2);
  graphics.fillStyle(0xc99c64, 1);
  graphics.fillRoundedRect(50, 34, 16, 6, 3);
  graphics.fillStyle(0xefe2b2, 1);
  graphics.fillTriangle(58, 12, 70, 36, 46, 36);
}

function drawAccessory(graphics: Phaser.GameObjects.Graphics): void {
  graphics.clear();
  graphics.fillStyle(0xffdf7a, 1);
  graphics.fillCircle(48, 40, 8);
  graphics.fillStyle(0xffffff, 0.9);
  graphics.fillCircle(48, 40, 3);
}

function drawEffect(graphics: Phaser.GameObjects.Graphics): void {
  graphics.clear();
  graphics.fillStyle(0xfff0b6, 0.72);
  graphics.fillCircle(48, 48, 28);
  graphics.fillStyle(0xffffff, 0.44);
  graphics.fillCircle(48, 48, 16);
}

function ensureImageTexture(scene: Phaser.Scene, key: string, path: string): void {
  if (scene.textures.exists(key)) {
    return;
  }

  const image = new Image();
  image.onload = (): void => {
    if (!scene.sys?.renderer || !scene.textures || scene.textures.exists(key)) {
      return;
    }
    scene.textures.addImage(key, image);
  };
  image.onerror = (): void => {
    console.warn(`Failed to load character texture: ${path}`);
  };
  image.src = path;
}

function detectSheetFrameSpec(image: HTMLImageElement, expectedFrameCount: number): SheetFrameSpec {
  if (image.width % PREFERRED_FRAME_WIDTH === 0 && image.height === PREFERRED_FRAME_HEIGHT) {
    return {
      frameWidth: PREFERRED_FRAME_WIDTH,
      frameHeight: PREFERRED_FRAME_HEIGHT,
      frameCount: image.width / PREFERRED_FRAME_WIDTH,
    };
  }

  if (image.width % LEGACY_FRAME_WIDTH === 0 && image.height === LEGACY_FRAME_HEIGHT) {
    return {
      frameWidth: LEGACY_FRAME_WIDTH,
      frameHeight: LEGACY_FRAME_HEIGHT,
      frameCount: image.width / LEGACY_FRAME_WIDTH,
    };
  }

  return {
    frameWidth: image.width,
    frameHeight: image.height,
    frameCount: Math.max(1, expectedFrameCount),
  };
}

function computeFrameHorizontalOffsets(image: HTMLImageElement, spec: SheetFrameSpec): number[] {
  const canvas = document.createElement('canvas');
  canvas.width = image.width;
  canvas.height = image.height;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) {
    return new Array(spec.frameCount).fill(0);
  }

  context.clearRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, 0, 0);

  const frameCenters: number[] = [];
  for (let frameIndex = 0; frameIndex < spec.frameCount; frameIndex += 1) {
    const frameX = frameIndex * spec.frameWidth;
    const frameData = context.getImageData(frameX, 0, spec.frameWidth, spec.frameHeight).data;

    let minX = spec.frameWidth;
    let maxX = -1;

    for (let y = 0; y < spec.frameHeight; y += 1) {
      const rowOffset = y * spec.frameWidth * 4;
      for (let x = 0; x < spec.frameWidth; x += 1) {
        const alpha = frameData[rowOffset + (x * 4) + 3] ?? 0;
        if (alpha > 8) {
          if (x < minX) {
            minX = x;
          }
          if (x > maxX) {
            maxX = x;
          }
        }
      }
    }

    const center = maxX >= minX ? (minX + maxX) * 0.5 : spec.frameWidth * 0.5;
    frameCenters.push(center);
  }

  const referenceCenter = frameCenters.reduce((sum, center) => sum + center, 0) / Math.max(1, frameCenters.length);
  return frameCenters.map((center) => Math.round((referenceCenter - center) * 100) / 100);
}

function buildExtrudedSpriteSheetSource(image: HTMLImageElement, spec: SheetFrameSpec): HTMLCanvasElement {
  const margin = SPRITESHEET_EXTRUDE_PADDING;
  const spacing = SPRITESHEET_EXTRUDE_SPACING;
  const canvas = document.createElement('canvas');
  canvas.width = (margin * 2) + (spec.frameCount * spec.frameWidth) + ((spec.frameCount - 1) * spacing);
  canvas.height = (margin * 2) + spec.frameHeight;

  const context = canvas.getContext('2d');
  if (!context) {
    return canvas;
  }

  for (let frameIndex = 0; frameIndex < spec.frameCount; frameIndex += 1) {
    const srcX = frameIndex * spec.frameWidth;
    const destX = margin + (frameIndex * (spec.frameWidth + spacing));
    const destY = margin;

    context.drawImage(
      image,
      srcX,
      0,
      spec.frameWidth,
      spec.frameHeight,
      destX,
      destY,
      spec.frameWidth,
      spec.frameHeight,
    );

    context.drawImage(image, srcX, 0, 1, spec.frameHeight, destX - 1, destY, 1, spec.frameHeight);
    context.drawImage(image, srcX + spec.frameWidth - 1, 0, 1, spec.frameHeight, destX + spec.frameWidth, destY, 1, spec.frameHeight);
    context.drawImage(image, srcX, 0, spec.frameWidth, 1, destX, destY - 1, spec.frameWidth, 1);
    context.drawImage(image, srcX, spec.frameHeight - 1, spec.frameWidth, 1, destX, destY + spec.frameHeight, spec.frameWidth, 1);

    context.drawImage(image, srcX, 0, 1, 1, destX - 1, destY - 1, 1, 1);
    context.drawImage(image, srcX + spec.frameWidth - 1, 0, 1, 1, destX + spec.frameWidth, destY - 1, 1, 1);
    context.drawImage(image, srcX, spec.frameHeight - 1, 1, 1, destX - 1, destY + spec.frameHeight, 1, 1);
    context.drawImage(image, srcX + spec.frameWidth - 1, spec.frameHeight - 1, 1, 1, destX + spec.frameWidth, destY + spec.frameHeight, 1, 1);
  }

  return canvas;
}

function ensureBodySpriteSheetTexture(scene: Phaser.Scene, key: string, path: string, expectedFrameCount: number): void {
  if (scene.textures.exists(key)) {
    return;
  }

  const image = new Image();
  image.onload = (): void => {
    if (!scene.sys?.renderer || !scene.textures || scene.textures.exists(key)) {
      return;
    }

    const spec = detectSheetFrameSpec(image, expectedFrameCount);

    if (spec.frameCount !== expectedFrameCount) {
      console.warn(
        `[character] ${key} expected ${expectedFrameCount} frames, detected ${spec.frameCount} (${image.width}x${image.height}).`,
      );
    }

    const extrudedSource = buildExtrudedSpriteSheetSource(image, spec);

    scene.textures.addSpriteSheet(key, extrudedSource as unknown as HTMLImageElement, {
      frameWidth: spec.frameWidth,
      frameHeight: spec.frameHeight,
      startFrame: 0,
      endFrame: Math.max(0, spec.frameCount - 1),
      margin: SPRITESHEET_EXTRUDE_PADDING,
      spacing: SPRITESHEET_EXTRUDE_SPACING,
    });

    const texture = scene.textures.get(key) as BodyTextureWithOffsets;
    texture.playerFrameOffsetX = computeFrameHorizontalOffsets(image, spec);
  };
  image.onerror = (): void => {
    console.warn(`Failed to load sprite sheet: ${path}`);
  };
  image.src = path;
}

export function ensureCharacterTextures(scene: Phaser.Scene): void {
  ensureImageTexture(scene, PLAYER_CHARACTER_BODY_TEXTURE_KEYS.stand, '/assets/characters/player/body/stand.png');
  ensureImageTexture(scene, 'character-helmet-hat-1', '/assets/characters/player/helmets/hat_1.png');
  ensureImageTexture(scene, 'character-top-shirt-1', '/assets/characters/player/tops/shirt_1.png');
  ensureImageTexture(scene, 'character-pants-1', '/assets/characters/player/pants/pants_1.png');
  ensureBodySpriteSheetTexture(
    scene,
    PLAYER_CHARACTER_BODY_TEXTURE_KEYS.walk,
    '/assets/characters/player/body/walk.png',
    PLAYER_CHARACTER_ANIMATION_TIMING.fallbackWalkFrameCount,
  );
  ensureImageTexture(scene, PLAYER_CHARACTER_BODY_TEXTURE_KEYS.jump, '/assets/characters/player/body/jump.png');
  ensureImageTexture(scene, PLAYER_CHARACTER_BODY_TEXTURE_KEYS.hurt, '/assets/characters/player/body/hurt.png');
  generateTexture(scene, 'character-body-base', 96, 96, drawBody);
  generateTexture(scene, 'character-torso-base', 96, 96, drawTorso);
  generateTexture(scene, 'character-head-base', 96, 96, drawHead);
  generateTexture(scene, 'character-arm-base', 96, 96, drawArm);
  generateTexture(scene, 'character-leg-base', 96, 96, drawLeg);
  generateTexture(scene, 'character-face-default', 96, 96, drawFace);
  generateTexture(scene, 'character-face-idle', 96, 96, drawFaceIdle);
  generateTexture(scene, 'character-face-smile', 96, 96, drawFaceSmile);
  generateTexture(scene, 'character-face-hurt', 96, 96, drawFaceHurt);
  generateTexture(scene, 'character-face-surprised', 96, 96, drawFaceSurprised);
  generateTexture(scene, 'character-face-dead', 96, 96, drawFaceDead);
  generateTexture(scene, 'character-hair-default', 96, 96, drawHair);
  generateTexture(scene, 'character-top-basic', 96, 96, drawTop);
  generateTexture(scene, 'character-pants-basic', 96, 96, drawPants);
  generateTexture(scene, 'character-shoes-basic', 96, 96, drawShoes);
  generateTexture(scene, 'character-gloves-basic', 96, 96, drawGloves);
  generateTexture(scene, 'character-helmet-basic', 96, 96, drawHelmet);
  generateTexture(scene, 'character-cape-red', 96, 96, drawCape);
  generateTexture(scene, 'character-weapon-wooden-sword', 96, 96, drawWeapon);
  generateTexture(scene, 'character-accessory-star', 96, 96, drawAccessory);
  generateTexture(scene, 'character-effect-glow', 96, 96, drawEffect);
}