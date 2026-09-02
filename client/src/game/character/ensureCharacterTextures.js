function generateIfMissing(scene, key, width, height, draw) {
    if (scene.textures.exists(key)) {
        return;
    }
    const graphics = scene.add.graphics();
    draw(graphics);
    graphics.generateTexture(key, width, height);
    graphics.destroy();
}
function drawBody(graphics) {
    graphics.clear();
    graphics.fillStyle(0xf2c49c, 1);
    graphics.fillEllipse(48, 24, 34, 30);
    graphics.fillRoundedRect(30, 34, 36, 32, 12);
    graphics.fillRoundedRect(22, 38, 12, 24, 6);
    graphics.fillRoundedRect(62, 38, 12, 24, 6);
    graphics.fillRoundedRect(30, 62, 12, 26, 6);
    graphics.fillRoundedRect(44, 62, 12, 26, 6);
}
function drawFace(graphics) {
    graphics.clear();
    graphics.fillStyle(0xfff7ea, 1);
    graphics.fillEllipse(48, 28, 20, 14);
    graphics.fillStyle(0x2b1a10, 1);
    graphics.fillEllipse(42, 26, 2, 3);
    graphics.fillEllipse(54, 26, 2, 3);
    graphics.fillStyle(0xe87b86, 1);
    graphics.fillEllipse(48, 32, 4, 2);
}
function drawHair(graphics) {
    graphics.clear();
    graphics.fillStyle(0xffffff, 1);
    graphics.fillRoundedRect(34, 10, 28, 22, 10);
    graphics.fillTriangle(34, 24, 28, 40, 40, 34);
    graphics.fillTriangle(62, 24, 68, 40, 56, 34);
    graphics.fillEllipse(48, 18, 26, 18);
}
function drawTop(graphics) {
    graphics.clear();
    graphics.fillStyle(0x67b7ff, 1);
    graphics.fillRoundedRect(28, 36, 40, 34, 12);
    graphics.fillStyle(0x8fd7ff, 1);
    graphics.fillRoundedRect(34, 40, 28, 18, 8);
    graphics.fillStyle(0x3a5d7f, 1);
    graphics.fillRect(44, 50, 8, 18);
}
function drawPants(graphics) {
    graphics.clear();
    graphics.fillStyle(0x45567a, 1);
    graphics.fillRoundedRect(30, 58, 18, 24, 6);
    graphics.fillRoundedRect(48, 58, 18, 24, 6);
    graphics.fillStyle(0x7387b2, 0.9);
    graphics.fillRect(44, 58, 4, 24);
}
function drawShoes(graphics) {
    graphics.clear();
    graphics.fillStyle(0x76513a, 1);
    graphics.fillRoundedRect(26, 82, 16, 8, 4);
    graphics.fillRoundedRect(48, 82, 16, 8, 4);
    graphics.fillStyle(0xc49a71, 1);
    graphics.fillRect(28, 84, 12, 2);
    graphics.fillRect(50, 84, 12, 2);
}
function drawGloves(graphics) {
    graphics.clear();
    graphics.fillStyle(0xf0a96e, 1);
    graphics.fillRoundedRect(18, 40, 10, 10, 4);
    graphics.fillRoundedRect(68, 40, 10, 10, 4);
}
function drawHelmet(graphics) {
    graphics.clear();
    graphics.fillStyle(0xa2a9b8, 1);
    graphics.fillRoundedRect(32, 8, 32, 18, 8);
    graphics.fillStyle(0xdce4f5, 1);
    graphics.fillRect(40, 14, 16, 3);
    graphics.fillStyle(0x6d7686, 1);
    graphics.fillRect(30, 18, 36, 3);
}
function drawCape(graphics) {
    graphics.clear();
    graphics.fillStyle(0xd84e5a, 1);
    graphics.fillRoundedRect(20, 36, 20, 40, 10);
    graphics.fillTriangle(30, 76, 12, 88, 42, 88);
    graphics.fillStyle(0xff8a96, 0.6);
    graphics.fillRect(24, 42, 4, 30);
}
function drawWeapon(graphics) {
    graphics.clear();
    graphics.fillStyle(0x8b5b33, 1);
    graphics.fillRoundedRect(52, 36, 4, 32, 2);
    graphics.fillStyle(0xc99c64, 1);
    graphics.fillRoundedRect(46, 40, 16, 6, 3);
    graphics.fillStyle(0xefe2b2, 1);
    graphics.fillTriangle(56, 14, 66, 42, 46, 42);
}
function drawAccessory(graphics) {
    graphics.clear();
    graphics.fillStyle(0xffdf7a, 1);
    graphics.fillCircle(48, 18, 8);
    graphics.fillStyle(0xffffff, 0.9);
    graphics.fillCircle(48, 18, 3);
}
function drawEffect(graphics) {
    graphics.clear();
    graphics.fillStyle(0xfff0b6, 0.72);
    graphics.fillCircle(48, 36, 28);
    graphics.fillStyle(0xffffff, 0.44);
    graphics.fillCircle(48, 36, 16);
}
function drawShadow(graphics) {
    graphics.clear();
    graphics.fillStyle(0x000000, 0.28);
    graphics.fillEllipse(48, 38, 60, 14);
}
export function ensureCharacterTextures(scene) {
    generateIfMissing(scene, 'character-body-base', 96, 96, drawBody);
    generateIfMissing(scene, 'character-face-default', 96, 96, drawFace);
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
