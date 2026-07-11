import type { Metadata } from 'next';
import { requireUser } from '@/lib/auth';
import { getStore } from '@/lib/store';
import { PageHeading } from '@/components/app/page-heading';
import { HistoryList } from '@/components/app/history-list';

export const metadata: Metadata = { title: 'History' };

export default async function HistoryPage() {
  const user = await requireUser();
  const analyses = await getStore().listAnalyses(user.id);
  return (
    <div>
      <PageHeading title="History" subtitle="Every read you've run. Search, filter, favourite, re-open, or share." />
      <HistoryList analyses={analyses} />
    </div>
  );
}
