'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

type Node = {
  label: string;
  reading: string;
  conf: number;
  x: number;
  y: number;
  tone: 'blue' | 'peach' | 'ivory' | 'red';
};

const CENTER = { x: 30, y: 50 };
const NODES: Node[] = [
  { label: 'Supporter', reading: 'Feels aligned', conf: 0.74, x: 72, y: 16, tone: 'ivory' },
  { label: 'Skeptic', reading: 'Tests the claim', conf: 0.55, x: 82, y: 42, tone: 'red' },
  { label: 'Customer', reading: 'Trusts the number', conf: 0.63, x: 78, y: 70, tone: 'blue' },
  { label: 'Peer', reading: 'Reads the subtext', conf: 0.6, x: 58, y: 84, tone: 'peach' },
  { label: 'Partner', reading: 'Weighs the risk', conf: 0.58, x: 55, y: 30, tone: 'ivory' },
];

const TONE: Record<string, { dot: string; text: string; line: string }> = {
  blue: { dot: 'bg-sky', text: 'text-sky', line: 'rgba(201,221,242,0.5)' },
  peach: { dot: 'bg-peach', text: 'text-peach', line: 'rgba(244,200,174,0.5)' },
  ivory: { dot: 'bg-[#efeae2]', text: 'text-[#efeae2]', line: 'rgba(239,234,226,0.35)' },
  red: { dot: 'bg-[#d98a7e]', text: 'text-[#d98a7e]', line: 'rgba(217,138,126,0.5)' },
};

export function ReactionMap() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

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
    <div ref={ref} className="relative aspect-[16/10] w-full sm:aspect-[16/8]">
      {/* connectors */}
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
        {NODES.map((n, i) => {
          const mx = (CENTER.x + n.x) / 2;
          const my = (CENTER.y + n.y) / 2 - 8;
          const d = `M ${CENTER.x} ${CENTER.y} Q ${mx} ${my} ${n.x} ${n.y}`;
          return (
            <path
              key={n.label}
              d={d}
              fill="none"
              stroke={TONE[n.tone].line}
              strokeWidth="0.3"
              strokeDasharray="1"
              pathLength={1}
              style={{
                strokeDashoffset: visible ? 0 : 1,
                transition: `stroke-dashoffset 1.1s ease ${0.2 + i * 0.18}s`,
              }}
            />
          );
        })}
      </svg>

      {/* central message */}
      <div
        className="absolute -translate-x-1/2 -translate-y-1/2"
        style={{ left: `${CENTER.x}%`, top: `${CENTER.y}%` }}
      >
        <div className="w-[min(46vw,20rem)]">
          <p className="text-[0.65rem] uppercase tracking-[0.18em] text-white/40">The message</p>
          <p className="serif mt-2 text-[clamp(1.1rem,2.4vw,1.8rem)] leading-snug text-white/90">
            “4,000 people use this every single day.”
          </p>
        </div>
      </div>

      {/* nodes */}
      {NODES.map((n, i) => (
        <div
          key={n.label}
          className={cn(
            'absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-700',
            visible ? 'opacity-100' : 'opacity-0',
          )}
          style={{
            left: `${n.x}%`,
            top: `${n.y}%`,
            transitionDelay: `${0.7 + i * 0.18}s`,
          }}
        >
          <div className="flex items-center gap-2">
            <span className={cn('h-2 w-2 rounded-full', TONE[n.tone].dot)} />
            <div>
              <p className={cn('text-[0.7rem] font-medium uppercase tracking-[0.1em]', TONE[n.tone].text)}>
                {n.label}
              </p>
              <p className="text-[0.78rem] text-white/55">
                {n.reading} · {Math.round(n.conf * 100)}%
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
