'use client';

import { useState, useTransition } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Plus, Pencil, Trash2, Users, X } from 'lucide-react';
import { Button, Card, Input, Label, Textarea, Select, Badge, Spinner } from '@/components/ui';
import { createRoomAction, updateRoomAction, deleteRoomAction } from '@/app/actions/rooms';
import type { AudienceRoomRecord } from '@/lib/store/types';

type Draft = {
  name: string;
  description: string;
  familiarity: string;
  knowledgeLevel: string;
  existingSentiment: string;
  values: string;
  objections: string;
  desiredReaction: string;
  sensitiveTopics: string;
  customContext: string;
};

const EMPTY: Draft = {
  name: '',
  description: '',
  familiarity: 'medium',
  knowledgeLevel: 'medium',
  existingSentiment: 'neutral',
  values: '',
  objections: '',
  desiredReaction: '',
  sensitiveTopics: '',
  customContext: '',
};

function toDraft(r: AudienceRoomRecord): Draft {
  return {
    name: r.name,
    description: r.description ?? '',
    familiarity: r.familiarity ?? 'medium',
    knowledgeLevel: r.knowledgeLevel ?? 'medium',
    existingSentiment: r.existingSentiment ?? 'neutral',
    values: r.values.join(', '),
    objections: r.objections.join(', '),
    desiredReaction: r.desiredReaction ?? '',
    sensitiveTopics: r.sensitiveTopics.join(', '),
    customContext: r.customContext ?? '',
  };
}

const csv = (s: string) => s.split(',').map((x) => x.trim()).filter(Boolean);

export function RoomsManager({ rooms }: { rooms: AudienceRoomRecord[] }) {
  const [editing, setEditing] = useState<AudienceRoomRecord | null>(null);
  const [creating, setCreating] = useState(false);
  const [pending, start] = useTransition();

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button onClick={() => setCreating(true)}>
          <Plus className="h-4 w-4" /> New room
        </Button>
      </div>

      {rooms.length === 0 ? (
        <Card className="p-10 text-center">
          <Users className="mx-auto h-8 w-8 text-ink-soft" />
          <p className="mt-3 text-sm text-ink-soft">No rooms yet. Create the first audience you speak to.</p>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {rooms.map((r) => (
            <Card key={r.id} className="p-5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-ink">{r.name}</h3>
                    {r.isPreset && <Badge tone="neutral">preset</Badge>}
                  </div>
                  {r.description && <p className="mt-1 text-sm text-ink-soft">{r.description}</p>}
                </div>
              </div>
              <dl className="mt-3 grid grid-cols-3 gap-2 text-xs">
                <Meta label="Familiarity" value={r.familiarity} />
                <Meta label="Knowledge" value={r.knowledgeLevel} />
                <Meta label="Sentiment" value={r.existingSentiment} />
              </dl>
              {r.values.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {r.values.slice(0, 4).map((v) => (
                    <Badge key={v} tone="iris">
                      {v}
                    </Badge>
                  ))}
                </div>
              )}
              <div className="mt-4 flex gap-2">
                <Button variant="subtle" size="sm" onClick={() => setEditing(r)}>
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (window.confirm(`Delete “${r.name}”?`)) start(() => deleteRoomAction(r.id));
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

      <RoomDialog
        open={creating || !!editing}
        onClose={() => {
          setCreating(false);
          setEditing(null);
        }}
        initial={editing ? toDraft(editing) : EMPTY}
        onSave={(draft) => {
          const payload = {
            name: draft.name,
            description: draft.description || undefined,
            familiarity: draft.familiarity,
            knowledgeLevel: draft.knowledgeLevel,
            existingSentiment: draft.existingSentiment,
            values: csv(draft.values),
            objections: csv(draft.objections),
            desiredReaction: draft.desiredReaction || undefined,
            sensitiveTopics: csv(draft.sensitiveTopics),
            customContext: draft.customContext || undefined,
          };
          start(async () => {
            if (editing) await updateRoomAction(editing.id, payload);
            else await createRoomAction(payload);
            setCreating(false);
            setEditing(null);
          });
        }}
        pending={pending}
        title={editing ? 'Edit room' : 'New room'}
      />
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="rounded-lg bg-ink/[0.03] p-2">
      <dt className="text-[10px] uppercase tracking-wide text-ink-soft">{label}</dt>
      <dd className="capitalize text-ink">{value ?? '—'}</dd>
    </div>
  );
}

function RoomDialog({
  open,
  onClose,
  initial,
  onSave,
  pending,
  title,
}: {
  open: boolean;
  onClose: () => void;
  initial: Draft;
  onSave: (d: Draft) => void;
  pending: boolean;
  title: string;
}) {
  const [draft, setDraft] = useState<Draft>(initial);
  // reset when opening with a new initial
  const [seen, setSeen] = useState(initial);
  if (seen !== initial) {
    setSeen(initial);
    setDraft(initial);
  }
  const set = (k: keyof Draft, v: string) => setDraft((d) => ({ ...d, [k]: v }));

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/25 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[88vh] w-[min(94vw,40rem)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-rule bg-white p-6 shadow-object-sm rr-scroll focus:outline-none">
          <div className="mb-4 flex items-center justify-between">
            <Dialog.Title className="text-lg font-semibold text-ink">{title}</Dialog.Title>
            <Dialog.Close className="rounded-full p-1.5 text-ink-soft hover:text-ink" aria-label="Close">
              <X className="h-4 w-4" />
            </Dialog.Close>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (draft.name.trim()) onSave(draft);
            }}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="rn">Name</Label>
              <Input id="rn" value={draft.name} onChange={(e) => set('name', e.target.value)} required placeholder="e.g. Crypto-native users" />
            </div>
            <div>
              <Label htmlFor="rd">Short description</Label>
              <Input id="rd" value={draft.description} onChange={(e) => set('description', e.target.value)} placeholder="Who they are in one line" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <SelectField label="Familiarity" value={draft.familiarity} onChange={(v) => set('familiarity', v)} options={['low', 'medium', 'high']} />
              <SelectField label="Knowledge" value={draft.knowledgeLevel} onChange={(v) => set('knowledgeLevel', v)} options={['low', 'medium', 'high']} />
              <SelectField label="Sentiment" value={draft.existingSentiment} onChange={(v) => set('existingSentiment', v)} options={['negative', 'skeptical', 'neutral', 'positive']} />
            </div>
            <div>
              <Label htmlFor="rv">Values (comma-separated)</Label>
              <Input id="rv" value={draft.values} onChange={(e) => set('values', e.target.value)} placeholder="proof, clarity, low risk" />
            </div>
            <div>
              <Label htmlFor="ro">Common objections (comma-separated)</Label>
              <Input id="ro" value={draft.objections} onChange={(e) => set('objections', e.target.value)} placeholder="is this real?, too vague" />
            </div>
            <div>
              <Label htmlFor="rr">Desired reaction</Label>
              <Input id="rr" value={draft.desiredReaction} onChange={(e) => set('desiredReaction', e.target.value)} placeholder="What you want them to feel or do" />
            </div>
            <div>
              <Label htmlFor="rs">Handle carefully (comma-separated)</Label>
              <Input id="rs" value={draft.sensitiveTopics} onChange={(e) => set('sensitiveTopics', e.target.value)} placeholder="pricing, claims" />
            </div>
            <div>
              <Label htmlFor="rc">Extra context</Label>
              <Textarea id="rc" rows={2} value={draft.customContext} onChange={(e) => set('customContext', e.target.value)} />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={pending || !draft.name.trim()}>
                {pending && <Spinner />} Save room
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div>
      <Label>{label}</Label>
      <Select value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </Select>
    </div>
  );
}
