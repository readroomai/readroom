import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { SAMPLE_RESULT } from '@/lib/sample';

// Point the file store at an isolated temp dir BEFORE importing it.
const TMP = path.join(os.tmpdir(), `readroom-test-${Date.now()}`);
process.env.READROOM_DATA_DIR = TMP;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let store: any;

beforeAll(async () => {
  const mod = await import('@/lib/store/file-store');
  store = new mod.FileStore();
});

afterAll(async () => {
  await fs.rm(TMP, { recursive: true, force: true });
});

async function makeAnalysis(userId: string, title = 'A read') {
  return store.createAnalysis(userId, {
    analysisType: 'quick_read',
    title,
    originalText: 'secret original content',
    platform: 'x',
    contentFormat: 'post',
    communicationGoal: 'authority',
    desiredTone: 'direct',
    riskTolerance: 'balanced',
    context: null,
    voiceprintId: null,
    audienceRoomId: null,
    result: SAMPLE_RESULT,
    model: 'test',
    modelConfidence: 0.6,
    isDemo: true,
    status: 'complete',
    isFavourite: false,
  });
}

describe('FileStore integration', () => {
  it('upserts a user idempotently by clerk id', async () => {
    const a = await store.upsertUser({ clerkUserId: 'clerk_1', email: 'a@x.com' });
    const b = await store.upsertUser({ clerkUserId: 'clerk_1', displayName: 'Renamed' });
    expect(a.id).toBe(b.id);
    expect(b.displayName).toBe('Renamed');
  });

  it('scopes analyses by owner', async () => {
    const u1 = await store.upsertUser({ clerkUserId: 'owner_1' });
    const u2 = await store.upsertUser({ clerkUserId: 'owner_2' });
    const analysis = await makeAnalysis(u1.id);
    expect(await store.getAnalysis(u1.id, analysis.id)).not.toBeNull();
    // wrong owner cannot read it
    expect(await store.getAnalysis(u2.id, analysis.id)).toBeNull();
  });

  it('records and counts usage within a window', async () => {
    const u = await store.upsertUser({ clerkUserId: 'usage_1' });
    await store.recordUsage(u.id, { eventType: 'analysis', model: 'test', estimatedInputTokens: 0, estimatedOutputTokens: 0 });
    await store.recordUsage(u.id, { eventType: 'analysis', model: 'test', estimatedInputTokens: 0, estimatedOutputTokens: 0 });
    const since = new Date(Date.now() - 60_000).toISOString();
    expect(await store.countUsageSince(u.id, since, 'analysis')).toBe(2);
  });

  it('creates share links private by default and revokes them', async () => {
    const u = await store.upsertUser({ clerkUserId: 'share_1' });
    const analysis = await makeAnalysis(u.id, 'Shareable');
    const link = await store.createShareLink(u.id, { analysisId: analysis.id, showOriginalContent: false });
    expect(link.isActive).toBe(true);
    expect(link.showOriginalContent).toBe(false); // original content hidden by default

    const bySlug = await store.getShareBySlug(link.slug);
    expect(bySlug?.analysisId).toBe(analysis.id);

    await store.revokeShareLink(u.id, link.id);
    const revoked = await store.getShareBySlug(link.slug);
    expect(revoked?.isActive).toBe(false);
  });

  it('will not create a share link for content you do not own', async () => {
    const owner = await store.upsertUser({ clerkUserId: 'own_a' });
    const stranger = await store.upsertUser({ clerkUserId: 'own_b' });
    const analysis = await makeAnalysis(owner.id);
    await expect(
      store.createShareLink(stranger.id, { analysisId: analysis.id, showOriginalContent: true }),
    ).rejects.toThrow();
  });

  it('deletes analyses and cascades their share links', async () => {
    const u = await store.upsertUser({ clerkUserId: 'del_1' });
    const analysis = await makeAnalysis(u.id);
    const link = await store.createShareLink(u.id, { analysisId: analysis.id, showOriginalContent: false });
    await store.deleteAnalysis(u.id, analysis.id);
    expect(await store.getAnalysis(u.id, analysis.id)).toBeNull();
    expect(await store.getShareBySlug(link.slug)).toBeNull();
  });

  it('seeds preset rooms once', async () => {
    const u = await store.upsertUser({ clerkUserId: 'rooms_1' });
    await store.ensurePresetRooms(u.id);
    await store.ensurePresetRooms(u.id); // idempotent
    const rooms = await store.listRooms(u.id);
    expect(rooms.length).toBeGreaterThanOrEqual(5);
    expect(rooms.every((r: { isPreset: boolean }) => r.isPreset)).toBe(true);
  });
});
