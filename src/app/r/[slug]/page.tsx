import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getStore } from '@/lib/store';
import { Aurora } from '@/components/aurora';
import { Wordmark } from '@/components/brand';
import { Button, Card } from '@/components/ui';
import { ShareCard } from '@/components/share/share-card';
import { DownloadCardButton } from '@/components/share/download-card-button';
import type { QuickReadResult } from '@/lib/ai/schemas';

export const metadata: Metadata = {
  title: 'Shared room read',
  robots: { index: false },
};

async function loadShare(slug: string) {
  const store = getStore();
  const link = await store.getShareBySlug(slug);
  if (!link || !link.isActive) return { status: 'inactive' as const };
  if (link.expiresAt && new Date(link.expiresAt) < new Date()) return { status: 'expired' as const };
  const analysis = await store.getAnalysisById(link.analysisId);
  if (!analysis || analysis.analysisType !== 'quick_read') return { status: 'inactive' as const };
  return { status: 'ok' as const, link, analysis };
}

export default async function SharePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await loadShare(slug);

  return (
    <div className="relative flex min-h-dvh flex-col items-center overflow-hidden bg-paper px-4 py-10">
      <Aurora intensity="subtle" />
      <header className="mb-8">
        <Link href="/" aria-label="ReadRoom home">
          <Wordmark />
        </Link>
      </header>

      {data.status !== 'ok' ? (
        <Card className="max-w-md p-8 text-center">
          <p className="serif text-2xl text-ink">
            {data.status === 'expired' ? 'This link has expired' : 'This link is no longer active'}
          </p>
          <p className="mt-2 text-sm text-ink-soft">
            The person who shared this report has {data.status === 'expired' ? 'let it expire' : 'revoked the link'}.
          </p>
          <Button asChild className="mt-5">
            <Link href="/">
              Try ReadRoom <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </Card>
      ) : (
        <div className="w-full">
          <ShareCard
            result={data.analysis.result as QuickReadResult}
            originalText={data.link.showOriginalContent ? data.analysis.originalText : null}
          />
          <div className="mx-auto mt-6 flex max-w-lg flex-wrap items-center justify-center gap-3">
            <DownloadCardButton slug={slug} />
            <Button asChild variant="accent">
              <Link href="/sign-up">
                Read your own post <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <p className="mx-auto mt-4 max-w-lg text-center text-xs text-ink-soft">
            This is an AI simulation of how the content may be interpreted, shared voluntarily by its author.
          </p>
        </div>
      )}
    </div>
  );
}
