import { CharacterRenderer } from '@/game/character/CharacterRenderer';
import { PLAYER_CHARACTER_RENDER_CONFIG } from '@/game/character/renderConfig';
export class RemotePlayer {
    playerId;
    characterRenderer;
    constructor(scene, snapshot) {
        this.playerId = snapshot.playerId;
        this.characterRenderer = new CharacterRenderer(scene, snapshot.character, snapshot.x, snapshot.y - 28);
        this.characterRenderer.setScale(PLAYER_CHARACTER_RENDER_CONFIG.rendererScale);
        this.characterRenderer.container.setDepth(16);
        this.applySnapshot(snapshot);
    }
    applySnapshot(snapshot) {
        this.characterRenderer.setCharacter(snapshot.character);
        this.characterRenderer.setPosition(snapshot.x, snapshot.y - 28);
        this.characterRenderer.setFacingDirection(snapshot.facing);
        this.characterRenderer.playAnimation(snapshot.animationState === 'death' ? 'death' : snapshot.animationState);
    }
    update(time) {
        this.characterRenderer.update(time);
    }
    destroy() {
        this.characterRenderer.destroy();
    }
}
