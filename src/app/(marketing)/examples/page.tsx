import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Badge, Button, Card } from '@/components/ui';
import { QuickReadReport } from '@/components/report/quick-read-report';
import { SAMPLE_POST, SAMPLE_RESULT } from '@/lib/sample';

export const metadata: Metadata = {
  title: 'Example',
  description: 'A full ReadRoom analysis — no sign-in required.',
};

export default function ExamplesPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
      <div className="mb-8 text-center">
        <Badge tone="iris" className="mb-4">
          Sample analysis · no sign-in required
        </Badge>
        <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          One founder post, fully read
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-ink-soft">
          This is a pre-generated example so you can see exactly what a Room Read looks like before you
          sign up. Your own reads run on a live model.
        </p>
      </div>

      <Card className="mb-8 p-6">
        <div className="mb-2 flex items-center gap-2 text-xs font-medium text-ink-soft">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ink text-[10px] font-semibold text-white">
            X
          </span>
          The post · investor + follower room
        </div>
        <p className="whitespace-pre-wrap text-[0.95rem] leading-relaxed text-ink">{SAMPLE_POST}</p>
      </Card>

      <QuickReadReport result={SAMPLE_RESULT} isDemo model="ReadRoom sample" animate={false} />

      <div className="mt-10 text-center">
        <Button asChild size="lg" variant="accent">
          <Link href="/sign-up">
            Read your own post <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
