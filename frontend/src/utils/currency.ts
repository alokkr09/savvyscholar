/**
 * Currency and Financial Precision Formatter for Frontend
 */

export const formatCurrency = (
  amount: number | undefined | null,
  currency = 'INR',
  locale = 'en-IN'
): string => {
  const safeAmount = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
      minimumFractionDigits: safeAmount % 1 === 0 ? 0 : 2,
    }).format(safeAmount);
  } catch {
    return `₹${safeAmount.toLocaleString('en-IN')}`;
  }
};

export const formatINR = (amount: number | undefined | null): string => {
  return formatCurrency(amount, 'INR', 'en-IN');
};

export const formatCompactINR = (amount: number | undefined | null): string => {
  const safeAmount = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(safeAmount);
  } catch {
    return `₹${safeAmount}`;
  }
};

export const parseCurrencyInput = (value: string): number => {
  const sanitized = value.replace(/[^0-9.]/g, '');
  const parsed = parseFloat(sanitized);
  return isNaN(parsed) ? 0 : Math.round((parsed + Number.EPSILON) * 100) / 100;
};
