import type { Metadata } from 'next';
import { requireUser } from '@/lib/auth';
import { getStore } from '@/lib/store';
import { PageHeading } from '@/components/app/page-heading';
import { ProfileAuditWorkspace } from '@/components/app/profile-audit-workspace';
import { Card } from '@/components/ui';
import { formatRelativeDate } from '@/lib/utils';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Profile Audit' };

export default async function AuditPage() {
  const user = await requireUser();
  const past = await getStore().listProfileAudits(user.id);
  return (
    <div>
      <PageHeading
        title="Profile Audit"
        subtitle="See how your bio, pinned post, and recent content position you — and get a practical seven-day fix."
      />
      <ProfileAuditWorkspace />
      {past.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-soft">Past audits</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {past.map((a) => (
              <Link key={a.id} href={`/audit/${a.id}`}>
                <Card className="flex items-center justify-between p-4 transition hover:shadow-object-sm">
                  <div>
                    <p className="text-sm font-medium text-ink">
                      {(a.input as { displayName?: string }).displayName ?? 'Profile'} audit
                    </p>
                    <p className="text-xs text-ink-soft">{formatRelativeDate(a.createdAt)}</p>
                  </div>
                  <span className="text-lg font-semibold tabular-nums text-ink">
                    {a.result.scores.positioning}
                  </span>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
