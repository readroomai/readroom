'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireUser } from '@/lib/auth';
import { getStore } from '@/lib/store';
import { roomInputSchema } from '@/lib/validation';

export async function createRoomAction(raw: z.input<typeof roomInputSchema>) {
  const user = await requireUser();
  const input = roomInputSchema.parse(raw);
  const room = await getStore().createRoom(user.id, {
    name: input.name,
    description: input.description ?? null,
    familiarity: input.familiarity ?? null,
    knowledgeLevel: input.knowledgeLevel ?? null,
    existingSentiment: input.existingSentiment ?? null,
    values: input.values ?? [],
    objections: input.objections ?? [],
    desiredReaction: input.desiredReaction ?? null,
    sensitiveTopics: input.sensitiveTopics ?? [],
    customContext: input.customContext ?? null,
    isPreset: false,
  });
  revalidatePath('/rooms');
  return { ok: true as const, id: room.id };
}

export async function updateRoomAction(id: string, raw: z.input<typeof roomInputSchema>) {
  const user = await requireUser();
  const input = roomInputSchema.parse(raw);
  await getStore().updateRoom(user.id, id, {
    name: input.name,
    description: input.description ?? null,
    familiarity: input.familiarity ?? null,
    knowledgeLevel: input.knowledgeLevel ?? null,
    existingSentiment: input.existingSentiment ?? null,
    values: input.values ?? [],
    objections: input.objections ?? [],
    desiredReaction: input.desiredReaction ?? null,
    sensitiveTopics: input.sensitiveTopics ?? [],
    customContext: input.customContext ?? null,
    isPreset: false,
  });
  revalidatePath('/rooms');
  return { ok: true as const };
}

export async function deleteRoomAction(id: string) {
  const user = await requireUser();
  await getStore().deleteRoom(user.id, id);
  revalidatePath('/rooms');
}
