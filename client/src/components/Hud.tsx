import { useMemo } from 'react';
import { useGameStore } from '@/state/gameStore';

export function Hud() {
  const player = useGameStore((state) => state.player);
  const prompt = useGameStore((state) => state.ui.prompt);

  const hpPercent = useMemo(() => Math.max(0, Math.min(100, (player.hp / player.maxHp) * 100)), [player.hp, player.maxHp]);
  const xpPercent = useMemo(() => Math.max(0, Math.min(100, (player.xp / player.maxXp) * 100)), [player.xp, player.maxXp]);

  return (
    <div className="hud">
      <div className="hud-panel hud-top-left">
        <div className="hud-title">Adventurer</div>
        <div className="hud-row" style={{ marginBottom: '10px' }}>
          <strong>{player.name}</strong>
          <span className="muted">Level {player.level}</span>
        </div>
        <div className="hud-title">HP</div>
        <div className="bar" aria-label="Health">
          <div className="bar-fill hp" style={{ width: `${hpPercent}%` }} />
        </div>
        <div className="hud-row" style={{ marginTop: '8px' }}>
          <span>{player.hp} / {player.maxHp}</span>
          <span className="muted">Forest HP</span>
        </div>
        <div className="hud-title" style={{ marginTop: '14px' }}>XP</div>
        <div className="bar" aria-label="Experience">
          <div className="bar-fill xp" style={{ width: `${xpPercent}%` }} />
        </div>
        <div className="hud-row" style={{ marginTop: '8px' }}>
          <span>{player.xp} / {player.maxXp}</span>
          <span className="muted">Progress</span>
        </div>
      </div>

      <div className="hud-panel hud-top-right">
        <div className="hud-title">Gold</div>
        <div style={{ fontSize: '1.8rem', color: '#fff0bc', fontWeight: 800 }}>{player.gold}</div>
      </div>

      <div className="hud-panel hud-bottom-right">
        <div className="hud-title">Controls</div>
        <div className="controls-list">
          <div>A / Left Arrow - Move Left</div>
          <div>D / Right Arrow - Move Right</div>
          <div>SPACE - Jump</div>
          <div>X - Attack</div>
          <div>E - Interact</div>
        </div>
        {prompt ? <div style={{ marginTop: '12px', color: '#fff7d5' }}>{prompt}</div> : null}
      </div>
    </div>
  );
}