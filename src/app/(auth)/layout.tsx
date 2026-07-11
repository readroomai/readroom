import Link from 'next/link';
import { Aurora } from '@/components/aurora';
import { Wordmark } from '@/components/brand';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-paper px-4">
      <Aurora />
      <Link href="/" className="mb-8" aria-label="ReadRoom home">
        <Wordmark />
      </Link>
      <main id="main" className="w-full max-w-md">
        {children}
      </main>
      <p className="mt-8 max-w-sm text-center text-xs text-ink-soft">
        By continuing you agree to our{' '}
        <Link href="/terms" className="underline">
          Terms
        </Link>{' '}
        and{' '}
        <Link href="/privacy" className="underline">
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  );
}
