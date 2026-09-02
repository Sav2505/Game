import { gameRuntime } from '@/game/bridge/GameRuntime';
import { useGameStore } from '@/state/gameStore';

export function DeathOverlay() {
  const deathOpen = useGameStore((state) => state.ui.deathOpen);

  if (!deathOpen) {
    return null;
  }

  return (
    <div className="death-backdrop">
      <div className="death-panel" style={{ textAlign: 'center' }}>
        <h2 className="panel-title" style={{ color: '#ff8f99', fontSize: '2.5rem' }}>
          YOU DIED
        </h2>
        <p className="panel-copy">The forest is dangerous. Respawn at the entrance and try again.</p>
        <div className="dialogue-actions" style={{ justifyContent: 'center' }}>
          <button className="primary-button" type="button" onClick={() => gameRuntime.respawnPlayer()}>
            RESPAWN
          </button>
        </div>
      </div>
    </div>
  );
}