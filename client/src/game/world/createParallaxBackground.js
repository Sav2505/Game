export function createParallaxBackground(scene) {
    scene.cameras.main.setBackgroundColor('#8ed6ff');
    const sky = scene.add.rectangle(0, 0, 1280, 720, 0x8ed6ff).setOrigin(0).setScrollFactor(0).setDepth(-100);
    const clouds = scene.add.tileSprite(0, 0, 1280, 220, 'cloud-layer').setOrigin(0).setScrollFactor(0).setAlpha(0.55).setDepth(-90);
    const mountains = scene.add.tileSprite(0, 200, 1280, 220, 'mountain-layer').setOrigin(0).setScrollFactor(0).setAlpha(0.8).setDepth(-80);
    const trees = scene.add.tileSprite(0, 360, 1280, 260, 'tree-layer').setOrigin(0).setScrollFactor(0).setAlpha(0.8).setDepth(-70);
    return {
        update(scrollX) {
            clouds.tilePositionX = scrollX * 0.08;
            mountains.tilePositionX = scrollX * 0.14;
            trees.tilePositionX = scrollX * 0.24;
            sky.x = 0;
        }
    };
}
