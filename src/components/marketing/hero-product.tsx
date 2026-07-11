'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

const POST_PARTS: { text: string; hit?: boolean }[] = [
  { text: "We're not raising to extend runway. " },
  { text: '4,000 people', hit: true },
  { text: ' use this every single day and we can’t ship fast enough for them. Funding stops being ' },
  { text: 'survival', hit: true },
  { text: ' and starts being ' },
  { text: 'fuel', hit: true },
  { text: '.' },
];

const FRAGMENTS = [
  {
    label: 'Followers',
    reading: 'A milestone — feels like being part of the story.',
    signal: 'positive',
    pos: 'left-[-9rem] top-6',
  },
  {
    label: 'Investors',
    reading: 'Leads with usage, not vanity. Wants the retention curve next.',
    signal: 'neutral',
    pos: 'right-[-10rem] top-16',
  },
  {
    label: 'Skeptics',
    reading: '“can’t ship fast enough” could read as humblebrag.',
    signal: 'concern',
    pos: 'left-[-8rem] bottom-24',
  },
  {
    label: 'New customers',
    reading: 'The number does the convincing. Low effort to trust.',
    signal: 'positive',
    pos: 'right-[-8rem] bottom-10',
  },
  {
    label: 'Partners',
    reading: 'Reads as momentum. Worth a reply.',
    signal: 'neutral',
    pos: 'left-1/2 -translate-x-1/2 bottom-[-3.5rem]',
  },
];

const SIGNAL_DOT: Record<string, string> = {
  positive: 'bg-[#3f6b3a]',
  neutral: 'bg-cobalt',
  concern: 'bg-clay',
};

export function HeroProductObject() {
  const reduce = useReducedMotion();
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
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className="relative mx-auto max-w-content">
      {/* Floating interpretation fragments (desktop) */}
      <div className="pointer-events-none absolute inset-0 hidden lg:block">
        {FRAGMENTS.map((f, i) => (
          <motion.div
            key={f.label}
            initial={reduce ? false : { opacity: 0, y: 10, scale: 0.98 }}
            animate={visible ? { opacity: 1, y: 0, scale: 1 } : {}}
            transition={{ delay: 0.5 + i * 0.22, duration: 0.6, ease: [0.2, 0.7, 0.2, 1] }}
            className={cn('absolute w-[13rem]', f.pos)}
          >
            <div className="border-l border-ink/15 pl-3">
              <div className="mb-1 flex items-center gap-1.5">
                <span className={cn('h-1.5 w-1.5 rounded-full', SIGNAL_DOT[f.signal])} />
                <span className="text-[0.7rem] font-medium uppercase tracking-[0.1em] text-ink-muted">
                  {f.label}
                </span>
              </div>
              <p className="serif text-[0.95rem] leading-snug text-ink">{f.reading}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Product object */}
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 40, rotateX: 6 }}
        animate={visible ? { opacity: 1, y: 0, rotateX: 0 } : {}}
        transition={{ duration: 0.9, ease: [0.2, 0.7, 0.2, 1] }}
        style={{ transformPerspective: 1600 }}
        className="object-frame relative overflow-hidden"
      >
        {/* chrome */}
        <div className="flex items-center gap-2 border-b border-rule px-5 py-3.5">
          <span className="h-2.5 w-2.5 rounded-full border border-ink/15" />
          <span className="h-2.5 w-2.5 rounded-full border border-ink/15" />
          <span className="h-2.5 w-2.5 rounded-full border border-ink/15" />
          <div className="ml-3 flex items-center gap-2 text-xs text-ink-muted">
            <span className="rounded-md bg-sand px-2 py-1">ReadRoom · New Read</span>
          </div>
          <span className="ml-auto rounded-md bg-sand px-2 py-1 text-[0.65rem] uppercase tracking-wide text-ink-muted">
            Demonstration
          </span>
        </div>

        <div className="grid gap-0 md:grid-cols-[1.5fr_1fr]">
          {/* editor */}
          <div className="relative border-b border-rule p-6 md:border-b-0 md:border-r sm:p-8">
            {!reduce && visible && (
              <div className="scanline animate-scan" aria-hidden />
            )}
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-ink px-2.5 py-1 text-[0.7rem] font-medium text-paper">X</span>
              <span className="rounded-md border border-ink/12 px-2.5 py-1 text-[0.7rem] text-ink-soft">
                Room · Investors
              </span>
            </div>
            <p className="serif text-[1.35rem] leading-[1.5] text-ink sm:text-[1.5rem]">
              {POST_PARTS.map((p, i) =>
                p.hit ? (
                  <span key={i} className={cn(visible ? 'phrase-hit' : '')}>
                    {p.text}
                  </span>
                ) : (
                  <span key={i}>{p.text}</span>
                ),
              )}
            </p>

            <div className="mt-6 flex items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-[10px] bg-ink px-4 py-2 text-sm text-paper">
                Read the room
              </span>
              <span className="text-xs text-ink-muted">Analysing 42 words…</span>
            </div>
          </div>

          {/* result rail */}
          <div className="bg-sand/50 p-6 sm:p-8">
            <div className="flex items-baseline gap-2">
              <motion.span
                initial={reduce ? false : { opacity: 0 }}
                animate={visible ? { opacity: 1 } : {}}
                transition={{ delay: 0.9 }}
                className="serif text-[3.4rem] leading-none text-ink"
              >
                78
              </motion.span>
              <span className="text-xs uppercase tracking-[0.1em] text-ink-muted">Room Score</span>
            </div>
            <p className="serif-italic mt-3 text-lg leading-snug text-ink">
              “Reads like someone raising from strength, not need.”
            </p>

            <div className="mt-6 space-y-3">
              {[
                ['Clarity', 82],
                ['Trust', 71],
                ['Authority', 80],
                ['Originality', 74],
              ].map(([label, val], i) => (
                <div key={label as string}>
                  <div className="mb-1 flex items-center justify-between text-[0.72rem] text-ink-soft">
                    <span>{label}</span>
                    <span className="tabular-nums text-ink">{val}</span>
                  </div>
                  <div className="h-px w-full bg-ink/10">
                    <motion.div
                      initial={reduce ? false : { scaleX: 0 }}
                      animate={visible ? { scaleX: (val as number) / 100 } : {}}
                      transition={{ delay: 0.9 + i * 0.12, duration: 0.8, ease: [0.2, 0.7, 0.2, 1] }}
                      style={{ transformOrigin: 'left' }}
                      className="h-px bg-ink"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
