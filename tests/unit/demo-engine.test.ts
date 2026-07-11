import { describe, it, expect } from 'vitest';
import { demoQuickRead, demoVoiceprint, demoCompare, demoProfileAudit } from '@/lib/ai/demo';
import {
  quickReadSchema,
  voiceprintTraitsSchema,
  compareSchema,
  profileAuditSchema,
} from '@/lib/ai/schemas';

describe('demo engine produces schema-valid output', () => {
  it('quick read', () => {
    const out = demoQuickRead({
      text: 'Everyone says you need a huge audience. That is wrong. I made $12k from 900 subscribers.',
      platform: 'x',
      format: 'post',
      goal: 'authority',
      tone: 'direct',
      risk: 'balanced',
    });
    expect(quickReadSchema.safeParse(out).success).toBe(true);
    // derives real signal: an absolute claim should surface a misreading or clip risk
    expect(out.misreadingRisks.length + out.clipRisks.length).toBeGreaterThan(0);
  });

  it('voiceprint', () => {
    const out = demoVoiceprint({ samples: ['I ship small. Often. It compounds.'] });
    expect(voiceprintTraitsSchema.safeParse(out).success).toBe(true);
  });

  it('compare', () => {
    const out = demoCompare({
      platform: 'x',
      goal: 'discussion',
      variants: [
        { label: 'A', content: 'What if we just stopped meeting on Mondays?' },
        { label: 'B', content: 'We are excited to announce no more Monday meetings.' },
      ],
    });
    expect(compareSchema.safeParse(out).success).toBe(true);
  });

  it('profile audit', () => {
    const out = demoProfileAudit({
      displayName: 'Alex',
      bio: 'building things',
      posts: ['post one', 'post two', 'post three'],
    });
    expect(profileAuditSchema.safeParse(out).success).toBe(true);
    expect(out.sevenDayPlan).toHaveLength(7);
  });

  it('is deterministic for the same input', () => {
    const input = {
      text: 'A calm, measured statement about the work.',
      platform: 'linkedin' as const,
      format: 'post' as const,
      goal: 'trust' as const,
      tone: 'thoughtful' as const,
      risk: 'low' as const,
    };
    expect(demoQuickRead(input).roomScore).toBe(demoQuickRead(input).roomScore);
  });
});
