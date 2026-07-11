import { z } from 'zod';

/** Shared building blocks -------------------------------------------------- */

const likelihood = z.enum(['low', 'medium', 'high']);
const score100 = z.coerce.number().min(0).max(100);
const confidence01 = z.coerce.number().min(0).max(1);

const dimension = z.object({
  score: score100,
  reason: z.string().min(1).max(600),
});

const line = z.object({
  text: z.string().max(1200),
  reason: z.string().max(600),
});

/** Quick Read result ------------------------------------------------------- */

export const quickReadSchema = z.object({
  summary: z.string().min(1).max(400),
  roomScore: score100,
  firstImpression: z.string().min(1).max(300),
  overallInterpretation: z.string().min(1).max(1600),
  likelyEmotionalResponse: z.string().min(1).max(600),
  dimensions: z.object({
    clarity: dimension,
    trust: dimension,
    authority: dimension,
    warmth: dimension,
    originality: dimension,
    platformFit: dimension,
    polarisation: dimension,
  }),
  audienceReactions: z
    .array(
      z.object({
        segment: z.string().min(1).max(80),
        role: z
          .enum(['supporter', 'skeptic', 'neutral', 'expert', 'casual'])
          .optional(),
        likelyReading: z.string().min(1).max(700),
        positiveSignal: z.string().max(400).optional(),
        friction: z.string().max(400).optional(),
        confidence: confidence01,
      }),
    )
    .min(3)
    .max(7),
  misreadingRisks: z
    .array(
      z.object({
        risk: z.string().min(1).max(300),
        triggerText: z.string().max(400).optional(),
        likelihood,
        severity: likelihood,
        suggestedFix: z.string().max(500).optional(),
      }),
    )
    .max(8),
  reputationRisks: z
    .array(
      z.object({
        risk: z.string().min(1).max(300),
        severity: likelihood,
        note: z.string().max(500).optional(),
      }),
    )
    .max(6),
  clipRisks: z
    .array(
      z.object({
        phrase: z.string().min(1).max(300),
        whyItClips: z.string().max(400).optional(),
      }),
    )
    .max(6),
  strongestLine: line,
  weakestLine: line,
  preserve: z.array(z.string().max(400)).max(8),
  genericOrAIWrittenSignals: z.array(z.string().max(400)).max(8),
  platformNotes: z.array(z.string().max(400)).max(8),
  rewrites: z
    .array(
      z.object({
        mode: z.enum(['clearer', 'sharper', 'safer']),
        text: z.string().min(1).max(3000),
        rationale: z.string().max(600).optional(),
      }),
    )
    .min(3)
    .max(3),
  recommendedVersion: z.string().min(1).max(3000),
  assumptions: z.array(z.string().max(400)).max(8),
  confidence: confidence01,
});

export type QuickReadResult = z.infer<typeof quickReadSchema>;

/** Voiceprint extraction --------------------------------------------------- */

export const voiceprintTraitsSchema = z.object({
  summary: z.string().min(1).max(800),
  sentenceRhythm: z.string().max(400),
  vocabularyStyle: z.string().max(400),
  directness: z.string().max(300),
  confidenceLevel: z.string().max(300),
  emotionalTemperature: z.string().max(300),
  useOfHumour: z.string().max(300),
  useOfContrast: z.string().max(300),
  useOfHooks: z.string().max(300),
  useOfStorytelling: z.string().max(300),
  typicalStructure: z.string().max(400),
  commonStrengths: z.array(z.string().max(200)).max(8),
  commonHabits: z.array(z.string().max(200)).max(8),
  phrasesToPreserve: z.array(z.string().max(120)).max(12),
  phrasesToAvoid: z.array(z.string().max(120)).max(12),
  nonNegotiableValues: z.array(z.string().max(200)).max(8),
  machineInstruction: z.string().min(1).max(1600),
  sampleOutput: z.string().max(1200).optional(),
});

export type VoiceprintTraits = z.infer<typeof voiceprintTraitsSchema>;

/** Profile audit ----------------------------------------------------------- */

export const profileAuditSchema = z.object({
  scores: z.object({
    positioning: score100,
    credibility: score100,
    consistency: score100,
    memorability: score100,
    differentiation: score100,
  }),
  firstImpression: z.string().min(1).max(800),
  appearsToBeAbout: z.string().max(600),
  unclear: z.array(z.string().max(300)).max(8),
  credibilitySignals: z.array(z.string().max(300)).max(8),
  missingProof: z.array(z.string().max(300)).max(8),
  positioningGaps: z.array(z.string().max(300)).max(8),
  audienceMismatch: z.string().max(600).optional(),
  recommendedPositioning: z.string().min(1).max(500),
  revisedBios: z.array(z.string().max(600)).min(3).max(3),
  pinnedPostStructure: z.string().max(900),
  contentPillars: z.array(z.string().max(200)).min(3).max(3),
  suggestedCta: z.string().max(300),
  sevenDayPlan: z
    .array(z.object({ day: z.coerce.number().min(1).max(7), action: z.string().max(400) }))
    .min(7)
    .max(7),
  confidence: confidence01,
});

export type ProfileAuditResult = z.infer<typeof profileAuditSchema>;

/** Compare ----------------------------------------------------------------- */

export const compareSchema = z.object({
  predictedWinnerLabel: z.string().min(1).max(60),
  reason: z.string().min(1).max(800),
  dimensionComparison: z.array(
    z.object({
      dimension: z.string().max(40),
      winnerLabel: z.string().max(60),
      note: z.string().max(300).optional(),
    }),
  ),
  audienceWinners: z.array(
    z.object({ audience: z.string().max(80), winnerLabel: z.string().max(60), why: z.string().max(300) }),
  ),
  riskComparison: z.array(
    z.object({ label: z.string().max(60), riskNote: z.string().max(400) }),
  ),
  bestHookLabel: z.string().max(60),
  bestClosingLabel: z.string().max(60),
  mostAuthenticLabel: z.string().max(60),
  mostDiscussionLabel: z.string().max(60),
  mostMisunderstoodLabel: z.string().max(60),
  recommendedHybrid: z.string().min(1).max(3000),
  confidence: confidence01,
});

export type CompareResult = z.infer<typeof compareSchema>;
