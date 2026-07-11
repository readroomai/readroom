'use client';

import { useState, useTransition } from 'react';
import { Download, Trash2, Check, ShieldCheck } from 'lucide-react';
import { Button, Card, Label, Select, Badge, Spinner } from '@/components/ui';
import {
  updateSettingsAction,
  exportUserDataAction,
  deleteAccountDataAction,
} from '@/app/actions/account';

type Option = { id: string; name: string };

export function SettingsForm({
  rooms,
  voiceprints,
  defaultRoomId,
  defaultVoiceprintId,
  retention,
  isDevAuth,
}: {
  rooms: Option[];
  voiceprints: Option[];
  defaultRoomId: string | null;
  defaultVoiceprintId: string | null;
  retention: 'keep' | 'auto_delete_30d';
  isDevAuth: boolean;
}) {
  const [room, setRoom] = useState(defaultRoomId ?? '');
  const [voice, setVoice] = useState(defaultVoiceprintId ?? '');
  const [ret, setRet] = useState(retention);
  const [saved, setSaved] = useState(false);
  const [pending, start] = useTransition();

  function save() {
    start(async () => {
      await updateSettingsAction({
        defaultRoomId: room || null,
        defaultVoiceprintId: voice || null,
        dataRetentionPreference: ret,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 1600);
    });
  }

  async function exportData() {
    const json = await exportUserDataAction();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'readroom-export.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-5">
      <Card className="p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-soft">Defaults</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="dr">Default room</Label>
            <Select id="dr" value={room} onChange={(e) => setRoom(e.target.value)}>
              <option value="">General audience</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="dv">Default Voiceprint</Label>
            <Select id="dv" value={voice} onChange={(e) => setVoice(e.target.value)}>
              <option value="">None</option>
              {voiceprints.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="ret">Data retention</Label>
            <Select id="ret" value={ret} onChange={(e) => setRet(e.target.value as typeof ret)}>
              <option value="keep">Keep my reads until I delete them</option>
              <option value="auto_delete_30d">Auto-delete reads after 30 days</option>
            </Select>
          </div>
        </div>
        <div className="mt-4">
          <Button onClick={save} disabled={pending}>
            {pending ? <Spinner /> : saved ? <Check className="h-4 w-4" /> : null}
            {saved ? 'Saved' : 'Save settings'}
          </Button>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-ink-soft" />
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-soft">Your data</h2>
        </div>
        <p className="mt-2 text-sm text-ink-soft">
          Export a full copy of your account data, or permanently delete your account and everything tied to it.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="outline" onClick={exportData}>
            <Download className="h-4 w-4" /> Export my data
          </Button>
          <Button
            variant="outline"
            className="border-red-200 text-red-600 hover:bg-red-50"
            onClick={() => {
              if (
                window.confirm(
                  'Permanently delete your account and all associated data? This cannot be undone.',
                )
              ) {
                start(() => deleteAccountDataAction());
              }
            }}
            disabled={pending}
          >
            <Trash2 className="h-4 w-4" /> Delete account & data
          </Button>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-soft">Plan</h2>
            <p className="mt-1 text-sm text-ink-soft">
              You&apos;re on the free public beta — {isDevAuth ? 'local mode' : 'signed in'}. 5 reads/day.
            </p>
          </div>
          <Badge tone="iris">Pro coming later</Badge>
        </div>
      </Card>
    </div>
  );
}
