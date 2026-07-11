import type { Metadata } from 'next';
import { requireUser } from '@/lib/auth';
import { getStore } from '@/lib/store';
import { PageHeading } from '@/components/app/page-heading';
import { RoomsManager } from '@/components/app/rooms-manager';

export const metadata: Metadata = { title: 'Audience Rooms' };

export default async function RoomsPage() {
  const user = await requireUser();
  const rooms = await getStore().listRooms(user.id);
  return (
    <div>
      <PageHeading
        title="Audience Rooms"
        subtitle="Save the people you speak to — their values, objections, and sensitivities — and choose which room you're entering before each read."
      />
      <RoomsManager rooms={rooms} />
    </div>
  );
}
