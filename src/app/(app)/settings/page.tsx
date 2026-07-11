import type { Metadata } from 'next';
import { requireUser, isDevAuth } from '@/lib/auth';
import { getStore } from '@/lib/store';
import { PageHeading } from '@/components/app/page-heading';
import { SettingsForm } from '@/components/app/settings-form';

export const metadata: Metadata = { title: 'Settings' };

export default async function SettingsPage() {
  const user = await requireUser();
  const store = getStore();
  const [rooms, voiceprints, settings] = await Promise.all([
    store.listRooms(user.id),
    store.listVoiceprints(user.id),
    store.getSettings(user.id),
  ]);

  return (
    <div>
      <PageHeading title="Settings" subtitle="Defaults, your data, and plan." />
      <SettingsForm
        rooms={rooms.map((r) => ({ id: r.id, name: r.name }))}
        voiceprints={voiceprints.map((v) => ({ id: v.id, name: v.name }))}
        defaultRoomId={settings.defaultRoomId}
        defaultVoiceprintId={settings.defaultVoiceprintId}
        retention={settings.dataRetentionPreference}
        isDevAuth={isDevAuth}
      />
    </div>
  );
}
