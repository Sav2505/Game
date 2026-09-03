import type { WorldPickupState } from '../../../shared/types';

export function createInitialWorldPickups(): WorldPickupState[] {
  return [
    {
      pickupId: 'forest-guide-shirt-2',
      itemId: 'shirt-2',
      x: 1040,
      y: 684,
      source: 'static',
      collected: false,
      spawnedAt: 0
    }
  ];
}