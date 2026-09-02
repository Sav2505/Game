export type CharacterAnimationState = 'idle' | 'walk' | 'jump' | 'attack' | 'hurt' | 'death';

export type CharacterFacingDirection = 'left' | 'right';

export type EquipmentType =
  | 'helmet'
  | 'top'
  | 'pants'
  | 'shoes'
  | 'gloves'
  | 'cape'
  | 'weapon'
  | 'accessory';

export interface CharacterStats {
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
}

export interface CharacterAppearance {
  body: string;
  face: string;
  hair: string;
  hairColor: string;
  skinColor: string;
}

export interface EquipmentItem {
  id: string;
  name: string;
  type: EquipmentType;
  spriteKey: string;
  statBonuses: Partial<CharacterStats>;
}

export type CharacterEquipment = Partial<Record<EquipmentType, EquipmentItem | null>>;

export interface PlayerCharacter {
  id: string;
  name: string;
  appearance: CharacterAppearance;
  equipment: CharacterEquipment;
  baseStats: CharacterStats;
}