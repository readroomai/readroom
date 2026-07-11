'use client';

import { useState, useTransition } from 'react';
import { GitCompareArrows, Plus, X, AlertCircle, Trophy } from 'lucide-react';
import { Button, Card, Input, Label, Textarea, Select, Badge, Spinner } from '@/components/ui';
import { CopyButton } from '@/components/copy-button';
import { AnalysingState } from './analysing-state';
import { runCompareAction } from '@/app/actions/analysis';
import { PLATFORMS, GOALS, type PlatformId, type GoalId } from '@/lib/constants';
import type { CompareResult } from '@/lib/ai/schemas';

type RoomOption = { id: string; name: string };

export function CompareWorkspace({ rooms }: { rooms: RoomOption[] }) {
  const [variants, setVariants] = useState([
    { label: 'A', content: '' },
    { label: 'B', content: '' },
  ]);
  const [platform, setPlatform] = useState<PlatformId>('x');
  const [goal, setGoal] = useState<GoalId>('discussion');
  const [roomId, setRoomId] = useState('');
  const [pending, start] = useTransition();
  const [result, setResult] = useState<{ result: CompareResult; isDemo: boolean; model: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  function run() {
    const filled = variants.filter((v) => v.content.trim());
    if (filled.length < 2) return setError('Fill in at least two variants.');
    setError(null);
    setResult(null);
    start(async () => {
      const res = await runCompareAction({ platform, goal, roomId: roomId || undefined, variants: filled });
      if (res.ok) setResult({ result: res.data.result, isDemo: res.data.isDemo, model: res.data.model });
      else setError(res.error);
    });
  }

  return (
    <div className="space-y-6">
      <Card className="p-5 sm:p-6">
        <div className="mb-4 grid gap-3 sm:grid-cols-3">
          <div>
            <Label htmlFor="cp">Platform</Label>
            <Select id="cp" value={platform} onChange={(e) => setPlatform(e.target.value as PlatformId)}>
              {PLATFORMS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="cg">Goal</Label>
            <Select id="cg" value={goal} onChange={(e) => setGoal(e.target.value as GoalId)}>
              {GOALS.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.label}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="cr">Room</Label>
            <Select id="cr" value={roomId} onChange={(e) => setRoomId(e.target.value)}>
              <option value="">General audience</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {variants.map((v, i) => (
            <div key={i} className="rounded-2xl border border-rule bg-white p-3">
              <div className="mb-2 flex items-center justify-between">
                <Input
                  value={v.label}
                  onChange={(e) =>
                    setVariants((vs) => vs.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))
                  }
                  className="h-7 w-24 text-sm font-medium"
                  aria-label={`Variant ${i + 1} label`}
                />
                {variants.length > 2 && (
                  <button
                    type="button"
                    onClick={() => setVariants((vs) => vs.filter((_, j) => j !== i))}
                    className="rounded-full p-1 text-ink-soft hover:text-ink"
                    aria-label="Remove variant"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <Textarea
                rows={6}
                value={v.content}
                onChange={(e) =>
                  setVariants((vs) => vs.map((x, j) => (j === i ? { ...x, content: e.target.value } : x)))
                }
                placeholder={`Variant ${v.label}…`}
              />
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          {variants.length < 4 ? (
            <Button
              variant="subtle"
              size="sm"
              onClick={() =>
                setVariants((vs) => [...vs, { label: String.fromCharCode(65 + vs.length), content: '' }])
              }
            >
              <Plus className="h-3.5 w-3.5" /> Add variant
            </Button>
          ) : (
            <span className="text-xs text-ink-soft">Up to 4 variants</span>
          )}
          <Button onClick={run} variant="accent" size="lg" disabled={pending}>
            {pending ? <Spinner /> : <GitCompareArrows className="h-4 w-4" />}
            {pending ? 'Comparing…' : 'Compare variants'}
          </Button>
        </div>

        {error && (
          <p className="mt-3 flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
            <AlertCircle className="h-4 w-4" /> {error}
          </p>
        )}
      </Card>

      <div aria-live="polite">
        {pending && <AnalysingState />}
        {result && !pending && <CompareResultView data={result.result} isDemo={result.isDemo} model={result.model} />}
      </div>
    </div>
  );
}

export function CompareResultView({
  data,
  isDemo,
  model,
}: {
  data: CompareResult;
  isDemo: boolean;
  model: string;
}) {
  const awards: [string, string][] = [
    ['Best hook', data.bestHookLabel],
    ['Best closing', data.bestClosingLabel],
    ['Most authentic', data.mostAuthenticLabel],
    ['Most discussion', data.mostDiscussionLabel],
    ['Most misunderstood', data.mostMisunderstoodLabel],
  ];
  return (
    <div className="space-y-5">
      <Card className="p-6">
        <div className="mb-3 flex items-center gap-2">
          <Badge tone="iris">Comparison</Badge>
          {isDemo ? <Badge tone="warn">Local demo engine</Badge> : <Badge tone="mint">Live model</Badge>}
        </div>
        <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-br from-mint/60 to-ice/50 p-5">
          <Trophy className="h-8 w-8 text-[#0f7a54]" />
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-[#0f7a54]">Predicted winner</p>
            <p className="text-xl font-semibold text-ink">{data.predictedWinnerLabel}</p>
          </div>
        </div>
        <p className="mt-3 text-sm text-ink-soft">{data.reason}</p>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {awards.map(([label, winner]) => (
          <Card key={label} className="p-4 text-center">
            <p className="text-[10px] uppercase tracking-wide text-ink-soft">{label}</p>
            <p className="mt-1 text-lg font-semibold text-ink">{winner}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Card className="p-5">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-ink-soft">By dimension</h3>
          <ul className="mt-3 space-y-2">
            {data.dimensionComparison.map((d, i) => (
              <li key={i} className="flex items-center justify-between gap-2 text-sm">
                <span className="text-ink-soft">{d.dimension}</span>
                <span className="flex items-center gap-2">
                  <Badge tone="iris">{d.winnerLabel}</Badge>
                </span>
              </li>
            ))}
          </ul>
        </Card>
        <Card className="p-5">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-ink-soft">By audience</h3>
          <ul className="mt-3 space-y-2">
            {data.audienceWinners.map((a, i) => (
              <li key={i} className="text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-ink-soft">{a.audience}</span>
                  <Badge tone="mint">{a.winnerLabel}</Badge>
                </div>
                <p className="mt-0.5 text-xs text-ink-soft">{a.why}</p>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card className="p-5">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-ink-soft">Risk comparison</h3>
        <ul className="mt-3 space-y-2">
          {data.riskComparison.map((r, i) => (
            <li key={i} className="flex gap-2 text-sm">
              <Badge tone="neutral">{r.label}</Badge>
              <span className="text-ink-soft">{r.riskNote}</span>
            </li>
          ))}
        </ul>
      </Card>

      <Card className="bg-gradient-to-br from-lavender/50 to-blush/40 p-6">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-cobalt">Recommended hybrid</h3>
          <CopyButton text={data.recommendedHybrid} variant="primary" />
        </div>
        <p className="mt-2 whitespace-pre-wrap text-[0.95rem] leading-relaxed text-ink">{data.recommendedHybrid}</p>
      </Card>

      <p className="text-center text-xs text-ink-soft">
        Generated by {model}. A simulation of likely interpretation — not a guaranteed outcome.
      </p>
    </div>
  );
}
