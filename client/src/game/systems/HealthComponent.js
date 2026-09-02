export class HealthComponent {
    currentHP;
    maxHP;
    isDead = false;
    events;
    constructor(maxHP, events = {}) {
        this.maxHP = maxHP;
        this.currentHP = maxHP;
        this.events = events;
    }
    takeDamage(amount) {
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
    heal(amount) {
        if (this.isDead) {
            return;
        }
        this.currentHP = Math.min(this.maxHP, this.currentHP + Math.max(0, amount));
        this.events.onHealthChanged?.(this.currentHP, this.maxHP);
    }
    setMaxHP(maxHP, restore = false) {
        this.maxHP = maxHP;
        if (restore) {
            this.currentHP = maxHP;
        }
        else {
            this.currentHP = Math.min(this.currentHP, maxHP);
        }
        this.events.onHealthChanged?.(this.currentHP, this.maxHP);
    }
    revive(fullRestore = true) {
        this.isDead = false;
        if (fullRestore) {
            this.currentHP = this.maxHP;
            this.events.onHealthChanged?.(this.currentHP, this.maxHP);
        }
    }
}
