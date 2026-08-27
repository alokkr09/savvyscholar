/**
 * Financial Calculation & Precision Arithmetic Utility
 * Protects against IEEE 754 floating-point inaccuracies (e.g. 0.1 + 0.2 = 0.30000000000000004)
 */

export class MoneyMath {
  /**
   * Converts a major currency unit (e.g. ₹10.50 or $10.50) into minor units (1050 paisa / cents)
   */
  static toMinorUnits(amount: number): number {
    if (typeof amount !== 'number' || isNaN(amount)) return 0;
    return Math.round((amount + Number.EPSILON) * 100);
  }

  /**
   * Converts minor units (paisa / cents) back to major currency unit with 2 decimals
   */
  static fromMinorUnits(minor: number): number {
    if (typeof minor !== 'number' || isNaN(minor)) return 0;
    return minor / 100;
  }

  /**
   * Safely rounds a currency value to 2 decimal places using standard Half-Up / Epsilon rounding
   */
  static round(amount: number, decimals: number = 2): number {
    if (typeof amount !== 'number' || isNaN(amount)) return 0;
    const factor = Math.pow(10, decimals);
    return Math.round((amount + Number.EPSILON) * factor) / factor;
  }

  /**
   * Performs exact addition of multiple currency numbers without floating-point drift
   */
  static add(...amounts: number[]): number {
    const totalMinor = amounts.reduce((acc, curr) => acc + MoneyMath.toMinorUnits(curr || 0), 0);
    return MoneyMath.fromMinorUnits(totalMinor);
  }

  /**
   * Performs exact subtraction (minuend - subtrahends)
   */
  static subtract(minuend: number, ...subtrahends: number[]): number {
    const minMinor = MoneyMath.toMinorUnits(minuend || 0);
    const subMinor = subtrahends.reduce((acc, curr) => acc + MoneyMath.toMinorUnits(curr || 0), 0);
    return MoneyMath.fromMinorUnits(minMinor - subMinor);
  }

  /**
   * Calculates safe percentage (part / total * 100) with 0-division protection
   */
  static percentage(part: number, total: number, decimals: number = 1): number {
    if (!total || total <= 0 || !part || part <= 0) return 0;
    const raw = (part / total) * 100;
    return MoneyMath.round(raw, decimals);
  }

  /**
   * Calculates emergency runway in months (currentSavings / monthlyExpense)
   */
  static runwayMonths(currentSavings: number, monthlyExpense: number): number {
    if (!monthlyExpense || monthlyExpense <= 0) return 0;
    if (!currentSavings || currentSavings <= 0) return 0;
    return MoneyMath.round(currentSavings / monthlyExpense, 1);
  }

  /**
   * Validates if an amount is a valid positive financial value (>= 0 and max 2 decimal places)
   */
  static isValidAmount(value: unknown): boolean {
    if (typeof value !== 'number' || isNaN(value) || !isFinite(value)) return false;
    if (value < 0) return false;
    // Check decimal places
    const str = value.toString();
    if (str.includes('.')) {
      const decimals = str.split('.')[1];
      if (decimals.length > 2) return false;
    }
    return true;
  }

  /**
   * Formats a monetary number into standard locale string (Default: INR ₹)
   */
  static format(amount: number, currency: string = 'INR', locale: string = 'en-IN'): string {
    const safeAmount = MoneyMath.round(amount || 0);
    try {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        maximumFractionDigits: 2,
        minimumFractionDigits: safeAmount % 1 === 0 ? 0 : 2,
      }).format(safeAmount);
    } catch {
      // Fallback
      return `₹${safeAmount.toLocaleString('en-IN')}`;
    }
  }
}
