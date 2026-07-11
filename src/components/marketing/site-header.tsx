'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Wordmark, XIcon, FOUNDER_X_URL } from '@/components/brand';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/#product', label: 'Product' },
  { href: '/how-it-works', label: 'How it works' },
  { href: '/examples', label: 'Examples' },
  { href: '/about', label: 'About' },
];

export function SiteHeader({ authed }: { authed: boolean }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <header
      className={cn(
        'sticky top-0 z-50 transition-colors duration-300',
        scrolled ? 'border-b border-rule bg-paper/85 backdrop-blur-xl' : 'border-b border-transparent',
      )}
    >
      <div className="mx-auto flex h-[72px] max-w-shell items-center justify-between px-5 sm:px-8">
        <Link href="/" aria-label="ReadRoom home" className="shrink-0">
          <Wordmark />
        </Link>

        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 md:flex" aria-label="Primary">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="text-[0.9rem] text-ink-soft transition hover:text-ink"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-5 md:flex">
          <a
            href={FOUNDER_X_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="ReadRoom on X"
            className="text-ink-soft transition hover:text-ink"
          >
            <XIcon />
          </a>
          {authed ? (
            <Button asChild size="sm">
              <Link href="/home">Open studio</Link>
            </Button>
          ) : (
            <>
              <Link href="/sign-in" className="text-[0.9rem] text-ink-soft transition hover:text-ink">
                Sign in
              </Link>
              <Button asChild size="sm">
                <Link href="/sign-up">Read a post</Link>
              </Button>
            </>
          )}
        </div>

        <div className="flex items-center gap-3 md:hidden">
          {!authed && (
            <Button asChild size="sm">
              <Link href="/sign-up">Read a post</Link>
            </Button>
          )}
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center text-ink"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            <div className="flex flex-col items-end gap-[5px]">
              <span className={cn('h-px w-6 bg-ink transition-all', open && 'translate-y-[6px] rotate-45')} />
              <span className={cn('h-px w-6 bg-ink transition-all', open && 'opacity-0')} />
              <span className={cn('h-px w-6 bg-ink transition-all', open && '-translate-y-[6px] -rotate-45')} />
            </div>
          </button>
        </div>
      </div>

      {/* Full-screen editorial overlay */}
      {open && (
        <div className="fixed inset-0 top-[72px] z-40 flex flex-col bg-paper px-6 py-10 md:hidden">
          <nav className="flex flex-col gap-6" aria-label="Mobile">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                className="serif text-4xl text-ink"
              >
                {n.label}
              </Link>
            ))}
            <a
              href={FOUNDER_X_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="serif flex items-center gap-3 text-4xl text-ink"
            >
              <XIcon className="h-7 w-7" /> X
            </a>
          </nav>
          <div className="mt-auto flex flex-col gap-3">
            {authed ? (
              <Button asChild size="lg">
                <Link href="/home">Open studio</Link>
              </Button>
            ) : (
              <>
                <Button asChild size="lg" variant="outline">
                  <Link href="/sign-in">Sign in</Link>
                </Button>
                <Button asChild size="lg">
                  <Link href="/sign-up">Read a post</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
