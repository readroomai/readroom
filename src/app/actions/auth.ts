'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { DEV_SESSION_COOKIE, encodeDevSession, isDevAuth } from '@/lib/auth';
import { getStore } from '@/lib/store';
import { nanoid } from '@/lib/utils';

const devSignInSchema = z.object({
  name: z.string().trim().max(80).optional(),
  email: z.string().trim().email().optional().or(z.literal('')),
  redirectTo: z.string().max(200).optional(),
});

/**
 * Dev-auth only: establishes a local session cookie so the protected app is
 * fully explorable without a Clerk account. No password, no external calls.
 * When Clerk is configured this action is a no-op guarded by isDevAuth.
 */
export async function devSignInAction(raw: z.input<typeof devSignInSchema>) {
  if (!isDevAuth) redirect('/sign-in');
  const input = devSignInSchema.parse(raw);
  const clerkUserId = `dev_${nanoid(12)}`;
  const cookie = encodeDevSession({
    clerkUserId,
    email: input.email || 'you@readroom.local',
    displayName: input.name || 'ReadRoom Explorer',
    avatarUrl: null,
  });
  const jar = await cookies();
  jar.set(DEV_SESSION_COOKIE, cookie, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });

  // Provision the user + preset rooms immediately so onboarding has content.
  const store = getStore();
  const user = await store.upsertUser({
    clerkUserId,
    email: input.email || 'you@readroom.local',
    displayName: input.name || 'ReadRoom Explorer',
  });
  await store.ensurePresetRooms(user.id);

  redirect(input.redirectTo && input.redirectTo.startsWith('/') ? input.redirectTo : '/onboarding');
}

export async function devSignOutAction() {
  if (isDevAuth) {
    (await cookies()).delete(DEV_SESSION_COOKIE);
  }
  redirect('/');
}
