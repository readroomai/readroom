import {
  pgTable,
  uuid,
  text,
  boolean,
  integer,
  timestamp,
  jsonb,
  real,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    clerkUserId: text('clerk_user_id').notNull(),
    email: text('email'),
    displayName: text('display_name'),
    avatarUrl: text('avatar_url'),
    plan: text('plan').notNull().default('beta'),
    onboardingCompleted: boolean('onboarding_completed').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    clerkIdx: uniqueIndex('users_clerk_user_id_idx').on(t.clerkUserId),
  }),
);

export const voiceprints = pgTable(
  'voiceprints',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    description: text('description'),
    sourceSamples: jsonb('source_samples').$type<string[]>().notNull().default([]),
    extractedTraits: jsonb('extracted_traits').notNull(),
    machineInstruction: text('machine_instruction').notNull(),
    isDefault: boolean('is_default').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({ userIdx: index('voiceprints_user_id_idx').on(t.userId) }),
);

export const audienceRooms = pgTable(
  'audience_rooms',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    description: text('description'),
    familiarity: text('familiarity'),
    knowledgeLevel: text('knowledge_level'),
    existingSentiment: text('existing_sentiment'),
    values: jsonb('values').$type<string[]>().notNull().default([]),
    objections: jsonb('objections').$type<string[]>().notNull().default([]),
    desiredReaction: text('desired_reaction'),
    sensitiveTopics: jsonb('sensitive_topics').$type<string[]>().notNull().default([]),
    customContext: text('custom_context'),
    isPreset: boolean('is_preset').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({ userIdx: index('audience_rooms_user_id_idx').on(t.userId) }),
);

export const analyses = pgTable(
  'analyses',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    analysisType: text('analysis_type').notNull().default('quick_read'),
    title: text('title').notNull(),
    originalText: text('original_text').notNull(),
    platform: text('platform').notNull(),
    contentFormat: text('content_format'),
    communicationGoal: text('communication_goal'),
    desiredTone: text('desired_tone'),
    riskTolerance: text('risk_tolerance'),
    context: text('context'),
    voiceprintId: uuid('voiceprint_id').references(() => voiceprints.id, {
      onDelete: 'set null',
    }),
    audienceRoomId: uuid('audience_room_id').references(() => audienceRooms.id, {
      onDelete: 'set null',
    }),
    result: jsonb('result').notNull(),
    model: text('model').notNull(),
    modelConfidence: real('model_confidence').notNull().default(0),
    isDemo: boolean('is_demo').notNull().default(false),
    status: text('status').notNull().default('complete'),
    isFavourite: boolean('is_favourite').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    userIdx: index('analyses_user_id_idx').on(t.userId),
    createdIdx: index('analyses_created_at_idx').on(t.createdAt),
  }),
);

export const analysisVariants = pgTable(
  'analysis_variants',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    analysisId: uuid('analysis_id')
      .notNull()
      .references(() => analyses.id, { onDelete: 'cascade' }),
    label: text('label').notNull(),
    content: text('content').notNull(),
    position: integer('position').notNull().default(0),
  },
  (t) => ({ analysisIdx: index('analysis_variants_analysis_id_idx').on(t.analysisId) }),
);

export const profileAudits = pgTable(
  'profile_audits',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    input: jsonb('input').notNull(),
    result: jsonb('result').notNull(),
    model: text('model').notNull(),
    isDemo: boolean('is_demo').notNull().default(false),
    status: text('status').notNull().default('complete'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({ userIdx: index('profile_audits_user_id_idx').on(t.userId) }),
);

export const uploads = pgTable(
  'uploads',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    storagePath: text('storage_path').notNull(),
    fileName: text('file_name').notNull(),
    mimeType: text('mime_type').notNull(),
    byteSize: integer('byte_size').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({ userIdx: index('uploads_user_id_idx').on(t.userId) }),
);

export const shareLinks = pgTable(
  'share_links',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    analysisId: uuid('analysis_id')
      .notNull()
      .references(() => analyses.id, { onDelete: 'cascade' }),
    slug: text('slug').notNull(),
    showOriginalContent: boolean('show_original_content').notNull().default(false),
    isActive: boolean('is_active').notNull().default(true),
    expiresAt: timestamp('expires_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({ slugIdx: uniqueIndex('share_links_slug_idx').on(t.slug) }),
);

export const usageEvents = pgTable(
  'usage_events',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    eventType: text('event_type').notNull(),
    model: text('model').notNull(),
    estimatedInputTokens: integer('estimated_input_tokens').notNull().default(0),
    estimatedOutputTokens: integer('estimated_output_tokens').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    userIdx: index('usage_events_user_id_idx').on(t.userId),
    createdIdx: index('usage_events_created_at_idx').on(t.createdAt),
  }),
);

export const userSettings = pgTable('user_settings', {
  userId: uuid('user_id')
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  defaultVoiceprintId: uuid('default_voiceprint_id'),
  defaultRoomId: uuid('default_room_id'),
  appearance: text('appearance').notNull().default('system'),
  dataRetentionPreference: text('data_retention_preference').notNull().default('keep'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
