import 'server-only';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { nanoid, slugify } from '@/lib/utils';
import { PRESET_ROOMS } from '@/lib/constants';
import type { Store, HistoryFilter } from './interface';
import type {
  UserRecord,
  VoiceprintRecord,
  AudienceRoomRecord,
  AnalysisRecord,
  ProfileAuditRecord,
  ShareLinkRecord,
  UsageEventRecord,
  UserSettingsRecord,
  UploadRecord,
} from './types';

type DB = {
  users: UserRecord[];
  voiceprints: VoiceprintRecord[];
  rooms: AudienceRoomRecord[];
  analyses: AnalysisRecord[];
  profileAudits: ProfileAuditRecord[];
  shareLinks: ShareLinkRecord[];
  usageEvents: UsageEventRecord[];
  settings: UserSettingsRecord[];
  uploads: UploadRecord[];
};

const EMPTY: DB = {
  users: [],
  voiceprints: [],
  rooms: [],
  analyses: [],
  profileAudits: [],
  shareLinks: [],
  usageEvents: [],
  settings: [],
  uploads: [],
};

const DATA_DIR = process.env.READROOM_DATA_DIR || path.join(process.cwd(), '.data');
const DATA_FILE = path.join(DATA_DIR, 'readroom.json');

/**
 * The store is intentionally cache-free. Next.js can bundle a module more than
 * once (server-action layer vs. RSC layer), so a long-lived in-memory cache in
 * one instance would clobber another instance's committed writes on the next
 * full-file overwrite. Instead every read loads the latest file, and every
 * mutation runs a serialized read-modify-write so concurrent writes don't lose
 * data. Production uses Postgres (PgStore) and does not hit this path.
 */

let writeChain: Promise<unknown> = Promise.resolve();

async function readDb(): Promise<DB> {
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf8');
    return { ...structuredClone(EMPTY), ...JSON.parse(raw) };
  } catch {
    return structuredClone(EMPTY);
  }
}

/** Read-only snapshot loaded fresh from disk. */
async function load(): Promise<DB> {
  return readDb();
}

/** Serialized read-modify-write. The callback receives the latest disk state. */
async function mutate<T>(fn: (db: DB) => T): Promise<T> {
  const run = writeChain.then(async () => {
    const db = await readDb();
    const result = fn(db);
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(DATA_FILE, JSON.stringify(db, null, 2), 'utf8');
    return result;
  });
  // keep the chain alive but don't let a rejection poison future writes
  writeChain = run.catch(() => undefined);
  return run;
}

function now(): string {
  return new Date().toISOString();
}

export class FileStore implements Store {
  async upsertUser(input: {
    clerkUserId: string;
    email?: string | null;
    displayName?: string | null;
    avatarUrl?: string | null;
  }): Promise<UserRecord> {
    return mutate((db) => {
      let user = db.users.find((u) => u.clerkUserId === input.clerkUserId);
      if (user) {
        user.email = input.email ?? user.email;
        user.displayName = input.displayName ?? user.displayName;
        user.avatarUrl = input.avatarUrl ?? user.avatarUrl;
        user.updatedAt = now();
      } else {
        user = {
          id: nanoid(),
          clerkUserId: input.clerkUserId,
          email: input.email ?? null,
          displayName: input.displayName ?? null,
          avatarUrl: input.avatarUrl ?? null,
          plan: 'beta',
          onboardingCompleted: false,
          createdAt: now(),
          updatedAt: now(),
        };
        db.users.push(user);
      }
      return { ...user };
    });
  }

  async getUserByClerkId(clerkUserId: string): Promise<UserRecord | null> {
    const db = await load();
    const u = db.users.find((x) => x.clerkUserId === clerkUserId);
    return u ? { ...u } : null;
  }

  async setOnboardingComplete(userId: string): Promise<void> {
    await mutate((db) => {
      const u = db.users.find((x) => x.id === userId);
      if (u) {
        u.onboardingCompleted = true;
        u.updatedAt = now();
      }
    });
  }

  async deleteUserData(userId: string): Promise<void> {
    await mutate((db) => {
      db.voiceprints = db.voiceprints.filter((x) => x.userId !== userId);
      db.rooms = db.rooms.filter((x) => x.userId !== userId);
      db.analyses = db.analyses.filter((x) => x.userId !== userId);
      db.profileAudits = db.profileAudits.filter((x) => x.userId !== userId);
      db.shareLinks = db.shareLinks.filter((x) => x.userId !== userId);
      db.usageEvents = db.usageEvents.filter((x) => x.userId !== userId);
      db.settings = db.settings.filter((x) => x.userId !== userId);
      db.uploads = db.uploads.filter((x) => x.userId !== userId);
      db.users = db.users.filter((x) => x.id !== userId);
    });
  }

  async exportUserData(userId: string): Promise<Record<string, unknown>> {
    const db = await load();
    return {
      user: db.users.find((x) => x.id === userId) ?? null,
      settings: db.settings.find((x) => x.userId === userId) ?? null,
      voiceprints: db.voiceprints.filter((x) => x.userId === userId),
      rooms: db.rooms.filter((x) => x.userId === userId),
      analyses: db.analyses.filter((x) => x.userId === userId),
      profileAudits: db.profileAudits.filter((x) => x.userId === userId),
      shareLinks: db.shareLinks.filter((x) => x.userId === userId),
      exportedAt: now(),
    };
  }

  async getSettings(userId: string): Promise<UserSettingsRecord> {
    const db = await load();
    const existing = db.settings.find((x) => x.userId === userId);
    if (existing) return { ...existing };
    return mutate((d) => {
      let s = d.settings.find((x) => x.userId === userId);
      if (!s) {
        s = {
          userId,
          defaultVoiceprintId: null,
          defaultRoomId: null,
          appearance: 'system',
          dataRetentionPreference: 'keep',
          createdAt: now(),
          updatedAt: now(),
        };
        d.settings.push(s);
      }
      return { ...s };
    });
  }

  async updateSettings(
    userId: string,
    patch: Partial<Omit<UserSettingsRecord, 'userId' | 'createdAt'>>,
  ): Promise<UserSettingsRecord> {
    return mutate((db) => {
      let s = db.settings.find((x) => x.userId === userId);
      if (!s) {
        s = {
          userId,
          defaultVoiceprintId: null,
          defaultRoomId: null,
          appearance: 'system',
          dataRetentionPreference: 'keep',
          createdAt: now(),
          updatedAt: now(),
        };
        db.settings.push(s);
      }
      Object.assign(s, patch, { updatedAt: now() });
      return { ...s };
    });
  }

  async listRooms(userId: string): Promise<AudienceRoomRecord[]> {
    const db = await load();
    return db.rooms
      .filter((x) => x.userId === userId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      .map((x) => ({ ...x }));
  }

  async getRoom(userId: string, id: string): Promise<AudienceRoomRecord | null> {
    const db = await load();
    const r = db.rooms.find((x) => x.id === id && x.userId === userId);
    return r ? { ...r } : null;
  }

  async createRoom(
    userId: string,
    input: Omit<AudienceRoomRecord, 'id' | 'userId' | 'createdAt' | 'updatedAt'>,
  ): Promise<AudienceRoomRecord> {
    return mutate((db) => {
      const room: AudienceRoomRecord = { ...input, id: nanoid(), userId, createdAt: now(), updatedAt: now() };
      db.rooms.push(room);
      return { ...room };
    });
  }

  async updateRoom(
    userId: string,
    id: string,
    patch: Partial<Omit<AudienceRoomRecord, 'id' | 'userId' | 'createdAt'>>,
  ): Promise<AudienceRoomRecord | null> {
    return mutate((db) => {
      const r = db.rooms.find((x) => x.id === id && x.userId === userId);
      if (!r) return null;
      Object.assign(r, patch, { updatedAt: now() });
      return { ...r };
    });
  }

  async deleteRoom(userId: string, id: string): Promise<boolean> {
    return mutate((db) => {
      const before = db.rooms.length;
      db.rooms = db.rooms.filter((x) => !(x.id === id && x.userId === userId));
      return db.rooms.length !== before;
    });
  }

  async ensurePresetRooms(userId: string): Promise<void> {
    const db = await load();
    if (db.rooms.some((x) => x.userId === userId)) return;
    await mutate((d) => {
      if (d.rooms.some((x) => x.userId === userId)) return;
      for (const preset of PRESET_ROOMS) {
        d.rooms.push({
          id: nanoid(),
          userId,
          name: preset.name,
          description: preset.description,
          familiarity: preset.familiarity,
          knowledgeLevel: preset.knowledgeLevel,
          existingSentiment: preset.existingSentiment,
          values: [...preset.values],
          objections: [...preset.objections],
          desiredReaction: preset.desiredReaction,
          sensitiveTopics: [...preset.sensitiveTopics],
          customContext: null,
          isPreset: true,
          createdAt: now(),
          updatedAt: now(),
        });
      }
    });
  }

  async listVoiceprints(userId: string): Promise<VoiceprintRecord[]> {
    const db = await load();
    return db.voiceprints
      .filter((x) => x.userId === userId)
      .sort((a, b) => Number(b.isDefault) - Number(a.isDefault) || a.createdAt.localeCompare(b.createdAt))
      .map((x) => ({ ...x }));
  }

  async getVoiceprint(userId: string, id: string): Promise<VoiceprintRecord | null> {
    const db = await load();
    const v = db.voiceprints.find((x) => x.id === id && x.userId === userId);
    return v ? { ...v } : null;
  }

  async createVoiceprint(
    userId: string,
    input: Omit<VoiceprintRecord, 'id' | 'userId' | 'createdAt' | 'updatedAt'>,
  ): Promise<VoiceprintRecord> {
    return mutate((db) => {
      const existing = db.voiceprints.filter((x) => x.userId === userId);
      const isDefault = input.isDefault || existing.length === 0;
      if (isDefault) existing.forEach((x) => (x.isDefault = false));
      const v: VoiceprintRecord = { ...input, isDefault, id: nanoid(), userId, createdAt: now(), updatedAt: now() };
      db.voiceprints.push(v);
      return { ...v };
    });
  }

  async updateVoiceprint(
    userId: string,
    id: string,
    patch: Partial<Omit<VoiceprintRecord, 'id' | 'userId' | 'createdAt'>>,
  ): Promise<VoiceprintRecord | null> {
    return mutate((db) => {
      const v = db.voiceprints.find((x) => x.id === id && x.userId === userId);
      if (!v) return null;
      if (patch.isDefault) db.voiceprints.filter((x) => x.userId === userId).forEach((x) => (x.isDefault = false));
      Object.assign(v, patch, { updatedAt: now() });
      return { ...v };
    });
  }

  async deleteVoiceprint(userId: string, id: string): Promise<boolean> {
    return mutate((db) => {
      const before = db.voiceprints.length;
      const wasDefault = db.voiceprints.find((x) => x.id === id && x.userId === userId)?.isDefault;
      db.voiceprints = db.voiceprints.filter((x) => !(x.id === id && x.userId === userId));
      const changed = db.voiceprints.length !== before;
      if (changed && wasDefault) {
        const first = db.voiceprints.find((x) => x.userId === userId);
        if (first) first.isDefault = true;
      }
      return changed;
    });
  }

  async setDefaultVoiceprint(userId: string, id: string): Promise<void> {
    await mutate((db) => {
      const mine = db.voiceprints.filter((x) => x.userId === userId);
      mine.forEach((x) => (x.isDefault = x.id === id));
    });
  }

  async listAnalyses(userId: string, filter?: HistoryFilter): Promise<AnalysisRecord[]> {
    const db = await load();
    let rows = db.analyses.filter((x) => x.userId === userId);
    if (filter?.platform) rows = rows.filter((x) => x.platform === filter.platform);
    if (filter?.type) rows = rows.filter((x) => x.analysisType === filter.type);
    if (filter?.roomId) rows = rows.filter((x) => x.audienceRoomId === filter.roomId);
    if (filter?.voiceprintId) rows = rows.filter((x) => x.voiceprintId === filter.voiceprintId);
    if (filter?.favouritesOnly) rows = rows.filter((x) => x.isFavourite);
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      rows = rows.filter(
        (x) => x.title.toLowerCase().includes(q) || x.originalText.toLowerCase().includes(q),
      );
    }
    return rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map((x) => ({ ...x }));
  }

  async getAnalysis(userId: string, id: string): Promise<AnalysisRecord | null> {
    const db = await load();
    const a = db.analyses.find((x) => x.id === id && x.userId === userId);
    return a ? { ...a } : null;
  }

  async getAnalysisById(id: string): Promise<AnalysisRecord | null> {
    const db = await load();
    const a = db.analyses.find((x) => x.id === id);
    return a ? { ...a } : null;
  }

  async createAnalysis(
    userId: string,
    input: Omit<AnalysisRecord, 'id' | 'userId' | 'createdAt' | 'updatedAt'>,
  ): Promise<AnalysisRecord> {
    return mutate((db) => {
      const a: AnalysisRecord = { ...input, id: nanoid(), userId, createdAt: now(), updatedAt: now() };
      db.analyses.push(a);
      return { ...a };
    });
  }

  async updateAnalysis(
    userId: string,
    id: string,
    patch: Partial<Pick<AnalysisRecord, 'title' | 'isFavourite'>>,
  ): Promise<AnalysisRecord | null> {
    return mutate((db) => {
      const a = db.analyses.find((x) => x.id === id && x.userId === userId);
      if (!a) return null;
      Object.assign(a, patch, { updatedAt: now() });
      return { ...a };
    });
  }

  async deleteAnalysis(userId: string, id: string): Promise<boolean> {
    return mutate((db) => {
      const before = db.analyses.length;
      db.analyses = db.analyses.filter((x) => !(x.id === id && x.userId === userId));
      db.shareLinks = db.shareLinks.filter((x) => x.analysisId !== id);
      return db.analyses.length !== before;
    });
  }

  async listProfileAudits(userId: string): Promise<ProfileAuditRecord[]> {
    const db = await load();
    return db.profileAudits
      .filter((x) => x.userId === userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map((x) => ({ ...x }));
  }

  async getProfileAudit(userId: string, id: string): Promise<ProfileAuditRecord | null> {
    const db = await load();
    const a = db.profileAudits.find((x) => x.id === id && x.userId === userId);
    return a ? { ...a } : null;
  }

  async createProfileAudit(
    userId: string,
    input: Omit<ProfileAuditRecord, 'id' | 'userId' | 'createdAt' | 'updatedAt'>,
  ): Promise<ProfileAuditRecord> {
    return mutate((db) => {
      const a: ProfileAuditRecord = { ...input, id: nanoid(), userId, createdAt: now(), updatedAt: now() };
      db.profileAudits.push(a);
      return { ...a };
    });
  }

  async deleteProfileAudit(userId: string, id: string): Promise<boolean> {
    return mutate((db) => {
      const before = db.profileAudits.length;
      db.profileAudits = db.profileAudits.filter((x) => !(x.id === id && x.userId === userId));
      return db.profileAudits.length !== before;
    });
  }

  async createShareLink(
    userId: string,
    input: { analysisId: string; showOriginalContent: boolean; expiresAt?: string | null },
  ): Promise<ShareLinkRecord> {
    return mutate((db) => {
      const analysis = db.analyses.find((x) => x.id === input.analysisId && x.userId === userId);
      if (!analysis) throw new Error('Analysis not found or not owned by user.');
      const link: ShareLinkRecord = {
        id: nanoid(),
        userId,
        analysisId: input.analysisId,
        slug: `${slugify(analysis.title).slice(0, 24) || 'read'}-${nanoid(8)}`,
        showOriginalContent: input.showOriginalContent,
        isActive: true,
        expiresAt: input.expiresAt ?? null,
        createdAt: now(),
      };
      db.shareLinks.push(link);
      return { ...link };
    });
  }

  async getShareBySlug(slug: string): Promise<ShareLinkRecord | null> {
    const db = await load();
    const s = db.shareLinks.find((x) => x.slug === slug);
    return s ? { ...s } : null;
  }

  async listShareLinks(userId: string, analysisId?: string): Promise<ShareLinkRecord[]> {
    const db = await load();
    return db.shareLinks
      .filter((x) => x.userId === userId && (!analysisId || x.analysisId === analysisId))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map((x) => ({ ...x }));
  }

  async revokeShareLink(userId: string, id: string): Promise<boolean> {
    return mutate((db) => {
      const s = db.shareLinks.find((x) => x.id === id && x.userId === userId);
      if (!s) return false;
      s.isActive = false;
      return true;
    });
  }

  async recordUsage(
    userId: string,
    input: Omit<UsageEventRecord, 'id' | 'userId' | 'createdAt'>,
  ): Promise<void> {
    await mutate((db) => {
      db.usageEvents.push({ ...input, id: nanoid(), userId, createdAt: now() });
    });
  }

  async countUsageSince(userId: string, sinceIso: string, eventType?: string): Promise<number> {
    const db = await load();
    return db.usageEvents.filter(
      (x) => x.userId === userId && x.createdAt >= sinceIso && (!eventType || x.eventType === eventType),
    ).length;
  }

  async createUpload(
    userId: string,
    input: Omit<UploadRecord, 'id' | 'userId' | 'createdAt'>,
  ): Promise<UploadRecord> {
    return mutate((db) => {
      const u: UploadRecord = { ...input, id: nanoid(), userId, createdAt: now() };
      db.uploads.push(u);
      return { ...u };
    });
  }

  async deleteUpload(userId: string, id: string): Promise<boolean> {
    return mutate((db) => {
      const before = db.uploads.length;
      db.uploads = db.uploads.filter((x) => !(x.id === id && x.userId === userId));
      return db.uploads.length !== before;
    });
  }
}
