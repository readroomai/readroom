'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { Star, MoreHorizontal, Trash2, Pencil, Copy } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Badge } from '@/components/ui';
import { cn, formatRelativeDate, scoreBand } from '@/lib/utils';
import { PLATFORMS } from '@/lib/constants';
import type { AnalysisRecord } from '@/lib/store/types';
import {
  toggleFavouriteAction,
  deleteAnalysisAction,
  renameAnalysisAction,
} from '@/app/actions/analysis';

export function AnalysisRow({
  analysis,
  showActions = false,
}: {
  analysis: AnalysisRecord;
  showActions?: boolean;
}) {
  const [pending, start] = useTransition();
  const [fav, setFav] = useState(analysis.isFavourite);
  const platform = PLATFORMS.find((p) => p.id === analysis.platform)?.label ?? analysis.platform;
  const isQuick = analysis.analysisType === 'quick_read';
  const score = isQuick ? (analysis.result as { roomScore: number }).roomScore : null;
  const band = score != null ? scoreBand(score) : null;

  return (
    <div className="group flex items-center gap-3 rounded-2xl border border-rule bg-white p-3.5 transition hover:shadow-object-sm">
      {score != null && band ? (
        <div
          className={cn(
            'flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl text-sm font-semibold tabular-nums',
            band.tone === 'strong' && 'bg-mint text-[#0f7a54]',
            band.tone === 'good' && 'bg-sand text-cobalt',
            band.tone === 'mixed' && 'bg-amber-100 text-amber-700',
            band.tone === 'weak' && 'bg-red-100 text-red-600',
          )}
        >
          {score}
        </div>
      ) : (
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-ice text-xs font-medium text-[#0f6f86]">
          VS
        </div>
      )}

      <Link href={`/history/${analysis.id}`} className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-ink">{analysis.title}</p>
        <div className="mt-0.5 flex items-center gap-2 text-xs text-ink-soft">
          <Badge tone="neutral">{platform}</Badge>
          <span>{isQuick ? 'Quick Read' : 'Compare'}</span>
          <span>·</span>
          <span>{formatRelativeDate(analysis.createdAt)}</span>
          {analysis.isDemo && <Badge tone="warn">demo</Badge>}
        </div>
      </Link>

      <button
        type="button"
        onClick={() => {
          const next = !fav;
          setFav(next);
          start(() => toggleFavouriteAction(analysis.id, next));
        }}
        className="rounded-full p-1.5 text-ink-soft transition hover:text-ink"
        aria-label={fav ? 'Unfavourite' : 'Favourite'}
        aria-pressed={fav}
        disabled={pending}
      >
        <Star className={cn('h-4 w-4', fav && 'fill-amber-400 text-amber-400')} />
      </button>

      {showActions && (
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              type="button"
              className="rounded-full p-1.5 text-ink-soft transition hover:text-ink"
              aria-label="More actions"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              align="end"
              sideOffset={6}
              className="z-50 min-w-40 rounded-xl border border-rule bg-white p-1 shadow-object-sm"
            >
              <DropdownMenu.Item
                className="flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-ink outline-none data-[highlighted]:bg-ink/[0.05]"
                onSelect={() => {
                  const title = window.prompt('Rename read', analysis.title);
                  if (title) start(() => renameAnalysisAction(analysis.id, title));
                }}
              >
                <Pencil className="h-3.5 w-3.5" /> Rename
              </DropdownMenu.Item>
              <DropdownMenu.Item
                className="flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-ink outline-none data-[highlighted]:bg-ink/[0.05]"
                onSelect={() => {
                  const rec = isQuick ? (analysis.result as { recommendedVersion?: string }) : null;
                  void navigator.clipboard.writeText(rec?.recommendedVersion ?? analysis.originalText);
                }}
              >
                <Copy className="h-3.5 w-3.5" /> Copy recommended
              </DropdownMenu.Item>
              <DropdownMenu.Separator className="my-1 h-px bg-line" />
              <DropdownMenu.Item
                className="flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-red-600 outline-none data-[highlighted]:bg-red-50"
                onSelect={() => {
                  if (window.confirm('Delete this read? This cannot be undone.'))
                    start(() => deleteAnalysisAction(analysis.id));
                }}
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      )}
    </div>
  );
}
