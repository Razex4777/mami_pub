/**
 * Currency formatting utilities for Algerian Dinar (DA/DZD)
 */

/**
 * Format a number as Algerian Dinar currency
 * @param amount - The amount to format
 * @param showSymbol - Whether to show the DA symbol (default: true)
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number, showSymbol = true): string => {
  const formatted = new Intl.NumberFormat('fr-DZ', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
  
  return showSymbol ? `${formatted} DA` : formatted;
};

/**
 * Format a number as compact currency (e.g., 1.5K DA, 2M DA)
 * @param amount - The amount to format
 * @returns Formatted compact currency string
 */
export const formatCompactCurrency = (amount: number): string => {
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M DA`;
  }
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(1)}K DA`;
  }
  return formatCurrency(amount);
};

/**
 * Parse a currency string back to number
 * @param value - The currency string to parse
 * @returns The numeric value
 */
export const parseCurrency = (value: string): number => {
  return parseFloat(value.replace(/[^\d.-]/g, '')) || 0;
};

/**
 * Currency symbol
 */
export const CURRENCY_SYMBOL = 'DA';
export const CURRENCY_CODE = 'DZD';
