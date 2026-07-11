import Link from 'next/link';
import { Wordmark, XIcon, FOUNDER_X_URL } from '@/components/brand';

const COLS: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: 'Product',
    links: [
      { href: '/#product', label: 'Quick Read' },
      { href: '/how-it-works', label: 'How it works' },
      { href: '/examples', label: 'Examples' },
      { href: '/sign-up', label: 'Get started' },
    ],
  },
  {
    title: 'Company',
    links: [
      { href: '/about', label: 'About' },
      { href: '/about#founder', label: "Founder's note" },
    ],
  },
  {
    title: 'Resources',
    links: [
      { href: '/how-it-works', label: 'How it works' },
      { href: '/examples', label: 'Sample report' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { href: '/privacy', label: 'Privacy' },
      { href: '/terms', label: 'Terms' },
      { href: '/ai', label: 'AI limitations' },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-rule bg-paper">
      <div className="mx-auto max-w-shell px-5 py-20 sm:px-8">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1fr_1fr]">
          <div className="max-w-xs">
            <Wordmark />
            <p className="serif mt-4 text-lg leading-snug text-ink-soft">
              Read the room before you post.
            </p>
            <p className="mt-3 text-sm text-ink-muted">
              AI audience intelligence for people whose words carry weight.
            </p>
            <a
              href={FOUNDER_X_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 text-sm text-ink-soft transition hover:text-ink"
            >
              <XIcon className="h-3.5 w-3.5" /> @GiaMMacool
            </a>
          </div>
          {COLS.map((c) => (
            <div key={c.title}>
              <p className="mb-4 text-xs font-medium uppercase tracking-[0.12em] text-ink-muted">
                {c.title}
              </p>
              <ul className="space-y-2.5">
                {c.links.map((l) => (
                  <li key={l.href + l.label}>
                    <Link href={l.href} className="text-sm text-ink-soft transition hover:text-ink">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col gap-3 border-t border-rule pt-6 text-xs text-ink-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} ReadRoom · A creator-first product by Gia Macool.</p>
          <div className="flex items-center gap-5">
            <Link href="/privacy" className="hover:text-ink">Privacy</Link>
            <Link href="/terms" className="hover:text-ink">Terms</Link>
            <Link href="/ai" className="hover:text-ink">AI limitations</Link>
            <a
              href={FOUNDER_X_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="ReadRoom on X"
              className="transition hover:text-ink"
            >
              <XIcon className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
