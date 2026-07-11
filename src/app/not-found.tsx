import Link from 'next/link';
import { Aurora } from '@/components/aurora';
import { Wordmark } from '@/components/brand';
import { Button } from '@/components/ui';

export default function NotFound() {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-paper px-4 text-center">
      <Aurora intensity="subtle" />
      <Wordmark />
      <p className="mt-8 serif text-5xl text-ink">Nobody&apos;s in this room.</p>
      <p className="mt-3 max-w-sm text-ink-soft">
        The page you&apos;re looking for doesn&apos;t exist, or the link has moved on.
      </p>
      <Button asChild className="mt-6">
        <Link href="/">Back home</Link>
      </Button>
    </div>
  );
}
