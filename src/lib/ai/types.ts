import type {
  PlatformId,
  FormatId,
  GoalId,
  ToneId,
  RiskId,
} from '@/lib/constants';
import type { VisionImage } from '@/lib/ai/client';

export type RoomContext = {
  name: string;
  description?: string;
  familiarity?: string;
  knowledgeLevel?: string;
  existingSentiment?: string;
  values?: string[];
  objections?: string[];
  desiredReaction?: string;
  sensitiveTopics?: string[];
  customContext?: string;
};

export type VoiceContext = {
  name: string;
  machineInstruction: string;
  phrasesToPreserve?: string[];
  phrasesToAvoid?: string[];
  nonNegotiableValues?: string[];
};

export type QuickReadInput = {
  text: string;
  platform: PlatformId;
  format: FormatId;
  goal: GoalId;
  customGoal?: string;
  tone: ToneId;
  risk: RiskId;
  context?: string;
  room?: RoomContext | null;
  voice?: VoiceContext | null;
  images?: VisionImage[];
};

export type VoiceprintInput = {
  samples: string[];
  frequentPhrases?: string[];
  bannedPhrases?: string[];
  nonNegotiables?: string[];
  directness?: string;
  sentenceLength?: string;
  formattingNotes?: string;
};

export type ProfileAuditInput = {
  displayName: string;
  bio: string;
  description?: string;
  pinnedPost?: string;
  posts: string[];
  targetAudience?: string;
  desiredPositioning?: string;
  primaryCta?: string;
  images?: VisionImage[];
};

export type CompareInput = {
  variants: { label: string; content: string }[];
  platform: PlatformId;
  goal: GoalId;
  room?: RoomContext | null;
};

export type EngineMeta = {
  model: string;
  /** true when produced by the labelled deterministic demo engine (no API key). */
  demo: boolean;
  confidence: number;
  usage?: { inputTokens: number; outputTokens: number };
};
