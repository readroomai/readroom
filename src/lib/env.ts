import { z } from 'zod';

/**
 * Central environment resolution for ReadRoom.
 *
 * The application is designed to run in three coherent modes without ever
 * fabricating success:
 *
 *  - PRODUCTION   : Clerk + Postgres + Anthropic keys all present.
 *  - PARTIAL      : any subset present; the rest fall back gracefully.
 *  - LOCAL DEMO   : nothing configured — file-backed storage, dev auth,
 *                   and a clearly-labelled deterministic analysis engine.
 *
 * We never throw at import time for missing optional integrations; instead we
 * expose capability flags the app reads to choose a real integration or a
 * transparent fallback. This keeps the app runnable end-to-end today while the
 * production wiring stays intact behind these checks.
 */

const rawSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),

  // Clerk
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().optional(),
  CLERK_SECRET_KEY: z.string().optional(),
  CLERK_WEBHOOK_SECRET: z.string().optional(),

  // Database (Supabase Postgres)
  DATABASE_URL: z.string().optional(),

  // Supabase storage
  NEXT_PUBLIC_SUPABASE_URL: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),

  // Anthropic
  ANTHROPIC_API_KEY: z.string().optional(),
  ANTHROPIC_MODEL: z.string().optional(),

  // Upstash (optional rate limiting)
  UPSTASH_REDIS_REST_URL: z.string().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
});

const parsed = rawSchema.safeParse(process.env);

if (!parsed.success) {
  // Only fires for genuinely malformed values (e.g. bad URL). Optional-but-absent is fine.
  console.warn('[env] Some environment variables are malformed:', parsed.error.flatten().fieldErrors);
}

const e = parsed.success ? parsed.data : rawSchema.parse({});

function present(v?: string): v is string {
  return typeof v === 'string' && v.trim().length > 0 && !v.includes('your_') && !v.includes('placeholder');
}

export const DEFAULT_ANTHROPIC_MODEL = 'claude-sonnet-4-5';

export const env = {
  nodeEnv: e.NODE_ENV,
  appUrl:
    e.NEXT_PUBLIC_APP_URL ??
    (e.NODE_ENV === 'production' ? 'https://www.readroom.blog' : 'http://localhost:3000'),

  clerk: {
    publishableKey: e.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    secretKey: e.CLERK_SECRET_KEY,
    webhookSecret: e.CLERK_WEBHOOK_SECRET,
  },
  database: { url: e.DATABASE_URL },
  supabase: {
    url: e.NEXT_PUBLIC_SUPABASE_URL,
    serviceRoleKey: e.SUPABASE_SERVICE_ROLE_KEY,
  },
  anthropic: {
    apiKey: e.ANTHROPIC_API_KEY,
    model: present(e.ANTHROPIC_MODEL) ? (e.ANTHROPIC_MODEL as string) : DEFAULT_ANTHROPIC_MODEL,
  },
  upstash: {
    url: e.UPSTASH_REDIS_REST_URL,
    token: e.UPSTASH_REDIS_REST_TOKEN,
  },
} as const;

export const capabilities = {
  /** Real Clerk auth vs. the local dev-auth fallback. */
  clerk: present(env.clerk.publishableKey) && present(env.clerk.secretKey),
  clerkWebhook: present(env.clerk.webhookSecret),
  /** Real Postgres vs. file-backed dev store. */
  database: present(env.database.url),
  /** Supabase storage for uploads vs. local disk. */
  storage: present(env.supabase.url) && present(env.supabase.serviceRoleKey),
  /** Live Anthropic calls vs. the labelled deterministic demo engine. */
  anthropic: present(env.anthropic.apiKey),
  /** Upstash Redis rate limiting vs. DB/memory fallback. */
  upstash: present(env.upstash.url) && present(env.upstash.token),
} as const;

export function isFullyConfigured(): boolean {
  return capabilities.clerk && capabilities.database && capabilities.anthropic;
}
