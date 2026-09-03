export interface PlayerState {
  id: string;
  name: string;
  level: number;
  xp: number;
  maxXp: number;
  hp: number;
  maxHp: number;
  gold: number;
  inventory: InventoryItemSnapshot[];
}

export interface InventoryUseEffectSnapshot {
  kind: 'healHp' | 'gainGold';
  amount: number;
}

export interface InventoryStatLineSnapshot {
  label: string;
  value: string;
}

export interface InventoryItemSnapshot {
  id: string;
  name: string;
  category: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic';
  actionType: 'equippable' | 'usable' | 'none';
  imagePath: string;
  quantity: number;
  description: string;
  stats: InventoryStatLineSnapshot[];
  bonuses: InventoryStatLineSnapshot[];
  powers: string[];
  attributes: string[];
  effects: string[];
  equipSlot?: 'helmet' | 'top' | 'pants' | 'shoes' | 'gloves' | 'cape' | 'weapon' | 'accessory';
  useEffect?: InventoryUseEffectSnapshot;
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

export interface DroppedPickupState {
  pickupId: string;
  itemId: string;
  x: number;
  y: number;
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
  collectedPickupIds: string[];
  droppedPickups: DroppedPickupState[];
}