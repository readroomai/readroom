'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireUser } from '@/lib/auth';
import { getStore } from '@/lib/store';
import { runProfileAudit } from '@/lib/ai';
import { profileAuditInputSchema } from '@/lib/validation';
import { assertWithinLimit } from '@/lib/usage';
import type { ActionResult } from './analysis';
import type { ProfileAuditResult } from '@/lib/ai/schemas';
import { AiConfigError, AiUpstreamError, AiValidationError } from '@/lib/ai/client';
import { UsageLimitError } from '@/lib/usage';

function friendly(err: unknown): { error: string; code: string } {
  if (err instanceof UsageLimitError)
    return { error: 'Daily analysis limit reached (5 per day).', code: 'rate_limited' };
  if (err instanceof AiConfigError)
    return { error: 'Live audits need ANTHROPIC_API_KEY. Nothing was saved.', code: 'ai_not_configured' };
  if (err instanceof AiValidationError)
    return { error: 'The model returned an unexpected format. Please try again.', code: 'ai_invalid' };
  if (err instanceof AiUpstreamError)
    return { error: 'The AI service had a problem. Please try again.', code: 'ai_upstream' };
  if (err instanceof z.ZodError)
    return { error: err.issues[0]?.message ?? 'Please check the form.', code: 'invalid_input' };
  console.error('[audit] error', err);
  return { error: 'Something went wrong. Please try again.', code: 'unknown' };
}

export async function runProfileAuditAction(
  raw: z.input<typeof profileAuditInputSchema>,
): Promise<ActionResult<{ id: string; result: ProfileAuditResult; isDemo: boolean; model: string }>> {
  try {
    const user = await requireUser();
    const input = profileAuditInputSchema.parse(raw);
    await assertWithinLimit(user.id);

    const { result, meta } = await runProfileAudit({
      displayName: input.displayName,
      bio: input.bio,
      description: input.description,
      pinnedPost: input.pinnedPost,
      posts: input.posts,
      targetAudience: input.targetAudience,
      desiredPositioning: input.desiredPositioning,
      primaryCta: input.primaryCta,
    });

    const store = getStore();
    const audit = await store.createProfileAudit(user.id, {
      input: input as Record<string, unknown>,
      result,
      model: meta.model,
      isDemo: meta.demo,
      status: 'complete',
    });
    await store.recordUsage(user.id, {
      eventType: 'analysis',
      model: meta.model,
      estimatedInputTokens: meta.usage?.inputTokens ?? 0,
      estimatedOutputTokens: meta.usage?.outputTokens ?? 0,
    });
    revalidatePath('/audit');
    return { ok: true, data: { id: audit.id, result, isDemo: meta.demo, model: meta.model } };
  } catch (err) {
    return { ok: false, ...friendly(err) };
  }
}

export async function deleteProfileAuditAction(id: string) {
  const user = await requireUser();
  await getStore().deleteProfileAudit(user.id, id);
  revalidatePath('/audit');
}
