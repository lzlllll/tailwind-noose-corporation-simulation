import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function safeToFixed(value: number | undefined | null, decimals: number = 2): string {
  if (value === undefined || value === null || isNaN(value)) {
    return '0';
  }
  return value.toFixed(decimals);
}

export function formatCurrency(value: number | undefined | null): string {
  if (value === undefined || value === null || isNaN(value)) {
    return '--';
  }
  const absValue = Math.abs(value);
  if (absValue >= 100000000) {
    return (value / 100000000).toFixed(2) + '亿';
  }
  if (absValue >= 10000) {
    return (value / 10000).toFixed(0) + '万';
  }
  return value.toFixed(0);
}

export function formatPercent(value: number | undefined | null, decimals: number = 1): string {
  if (value === undefined || value === null || isNaN(value)) {
    return '--';
  }
  return value.toFixed(decimals) + '%';
}
