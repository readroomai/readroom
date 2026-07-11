import { Logomark } from '@/components/brand';
import { ScoreRing } from '@/components/report/score-ring';
import { DIMENSION_KEYS, DIMENSION_LABELS } from '@/lib/constants';
import type { QuickReadResult } from '@/lib/ai/schemas';

/**
 * The public share card. Deliberately shows only non-sensitive, aggregate
 * signal: score, first impression, selected dimensions, branding. Original
 * content, context, emails, uploads, prompts, and ids are never included here.
 */
export function ShareCard({
  result,
  username,
  originalText,
}: {
  result: QuickReadResult;
  username?: string | null;
  originalText?: string | null;
}) {
  return (
    <div className="mx-auto max-w-lg">
      <div className="overflow-hidden rounded-3xl border border-rule bg-white shadow-object-sm">
        <div className="bg-gradient-to-br from-lavender/60 via-white to-ice/50 p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Logomark className="h-7 w-7" />
              <span className="font-semibold tracking-tight text-ink">readroom</span>
            </div>
            <span className="rounded-full bg-white/70 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-ink-soft">
              Room read
            </span>
          </div>

          <div className="mt-6 flex items-center gap-5">
            <ScoreRing score={result.roomScore} animate={false} size={116} />
            <div>
              <p className="serif text-xl leading-snug text-ink">{result.firstImpression}</p>
              {username && <p className="mt-1 text-sm text-ink-soft">— {username}</p>}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-3 p-8">
          {DIMENSION_KEYS.map((key) => (
            <div key={key}>
              <div className="flex items-center justify-between text-sm">
                <span className="text-ink-soft">{DIMENSION_LABELS[key]}</span>
                <span className="font-semibold tabular-nums text-ink">{result.dimensions[key].score}</span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-ink/[0.06]">
                <div
                  className="h-full rounded-full bg-ink"
                  style={{ width: `${result.dimensions[key].score}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {originalText && (
          <div className="border-t border-rule bg-paper/50 p-8">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-soft">Original content</p>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-ink">{originalText}</p>
          </div>
        )}

        <div className="border-t border-rule px-8 py-4 text-center text-xs text-ink-soft">
          Simulated with ReadRoom — read the room before you post.
        </div>
      </div>
    </div>
  );
}
