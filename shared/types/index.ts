export interface PlayerState {
  id: string;
  name: string;
  level: number;
  xp: number;
  maxXp: number;
  hp: number;
  maxHp: number;
  gold: number;
}

export interface QuestReward {
  xp: number;
  gold: number;
}

export interface QuestState {
  id: string;
  name: string;
  description: string;
  progress: number;
  target: number;
  completed: boolean;
  rewardClaimed: boolean;
  reward: QuestReward;
}

export interface DamageEvent {
  sourceId: string;
  targetId: string;
  amount: number;
  critical?: boolean;
}

export interface GameMessage {
  type: string;
  payload?: unknown;
}

export interface SavedGameSnapshot {
  player: PlayerState;
  quest: QuestState;
}