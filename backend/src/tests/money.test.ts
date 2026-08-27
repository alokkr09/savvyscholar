import { describe, it, expect } from 'vitest';
import { MoneyMath } from '../utils/money';

describe('Financial Math Precision Engine (MoneyMath)', () => {
  it('should prevent IEEE-754 floating-point drift on addition (0.1 + 0.2 = 0.3)', () => {
    // Normal JS: 0.1 + 0.2 is 0.30000000000000004
    const jsRaw = 0.1 + 0.2;
    expect(jsRaw).not.toBe(0.3);

    const safeSum = MoneyMath.add(0.1, 0.2);
    expect(safeSum).toBe(0.3);
  });

  it('should safely add multiple currency transactions with zero cents drift', () => {
    const sum = MoneyMath.add(19.99, 5.5, 0.01, 100.25, 4.25);
    expect(sum).toBe(130.0);
  });

  it('should accurately subtract subtrahends from minuend', () => {
    const remaining = MoneyMath.subtract(100.0, 33.33, 16.67);
    expect(remaining).toBe(50.0);
  });

  it('should calculate safe percentage with 0-division protection', () => {
    expect(MoneyMath.percentage(25, 100)).toBe(25);
    expect(MoneyMath.percentage(1, 3)).toBe(33.3);
    expect(MoneyMath.percentage(0, 100)).toBe(0);
    expect(MoneyMath.percentage(50, 0)).toBe(0);
    expect(MoneyMath.percentage(-10, 100)).toBe(0);
  });

  it('should compute emergency survival runway in months', () => {
    expect(MoneyMath.runwayMonths(60000, 10000)).toBe(6);
    expect(MoneyMath.runwayMonths(35000, 10000)).toBe(3.5);
    expect(MoneyMath.runwayMonths(0, 10000)).toBe(0);
    expect(MoneyMath.runwayMonths(50000, 0)).toBe(0);
  });

  it('should format INR currency values properly', () => {
    const formatted = MoneyMath.format(15000, 'INR', 'en-IN');
    expect(formatted).toContain('15,000');
  });

  it('should validate monetary input amounts', () => {
    expect(MoneyMath.isValidAmount(100)).toBe(true);
    expect(MoneyMath.isValidAmount(100.5)).toBe(true);
    expect(MoneyMath.isValidAmount(100.55)).toBe(true);
    expect(MoneyMath.isValidAmount(100.555)).toBe(false); // exceeds 2 decimal places
    expect(MoneyMath.isValidAmount(-50)).toBe(false);
    expect(MoneyMath.isValidAmount('invalid')).toBe(false);
    expect(MoneyMath.isValidAmount(NaN)).toBe(false);
  });
});
