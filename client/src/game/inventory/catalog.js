export const INVENTORY_SLOT_COUNT = 30;
export const INVENTORY_ITEMS = [
    {
        id: 'hat-1',
        name: 'Iron Helm',
        category: 'Helmet',
        rarity: 'common',
        actionType: 'equippable',
        imagePath: '/assets/characters/player/helmets/hat_1.png',
        quantity: 1,
        description: 'Riveted iron headgear that protects against glancing blows.',
        stats: [
            { label: 'Defense', value: '+6' },
            { label: 'Max HP', value: '+12' }
        ],
        bonuses: [{ label: 'Stability', value: '+5 Knockback Resist' }],
        powers: ['Guarded Mind: reduces interruption while attacking.'],
        attributes: ['Heavy', 'Protective', 'Forged'],
        effects: ['Minor chance to negate chip damage from weak enemies.'],
        equipSlot: 'helmet'
    },
    {
        id: 'shirt-1',
        name: 'Traveler Tunic',
        category: 'Top',
        rarity: 'uncommon',
        actionType: 'equippable',
        imagePath: '/assets/characters/player/tops/shirt_1.png',
        quantity: 1,
        description: 'A reinforced tunic stitched with padded thread for field travel.',
        stats: [
            { label: 'Defense', value: '+4' },
            { label: 'Vitality', value: '+3' }
        ],
        bonuses: [{ label: 'Regeneration', value: '+1 HP / 5s' }],
        powers: ['Steady Breath: recovering from damage is slightly faster.'],
        attributes: ['Fabric', 'Utility', 'Adventurer'],
        effects: ['Boosts survivability during long grinding sessions.'],
        equipSlot: 'top'
    },
    {
        id: 'shirt-2',
        name: 'Forest Whisper Shirt',
        category: 'Top',
        rarity: 'rare',
        actionType: 'equippable',
        imagePath: '/assets/characters/player/tops/shirt_2.png',
        quantity: 1,
        description: 'A finely stitched shirt that feels light on the body and steady in the forest air.',
        stats: [
            { label: 'Defense', value: '+5' },
            { label: 'Vitality', value: '+4' }
        ],
        bonuses: [{ label: 'Comfort', value: '+6 Recovery Balance' }],
        powers: ['Breath of the Grove: movement feels calmer after taking a hit.'],
        attributes: ['Fabric', 'Forestcraft', 'Rare'],
        effects: ['A lightweight top recovered from the guide path.'],
        equipSlot: 'top'
    },
    {
        id: 'pants-1',
        name: 'Ranger Pants',
        category: 'Pants',
        rarity: 'uncommon',
        actionType: 'equippable',
        imagePath: '/assets/characters/player/pants/pants_1.png',
        quantity: 1,
        description: 'Flexible leg armor tailored for movement through dense woodland.',
        stats: [
            { label: 'Defense', value: '+3' },
            { label: 'Dexterity', value: '+4' }
        ],
        bonuses: [{ label: 'Mobility', value: '+5% Move Speed' }],
        powers: ['Feather Step: slight reduction to landing lag after jumps.'],
        attributes: ['Flexible', 'Leather-Lined', 'Field Wear'],
        effects: ['Improves navigation while kiting enemies.'],
        equipSlot: 'pants'
    },
    {
        id: 'shoes-1',
        name: 'Swift Shoes',
        category: 'Shoes',
        rarity: 'rare',
        actionType: 'equippable',
        imagePath: '/assets/characters/player/shoes/shoes_1.png',
        quantity: 1,
        description: 'Light footwear enchanted with a subtle gust rune under each sole.',
        stats: [
            { label: 'Dexterity', value: '+6' },
            { label: 'Defense', value: '+2' }
        ],
        bonuses: [{ label: 'Evasion', value: '+4%' }],
        powers: ['Wind Step: first dash after landing has increased distance.'],
        attributes: ['Air Rune', 'Light', 'Scout'],
        effects: ['Small chance to avoid contact damage while moving.'],
        equipSlot: 'shoes'
    },
    {
        id: 'gloves-1',
        name: 'Leather Gloves',
        category: 'Gloves',
        rarity: 'common',
        actionType: 'equippable',
        imagePath: '/assets/characters/player/gloves/gloves_1.png',
        quantity: 1,
        description: 'Worn but reliable gloves that improve grip and weapon handling.',
        stats: [
            { label: 'Dexterity', value: '+2' },
            { label: 'Attack', value: '+3' }
        ],
        bonuses: [{ label: 'Crafting', value: '+8 Gathering Efficiency' }],
        powers: ['Firm Grip: basic attacks have tighter hit consistency.'],
        attributes: ['Utility', 'Handcrafted'],
        effects: ['Slight increase to drop interaction responsiveness.'],
        equipSlot: 'gloves'
    }
];
export function createInitialInventoryItems() {
    return INVENTORY_ITEMS.map((item) => ({ ...item }));
}
export function createInventoryItemById(itemId) {
    const item = INVENTORY_ITEMS.find((entry) => entry.id === itemId);
    return item ? { ...item } : null;
}
export function createWorldPickupTextureKey(itemId) {
    return `inventory-world-${itemId}`;
}
