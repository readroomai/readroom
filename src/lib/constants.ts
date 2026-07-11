export const PLATFORMS = [
  { id: 'x', label: 'X', hint: 'Short, fast, screenshot-prone' },
  { id: 'linkedin', label: 'LinkedIn', hint: 'Professional, credibility-led' },
  { id: 'instagram', label: 'Instagram', hint: 'Caption + visual context' },
  { id: 'email', label: 'Email', hint: 'One reader, direct' },
  { id: 'dm', label: 'Direct message', hint: 'Personal, high stakes' },
  { id: 'website', label: 'Website', hint: 'Headline / landing copy' },
  { id: 'general', label: 'General', hint: 'Platform-agnostic' },
] as const;

export const CONTENT_FORMATS = [
  { id: 'post', label: 'Post' },
  { id: 'thread', label: 'Thread' },
  { id: 'caption', label: 'Caption' },
  { id: 'announcement', label: 'Announcement' },
  { id: 'launch', label: 'Product launch' },
  { id: 'email', label: 'Email' },
  { id: 'dm', label: 'Direct message' },
  { id: 'bio', label: 'Bio' },
  { id: 'headline', label: 'Headline' },
  { id: 'press', label: 'Press statement' },
  { id: 'other', label: 'Other' },
] as const;

export const GOALS = [
  { id: 'authority', label: 'Build authority' },
  { id: 'trust', label: 'Build trust' },
  { id: 'action', label: 'Drive action' },
  { id: 'discussion', label: 'Start discussion' },
  { id: 'announcement', label: 'Make an announcement' },
  { id: 'clarify', label: 'Clarify a position' },
  { id: 'persuade', label: 'Be persuasive' },
  { id: 'memorable', label: 'Be memorable' },
  { id: 'reduce-misunderstanding', label: 'Reduce misunderstanding' },
  { id: 'custom', label: 'Custom goal' },
] as const;

export const TONES = [
  { id: 'direct', label: 'Direct' },
  { id: 'thoughtful', label: 'Thoughtful' },
  { id: 'authoritative', label: 'Authoritative' },
  { id: 'warm', label: 'Warm' },
  { id: 'provocative', label: 'Provocative' },
  { id: 'balanced', label: 'Balanced' },
  { id: 'custom', label: 'Custom' },
] as const;

export const RISK_LEVELS = [
  { id: 'low', label: 'Low', hint: 'Protect reputation, minimise misreads' },
  { id: 'balanced', label: 'Balanced', hint: 'Keep the edge, reduce the risk' },
  { id: 'bold', label: 'Bold', hint: 'Maximise impact, accept polarisation' },
] as const;

export const DIMENSION_KEYS = [
  'clarity',
  'trust',
  'authority',
  'warmth',
  'originality',
  'platformFit',
  'polarisation',
] as const;

export const DIMENSION_LABELS: Record<(typeof DIMENSION_KEYS)[number], string> = {
  clarity: 'Clarity',
  trust: 'Trust',
  authority: 'Authority',
  warmth: 'Warmth',
  originality: 'Originality',
  platformFit: 'Platform fit',
  polarisation: 'Polarisation',
};

export const PUBLISHER_TYPES = [
  { id: 'creator', label: 'Creator content' },
  { id: 'founder', label: 'Founder content' },
  { id: 'professional', label: 'Professional content' },
  { id: 'brand', label: 'Brand content' },
  { id: 'private', label: 'Private communication' },
  { id: 'other', label: 'Other' },
] as const;

export type PlatformId = (typeof PLATFORMS)[number]['id'];
export type FormatId = (typeof CONTENT_FORMATS)[number]['id'];
export type GoalId = (typeof GOALS)[number]['id'];
export type ToneId = (typeof TONES)[number]['id'];
export type RiskId = (typeof RISK_LEVELS)[number]['id'];
export type DimensionKey = (typeof DIMENSION_KEYS)[number];

export const PRESET_ROOMS = [
  {
    name: 'Existing followers',
    description: 'People who already know your work and voice.',
    familiarity: 'high',
    knowledgeLevel: 'medium',
    existingSentiment: 'positive',
    values: ['consistency', 'authenticity', 'usefulness'],
    objections: ['feeling sold to', 'repetition'],
    desiredReaction: 'Feel it sounds like you and worth their attention.',
    sensitiveTopics: [],
  },
  {
    name: 'Potential customers',
    description: 'People evaluating whether to trust and buy.',
    familiarity: 'low',
    knowledgeLevel: 'low',
    existingSentiment: 'neutral',
    values: ['proof', 'clarity', 'low risk'],
    objections: ['is this real?', 'what is the catch?', 'too vague'],
    desiredReaction: 'Understand the value fast and feel safe taking a step.',
    sensitiveTopics: ['pricing', 'claims'],
  },
  {
    name: 'Investors',
    description: 'Sharp, pattern-matching, time-poor readers.',
    familiarity: 'low',
    knowledgeLevel: 'high',
    existingSentiment: 'skeptical',
    values: ['traction', 'defensibility', 'judgment'],
    objections: ['hand-wavy', 'no evidence', 'hype'],
    desiredReaction: 'See signal, not noise. Trust your judgment.',
    sensitiveTopics: ['metrics', 'market size'],
  },
  {
    name: 'Skeptics & critics',
    description: 'Readers looking for the flaw or the angle.',
    familiarity: 'medium',
    knowledgeLevel: 'high',
    existingSentiment: 'negative',
    values: ['rigour', 'honesty', 'humility'],
    objections: ['overclaiming', 'virtue signalling', 'gaps'],
    desiredReaction: 'Struggle to find the cheap shot.',
    sensitiveTopics: ['absolutes', 'us-vs-them framing'],
  },
  {
    name: 'Professional peers',
    description: 'People in your field judging your competence.',
    familiarity: 'medium',
    knowledgeLevel: 'high',
    existingSentiment: 'neutral',
    values: ['substance', 'nuance', 'credit'],
    objections: ['stating the obvious', 'taking credit', 'oversimplifying'],
    desiredReaction: 'Respect the thinking behind it.',
    sensitiveTopics: ['attribution'],
  },
  {
    name: 'Mainstream audience',
    description: 'Broad readers with no context on you or the topic.',
    familiarity: 'low',
    knowledgeLevel: 'low',
    existingSentiment: 'neutral',
    values: ['clarity', 'relevance', 'warmth'],
    objections: ['jargon', 'insider references', 'coldness'],
    desiredReaction: 'Get it instantly without background.',
    sensitiveTopics: ['jargon'],
  },
] as const;
