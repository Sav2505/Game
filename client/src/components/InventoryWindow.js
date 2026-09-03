import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
import { DEMO_EQUIPMENT } from '@/game/character/catalog';
import { gameRuntime } from '@/game/bridge/GameRuntime';
import { characterStore, useCharacterStore } from '@/state/characterStore';
import { gameStore, useGameStore } from '@/state/gameStore';
import { INVENTORY_SLOT_COUNT } from '@/game/inventory/catalog';
import { GameWindow } from '@/components/windows/GameWindow';
function rarityClassName(rarity) {
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
function ItemDetailLine({ label, value }) {
    return (_jsxs("div", { className: "inventory-detail-line", children: [_jsx("span", { children: label }), _jsx("strong", { children: value })] }));
}
function ItemActionArea({ selectedItem, isEquipped, onEquip, onUnequip, onUse, onRemove }) {
    return (_jsxs("div", { className: "inventory-action-area", children: [_jsx("h4", { children: "Actions" }), _jsxs("div", { className: "inventory-actions-row", children: [selectedItem.actionType === 'equippable' ? (_jsx("button", { className: "inventory-action-button secondary-button", type: "button", onClick: isEquipped ? onUnequip : onEquip, children: isEquipped ? 'Unequip' : 'Equip' })) : null, selectedItem.actionType === 'usable' ? (_jsx("button", { className: "inventory-action-button primary-button", type: "button", onClick: onUse, children: "Use" })) : null, _jsx("button", { className: "inventory-action-button inventory-remove-button", type: "button", onClick: onRemove, children: "Remove" })] })] }));
}
const EQUIPPABLE_BY_ID = Object.values(DEMO_EQUIPMENT).reduce((collection, item) => {
    collection[item.id] = item;
    return collection;
}, {});
function resolveEquipmentImagePath(spriteKey) {
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
    const [selectedItemId, setSelectedItemId] = useState(null);
    const [tooltip, setTooltip] = useState(null);
    const [actionFeedback, setActionFeedback] = useState(null);
    const [removeCandidateId, setRemoveCandidateId] = useState(null);
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
    const equippedItemIds = useMemo(() => new Set(Object.values(character.equipment)
        .map((item) => item?.id)
        .filter((itemId) => Boolean(itemId))), [character.equipment]);
    const inventorySlots = useMemo(() => {
        const slots = Array.from({ length: INVENTORY_SLOT_COUNT }, (_, index) => inventoryItems[index] ?? null);
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
    const handleItemHover = (item, event) => {
        setTooltip({ item, x: event.clientX, y: event.clientY });
    };
    const handleItemMove = (item, event) => {
        setTooltip({ item, x: event.clientX, y: event.clientY });
    };
    const handleItemLeave = () => {
        setTooltip(null);
    };
    return (_jsxs(_Fragment, { children: [_jsx(GameWindow, { isOpen: isOpen, title: "Inventory", className: "inventory-window", bodyClassName: "inventory-window-body", size: { width: 930, height: 650 }, resizable: true, resizeLimits: { minWidth: 620, maxWidth: 1100, minHeight: 420, maxHeight: 780 }, initialPosition: { x: 120, y: 76 }, onClose: () => gameStore.setInventoryOpen(false), children: _jsxs("div", { className: "inventory-layout", children: [_jsxs("section", { className: "inventory-left-column", children: [_jsxs("div", { className: "inventory-character-card", children: [_jsxs("div", { className: "inventory-character-banner", children: [_jsxs("div", { children: [_jsx("div", { className: "inventory-character-name", children: player.name }), _jsxs("div", { className: "inventory-character-subtitle", children: ["Level ", player.level, " Adventurer"] })] }), _jsxs("div", { className: "inventory-character-gold", children: [player.gold, " G"] })] }), _jsxs("div", { className: "inventory-character-preview", "aria-label": "Character preview", children: [_jsxs("div", { className: "inventory-character-avatar", "aria-hidden": "true", children: [_jsx("img", { className: "avatar-layer avatar-base", src: "/assets/characters/player/body/stand.png", alt: "" }), _jsx("img", { className: "avatar-layer avatar-face-eyes", src: "/assets/characters/player/face/eyes/eyes_1.png", alt: "" }), pantsEquipmentPath ? _jsx("img", { className: "avatar-layer avatar-pants", src: pantsEquipmentPath, alt: "" }) : null, shoesEquipmentPath ? _jsx("img", { className: "avatar-layer avatar-shoes", src: shoesEquipmentPath, alt: "" }) : null, topEquipmentPath ? _jsx("img", { className: "avatar-layer avatar-top", src: topEquipmentPath, alt: "" }) : null, glovesEquipmentPath ? _jsx("img", { className: "avatar-layer avatar-gloves", src: glovesEquipmentPath, alt: "" }) : null, helmetEquipmentPath ? _jsx("img", { className: "avatar-layer avatar-helmet", src: helmetEquipmentPath, alt: "" }) : null] }), _jsxs("div", { className: "inventory-equipped-list", children: [_jsxs("div", { children: [_jsx("strong", { children: "Helmet:" }), " ", character.equipment.helmet?.name ?? 'None'] }), _jsxs("div", { children: [_jsx("strong", { children: "Top:" }), " ", character.equipment.top?.name ?? 'None'] }), _jsxs("div", { children: [_jsx("strong", { children: "Pants:" }), " ", character.equipment.pants?.name ?? 'None'] }), _jsxs("div", { children: [_jsx("strong", { children: "Weapon:" }), " ", character.equipment.weapon?.name ?? 'None'] }), _jsxs("div", { children: [_jsx("strong", { children: "Shoes:" }), " ", character.equipment.shoes?.name ?? 'None'] }), _jsxs("div", { children: [_jsx("strong", { children: "Gloves:" }), " ", character.equipment.gloves?.name ?? 'None'] }), _jsxs("div", { children: [_jsx("strong", { children: "Cape:" }), " ", character.equipment.cape?.name ?? 'None'] }), _jsxs("div", { children: [_jsx("strong", { children: "Accessory:" }), " ", character.equipment.accessory?.name ?? 'None'] })] })] })] }), _jsxs("div", { className: "inventory-slots-panel", children: [_jsx("div", { className: "inventory-panel-title", children: "Bag" }), _jsx("div", { className: "inventory-grid", children: inventorySlots.map((item, index) => {
                                                const isSelected = item?.id === selectedItemId;
                                                const isEquipped = item ? equippedItemIds.has(item.id) : false;
                                                return (_jsxs("button", { type: "button", className: `inventory-slot ${isSelected ? 'is-selected' : ''} ${item ? rarityClassName(item.rarity) : ''}`.trim(), "aria-label": item ? `${item.name} slot` : 'Empty slot', onMouseEnter: item ? (event) => handleItemHover(item, event) : undefined, onMouseMove: item ? (event) => handleItemMove(item, event) : undefined, onMouseLeave: item ? handleItemLeave : undefined, onClick: () => {
                                                        if (!item) {
                                                            setSelectedItemId(null);
                                                            return;
                                                        }
                                                        setSelectedItemId((previous) => (previous === item.id ? null : item.id));
                                                    }, children: [item ? _jsx("img", { className: "inventory-item-image", src: item.imagePath, alt: item.name, draggable: false }) : _jsx("span", { className: "inventory-slot-empty" }), item && item.quantity > 1 ? _jsx("span", { className: "inventory-slot-quantity", children: item.quantity }) : null, isEquipped ? _jsx("span", { className: "inventory-slot-equipped", children: "E" }) : null] }, `${item?.id ?? 'empty'}-${index}`));
                                            }) })] })] }), _jsxs("section", { className: "inventory-right-column", "aria-live": "polite", children: [_jsx("div", { className: "inventory-panel-title", children: "Item Information" }), activeItem ? (_jsxs("div", { className: "inventory-item-details", children: [_jsxs("div", { className: "inventory-item-header", children: [_jsx("span", { className: "inventory-item-large-icon", "aria-hidden": "true", children: _jsx("img", { className: "inventory-item-large-image", src: activeItem.imagePath, alt: "", draggable: false }) }), _jsxs("div", { children: [_jsx("h3", { className: "inventory-item-name", children: activeItem.name.toUpperCase() }), _jsxs("div", { className: "inventory-item-meta", children: [_jsx("span", { children: activeItem.category }), _jsx("span", { className: `inventory-rarity-chip ${rarityClassName(activeItem.rarity)}`, children: activeItem.rarity })] })] })] }), _jsx("div", { className: "inventory-equipped-state", children: equippedItemIds.has(activeItem.id) ? 'Currently equipped' : 'Stored in bag' }), _jsxs("div", { className: "inventory-equipped-state", children: ["Quantity: ", activeItem.quantity] }), _jsx("div", { className: "inventory-detail-group", children: activeItem.stats.map((line) => (_jsx(ItemDetailLine, { label: line.label, value: line.value }, `stats-${line.label}`))) }), _jsxs("div", { className: "inventory-subsection", children: [_jsx("h4", { children: "Bonuses" }), activeItem.bonuses.map((line) => (_jsx(ItemDetailLine, { label: line.label, value: line.value }, `bonus-${line.label}`)))] }), _jsxs("div", { className: "inventory-subsection", children: [_jsx("h4", { children: "Powers" }), _jsx("div", { className: "inventory-badge-list", children: activeItem.powers.map((power) => (_jsx("span", { className: "inventory-badge", children: power }, power))) })] }), _jsxs("div", { className: "inventory-subsection", children: [_jsx("h4", { children: "Attributes" }), _jsx("div", { className: "inventory-badge-list", children: activeItem.attributes.map((attribute) => (_jsx("span", { className: "inventory-badge", children: attribute }, attribute))) })] }), _jsxs("div", { className: "inventory-subsection", children: [_jsx("h4", { children: "Effects" }), _jsx("div", { className: "inventory-description", children: activeItem.effects.join(' ') })] }), _jsxs("div", { className: "inventory-subsection", children: [_jsx("h4", { children: "Description" }), _jsx("p", { className: "inventory-description", children: activeItem.description })] }), selectedItem && selectedItem.id === activeItem.id && selectedItem.actionType !== 'none' ? (_jsx(ItemActionArea, { selectedItem: selectedItem, isEquipped: equippedItemIds.has(selectedItem.id), onEquip: handleEquipItem, onUnequip: handleUnequipItem, onUse: handleUseItem, onRemove: handleRemoveRequest })) : null, actionFeedback && selectedItem && selectedItem.id === activeItem.id ? (_jsx("div", { className: "inventory-action-feedback", children: actionFeedback })) : null] })) : (_jsx("div", { className: "inventory-empty-state", children: "Select an item to view its details." }))] })] }) }), isOpen && tooltip ? (_jsxs("div", { className: "inventory-tooltip", style: { left: Math.min(tooltip.x + 18, window.innerWidth - 260), top: Math.max(16, tooltip.y - 8) }, role: "tooltip", children: [_jsx("strong", { children: tooltip.item.name }), _jsx("span", { children: tooltip.item.category }), _jsx("img", { className: "inventory-tooltip-image", src: tooltip.item.imagePath, alt: "", draggable: false }), _jsx("p", { children: tooltip.item.description })] })) : null, isOpen && removeCandidate ? (_jsx("div", { className: "inventory-confirm-backdrop", role: "presentation", children: _jsxs("div", { className: "inventory-confirm-modal", role: "dialog", "aria-modal": "true", "aria-labelledby": "inventory-remove-title", children: [_jsx("div", { className: "inventory-confirm-header", children: _jsx("h3", { id: "inventory-remove-title", children: "\u05D0\u05D9\u05E9\u05D5\u05E8 \u05D4\u05E9\u05DC\u05DB\u05EA \u05E4\u05E8\u05D9\u05D8" }) }), _jsx("div", { className: "inventory-confirm-body", children: _jsxs("div", { className: "inventory-confirm-item-row", children: [_jsx("img", { className: "inventory-confirm-item-image", src: removeCandidate.imagePath, alt: "", draggable: false }), _jsxs("div", { children: [_jsx("strong", { children: removeCandidate.name }), _jsx("p", { children: "\u05D4\u05D0\u05DD \u05D0\u05EA\u05D4 \u05D1\u05D8\u05D5\u05D7 \u05E9\u05D1\u05E8\u05E6\u05D5\u05E0\u05DA \u05DC\u05D4\u05E1\u05D9\u05E8 \u05D0\u05EA \u05D4\u05E4\u05E8\u05D9\u05D8 \u05DE\u05D4\u05EA\u05D9\u05E7 \u05D5\u05DC\u05D4\u05E9\u05DC\u05D9\u05DA \u05D0\u05D5\u05EA\u05D5 \u05DC\u05D9\u05D3 \u05D4\u05D3\u05DE\u05D5\u05EA?" })] })] }) }), _jsxs("div", { className: "inventory-confirm-actions", children: [_jsx("button", { className: "inventory-action-button secondary-button", type: "button", onClick: handleCancelRemove, children: "\u05D1\u05D9\u05D8\u05D5\u05DC" }), _jsx("button", { className: "inventory-action-button inventory-remove-button", type: "button", onClick: handleConfirmRemove, children: "\u05DB\u05DF, \u05DC\u05D4\u05E9\u05DC\u05D9\u05DA" })] })] }) })) : null] }));
}
