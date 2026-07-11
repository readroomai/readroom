'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { scoreBand } from '@/lib/utils';

export function ScoreRing({
  score,
  size = 132,
  label = 'Room Score',
  animate = true,
}: {
  score: number;
  size?: number;
  label?: string;
  animate?: boolean;
}) {
  const [shown, setShown] = useState(animate ? 0 : score);
  const band = scoreBand(score);
  const stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;

  useEffect(() => {
    if (!animate) return;
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShown(score);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const dur = 900;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setShown(Math.round(eased * score));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [score, animate]);

  const offset = c - (shown / 100) * c;

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${label}: ${score} out of 100 — ${band.label}`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="score-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#111111" />
            <stop offset="100%" stopColor="#111111" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(16,16,20,0.07)" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="url(#score-grad)"
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: animate ? 'stroke-dashoffset 0.1s linear' : undefined }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[2.1rem] font-semibold leading-none tracking-tight text-ink tabular-nums">
          {shown}
        </span>
        <span
          className={cn(
            'mt-1 text-[0.7rem] font-medium',
            band.tone === 'strong' && 'text-[#0f7a54]',
            band.tone === 'good' && 'text-cobalt',
            band.tone === 'mixed' && 'text-amber-700',
            band.tone === 'weak' && 'text-red-600',
          )}
        >
          {band.label}
        </span>
      </div>
    </div>
  );
}
