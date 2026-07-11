'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireUser } from '@/lib/auth';
import { getStore } from '@/lib/store';
import { buildVoiceprint } from '@/lib/ai';
import { voiceprintInputSchema } from '@/lib/validation';
import type { ActionResult } from './analysis';
import { AiConfigError, AiUpstreamError, AiValidationError } from '@/lib/ai/client';

function friendly(err: unknown): { error: string; code: string } {
  if (err instanceof AiConfigError)
    return { error: 'Live Voiceprint extraction needs ANTHROPIC_API_KEY. A local demo Voiceprint was not saved.', code: 'ai_not_configured' };
  if (err instanceof AiValidationError)
    return { error: 'The model returned an unexpected format. Please try again.', code: 'ai_invalid' };
  if (err instanceof AiUpstreamError)
    return { error: 'The AI service had a problem. Please try again.', code: 'ai_upstream' };
  if (err instanceof z.ZodError)
    return { error: err.issues[0]?.message ?? 'Please check the form.', code: 'invalid_input' };
  console.error('[voiceprint] error', err);
  return { error: 'Something went wrong. Please try again.', code: 'unknown' };
}

export async function createVoiceprintAction(
  raw: z.input<typeof voiceprintInputSchema>,
): Promise<ActionResult<{ id: string; isDemo: boolean }>> {
  try {
    const user = await requireUser();
    const input = voiceprintInputSchema.parse(raw);
    const { result, meta } = await buildVoiceprint({
      samples: input.samples,
      frequentPhrases: input.frequentPhrases,
      bannedPhrases: input.bannedPhrases,
      nonNegotiables: input.nonNegotiables,
      directness: input.directness,
      sentenceLength: input.sentenceLength,
      formattingNotes: input.formattingNotes,
    });
    const vp = await getStore().createVoiceprint(user.id, {
      name: input.name,
      description: result.summary.slice(0, 300),
      sourceSamples: input.samples,
      extractedTraits: result,
      machineInstruction: result.machineInstruction,
      isDefault: false,
    });
    revalidatePath('/voiceprints');
    return { ok: true, data: { id: vp.id, isDemo: meta.demo } };
  } catch (err) {
    return { ok: false, ...friendly(err) };
  }
}

export async function setDefaultVoiceprintAction(id: string) {
  const user = await requireUser();
  await getStore().setDefaultVoiceprint(user.id, id);
  revalidatePath('/voiceprints');
}

export async function deleteVoiceprintAction(id: string) {
  const user = await requireUser();
  await getStore().deleteVoiceprint(user.id, id);
  revalidatePath('/voiceprints');
}

export async function duplicateVoiceprintAction(id: string) {
  const user = await requireUser();
  const store = getStore();
  const vp = await store.getVoiceprint(user.id, id);
  if (!vp) return;
  await store.createVoiceprint(user.id, {
    name: `${vp.name} (copy)`,
    description: vp.description,
    sourceSamples: vp.sourceSamples,
    extractedTraits: vp.extractedTraits,
    machineInstruction: vp.machineInstruction,
    isDefault: false,
  });
  revalidatePath('/voiceprints');
}
