'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  PenLine,
  Users,
  Fingerprint,
  UserSearch,
  GitCompareArrows,
  Clock,
  Settings,
  Command as CommandIcon,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { Wordmark, Logomark } from '@/components/brand';
import { APP_NAV } from '@/lib/nav';
import { cn, initialsFrom } from '@/lib/utils';
import { SignOutButton } from '@clerk/nextjs';
import { CommandPalette } from './command-palette';
import { devSignOutAction } from '@/app/actions/auth';

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Home,
  PenLine,
  Users,
  Fingerprint,
  UserSearch,
  GitCompareArrows,
  Clock,
  Settings,
};

export type ShellUser = {
  displayName: string | null;
  email: string | null;
  avatarUrl: string | null;
};

export function AppShell({
  user,
  usage,
  isDevAuth,
  children,
}: {
  user: ShellUser;
  usage: { used: number; limit: number; remaining: number };
  isDevAuth: boolean;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <div className="min-h-dvh bg-paper">
      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />

      {/* Desktop rail */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-rule bg-white/60 backdrop-blur-xl lg:flex">
        <div className="px-5 py-5">
          <Link href="/home" aria-label="ReadRoom home">
            <Wordmark />
          </Link>
        </div>
        <button
          type="button"
          onClick={() => setPaletteOpen(true)}
          className="mx-3 mb-2 flex items-center gap-2 rounded-xl border border-rule bg-white px-3 py-2 text-sm text-ink-soft transition hover:text-ink"
        >
          <CommandIcon className="h-3.5 w-3.5" />
          Command
          <span className="ml-auto rounded bg-ink/[0.06] px-1.5 py-0.5 text-[10px] font-medium">
            ⌘K
          </span>
        </button>
        <nav className="flex-1 space-y-0.5 px-3 py-2" aria-label="App">
          {APP_NAV.map((n) => {
            const Icon = ICONS[n.icon] ?? Home;
            return (
              <Link
                key={n.href}
                href={n.href}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition',
                  isActive(n.href)
                    ? 'bg-sand font-medium text-ink'
                    : 'text-ink-soft hover:bg-ink/[0.04] hover:text-ink',
                )}
              >
                <Icon className="h-4 w-4" />
                {n.label}
              </Link>
            );
          })}
        </nav>
        <UsageMeter usage={usage} />
        <UserFooter user={user} isDevAuth={isDevAuth} />
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-rule bg-paper/80 px-4 backdrop-blur-xl lg:hidden">
        <Link href="/home" aria-label="ReadRoom home" className="flex items-center gap-2">
          <Logomark className="h-6 w-6" />
          <span className="font-medium tracking-[-0.01em] text-ink">ReadRoom</span>
        </Link>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            className="rounded-full p-2 text-ink-soft"
            aria-label="Open command palette"
          >
            <CommandIcon className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            className="rounded-full p-2 text-ink"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 top-14 z-20 bg-paper/95 p-4 backdrop-blur-xl lg:hidden">
          <nav className="grid grid-cols-2 gap-2" aria-label="Mobile app">
            {APP_NAV.map((n) => {
              const Icon = ICONS[n.icon] ?? Home;
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className={cn(
                    'flex items-center gap-3 rounded-2xl border border-rule bg-white px-4 py-3 text-sm',
                    isActive(n.href) ? 'font-medium text-ink' : 'text-ink-soft',
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {n.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-4">
            <UsageMeter usage={usage} />
          </div>
          <div className="mt-4">
            <UserFooter user={user} isDevAuth={isDevAuth} />
          </div>
        </div>
      )}

      <div className="lg:pl-60">
        <main id="main" className="mx-auto max-w-5xl px-4 py-6 sm:px-8 sm:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}

function UsageMeter({ usage }: { usage: { used: number; limit: number; remaining: number } }) {
  const pct = Math.min(100, (usage.used / usage.limit) * 100);
  return (
    <div className="mx-3 mb-3 rounded-xl border border-rule bg-white/70 p-3">
      <div className="flex items-center justify-between text-xs">
        <span className="text-ink-soft">Daily reads</span>
        <span className="font-medium text-ink tabular-nums">
          {usage.remaining} left
        </span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink/[0.06]">
        <div
          className="h-full rounded-full bg-ink"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-1.5 text-[10px] text-ink-soft">Free beta · {usage.limit}/day · resets rolling 24h</p>
    </div>
  );
}

function UserFooter({ user, isDevAuth }: { user: ShellUser; isDevAuth: boolean }) {
  return (
    <div className="flex items-center gap-2 border-t border-rule px-4 py-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-ink text-xs font-semibold text-white">
        {initialsFrom(user.displayName)}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-ink">{user.displayName ?? 'You'}</p>
        <p className="truncate text-xs text-ink-soft">{user.email ?? 'signed in'}</p>
      </div>
      {isDevAuth ? (
        <form action={devSignOutAction}>
          <button
            type="submit"
            className="rounded-full p-1.5 text-ink-soft transition hover:bg-ink/[0.05] hover:text-ink"
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </form>
      ) : (
        <SignOutButton>
          <button
            type="button"
            className="rounded-full p-1.5 text-ink-soft transition hover:bg-ink/[0.05] hover:text-ink"
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </SignOutButton>
      )}
    </div>
  );
}
