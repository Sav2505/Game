const STAT_KEYS = [
    'strength',
    'dexterity',
    'intelligence',
    'vitality',
    'attack',
    'defense',
    'magicAttack',
    'magicDefense',
    'maxHp',
    'maxMp'
];
export function calculateFinalCharacterStats(baseStats, equipment) {
    const finalStats = { ...baseStats };
    for (const item of Object.values(equipment)) {
        if (!item) {
            continue;
        }
        for (const statKey of STAT_KEYS) {
            const bonus = item.statBonuses[statKey];
            if (typeof bonus === 'number') {
                finalStats[statKey] += bonus;
            }
        }
    }
    return finalStats;
}
