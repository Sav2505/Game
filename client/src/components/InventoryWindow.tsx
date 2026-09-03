import { useEffect, useMemo, useState } from 'react';
import type { MouseEvent as ReactMouseEvent } from 'react';
import { DEMO_EQUIPMENT } from '@/game/character/catalog';
import type { EquipmentItem } from '@/game/character/types';
import { gameRuntime } from '@/game/bridge/GameRuntime';
import { characterStore, useCharacterStore } from '@/state/characterStore';
import { gameStore, useGameStore } from '@/state/gameStore';
import { INVENTORY_SLOT_COUNT, type InventoryItem, type InventoryRarity } from '@/game/inventory/catalog';
import { GameWindow } from '@/components/windows/GameWindow';

interface ItemTooltipState {
  item: InventoryItem;
  x: number;
  y: number;
}

function rarityClassName(rarity: InventoryRarity): string {
  switch (rarity) {
    case 'uncommon':
      return 'is-uncommon';
    case 'rare':
      return 'is-rare';
    case 'epic':
      return 'is-epic';
    default:
      return 'is-common';
  }
}

function ItemDetailLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="inventory-detail-line">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

interface ItemActionAreaProps {
  selectedItem: InventoryItem;
  isEquipped: boolean;
  onEquip: () => void;
  onUnequip: () => void;
  onUse: () => void;
  onRemove: () => void;
}

function ItemActionArea({ selectedItem, isEquipped, onEquip, onUnequip, onUse, onRemove }: ItemActionAreaProps) {
  return (
    <div className="inventory-action-area">
      <h4>Actions</h4>
      <div className="inventory-actions-row">
        {selectedItem.actionType === 'equippable' ? (
          <button className="inventory-action-button secondary-button" type="button" onClick={isEquipped ? onUnequip : onEquip}>
            {isEquipped ? 'Unequip' : 'Equip'}
          </button>
        ) : null}
        {selectedItem.actionType === 'usable' ? (
          <button className="inventory-action-button primary-button" type="button" onClick={onUse}>
            Use
          </button>
        ) : null}
        <button className="inventory-action-button inventory-remove-button" type="button" onClick={onRemove}>
          Remove
        </button>
      </div>
    </div>
  );
}

const EQUIPPABLE_BY_ID: Record<string, EquipmentItem> = Object.values(DEMO_EQUIPMENT).reduce<Record<string, EquipmentItem>>(
  (collection, item) => {
    collection[item.id] = item;
    return collection;
  },
  {}
);

function resolveEquipmentImagePath(spriteKey: string): string | null {
  switch (spriteKey) {
    case 'character-helmet-hat-1':
      return '/assets/characters/player/helmets/hat_1.png';
    case 'character-top-shirt-1':
      return '/assets/characters/player/tops/shirt_1.png';
    case 'character-top-shirt-2':
      return '/assets/characters/player/tops/shirt_2.png';
    case 'character-pants-1':
      return '/assets/characters/player/pants/pants_1.png';
    case 'character-shoes-1':
      return '/assets/characters/player/shoes/shoes_1.png';
    case 'character-gloves-1':
      return '/assets/characters/player/gloves/gloves_1.png';
    default:
      return null;
  }
}

export function InventoryWindow() {
  const isOpen = useGameStore((state) => state.ui.inventoryOpen);
  const player = useGameStore((state) => state.player);
  const character = useCharacterStore((state) => state.character);
  const inventoryItems = useGameStore((state) => state.player.inventory);

  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<ItemTooltipState | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [removeCandidateId, setRemoveCandidateId] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedItemId) {
      return;
    }

    if (!inventoryItems.some((item) => item.id === selectedItemId)) {
      setSelectedItemId(null);
    }
  }, [inventoryItems, selectedItemId]);

  useEffect(() => {
    if (!actionFeedback) {
      return undefined;
    }

    const timeout = window.setTimeout(() => {
      setActionFeedback(null);
    }, 1500);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [actionFeedback]);

  const equippedItemIds = useMemo(
    () =>
      new Set(
        Object.values(character.equipment)
          .map((item) => item?.id)
          .filter((itemId): itemId is string => Boolean(itemId))
      ),
    [character.equipment]
  );

  const inventorySlots = useMemo(() => {
    const slots: Array<InventoryItem | null> = Array.from({ length: INVENTORY_SLOT_COUNT }, (_, index) => inventoryItems[index] ?? null);
    return slots;
  }, [inventoryItems]);

  const selectedItem = useMemo(() => inventoryItems.find((item) => item.id === selectedItemId) ?? null, [inventoryItems, selectedItemId]);
  const activeItem = selectedItem;
  const removeCandidate = useMemo(() => inventoryItems.find((item) => item.id === removeCandidateId) ?? null, [inventoryItems, removeCandidateId]);

  const topEquipmentPath = character.equipment.top ? resolveEquipmentImagePath(character.equipment.top.spriteKey) : null;
  const pantsEquipmentPath = character.equipment.pants ? resolveEquipmentImagePath(character.equipment.pants.spriteKey) : null;
  const shoesEquipmentPath = character.equipment.shoes ? resolveEquipmentImagePath(character.equipment.shoes.spriteKey) : null;
  const glovesEquipmentPath = character.equipment.gloves ? resolveEquipmentImagePath(character.equipment.gloves.spriteKey) : null;
  const helmetEquipmentPath = character.equipment.helmet ? resolveEquipmentImagePath(character.equipment.helmet.spriteKey) : null;

  const handleEquipItem = () => {
    if (!selectedItem || selectedItem.actionType !== 'equippable' || !selectedItem.equipSlot) {
      return;
    }

    const equipment = EQUIPPABLE_BY_ID[selectedItem.id];
    if (!equipment) {
      setActionFeedback('This item cannot be equipped in the current build.');
      gameStore.setNotification({ message: `${selectedItem.name} is not yet equip-ready.`, kind: 'warning' });
      return;
    }

    characterStore.setEquipment(selectedItem.equipSlot, equipment);
    setActionFeedback(`${selectedItem.name} equipped.`);
    gameStore.setNotification({ message: `${selectedItem.name} equipped`, kind: 'success' });
  };

  const handleUnequipItem = () => {
    if (!selectedItem || selectedItem.actionType !== 'equippable' || !selectedItem.equipSlot) {
      return;
    }

    characterStore.setEquipment(selectedItem.equipSlot, null);
    setActionFeedback(`${selectedItem.name} unequipped.`);
    gameStore.setNotification({ message: `${selectedItem.name} unequipped`, kind: 'info' });
  };

  const handleUseItem = () => {
    if (!selectedItem || selectedItem.actionType !== 'usable' || !selectedItem.useEffect) {
      return;
    }

    const effect = selectedItem.useEffect;

    if (effect.kind === 'healHp') {
      gameStore.updatePlayer((current) => ({
        ...current,
        hp: Math.min(current.maxHp, current.hp + effect.amount)
      }));
    }

    if (effect.kind === 'gainGold') {
      gameStore.updatePlayer((current) => ({
        ...current,
        gold: current.gold + effect.amount
      }));
    }

    const itemRemoved = selectedItem.quantity <= 1;
    const consumed = gameStore.consumeInventoryItem(selectedItem.id);
    if (!consumed) {
      return;
    }

    if (itemRemoved) {
      setSelectedItemId(null);
    }

    setActionFeedback(`${selectedItem.name} used.`);
    gameStore.setNotification({ message: `${selectedItem.name} used`, kind: 'success' });
  };

  const handleRemoveRequest = () => {
    if (!selectedItem) {
      return;
    }

    setRemoveCandidateId(selectedItem.id);
  };

  const handleConfirmRemove = () => {
    if (!removeCandidate) {
      setRemoveCandidateId(null);
      return;
    }

    const wasEquipped = removeCandidate.actionType === 'equippable' && equippedItemIds.has(removeCandidate.id);
    if (wasEquipped && removeCandidate.equipSlot) {
      characterStore.setEquipment(removeCandidate.equipSlot, null);
    }

    const removedLastItem = removeCandidate.quantity <= 1;
    const removed = gameStore.consumeInventoryItem(removeCandidate.id);
    if (!removed) {
      setRemoveCandidateId(null);
      return;
    }

    gameRuntime.dropInventoryItem(removeCandidate.id);

    if (removedLastItem && selectedItemId === removeCandidate.id) {
      setSelectedItemId(null);
    }

    setActionFeedback(`${removeCandidate.name} הוסר מהתיק והושלך לקרקע.`);
    gameStore.setNotification({ message: `${removeCandidate.name} הושלך לידך.`, kind: 'info' });
    setRemoveCandidateId(null);
  };

  const handleCancelRemove = () => {
    setRemoveCandidateId(null);
  };

  const handleItemHover = (item: InventoryItem, event: ReactMouseEvent<HTMLButtonElement>) => {
    setTooltip({ item, x: event.clientX, y: event.clientY });
  };

  const handleItemMove = (item: InventoryItem, event: ReactMouseEvent<HTMLButtonElement>) => {
    setTooltip({ item, x: event.clientX, y: event.clientY });
  };

  const handleItemLeave = () => {
    setTooltip(null);
  };

  return (
    <>
      <GameWindow
        isOpen={isOpen}
        title="Inventory"
        className="inventory-window"
        bodyClassName="inventory-window-body"
        size={{ width: 930, height: 650 }}
        resizable
        resizeLimits={{ minWidth: 620, maxWidth: 1100, minHeight: 420, maxHeight: 780 }}
        initialPosition={{ x: 120, y: 76 }}
        onClose={() => gameStore.setInventoryOpen(false)}
      >
        <div className="inventory-layout">
          <section className="inventory-left-column">
            <div className="inventory-character-card">
              <div className="inventory-character-banner">
                <div>
                  <div className="inventory-character-name">{player.name}</div>
                  <div className="inventory-character-subtitle">Level {player.level} Adventurer</div>
                </div>
                <div className="inventory-character-gold">{player.gold} G</div>
              </div>

              <div className="inventory-character-preview" aria-label="Character preview">
                <div className="inventory-character-avatar" aria-hidden="true">
                  <img className="avatar-layer avatar-base" src="/assets/characters/player/body/stand.png" alt="" />
                  <img className="avatar-layer avatar-face-eyes" src="/assets/characters/player/face/eyes/eyes_1.png" alt="" />
                  {pantsEquipmentPath ? <img className="avatar-layer avatar-pants" src={pantsEquipmentPath} alt="" /> : null}
                  {shoesEquipmentPath ? <img className="avatar-layer avatar-shoes" src={shoesEquipmentPath} alt="" /> : null}
                  {topEquipmentPath ? <img className="avatar-layer avatar-top" src={topEquipmentPath} alt="" /> : null}
                  {glovesEquipmentPath ? <img className="avatar-layer avatar-gloves" src={glovesEquipmentPath} alt="" /> : null}
                  {helmetEquipmentPath ? <img className="avatar-layer avatar-helmet" src={helmetEquipmentPath} alt="" /> : null}
                </div>
                <div className="inventory-equipped-list">
                  <div><strong>Helmet:</strong> {character.equipment.helmet?.name ?? 'None'}</div>
                  <div><strong>Top:</strong> {character.equipment.top?.name ?? 'None'}</div>
                  <div><strong>Pants:</strong> {character.equipment.pants?.name ?? 'None'}</div>
                  <div><strong>Weapon:</strong> {character.equipment.weapon?.name ?? 'None'}</div>
                  <div><strong>Shoes:</strong> {character.equipment.shoes?.name ?? 'None'}</div>
                  <div><strong>Gloves:</strong> {character.equipment.gloves?.name ?? 'None'}</div>
                  <div><strong>Cape:</strong> {character.equipment.cape?.name ?? 'None'}</div>
                  <div><strong>Accessory:</strong> {character.equipment.accessory?.name ?? 'None'}</div>
                </div>
              </div>
            </div>

            <div className="inventory-slots-panel">
              <div className="inventory-panel-title">Bag</div>
              <div className="inventory-grid">
                {inventorySlots.map((item, index) => {
                  const isSelected = item?.id === selectedItemId;
                  const isEquipped = item ? equippedItemIds.has(item.id) : false;

                  return (
                    <button
                      key={`${item?.id ?? 'empty'}-${index}`}
                      type="button"
                      className={`inventory-slot ${isSelected ? 'is-selected' : ''} ${item ? rarityClassName(item.rarity) : ''}`.trim()}
                      aria-label={item ? `${item.name} slot` : 'Empty slot'}
                      onMouseEnter={item ? (event) => handleItemHover(item, event) : undefined}
                      onMouseMove={item ? (event) => handleItemMove(item, event) : undefined}
                      onMouseLeave={item ? handleItemLeave : undefined}
                      onClick={() => {
                        if (!item) {
                          setSelectedItemId(null);
                          return;
                        }

                        setSelectedItemId((previous) => (previous === item.id ? null : item.id));
                      }}
                    >
                      {item ? <img className="inventory-item-image" src={item.imagePath} alt={item.name} draggable={false} /> : <span className="inventory-slot-empty" />}
                      {item && item.quantity > 1 ? <span className="inventory-slot-quantity">{item.quantity}</span> : null}
                      {isEquipped ? <span className="inventory-slot-equipped">E</span> : null}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="inventory-right-column" aria-live="polite">
            <div className="inventory-panel-title">Item Information</div>
            {activeItem ? (
              <div className="inventory-item-details">
                <div className="inventory-item-header">
                  <span className="inventory-item-large-icon" aria-hidden="true">
                    <img className="inventory-item-large-image" src={activeItem.imagePath} alt="" draggable={false} />
                  </span>
                  <div>
                    <h3 className="inventory-item-name">{activeItem.name.toUpperCase()}</h3>
                    <div className="inventory-item-meta">
                      <span>{activeItem.category}</span>
                      <span className={`inventory-rarity-chip ${rarityClassName(activeItem.rarity)}`}>{activeItem.rarity}</span>
                    </div>
                  </div>
                </div>

                <div className="inventory-equipped-state">
                  {equippedItemIds.has(activeItem.id) ? 'Currently equipped' : 'Stored in bag'}
                </div>

                <div className="inventory-equipped-state">Quantity: {activeItem.quantity}</div>

                <div className="inventory-detail-group">
                  {activeItem.stats.map((line) => (
                    <ItemDetailLine key={`stats-${line.label}`} label={line.label} value={line.value} />
                  ))}
                </div>

                <div className="inventory-subsection">
                  <h4>Bonuses</h4>
                  {activeItem.bonuses.map((line) => (
                    <ItemDetailLine key={`bonus-${line.label}`} label={line.label} value={line.value} />
                  ))}
                </div>

                <div className="inventory-subsection">
                  <h4>Powers</h4>
                  <div className="inventory-badge-list">
                    {activeItem.powers.map((power) => (
                      <span key={power} className="inventory-badge">{power}</span>
                    ))}
                  </div>
                </div>

                <div className="inventory-subsection">
                  <h4>Attributes</h4>
                  <div className="inventory-badge-list">
                    {activeItem.attributes.map((attribute) => (
                      <span key={attribute} className="inventory-badge">{attribute}</span>
                    ))}
                  </div>
                </div>

                <div className="inventory-subsection">
                  <h4>Effects</h4>
                  <div className="inventory-description">{activeItem.effects.join(' ')}</div>
                </div>

                <div className="inventory-subsection">
                  <h4>Description</h4>
                  <p className="inventory-description">{activeItem.description}</p>
                </div>

                {selectedItem && selectedItem.id === activeItem.id && selectedItem.actionType !== 'none' ? (
                  <ItemActionArea
                    selectedItem={selectedItem}
                    isEquipped={equippedItemIds.has(selectedItem.id)}
                    onEquip={handleEquipItem}
                    onUnequip={handleUnequipItem}
                    onUse={handleUseItem}
                    onRemove={handleRemoveRequest}
                  />
                ) : null}

                {actionFeedback && selectedItem && selectedItem.id === activeItem.id ? (
                  <div className="inventory-action-feedback">{actionFeedback}</div>
                ) : null}
              </div>
            ) : (
              <div className="inventory-empty-state">Select an item to view its details.</div>
            )}
          </section>
        </div>
      </GameWindow>

      {isOpen && tooltip ? (
        <div
          className="inventory-tooltip"
          style={{ left: Math.min(tooltip.x + 18, window.innerWidth - 260), top: Math.max(16, tooltip.y - 8) }}
          role="tooltip"
        >
          <strong>{tooltip.item.name}</strong>
          <span>{tooltip.item.category}</span>
          <img className="inventory-tooltip-image" src={tooltip.item.imagePath} alt="" draggable={false} />
          <p>{tooltip.item.description}</p>
        </div>
      ) : null}

      {isOpen && removeCandidate ? (
        <div className="inventory-confirm-backdrop" role="presentation">
          <div className="inventory-confirm-modal" role="dialog" aria-modal="true" aria-labelledby="inventory-remove-title">
            <div className="inventory-confirm-header">
              <h3 id="inventory-remove-title">אישור השלכת פריט</h3>
            </div>
            <div className="inventory-confirm-body">
              <div className="inventory-confirm-item-row">
                <img className="inventory-confirm-item-image" src={removeCandidate.imagePath} alt="" draggable={false} />
                <div>
                  <strong>{removeCandidate.name}</strong>
                  <p>האם אתה בטוח שברצונך להסיר את הפריט מהתיק ולהשליך אותו ליד הדמות?</p>
                </div>
              </div>
            </div>
            <div className="inventory-confirm-actions">
              <button className="inventory-action-button secondary-button" type="button" onClick={handleCancelRemove}>
                ביטול
              </button>
              <button className="inventory-action-button inventory-remove-button" type="button" onClick={handleConfirmRemove}>
                כן, להשליך
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
