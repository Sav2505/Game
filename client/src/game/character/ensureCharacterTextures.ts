import Phaser from 'phaser';

function generateIfMissing(scene: Phaser.Scene, key: string, width: number, height: number, draw: (graphics: Phaser.GameObjects.Graphics) => void): void {
  if (scene.textures.exists(key)) {
    return;
  }

  const graphics = scene.add.graphics();
  draw(graphics);
  graphics.generateTexture(key, width, height);
  graphics.destroy();
}

function drawBody(graphics: Phaser.GameObjects.Graphics): void {
  graphics.clear();
  graphics.fillStyle(0xf2c49c, 1);
  graphics.fillRoundedRect(34, 20, 28, 22, 8);
  graphics.fillRoundedRect(36, 18, 24, 6, 3);
  graphics.fillStyle(0x8fb7d8, 0.12);
  graphics.fillEllipse(48, 34, 30, 14);
  graphics.fillStyle(0x6a4a33, 0.12);
  graphics.fillRect(46, 20, 4, 24);
}

function drawHead(graphics: Phaser.GameObjects.Graphics): void {
  graphics.clear();
  graphics.fillStyle(0xf7d3b1, 1);
  graphics.fillEllipse(46, 30, 32, 30);
  graphics.fillTriangle(60, 28, 72, 32, 60, 36);
  graphics.fillStyle(0xe6b18c, 0.34);
  graphics.fillEllipse(46, 34, 26, 18);
  graphics.fillStyle(0xfce7d0, 0.55);
  graphics.fillEllipse(38, 22, 8, 8);
  graphics.fillStyle(0x000000, 0.08);
  graphics.fillEllipse(48, 46, 22, 7);
}

function drawTorso(graphics: Phaser.GameObjects.Graphics): void {
  graphics.clear();
  graphics.fillStyle(0x67b7ff, 1);
  graphics.fillRoundedRect(30, 34, 36, 30, 12);
  graphics.fillStyle(0x8fd7ff, 1);
  graphics.fillRoundedRect(35, 38, 26, 14, 6);
  graphics.fillStyle(0x3a5d7f, 1);
  graphics.fillRect(44, 44, 8, 12);
  graphics.fillStyle(0x244c6f, 0.15);
  graphics.fillRect(46, 34, 4, 28);
}

function drawArm(graphics: Phaser.GameObjects.Graphics): void {
  graphics.clear();
  graphics.fillStyle(0xf2c49c, 1);
  graphics.fillRoundedRect(40, 16, 12, 24, 6);
  graphics.fillRoundedRect(42, 34, 8, 10, 4);
  graphics.fillStyle(0xe6b18c, 1);
  graphics.fillCircle(46, 42, 5);
}

function drawLeg(graphics: Phaser.GameObjects.Graphics): void {
  graphics.clear();
  graphics.fillStyle(0xe6b18c, 1);
  graphics.fillRoundedRect(40, 16, 12, 22, 6);
  graphics.fillStyle(0x6f4f33, 1);
  graphics.fillRoundedRect(36, 36, 20, 8, 4);
  graphics.fillStyle(0x9c7351, 1);
  graphics.fillRect(40, 38, 12, 2);
}

function drawFaceIdle(graphics: Phaser.GameObjects.Graphics): void {
  graphics.clear();
  graphics.fillStyle(0xfff5ea, 1);
  graphics.fillEllipse(47, 30, 22, 16);
  graphics.fillStyle(0x2b1a10, 1);
  graphics.fillCircle(45, 28, 2.2);
  graphics.fillStyle(0x7b4d3a, 1);
  graphics.fillRect(52, 30, 4, 1.5);
  graphics.fillStyle(0xe78a93, 1);
  graphics.fillEllipse(50, 34, 4, 2.2);
}

function drawFaceSmile(graphics: Phaser.GameObjects.Graphics): void {
  graphics.clear();
  graphics.fillStyle(0xfff5ea, 1);
  graphics.fillEllipse(47, 30, 22, 16);
  graphics.fillStyle(0x2b1a10, 1);
  graphics.fillCircle(45, 28, 2.2);
  graphics.fillStyle(0x7b4d3a, 1);
  graphics.fillRect(52, 30, 4, 1.5);
  graphics.fillStyle(0x9d4f5b, 1);
  graphics.fillEllipse(50, 35, 6, 3);
}

function drawFaceHurt(graphics: Phaser.GameObjects.Graphics): void {
  graphics.clear();
  graphics.fillStyle(0xfff5ea, 1);
  graphics.fillEllipse(47, 30, 22, 16);
  graphics.fillStyle(0x2b1a10, 1);
  graphics.fillEllipse(45, 28, 2.8, 2.8);
  graphics.fillStyle(0x7b4d3a, 1);
  graphics.fillRect(52, 30, 4, 1.5);
  graphics.fillStyle(0xb43a52, 1);
  graphics.fillEllipse(50, 35, 5.5, 3.2);
}

function drawFaceSurprised(graphics: Phaser.GameObjects.Graphics): void {
  graphics.clear();
  graphics.fillStyle(0xfff5ea, 1);
  graphics.fillEllipse(47, 30, 22, 16);
  graphics.fillStyle(0x2b1a10, 1);
  graphics.fillCircle(45, 27, 2.4);
  graphics.fillStyle(0x7b4d3a, 1);
  graphics.fillRect(52, 30, 4, 1.5);
  graphics.fillStyle(0xb54c5c, 1);
  graphics.fillCircle(50, 35, 2.8);
}

function drawFaceDead(graphics: Phaser.GameObjects.Graphics): void {
  graphics.clear();
  graphics.fillStyle(0xf6d8c0, 1);
  graphics.fillEllipse(47, 30, 22, 16);
  graphics.fillStyle(0x3c2f28, 1);
  graphics.fillRect(41, 27, 5, 1.5);
  graphics.fillStyle(0x7b4d3a, 1);
  graphics.fillRect(52, 30, 4, 1.5);
  graphics.fillStyle(0x8f6d66, 1);
  graphics.fillRect(49, 35, 8, 1.8);
}

function drawFace(graphics: Phaser.GameObjects.Graphics): void {
  drawFaceIdle(graphics);
}

function drawHair(graphics: Phaser.GameObjects.Graphics): void {
  graphics.clear();
  graphics.fillStyle(0xffffff, 1);
  graphics.fillEllipse(46, 18, 32, 18);
  graphics.fillRoundedRect(33, 8, 32, 16, 8);
  graphics.fillTriangle(35, 22, 28, 40, 40, 34);
  graphics.fillTriangle(56, 22, 70, 34, 60, 36);
  graphics.fillEllipse(34, 14, 14, 18);
  graphics.fillEllipse(64, 16, 10, 14);
}

function drawTop(graphics: Phaser.GameObjects.Graphics): void {
  graphics.clear();
  graphics.fillStyle(0x67b7ff, 1);
  graphics.fillRoundedRect(28, 30, 40, 30, 12);
  graphics.fillStyle(0x8fd7ff, 1);
  graphics.fillRoundedRect(34, 34, 28, 14, 6);
  graphics.fillStyle(0x3a5d7f, 1);
  graphics.fillRect(44, 42, 8, 16);
}

function drawPants(graphics: Phaser.GameObjects.Graphics): void {
  graphics.clear();
  graphics.fillStyle(0x45567a, 1);
  graphics.fillRoundedRect(30, 38, 18, 24, 6);
  graphics.fillRoundedRect(48, 38, 18, 24, 6);
  graphics.fillStyle(0x7387b2, 0.9);
  graphics.fillRect(44, 38, 4, 24);
}

function drawShoes(graphics: Phaser.GameObjects.Graphics): void {
  graphics.clear();
  graphics.fillStyle(0x76513a, 1);
  graphics.fillRoundedRect(25, 38, 18, 8, 4);
  graphics.fillRoundedRect(47, 38, 18, 8, 4);
  graphics.fillStyle(0xc49a71, 1);
  graphics.fillRect(28, 40, 12, 2);
  graphics.fillRect(50, 40, 12, 2);
}

function drawGloves(graphics: Phaser.GameObjects.Graphics): void {
  graphics.clear();
  graphics.fillStyle(0xf0a96e, 1);
  graphics.fillRoundedRect(16, 28, 12, 12, 4);
  graphics.fillRoundedRect(68, 28, 12, 12, 4);
}

function drawHelmet(graphics: Phaser.GameObjects.Graphics): void {
  graphics.clear();
  graphics.fillStyle(0xa2a9b8, 1);
  graphics.fillRoundedRect(32, 4, 32, 18, 8);
  graphics.fillStyle(0xdce4f5, 1);
  graphics.fillRect(40, 10, 16, 3);
  graphics.fillStyle(0x6d7686, 1);
  graphics.fillRect(30, 14, 36, 3);
}

function drawCape(graphics: Phaser.GameObjects.Graphics): void {
  graphics.clear();
  graphics.fillStyle(0xd84e5a, 1);
  graphics.fillRoundedRect(20, 22, 20, 34, 10);
  graphics.fillTriangle(30, 56, 12, 78, 42, 78);
  graphics.fillStyle(0xff8a96, 0.6);
  graphics.fillRect(24, 28, 4, 24);
}

function drawWeapon(graphics: Phaser.GameObjects.Graphics): void {
  graphics.clear();
  graphics.fillStyle(0x8b5b33, 1);
  graphics.fillRoundedRect(56, 20, 5, 38, 2);
  graphics.fillStyle(0xc99c64, 1);
  graphics.fillRoundedRect(50, 28, 16, 6, 3);
  graphics.fillStyle(0xefe2b2, 1);
  graphics.fillTriangle(58, 2, 70, 30, 46, 30);
}

function drawAccessory(graphics: Phaser.GameObjects.Graphics): void {
  graphics.clear();
  graphics.fillStyle(0xffdf7a, 1);
  graphics.fillCircle(48, 14, 8);
  graphics.fillStyle(0xffffff, 0.9);
  graphics.fillCircle(48, 14, 3);
}

function drawEffect(graphics: Phaser.GameObjects.Graphics): void {
  graphics.clear();
  graphics.fillStyle(0xfff0b6, 0.72);
  graphics.fillCircle(48, 26, 28);
  graphics.fillStyle(0xffffff, 0.44);
  graphics.fillCircle(48, 26, 16);
}

function drawShadow(graphics: Phaser.GameObjects.Graphics): void {
  graphics.clear();
  graphics.fillStyle(0x000000, 0.28);
  graphics.fillEllipse(48, 40, 68, 16);
}

export function ensureCharacterTextures(scene: Phaser.Scene): void {
  generateIfMissing(scene, 'character-body-base', 96, 96, drawBody);
  generateIfMissing(scene, 'character-torso-base', 96, 96, drawTorso);
  generateIfMissing(scene, 'character-head-base', 96, 96, drawHead);
  generateIfMissing(scene, 'character-arm-base', 96, 96, drawArm);
  generateIfMissing(scene, 'character-leg-base', 96, 96, drawLeg);
  generateIfMissing(scene, 'character-face-default', 96, 96, drawFace);
  generateIfMissing(scene, 'character-face-idle', 96, 96, drawFaceIdle);
  generateIfMissing(scene, 'character-face-smile', 96, 96, drawFaceSmile);
  generateIfMissing(scene, 'character-face-hurt', 96, 96, drawFaceHurt);
  generateIfMissing(scene, 'character-face-surprised', 96, 96, drawFaceSurprised);
  generateIfMissing(scene, 'character-face-dead', 96, 96, drawFaceDead);
  generateIfMissing(scene, 'character-hair-default', 96, 96, drawHair);
  generateIfMissing(scene, 'character-top-basic', 96, 96, drawTop);
  generateIfMissing(scene, 'character-pants-basic', 96, 96, drawPants);
  generateIfMissing(scene, 'character-shoes-basic', 96, 96, drawShoes);
  generateIfMissing(scene, 'character-gloves-basic', 96, 96, drawGloves);
  generateIfMissing(scene, 'character-helmet-basic', 96, 96, drawHelmet);
  generateIfMissing(scene, 'character-cape-red', 96, 96, drawCape);
  generateIfMissing(scene, 'character-weapon-wooden-sword', 96, 96, drawWeapon);
  generateIfMissing(scene, 'character-accessory-star', 96, 96, drawAccessory);
  generateIfMissing(scene, 'character-effect-glow', 96, 96, drawEffect);
  generateIfMissing(scene, 'character-shadow', 96, 64, drawShadow);
}