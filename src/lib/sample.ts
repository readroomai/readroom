import type { QuickReadResult } from '@/lib/ai/schemas';

/**
 * A single, pre-generated example used for the public (signed-out) demo so the
 * landing page never calls a paid API for anonymous traffic. Clearly labelled
 * as a sample throughout the UI.
 */
export const SAMPLE_POST =
  "We're not raising a seed round to 'extend runway.' We're raising because 4,000 people now use this every single day and we can't ship fast enough for them. If you build for people who actually need you, funding stops being a survival tactic and starts being fuel.";

export const SAMPLE_RESULT: QuickReadResult = {
  summary:
    'A confident founder announcement that reads as momentum-led rather than desperate. Strong for supporters; a few absolutes give skeptics an opening.',
  roomScore: 78,
  firstImpression: 'Reads like someone raising from strength, not need.',
  overallInterpretation:
    'Through an investor-and-follower room, this lands as a founder with traction and a point of view. Leading with real usage ("4,000 people every single day") before the ask reframes the round as fuel rather than rescue — a credibility move. The contrast structure ("not X, but Y") is persuasive, but the quoted "extend runway" and the absolute "actually need you" invite a sharp reader to test the claim. On X, the shape is native and screenshot-friendly.',
  likelyEmotionalResponse:
    'Supporters feel pulled along and slightly proud; skeptics feel a flicker of "prove it."',
  dimensions: {
    clarity: { score: 82, reason: 'The point arrives in the first line; no jargon to decode.' },
    trust: { score: 71, reason: 'The usage number reads as concrete proof, but it is unverified in-post.' },
    authority: { score: 80, reason: 'Framing the raise as optional signals leverage and conviction.' },
    warmth: { score: 58, reason: 'Focused on the business; the reader is addressed but not centred.' },
    originality: { score: 74, reason: 'The reframing of "why raise" avoids the usual announcement clichés.' },
    platformFit: { score: 85, reason: 'Punchy, contrarian, and quotable — well suited to X.' },
    polarisation: { score: 44, reason: 'Confident but not combative; unlikely to split the room hard.' },
  },
  audienceReactions: [
    {
      segment: 'Existing followers',
      role: 'supporter',
      likelyReading: 'They read this as a milestone and feel part of the story.',
      positiveSignal: 'Momentum framing is contagious.',
      friction: '',
      confidence: 0.68,
    },
    {
      segment: 'Investors',
      role: 'expert',
      likelyReading: 'They register the daily-usage claim and immediately want the retention curve behind it.',
      positiveSignal: 'Leads with usage, not vanity metrics.',
      friction: 'Will discount "4,000/day" until they see cohorts.',
      confidence: 0.6,
    },
    {
      segment: 'Skeptics',
      role: 'skeptic',
      likelyReading: 'They zero in on "actually need you" as an overclaim and look for the catch.',
      positiveSignal: '',
      friction: 'Absolutes feel like founder theatre.',
      confidence: 0.55,
    },
    {
      segment: 'Neutral readers',
      role: 'neutral',
      likelyReading: 'They get the gist — a startup doing well is raising — and move on with a mild positive impression.',
      positiveSignal: 'Effortless to understand.',
      friction: '',
      confidence: 0.63,
    },
    {
      segment: 'Casual scrollers',
      role: 'casual',
      likelyReading: 'The first line earns a pause; the number does the rest.',
      positiveSignal: 'Strong hook.',
      friction: 'Slightly long for a single glance.',
      confidence: 0.57,
    },
  ],
  misreadingRisks: [
    {
      risk: 'The raise could be read as humblebragging if usage is not independently visible.',
      triggerText: "we can't ship fast enough",
      likelihood: 'medium',
      severity: 'low',
      suggestedFix: 'Anchor the claim with one specific, checkable detail (a link, a chart, a name).',
    },
    {
      risk: '"actually need you" can read as dismissive of other founders.',
      triggerText: 'people who actually need you',
      likelihood: 'low',
      severity: 'low',
      suggestedFix: 'Soften to "people who rely on you" to keep the point without the edge.',
    },
  ],
  reputationRisks: [],
  clipRisks: [
    {
      phrase: 'funding stops being a survival tactic and starts being fuel',
      whyItClips: 'Aphoristic and self-contained — it travels well as a quote, for you or against you.',
    },
  ],
  strongestLine: {
    text: '4,000 people now use this every single day and we can’t ship fast enough for them.',
    reason: 'Concrete, specific, and reframes the raise around demand — the most credible sentence here.',
  },
  weakestLine: {
    text: "We're not raising a seed round to 'extend runway.'",
    reason: 'Opening on a negation makes the reader hold a frame before you give them the real one.',
  },
  preserve: [
    'Keep the usage number — it is doing the heaviest lifting.',
    'Keep the "fuel, not survival" reframe; it is the memorable idea.',
  ],
  genericOrAIWrittenSignals: [
    '"extend runway" is startup boilerplate — fine as a foil, weak as an opener.',
  ],
  platformNotes: [
    'Native to X: contrarian, quotable, screenshot-friendly.',
    'Consider a one-line follow-up with the proof (a chart) to pre-empt "show me".',
  ],
  rewrites: [
    {
      mode: 'clearer',
      text: "4,000 people use this every day, and we can't ship fast enough for them. That's why we're raising a seed round — not to extend runway, but to keep up with the people who rely on us.",
      rationale: 'Leads with the proof, then the ask, so the strongest fact frames everything after it.',
    },
    {
      mode: 'sharper',
      text: "4,000 people use this daily. We can't build fast enough. We're raising — not to survive, but to keep up.",
      rationale: 'Cuts to three beats. More velocity, more quotable, keeps the reframe.',
    },
    {
      mode: 'safer',
      text: "We're raising a seed round. The reason is simple: about 4,000 people now use this every day, and we want to keep up with the ones who rely on us. Funding here is fuel, not a lifeline.",
      rationale: 'Trades some edge for fewer absolutes, so skeptics have less to argue with.',
    },
  ],
  recommendedVersion:
    "4,000 people use this every day, and we can't ship fast enough for them. That's why we're raising — not to extend runway, but to keep up with the people who rely on us. Funding stops being survival and starts being fuel.",
  assumptions: [
    'Assumed the audience is a mix of existing followers and investors on X.',
    'Assumed the 4,000/day figure is accurate and defensible if questioned.',
    'This is a pre-generated sample, not a live analysis of your content.',
  ],
  confidence: 0.62,
};
