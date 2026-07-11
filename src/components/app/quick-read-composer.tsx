'use client';

import { useRef, useState, useTransition } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ChevronDown,
  ImagePlus,
  X,
  AlertCircle,
  ArrowUpRight,
} from 'lucide-react';
import { Button, Card, Label, Select, Textarea, Spinner, Badge } from '@/components/ui';
import { PillGroup } from '@/components/ui';
import {
  PLATFORMS,
  CONTENT_FORMATS,
  GOALS,
  TONES,
  RISK_LEVELS,
  type PlatformId,
  type FormatId,
  type GoalId,
  type ToneId,
  type RiskId,
} from '@/lib/constants';
import { runQuickReadAction, type QuickReadResponse } from '@/app/actions/analysis';
import { QuickReadReport } from '@/components/report/quick-read-report';
import { AnalysingState } from './analysing-state';

type RoomOption = { id: string; name: string };
type VoiceOption = { id: string; name: string; isDefault: boolean };

export function QuickReadComposer({
  rooms,
  voiceprints,
  defaultRoomId,
  initialText = '',
  compact = false,
}: {
  rooms: RoomOption[];
  voiceprints: VoiceOption[];
  defaultRoomId?: string | null;
  initialText?: string;
  compact?: boolean;
}) {
  const [text, setText] = useState(initialText);
  const [platform, setPlatform] = useState<PlatformId>('x');
  const [format, setFormat] = useState<FormatId>('post');
  const [goal, setGoal] = useState<GoalId>('authority');
  const [customGoal, setCustomGoal] = useState('');
  const [tone, setTone] = useState<ToneId>('direct');
  const [risk, setRisk] = useState<RiskId>('balanced');
  const [context, setContext] = useState('');
  const [roomId, setRoomId] = useState<string>(defaultRoomId ?? '');
  const [voiceprintId, setVoiceprintId] = useState<string>(
    voiceprints.find((v) => v.isDefault)?.id ?? '',
  );
  const [image, setImage] = useState<{ base64: string; mediaType: string; name: string } | null>(
    null,
  );
  const [showAdvanced, setShowAdvanced] = useState(!compact);
  const [pending, start] = useTransition();
  const [response, setResponse] = useState<QuickReadResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function run() {
    if (!text.trim() && !image) {
      setError('Add some content or a screenshot to read.');
      return;
    }
    setError(null);
    setResponse(null);
    start(async () => {
      const res = await runQuickReadAction({
        text: text.trim() || '(see attached screenshot)',
        platform,
        format,
        goal,
        customGoal: goal === 'custom' ? customGoal : undefined,
        tone,
        risk,
        context: context || undefined,
        roomId: roomId || undefined,
        voiceprintId: voiceprintId || undefined,
        imageBase64: image?.base64,
        imageMediaType: image?.mediaType as 'image/png' | 'image/jpeg' | 'image/webp' | undefined,
      });
      if (res.ok) setResponse(res.data);
      else setError(res.error);
    });
  }

  async function onPickImage(file: File) {
    if (file.size > 10 * 1024 * 1024) {
      setError('Images must be under 10 MB.');
      return;
    }
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      setError('Use a PNG, JPEG, or WebP screenshot.');
      return;
    }
    const buf = await file.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(buf)));
    setImage({ base64, mediaType: file.type, name: file.name });
    setError(null);
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <div className="p-5 sm:p-6">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <PillGroup
              options={PLATFORMS.map((p) => ({ id: p.id, label: p.label, hint: p.hint }))}
              value={platform}
              onChange={(v) => setPlatform(v)}
              size="sm"
            />
          </div>

          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                e.preventDefault();
                run();
              }
            }}
            rows={compact ? 5 : 7}
            placeholder="Paste the post, caption, email, bio, or message you're about to publish…"
            aria-label="Content to read"
            className="resize-y"
          />

          {image && (
            <div className="mt-2 flex items-center gap-2 rounded-xl bg-sand/60 px-3 py-2 text-sm">
              <ImagePlus className="h-4 w-4 text-cobalt" />
              <span className="truncate text-ink">{image.name}</span>
              <button
                type="button"
                onClick={() => setImage(null)}
                className="ml-auto rounded-full p-1 text-ink-soft hover:text-ink"
                aria-label="Remove screenshot"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void onPickImage(f);
                e.target.value = '';
              }}
            />
            <Button variant="subtle" size="sm" onClick={() => fileRef.current?.click()} type="button">
              <ImagePlus className="h-3.5 w-3.5" /> Screenshot
            </Button>
            <button
              type="button"
              onClick={() => setShowAdvanced((s) => !s)}
              className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm text-ink-soft transition hover:text-ink"
              aria-expanded={showAdvanced}
            >
              Room, goal & voice
              <ChevronDown className={`h-3.5 w-3.5 transition ${showAdvanced ? 'rotate-180' : ''}`} />
            </button>
            <span className="ml-auto text-xs text-ink-soft">{text.length} chars</span>
          </div>

          {showAdvanced && (
            <div className="mt-4 grid gap-4 border-t border-rule pt-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="room">Audience room</Label>
                <Select id="room" value={roomId} onChange={(e) => setRoomId(e.target.value)}>
                  <option value="">General audience</option>
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="voice">Voiceprint</Label>
                <Select
                  id="voice"
                  value={voiceprintId}
                  onChange={(e) => setVoiceprintId(e.target.value)}
                >
                  <option value="">None — keep the input voice</option>
                  {voiceprints.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                      {v.isDefault ? ' (default)' : ''}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="format">Format</Label>
                <Select id="format" value={format} onChange={(e) => setFormat(e.target.value as FormatId)}>
                  {CONTENT_FORMATS.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.label}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="goal">Goal</Label>
                <Select id="goal" value={goal} onChange={(e) => setGoal(e.target.value as GoalId)}>
                  {GOALS.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.label}
                    </option>
                  ))}
                </Select>
              </div>
              {goal === 'custom' && (
                <div className="sm:col-span-2">
                  <Label htmlFor="customGoal">Describe your goal</Label>
                  <Textarea
                    id="customGoal"
                    rows={2}
                    value={customGoal}
                    onChange={(e) => setCustomGoal(e.target.value)}
                    placeholder="What outcome are you actually after?"
                  />
                </div>
              )}
              <div>
                <Label>Tone</Label>
                <PillGroup
                  options={TONES.map((t) => ({ id: t.id, label: t.label }))}
                  value={tone}
                  onChange={setTone}
                  size="sm"
                />
              </div>
              <div>
                <Label>Risk tolerance</Label>
                <PillGroup
                  options={RISK_LEVELS.map((r) => ({ id: r.id, label: r.label, hint: r.hint }))}
                  value={risk}
                  onChange={setRisk}
                  size="sm"
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="ctx">Extra context (optional)</Label>
                <Textarea
                  id="ctx"
                  rows={2}
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  placeholder="Anything the reader should know — a link, a prior post, the situation…"
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-rule bg-paper/50 px-5 py-3 sm:px-6">
          <p className="text-xs text-ink-soft">
            Press <kbd className="rounded bg-ink/[0.06] px-1.5 py-0.5 text-[10px]">⌘</kbd>
            <kbd className="rounded bg-ink/[0.06] px-1.5 py-0.5 text-[10px]">Enter</kbd> to run
          </p>
          <Button onClick={run} variant="accent" size="lg" disabled={pending}>
            {pending ? <Spinner /> : <Sparkles className="h-4 w-4" />}
            {pending ? 'Reading the room…' : 'Read the room'}
          </Button>
        </div>
      </Card>

      {error && (
        <Card className="flex items-start gap-3 border-red-200 bg-red-50/60 p-4">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
          <p className="text-sm text-red-700">{error}</p>
        </Card>
      )}

      <div aria-live="polite">
        {pending && <AnalysingState />}
        {response && !pending && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Badge tone="mint">Saved to history</Badge>
                <span className="text-xs text-ink-soft">
                  {response.usage.remaining} of {response.usage.limit} daily reads left
                </span>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href={`/history/${response.analysisId}`}>
                  Open full report <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
            <QuickReadReport
              result={response.result}
              isDemo={response.isDemo}
              model={response.model}
            />
          </div>
        )}
      </div>
    </div>
  );
}
