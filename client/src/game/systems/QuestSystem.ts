import type { QuestState, QuestReward } from '@shared/types';

export class QuestSystem {
  public constructor(private readonly onChange: (quest: QuestState) => void) {}

  public recordSlimeDefeat(quest: QuestState): QuestState {
    if (quest.completed) {
      return quest;
    }

    const nextProgress = Math.min(quest.target, quest.progress + 1);
    const nextQuest: QuestState = {
      ...quest,
      progress: nextProgress,
      completed: nextProgress >= quest.target
    };

    this.onChange(nextQuest);
    return nextQuest;
  }

  public claimReward(quest: QuestState): { quest: QuestState; reward: QuestReward } | null {
    if (!quest.completed || quest.rewardClaimed) {
      return null;
    }

    const nextQuest: QuestState = {
      ...quest,
      rewardClaimed: true
    };

    this.onChange(nextQuest);
    return { quest: nextQuest, reward: quest.reward };
  }
}