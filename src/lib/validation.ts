import { z } from 'zod';
import { PLATFORMS, CONTENT_FORMATS, GOALS, TONES, RISK_LEVELS } from '@/lib/constants';

const ids = <T extends readonly { id: string }[]>(list: T) =>
  list.map((x) => x.id) as [T[number]['id'], ...T[number]['id'][]];

export const quickReadInputSchema = z.object({
  text: z.string().trim().min(1, 'Add some content to read.').max(8000),
  platform: z.enum(ids(PLATFORMS)),
  format: z.enum(ids(CONTENT_FORMATS)),
  goal: z.enum(ids(GOALS)),
  customGoal: z.string().max(200).optional(),
  tone: z.enum(ids(TONES)),
  risk: z.enum(ids(RISK_LEVELS)),
  context: z.string().max(2000).optional(),
  roomId: z.string().max(64).optional(),
  voiceprintId: z.string().max(64).optional(),
  imageBase64: z.string().optional(),
  imageMediaType: z.enum(['image/png', 'image/jpeg', 'image/webp']).optional(),
});

export type QuickReadFormInput = z.infer<typeof quickReadInputSchema>;

export const roomInputSchema = z.object({
  name: z.string().trim().min(1).max(80),
  description: z.string().max(400).optional(),
  familiarity: z.string().max(40).optional(),
  knowledgeLevel: z.string().max(40).optional(),
  existingSentiment: z.string().max(40).optional(),
  values: z.array(z.string().max(60)).max(12).optional(),
  objections: z.array(z.string().max(120)).max(12).optional(),
  desiredReaction: z.string().max(300).optional(),
  sensitiveTopics: z.array(z.string().max(60)).max(12).optional(),
  customContext: z.string().max(1000).optional(),
});

export const voiceprintInputSchema = z.object({
  name: z.string().trim().min(1).max(80),
  samples: z.array(z.string().max(4000)).min(1, 'Add at least one writing sample.').max(20),
  frequentPhrases: z.array(z.string().max(120)).max(20).optional(),
  bannedPhrases: z.array(z.string().max(120)).max(20).optional(),
  nonNegotiables: z.array(z.string().max(200)).max(12).optional(),
  directness: z.string().max(60).optional(),
  sentenceLength: z.string().max(60).optional(),
  formattingNotes: z.string().max(500).optional(),
});

export const profileAuditInputSchema = z.object({
  displayName: z.string().trim().min(1).max(120),
  bio: z.string().trim().min(1, 'Add your current bio.').max(600),
  description: z.string().max(600).optional(),
  pinnedPost: z.string().max(2000).optional(),
  posts: z.array(z.string().max(2000)).min(1, 'Add at least one representative post.').max(10),
  targetAudience: z.string().max(200).optional(),
  desiredPositioning: z.string().max(300).optional(),
  primaryCta: z.string().max(200).optional(),
});

export const compareInputSchema = z.object({
  platform: z.enum(ids(PLATFORMS)),
  goal: z.enum(ids(GOALS)),
  roomId: z.string().max(64).optional(),
  variants: z
    .array(
      z.object({
        label: z.string().trim().min(1).max(40),
        content: z.string().trim().min(1).max(4000),
      }),
    )
    .min(2, 'Add at least two variants.')
    .max(4),
});
