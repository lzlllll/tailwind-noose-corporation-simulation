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
  const sign = value < 0 ? '-' : '';
  const absValue = Math.abs(value);
  const rounded = Math.round(absValue / 100) * 100;

  if (rounded >= 100000000) {
    const yi = rounded / 100000000;
    const yiStr = yi.toFixed(2).replace(/\.?0+$/, '');
    return sign + yiStr + '亿';
  }
  if (rounded >= 10000) {
    const wan = rounded / 10000;
    const wanStr = wan.toFixed(2).replace(/\.?0+$/, '');
    return sign + wanStr + '万';
  }
  return sign + rounded.toFixed(0);
}

export function formatPercent(value: number | undefined | null, decimals: number = 1): string {
  if (value === undefined || value === null || isNaN(value)) {
    return '--';
  }
  return value.toFixed(decimals) + '%';
}

export function asArray<T>(value: T[] | null | undefined | any): T[] {
  if (Array.isArray(value)) {
    return value.filter((item) => item !== null && item !== undefined) as T[];
  }
  if (value === null || value === undefined) {
    return [] as T[];
  }
  return [] as T[];
}
