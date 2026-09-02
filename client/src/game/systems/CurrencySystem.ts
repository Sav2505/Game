export class CurrencySystem {
  public constructor(private readonly onChange: (gold: number) => void) {}

  public addGold(currentGold: number, amount: number): number {
    const nextGold = currentGold + amount;
    this.onChange(nextGold);
    return nextGold;
  }
}