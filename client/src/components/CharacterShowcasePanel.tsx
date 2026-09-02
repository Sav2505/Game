import { characterStore, useCharacterStore } from '@/state/characterStore';

export function CharacterShowcasePanel() {
  const character = useCharacterStore((state) => state.character);
  const finalStats = useCharacterStore((state) => state.finalStats);
  const animationState = useCharacterStore((state) => state.animationState);
  const facingDirection = useCharacterStore((state) => state.facingDirection);

  return (
    <div className="showcase-panel">
      <h2 className="panel-title">Equipment</h2>
      <div className="showcase-stat-grid">
        <div><strong>Facing</strong><span>{facingDirection}</span></div>
        <div><strong>Animation</strong><span>{animationState}</span></div>
        <div><strong>Helmet</strong><span>{character.equipment.helmet?.name ?? 'None'}</span></div>
        <div><strong>Top</strong><span>{character.equipment.top?.name ?? 'None'}</span></div>
        <div><strong>Pants</strong><span>{character.equipment.pants?.name ?? 'None'}</span></div>
        <div><strong>Shoes</strong><span>{character.equipment.shoes?.name ?? 'None'}</span></div>
        <div><strong>Gloves</strong><span>{character.equipment.gloves?.name ?? 'None'}</span></div>
        <div><strong>Cape</strong><span>{character.equipment.cape?.name ?? 'None'}</span></div>
        <div><strong>Weapon</strong><span>{character.equipment.weapon?.name ?? 'None'}</span></div>
        <div><strong>Accessory</strong><span>{character.equipment.accessory?.name ?? 'None'}</span></div>
      </div>

      <h2 className="panel-title" style={{ marginTop: '18px' }}>Stats</h2>
      <div className="showcase-stat-grid compact">
        <div><strong>STR</strong><span>{finalStats.strength}</span></div>
        <div><strong>DEX</strong><span>{finalStats.dexterity}</span></div>
        <div><strong>INT</strong><span>{finalStats.intelligence}</span></div>
        <div><strong>VIT</strong><span>{finalStats.vitality}</span></div>
        <div><strong>Attack</strong><span>{finalStats.attack}</span></div>
        <div><strong>Defense</strong><span>{finalStats.defense}</span></div>
        <div><strong>Magic ATK</strong><span>{finalStats.magicAttack}</span></div>
        <div><strong>Magic DEF</strong><span>{finalStats.magicDefense}</span></div>
        <div><strong>Max HP</strong><span>{finalStats.maxHp}</span></div>
        <div><strong>Max MP</strong><span>{finalStats.maxMp}</span></div>
      </div>

      <h2 className="panel-title" style={{ marginTop: '18px' }}>Toggle Demo Gear</h2>
      <div className="showcase-buttons">
        <button className="secondary-button" type="button" onClick={() => characterStore.toggleDemoEquipment('top')}>1 Shirt</button>
        <button className="secondary-button" type="button" onClick={() => characterStore.toggleDemoEquipment('helmet')}>2 Helmet</button>
        <button className="secondary-button" type="button" onClick={() => characterStore.toggleDemoEquipment('weapon')}>3 Weapon</button>
        <button className="secondary-button" type="button" onClick={() => characterStore.toggleDemoEquipment('shoes')}>4 Boots</button>
        <button className="secondary-button" type="button" onClick={() => characterStore.toggleDemoEquipment('cape')}>5 Cape</button>
      </div>

      <div className="showcase-buttons" style={{ marginTop: '14px' }}>
        <button className="ghost-button" type="button" onClick={() => characterStore.playAnimation('idle')}>Idle</button>
        <button className="ghost-button" type="button" onClick={() => characterStore.playAnimation('walk')}>Walk</button>
        <button className="ghost-button" type="button" onClick={() => characterStore.playAnimation('jump')}>Jump</button>
        <button className="ghost-button" type="button" onClick={() => characterStore.playAnimation('attack')}>Attack</button>
        <button className="ghost-button" type="button" onClick={() => characterStore.playAnimation('hurt')}>Hurt</button>
        <button className="ghost-button" type="button" onClick={() => characterStore.playAnimation('death')}>Death</button>
      </div>
    </div>
  );
}