import { describe, it, expect } from 'vitest';
import { quickReadSchema } from '@/lib/ai/schemas';
import { quickReadInputSchema } from '@/lib/validation';
import { extractJson } from '@/lib/ai/client';
import { SAMPLE_RESULT } from '@/lib/sample';

describe('quickReadSchema', () => {
  it('accepts a well-formed result', () => {
    const parsed = quickReadSchema.safeParse(SAMPLE_RESULT);
    expect(parsed.success).toBe(true);
  });

  it('rejects a result missing required fields', () => {
    const bad = { ...SAMPLE_RESULT } as Record<string, unknown>;
    delete bad.roomScore;
    expect(quickReadSchema.safeParse(bad).success).toBe(false);
  });

  it('requires exactly three rewrites', () => {
    const bad = { ...SAMPLE_RESULT, rewrites: SAMPLE_RESULT.rewrites.slice(0, 2) };
    expect(quickReadSchema.safeParse(bad).success).toBe(false);
  });
});

describe('extractJson', () => {
  it('parses a bare object', () => {
    expect(extractJson('{"a":1}')).toEqual({ a: 1 });
  });
  it('strips markdown fences', () => {
    expect(extractJson('```json\n{"a":2}\n```')).toEqual({ a: 2 });
  });
  it('recovers a braced span from surrounding prose', () => {
    expect(extractJson('Here you go: {"a":3} — done')).toEqual({ a: 3 });
  });
  it('returns null on unparseable input', () => {
    expect(extractJson('not json at all')).toBeNull();
  });
});

describe('quickReadInputSchema', () => {
  const base = {
    text: 'Hello world',
    platform: 'x',
    format: 'post',
    goal: 'authority',
    tone: 'direct',
    risk: 'balanced',
  };
  it('accepts valid input', () => {
    expect(quickReadInputSchema.safeParse(base).success).toBe(true);
  });
  it('rejects empty text', () => {
    expect(quickReadInputSchema.safeParse({ ...base, text: '   ' }).success).toBe(false);
  });
  it('rejects an unknown platform', () => {
    expect(quickReadInputSchema.safeParse({ ...base, platform: 'myspace' }).success).toBe(false);
  });
});
