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

export interface WorldPickupState {
  pickupId: string;
  itemId: string;
  x: number;
  y: number;
  source: 'static' | 'dropped';
  collected: boolean;
  collectedByPlayerId?: string;
  spawnedAt: number;
  droppedByPlayerId?: string;
}

export interface RemotePlayerSnapshot {
  playerId: string;
  name: string;
  x: number;
  y: number;
  facing: 'left' | 'right';
  animationState: 'idle' | 'walk' | 'jump' | 'doubleJump' | 'fall' | 'attack' | 'hurt' | 'death';
  character: {
    id: string;
    name: string;
    appearance: {
      body: string;
      face: string;
      hair: string;
      hairColor: string;
      skinColor: string;
    };
    equipment: Partial<Record<'helmet' | 'top' | 'pants' | 'shoes' | 'gloves' | 'cape' | 'weapon' | 'accessory', {
      id: string;
      name: string;
      type: 'helmet' | 'top' | 'pants' | 'shoes' | 'gloves' | 'cape' | 'weapon' | 'accessory';
      spriteKey: string;
      render?: {
        coordinateSpace?: 'layerLocal' | 'characterCanvas512';
        offsetX?: number;
        offsetY?: number;
        scale?: number;
        originX?: number;
        originY?: number;
      };
      statBonuses: Partial<{
        strength: number;
        dexterity: number;
        intelligence: number;
        vitality: number;
        attack: number;
        defense: number;
        magicAttack: number;
        magicDefense: number;
        maxHp: number;
        maxMp: number;
      }>;
    } | null>>;
    baseStats: {
      strength: number;
      dexterity: number;
      intelligence: number;
      vitality: number;
      attack: number;
      defense: number;
      magicAttack: number;
      magicDefense: number;
      maxHp: number;
      maxMp: number;
    };
  };
  updatedAt: number;
}

export interface WorldStateSnapshot {
  version: number;
  worldPickups: WorldPickupState[];
  players: RemotePlayerSnapshot[];
  updatedAt: number;
}

export interface PersistedWorldState {
  version: number;
  worldPickups: WorldPickupState[];
  updatedAt: number;
}

export interface ClientHelloMessage {
  type: 'client:hello';
  payload: {
    playerId: string;
    name: string;
  };
}

export interface ServerHelloMessage {
  type: 'server:hello';
  payload: {
    status: 'connected';
    playerId: string;
    serverTime: number;
  };
}

export interface WorldSyncRequestMessage {
  type: 'world:sync_request';
}

export interface WorldSyncMessage {
  type: 'world:sync';
  payload: WorldStateSnapshot;
}

export interface PlayerJoinMessage {
  type: 'player:join';
  payload: RemotePlayerSnapshot;
}

export interface PlayerUpdateMessage {
  type: 'player:update';
  payload: RemotePlayerSnapshot;
}

export interface PlayerLeaveMessage {
  type: 'player:leave';
  payload: {
    playerId: string;
  };
}

export interface PlayerStateUpdateRequestMessage {
  type: 'player:update_request';
  payload: RemotePlayerSnapshot;
}

export interface DropItemRequestMessage {
  type: 'item:drop_request';
  payload: {
    requestId: string;
    playerId: string;
    itemId: string;
    x: number;
    y: number;
  };
}

export interface ItemDroppedMessage {
  type: 'item:dropped';
  payload: {
    requestId?: string;
    playerId: string;
    pickup: WorldPickupState;
  };
}

export interface PickupItemRequestMessage {
  type: 'item:pickup_request';
  payload: {
    requestId: string;
    playerId: string;
    pickupId: string;
  };
}

export interface ItemPickedMessage {
  type: 'item:picked';
  payload: {
    requestId?: string;
    playerId: string;
    pickupId: string;
    itemId: string;
  };
}

export interface RequestRejectedMessage {
  type: 'request:rejected';
  payload: {
    requestId?: string;
    playerId?: string;
    reason: string;
    code:
      | 'invalid_message'
      | 'player_not_ready'
      | 'pickup_missing'
      | 'pickup_already_collected'
      | 'inventory_mismatch'
      | 'drop_denied';
  };
}

export type ClientToServerMessage =
  | ClientHelloMessage
  | WorldSyncRequestMessage
  | PlayerStateUpdateRequestMessage
  | DropItemRequestMessage
  | PickupItemRequestMessage;

export type ServerToClientMessage =
  | ServerHelloMessage
  | WorldSyncMessage
  | PlayerJoinMessage
  | PlayerUpdateMessage
  | PlayerLeaveMessage
  | ItemDroppedMessage
  | ItemPickedMessage
  | RequestRejectedMessage;

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