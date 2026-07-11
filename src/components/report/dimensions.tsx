'use client';

import { useEffect, useRef, useState } from 'react';
import { DIMENSION_KEYS, DIMENSION_LABELS } from '@/lib/constants';
import type { QuickReadResult } from '@/lib/ai/schemas';
import { cn } from '@/lib/utils';

function barColor(key: string, score: number): string {
  if (key === 'polarisation') {
    // higher = more polarising = warmer/riskier
    return score > 60 ? 'bg-clay' : 'bg-ink/70';
  }
  return 'bg-ink';
}

export function Dimensions({ dimensions }: { dimensions: QuickReadResult['dimensions'] }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
      {DIMENSION_KEYS.map((key, i) => {
        const dim = dimensions[key];
        return (
          <div key={key} className="group">
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-medium text-ink">{DIMENSION_LABELS[key]}</span>
              <span className="text-sm font-semibold tabular-nums text-ink-soft">{dim.score}</span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-ink/[0.06]">
              <div
                className={cn('h-full rounded-full transition-[width] duration-700 ease-out', barColor(key, dim.score))}
                style={{
                  width: visible ? `${dim.score}%` : '0%',
                  transitionDelay: `${i * 70}ms`,
                }}
              />
            </div>
            <p className="mt-1.5 text-xs leading-relaxed text-ink-soft">{dim.reason}</p>
          </div>
        );
      })}
    </div>
  );
}
