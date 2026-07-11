'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

const STAGES = [
  {
    tag: 'Your original',
    note: 'Honest, but a little raw',
    text: "we shipped the thing. took forever tbh but it's actually good now, promise",
    tone: 'text-ink',
  },
  {
    tag: 'Generic AI rewrite',
    note: 'Correct — and completely flattened',
    text: 'We are thrilled to announce the launch of our latest product, now available to everyone.',
    tone: 'text-ink-muted',
  },
  {
    tag: 'ReadRoom recommendation',
    note: 'Your voice, harder to misread',
    text: "It took longer than it should have. But it's finally good — and it's yours today.",
    tone: 'text-ink',
  },
];

export function BeforeAfter() {
  const [active, setActive] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let started = false;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !started) {
          started = true;
          let i = 0;
          const id = setInterval(() => {
            i += 1;
            if (i >= STAGES.length) {
              clearInterval(id);
              return;
            }
            setActive(i);
          }, 1400);
        }
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className="space-y-8">
      {STAGES.map((s, i) => (
        <div
          key={s.tag}
          className={cn(
            'border-l-2 pl-6 transition-all duration-700',
            i <= active ? 'border-ink/30 opacity-100' : 'border-ink/10 opacity-35',
            i === STAGES.length - 1 && i <= active && 'border-clay',
          )}
        >
          <div className="mb-2 flex items-baseline gap-3">
            <span className="text-xs font-medium uppercase tracking-[0.12em] text-ink-muted">{s.tag}</span>
            <span className="text-xs text-ink-muted">· {s.note}</span>
          </div>
          <p className={cn('serif text-[1.6rem] leading-snug sm:text-[1.9rem]', s.tone)}>
            {i === STAGES.length - 1 ? (
              <>
                {'It took longer than it should have. '}
                <span className="annotate">But it&apos;s finally good — and it&apos;s yours today.</span>
              </>
            ) : (
              s.text
            )}
          </p>
        </div>
      ))}
    </div>
  );
}
