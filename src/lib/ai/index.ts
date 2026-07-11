import 'server-only';
import { capabilities, env } from '@/lib/env';
import { runStructured } from '@/lib/ai/client';
import {
  quickReadSchema,
  voiceprintTraitsSchema,
  profileAuditSchema,
  compareSchema,
  type QuickReadResult,
  type VoiceprintTraits,
  type ProfileAuditResult,
  type CompareResult,
} from '@/lib/ai/schemas';
import {
  PERCEPTION_SYSTEM,
  VOICEPRINT_SYSTEM,
  PROFILE_SYSTEM,
  COMPARE_SYSTEM,
  buildQuickReadUser,
  buildVoiceprintUser,
  buildProfileAuditUser,
  buildCompareUser,
} from '@/lib/ai/prompts';
import {
  demoQuickRead,
  demoVoiceprint,
  demoProfileAudit,
  demoCompare,
} from '@/lib/ai/demo';
import type {
  QuickReadInput,
  VoiceprintInput,
  ProfileAuditInput,
  CompareInput,
  EngineMeta,
} from '@/lib/ai/types';

const DEMO_MODEL = 'readroom-demo-engine';

export async function analyseContent(
  input: QuickReadInput,
): Promise<{ result: QuickReadResult; meta: EngineMeta }> {
  if (!capabilities.anthropic) {
    const result = quickReadSchema.parse(demoQuickRead(input));
    return { result, meta: { model: DEMO_MODEL, demo: true, confidence: result.confidence } };
  }
  const { data, model, usage } = await runStructured({
    system: PERCEPTION_SYSTEM,
    user: buildQuickReadUser(input),
    schema: quickReadSchema,
    images: input.images,
    maxTokens: 4096,
    temperature: input.risk === 'bold' ? 0.75 : 0.55,
  });
  return { result: data, meta: { model, demo: false, confidence: data.confidence, usage } };
}

export async function buildVoiceprint(
  input: VoiceprintInput,
): Promise<{ result: VoiceprintTraits; meta: EngineMeta }> {
  if (!capabilities.anthropic) {
    const result = voiceprintTraitsSchema.parse(demoVoiceprint(input));
    return { result, meta: { model: DEMO_MODEL, demo: true, confidence: 0.5 } };
  }
  const { data, model, usage } = await runStructured({
    system: VOICEPRINT_SYSTEM,
    user: buildVoiceprintUser(input),
    schema: voiceprintTraitsSchema,
    maxTokens: 2600,
    temperature: 0.4,
  });
  return { result: data, meta: { model, demo: false, confidence: 0.7, usage } };
}

export async function runProfileAudit(
  input: ProfileAuditInput,
): Promise<{ result: ProfileAuditResult; meta: EngineMeta }> {
  if (!capabilities.anthropic) {
    const result = profileAuditSchema.parse(demoProfileAudit(input));
    return { result, meta: { model: DEMO_MODEL, demo: true, confidence: result.confidence } };
  }
  const { data, model, usage } = await runStructured({
    system: PROFILE_SYSTEM,
    user: buildProfileAuditUser(input),
    schema: profileAuditSchema,
    images: input.images,
    maxTokens: 3200,
    temperature: 0.5,
  });
  return { result: data, meta: { model, demo: false, confidence: data.confidence, usage } };
}

export async function compareVariants(
  input: CompareInput,
): Promise<{ result: CompareResult; meta: EngineMeta }> {
  if (!capabilities.anthropic) {
    const result = compareSchema.parse(demoCompare(input));
    return { result, meta: { model: DEMO_MODEL, demo: true, confidence: result.confidence } };
  }
  const { data, model, usage } = await runStructured({
    system: COMPARE_SYSTEM,
    user: buildCompareUser(input),
    schema: compareSchema,
    maxTokens: 3000,
    temperature: 0.5,
  });
  return { result: data, meta: { model, demo: false, confidence: data.confidence, usage } };
}

export function activeModelLabel(): string {
  return capabilities.anthropic ? env.anthropic.model : `${DEMO_MODEL} (local)`;
}
