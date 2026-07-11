/**
 * Seeds demonstration data into the local file-backed store (.data/readroom.json).
 *
 * Uses the pure demo engine to generate realistic, schema-valid analyses so the
 * seeded content is indistinguishable in shape from live output — but clearly
 * marked as demo. For Postgres, seed by running the app; this targets local dev.
 *
 *   npm run seed
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { nanoid } from '../src/lib/utils';
import { PRESET_ROOMS } from '../src/lib/constants';
import { demoQuickRead, demoVoiceprint } from '../src/lib/ai/demo';
import { quickReadSchema, voiceprintTraitsSchema } from '../src/lib/ai/schemas';
import type { QuickReadInput } from '../src/lib/ai/types';

const DATA_DIR = process.env.READROOM_DATA_DIR || path.join(process.cwd(), '.data');
const DATA_FILE = path.join(DATA_DIR, 'readroom.json');

const now = () => new Date().toISOString();

const SAMPLES: { title: string; input: QuickReadInput }[] = [
  {
    title: 'Seed round announcement',
    input: {
      text: "We're not raising to extend runway. 4,000 people use this every single day and we can't ship fast enough for them. Funding stops being survival and starts being fuel.",
      platform: 'x',
      format: 'announcement',
      goal: 'authority',
      tone: 'direct',
      risk: 'balanced',
    },
  },
  {
    title: 'Small audience take',
    input: {
      text: 'Everyone says you need a huge audience to make money online. That is wrong. I made $12k last month from 900 email subscribers who actually trust me.',
      platform: 'linkedin',
      format: 'post',
      goal: 'trust',
      tone: 'authoritative',
      risk: 'bold',
    },
  },
  {
    title: 'Quiet product update',
    input: {
      text: "Shipped a quiet update today. No fanfare — just fixed the three things you told us were annoying. Thanks for telling us.",
      platform: 'x',
      format: 'post',
      goal: 'trust',
      tone: 'warm',
      risk: 'low',
    },
  },
];

async function main() {
  const userId = nanoid();
  const rooms = PRESET_ROOMS.map((p) => ({
    id: nanoid(),
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
    customContext: null,
    isPreset: true,
    createdAt: now(),
    updatedAt: now(),
  }));

  const voiceTraits = voiceprintTraitsSchema.parse(
    demoVoiceprint({ samples: ['I ship small. Often. It compounds. No hype, just receipts.'] }),
  );
  const voiceprints = [
    {
      id: nanoid(),
      userId,
      name: 'My X voice',
      description: voiceTraits.summary.slice(0, 200),
      sourceSamples: ['I ship small. Often. It compounds. No hype, just receipts.'],
      extractedTraits: voiceTraits,
      machineInstruction: voiceTraits.machineInstruction,
      isDefault: true,
      createdAt: now(),
      updatedAt: now(),
    },
  ];

  const analyses = SAMPLES.map((s, i) => {
    const result = quickReadSchema.parse(demoQuickRead(s.input));
    return {
      id: nanoid(),
      userId,
      analysisType: 'quick_read' as const,
      title: s.title,
      originalText: s.input.text,
      platform: s.input.platform,
      contentFormat: s.input.format,
      communicationGoal: 'authority',
      desiredTone: s.input.tone,
      riskTolerance: s.input.risk,
      context: null,
      voiceprintId: null,
      audienceRoomId: rooms[i % rooms.length].id,
      result,
      model: 'readroom-demo-engine',
      modelConfidence: result.confidence,
      isDemo: true,
      status: 'complete' as const,
      isFavourite: i === 0,
      createdAt: new Date(Date.now() - i * 3600_000).toISOString(),
      updatedAt: now(),
    };
  });

  const db = {
    users: [
      {
        id: userId,
        clerkUserId: `dev_seed_${nanoid(8)}`,
        email: 'you@readroom.local',
        displayName: 'ReadRoom Explorer',
        avatarUrl: null,
        plan: 'beta',
        onboardingCompleted: true,
        createdAt: now(),
        updatedAt: now(),
      },
    ],
    voiceprints,
    rooms,
    analyses,
    profileAudits: [],
    shareLinks: [],
    usageEvents: analyses.map((a) => ({
      id: nanoid(),
      userId,
      eventType: 'analysis',
      model: 'readroom-demo-engine',
      estimatedInputTokens: 0,
      estimatedOutputTokens: 0,
      createdAt: a.createdAt,
    })),
    settings: [
      {
        userId,
        defaultVoiceprintId: voiceprints[0].id,
        defaultRoomId: rooms[2].id,
        appearance: 'system',
        dataRetentionPreference: 'keep',
        createdAt: now(),
        updatedAt: now(),
      },
    ],
    uploads: [],
  };

  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(db, null, 2), 'utf8');
  console.log(`Seeded ${analyses.length} analyses, ${rooms.length} rooms, ${voiceprints.length} voiceprint into ${DATA_FILE}`);
  console.log('Note: this seeds the local file store. Sign in via dev-auth to see it.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
