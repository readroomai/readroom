'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { requireUser, DEV_SESSION_COOKIE, isDevAuth } from '@/lib/auth';
import { getStore } from '@/lib/store';

const settingsSchema = z.object({
  defaultRoomId: z.string().max(64).nullable().optional(),
  defaultVoiceprintId: z.string().max(64).nullable().optional(),
  appearance: z.enum(['light', 'dark', 'system']).optional(),
  dataRetentionPreference: z.enum(['keep', 'auto_delete_30d']).optional(),
});

export async function completeOnboardingAction() {
  const user = await requireUser();
  await getStore().setOnboardingComplete(user.id);
  revalidatePath('/home');
}

export async function updateSettingsAction(raw: z.input<typeof settingsSchema>) {
  const user = await requireUser();
  const patch = settingsSchema.parse(raw);
  await getStore().updateSettings(user.id, patch);
  revalidatePath('/settings');
  return { ok: true as const };
}

export async function exportUserDataAction(): Promise<string> {
  const user = await requireUser();
  const data = await getStore().exportUserData(user.id);
  return JSON.stringify(data, null, 2);
}

export async function deleteAccountDataAction() {
  const user = await requireUser();
  await getStore().deleteUserData(user.id);
  if (isDevAuth) {
    (await cookies()).delete(DEV_SESSION_COOKIE);
  }
  redirect('/');
}
