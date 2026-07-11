import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 60);
}

/** URL-safe random id without external deps. */
export function nanoid(size = 16): string {
  const alphabet =
    'useandom26T198340PX75pxJACKVERYMINDBUSHWOLFGQZbfghjklqvwyzrict';
  let id = '';
  const bytes = randomBytes(size);
  for (let i = 0; i < size; i++) {
    id += alphabet[bytes[i] % alphabet.length];
  }
  return id;
}

function randomBytes(size: number): Uint8Array {
  const arr = new Uint8Array(size);
  if (typeof globalThis.crypto?.getRandomValues === 'function') {
    globalThis.crypto.getRandomValues(arr);
  } else {
    for (let i = 0; i < size; i++) arr[i] = Math.floor(Math.random() * 256);
  }
  return arr;
}

export function formatRelativeDate(input: string | Date): string {
  const date = typeof input === 'string' ? new Date(input) : input;
  const diff = Date.now() - date.getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() === new Date().getFullYear() ? undefined : 'numeric',
  });
}

export function clampScore(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

export function scoreBand(score: number): {
  label: string;
  tone: 'strong' | 'good' | 'mixed' | 'weak';
} {
  if (score >= 82) return { label: 'Lands well', tone: 'strong' };
  if (score >= 66) return { label: 'Mostly clear', tone: 'good' };
  if (score >= 45) return { label: 'Reads mixed', tone: 'mixed' };
  return { label: 'High friction', tone: 'weak' };
}

export function initialsFrom(name: string | null | undefined): string {
  if (!name) return 'RR';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
