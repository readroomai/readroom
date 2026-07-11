'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui';

const STEPS = [
  'Reading the words as written…',
  'Stepping into each seat in the room…',
  'Testing for misreads and clip risks…',
  'Weighing what to keep and what to sharpen…',
  'Composing rewrites in your voice…',
];

export function AnalysingState() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setStep((s) => (s + 1) % STEPS.length), 1400);
    return () => clearInterval(id);
  }, []);

  return (
    <Card className="relative overflow-hidden p-8" role="status" aria-live="polite">
      <div className="rr-scanline animate-scan" aria-hidden />
      <div className="relative flex flex-col items-center gap-4 text-center">
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-2.5 w-2.5 animate-pulse rounded-full bg-ink"
              style={{ animationDelay: `${i * 200}ms` }}
            />
          ))}
        </div>
        <p className="text-sm font-medium text-ink">{STEPS[step]}</p>
        <div className="grid w-full max-w-md gap-3 pt-2">
          <div className="h-3 w-1/2 rounded-full rr-shimmer animate-shimmer" />
          <div className="h-24 rounded-2xl rr-shimmer animate-shimmer" />
          <div className="grid grid-cols-2 gap-3">
            <div className="h-16 rounded-2xl rr-shimmer animate-shimmer" />
            <div className="h-16 rounded-2xl rr-shimmer animate-shimmer" />
          </div>
        </div>
        <span className="sr-only">Analysing your content. This usually takes a few seconds.</span>
      </div>
    </Card>
  );
}
