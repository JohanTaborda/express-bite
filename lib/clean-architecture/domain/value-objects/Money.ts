export type Currency = 'COP' | 'USD';

/**
 * Value Object representing monetary values with currency.
 * Follows DDD and SOLID principles (immutability, encapsulated validation).
 */
export class Money {
  private readonly _amount: number;
  private readonly _currency: Currency;

  constructor(amount: number, currency: Currency = 'COP') {
    if (isNaN(amount) || amount < 0) {
      throw new Error(`Invalid monetary amount: ${amount}`);
    }
    // Round to avoid floating point issues
    this._amount = Math.round(amount);
    this._currency = currency;
  }

  get amount(): number {
    return this._amount;
  }

  get currency(): Currency {
    return this._currency;
  }

  public add(other: Money): Money {
    this.ensureSameCurrency(other);
    return new Money(this._amount + other._amount, this._currency);
  }

  public subtract(other: Money): Money {
    this.ensureSameCurrency(other);
    const result = this._amount - other._amount;
    return new Money(Math.max(0, result), this._currency);
  }

  public multiply(factor: number): Money {
    if (factor < 0) {
      throw new Error(`Multiplication factor cannot be negative: ${factor}`);
    }
    return new Money(this._amount * factor, this._currency);
  }

  public percentage(percent: number): Money {
    return this.multiply(percent / 100);
  }

  public format(): string {
    if (this._currency === 'COP') {
      return `$${this._amount.toLocaleString('es-CO')}`;
    }
    return `$${this._amount.toFixed(2)} ${this._currency}`;
  }

  public equals(other: Money): boolean {
    return this._amount === other._amount && this._currency === other._currency;
  }

  private ensureSameCurrency(other: Money): void {
    if (this._currency !== other._currency) {
      throw new Error(`Currency mismatch: ${this._currency} and ${other._currency}`);
    }
  }

  public static zero(currency: Currency = 'COP'): Money {
    return new Money(0, currency);
  }

  public static fromNumber(amount: number, currency: Currency = 'COP'): Money {
    return new Money(amount, currency);
  }
}
