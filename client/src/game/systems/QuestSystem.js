export class QuestSystem {
    onChange;
    constructor(onChange) {
        this.onChange = onChange;
    }
    recordSlimeDefeat(quest) {
        if (quest.completed) {
            return quest;
        }
        const nextProgress = Math.min(quest.target, quest.progress + 1);
        const nextQuest = {
            ...quest,
            progress: nextProgress,
            completed: nextProgress >= quest.target
        };
        this.onChange(nextQuest);
        return nextQuest;
    }
    claimReward(quest) {
        if (!quest.completed || quest.rewardClaimed) {
            return null;
        }
        const nextQuest = {
            ...quest,
            rewardClaimed: true
        };
        this.onChange(nextQuest);
        return { quest: nextQuest, reward: quest.reward };
    }
}
