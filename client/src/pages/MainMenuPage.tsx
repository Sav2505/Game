import { useState } from 'react';

interface MainMenuPageProps {
  onPlay: () => void;
  onShowcase: () => void;
}

export function MainMenuPage({ onPlay, onShowcase }: MainMenuPageProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <div className="menu-screen">
      <div className="menu-card">
        <h1 className="logo">Modern RPG</h1>
        <p className="tagline">
          A cozy side-scrolling fantasy RPG foundation with React UI, Phaser gameplay, clean state bridges,
          and a forest slice built for future multiplayer and persistence layers.
        </p>

        <div className="menu-actions">
          <button className="primary-button" onClick={onPlay} type="button">
            PLAY
          </button>
          <button className="secondary-button" onClick={() => setSettingsOpen((current) => !current)} type="button">
            SETTINGS
          </button>
          <button className="secondary-button" onClick={onShowcase} type="button">
            CHARACTER SHOWCASE
          </button>
          <button className="ghost-button" onClick={() => window.close()} type="button">
            QUIT
          </button>
        </div>

        {settingsOpen ? (
          <div className="settings-panel" style={{ marginTop: '22px' }}>
            <h2 className="panel-title">Settings</h2>
            <p className="panel-copy">
              Placeholder configuration for audio and presentation. These values can later be connected to a
              proper settings store without changing the game scene.
            </p>
            <div className="slider-row">
              <label htmlFor="music">Music Volume</label>
              <input id="music" type="range" min="0" max="100" defaultValue="72" />
            </div>
            <div className="slider-row">
              <label htmlFor="sfx">SFX Volume</label>
              <input id="sfx" type="range" min="0" max="100" defaultValue="84" />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}