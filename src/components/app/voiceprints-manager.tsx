'use client';

import { useState, useTransition } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Plus, Star, Copy, Trash2, Fingerprint, X, AlertCircle } from 'lucide-react';
import { Button, Card, Input, Label, Textarea, Badge, Spinner } from '@/components/ui';
import { VoiceprintTraitsView } from './voiceprint-traits-view';
import {
  createVoiceprintAction,
  setDefaultVoiceprintAction,
  deleteVoiceprintAction,
  duplicateVoiceprintAction,
} from '@/app/actions/voiceprints';
import type { VoiceprintRecord } from '@/lib/store/types';

export function VoiceprintsManager({ voiceprints }: { voiceprints: VoiceprintRecord[] }) {
  const [building, setBuilding] = useState(false);
  const [viewing, setViewing] = useState<VoiceprintRecord | null>(null);
  const [pending, start] = useTransition();

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button onClick={() => setBuilding(true)}>
          <Plus className="h-4 w-4" /> Build Voiceprint
        </Button>
      </div>

      {voiceprints.length === 0 ? (
        <Card className="p-10 text-center">
          <Fingerprint className="mx-auto h-8 w-8 text-ink-soft" />
          <p className="mt-3 text-sm text-ink-soft">
            No Voiceprints yet. Paste a few of your real posts and ReadRoom will learn how you sound —
            so rewrites always stay yours.
          </p>
          <Button className="mt-4" onClick={() => setBuilding(true)}>
            <Plus className="h-4 w-4" /> Build your first
          </Button>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {voiceprints.map((v) => (
            <Card key={v.id} className="p-5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-ink">{v.name}</h3>
                  {v.isDefault && <Badge tone="iris">default</Badge>}
                </div>
              </div>
              <p className="mt-1 line-clamp-2 text-sm text-ink-soft">{v.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button variant="subtle" size="sm" onClick={() => setViewing(v)}>
                  View
                </Button>
                {!v.isDefault && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => start(() => setDefaultVoiceprintAction(v.id))}
                    disabled={pending}
                  >
                    <Star className="h-3.5 w-3.5" /> Default
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => start(() => duplicateVoiceprintAction(v.id))}
                  disabled={pending}
                >
                  <Copy className="h-3.5 w-3.5" /> Duplicate
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (window.confirm(`Delete “${v.name}”?`)) start(() => deleteVoiceprintAction(v.id));
                  }}
                  disabled={pending}
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <BuilderDialog open={building} onClose={() => setBuilding(false)} />

      <Dialog.Root open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/25 backdrop-blur-sm" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[88vh] w-[min(94vw,44rem)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-rule bg-white p-6 shadow-object-sm rr-scroll focus:outline-none">
            <div className="mb-4 flex items-center justify-between">
              <Dialog.Title className="text-lg font-semibold text-ink">{viewing?.name}</Dialog.Title>
              <Dialog.Close className="rounded-full p-1.5 text-ink-soft hover:text-ink" aria-label="Close">
                <X className="h-4 w-4" />
              </Dialog.Close>
            </div>
            {viewing && <VoiceprintTraitsView traits={viewing.extractedTraits} />}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}

function BuilderDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [name, setName] = useState('');
  const [samples, setSamples] = useState('');
  const [frequent, setFrequent] = useState('');
  const [banned, setBanned] = useState('');
  const [nonNeg, setNonNeg] = useState('');
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const csv = (s: string) => s.split(',').map((x) => x.trim()).filter(Boolean);
  const splitSamples = (s: string) =>
    s.includes('\n---\n')
      ? s.split('\n---\n').map((x) => x.trim()).filter(Boolean)
      : s.split(/\n{2,}/).map((x) => x.trim()).filter(Boolean);

  function submit() {
    const list = splitSamples(samples);
    if (!name.trim()) return setError('Give your Voiceprint a name.');
    if (list.length === 0) return setError('Paste at least one writing sample.');
    setError(null);
    start(async () => {
      const res = await createVoiceprintAction({
        name: name.trim(),
        samples: list,
        frequentPhrases: csv(frequent),
        bannedPhrases: csv(banned),
        nonNegotiables: csv(nonNeg),
      });
      if (res.ok) {
        setName('');
        setSamples('');
        setFrequent('');
        setBanned('');
        setNonNeg('');
        onClose();
      } else {
        setError(res.error);
      }
    });
  }

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/25 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[88vh] w-[min(94vw,42rem)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-rule bg-white p-6 shadow-object-sm rr-scroll focus:outline-none">
          <div className="mb-4 flex items-center justify-between">
            <Dialog.Title className="text-lg font-semibold text-ink">Build a Voiceprint</Dialog.Title>
            <Dialog.Close className="rounded-full p-1.5 text-ink-soft hover:text-ink" aria-label="Close">
              <X className="h-4 w-4" />
            </Dialog.Close>
          </div>
          <p className="mb-4 text-sm text-ink-soft">
            Paste 5–20 of your real posts, separated by a blank line (or a line with{' '}
            <code className="rounded bg-ink/[0.06] px-1">---</code>). ReadRoom never claims to perfectly
            reproduce you — it builds a practical style guide so rewrites keep your voice.
          </p>

          <div className="space-y-4">
            <div>
              <Label htmlFor="vn">Name</Label>
              <Input id="vn" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. My X voice" />
            </div>
            <div>
              <Label htmlFor="vs">Writing samples</Label>
              <Textarea
                id="vs"
                rows={9}
                value={samples}
                onChange={(e) => setSamples(e.target.value)}
                placeholder={'Paste a post here.\n\nAnother post here.\n\nAnd another…'}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="vf">Phrases you use often</Label>
                <Input id="vf" value={frequent} onChange={(e) => setFrequent(e.target.value)} placeholder="comma-separated" />
              </div>
              <div>
                <Label htmlFor="vb">Phrases to never use</Label>
                <Input id="vb" value={banned} onChange={(e) => setBanned(e.target.value)} placeholder="comma-separated" />
              </div>
            </div>
            <div>
              <Label htmlFor="vnn">Positions you don&apos;t want softened</Label>
              <Input id="vnn" value={nonNeg} onChange={(e) => setNonNeg(e.target.value)} placeholder="comma-separated" />
            </div>

            {error && (
              <p className="flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
                <AlertCircle className="h-4 w-4" /> {error}
              </p>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={submit} disabled={pending} variant="accent">
                {pending ? <Spinner /> : <Fingerprint className="h-4 w-4" />}
                {pending ? 'Learning your voice…' : 'Build Voiceprint'}
              </Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
