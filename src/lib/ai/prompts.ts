import type {
  QuickReadInput,
  VoiceprintInput,
  ProfileAuditInput,
  CompareInput,
  RoomContext,
  VoiceContext,
} from '@/lib/ai/types';
import { PLATFORMS, GOALS, TONES, RISK_LEVELS } from '@/lib/constants';

export const PERCEPTION_SYSTEM = `You are ReadRoom, an audience-perception simulator.

You do NOT predict exact outcomes, engagement, virality, or what any specific person will think. You analyse language, context, audience information, and platform conventions to produce a transparent, uncertainty-aware simulation of how content is LIKELY to be interpreted.

Hard rules:
- Separate observation (what the text does) from inference (how it may land). State assumptions explicitly.
- Never claim certainty about future engagement or reach.
- Never diagnose personalities or mental-health conditions. Never label anyone a narcissist, psychopath, abuser, liar, or similar.
- Never infer protected characteristics (race, religion, sexuality, health, etc.).
- Never function as a truth detector. Never encourage deception, coercion, harassment, stalking, or manipulation.
- Preserve the user's stated meaning and values. Do not flatten a strong, authentic voice into something bland or sanitised by default. When you soften, explain the trade-off and let the user keep their edge.
- Distinguish "more persuasive" from "less likely to be misunderstood" — they are different goals.
- Be specific and concrete. Quote real fragments from the input rather than speaking in generalities.
- Frame everything as a simulation, not a verdict.

You always respond with a SINGLE valid JSON object matching the requested schema. No prose outside the JSON. No markdown code fences.`;

export const VOICEPRINT_SYSTEM = `You are ReadRoom's Voiceprint analyst. You study a person's real writing samples and extract a faithful, reusable description of HOW they write — not what they should write. You never claim to perfectly reproduce a person's identity; you produce a practical, machine-readable style guide that helps rewrites keep sounding like them. Respond with a SINGLE valid JSON object matching the schema. No prose outside the JSON.`;

export const PROFILE_SYSTEM = `You are ReadRoom's profile-positioning analyst. You evaluate how a public profile (bio, pinned content, representative posts) is likely to be read by a target audience, and you give concrete, non-generic guidance. You never invent credentials, fabricate proof, or claim the person is something they have not shown. Respond with a SINGLE valid JSON object matching the schema. No prose outside the JSON.`;

export const COMPARE_SYSTEM = `You are ReadRoom's comparison analyst. You compare content variants as an audience-perception simulation. You never declare absolute outcomes; you explain trade-offs and clearly label your reasoning as a simulation. Respond with a SINGLE valid JSON object matching the schema. No prose outside the JSON.`;

function labelOf<T extends { id: string; label: string }>(
  list: readonly T[],
  id: string,
): string {
  return list.find((x) => x.id === id)?.label ?? id;
}

function roomBlock(room?: RoomContext | null): string {
  if (!room) return 'AUDIENCE ROOM: (none selected — assume a general audience)';
  return `AUDIENCE ROOM: ${room.name}
- Description: ${room.description ?? '—'}
- Familiarity with the author: ${room.familiarity ?? '—'}
- Knowledge level: ${room.knowledgeLevel ?? '—'}
- Existing sentiment: ${room.existingSentiment ?? '—'}
- Values: ${(room.values ?? []).join(', ') || '—'}
- Common objections: ${(room.objections ?? []).join(', ') || '—'}
- Desired reaction: ${room.desiredReaction ?? '—'}
- Handle carefully: ${(room.sensitiveTopics ?? []).join(', ') || '—'}
- Extra context: ${room.customContext ?? '—'}`;
}

function voiceBlock(voice?: VoiceContext | null): string {
  if (!voice) return 'VOICEPRINT: (none — keep the input voice, do not invent a new one)';
  return `VOICEPRINT: ${voice.name}
- Style instruction: ${voice.machineInstruction}
- Preserve phrases: ${(voice.phrasesToPreserve ?? []).join(', ') || '—'}
- Avoid phrases: ${(voice.phrasesToAvoid ?? []).join(', ') || '—'}
- Non-negotiable values: ${(voice.nonNegotiableValues ?? []).join(', ') || '—'}
Rewrites MUST honour this voiceprint.`;
}

export function buildQuickReadUser(input: QuickReadInput): string {
  const platform = labelOf(PLATFORMS, input.platform);
  const goal =
    input.goal === 'custom' && input.customGoal
      ? input.customGoal
      : labelOf(GOALS, input.goal);
  const tone = labelOf(TONES, input.tone);
  const risk = labelOf(RISK_LEVELS, input.risk);

  return `Simulate how the following content will be read.

PLATFORM: ${platform}
FORMAT: ${input.format}
AUTHOR'S GOAL: ${goal}
INTENDED TONE: ${tone}
RISK TOLERANCE: ${risk} (low = protect reputation and minimise misreads; bold = maximise impact, accept polarisation)
${roomBlock(input.room)}
${voiceBlock(input.voice)}
EXTRA CONTEXT FROM AUTHOR: ${input.context?.trim() || '—'}
${input.images?.length ? 'NOTE: One or more screenshots are attached — read the content from the image(s).' : ''}

CONTENT TO ANALYSE:
"""
${input.text.trim()}
"""

Produce the JSON object with these keys:
summary, roomScore (0-100 overall), firstImpression (one sentence), overallInterpretation, likelyEmotionalResponse,
dimensions { clarity, trust, authority, warmth, originality, platformFit, polarisation } each { score 0-100, reason },
audienceReactions (3-5 items; include supporter, skeptic, neutral, expert, casual perspectives via the "role" field) each { segment, role, likelyReading, positiveSignal, friction, confidence 0-1 },
misreadingRisks each { risk, triggerText (quote from input), likelihood, severity, suggestedFix },
reputationRisks each { risk, severity, note },
clipRisks (phrases likely to be screenshotted out of context) each { phrase, whyItClips },
strongestLine { text, reason }, weakestLine { text, reason },
preserve (what should NOT change), genericOrAIWrittenSignals (what sounds generic/AI-written), platformNotes,
rewrites — EXACTLY three items with mode "clearer", "sharper", "safer" each { mode, text, rationale },
recommendedVersion (one final version honouring the voiceprint and goal),
assumptions (what you assumed), confidence (0-1).

For polarisation, a HIGHER score means MORE polarising. Keep the author's authentic voice in all rewrites.`;
}

export function buildVoiceprintUser(input: VoiceprintInput): string {
  return `Analyse these writing samples and extract a faithful Voiceprint.

SAMPLES (separated by ---):
"""
${input.samples.map((s) => s.trim()).join('\n---\n')}
"""

AUTHOR PREFERENCES:
- Frequently used phrases: ${(input.frequentPhrases ?? []).join(', ') || '—'}
- Phrases to never use: ${(input.bannedPhrases ?? []).join(', ') || '—'}
- Non-negotiable positions/values: ${(input.nonNegotiables ?? []).join(', ') || '—'}
- Preferred directness: ${input.directness ?? '—'}
- Preferred sentence length: ${input.sentenceLength ?? '—'}
- Formatting / humour / emoji / punctuation notes: ${input.formattingNotes ?? '—'}

Return JSON with: summary, sentenceRhythm, vocabularyStyle, directness, confidenceLevel, emotionalTemperature, useOfHumour, useOfContrast, useOfHooks, useOfStorytelling, typicalStructure, commonStrengths[], commonHabits[], phrasesToPreserve[], phrasesToAvoid[], nonNegotiableValues[], machineInstruction (a concise, reusable style directive for rewrites), sampleOutput (a short paragraph written in this voice on a neutral topic, clearly a demonstration).`;
}

export function buildProfileAuditUser(input: ProfileAuditInput): string {
  return `Audit this public profile as a perception simulation.

DISPLAY NAME: ${input.displayName}
CURRENT BIO: ${input.bio}
PROFILE DESCRIPTION: ${input.description ?? '—'}
PINNED POST: ${input.pinnedPost ?? '—'}
TARGET AUDIENCE: ${input.targetAudience ?? '—'}
DESIRED POSITIONING: ${input.desiredPositioning ?? '—'}
PRIMARY CALL TO ACTION: ${input.primaryCta ?? '—'}

REPRESENTATIVE POSTS (separated by ---):
"""
${input.posts.map((p) => p.trim()).join('\n---\n')}
"""

Return JSON with: scores { positioning, credibility, consistency, memorability, differentiation } (0-100),
firstImpression, appearsToBeAbout, unclear[], credibilitySignals[], missingProof[], positioningGaps[], audienceMismatch,
recommendedPositioning, revisedBios (exactly 3), pinnedPostStructure, contentPillars (exactly 3), suggestedCta,
sevenDayPlan (exactly 7 items { day 1-7, action }), confidence (0-1).`;
}

export function buildCompareUser(input: CompareInput): string {
  const goal = labelOf(GOALS, input.goal);
  const platform = labelOf(PLATFORMS, input.platform);
  return `Compare these content variants for ${platform}. Author's goal: ${goal}.
${roomBlock(input.room)}

VARIANTS:
${input.variants
  .map((v) => `[${v.label}]\n"""\n${v.content.trim()}\n"""`)
  .join('\n\n')}

Return JSON with: predictedWinnerLabel, reason, dimensionComparison[] { dimension, winnerLabel, note },
audienceWinners[] { audience, winnerLabel, why }, riskComparison[] { label, riskNote },
bestHookLabel, bestClosingLabel, mostAuthenticLabel, mostDiscussionLabel, mostMisunderstoodLabel,
recommendedHybrid (a new version combining the strongest elements), confidence (0-1).
Use the exact variant labels provided. This is a simulation, not a guaranteed outcome.`;
}
