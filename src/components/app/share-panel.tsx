'use client';

import { useState, useTransition } from 'react';
import { Share2, Link2, Trash2, Eye, EyeOff, Check } from 'lucide-react';
import { Button, Card, Badge } from '@/components/ui';
import { createShareLinkAction, revokeShareLinkAction } from '@/app/actions/sharing';
import type { ShareLinkRecord } from '@/lib/store/types';

export function SharePanel({
  analysisId,
  appUrl,
  existing,
}: {
  analysisId: string;
  appUrl: string;
  existing: ShareLinkRecord[];
}) {
  const [showOriginal, setShowOriginal] = useState(false);
  const [links, setLinks] = useState(existing);
  const [pending, start] = useTransition();
  const [copied, setCopied] = useState<string | null>(null);

  const activeLinks = links.filter((l) => l.isActive);

  return (
    <Card className="p-5">
      <div className="flex items-center gap-2">
        <Share2 className="h-4 w-4 text-ink-soft" />
        <h3 className="text-sm font-semibold uppercase tracking-wide text-ink-soft">Share this report</h3>
      </div>
      <p className="mt-2 text-sm text-ink-soft">
        Reports are private by default. A share link shows scores and highlights — your original text stays
        hidden unless you explicitly include it.
      </p>

      <label className="mt-4 flex cursor-pointer items-center gap-3 rounded-xl border border-rule bg-white p-3">
        <button
          type="button"
          role="switch"
          aria-checked={showOriginal}
          onClick={() => setShowOriginal((s) => !s)}
          className={`relative h-6 w-10 shrink-0 rounded-full transition ${showOriginal ? 'bg-iris' : 'bg-ink/15'}`}
        >
          <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${showOriginal ? 'left-[1.15rem]' : 'left-0.5'}`} />
        </button>
        <span className="flex items-center gap-2 text-sm text-ink">
          {showOriginal ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          Include my original content on the shared page
        </span>
      </label>

      <Button
        className="mt-3"
        onClick={() =>
          start(async () => {
            const res = await createShareLinkAction(analysisId, showOriginal);
            if (res.ok) {
              setLinks((l) => [
                {
                  id: res.id,
                  userId: '',
                  analysisId,
                  slug: res.slug,
                  showOriginalContent: showOriginal,
                  isActive: true,
                  expiresAt: null,
                  createdAt: new Date().toISOString(),
                },
                ...l,
              ]);
            }
          })
        }
        disabled={pending}
      >
        <Link2 className="h-4 w-4" /> Create share link
      </Button>

      {activeLinks.length > 0 && (
        <ul className="mt-4 space-y-2">
          {activeLinks.map((l) => {
            const url = `${appUrl}/r/${l.slug}`;
            return (
              <li key={l.id} className="flex items-center gap-2 rounded-xl bg-paper/60 p-2.5">
                <span className="min-w-0 flex-1 truncate font-mono text-xs text-ink-soft">/r/{l.slug}</span>
                {l.showOriginalContent && <Badge tone="warn">shows original</Badge>}
                <button
                  type="button"
                  onClick={async () => {
                    await navigator.clipboard.writeText(url);
                    setCopied(l.id);
                    setTimeout(() => setCopied(null), 1500);
                  }}
                  className="rounded-lg p-1.5 text-ink-soft hover:text-ink"
                  aria-label="Copy link"
                >
                  {copied === l.id ? <Check className="h-3.5 w-3.5 text-[#0f7a54]" /> : <Link2 className="h-3.5 w-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    start(async () => {
                      await revokeShareLinkAction(l.id, analysisId);
                      setLinks((links) => links.map((x) => (x.id === l.id ? { ...x, isActive: false } : x)));
                    })
                  }
                  className="rounded-lg p-1.5 text-ink-soft hover:text-red-600"
                  aria-label="Revoke link"
                  disabled={pending}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
