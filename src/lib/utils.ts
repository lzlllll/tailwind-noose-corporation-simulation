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
  const absValue = Math.abs(Math.round(value));

  if (absValue === 0) return '0元';

  const yi = Math.floor(absValue / 100000000);
  const wan = Math.floor((absValue % 100000000) / 10000);
  const yuan = absValue % 10000;

  const parts: string[] = [];
  if (yi > 0) parts.push(yi + '亿');
  if (wan > 0) parts.push(wan + '万');
  if (yuan > 0) parts.push(yuan + '元');

  return sign + parts.join('');
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

function hashContent(item: any): string {
  const content = JSON.stringify(item);
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `hash-${Math.abs(hash).toString(36)}`;
}

export function dedupeById<T extends { id?: string }>(arr: T[]): T[] {
  const map = new Map<string, T & { id: string }>();
  for (const item of arr) {
    if (!item) continue;
    const id = item.id || hashContent(item);
    const existing = map.get(id);
    map.set(id, { ...(existing || {}), ...item, id } as T & { id: string });
  }
  return Array.from(map.values()) as T[];
}
