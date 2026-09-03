export const DEMO_EQUIPMENT = {
    basicShirt: {
        id: 'shirt-1',
        name: 'Shirt 1',
        type: 'top',
        spriteKey: 'character-top-shirt-1',
        render: {
            coordinateSpace: 'characterCanvas512',
            offsetX: 0,
            offsetY: 0,
            scale: 1,
        },
        statBonuses: {
            defense: 1,
            maxHp: 4
        }
    },
    basicPants: {
        id: 'pants-1',
        name: 'Pants 1',
        type: 'pants',
        spriteKey: 'character-pants-1',
        render: {
            coordinateSpace: 'characterCanvas512',
            offsetX: 0,
            offsetY: 0,
            scale: 1
        },
        statBonuses: {
            defense: 1,
            maxHp: 4
        }
    },
    ironHelmet: {
        id: 'hat-1',
        name: 'Hat 1',
        type: 'helmet',
        spriteKey: 'character-helmet-hat-1',
        render: {
            coordinateSpace: 'characterCanvas512',
            offsetX: 0,
            offsetY: -68,
            scale: 0.8
        },
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
        render: {
            coordinateSpace: 'characterCanvas512',
            offsetX: 0,
            offsetY: 30,
            scale: 1,
        },
        statBonuses: {
            dexterity: 2,
            defense: 1
        }
    },
    shoes1: {
        id: 'shoes-1',
        name: 'Shoes 1',
        type: 'shoes',
        spriteKey: 'character-shoes-1',
        render: {
            coordinateSpace: 'characterCanvas512',
            offsetX: 0,
            offsetY: 0,
            scale: 1,
        },
        statBonuses: {
            dexterity: 3,
            defense: 2,
        }
    },
    leatherGloves: {
        id: 'gloves-1',
        name: 'Gloves 1',
        type: 'gloves',
        spriteKey: 'character-gloves-1',
        render: {
            coordinateSpace: 'characterCanvas512',
            offsetX: 0,
            offsetY: 0,
            scale: 1,
        },
        statBonuses: {
            dexterity: 1,
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
};
export const DEMO_EQUIPMENT_ORDER = [
    'basicShirt',
    'basicPants',
    'ironHelmet',
    'woodenSword',
    'leatherBoots',
    'shoes1',
    'leatherGloves',
    'redCape'
];
export const DEMO_EQUIPMENT_SLOT_MAP = {
    top: DEMO_EQUIPMENT.basicShirt,
    pants: DEMO_EQUIPMENT.basicPants,
    helmet: DEMO_EQUIPMENT.ironHelmet,
    weapon: DEMO_EQUIPMENT.woodenSword,
    shoes: DEMO_EQUIPMENT.shoes1,
    gloves: DEMO_EQUIPMENT.leatherGloves,
    cape: DEMO_EQUIPMENT.redCape
};
export const DEFAULT_CHARACTER_APPEARANCE = {
    body: 'player-base-body',
    face: 'character-face-idle',
    hair: 'character-hair-default',
    hairColor: '#77543f',
    skinColor: '#f2c49c'
};
export const DEFAULT_CHARACTER_STATS = {
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
export const DEFAULT_CHARACTER_EQUIPMENT = {
    helmet: DEMO_EQUIPMENT.ironHelmet,
    top: DEMO_EQUIPMENT.basicShirt,
    pants: DEMO_EQUIPMENT.basicPants,
    shoes: DEMO_EQUIPMENT.shoes1,
    gloves: DEMO_EQUIPMENT.leatherGloves
};
export function createDefaultPlayerCharacter() {
    return {
        id: 'hero-001',
        name: 'Aster',
        appearance: DEFAULT_CHARACTER_APPEARANCE,
        equipment: { ...DEFAULT_CHARACTER_EQUIPMENT },
        baseStats: { ...DEFAULT_CHARACTER_STATS }
    };
}
