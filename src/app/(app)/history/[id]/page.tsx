import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { requireUser } from '@/lib/auth';
import { getStore } from '@/lib/store';
import { env } from '@/lib/env';
import { PLATFORMS } from '@/lib/constants';
import { Badge, Card } from '@/components/ui';
import { QuickReadReport } from '@/components/report/quick-read-report';
import { CompareResultView } from '@/components/app/compare-workspace';
import { SharePanel } from '@/components/app/share-panel';
import { formatRelativeDate } from '@/lib/utils';
import type { QuickReadResult, CompareResult } from '@/lib/ai/schemas';

export const metadata: Metadata = { title: 'Report' };

export default async function HistoryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const store = getStore();
  const analysis = await store.getAnalysis(user.id, id);
  if (!analysis) notFound();

  const shareLinks = await store.listShareLinks(user.id, id);
  const platform = PLATFORMS.find((p) => p.id === analysis.platform)?.label ?? analysis.platform;
  const isQuick = analysis.analysisType === 'quick_read';

  return (
    <div className="space-y-6">
      <Link href="/history" className="inline-flex items-center gap-1 text-sm text-ink-soft hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Back to history
      </Link>

      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-xl font-semibold tracking-tight text-ink">{analysis.title}</h1>
        <Badge tone="neutral">{platform}</Badge>
        <Badge tone="iris">{isQuick ? 'Quick Read' : 'Compare'}</Badge>
        {analysis.isDemo && <Badge tone="warn">demo engine</Badge>}
        <span className="text-xs text-ink-soft">{formatRelativeDate(analysis.createdAt)}</span>
      </div>

      <Card className="p-5">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-soft">Your original content</p>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-ink">{analysis.originalText}</p>
      </Card>

      {isQuick ? (
        <QuickReadReport
          result={analysis.result as QuickReadResult}
          isDemo={analysis.isDemo}
          model={analysis.model}
          animate={false}
        />
      ) : (
        <CompareResultView data={analysis.result as CompareResult} isDemo={analysis.isDemo} model={analysis.model} />
      )}

      <SharePanel analysisId={analysis.id} appUrl={env.appUrl} existing={shareLinks} />
    </div>
  );
}
