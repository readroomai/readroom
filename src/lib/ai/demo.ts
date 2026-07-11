import type {
  QuickReadInput,
  VoiceprintInput,
  ProfileAuditInput,
  CompareInput,
} from '@/lib/ai/types';
import type {
  QuickReadResult,
  VoiceprintTraits,
  ProfileAuditResult,
  CompareResult,
} from '@/lib/ai/schemas';
import { clampScore } from '@/lib/utils';
import { PLATFORMS } from '@/lib/constants';

/**
 * Deterministic, transparent analysis engine used when no ANTHROPIC_API_KEY is
 * configured. It derives real signals from the input text so every analysis is
 * distinct and defensible — but it is heuristic, not a language model, and the
 * UI always labels its output as a local demo. It never fabricates a live model
 * response.
 */

type Signals = ReturnType<typeof analyseText>;

function analyseText(text: string) {
  const t = text.trim();
  const words = t.split(/\s+/).filter(Boolean);
  const sentences = t.split(/(?<=[.!?])\s+/).filter((s) => s.trim().length > 0);
  const wordCount = words.length;
  const avgSentence = sentences.length ? wordCount / sentences.length : wordCount;
  const questions = (t.match(/\?/g) || []).length;
  const exclaims = (t.match(/!/g) || []).length;
  const links = (t.match(/https?:\/\/|\bwww\./gi) || []).length;
  const emojis = (t.match(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu) || []).length;
  const hashtags = (t.match(/#[\w-]+/g) || []).length;
  const capsRun = (t.match(/\b[A-Z]{3,}\b/g) || []).length;
  const firstPerson = (t.match(/\b(I|I'm|I've|my|me|we|our)\b/gi) || []).length;
  const you = (t.match(/\b(you|your)\b/gi) || []).length;
  const hedges = (t.match(/\b(maybe|perhaps|might|kind of|sort of|I think|possibly|just)\b/gi) || []).length;
  const absolutes = (t.match(/\b(always|never|everyone|nobody|the only|guaranteed|literally|obviously)\b/gi) || []).length;
  const genericPhrases = [
    'in today\'s world', 'game changer', 'at the end of the day', 'unlock', 'leverage',
    'revolutionary', 'seamless', 'excited to announce', 'thrilled to', 'game-changing',
    'the future of', 'take it to the next level', 'circle back', 'low-hanging fruit',
  ].filter((p) => t.toLowerCase().includes(p));
  const hookStart = /^(what if|the truth is|here'?s|nobody|stop|most people|i used to|3 |five |after)/i.test(t);
  return {
    text: t, words, sentences, wordCount, avgSentence, questions, exclaims, links,
    emojis, hashtags, capsRun, firstPerson, you, hedges, absolutes, genericPhrases, hookStart,
  };
}

function pickStrongest(s: Signals): string {
  const scored = s.sentences.map((sen) => {
    let v = 0;
    if (/\d/.test(sen)) v += 2;
    if (sen.length > 30 && sen.length < 160) v += 2;
    if (/\b(you|your)\b/i.test(sen)) v += 1;
    if (/[—:]/.test(sen)) v += 1;
    return { sen, v };
  });
  scored.sort((a, b) => b.v - a.v);
  return (scored[0]?.sen ?? s.text).slice(0, 200);
}

function pickWeakest(s: Signals): string {
  const scored = s.sentences.map((sen) => {
    let v = 0;
    if (/\b(maybe|just|kind of|sort of|I think)\b/i.test(sen)) v += 2;
    if (sen.length > 180) v += 2;
    if (sen.split(/\s+/).length < 4) v += 1;
    if (/(excited to announce|thrilled|game changer)/i.test(sen)) v += 3;
    return { sen, v };
  });
  scored.sort((a, b) => b.v - a.v);
  return (scored[0]?.sen ?? s.sentences[s.sentences.length - 1] ?? s.text).slice(0, 200);
}

export function demoQuickRead(input: QuickReadInput): QuickReadResult {
  const s = analyseText(input.text);
  const platformLabel = PLATFORMS.find((p) => p.id === input.platform)?.label ?? 'General';

  const clarity = clampScore(
    78 - Math.max(0, s.avgSentence - 20) * 1.4 - s.hedges * 3 + (s.avgSentence < 14 ? 6 : 0),
  );
  const trust = clampScore(
    70 - s.absolutes * 5 - s.exclaims * 2 - s.genericPhrases.length * 6 + (/\d/.test(s.text) ? 8 : 0),
  );
  const authority = clampScore(
    64 + (/\d/.test(s.text) ? 10 : 0) - s.hedges * 4 - s.emojis * 1.5 + (s.wordCount > 40 ? 6 : 0),
  );
  const warmth = clampScore(
    52 + s.you * 3 + s.emojis * 2 + s.questions * 3 - s.capsRun * 3 - s.absolutes * 2,
  );
  const originality = clampScore(
    72 - s.genericPhrases.length * 12 + (s.hookStart ? 8 : 0) - (s.wordCount < 8 ? 12 : 0),
  );
  const platformFit = clampScore(
    computePlatformFit(input.platform, s),
  );
  const polarisation = clampScore(
    28 + s.absolutes * 8 + s.capsRun * 4 + (input.risk === 'bold' ? 14 : input.risk === 'low' ? -8 : 0),
  );

  const roomScore = clampScore(
    clarity * 0.22 + trust * 0.2 + authority * 0.16 + warmth * 0.12 + originality * 0.14 + platformFit * 0.16 - polarisation * 0.08 + 6,
  );

  const strongest = pickStrongest(s);
  const weakest = pickWeakest(s);
  const roomName = input.room?.name ?? 'a general audience';

  const rewrites = buildDemoRewrites(input, s);

  return {
    summary: `A ${labelBand(roomScore)} read for ${platformLabel}. Clearest strength: ${clarity >= trust ? 'clarity' : 'credibility signals'}; main risk: ${polarisation > 55 ? 'polarisation' : s.hedges > 2 ? 'hedging softens the point' : 'a few phrases could be misread'}.`,
    roomScore,
    firstImpression:
      s.hookStart
        ? 'Opens with a hook that earns a second line of attention.'
        : s.wordCount < 10
          ? 'Reads as a quick aside — light, low-stakes, easy to scroll past.'
          : 'Reads as a considered take; the intent is legible on first pass.',
    overallInterpretation: `Read through ${roomName}, this comes across as ${toneDescriptor(s)}. ${s.firstPerson > s.you ? 'It centres your own perspective, which builds voice but asks the reader to care about you first.' : 'It keeps the reader in frame, which helps relevance.'} ${s.genericPhrases.length ? `Phrases like "${s.genericPhrases[0]}" pull it toward familiar territory and dilute originality.` : 'The phrasing mostly avoids cliché, which protects originality.'} On ${platformLabel}, ${platformFit >= 65 ? 'the shape fits the medium' : 'the format could be tightened for the medium'}.`,
    likelyEmotionalResponse:
      warmth >= 60
        ? 'Most readers feel invited in — mild warmth, low defensiveness.'
        : polarisation > 55
          ? 'Supporters feel energised; skeptics feel provoked. Expect a split.'
          : 'Neutral-to-mildly-positive. Little emotional friction, little pull.',
    dimensions: {
      clarity: { score: clarity, reason: s.avgSentence > 22 ? 'Long average sentence length asks more of the reader.' : 'Sentences are short enough to parse on a first pass.' },
      trust: { score: trust, reason: s.absolutes ? 'Absolute claims invite pushback and lower perceived honesty.' : /\d/.test(s.text) ? 'Concrete detail reads as credible.' : 'No obvious overclaiming; proof is light.' },
      authority: { score: authority, reason: s.hedges > 1 ? 'Hedging words soften the sense of conviction.' : 'The voice sounds settled and specific.' },
      warmth: { score: warmth, reason: s.you > 1 ? 'Speaking to "you" keeps it human.' : 'Leans informational over relational.' },
      originality: { score: originality, reason: s.genericPhrases.length ? `Contains familiar phrasing (${s.genericPhrases.join(', ')}).` : 'Phrasing feels particular rather than templated.' },
      platformFit: { score: platformFit, reason: platformNote(input.platform, s) },
      polarisation: { score: polarisation, reason: polarisation > 55 ? 'Framing draws a clear line some readers will resist.' : 'Unlikely to divide the room.' },
    },
    audienceReactions: [
      { segment: 'Supporters', role: 'supporter', likelyReading: `They read this as ${toneDescriptor(s)} and nod along.`, positiveSignal: 'Feels consistent with what they expect from you.', friction: s.hedges > 2 ? 'May wish you committed harder.' : '', confidence: 0.62 },
      { segment: 'Skeptics', role: 'skeptic', likelyReading: s.absolutes ? 'They zero in on the absolute claims and look for the exception.' : 'They look for the catch and mostly do not find one.', positiveSignal: s.absolutes ? '' : 'Little to attack.', friction: s.absolutes ? `"${firstMatch(s.text, /\b(always|never|everyone|nobody|guaranteed|obviously)\b/i)}" reads as overclaim.` : 'Wants more proof.', confidence: 0.55 },
      { segment: 'Neutral readers', role: 'neutral', likelyReading: 'They get the gist quickly and form a mild, provisional impression.', positiveSignal: 'Low effort to understand.', friction: originality < 55 ? 'Nothing makes it stick.' : '', confidence: 0.6 },
      { segment: 'Domain experts', role: 'expert', likelyReading: /\d/.test(s.text) ? 'They appreciate the specificity and check it against what they know.' : 'They register it as directional rather than rigorous.', positiveSignal: /\d/.test(s.text) ? 'Concrete enough to engage with.' : '', friction: /\d/.test(s.text) ? '' : 'Wants the evidence behind the claim.', confidence: 0.5 },
      { segment: 'Casual scrollers', role: 'casual', likelyReading: s.wordCount > 45 ? 'Many skim the first line and move on.' : 'Easy to consume in one glance.', positiveSignal: s.hookStart ? 'The opening earns a pause.' : '', friction: s.wordCount > 45 ? 'Length competes with the feed.' : '', confidence: 0.58 },
    ],
    misreadingRisks: buildMisreads(s),
    reputationRisks: s.absolutes || input.risk === 'bold'
      ? [{ risk: 'A strong claim could be quoted back at you if circumstances change.', severity: s.absolutes ? 'medium' : 'low', note: 'Consider scoping the claim to a context or timeframe.' }]
      : [],
    clipRisks: buildClipRisks(s),
    strongestLine: { text: strongest, reason: 'Concrete and self-contained — it survives being read alone.' },
    weakestLine: { text: weakest, reason: s.genericPhrases.length ? 'Leans on familiar phrasing that adds length but not meaning.' : 'Softer than the rest; carries less of the point.' },
    preserve: [
      strongest.length > 12 ? `Keep: "${strongest.slice(0, 80)}"` : 'Keep the specific, concrete detail.',
      s.firstPerson > 0 ? 'Keep the first-person voice — it reads as authentic.' : 'Keep the direct address to the reader.',
    ],
    genericOrAIWrittenSignals: s.genericPhrases.length
      ? s.genericPhrases.map((p) => `"${p}" is a well-worn phrase that signals template writing.`)
      : s.exclaims > 2
        ? ['Multiple exclamation marks can read as manufactured enthusiasm.']
        : [],
    platformNotes: [platformNote(input.platform, s), input.platform === 'x' && s.wordCount > 50 ? 'Consider splitting into a short thread.' : `Format reads as native to ${platformLabel}.`],
    rewrites,
    recommendedVersion: rewrites[0].text,
    assumptions: [
      `Assumed the reader is ${input.room?.name ?? 'a general audience'} with ${input.room?.knowledgeLevel ?? 'mixed'} context.`,
      'Assumed no accompanying image changes the meaning unless a screenshot was provided.',
      'This is a local heuristic simulation, not a live language-model analysis.',
    ],
    confidence: 0.55,
  };
}

function computePlatformFit(platform: QuickReadInput['platform'], s: Signals): number {
  switch (platform) {
    case 'x':
      return 82 - Math.max(0, s.wordCount - 40) * 0.6 + (s.hookStart ? 6 : 0);
    case 'linkedin':
      return 70 - s.emojis * 2 + (s.wordCount > 25 ? 8 : -6) - s.hashtags * 1;
    case 'instagram':
      return 66 + s.emojis * 2 + s.hashtags * 1.5 + s.you * 2;
    case 'email':
      return 74 - s.hashtags * 6 - s.emojis * 3 + (s.you > 0 ? 6 : 0);
    case 'dm':
      return 72 + s.you * 3 - s.hashtags * 8 + (s.wordCount < 60 ? 6 : -8);
    case 'website':
      return 68 + (s.wordCount < 30 ? 10 : -6) - s.hedges * 3;
    default:
      return 70;
  }
}

function platformNote(platform: QuickReadInput['platform'], s: Signals): string {
  switch (platform) {
    case 'x':
      return s.wordCount > 45 ? 'On X this is long for a single post; the first line has to carry it.' : 'Length suits a single X post.';
    case 'linkedin':
      return s.emojis > 2 ? 'Emoji density can undercut authority on LinkedIn.' : 'Tone reads appropriately professional for LinkedIn.';
    case 'instagram':
      return s.emojis === 0 ? 'A caption with zero personality markers can feel flat under a photo.' : 'Caption energy fits Instagram.';
    case 'email':
      return s.hashtags ? 'Hashtags are out of place in an email.' : 'Reads like a real message rather than a broadcast.';
    case 'dm':
      return 'In a DM, tone is everything — a single misread word carries more weight than in a feed.';
    case 'website':
      return 'As headline/landing copy, every extra word costs clarity.';
    default:
      return 'Reads acceptably across most surfaces.';
  }
}

function buildMisreads(s: Signals) {
  const out: QuickReadResult['misreadingRisks'] = [];
  const abs = firstMatch(s.text, /\b(always|never|everyone|nobody|guaranteed|obviously)\b/i);
  if (abs) {
    out.push({ risk: 'An absolute could be read as literal and challenged.', triggerText: abs, likelihood: 'medium', severity: 'medium', suggestedFix: `Scope it: e.g. "in my experience" instead of "${abs}".` });
  }
  if (s.hedges > 2) {
    out.push({ risk: 'Stacked hedges can read as low conviction.', triggerText: firstMatch(s.text, /\b(maybe|just|kind of|I think)\b/i), likelihood: 'medium', severity: 'low', suggestedFix: 'Cut one or two qualifiers so the point lands.' });
  }
  if (s.text.includes('...')) {
    out.push({ risk: 'Trailing ellipses can imply something unsaid.', triggerText: '...', likelihood: 'low', severity: 'low', suggestedFix: 'Finish the thought or cut the ellipsis.' });
  }
  return out.slice(0, 4);
}

function buildClipRisks(s: Signals) {
  const out: QuickReadResult['clipRisks'] = [];
  const abs = firstMatch(s.text, /[^.!?]*\b(always|never|everyone|nobody|guaranteed)\b[^.!?]*/i);
  if (abs) out.push({ phrase: abs.trim().slice(0, 120), whyItClips: 'Absolutes screenshot well as a "gotcha".' });
  const strong = s.sentences.find((x) => x.length > 30 && x.length < 120 && /\b(you|never|always|the truth)\b/i.test(x));
  if (strong && strong.trim() !== abs?.trim()) out.push({ phrase: strong.trim().slice(0, 120), whyItClips: 'Punchy and self-contained — travels without context.' });
  return out.slice(0, 3);
}

function buildDemoRewrites(input: QuickReadInput, s: Signals): QuickReadResult['rewrites'] {
  const base = input.text.trim();
  const first = s.sentences[0] ?? base;
  const clearer = tidy(
    `${first.replace(/\s+/g, ' ')}${s.sentences.slice(1).length ? ' ' + s.sentences.slice(1).join(' ') : ''}`
      .replace(/\b(maybe|kind of|sort of|just|I think)\s+/gi, '')
      .replace(/\s{2,}/g, ' '),
  );
  const sharper = tidy(
    stripGeneric(base).replace(/\.\s*$/, '') + (base.endsWith('?') ? '' : '.'),
  );
  const safer = tidy(
    stripGeneric(base)
      .replace(/\b(always|never)\b/gi, (m) => (m.toLowerCase() === 'always' ? 'usually' : 'rarely'))
      .replace(/\b(everyone|nobody)\b/gi, (m) => (m.toLowerCase() === 'everyone' ? 'most people' : 'few people')),
  );
  return [
    { mode: 'clearer', text: clearer || base, rationale: 'Trims qualifiers and tightens the sentence order so the point arrives sooner.' },
    { mode: 'sharper', text: sharper || base, rationale: 'Removes filler and generic phrasing to give the line more edge and voice.' },
    { mode: 'safer', text: safer || base, rationale: 'Scopes absolute claims so skeptics have less to argue with, while keeping your meaning.' },
  ];
}

function stripGeneric(t: string): string {
  return t
    .replace(/\b(excited|thrilled) to announce\b/gi, 'announcing')
    .replace(/\bin today'?s world\b/gi, 'now')
    .replace(/\bgame[- ]?changer\b/gi, 'a real shift')
    .replace(/\bat the end of the day\b/gi, 'ultimately')
    .replace(/\s{2,}/g, ' ')
    .trim();
}
function tidy(t: string): string {
  return t.replace(/\s{2,}/g, ' ').replace(/\s+([.,!?])/g, '$1').trim();
}
function firstMatch(t: string, re: RegExp): string {
  const m = t.match(re);
  return m ? m[0] : '';
}
function toneDescriptor(s: Signals): string {
  if (s.exclaims > 1) return 'energetic and eager';
  if (s.hedges > 2) return 'tentative and careful';
  if (s.absolutes > 0) return 'confident and declarative';
  if (s.questions > 0) return 'curious and open';
  return 'measured and matter-of-fact';
}
function labelBand(score: number): string {
  if (score >= 82) return 'strong';
  if (score >= 66) return 'solid';
  if (score >= 45) return 'mixed';
  return 'high-friction';
}

/** ---- Voiceprint demo ---- */
export function demoVoiceprint(input: VoiceprintInput): VoiceprintTraits {
  const joined = input.samples.join(' ');
  const s = analyseText(joined);
  const short = s.avgSentence < 14;
  return {
    summary: `Writes in a ${short ? 'clipped, punchy' : 'flowing, considered'} register — ${s.firstPerson > s.you ? 'personal and first-person' : 'reader-facing and direct'}, ${s.emojis ? 'comfortable with emoji' : 'sparing with decoration'}. ${s.questions ? 'Uses questions to open loops.' : 'Prefers statements over questions.'}`,
    sentenceRhythm: short ? 'Short, staccato sentences with frequent line breaks.' : 'Longer, connected sentences that build an argument.',
    vocabularyStyle: s.genericPhrases.length ? 'Everyday, occasionally leaning on familiar phrases.' : 'Plain and specific; avoids jargon.',
    directness: input.directness ?? (s.hedges > 2 ? 'Softened with qualifiers.' : 'Direct, says the thing.'),
    confidenceLevel: s.hedges > 2 ? 'Measured, room for doubt.' : 'Assured.',
    emotionalTemperature: s.exclaims ? 'Warm to enthusiastic.' : 'Even and grounded.',
    useOfHumour: 'Occasional, dry rather than performative.',
    useOfContrast: s.text.includes(' but ') || s.text.includes(' not ') ? 'Uses "not this, but that" contrast to sharpen points.' : 'Rarely relies on contrast.',
    useOfHooks: s.hookStart ? 'Opens with hooks that create a question in the reader.' : 'Starts plainly, earns attention through substance.',
    useOfStorytelling: s.firstPerson > 2 ? 'Draws on personal anecdote.' : 'Argues from ideas more than stories.',
    typicalStructure: 'Claim, then support, then a short landing line.',
    commonStrengths: ['Legible intent', short ? 'Momentum' : 'Depth', 'Consistent voice'],
    commonHabits: [s.hedges > 2 ? 'Hedging before the point' : 'Front-loading the point', s.exclaims ? 'Reaching for exclamation marks' : 'Restrained punctuation'],
    phrasesToPreserve: input.frequentPhrases?.length ? input.frequentPhrases : ['(add phrases you use often)'],
    phrasesToAvoid: input.bannedPhrases?.length ? input.bannedPhrases : (s.genericPhrases.length ? s.genericPhrases : ['(add phrases to avoid)']),
    nonNegotiableValues: input.nonNegotiables?.length ? input.nonNegotiables : ['Honesty over hype'],
    machineInstruction: `Write in a ${short ? 'short, punchy' : 'measured, connected'} voice. ${s.hedges > 2 ? 'Keep light hedging but never bury the point.' : 'Stay direct.'} ${s.firstPerson > s.you ? 'First person is fine.' : 'Keep the reader in frame.'} ${input.bannedPhrases?.length ? `Never use: ${input.bannedPhrases.join(', ')}.` : ''} Preserve the author's meaning and values; do not sanitise a strong opinion into a bland one.`,
    sampleOutput: `Here's the thing about ${short ? 'shipping small' : 'doing careful work'}: it compounds. ${short ? 'One honest post beats ten polished ones.' : 'The people who last are the ones who kept showing up when it was quiet.'} (Demo sample — a real Voiceprint is generated by the model.)`,
  };
}

/** ---- Profile audit demo ---- */
export function demoProfileAudit(input: ProfileAuditInput): ProfileAuditResult {
  const s = analyseText([input.bio, input.description, ...input.posts].filter(Boolean).join(' '));
  const positioning = clampScore(58 + (input.desiredPositioning ? 6 : 0) - (input.bio.length < 40 ? 14 : 0) + (input.bio.includes('|') ? 6 : 0));
  const credibility = clampScore(52 + (/\d/.test(input.bio + input.posts.join(' ')) ? 12 : 0) + (input.pinnedPost ? 8 : -4));
  const consistency = clampScore(60 + (input.posts.length >= 3 ? 8 : -6));
  const memorability = clampScore(48 + (s.hookStart ? 12 : 0) + (input.bio.length < 90 ? 6 : -4));
  const differentiation = clampScore(50 + (input.desiredPositioning ? 8 : 0) - s.genericPhrases.length * 8);
  return {
    scores: { positioning, credibility, consistency, memorability, differentiation },
    firstImpression: `In the first three seconds, this profile reads as ${input.bio.length < 40 ? 'under-explained — a name without a clear promise' : 'a person with a stated focus'}. ${input.pinnedPost ? 'The pinned post gives a reader somewhere to land.' : 'There is no pinned anchor to orient a new visitor.'}`,
    appearsToBeAbout: input.bio.slice(0, 160) || 'Unclear from the bio alone.',
    unclear: [input.bio.length < 40 ? 'Who this is specifically for.' : 'The single next action you want a visitor to take.', 'What outcome following you produces.'],
    credibilitySignals: /\d/.test(input.bio + input.posts.join(' ')) ? ['Concrete numbers appear in the content.'] : ['Few explicit proof points; credibility is implied, not shown.'],
    missingProof: ['A specific result or artefact a stranger can verify.', input.pinnedPost ? 'Social proof from others.' : 'A pinned post that demonstrates the claim.'],
    positioningGaps: [differentiation < 55 ? 'The positioning overlaps with many similar accounts.' : 'Positioning is distinct but under-stated.', 'The bio states a role but not a point of view.'],
    audienceMismatch: input.targetAudience ? `Content skews ${s.firstPerson > s.you ? 'inward (about you)' : 'outward'} while the target audience (${input.targetAudience}) needs to see themselves in it.` : '',
    recommendedPositioning: input.desiredPositioning
      ? `Sharpen toward: ${input.desiredPositioning}. Make it the first line of the bio.`
      : 'Lead with the specific person you help and the change you create for them — role second.',
    revisedBios: [
      `${input.displayName} — I help ${input.targetAudience ?? '[audience]'} ${input.desiredPositioning ?? 'do [specific outcome]'}. ${input.primaryCta ?? 'Start here ↓'}`,
      `Building in ${topicGuess(input)} for ${input.targetAudience ?? 'people who ship'}. Plain writing, real results, no hype.`,
      `${input.displayName}. ${topicGuess(input)}, explained clearly. ${input.primaryCta ?? 'Read the pinned post →'}`,
    ],
    pinnedPostStructure: 'Line 1: the promise (who + what change). Lines 2-4: one concrete proof. Final line: a single, low-friction call to action.',
    contentPillars: [topicGuess(input), 'Behind-the-scenes / process', 'Opinions that only you would hold'],
    suggestedCta: input.primaryCta ?? 'Read the pinned post to see how this works.',
    sevenDayPlan: [
      { day: 1, action: 'Rewrite the bio using revised option 1; make the first four words state who it is for.' },
      { day: 2, action: 'Publish a pinned post using the recommended structure.' },
      { day: 3, action: 'Add one verifiable proof point (a number, a link, a result).' },
      { day: 4, action: 'Post one opinion only you would hold, tied to pillar 3.' },
      { day: 5, action: 'Reply thoughtfully to five accounts your target audience follows.' },
      { day: 6, action: 'Turn your best-performing past post into a cleaner, reusable format.' },
      { day: 7, action: 'Review first-impression clarity with a stranger; cut anything they did not understand.' },
    ],
    confidence: 0.5,
  };
}
function topicGuess(input: ProfileAuditInput): string {
  const t = (input.bio + ' ' + input.posts.join(' ')).toLowerCase();
  if (/design|ux|ui/.test(t)) return 'design';
  if (/founder|startup|build|ship|product/.test(t)) return 'building products';
  if (/fitness|health|training/.test(t)) return 'fitness';
  if (/writ|content|creator/.test(t)) return 'writing & content';
  if (/crypto|web3|onchain/.test(t)) return 'crypto';
  return 'your craft';
}

/** ---- Compare demo ---- */
export function demoCompare(input: CompareInput): CompareResult {
  const scored = input.variants.map((v) => {
    const s = analyseText(v.content);
    const score =
      (s.hookStart ? 10 : 0) + (/\d/.test(v.content) ? 8 : 0) - s.genericPhrases.length * 6 -
      Math.max(0, s.avgSentence - 22) * 0.8 - s.hedges * 3 + s.you * 1.5 + (v.content.length < 280 ? 6 : 0);
    return { label: v.label, score, s };
  });
  const sorted = [...scored].sort((a, b) => b.score - a.score);
  const winner = sorted[0];
  const mostAuthentic = [...scored].sort((a, b) => b.s.firstPerson - a.s.firstPerson)[0];
  const mostDiscussion = [...scored].sort((a, b) => (b.s.absolutes + b.s.questions) - (a.s.absolutes + a.s.questions))[0];
  const mostMisunderstood = [...scored].sort((a, b) => (b.s.absolutes + b.s.hedges) - (a.s.absolutes + a.s.hedges))[0];
  const bestHook = [...scored].sort((a, b) => Number(b.s.hookStart) - Number(a.s.hookStart) || b.score - a.score)[0];
  return {
    predictedWinnerLabel: winner.label,
    reason: `${winner.label} balances a legible opening with the least generic phrasing, so it is the most likely to be read as intended. This is a simulation of likely interpretation, not a guaranteed outcome.`,
    dimensionComparison: [
      { dimension: 'Clarity', winnerLabel: [...scored].sort((a, b) => a.s.avgSentence - b.s.avgSentence)[0].label, note: 'Shortest average sentence length.' },
      { dimension: 'Originality', winnerLabel: [...scored].sort((a, b) => a.s.genericPhrases.length - b.s.genericPhrases.length)[0].label, note: 'Fewest well-worn phrases.' },
      { dimension: 'Hook', winnerLabel: bestHook.label, note: 'Strongest opening line.' },
    ],
    audienceWinners: [
      { audience: input.room?.name ?? 'General', winnerLabel: winner.label, why: 'Clearest intent for this room.' },
      { audience: 'Skeptics', winnerLabel: [...scored].sort((a, b) => a.s.absolutes - b.s.absolutes)[0].label, why: 'Fewest absolutes to attack.' },
    ],
    riskComparison: scored.map((v) => ({ label: v.label, riskNote: v.s.absolutes ? 'Contains absolutes that could be clipped.' : v.s.hedges > 2 ? 'Hedging may dilute the point.' : 'Low obvious risk.' })),
    bestHookLabel: bestHook.label,
    bestClosingLabel: [...scored].sort((a, b) => (b.s.sentences.at(-1)?.length ?? 0) - (a.s.sentences.at(-1)?.length ?? 0))[0].label,
    mostAuthenticLabel: mostAuthentic.label,
    mostDiscussionLabel: mostDiscussion.label,
    mostMisunderstoodLabel: mostMisunderstood.label,
    recommendedHybrid: `Open with ${bestHook.label}'s first line, carry ${winner.label}'s core, and close on the calmest ending. Keep any concrete numbers from whichever variant has them. (Demo synthesis — a live model produces a fully written hybrid.)`,
    confidence: 0.5,
  };
}
