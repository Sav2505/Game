import Phaser from 'phaser';
export class ForestGuide extends Phaser.GameObjects.Image {
    id = 'forest-guide';
    constructor(scene, x, y) {
        super(scene, x, y, 'forest-guide');
        scene.add.existing(this);
        this.setDepth(18);
        this.setScale(1.05);
    }
}
