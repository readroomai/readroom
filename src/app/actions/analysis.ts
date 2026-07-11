'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireUser } from '@/lib/auth';
import { getStore } from '@/lib/store';
import { analyseContent, compareVariants } from '@/lib/ai';
import { AiValidationError, AiUpstreamError, AiConfigError } from '@/lib/ai/client';
import { quickReadInputSchema, compareInputSchema } from '@/lib/validation';
import { assertWithinLimit, UsageLimitError, getUsageStatus } from '@/lib/usage';
import type { RoomContext, VoiceContext } from '@/lib/ai/types';
import type { AudienceRoomRecord, VoiceprintRecord } from '@/lib/store/types';
import type { QuickReadResult, CompareResult } from '@/lib/ai/schemas';

export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; code: string };

function roomContext(r: AudienceRoomRecord | null): RoomContext | null {
  if (!r) return null;
  return {
    name: r.name,
    description: r.description ?? undefined,
    familiarity: r.familiarity ?? undefined,
    knowledgeLevel: r.knowledgeLevel ?? undefined,
    existingSentiment: r.existingSentiment ?? undefined,
    values: r.values,
    objections: r.objections,
    desiredReaction: r.desiredReaction ?? undefined,
    sensitiveTopics: r.sensitiveTopics,
    customContext: r.customContext ?? undefined,
  };
}

function voiceContext(v: VoiceprintRecord | null): VoiceContext | null {
  if (!v) return null;
  return {
    name: v.name,
    machineInstruction: v.machineInstruction,
    phrasesToPreserve: v.extractedTraits.phrasesToPreserve,
    phrasesToAvoid: v.extractedTraits.phrasesToAvoid,
    nonNegotiableValues: v.extractedTraits.nonNegotiableValues,
  };
}

function friendlyError(err: unknown): { error: string; code: string } {
  if (err instanceof UsageLimitError)
    return { error: 'You have reached the daily limit of 5 analyses. It resets on a rolling 24-hour window.', code: 'rate_limited' };
  if (err instanceof AiConfigError)
    return { error: 'The AI service is not configured on this deployment. Add ANTHROPIC_API_KEY to enable live analysis.', code: 'ai_not_configured' };
  if (err instanceof AiValidationError)
    return { error: 'The model returned an unexpected format and we could not safely save it. Please try again.', code: 'ai_invalid' };
  if (err instanceof AiUpstreamError)
    return { error: 'The AI service had a problem. Please try again in a moment.', code: 'ai_upstream' };
  if (err instanceof z.ZodError)
    return { error: err.issues[0]?.message ?? 'Please check the form and try again.', code: 'invalid_input' };
  console.error('[analysis] unexpected error', err);
  return { error: 'Something went wrong. Please try again.', code: 'unknown' };
}

export type QuickReadResponse = {
  analysisId: string;
  result: QuickReadResult;
  isDemo: boolean;
  model: string;
  usage: { used: number; limit: number; remaining: number };
};

export async function runQuickReadAction(
  raw: z.input<typeof quickReadInputSchema>,
): Promise<ActionResult<QuickReadResponse>> {
  try {
    const user = await requireUser();
    const input = quickReadInputSchema.parse(raw);
    await assertWithinLimit(user.id);

    const store = getStore();
    const [room, voice] = await Promise.all([
      input.roomId ? store.getRoom(user.id, input.roomId) : Promise.resolve(null),
      input.voiceprintId ? store.getVoiceprint(user.id, input.voiceprintId) : Promise.resolve(null),
    ]);

    const { result, meta } = await analyseContent({
      text: input.text,
      platform: input.platform,
      format: input.format,
      goal: input.goal,
      customGoal: input.customGoal,
      tone: input.tone,
      risk: input.risk,
      context: input.context,
      room: roomContext(room),
      voice: voiceContext(voice),
      images:
        input.imageBase64 && input.imageMediaType
          ? [{ mediaType: input.imageMediaType, dataBase64: input.imageBase64 }]
          : undefined,
    });

    const title = input.text.trim().slice(0, 64).replace(/\s+/g, ' ') || 'Untitled read';
    const analysis = await store.createAnalysis(user.id, {
      analysisType: 'quick_read',
      title,
      originalText: input.text,
      platform: input.platform,
      contentFormat: input.format,
      communicationGoal: input.goal,
      desiredTone: input.tone,
      riskTolerance: input.risk,
      context: input.context ?? null,
      voiceprintId: input.voiceprintId ?? null,
      audienceRoomId: input.roomId ?? null,
      result,
      model: meta.model,
      modelConfidence: meta.confidence,
      isDemo: meta.demo,
      status: 'complete',
      isFavourite: false,
    });

    await store.recordUsage(user.id, {
      eventType: 'analysis',
      model: meta.model,
      estimatedInputTokens: meta.usage?.inputTokens ?? 0,
      estimatedOutputTokens: meta.usage?.outputTokens ?? 0,
    });

    const usage = await getUsageStatus(user.id);
    revalidatePath('/history');
    revalidatePath('/home');

    return {
      ok: true,
      data: {
        analysisId: analysis.id,
        result,
        isDemo: meta.demo,
        model: meta.model,
        usage: { used: usage.used, limit: usage.limit, remaining: usage.remaining },
      },
    };
  } catch (err) {
    return { ok: false, ...friendlyError(err) };
  }
}

export async function runCompareAction(
  raw: z.input<typeof compareInputSchema>,
): Promise<ActionResult<{ analysisId: string; result: CompareResult; isDemo: boolean; model: string }>> {
  try {
    const user = await requireUser();
    const input = compareInputSchema.parse(raw);
    await assertWithinLimit(user.id);

    const store = getStore();
    const room = input.roomId ? await store.getRoom(user.id, input.roomId) : null;
    const { result, meta } = await compareVariants({
      variants: input.variants,
      platform: input.platform,
      goal: input.goal,
      room: roomContext(room),
    });

    const analysis = await store.createAnalysis(user.id, {
      analysisType: 'compare',
      title: `Compare · ${input.variants.map((v) => v.label).join(' vs ')}`.slice(0, 64),
      originalText: input.variants.map((v) => `[${v.label}]\n${v.content}`).join('\n\n'),
      platform: input.platform,
      contentFormat: null,
      communicationGoal: input.goal,
      desiredTone: null,
      riskTolerance: null,
      context: null,
      voiceprintId: null,
      audienceRoomId: input.roomId ?? null,
      result,
      model: meta.model,
      modelConfidence: meta.confidence,
      isDemo: meta.demo,
      status: 'complete',
      isFavourite: false,
      variants: input.variants.map((v, i) => ({
        id: '',
        analysisId: '',
        label: v.label,
        content: v.content,
        position: i,
      })),
    });

    await store.recordUsage(user.id, {
      eventType: 'analysis',
      model: meta.model,
      estimatedInputTokens: meta.usage?.inputTokens ?? 0,
      estimatedOutputTokens: meta.usage?.outputTokens ?? 0,
    });
    revalidatePath('/history');

    return { ok: true, data: { analysisId: analysis.id, result, isDemo: meta.demo, model: meta.model } };
  } catch (err) {
    return { ok: false, ...friendlyError(err) };
  }
}

export async function toggleFavouriteAction(id: string, value: boolean) {
  const user = await requireUser();
  await getStore().updateAnalysis(user.id, id, { isFavourite: value });
  revalidatePath('/history');
}

export async function renameAnalysisAction(id: string, title: string) {
  const user = await requireUser();
  const clean = title.trim().slice(0, 80);
  if (!clean) return;
  await getStore().updateAnalysis(user.id, id, { title: clean });
  revalidatePath('/history');
}

export async function deleteAnalysisAction(id: string) {
  const user = await requireUser();
  await getStore().deleteAnalysis(user.id, id);
  revalidatePath('/history');
}
