'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui';
import { Wordmark } from '@/components/brand';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-paper px-4 text-center">
      <Wordmark />
      <p className="mt-8 serif text-4xl text-ink">Something went sideways.</p>
      <p className="mt-3 max-w-sm text-ink-soft">
        We hit an unexpected error. Nothing was published. Try again — and if it keeps happening, come
        back in a moment.
      </p>
      <div className="mt-6 flex gap-3">
        <Button onClick={reset}>Try again</Button>
      </div>
    </div>
  );
}
