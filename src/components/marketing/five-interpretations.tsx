'use client';

import { useRef, useState } from 'react';
import { motion, useMotionValueEvent, useScroll } from 'framer-motion';
import { cn } from '@/lib/utils';

const MESSAGE = 'Honestly? We almost shut this down last year. Glad we didn’t.';

const AUDIENCES = [
  {
    label: 'Existing followers',
    reading: 'Reads as honest and human. The vulnerability builds trust.',
    concern: 'Some may want to know what changed.',
    positive: 'Feels real, not performative.',
    tint: 'bg-sand',
    accent: 'text-[#3f6b3a]',
  },
  {
    label: 'New customers',
    reading: 'A near-miss can read as instability before they’ve bought in.',
    concern: '“almost shut down” raises a reliability question.',
    positive: 'Survival story signals resilience.',
    tint: 'bg-[#f3ede3]',
    accent: 'text-clay',
  },
  {
    label: 'Industry peers',
    reading: 'Respects the candour, reads between the lines for the real story.',
    concern: 'Wants specifics or it sounds like a humblebrag.',
    positive: 'Rare honesty earns attention.',
    tint: 'bg-[#eef0ee]',
    accent: 'text-cobalt',
  },
  {
    label: 'Skeptics',
    reading: 'Looks for the angle — is this a setup for an announcement?',
    concern: 'Vagueness invites a cynical read.',
    positive: 'Hard to attack an admission.',
    tint: 'bg-[#f1ece9]',
    accent: 'text-[#9c3d33]',
  },
  {
    label: 'Brand partners',
    reading: 'Weighs the risk of association against the authenticity upside.',
    concern: 'Needs to know the company is stable now.',
    positive: 'Candour reads as a trustworthy partner.',
    tint: 'bg-[#eeeef1]',
    accent: 'text-cobalt',
  },
];

export function FiveInterpretations() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const [active, setActive] = useState(0);

  useMotionValueEvent(scrollYProgress, 'change', (p) => {
    const idx = Math.min(AUDIENCES.length - 1, Math.floor(p * AUDIENCES.length));
    setActive(idx);
  });

  const current = AUDIENCES[active];

  return (
    <section className="mx-auto max-w-shell px-5 sm:px-8">
      {/* Desktop sticky experience */}
      <div ref={ref} className="relative hidden lg:block" style={{ height: `${AUDIENCES.length * 90}vh` }}>
        <div className="sticky top-0 flex h-screen items-center">
          <div className="grid w-full grid-cols-[1fr_1fr] gap-16">
            {/* fixed message */}
            <div>
              <p className="mb-8 text-xs uppercase tracking-[0.18em] text-ink-muted">One message</p>
              <p className="serif text-[2.6rem] leading-[1.2] text-ink">
                “{MESSAGE}”
              </p>
              <div className="mt-10 flex gap-1.5">
                {AUDIENCES.map((a, i) => (
                  <span
                    key={a.label}
                    className={cn(
                      'h-0.5 flex-1 rounded-full transition-colors duration-500',
                      i === active ? 'bg-ink' : 'bg-ink/12',
                    )}
                  />
                ))}
              </div>
            </div>

            {/* changing interpretation */}
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.2, 0.7, 0.2, 1] }}
              className={cn('rounded-canvas p-10 transition-colors duration-700', current.tint)}
            >
              <p className={cn('text-sm font-medium uppercase tracking-[0.12em]', current.accent)}>
                {current.label}
              </p>
              <p className="serif mt-4 text-[1.9rem] leading-snug text-ink">{current.reading}</p>
              <div className="mt-8 grid grid-cols-2 gap-6 border-t border-ink/10 pt-6">
                <div>
                  <p className="text-[0.7rem] uppercase tracking-wide text-ink-muted">Positive signal</p>
                  <p className="mt-1 text-[0.95rem] text-ink">{current.positive}</p>
                </div>
                <div>
                  <p className="text-[0.7rem] uppercase tracking-wide text-ink-muted">One concern</p>
                  <p className="mt-1 text-[0.95rem] text-ink">{current.concern}</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Mobile vertical sequence */}
      <div className="lg:hidden">
        <p className="mb-6 text-xs uppercase tracking-[0.18em] text-ink-muted">One message</p>
        <p className="serif text-[1.9rem] leading-snug text-ink">“{MESSAGE}”</p>
        <div className="mt-8 space-y-4">
          {AUDIENCES.map((a) => (
            <div key={a.label} className={cn('rounded-frame p-6', a.tint)}>
              <p className={cn('text-xs font-medium uppercase tracking-[0.12em]', a.accent)}>{a.label}</p>
              <p className="serif mt-2 text-xl leading-snug text-ink">{a.reading}</p>
              <div className="mt-4 grid gap-3 border-t border-ink/10 pt-4 text-sm">
                <p className="text-ink"><span className="text-ink-muted">Signal — </span>{a.positive}</p>
                <p className="text-ink"><span className="text-ink-muted">Concern — </span>{a.concern}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
