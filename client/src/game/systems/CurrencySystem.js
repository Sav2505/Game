export class CurrencySystem {
    onChange;
    constructor(onChange) {
        this.onChange = onChange;
    }
    addGold(currentGold, amount) {
        const nextGold = currentGold + amount;
        this.onChange(nextGold);
        return nextGold;
    }
}
