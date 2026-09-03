import Phaser from 'phaser';
import { GROUND_Y, LEVEL_HEIGHT, LEVEL_WIDTH } from '@/game/config/constants';
import { createWorldPickupTextureKey } from '@/game/inventory/catalog';

export interface ForestWorldResult {
  platforms: Phaser.Physics.Arcade.StaticGroup;
  respawnPoint: Phaser.Math.Vector2;
  guideSpot: Phaser.Math.Vector2;
  slimeSpawns: Phaser.Math.Vector2[];
  pickupSpawns: Array<{
    pickupId: string;
    itemId: string;
    textureKey: string;
    position: Phaser.Math.Vector2;
  }>;
}

export function createForestWorld(scene: Phaser.Scene): ForestWorldResult {
  const platforms = scene.physics.add.staticGroup();

  for (let x = 0; x < LEVEL_WIDTH; x += 128) {
    platforms.create(x + 64, GROUND_Y + 32, 'ground-tile').setOrigin(0.5, 0.5).refreshBody();
  }

  const platformPlacements = [
    { x: 360, y: 650, width: 2 },
    { x: 820, y: 570, width: 2 },
    { x: 1200, y: 520, width: 3 },
    { x: 1740, y: 610, width: 2 },
    { x: 2160, y: 520, width: 2 },
    { x: 2500, y: 470, width: 3 },
    { x: 3020, y: 560, width: 2 },
    { x: 3480, y: 640, width: 2 }
  ];

  for (const platform of platformPlacements) {
    for (let index = 0; index < platform.width; index += 1) {
      platforms.create(platform.x + index * 128, platform.y, 'platform-tile').refreshBody();
    }
  }

  const foregroundDecorations = [
    { texture: 'tree', x: 180, y: GROUND_Y - 40, scale: 1.2 },
    { texture: 'bush', x: 480, y: GROUND_Y + 6, scale: 1.15 },
    { texture: 'tree', x: 720, y: GROUND_Y - 46, scale: 1.1 },
    { texture: 'rock', x: 1120, y: GROUND_Y + 18, scale: 0.9 },
    { texture: 'tree', x: 1500, y: GROUND_Y - 34, scale: 1.25 },
    { texture: 'bush', x: 1980, y: GROUND_Y + 2, scale: 1.25 },
    { texture: 'rock', x: 2380, y: GROUND_Y + 20, scale: 1.05 },
    { texture: 'tree', x: 2840, y: GROUND_Y - 36, scale: 1.25 },
    { texture: 'bush', x: 3260, y: GROUND_Y + 4, scale: 1.15 }
  ];

  for (const decoration of foregroundDecorations) {
    scene.add.image(decoration.x, decoration.y, decoration.texture).setScale(decoration.scale).setDepth(10);
  }

  for (let index = 0; index < 16; index += 1) {
    const offsetX = 260 + index * 220;
    const offsetY = GROUND_Y + 10 - (index % 3) * 10;
    scene.add.image(offsetX, offsetY, 'bush').setScale(0.5 + (index % 2) * 0.1).setAlpha(0.6).setDepth(4);
  }

  scene.add.rectangle(0, LEVEL_HEIGHT - 38, LEVEL_WIDTH, 120, 0x3d2d24).setOrigin(0).setAlpha(0.4).setDepth(2);

  return {
    platforms,
    respawnPoint: new Phaser.Math.Vector2(160, GROUND_Y - 120),
    guideSpot: new Phaser.Math.Vector2(920, GROUND_Y - 88),
    slimeSpawns: [
      new Phaser.Math.Vector2(1760, GROUND_Y - 140),
      new Phaser.Math.Vector2(2180, GROUND_Y - 140),
      new Phaser.Math.Vector2(2640, GROUND_Y - 140)
    ],
    pickupSpawns: [
      {
        pickupId: 'forest-guide-shirt-2',
        itemId: 'shirt-2',
        textureKey: createWorldPickupTextureKey('shirt-2'),
        position: new Phaser.Math.Vector2(1040, GROUND_Y - 136)
      }
    ]
  };
}