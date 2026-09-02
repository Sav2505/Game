export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;
export const LEVEL_WIDTH = 4200;
export const LEVEL_HEIGHT = 960;
export const GROUND_Y = 820;
export const REACT_HUD_UPDATE_DISTANCE = 120;

export const PLAYER_CONFIG = {
  movementSpeed: 260,
  jumpForce: 560,
  doubleJumpMultiplier: 1.3,
  gravity: 1200,
  maxHp: 100,
  attackDamage: 20,
  attackCooldown: 520,
  attackDuration: 160
} as const;

export const SLIME_CONFIG = {
  hp: 60,
  damage: 10,
  speed: 110,
  detectionRange: 340,
  attackRange: 68,
  attackCooldown: 1200,
  xpReward: 20,
  goldReward: 10,
  patrolRadius: 180
} as const;

export const QUEST_REWARD = {
  xp: 100,
  gold: 50
} as const;