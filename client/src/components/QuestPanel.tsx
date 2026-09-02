import { gameRuntime } from '@/game/bridge/GameRuntime';
import { gameStore, useGameStore } from '@/state/gameStore';

export function QuestPanel() {
  const isOpen = useGameStore((state) => state.ui.questOpen);
  const quest = useGameStore((state) => state.quest);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="quest-backdrop">
      <div className="quest-panel">
        <h2 className="panel-title">{quest.name}</h2>
        <p className="panel-copy">{quest.description}</p>
        <div className="quest-progress">
          Progress: {quest.progress} / {quest.target}
        </div>
        <div className="quest-reward">
          <span>Reward</span>
          <span>{quest.reward.xp} XP</span>
          <span>{quest.reward.gold} Gold</span>
        </div>
        <div className="quest-actions">
          {quest.completed && !quest.rewardClaimed ? (
            <button className="primary-button" type="button" onClick={() => gameRuntime.claimQuestReward()}>
              Claim Reward
            </button>
          ) : null}
          <button
            className="ghost-button"
            type="button"
            onClick={() => {
              gameStore.setQuestOpen(false);
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}