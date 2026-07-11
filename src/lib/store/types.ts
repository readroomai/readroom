import type {
  QuickReadResult,
  VoiceprintTraits,
  ProfileAuditResult,
  CompareResult,
} from '@/lib/ai/schemas';

export type Plan = 'beta' | 'pro';
export type AnalysisType = 'quick_read' | 'compare';
export type AnalysisStatus = 'complete' | 'failed';

export interface UserRecord {
  id: string;
  clerkUserId: string;
  email: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  plan: Plan;
  onboardingCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VoiceprintRecord {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  sourceSamples: string[];
  extractedTraits: VoiceprintTraits;
  machineInstruction: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AudienceRoomRecord {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  familiarity: string | null;
  knowledgeLevel: string | null;
  existingSentiment: string | null;
  values: string[];
  objections: string[];
  desiredReaction: string | null;
  sensitiveTopics: string[];
  customContext: string | null;
  isPreset: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AnalysisVariantRecord {
  id: string;
  analysisId: string;
  label: string;
  content: string;
  position: number;
}

export interface AnalysisRecord {
  id: string;
  userId: string;
  analysisType: AnalysisType;
  title: string;
  originalText: string;
  platform: string;
  contentFormat: string | null;
  communicationGoal: string | null;
  desiredTone: string | null;
  riskTolerance: string | null;
  context: string | null;
  voiceprintId: string | null;
  audienceRoomId: string | null;
  result: QuickReadResult | CompareResult;
  model: string;
  modelConfidence: number;
  isDemo: boolean;
  status: AnalysisStatus;
  isFavourite: boolean;
  variants?: AnalysisVariantRecord[];
  createdAt: string;
  updatedAt: string;
}

export interface ProfileAuditRecord {
  id: string;
  userId: string;
  input: Record<string, unknown>;
  result: ProfileAuditResult;
  model: string;
  isDemo: boolean;
  status: AnalysisStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ShareLinkRecord {
  id: string;
  userId: string;
  analysisId: string;
  slug: string;
  showOriginalContent: boolean;
  isActive: boolean;
  expiresAt: string | null;
  createdAt: string;
}

export interface UsageEventRecord {
  id: string;
  userId: string;
  eventType: string;
  model: string;
  estimatedInputTokens: number;
  estimatedOutputTokens: number;
  createdAt: string;
}

export interface UserSettingsRecord {
  userId: string;
  defaultVoiceprintId: string | null;
  defaultRoomId: string | null;
  appearance: 'light' | 'dark' | 'system';
  dataRetentionPreference: 'keep' | 'auto_delete_30d';
  createdAt: string;
  updatedAt: string;
}

export interface UploadRecord {
  id: string;
  userId: string;
  storagePath: string;
  fileName: string;
  mimeType: string;
  byteSize: number;
  createdAt: string;
}
