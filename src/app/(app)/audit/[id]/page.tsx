import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { requireUser } from '@/lib/auth';
import { getStore } from '@/lib/store';
import { ProfileAuditResultView } from '@/components/app/profile-audit-workspace';

export const metadata: Metadata = { title: 'Audit report' };

export default async function AuditDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const audit = await getStore().getProfileAudit(user.id, id);
  if (!audit) notFound();

  return (
    <div>
      <Link href="/audit" className="mb-4 inline-flex items-center gap-1 text-sm text-ink-soft hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Back to Profile Audit
      </Link>
      <ProfileAuditResultView data={audit.result} isDemo={audit.isDemo} model={audit.model} />
    </div>
  );
}
