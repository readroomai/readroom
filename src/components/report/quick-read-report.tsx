'use client';

import { useState } from 'react';
import {
  AlertTriangle,
  Scissors,
  ShieldAlert,
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  Quote,
  ChevronDown,
  Info,
} from 'lucide-react';
import type { QuickReadResult } from '@/lib/ai/schemas';
import { Badge, Card } from '@/components/ui';
import { ScoreRing } from './score-ring';
import { Dimensions } from './dimensions';
import { CopyButton } from '@/components/copy-button';
import { cn } from '@/lib/utils';

const ROLE_TONE: Record<string, 'iris' | 'mint' | 'blush' | 'ice' | 'neutral'> = {
  supporter: 'mint',
  skeptic: 'blush',
  neutral: 'neutral',
  expert: 'ice',
  casual: 'iris',
};

export function QuickReadReport({
  result,
  isDemo,
  model,
  animate = true,
}: {
  result: QuickReadResult;
  isDemo: boolean;
  model: string;
  animate?: boolean;
}) {
  const [rewriteMode, setRewriteMode] = useState<'clearer' | 'sharper' | 'safer'>('clearer');
  const activeRewrite = result.rewrites.find((r) => r.mode === rewriteMode) ?? result.rewrites[0];

  return (
    <div className="space-y-5">
      {/* Header: score + first impression */}
      <Card className="overflow-hidden">
        <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center">
          <div className="shrink-0 self-center">
            <ScoreRing score={result.roomScore} animate={animate} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Badge tone="iris">
                <Sparkles className="h-3 w-3" /> Simulation
              </Badge>
              {isDemo ? (
                <Badge tone="warn">Local demo engine</Badge>
              ) : (
                <Badge tone="mint">Live model</Badge>
              )}
              <span className="text-xs text-ink-soft">
                Confidence {Math.round(result.confidence * 100)}%
              </span>
            </div>
            <p className="serif text-2xl leading-snug text-ink">
              {result.firstImpression}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">{result.summary}</p>
          </div>
        </div>
        <div className="border-t border-rule bg-paper/60 px-6 py-3 text-xs text-ink-soft">
          <Info className="mr-1 inline h-3.5 w-3.5 align-text-bottom" />
          This is an AI simulation of how your words may be interpreted — not a prediction of
          engagement or a statement of fact.
        </div>
      </Card>

      <div className="grid gap-5 lg:grid-cols-5">
        {/* Interpretation */}
        <Card className="p-6 lg:col-span-3">
          <SectionTitle>How it reads in the room</SectionTitle>
          <p className="mt-3 text-[0.95rem] leading-relaxed text-ink">
            {result.overallInterpretation}
          </p>
          <div className="mt-4 rounded-2xl bg-sand/60 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-cobalt">
              Likely emotional response
            </p>
            <p className="mt-1 text-sm text-ink">{result.likelyEmotionalResponse}</p>
          </div>
        </Card>

        {/* Dimensions */}
        <Card className="p-6 lg:col-span-2">
          <SectionTitle>Dimension read</SectionTitle>
          <div className="mt-4">
            <Dimensions dimensions={result.dimensions} />
          </div>
        </Card>
      </div>

      {/* Audience reactions */}
      <Card className="p-6">
        <SectionTitle>Audience reaction simulation</SectionTitle>
        <p className="mt-1 text-sm text-ink-soft">
          Five ways this same content may be read, depending on who is in the room.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {result.audienceReactions.map((r, i) => (
            <div
              key={i}
              className={cn(
                'rounded-2xl border border-rule bg-white p-4',
                animate && 'animate-fade-up',
              )}
              style={animate ? { animationDelay: `${i * 80}ms` } : undefined}
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="font-medium text-ink">{r.segment}</span>
                {r.role && <Badge tone={ROLE_TONE[r.role] ?? 'neutral'}>{r.role}</Badge>}
              </div>
              <p className="text-sm leading-relaxed text-ink-soft">{r.likelyReading}</p>
              {(r.positiveSignal || r.friction) && (
                <div className="mt-3 space-y-1.5 text-xs">
                  {r.positiveSignal && (
                    <p className="flex gap-1.5 text-[#0f7a54]">
                      <ThumbsUp className="mt-0.5 h-3 w-3 shrink-0" /> {r.positiveSignal}
                    </p>
                  )}
                  {r.friction && (
                    <p className="flex gap-1.5 text-clay">
                      <ThumbsDown className="mt-0.5 h-3 w-3 shrink-0" /> {r.friction}
                    </p>
                  )}
                </div>
              )}
              <div className="mt-3 h-1 overflow-hidden rounded-full bg-ink/[0.06]">
                <div
                  className="h-full rounded-full bg-ink/30"
                  style={{ width: `${Math.round(r.confidence * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Strongest / weakest */}
      <div className="grid gap-5 sm:grid-cols-2">
        <Card className="p-6">
          <SectionTitle icon={<Quote className="h-4 w-4 text-[#0f7a54]" />}>
            Strongest line
          </SectionTitle>
          <blockquote className="mt-3 border-l-2 border-[#3f6b3a]/40 pl-3 text-[0.95rem] italic text-ink">
            “{result.strongestLine.text}”
          </blockquote>
          <p className="mt-2 text-sm text-ink-soft">{result.strongestLine.reason}</p>
        </Card>
        <Card className="p-6">
          <SectionTitle icon={<Quote className="h-4 w-4 text-clay" />}>
            Weakest line
          </SectionTitle>
          <blockquote className="mt-3 border-l-2 border-clay/50 pl-3 text-[0.95rem] italic text-ink">
            “{result.weakestLine.text}”
          </blockquote>
          <p className="mt-2 text-sm text-ink-soft">{result.weakestLine.reason}</p>
        </Card>
      </div>

      {/* Risks */}
      {(result.misreadingRisks.length > 0 ||
        result.reputationRisks.length > 0 ||
        result.clipRisks.length > 0) && (
        <div className="grid gap-5 lg:grid-cols-3">
          <RiskColumn
            title="Misreading risks"
            icon={<AlertTriangle className="h-4 w-4 text-amber-600" />}
            empty="No obvious misreadings."
            isEmpty={result.misreadingRisks.length === 0}
          >
            {result.misreadingRisks.map((r, i) => (
              <li key={i} className="rounded-xl bg-amber-50/70 p-3">
                <p className="text-sm font-medium text-ink">{r.risk}</p>
                {r.triggerText && (
                  <p className="mt-1 text-xs text-ink-soft">
                    Trigger: <span className="rounded bg-amber-100 px-1">{r.triggerText}</span>
                  </p>
                )}
                <div className="mt-1.5 flex gap-1.5">
                  <Badge tone="warn">likelihood {r.likelihood}</Badge>
                  <Badge tone="warn">severity {r.severity}</Badge>
                </div>
                {r.suggestedFix && <p className="mt-1.5 text-xs text-ink-soft">Fix: {r.suggestedFix}</p>}
              </li>
            ))}
          </RiskColumn>

          <RiskColumn
            title="Reputation risks"
            icon={<ShieldAlert className="h-4 w-4 text-red-500" />}
            empty="Nothing likely to be held against you."
            isEmpty={result.reputationRisks.length === 0}
          >
            {result.reputationRisks.map((r, i) => (
              <li key={i} className="rounded-xl bg-red-50/70 p-3">
                <p className="text-sm font-medium text-ink">{r.risk}</p>
                <Badge tone="danger" className="mt-1.5">
                  severity {r.severity}
                </Badge>
                {r.note && <p className="mt-1.5 text-xs text-ink-soft">{r.note}</p>}
              </li>
            ))}
          </RiskColumn>

          <RiskColumn
            title="Could be clipped"
            icon={<Scissors className="h-4 w-4 text-cobalt" />}
            empty="No obvious out-of-context screenshots."
            isEmpty={result.clipRisks.length === 0}
          >
            {result.clipRisks.map((r, i) => (
              <li key={i} className="rounded-xl bg-sand/60 p-3">
                <p className="text-sm font-medium text-ink">“{r.phrase}”</p>
                {r.whyItClips && <p className="mt-1 text-xs text-ink-soft">{r.whyItClips}</p>}
              </li>
            ))}
          </RiskColumn>
        </div>
      )}

      {/* Rewrites */}
      <Card className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <SectionTitle>Rewrites that keep your voice</SectionTitle>
          <div className="flex gap-1.5 rounded-full bg-ink/[0.05] p-1">
            {(['clearer', 'sharper', 'safer'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setRewriteMode(m)}
                className={cn(
                  'rounded-full px-3.5 py-1 text-xs font-medium capitalize transition',
                  rewriteMode === m ? 'bg-white text-ink shadow-object-sm' : 'text-ink-soft hover:text-ink',
                )}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-4 rounded-2xl border border-rule bg-paper/50 p-4">
          <p className="whitespace-pre-wrap text-[0.95rem] leading-relaxed text-ink">
            {activeRewrite.text}
          </p>
          {activeRewrite.rationale && (
            <p className="mt-3 border-t border-rule pt-3 text-xs text-ink-soft">
              {activeRewrite.rationale}
            </p>
          )}
          <div className="mt-3">
            <CopyButton text={activeRewrite.text} label={`Copy ${rewriteMode} version`} />
          </div>
        </div>

        <div className="mt-5 rounded-2xl bg-gradient-to-br from-lavender/60 to-blush/50 p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-cobalt">
              Recommended final version
            </p>
            <CopyButton
              text={result.recommendedVersion}
              label="Copy"
              variant="primary"
              className="shrink-0"
            />
          </div>
          <p className="mt-2 whitespace-pre-wrap text-[0.98rem] leading-relaxed text-ink">
            {result.recommendedVersion}
          </p>
        </div>
      </Card>

      {/* Progressive disclosure: keep / generic / platform / assumptions */}
      <div className="grid gap-3 sm:grid-cols-2">
        <ListDisclosure title="Keep this — don't change it" items={result.preserve} tone="mint" />
        <ListDisclosure
          title="Sounds generic or AI-written"
          items={result.genericOrAIWrittenSignals}
          tone="blush"
        />
        <ListDisclosure title="Platform notes" items={result.platformNotes} tone="ice" />
        <ListDisclosure title="Assumptions the model made" items={result.assumptions} tone="neutral" />
      </div>

      <p className="pt-1 text-center text-xs text-ink-soft">
        Generated by {model}. ReadRoom simulates interpretation; it does not predict outcomes or
        verify facts.
      </p>
    </div>
  );
}

function SectionTitle({
  children,
  icon,
}: {
  children: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-ink-soft">
      {icon}
      {children}
    </h3>
  );
}

function RiskColumn({
  title,
  icon,
  empty,
  isEmpty,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  empty: string;
  isEmpty: boolean;
  children: React.ReactNode;
}) {
  return (
    <Card className="p-5">
      <SectionTitle icon={icon}>{title}</SectionTitle>
      {isEmpty ? (
        <p className="mt-3 text-sm text-ink-soft">{empty}</p>
      ) : (
        <ul className="mt-3 space-y-2">{children}</ul>
      )}
    </Card>
  );
}

function ListDisclosure({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: 'mint' | 'blush' | 'ice' | 'neutral';
}) {
  const [open, setOpen] = useState(false);
  if (!items.length) return null;
  const dot: Record<string, string> = {
    mint: 'bg-[#0f7a54]',
    blush: 'bg-[#b0347a]',
    ice: 'bg-[#0f6f86]',
    neutral: 'bg-ink-soft',
  };
  return (
    <Card className="overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between p-4 text-left"
        aria-expanded={open}
      >
        <span className="text-sm font-medium text-ink">
          {title} <span className="text-ink-soft">({items.length})</span>
        </span>
        <ChevronDown className={cn('h-4 w-4 text-ink-soft transition', open && 'rotate-180')} />
      </button>
      {open && (
        <ul className="space-y-2 px-4 pb-4">
          {items.map((it, i) => (
            <li key={i} className="flex gap-2 text-sm text-ink-soft">
              <span className={cn('mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full', dot[tone])} />
              {it}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
