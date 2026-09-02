export const PLAYER_CHARACTER_DEBUG = false;
export const PLAYER_CHARACTER_RENDER_CONFIG = {
    rendererScale: 3,
    bodyDisplayWidth: 102,
    bodyDisplayHeight: 102,
    bodyOriginX: 0.5,
    bodyOriginY: 0.72,
    snapToPixels: true,
};
export const PLAYER_CHARACTER_ANIMATION_TIMING = {
    walkFrameMs: 180,
    jumpFrameMs: 120,
    fallbackWalkFrameCount: 6,
    fallbackJumpFrameCount: 1,
};
export const PLAYER_CHARACTER_BODY_TEXTURE_KEYS = {
    stand: 'player-base-body',
    walk: 'player-walk-spritesheet',
    jump: 'player-jump-spritesheet',
};
