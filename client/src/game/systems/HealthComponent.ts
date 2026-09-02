export interface HealthEvents {
  onHealthChanged?: (currentHP: number, maxHP: number) => void;
  onDeath?: () => void;
}

export interface Damageable {
  takeDamage(amount: number): boolean;
  heal(amount: number): void;
  readonly isDead: boolean;
}

export class HealthComponent implements Damageable {
  public currentHP: number;

  public maxHP: number;

  public isDead = false;

  private readonly events: HealthEvents;

  public constructor(maxHP: number, events: HealthEvents = {}) {
    this.maxHP = maxHP;
    this.currentHP = maxHP;
    this.events = events;
  }

  public takeDamage(amount: number): boolean {
    if (this.isDead) {
      return false;
    }

    this.currentHP = Math.max(0, this.currentHP - Math.max(0, amount));
    this.events.onHealthChanged?.(this.currentHP, this.maxHP);

    if (this.currentHP === 0) {
      this.isDead = true;
      this.events.onDeath?.();
      return true;
    }

    return false;
  }

  public heal(amount: number): void {
    if (this.isDead) {
      return;
    }

    this.currentHP = Math.min(this.maxHP, this.currentHP + Math.max(0, amount));
    this.events.onHealthChanged?.(this.currentHP, this.maxHP);
  }

  public setMaxHP(maxHP: number, restore = false): void {
    this.maxHP = maxHP;
    if (restore) {
      this.currentHP = maxHP;
    } else {
      this.currentHP = Math.min(this.currentHP, maxHP);
    }
    this.events.onHealthChanged?.(this.currentHP, this.maxHP);
  }

  public revive(fullRestore = true): void {
    this.isDead = false;
    if (fullRestore) {
      this.currentHP = this.maxHP;
      this.events.onHealthChanged?.(this.currentHP, this.maxHP);
    }
  }
}