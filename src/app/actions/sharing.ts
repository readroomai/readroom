'use server';

import { revalidatePath } from 'next/cache';
import { requireUser } from '@/lib/auth';
import { getStore } from '@/lib/store';

export async function createShareLinkAction(analysisId: string, showOriginalContent: boolean) {
  const user = await requireUser();
  const link = await getStore().createShareLink(user.id, {
    analysisId,
    showOriginalContent,
  });
  revalidatePath(`/history/${analysisId}`);
  return { ok: true as const, slug: link.slug, id: link.id };
}

export async function revokeShareLinkAction(id: string, analysisId: string) {
  const user = await requireUser();
  await getStore().revokeShareLink(user.id, id);
  revalidatePath(`/history/${analysisId}`);
}
