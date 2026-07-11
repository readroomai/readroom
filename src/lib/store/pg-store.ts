import 'server-only';
import { and, desc, eq, gte, sql } from 'drizzle-orm';
import { getDb } from '@/lib/db/client';
import * as t from '@/lib/db/schema';
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
  Plan,
  AnalysisType,
  AnalysisStatus,
} from './types';
import type {
  QuickReadResult,
  CompareResult,
  ProfileAuditResult,
  VoiceprintTraits,
} from '@/lib/ai/schemas';

const iso = (d: Date | string | null): string =>
  d == null ? new Date(0).toISOString() : typeof d === 'string' ? d : d.toISOString();

function mapUser(r: typeof t.users.$inferSelect): UserRecord {
  return {
    id: r.id,
    clerkUserId: r.clerkUserId,
    email: r.email,
    displayName: r.displayName,
    avatarUrl: r.avatarUrl,
    plan: r.plan as Plan,
    onboardingCompleted: r.onboardingCompleted,
    createdAt: iso(r.createdAt),
    updatedAt: iso(r.updatedAt),
  };
}

export class PgStore implements Store {
  async upsertUser(input: {
    clerkUserId: string;
    email?: string | null;
    displayName?: string | null;
    avatarUrl?: string | null;
  }): Promise<UserRecord> {
    const db = getDb();
    const [row] = await db
      .insert(t.users)
      .values({
        clerkUserId: input.clerkUserId,
        email: input.email ?? null,
        displayName: input.displayName ?? null,
        avatarUrl: input.avatarUrl ?? null,
      })
      .onConflictDoUpdate({
        target: t.users.clerkUserId,
        set: {
          email: input.email ?? sql`${t.users.email}`,
          displayName: input.displayName ?? sql`${t.users.displayName}`,
          avatarUrl: input.avatarUrl ?? sql`${t.users.avatarUrl}`,
          updatedAt: new Date(),
        },
      })
      .returning();
    return mapUser(row);
  }

  async getUserByClerkId(clerkUserId: string): Promise<UserRecord | null> {
    const [row] = await getDb()
      .select()
      .from(t.users)
      .where(eq(t.users.clerkUserId, clerkUserId))
      .limit(1);
    return row ? mapUser(row) : null;
  }

  async setOnboardingComplete(userId: string): Promise<void> {
    await getDb()
      .update(t.users)
      .set({ onboardingCompleted: true, updatedAt: new Date() })
      .where(eq(t.users.id, userId));
  }

  async deleteUserData(userId: string): Promise<void> {
    // cascades handle children; delete the user row.
    await getDb().delete(t.users).where(eq(t.users.id, userId));
  }

  async exportUserData(userId: string): Promise<Record<string, unknown>> {
    const [user, settings, voiceprints, rooms, analyses, audits, shareLinks] = await Promise.all([
      this.getUserById(userId),
      this.getSettings(userId),
      this.listVoiceprints(userId),
      this.listRooms(userId),
      this.listAnalyses(userId),
      this.listProfileAudits(userId),
      this.listShareLinks(userId),
    ]);
    return {
      user,
      settings,
      voiceprints,
      rooms,
      analyses,
      profileAudits: audits,
      shareLinks,
      exportedAt: new Date().toISOString(),
    };
  }

  private async getUserById(userId: string): Promise<UserRecord | null> {
    const [row] = await getDb().select().from(t.users).where(eq(t.users.id, userId)).limit(1);
    return row ? mapUser(row) : null;
  }

  async getSettings(userId: string): Promise<UserSettingsRecord> {
    const db = getDb();
    const [row] = await db
      .select()
      .from(t.userSettings)
      .where(eq(t.userSettings.userId, userId))
      .limit(1);
    if (row) return this.mapSettings(row);
    const [created] = await db.insert(t.userSettings).values({ userId }).returning();
    return this.mapSettings(created);
  }

  private mapSettings(r: typeof t.userSettings.$inferSelect): UserSettingsRecord {
    return {
      userId: r.userId,
      defaultVoiceprintId: r.defaultVoiceprintId,
      defaultRoomId: r.defaultRoomId,
      appearance: r.appearance as UserSettingsRecord['appearance'],
      dataRetentionPreference: r.dataRetentionPreference as UserSettingsRecord['dataRetentionPreference'],
      createdAt: iso(r.createdAt),
      updatedAt: iso(r.updatedAt),
    };
  }

  async updateSettings(
    userId: string,
    patch: Partial<Omit<UserSettingsRecord, 'userId' | 'createdAt'>>,
  ): Promise<UserSettingsRecord> {
    await this.getSettings(userId);
    const [row] = await getDb()
      .update(t.userSettings)
      .set({ ...patch, updatedAt: new Date() })
      .where(eq(t.userSettings.userId, userId))
      .returning();
    return this.mapSettings(row);
  }

  private mapRoom(r: typeof t.audienceRooms.$inferSelect): AudienceRoomRecord {
    return {
      id: r.id,
      userId: r.userId,
      name: r.name,
      description: r.description,
      familiarity: r.familiarity,
      knowledgeLevel: r.knowledgeLevel,
      existingSentiment: r.existingSentiment,
      values: r.values,
      objections: r.objections,
      desiredReaction: r.desiredReaction,
      sensitiveTopics: r.sensitiveTopics,
      customContext: r.customContext,
      isPreset: r.isPreset,
      createdAt: iso(r.createdAt),
      updatedAt: iso(r.updatedAt),
    };
  }

  async listRooms(userId: string): Promise<AudienceRoomRecord[]> {
    const rows = await getDb()
      .select()
      .from(t.audienceRooms)
      .where(eq(t.audienceRooms.userId, userId))
      .orderBy(t.audienceRooms.createdAt);
    return rows.map((r) => this.mapRoom(r));
  }

  async getRoom(userId: string, id: string): Promise<AudienceRoomRecord | null> {
    const [row] = await getDb()
      .select()
      .from(t.audienceRooms)
      .where(and(eq(t.audienceRooms.id, id), eq(t.audienceRooms.userId, userId)))
      .limit(1);
    return row ? this.mapRoom(row) : null;
  }

  async createRoom(
    userId: string,
    input: Omit<AudienceRoomRecord, 'id' | 'userId' | 'createdAt' | 'updatedAt'>,
  ): Promise<AudienceRoomRecord> {
    const [row] = await getDb()
      .insert(t.audienceRooms)
      .values({ ...input, userId })
      .returning();
    return this.mapRoom(row);
  }

  async updateRoom(
    userId: string,
    id: string,
    patch: Partial<Omit<AudienceRoomRecord, 'id' | 'userId' | 'createdAt'>>,
  ): Promise<AudienceRoomRecord | null> {
    const [row] = await getDb()
      .update(t.audienceRooms)
      .set({ ...patch, updatedAt: new Date() })
      .where(and(eq(t.audienceRooms.id, id), eq(t.audienceRooms.userId, userId)))
      .returning();
    return row ? this.mapRoom(row) : null;
  }

  async deleteRoom(userId: string, id: string): Promise<boolean> {
    const rows = await getDb()
      .delete(t.audienceRooms)
      .where(and(eq(t.audienceRooms.id, id), eq(t.audienceRooms.userId, userId)))
      .returning({ id: t.audienceRooms.id });
    return rows.length > 0;
  }

  async ensurePresetRooms(userId: string): Promise<void> {
    const existing = await getDb()
      .select({ id: t.audienceRooms.id })
      .from(t.audienceRooms)
      .where(eq(t.audienceRooms.userId, userId))
      .limit(1);
    if (existing.length) return;
    await getDb()
      .insert(t.audienceRooms)
      .values(
        PRESET_ROOMS.map((p) => ({
          userId,
          name: p.name,
          description: p.description,
          familiarity: p.familiarity,
          knowledgeLevel: p.knowledgeLevel,
          existingSentiment: p.existingSentiment,
          values: [...p.values],
          objections: [...p.objections],
          desiredReaction: p.desiredReaction,
          sensitiveTopics: [...p.sensitiveTopics],
          isPreset: true,
        })),
      );
  }

  private mapVoiceprint(r: typeof t.voiceprints.$inferSelect): VoiceprintRecord {
    return {
      id: r.id,
      userId: r.userId,
      name: r.name,
      description: r.description,
      sourceSamples: r.sourceSamples,
      extractedTraits: r.extractedTraits as VoiceprintTraits,
      machineInstruction: r.machineInstruction,
      isDefault: r.isDefault,
      createdAt: iso(r.createdAt),
      updatedAt: iso(r.updatedAt),
    };
  }

  async listVoiceprints(userId: string): Promise<VoiceprintRecord[]> {
    const rows = await getDb()
      .select()
      .from(t.voiceprints)
      .where(eq(t.voiceprints.userId, userId))
      .orderBy(desc(t.voiceprints.isDefault), t.voiceprints.createdAt);
    return rows.map((r) => this.mapVoiceprint(r));
  }

  async getVoiceprint(userId: string, id: string): Promise<VoiceprintRecord | null> {
    const [row] = await getDb()
      .select()
      .from(t.voiceprints)
      .where(and(eq(t.voiceprints.id, id), eq(t.voiceprints.userId, userId)))
      .limit(1);
    return row ? this.mapVoiceprint(row) : null;
  }

  async createVoiceprint(
    userId: string,
    input: Omit<VoiceprintRecord, 'id' | 'userId' | 'createdAt' | 'updatedAt'>,
  ): Promise<VoiceprintRecord> {
    const db = getDb();
    const existing = await db
      .select({ id: t.voiceprints.id })
      .from(t.voiceprints)
      .where(eq(t.voiceprints.userId, userId));
    const isDefault = input.isDefault || existing.length === 0;
    if (isDefault) {
      await db
        .update(t.voiceprints)
        .set({ isDefault: false })
        .where(eq(t.voiceprints.userId, userId));
    }
    const [row] = await db
      .insert(t.voiceprints)
      .values({ ...input, userId, isDefault })
      .returning();
    return this.mapVoiceprint(row);
  }

  async updateVoiceprint(
    userId: string,
    id: string,
    patch: Partial<Omit<VoiceprintRecord, 'id' | 'userId' | 'createdAt'>>,
  ): Promise<VoiceprintRecord | null> {
    const db = getDb();
    if (patch.isDefault) {
      await db.update(t.voiceprints).set({ isDefault: false }).where(eq(t.voiceprints.userId, userId));
    }
    const [row] = await db
      .update(t.voiceprints)
      .set({ ...patch, updatedAt: new Date() })
      .where(and(eq(t.voiceprints.id, id), eq(t.voiceprints.userId, userId)))
      .returning();
    return row ? this.mapVoiceprint(row) : null;
  }

  async deleteVoiceprint(userId: string, id: string): Promise<boolean> {
    const rows = await getDb()
      .delete(t.voiceprints)
      .where(and(eq(t.voiceprints.id, id), eq(t.voiceprints.userId, userId)))
      .returning({ isDefault: t.voiceprints.isDefault });
    if (rows.length && rows[0].isDefault) {
      const [first] = await getDb()
        .select({ id: t.voiceprints.id })
        .from(t.voiceprints)
        .where(eq(t.voiceprints.userId, userId))
        .limit(1);
      if (first) {
        await getDb().update(t.voiceprints).set({ isDefault: true }).where(eq(t.voiceprints.id, first.id));
      }
    }
    return rows.length > 0;
  }

  async setDefaultVoiceprint(userId: string, id: string): Promise<void> {
    const db = getDb();
    await db.update(t.voiceprints).set({ isDefault: false }).where(eq(t.voiceprints.userId, userId));
    await db
      .update(t.voiceprints)
      .set({ isDefault: true })
      .where(and(eq(t.voiceprints.id, id), eq(t.voiceprints.userId, userId)));
  }

  private mapAnalysis(
    r: typeof t.analyses.$inferSelect,
    variants: (typeof t.analysisVariants.$inferSelect)[] = [],
  ): AnalysisRecord {
    return {
      id: r.id,
      userId: r.userId,
      analysisType: r.analysisType as AnalysisType,
      title: r.title,
      originalText: r.originalText,
      platform: r.platform,
      contentFormat: r.contentFormat,
      communicationGoal: r.communicationGoal,
      desiredTone: r.desiredTone,
      riskTolerance: r.riskTolerance,
      context: r.context,
      voiceprintId: r.voiceprintId,
      audienceRoomId: r.audienceRoomId,
      result: r.result as QuickReadResult | CompareResult,
      model: r.model,
      modelConfidence: r.modelConfidence,
      isDemo: r.isDemo,
      status: r.status as AnalysisStatus,
      isFavourite: r.isFavourite,
      variants: variants
        .sort((a, b) => a.position - b.position)
        .map((v) => ({ id: v.id, analysisId: v.analysisId, label: v.label, content: v.content, position: v.position })),
      createdAt: iso(r.createdAt),
      updatedAt: iso(r.updatedAt),
    };
  }

  async listAnalyses(userId: string, filter?: HistoryFilter): Promise<AnalysisRecord[]> {
    const conds = [eq(t.analyses.userId, userId)];
    if (filter?.platform) conds.push(eq(t.analyses.platform, filter.platform));
    if (filter?.type) conds.push(eq(t.analyses.analysisType, filter.type));
    if (filter?.roomId) conds.push(eq(t.analyses.audienceRoomId, filter.roomId));
    if (filter?.voiceprintId) conds.push(eq(t.analyses.voiceprintId, filter.voiceprintId));
    if (filter?.favouritesOnly) conds.push(eq(t.analyses.isFavourite, true));
    if (filter?.search) {
      conds.push(sql`(${t.analyses.title} ILIKE ${'%' + filter.search + '%'} OR ${t.analyses.originalText} ILIKE ${'%' + filter.search + '%'})`);
    }
    const rows = await getDb()
      .select()
      .from(t.analyses)
      .where(and(...conds))
      .orderBy(desc(t.analyses.createdAt));
    return rows.map((r) => this.mapAnalysis(r));
  }

  async getAnalysis(userId: string, id: string): Promise<AnalysisRecord | null> {
    const [row] = await getDb()
      .select()
      .from(t.analyses)
      .where(and(eq(t.analyses.id, id), eq(t.analyses.userId, userId)))
      .limit(1);
    if (!row) return null;
    const variants = await getDb()
      .select()
      .from(t.analysisVariants)
      .where(eq(t.analysisVariants.analysisId, id));
    return this.mapAnalysis(row, variants);
  }

  async getAnalysisById(id: string): Promise<AnalysisRecord | null> {
    const [row] = await getDb().select().from(t.analyses).where(eq(t.analyses.id, id)).limit(1);
    return row ? this.mapAnalysis(row) : null;
  }

  async createAnalysis(
    userId: string,
    input: Omit<AnalysisRecord, 'id' | 'userId' | 'createdAt' | 'updatedAt'>,
  ): Promise<AnalysisRecord> {
    const db = getDb();
    const [row] = await db
      .insert(t.analyses)
      .values({
        userId,
        analysisType: input.analysisType,
        title: input.title,
        originalText: input.originalText,
        platform: input.platform,
        contentFormat: input.contentFormat,
        communicationGoal: input.communicationGoal,
        desiredTone: input.desiredTone,
        riskTolerance: input.riskTolerance,
        context: input.context,
        voiceprintId: input.voiceprintId,
        audienceRoomId: input.audienceRoomId,
        result: input.result,
        model: input.model,
        modelConfidence: input.modelConfidence,
        isDemo: input.isDemo,
        status: input.status,
        isFavourite: input.isFavourite,
      })
      .returning();
    let variants: (typeof t.analysisVariants.$inferSelect)[] = [];
    if (input.variants?.length) {
      variants = await db
        .insert(t.analysisVariants)
        .values(input.variants.map((v) => ({ analysisId: row.id, label: v.label, content: v.content, position: v.position })))
        .returning();
    }
    return this.mapAnalysis(row, variants);
  }

  async updateAnalysis(
    userId: string,
    id: string,
    patch: Partial<Pick<AnalysisRecord, 'title' | 'isFavourite'>>,
  ): Promise<AnalysisRecord | null> {
    const [row] = await getDb()
      .update(t.analyses)
      .set({ ...patch, updatedAt: new Date() })
      .where(and(eq(t.analyses.id, id), eq(t.analyses.userId, userId)))
      .returning();
    return row ? this.mapAnalysis(row) : null;
  }

  async deleteAnalysis(userId: string, id: string): Promise<boolean> {
    const rows = await getDb()
      .delete(t.analyses)
      .where(and(eq(t.analyses.id, id), eq(t.analyses.userId, userId)))
      .returning({ id: t.analyses.id });
    return rows.length > 0;
  }

  private mapAudit(r: typeof t.profileAudits.$inferSelect): ProfileAuditRecord {
    return {
      id: r.id,
      userId: r.userId,
      input: r.input as Record<string, unknown>,
      result: r.result as ProfileAuditResult,
      model: r.model,
      isDemo: r.isDemo,
      status: r.status as AnalysisStatus,
      createdAt: iso(r.createdAt),
      updatedAt: iso(r.updatedAt),
    };
  }

  async listProfileAudits(userId: string): Promise<ProfileAuditRecord[]> {
    const rows = await getDb()
      .select()
      .from(t.profileAudits)
      .where(eq(t.profileAudits.userId, userId))
      .orderBy(desc(t.profileAudits.createdAt));
    return rows.map((r) => this.mapAudit(r));
  }

  async getProfileAudit(userId: string, id: string): Promise<ProfileAuditRecord | null> {
    const [row] = await getDb()
      .select()
      .from(t.profileAudits)
      .where(and(eq(t.profileAudits.id, id), eq(t.profileAudits.userId, userId)))
      .limit(1);
    return row ? this.mapAudit(row) : null;
  }

  async createProfileAudit(
    userId: string,
    input: Omit<ProfileAuditRecord, 'id' | 'userId' | 'createdAt' | 'updatedAt'>,
  ): Promise<ProfileAuditRecord> {
    const [row] = await getDb()
      .insert(t.profileAudits)
      .values({
        userId,
        input: input.input,
        result: input.result,
        model: input.model,
        isDemo: input.isDemo,
        status: input.status,
      })
      .returning();
    return this.mapAudit(row);
  }

  async deleteProfileAudit(userId: string, id: string): Promise<boolean> {
    const rows = await getDb()
      .delete(t.profileAudits)
      .where(and(eq(t.profileAudits.id, id), eq(t.profileAudits.userId, userId)))
      .returning({ id: t.profileAudits.id });
    return rows.length > 0;
  }

  private mapShare(r: typeof t.shareLinks.$inferSelect): ShareLinkRecord {
    return {
      id: r.id,
      userId: r.userId,
      analysisId: r.analysisId,
      slug: r.slug,
      showOriginalContent: r.showOriginalContent,
      isActive: r.isActive,
      expiresAt: r.expiresAt ? iso(r.expiresAt) : null,
      createdAt: iso(r.createdAt),
    };
  }

  async createShareLink(
    userId: string,
    input: { analysisId: string; showOriginalContent: boolean; expiresAt?: string | null },
  ): Promise<ShareLinkRecord> {
    const analysis = await this.getAnalysis(userId, input.analysisId);
    if (!analysis) throw new Error('Analysis not found or not owned by user.');
    const [row] = await getDb()
      .insert(t.shareLinks)
      .values({
        userId,
        analysisId: input.analysisId,
        slug: `${slugify(analysis.title).slice(0, 24) || 'read'}-${nanoid(8)}`,
        showOriginalContent: input.showOriginalContent,
        expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
      })
      .returning();
    return this.mapShare(row);
  }

  async getShareBySlug(slug: string): Promise<ShareLinkRecord | null> {
    const [row] = await getDb().select().from(t.shareLinks).where(eq(t.shareLinks.slug, slug)).limit(1);
    return row ? this.mapShare(row) : null;
  }

  async listShareLinks(userId: string, analysisId?: string): Promise<ShareLinkRecord[]> {
    const conds = [eq(t.shareLinks.userId, userId)];
    if (analysisId) conds.push(eq(t.shareLinks.analysisId, analysisId));
    const rows = await getDb()
      .select()
      .from(t.shareLinks)
      .where(and(...conds))
      .orderBy(desc(t.shareLinks.createdAt));
    return rows.map((r) => this.mapShare(r));
  }

  async revokeShareLink(userId: string, id: string): Promise<boolean> {
    const rows = await getDb()
      .update(t.shareLinks)
      .set({ isActive: false })
      .where(and(eq(t.shareLinks.id, id), eq(t.shareLinks.userId, userId)))
      .returning({ id: t.shareLinks.id });
    return rows.length > 0;
  }

  async recordUsage(
    userId: string,
    input: Omit<UsageEventRecord, 'id' | 'userId' | 'createdAt'>,
  ): Promise<void> {
    await getDb().insert(t.usageEvents).values({
      userId,
      eventType: input.eventType,
      model: input.model,
      estimatedInputTokens: input.estimatedInputTokens,
      estimatedOutputTokens: input.estimatedOutputTokens,
    });
  }

  async countUsageSince(userId: string, sinceIso: string, eventType?: string): Promise<number> {
    const conds = [eq(t.usageEvents.userId, userId), gte(t.usageEvents.createdAt, new Date(sinceIso))];
    if (eventType) conds.push(eq(t.usageEvents.eventType, eventType));
    const [row] = await getDb()
      .select({ count: sql<number>`count(*)::int` })
      .from(t.usageEvents)
      .where(and(...conds));
    return row?.count ?? 0;
  }

  async createUpload(
    userId: string,
    input: Omit<UploadRecord, 'id' | 'userId' | 'createdAt'>,
  ): Promise<UploadRecord> {
    const [row] = await getDb()
      .insert(t.uploads)
      .values({
        userId,
        storagePath: input.storagePath,
        fileName: input.fileName,
        mimeType: input.mimeType,
        byteSize: input.byteSize,
      })
      .returning();
    return {
      id: row.id,
      userId: row.userId,
      storagePath: row.storagePath,
      fileName: row.fileName,
      mimeType: row.mimeType,
      byteSize: row.byteSize,
      createdAt: iso(row.createdAt),
    };
  }

  async deleteUpload(userId: string, id: string): Promise<boolean> {
    const rows = await getDb()
      .delete(t.uploads)
      .where(and(eq(t.uploads.id, id), eq(t.uploads.userId, userId)))
      .returning({ id: t.uploads.id });
    return rows.length > 0;
  }
}
