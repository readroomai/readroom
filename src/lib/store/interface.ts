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

export interface HistoryFilter {
  search?: string;
  platform?: string;
  type?: string;
  roomId?: string;
  voiceprintId?: string;
  favouritesOnly?: boolean;
}

/**
 * The single data contract used by every server action and route.
 * Two implementations satisfy it: a file-backed store for local/demo use
 * (no DATABASE_URL) and a Drizzle/Postgres store for production.
 * Every method takes an explicit userId for ownership scoping — the caller
 * derives it from the authenticated session, never from client input.
 */
export interface Store {
  upsertUser(input: {
    clerkUserId: string;
    email?: string | null;
    displayName?: string | null;
    avatarUrl?: string | null;
  }): Promise<UserRecord>;
  getUserByClerkId(clerkUserId: string): Promise<UserRecord | null>;
  setOnboardingComplete(userId: string): Promise<void>;
  deleteUserData(userId: string): Promise<void>;
  exportUserData(userId: string): Promise<Record<string, unknown>>;

  getSettings(userId: string): Promise<UserSettingsRecord>;
  updateSettings(
    userId: string,
    patch: Partial<Omit<UserSettingsRecord, 'userId' | 'createdAt'>>,
  ): Promise<UserSettingsRecord>;

  listRooms(userId: string): Promise<AudienceRoomRecord[]>;
  getRoom(userId: string, id: string): Promise<AudienceRoomRecord | null>;
  createRoom(
    userId: string,
    input: Omit<AudienceRoomRecord, 'id' | 'userId' | 'createdAt' | 'updatedAt'>,
  ): Promise<AudienceRoomRecord>;
  updateRoom(
    userId: string,
    id: string,
    patch: Partial<Omit<AudienceRoomRecord, 'id' | 'userId' | 'createdAt'>>,
  ): Promise<AudienceRoomRecord | null>;
  deleteRoom(userId: string, id: string): Promise<boolean>;
  ensurePresetRooms(userId: string): Promise<void>;

  listVoiceprints(userId: string): Promise<VoiceprintRecord[]>;
  getVoiceprint(userId: string, id: string): Promise<VoiceprintRecord | null>;
  createVoiceprint(
    userId: string,
    input: Omit<VoiceprintRecord, 'id' | 'userId' | 'createdAt' | 'updatedAt'>,
  ): Promise<VoiceprintRecord>;
  updateVoiceprint(
    userId: string,
    id: string,
    patch: Partial<Omit<VoiceprintRecord, 'id' | 'userId' | 'createdAt'>>,
  ): Promise<VoiceprintRecord | null>;
  deleteVoiceprint(userId: string, id: string): Promise<boolean>;
  setDefaultVoiceprint(userId: string, id: string): Promise<void>;

  listAnalyses(userId: string, filter?: HistoryFilter): Promise<AnalysisRecord[]>;
  getAnalysis(userId: string, id: string): Promise<AnalysisRecord | null>;
  getAnalysisById(id: string): Promise<AnalysisRecord | null>;
  createAnalysis(
    userId: string,
    input: Omit<AnalysisRecord, 'id' | 'userId' | 'createdAt' | 'updatedAt'>,
  ): Promise<AnalysisRecord>;
  updateAnalysis(
    userId: string,
    id: string,
    patch: Partial<Pick<AnalysisRecord, 'title' | 'isFavourite'>>,
  ): Promise<AnalysisRecord | null>;
  deleteAnalysis(userId: string, id: string): Promise<boolean>;

  listProfileAudits(userId: string): Promise<ProfileAuditRecord[]>;
  getProfileAudit(userId: string, id: string): Promise<ProfileAuditRecord | null>;
  createProfileAudit(
    userId: string,
    input: Omit<ProfileAuditRecord, 'id' | 'userId' | 'createdAt' | 'updatedAt'>,
  ): Promise<ProfileAuditRecord>;
  deleteProfileAudit(userId: string, id: string): Promise<boolean>;

  createShareLink(
    userId: string,
    input: { analysisId: string; showOriginalContent: boolean; expiresAt?: string | null },
  ): Promise<ShareLinkRecord>;
  getShareBySlug(slug: string): Promise<ShareLinkRecord | null>;
  listShareLinks(userId: string, analysisId?: string): Promise<ShareLinkRecord[]>;
  revokeShareLink(userId: string, id: string): Promise<boolean>;

  recordUsage(
    userId: string,
    input: Omit<UsageEventRecord, 'id' | 'userId' | 'createdAt'>,
  ): Promise<void>;
  countUsageSince(userId: string, sinceIso: string, eventType?: string): Promise<number>;

  createUpload(
    userId: string,
    input: Omit<UploadRecord, 'id' | 'userId' | 'createdAt'>,
  ): Promise<UploadRecord>;
  deleteUpload(userId: string, id: string): Promise<boolean>;
}
