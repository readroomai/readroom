'use client';

import { useState, useTransition } from 'react';
import { UserSearch, AlertCircle, Copy } from 'lucide-react';
import { Button, Card, Input, Label, Textarea, Badge, Spinner } from '@/components/ui';
import { CopyButton } from '@/components/copy-button';
import { AnalysingState } from './analysing-state';
import { runProfileAuditAction } from '@/app/actions/audit';
import type { ProfileAuditResult } from '@/lib/ai/schemas';
import { scoreBand } from '@/lib/utils';

export function ProfileAuditWorkspace() {
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [pinned, setPinned] = useState('');
  const [posts, setPosts] = useState('');
  const [audience, setAudience] = useState('');
  const [positioning, setPositioning] = useState('');
  const [cta, setCta] = useState('');
  const [pending, start] = useTransition();
  const [result, setResult] = useState<{ result: ProfileAuditResult; isDemo: boolean; model: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  function run() {
    const postList = posts.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
    if (!displayName.trim()) return setError('Add your display name.');
    if (!bio.trim()) return setError('Add your current bio.');
    if (postList.length === 0) return setError('Add at least one representative post.');
    setError(null);
    setResult(null);
    start(async () => {
      const res = await runProfileAuditAction({
        displayName: displayName.trim(),
        bio: bio.trim(),
        pinnedPost: pinned || undefined,
        posts: postList,
        targetAudience: audience || undefined,
        desiredPositioning: positioning || undefined,
        primaryCta: cta || undefined,
      });
      if (res.ok) setResult({ result: res.data.result, isDemo: res.data.isDemo, model: res.data.model });
      else setError(res.error);
    });
  }

  return (
    <div className="space-y-6">
      <Card className="p-5 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="dn">Display name</Label>
            <Input id="dn" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your name / handle" />
          </div>
          <div>
            <Label htmlFor="aud">Target audience</Label>
            <Input id="aud" value={audience} onChange={(e) => setAudience(e.target.value)} placeholder="Who you want to reach" />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="bio">Current bio</Label>
            <Textarea id="bio" rows={2} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Paste your bio exactly as it appears" />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="pin">Pinned post (optional)</Label>
            <Textarea id="pin" rows={2} value={pinned} onChange={(e) => setPinned(e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="posts">Representative posts</Label>
            <Textarea
              id="posts"
              rows={7}
              value={posts}
              onChange={(e) => setPosts(e.target.value)}
              placeholder={'Paste 3–10 posts, separated by a blank line.'}
            />
          </div>
          <div>
            <Label htmlFor="pos">Desired positioning</Label>
            <Input id="pos" value={positioning} onChange={(e) => setPositioning(e.target.value)} placeholder="What you want to be known for" />
          </div>
          <div>
            <Label htmlFor="cta">Primary call to action</Label>
            <Input id="cta" value={cta} onChange={(e) => setCta(e.target.value)} placeholder="What should visitors do?" />
          </div>
        </div>

        {error && (
          <p className="mt-4 flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
            <AlertCircle className="h-4 w-4" /> {error}
          </p>
        )}

        <div className="mt-5 flex justify-end">
          <Button onClick={run} variant="accent" size="lg" disabled={pending}>
            {pending ? <Spinner /> : <UserSearch className="h-4 w-4" />}
            {pending ? 'Auditing…' : 'Audit my profile'}
          </Button>
        </div>
      </Card>

      <div aria-live="polite">
        {pending && <AnalysingState />}
        {result && !pending && <ProfileAuditResultView data={result.result} isDemo={result.isDemo} model={result.model} />}
      </div>
    </div>
  );
}

export function ProfileAuditResultView({
  data,
  isDemo,
  model,
}: {
  data: ProfileAuditResult;
  isDemo: boolean;
  model: string;
}) {
  const scores = [
    ['Positioning', data.scores.positioning],
    ['Credibility', data.scores.credibility],
    ['Consistency', data.scores.consistency],
    ['Memorability', data.scores.memorability],
    ['Differentiation', data.scores.differentiation],
  ] as const;

  return (
    <div className="space-y-5">
      <Card className="p-6">
        <div className="mb-4 flex items-center gap-2">
          <Badge tone="iris">Profile audit</Badge>
          {isDemo ? <Badge tone="warn">Local demo engine</Badge> : <Badge tone="mint">Live model</Badge>}
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {scores.map(([label, score]) => {
            const band = scoreBand(score);
            return (
              <div key={label} className="rounded-2xl border border-rule bg-white p-3 text-center">
                <p className="text-2xl font-semibold tabular-nums text-ink">{score}</p>
                <p className="text-[11px] text-ink-soft">{label}</p>
                <p className="mt-1 text-[10px] font-medium text-ink-soft">{band.label}</p>
              </div>
            );
          })}
        </div>
        <div className="mt-4 rounded-2xl bg-sand/60 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-cobalt">First impression</p>
          <p className="mt-1 text-sm text-ink">{data.firstImpression}</p>
        </div>
      </Card>

      <div className="grid gap-5 sm:grid-cols-2">
        <ListCard title="What it appears to be about" body={data.appearsToBeAbout} />
        <ListCard title="Still unclear" items={data.unclear} />
        <ListCard title="Credibility signals" items={data.credibilitySignals} tone="mint" />
        <ListCard title="Missing proof" items={data.missingProof} tone="blush" />
        <ListCard title="Positioning gaps" items={data.positioningGaps} />
        {data.audienceMismatch && <ListCard title="Audience mismatch" body={data.audienceMismatch} />}
      </div>

      <Card className="p-6">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-ink-soft">Recommended positioning</h3>
        <p className="mt-2 text-[0.95rem] text-ink">{data.recommendedPositioning}</p>
        <div className="mt-4 grid gap-3">
          {data.revisedBios.map((b, i) => (
            <div key={i} className="flex items-start gap-2 rounded-xl border border-rule bg-paper/50 p-3">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sand text-[10px] font-semibold text-cobalt">
                {i + 1}
              </span>
              <p className="flex-1 text-sm text-ink">{b}</p>
              <CopyButton text={b} variant="ghost" size="sm" label="" copiedLabel="" />
            </div>
          ))}
        </div>
      </Card>

      <div className="grid gap-5 sm:grid-cols-2">
        <Card className="p-6">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-ink-soft">Content pillars</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {data.contentPillars.map((p, i) => (
              <Badge key={i} tone="iris">
                {p}
              </Badge>
            ))}
          </div>
          <h3 className="mt-5 text-sm font-semibold uppercase tracking-wide text-ink-soft">Pinned post structure</h3>
          <p className="mt-2 text-sm text-ink-soft">{data.pinnedPostStructure}</p>
          <h3 className="mt-5 text-sm font-semibold uppercase tracking-wide text-ink-soft">Suggested CTA</h3>
          <p className="mt-2 text-sm text-ink">{data.suggestedCta}</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-ink-soft">7-day plan</h3>
          <ol className="mt-3 space-y-2">
            {data.sevenDayPlan.map((d) => (
              <li key={d.day} className="flex gap-3 text-sm">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink text-[11px] font-semibold text-white">
                  {d.day}
                </span>
                <span className="text-ink-soft">{d.action}</span>
              </li>
            ))}
          </ol>
        </Card>
      </div>

      <p className="text-center text-xs text-ink-soft">
        Generated by {model}. A positioning simulation — it never invents credentials or claims you are
        something you haven&apos;t shown.
      </p>
    </div>
  );
}

function ListCard({
  title,
  items,
  body,
  tone = 'neutral',
}: {
  title: string;
  items?: string[];
  body?: string;
  tone?: 'neutral' | 'mint' | 'blush';
}) {
  const dot = tone === 'mint' ? 'bg-[#0f7a54]' : tone === 'blush' ? 'bg-[#b0347a]' : 'bg-ink-soft';
  return (
    <Card className="p-5">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-ink-soft">{title}</h3>
      {body && <p className="mt-2 text-sm text-ink">{body}</p>}
      {items && items.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {items.map((it, i) => (
            <li key={i} className="flex gap-2 text-sm text-ink-soft">
              <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${dot}`} />
              {it}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
