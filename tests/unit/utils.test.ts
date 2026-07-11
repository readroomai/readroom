import { describe, it, expect } from 'vitest';
import { slugify, nanoid, clampScore, scoreBand, initialsFrom } from '@/lib/utils';

describe('slugify', () => {
  it('lowercases and hyphenates', () => {
    expect(slugify('Hello, World!')).toBe('hello-world');
  });
  it('trims to 60 chars', () => {
    expect(slugify('a'.repeat(80)).length).toBeLessThanOrEqual(60);
  });
});

describe('nanoid', () => {
  it('produces ids of requested length and reasonable uniqueness', () => {
    const ids = new Set(Array.from({ length: 500 }, () => nanoid(12)));
    expect(ids.size).toBe(500);
    expect([...ids][0].length).toBe(12);
  });
});

describe('clampScore', () => {
  it('clamps to 0..100 and rounds', () => {
    expect(clampScore(-5)).toBe(0);
    expect(clampScore(150)).toBe(100);
    expect(clampScore(72.6)).toBe(73);
  });
});

describe('scoreBand', () => {
  it('maps scores to bands', () => {
    expect(scoreBand(90).tone).toBe('strong');
    expect(scoreBand(70).tone).toBe('good');
    expect(scoreBand(50).tone).toBe('mixed');
    expect(scoreBand(20).tone).toBe('weak');
  });
});

describe('initialsFrom', () => {
  it('handles names and fallbacks', () => {
    expect(initialsFrom('Gia Macool')).toBe('GM');
    expect(initialsFrom('alex')).toBe('AL');
    expect(initialsFrom(null)).toBe('RR');
  });
});
