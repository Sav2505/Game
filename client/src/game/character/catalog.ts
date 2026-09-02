import type { CharacterAppearance, CharacterEquipment, CharacterStats, EquipmentItem, PlayerCharacter } from './types';

export const DEMO_EQUIPMENT = {
  basicShirt: {
    id: 'basic-shirt',
    name: 'Basic Shirt',
    type: 'top',
    spriteKey: 'character-top-basic',
    statBonuses: {
      defense: 1,
      maxHp: 4
    }
  },
  ironHelmet: {
    id: 'iron-helmet',
    name: 'Iron Helmet',
    type: 'helmet',
    spriteKey: 'character-helmet-basic',
    statBonuses: {
      defense: 2,
      maxHp: 6
    }
  },
  woodenSword: {
    id: 'wooden-sword',
    name: 'Wooden Sword',
    type: 'weapon',
    spriteKey: 'character-weapon-wooden-sword',
    statBonuses: {
      strength: 2,
      attack: 6
    }
  },
  leatherBoots: {
    id: 'leather-boots',
    name: 'Leather Boots',
    type: 'shoes',
    spriteKey: 'character-shoes-basic',
    statBonuses: {
      dexterity: 2,
      defense: 1
    }
  },
  redCape: {
    id: 'red-cape',
    name: 'Red Cape',
    type: 'cape',
    spriteKey: 'character-cape-red',
    statBonuses: {
      vitality: 1,
      maxHp: 5
    }
  }
} satisfies Record<string, EquipmentItem>;

export const DEMO_EQUIPMENT_ORDER: Array<keyof typeof DEMO_EQUIPMENT> = [
  'basicShirt',
  'ironHelmet',
  'woodenSword',
  'leatherBoots',
  'redCape'
];

export const DEMO_EQUIPMENT_SLOT_MAP: Record<string, EquipmentItem> = {
  top: DEMO_EQUIPMENT.basicShirt,
  helmet: DEMO_EQUIPMENT.ironHelmet,
  weapon: DEMO_EQUIPMENT.woodenSword,
  shoes: DEMO_EQUIPMENT.leatherBoots,
  cape: DEMO_EQUIPMENT.redCape
};

export const DEFAULT_CHARACTER_APPEARANCE: CharacterAppearance = {
  body: 'character-body-base',
  face: 'character-face-idle',
  hair: 'character-hair-default',
  hairColor: '#77543f',
  skinColor: '#f2c49c'
};

export const DEFAULT_CHARACTER_STATS: CharacterStats = {
  strength: 10,
  dexterity: 8,
  intelligence: 4,
  vitality: 10,
  attack: 5,
  defense: 4,
  magicAttack: 1,
  magicDefense: 2,
  maxHp: 100,
  maxMp: 30
};

export const DEFAULT_CHARACTER_EQUIPMENT: CharacterEquipment = {
  top: DEMO_EQUIPMENT.basicShirt,
  shoes: DEMO_EQUIPMENT.leatherBoots,
  weapon: DEMO_EQUIPMENT.woodenSword
};

export function createDefaultPlayerCharacter(): PlayerCharacter {
  return {
    id: 'hero-001',
    name: 'Aster',
    appearance: DEFAULT_CHARACTER_APPEARANCE,
    equipment: { ...DEFAULT_CHARACTER_EQUIPMENT },
    baseStats: { ...DEFAULT_CHARACTER_STATS }
  };
}