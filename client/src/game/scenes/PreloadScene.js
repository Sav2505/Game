import Phaser from 'phaser';
import { INVENTORY_ITEMS, createWorldPickupTextureKey } from '@/game/inventory/catalog';
export class PreloadScene extends Phaser.Scene {
    constructor() {
        super('PreloadScene');
    }
    preload() {
        for (const item of INVENTORY_ITEMS) {
            this.load.image(createWorldPickupTextureKey(item.id), item.imagePath);
        }
    }
    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const launchScene = this.registry.get('launchScene') ?? 'GameScene';
        this.add.rectangle(width / 2, height / 2, width, height, 0x08111f, 0.88);
        this.add.text(width / 2, height / 2 - 18, 'Loading forest...', {
            fontFamily: 'Inter, sans-serif',
            fontSize: '28px',
            color: '#fff7d5'
        }).setOrigin(0.5);
        this.add.text(width / 2, height / 2 + 20, 'Generating placeholder world and hero', {
            fontFamily: 'Inter, sans-serif',
            fontSize: '16px',
            color: '#aab6d6'
        }).setOrigin(0.5);
        this.time.delayedCall(260, () => {
            this.scene.start(launchScene);
        });
    }
}
