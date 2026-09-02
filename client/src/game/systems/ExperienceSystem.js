const LEVEL_THRESHOLDS = {
    1: 100,
    2: 250,
    3: 450,
    4: 700
};
export class ExperienceSystem {
    onLevelUp;
    constructor(onLevelUp) {
        this.onLevelUp = onLevelUp;
    }
    addExperience(state, amount) {
        let nextState = { ...state, xp: state.xp + amount };
        let leveledUp = false;
        while (nextState.xp >= nextState.maxXp) {
            leveledUp = true;
            nextState = this.levelUp(nextState);
        }
        return { state: nextState, leveledUp };
    }
    levelUp(state) {
        const nextLevel = state.level + 1;
        const nextXpThreshold = LEVEL_THRESHOLDS[nextLevel] ?? Math.round(state.maxXp * 1.35);
        const overflowXp = state.xp - state.maxXp;
        const nextState = {
            ...state,
            level: nextLevel,
            xp: Math.max(0, overflowXp),
            maxXp: nextXpThreshold,
            maxHp: state.maxHp + 20,
            hp: state.maxHp + 20
        };
        this.onLevelUp?.(nextState);
        return nextState;
    }
}
