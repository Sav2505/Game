import { gameRuntime } from '@/game/bridge/GameRuntime';
import { gameStore, useGameStore } from '@/state/gameStore';

export function DialoguePanel() {
  const isOpen = useGameStore((state) => state.ui.dialogueOpen);
  const quest = useGameStore((state) => state.quest);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="dialogue-backdrop">
      <div className="dialogue-layout">
        <div className="dialogue-panel">
          <h2 className="panel-title npc-name">Forest Guide</h2>
          <p className="panel-copy">Welcome, adventurer!</p>
          <p className="panel-copy">The forest is full of dangerous Slimes.</p>
          <p className="panel-copy">Can you defeat 3 of them?</p>
          <div className="dialogue-actions">
            <button className="primary-button" type="button" onClick={() => gameRuntime.claimQuestReward()}>
              Claim Quest Reward
            </button>
            <button className="secondary-button" type="button" onClick={() => gameRuntime.respawnPlayer()}>
              Respawn
            </button>
            <button
              className="ghost-button"
              type="button"
              onClick={() => {
                gameStore.setDialogueOpen(false);
                gameStore.setQuestOpen(false);
                gameStore.setPrompt(null);
              }}
            >
              Close
            </button>
          </div>
        </div>

        <div className="quest-panel">
          <h2 className="panel-title">Quest</h2>
          <div className="panel-copy">{quest.name}</div>
          <div className="quest-progress">
            Defeat 3 Slimes.
            <br />
            Progress: {quest.progress} / {quest.target}
          </div>
          <div className="quest-reward">
            <span>Reward</span>
            <span>{quest.reward.xp} XP</span>
            <span>{quest.reward.gold} Gold</span>
          </div>
          <div className="quest-actions">
            <button className="secondary-button" type="button" onClick={() => gameRuntime.claimQuestReward()}>
              Claim Reward
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}