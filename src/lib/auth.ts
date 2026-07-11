import 'server-only';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { capabilities } from '@/lib/env';
import { getStore } from '@/lib/store';
import type { UserRecord } from '@/lib/store/types';

export const DEV_SESSION_COOKIE = 'rr_dev_session';

/** A minimal identity resolved from Clerk or the local dev-auth fallback. */
export type SessionIdentity = {
  clerkUserId: string;
  email: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  isDev: boolean;
};

/**
 * Resolves the current identity.
 * - Clerk configured: reads the real Clerk session.
 * - Not configured: reads a signed dev-session cookie (local only).
 * Returns null when nobody is authenticated.
 */
export async function getIdentity(): Promise<SessionIdentity | null> {
  if (capabilities.clerk) {
    const { auth, currentUser } = await import('@clerk/nextjs/server');
    const { userId } = await auth();
    if (!userId) return null;
    const user = await currentUser();
    const email =
      user?.primaryEmailAddress?.emailAddress ??
      user?.emailAddresses?.[0]?.emailAddress ??
      null;
    const name =
      [user?.firstName, user?.lastName].filter(Boolean).join(' ') ||
      user?.username ||
      null;
    return {
      clerkUserId: userId,
      email,
      displayName: name,
      avatarUrl: user?.imageUrl ?? null,
      isDev: false,
    };
  }

  const jar = await cookies();
  const raw = jar.get(DEV_SESSION_COOKIE)?.value;
  if (!raw) return null;
  try {
    const parsed = JSON.parse(Buffer.from(raw, 'base64url').toString('utf8'));
    if (!parsed?.clerkUserId) return null;
    return {
      clerkUserId: String(parsed.clerkUserId),
      email: parsed.email ?? null,
      displayName: parsed.displayName ?? null,
      avatarUrl: parsed.avatarUrl ?? null,
      isDev: true,
    };
  } catch {
    return null;
  }
}

/** Serialises a dev identity for the cookie (dev-auth only). */
export function encodeDevSession(identity: {
  clerkUserId: string;
  email?: string | null;
  displayName?: string | null;
  avatarUrl?: string | null;
}): string {
  return Buffer.from(JSON.stringify(identity), 'utf8').toString('base64url');
}

/**
 * Resolves the current identity to a persisted internal user (lazy upsert),
 * so the app always has a stable internal user id even if the Clerk webhook
 * has not fired yet. Returns null when unauthenticated.
 */
export async function getCurrentUser(): Promise<UserRecord | null> {
  const identity = await getIdentity();
  if (!identity) return null;
  const store = getStore();
  const user = await store.upsertUser({
    clerkUserId: identity.clerkUserId,
    email: identity.email,
    displayName: identity.displayName,
    avatarUrl: identity.avatarUrl,
  });
  return user;
}

/** For server components/actions in the protected area. Redirects if signed out. */
export async function requireUser(): Promise<UserRecord> {
  const user = await getCurrentUser();
  if (!user) redirect('/sign-in');
  return user;
}

export const isDevAuth = !capabilities.clerk;
