import type { Metadata } from 'next';
import { requireUser } from '@/lib/auth';
import { getStore } from '@/lib/store';
import { PageHeading } from '@/components/app/page-heading';
import { CompareWorkspace } from '@/components/app/compare-workspace';

export const metadata: Metadata = { title: 'Compare' };

export default async function ComparePage() {
  const user = await requireUser();
  const rooms = await getStore().listRooms(user.id);
  return (
    <div>
      <PageHeading
        title="Compare variants"
        subtitle="Put 2–4 versions side by side and see which one is most likely to land — and which one gets misread."
      />
      <CompareWorkspace rooms={rooms.map((r) => ({ id: r.id, name: r.name }))} />
    </div>
  );
}
