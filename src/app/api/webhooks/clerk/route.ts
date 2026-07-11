import { headers } from 'next/headers';
import { Webhook } from 'svix';
import { env, capabilities } from '@/lib/env';
import { getStore } from '@/lib/store';

export const runtime = 'nodejs';

type ClerkEvent = {
  type: string;
  data: {
    id: string;
    email_addresses?: { email_address: string; id: string }[];
    primary_email_address_id?: string;
    first_name?: string | null;
    last_name?: string | null;
    username?: string | null;
    image_url?: string | null;
  };
};

export async function POST(req: Request) {
  if (!capabilities.clerkWebhook) {
    return new Response('Webhook not configured', { status: 501 });
  }

  const payload = await req.text();
  const hdrs = await headers();
  const svixId = hdrs.get('svix-id');
  const svixTimestamp = hdrs.get('svix-timestamp');
  const svixSignature = hdrs.get('svix-signature');
  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response('Missing svix headers', { status: 400 });
  }

  let evt: ClerkEvent;
  try {
    const wh = new Webhook(env.clerk.webhookSecret as string);
    evt = wh.verify(payload, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as ClerkEvent;
  } catch {
    return new Response('Invalid signature', { status: 400 });
  }

  const store = getStore();

  try {
    if (evt.type === 'user.created' || evt.type === 'user.updated') {
      const d = evt.data;
      const primaryEmail =
        d.email_addresses?.find((e) => e.id === d.primary_email_address_id)?.email_address ??
        d.email_addresses?.[0]?.email_address ??
        null;
      const name = [d.first_name, d.last_name].filter(Boolean).join(' ') || d.username || null;
      await store.upsertUser({
        clerkUserId: d.id,
        email: primaryEmail,
        displayName: name,
        avatarUrl: d.image_url ?? null,
      });
    } else if (evt.type === 'user.deleted') {
      const existing = await store.getUserByClerkId(evt.data.id);
      if (existing) await store.deleteUserData(existing.id);
    }
  } catch (err) {
    console.error('[clerk webhook] handler error', err);
    return new Response('Handler error', { status: 500 });
  }

  return new Response('ok', { status: 200 });
}
