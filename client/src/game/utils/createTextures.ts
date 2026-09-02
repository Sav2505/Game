import Phaser from 'phaser';

type TextureKey =
  | 'player'
  | 'player-hurt'
  | 'slime'
  | 'slime-hurt'
  | 'forest-guide'
  | 'tree'
  | 'bush'
  | 'rock'
  | 'ground-tile'
  | 'platform-tile'
  | 'cloud-layer'
  | 'mountain-layer'
  | 'tree-layer'
  | 'particle';

function drawPlayer(graphics: Phaser.GameObjects.Graphics, hurt = false): void {
  graphics.clear();
  graphics.fillStyle(hurt ? 0xff7078 : 0x6dd6d0, 1);
  graphics.fillRoundedRect(12, 18, 40, 46, 18);
  graphics.fillStyle(0xf8f0d4, 1);
  graphics.fillEllipse(20, 28, 18, 16);
  graphics.fillEllipse(44, 28, 18, 16);
  graphics.fillStyle(0x2b1a10, 1);
  graphics.fillEllipse(22, 28, 5, 5);
  graphics.fillEllipse(42, 28, 5, 5);
  graphics.fillStyle(0xffd780, 1);
  graphics.fillRoundedRect(18, 46, 28, 16, 8);
  graphics.fillStyle(0xffffff, 0.75);
  graphics.fillEllipse(30, 54, 14, 8);
}

function drawSlime(graphics: Phaser.GameObjects.Graphics, hurt = false): void {
  graphics.clear();
  graphics.fillStyle(hurt ? 0xff8e8e : 0x78ef9f, 1);
  graphics.fillEllipse(24, 26, 40, 32);
  graphics.fillStyle(0x204428, 0.92);
  graphics.fillEllipse(16, 24, 6, 8);
  graphics.fillEllipse(32, 24, 6, 8);
  graphics.fillStyle(0xffffff, 0.75);
  graphics.fillEllipse(14, 22, 2, 2);
  graphics.fillEllipse(30, 22, 2, 2);
  graphics.fillStyle(0xc9ffdb, 0.32);
  graphics.fillEllipse(30, 20, 12, 8);
}

function drawGuide(graphics: Phaser.GameObjects.Graphics): void {
  graphics.clear();
  graphics.fillStyle(0x8ebeff, 1);
  graphics.fillRoundedRect(18, 20, 30, 40, 12);
  graphics.fillStyle(0xffd7a6, 1);
  graphics.fillRoundedRect(22, 10, 22, 18, 8);
  graphics.fillStyle(0x34201a, 1);
  graphics.fillEllipse(28, 18, 4, 4);
  graphics.fillEllipse(38, 18, 4, 4);
  graphics.fillStyle(0xf2b56b, 1);
  graphics.fillTriangle(46, 26, 60, 34, 46, 42);
  graphics.fillStyle(0xffffff, 0.65);
  graphics.fillCircle(34, 48, 8);
}

function drawTree(graphics: Phaser.GameObjects.Graphics): void {
  graphics.clear();
  graphics.fillStyle(0x6f4f33, 1);
  graphics.fillRoundedRect(24, 58, 14, 40, 6);
  graphics.fillStyle(0x2f7d49, 1);
  graphics.fillCircle(30, 30, 26);
  graphics.fillCircle(16, 38, 14);
  graphics.fillCircle(44, 38, 14);
}

function drawBush(graphics: Phaser.GameObjects.Graphics): void {
  graphics.clear();
  graphics.fillStyle(0x3f8c57, 1);
  graphics.fillCircle(16, 22, 12);
  graphics.fillCircle(28, 16, 15);
  graphics.fillCircle(40, 22, 12);
}

function drawRock(graphics: Phaser.GameObjects.Graphics): void {
  graphics.clear();
  graphics.fillStyle(0x8b8fa0, 1);
  graphics.fillRoundedRect(10, 14, 42, 28, 12);
  graphics.fillStyle(0xdce4ff, 0.35);
  graphics.fillEllipse(28, 22, 18, 10);
}

function drawGroundTile(graphics: Phaser.GameObjects.Graphics): void {
  graphics.clear();
  graphics.fillStyle(0x2f7d49, 1);
  graphics.fillRect(0, 0, 128, 20);
  graphics.fillStyle(0x6f4f33, 1);
  graphics.fillRect(0, 20, 128, 44);
  graphics.fillStyle(0x8d6846, 0.5);
  graphics.fillRect(0, 26, 128, 4);
  graphics.fillStyle(0x3f9b61, 0.6);
  graphics.fillCircle(18, 12, 5);
  graphics.fillCircle(52, 14, 4);
  graphics.fillCircle(98, 10, 5);
}

function drawPlatformTile(graphics: Phaser.GameObjects.Graphics): void {
  graphics.clear();
  graphics.fillStyle(0x8c5f3d, 1);
  graphics.fillRoundedRect(0, 0, 128, 28, 8);
  graphics.fillStyle(0xc98b5b, 1);
  graphics.fillRect(0, 4, 128, 4);
  graphics.fillStyle(0x5d3b24, 0.3);
  graphics.fillRect(0, 20, 128, 2);
}

function drawCloudLayer(graphics: Phaser.GameObjects.Graphics): void {
  graphics.clear();
  graphics.fillStyle(0xffffff, 0.65);
  for (let index = 0; index < 6; index += 1) {
    const x = 60 + index * 84;
    const y = 60 + (index % 2) * 22;
    graphics.fillEllipse(x, y, 96, 34);
    graphics.fillEllipse(x + 30, y - 8, 74, 28);
    graphics.fillEllipse(x - 30, y - 4, 66, 24);
  }
}

function drawMountainLayer(graphics: Phaser.GameObjects.Graphics): void {
  graphics.clear();
  graphics.fillStyle(0x57749e, 1);
  graphics.fillTriangle(0, 180, 120, 30, 240, 180);
  graphics.fillTriangle(180, 180, 300, 40, 420, 180);
  graphics.fillTriangle(320, 180, 420, 80, 520, 180);
  graphics.fillStyle(0x7e9bcc, 0.55);
  graphics.fillTriangle(94, 76, 120, 30, 146, 82);
  graphics.fillTriangle(274, 92, 300, 40, 326, 92);
  graphics.fillTriangle(396, 118, 420, 80, 444, 120);
}

function drawTreeLayer(graphics: Phaser.GameObjects.Graphics): void {
  graphics.clear();
  graphics.fillStyle(0x2f6a48, 1);
  for (let index = 0; index < 7; index += 1) {
    const x = 36 + index * 72;
    graphics.fillTriangle(x - 20, 160, x, 90, x + 20, 160);
    graphics.fillTriangle(x - 24, 130, x, 56, x + 24, 130);
    graphics.fillRect(x - 4, 160, 8, 28);
  }
}

function drawParticle(graphics: Phaser.GameObjects.Graphics): void {
  graphics.clear();
  graphics.fillStyle(0xffffff, 1);
  graphics.fillCircle(4, 4, 4);
}

export function ensureTextures(scene: Phaser.Scene): void {
  if (scene.textures.exists('player')) {
    return;
  }

  const graphics = scene.add.graphics();
  drawPlayer(graphics, false);
  graphics.generateTexture('player', 64, 72);
  drawPlayer(graphics, true);
  graphics.generateTexture('player-hurt', 64, 72);
  drawSlime(graphics, false);
  graphics.generateTexture('slime', 56, 44);
  drawSlime(graphics, true);
  graphics.generateTexture('slime-hurt', 56, 44);
  drawGuide(graphics);
  graphics.generateTexture('forest-guide', 72, 72);
  drawTree(graphics);
  graphics.generateTexture('tree', 64, 100);
  drawBush(graphics);
  graphics.generateTexture('bush', 56, 40);
  drawRock(graphics);
  graphics.generateTexture('rock', 56, 44);
  drawGroundTile(graphics);
  graphics.generateTexture('ground-tile', 128, 64);
  drawPlatformTile(graphics);
  graphics.generateTexture('platform-tile', 128, 28);
  drawCloudLayer(graphics);
  graphics.generateTexture('cloud-layer', 520, 160);
  drawMountainLayer(graphics);
  graphics.generateTexture('mountain-layer', 560, 180);
  drawTreeLayer(graphics);
  graphics.generateTexture('tree-layer', 560, 220);
  drawParticle(graphics);
  graphics.generateTexture('particle', 8, 8);
  graphics.destroy();
}

export type GeneratedTextureKey = TextureKey;