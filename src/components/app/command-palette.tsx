'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import * as Dialog from '@radix-ui/react-dialog';
import {
  Home,
  PenLine,
  Users,
  Fingerprint,
  UserSearch,
  GitCompareArrows,
  Clock,
  Settings,
  Search,
  CornerDownLeft,
} from 'lucide-react';
import { APP_NAV } from '@/lib/nav';
import { cn } from '@/lib/utils';

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

export function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);

  const items = useMemo(() => {
    const q = query.toLowerCase().trim();
    return APP_NAV.filter((n) => !q || n.label.toLowerCase().includes(q));
  }, [query]);

  useEffect(() => {
    if (!open) {
      setQuery('');
      setActive(0);
    }
  }, [open]);

  useEffect(() => {
    setActive(0);
  }, [query]);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/20 backdrop-blur-sm data-[state=open]:animate-fade-up" />
        <Dialog.Content
          className="fixed left-1/2 top-[18%] z-50 w-[min(92vw,32rem)] -translate-x-1/2 overflow-hidden rounded-2xl border border-rule bg-white shadow-object-sm focus:outline-none"
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              setActive((a) => Math.min(items.length - 1, a + 1));
            } else if (e.key === 'ArrowUp') {
              e.preventDefault();
              setActive((a) => Math.max(0, a - 1));
            } else if (e.key === 'Enter') {
              e.preventDefault();
              const it = items[active];
              if (it) {
                onOpenChange(false);
                router.push(it.href);
              }
            }
          }}
        >
          <Dialog.Title className="sr-only">Command palette</Dialog.Title>
          <div className="flex items-center gap-2 border-b border-rule px-4">
            <Search className="h-4 w-4 text-ink-soft" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Jump to…"
              className="h-12 w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-soft/60"
              aria-label="Search commands"
            />
          </div>
          <ul className="max-h-72 overflow-y-auto p-2 rr-scroll">
            {items.length === 0 && (
              <li className="px-3 py-6 text-center text-sm text-ink-soft">No matches.</li>
            )}
            {items.map((it, i) => {
              const Icon = ICONS[it.icon] ?? Home;
              return (
                <li key={it.href}>
                  <button
                    type="button"
                    onMouseEnter={() => setActive(i)}
                    onClick={() => {
                      onOpenChange(false);
                      router.push(it.href);
                    }}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm',
                      i === active ? 'bg-sand text-ink' : 'text-ink-soft hover:bg-ink/[0.04]',
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {it.label}
                    {i === active && <CornerDownLeft className="ml-auto h-3.5 w-3.5 opacity-60" />}
                  </button>
                </li>
              );
            })}
          </ul>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
