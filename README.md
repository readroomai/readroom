# ReadRoom

**Read the room before you post.** ReadRoom is an AI audience-perception platform: paste a post,
caption, email, announcement, or message, choose who will see it and what you want, and get a
transparent simulation of how different audiences may interpret it — before you publish.

It is not an AI writer, grammar checker, or caption generator. It answers one question:
_how is this likely to come across?_

---

## Runs with zero configuration

ReadRoom is engineered to run end-to-end with **no external services**, then upgrade to production
as you add credentials. Nothing is ever faked: each integration either runs for real or falls back
to a clearly-labelled local equivalent.

| Concern | Configured (production) | Fallback (local / demo) |
| --- | --- | --- |
| Auth | Clerk | Cookie-based dev-auth, no password |
| Database | Supabase Postgres via Drizzle | File-backed JSON store (`.data/`) |
| AI analysis | Configurable vision-capable Claude model | Deterministic heuristic engine, labelled "demo" |
| Uploads | Supabase Storage | Local handling |
| Rate limiting | Upstash Redis (optional) | Database/file-backed counting |

```bash
npm install
npm run dev          # http://localhost:3000 — fully usable in local demo mode
```

Add the matching env vars (see `.env.example`) to flip any integration to production.

---

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run typecheck` | `tsc --noEmit` (strict) |
| `npm run lint` | ESLint (next/core-web-vitals) |
| `npm run format` | Prettier write |
| `npm run test` | Vitest unit + integration tests |
| `npm run test:e2e` | Playwright flows |
| `npm run db:generate` / `db:migrate` / `db:push` | Drizzle migrations (needs `DATABASE_URL`) |
| `npm run seed` | Seed demonstration data into the active store |
| `npm run screenshots` | Capture launch screenshots via Playwright |

---

## Architecture

```
src/
  app/
    (marketing)/         Public editorial landing + how-it-works, examples, about, legal
    (auth)/              Sign-in / sign-up (Clerk or dev-auth)
    (app)/               Authenticated studio: home, new, rooms, voiceprints, audit, compare, history, settings
    r/[slug]/            Public share pages + PNG image route
    actions/             Server actions (analysis, rooms, voiceprints, audit, sharing, account, auth)
    api/webhooks/clerk/  Clerk user sync webhook
  components/
    marketing/           Landing sections (hero object, sticky interpretations, reaction map, …)
    app/                 Studio shell, composers, managers
    report/              Analysis report visualisation
    ui.tsx, brand.tsx    Design-system primitives + logo
  lib/
    ai/                  client, prompts, zod schemas, demo engine, orchestrators
    db/                  Drizzle schema + client
    store/               Store interface + FileStore + PgStore + selector
    auth.ts env.ts usage.ts validation.ts constants.ts
```

### AI layer

`lib/ai/index.ts` exposes `analyseContent`, `buildVoiceprint`, `runProfileAudit`, `compareVariants`.
Each either calls the configured Claude model (`lib/ai/client.ts`, structured output validated by Zod
with one corrective retry) or the deterministic demo engine (`lib/ai/demo.ts`). Malformed model output
is never stored as a successful analysis. The model id is read from `ANTHROPIC_MODEL` and never
hardcoded (documented default: `claude-sonnet-4-5`).

**Perception principles enforced in the system prompt:** separates observation from inference; states
assumptions; never predicts exact engagement; never diagnoses people or infers protected
characteristics; never functions as a truth detector; preserves the author's voice and values.

### Data layer

A single `Store` interface (`lib/store/interface.ts`) is satisfied by `PgStore` (Drizzle/Postgres) and
`FileStore` (local JSON). Every method is ownership-scoped by an explicit `userId` derived from the
session — never from client input. The Drizzle schema (`lib/db/schema.ts`) is the production data
model; generate migrations with `npm run db:generate`.

---

## Security & privacy

- All Anthropic calls are server-only; keys never reach the browser.
- Zod validation on every request, environment value, and model response.
- File-type + size limits on uploads (images ≤ 10 MB; text ≤ 2 MB; PNG/JPEG/WebP/TXT/MD).
- Ownership checks on every data operation.
- Analyses are private by default; share links are never auto-created and hide original content
  unless explicitly revealed; any link can be revoked.
- Delete-analysis, delete-upload, delete-account, and export-user-data are all implemented.
- Secure headers set in `next.config.mjs`; raw private content and model responses are not logged in
  production by default.

---

## Deployment

1. Provision Clerk, a Supabase Postgres database, and an Anthropic API key.
2. Set the environment variables from `.env.example`.
3. `npm run db:migrate` to apply the schema.
4. Point the Clerk webhook at `/api/webhooks/clerk` (events: `user.created`, `user.updated`,
   `user.deleted`) and set `CLERK_WEBHOOK_SECRET`.
5. `npm run build && npm run start`, or deploy to any Next.js host.

---

## Troubleshooting

- **"Setup required" / demo badges everywhere** — the relevant credential group is missing; the app
  is running on a fallback. Check `.env.example` and the capability table above.
- **History empty after an analysis (local mode)** — ensure the process can write to `.data/`.
- **Fonts fail to load at build** — `next/font` fetches Geist and Instrument Serif at build time and
  needs network access.
- **Clerk errors locally** — leave the Clerk keys unset to use dev-auth; partial Clerk config is the
  usual cause.

---

## Launch assets

- Editorial logo set + favicon: `public/launch-assets/`, `src/app/icon.svg`
- Generated OG / social image: `src/app/opengraph-image.tsx`
- Orynth submission copy: `ORYNTH_SUBMISSION.md`
- Screenshot capture script: `scripts/capture-screenshots.ts` → `public/launch-assets/`

## Honest limitations

- Live AI, Clerk, Postgres, and Supabase Storage integrations are fully wired but were built and
  verified against their fallbacks locally; they require your credentials to exercise end-to-end.
- The file-backed store is for local/demo use only (single-node); production uses Postgres.
- The public landing demo and `/examples` use pre-generated sample content, clearly labelled.
