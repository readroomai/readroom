import type { Metadata } from 'next';
import { requireUser } from '@/lib/auth';
import { getStore } from '@/lib/store';
import { PageHeading } from '@/components/app/page-heading';
import { QuickReadComposer } from '@/components/app/quick-read-composer';

export const metadata: Metadata = { title: 'New Read' };

export default async function NewReadPage() {
  const user = await requireUser();
  const store = getStore();
  const [rooms, voiceprints, settings] = await Promise.all([
    store.listRooms(user.id),
    store.listVoiceprints(user.id),
    store.getSettings(user.id),
  ]);

  return (
    <div>
      <PageHeading
        title="New Room Read"
        subtitle="Paste what you're about to publish, choose who's in the room, and see how it may land."
      />
      <QuickReadComposer
        rooms={rooms.map((r) => ({ id: r.id, name: r.name }))}
        voiceprints={voiceprints.map((v) => ({ id: v.id, name: v.name, isDefault: v.isDefault }))}
        defaultRoomId={settings.defaultRoomId}
      />
    </div>
  );
}
