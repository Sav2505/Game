export type OverlayKind = 'info' | 'success' | 'warning' | 'danger';

export interface NotificationState {
  message: string;
  kind: OverlayKind;
}

export interface UiState {
  dialogueOpen: boolean;
  questOpen: boolean;
  deathOpen: boolean;
  inventoryOpen: boolean;
  prompt: string | null;
  notification: NotificationState | null;
  levelUpMessage: string | null;
}

export interface GameState {
  player: import('@shared/types').PlayerState;
  quest: import('@shared/types').QuestState;
  ui: UiState;
}