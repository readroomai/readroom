import { cn } from '@/lib/utils';

/* 1. Quick Read — a cinematic mini report canvas */
export function QuickReadVisual() {
  return (
    <div className="object-frame overflow-hidden">
      <div className="flex items-center gap-2 border-b border-rule px-5 py-3">
        <span className="h-2 w-2 rounded-full border border-ink/15" />
        <span className="h-2 w-2 rounded-full border border-ink/15" />
        <span className="ml-2 text-xs text-ink-muted">Room read</span>
      </div>
      <div className="grid grid-cols-[1.4fr_1fr]">
        <div className="border-r border-rule p-6">
          <p className="serif text-lg leading-relaxed text-ink">
            The best <span className="phrase-hit">product decision</span> we made this year was saying
            no to the <span className="phrase-hit">roadmap</span>.
          </p>
          <div className="mt-5 space-y-2">
            <div className="h-px w-3/4 bg-ink/10" />
            <div className="h-px w-1/2 bg-ink/10" />
          </div>
        </div>
        <div className="bg-sand/50 p-6">
          <p className="serif text-[2.6rem] leading-none text-ink">81</p>
          <p className="text-[0.7rem] uppercase tracking-wide text-ink-muted">Room Score</p>
          <div className="mt-4 space-y-2 text-[0.72rem] text-ink-soft">
            {['Clarity', 'Trust', 'Authority'].map((l) => (
              <div key={l} className="flex justify-between border-b border-ink/8 pb-1">
                <span>{l}</span>
                <span className="text-ink">{l === 'Clarity' ? 86 : l === 'Trust' ? 79 : 74}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* 2. Audience Rooms — spatial composition around a message */
export function RoomsVisual() {
  const rooms = [
    { label: 'Customers', x: 'left-2 top-4' },
    { label: 'Investors', x: 'right-3 top-8' },
    { label: 'Skeptics', x: 'left-6 bottom-6' },
    { label: 'Partners', x: 'right-6 bottom-10' },
    { label: 'Followers', x: 'left-1/2 -translate-x-1/2 top-1' },
  ];
  return (
    <div className="object-frame relative aspect-[4/3] overflow-hidden bg-paper p-6">
      <div className="absolute left-1/2 top-1/2 w-[58%] -translate-x-1/2 -translate-y-1/2 rounded-frame border border-ink/12 bg-ivory p-5 shadow-object-sm">
        <p className="serif text-[1.05rem] leading-snug text-ink">
          “We’re changing how pricing works.”
        </p>
      </div>
      {rooms.map((r) => (
        <div
          key={r.label}
          className={cn(
            'absolute rounded-md border border-ink/12 bg-ivory px-3 py-1.5 text-[0.72rem] text-ink-soft shadow-object-sm',
            r.x,
          )}
        >
          {r.label}
        </div>
      ))}
    </div>
  );
}

/* 3. Voiceprint — editorial writing profile */
export function VoiceVisual() {
  const bars = [70, 42, 88, 60, 34, 76, 52, 66, 40, 80, 58, 46];
  return (
    <div className="object-frame p-7">
      <p className="text-[0.7rem] uppercase tracking-[0.14em] text-ink-muted">Voiceprint</p>
      <p className="serif mt-2 text-2xl text-ink">Dry, direct, allergic to hype.</p>
      <div className="mt-6 flex h-16 items-end gap-1.5">
        {bars.map((b, i) => (
          <div key={i} className="flex-1 rounded-sm bg-ink/80" style={{ height: `${b}%` }} />
        ))}
      </div>
      <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
        {[
          ['Rhythm', 'Short. Then longer.'],
          ['Directness', 'High'],
          ['Temperature', 'Warm-neutral'],
          ['Never', '“thrilled to announce”'],
        ].map(([k, v]) => (
          <div key={k} className="border-t border-ink/10 pt-2">
            <p className="text-[0.7rem] uppercase tracking-wide text-ink-muted">{k}</p>
            <p className="text-ink">{v}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* 4. Profile Audit — annotated profile */
export function AuditVisual() {
  return (
    <div className="object-frame p-7">
      <div className="flex items-center gap-3 border-b border-rule pb-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-ink text-sm text-paper">A</div>
        <div>
          <p className="font-medium text-ink">alex — building things</p>
          <p className="text-sm text-ink-muted">founder · writes sometimes</p>
        </div>
      </div>
      <div className="mt-5 space-y-3">
        {[
          ['Clarity', 'Unclear who it’s for', 'text-clay'],
          ['Credibility', 'No proof in the bio', 'text-clay'],
          ['Positioning', 'Reads as generic', 'text-clay'],
          ['Memorability', 'One strong line — keep it', 'text-[#3f6b3a]'],
        ].map(([k, v, tone]) => (
          <div key={k} className="flex items-center justify-between border-b border-ink/8 pb-2">
            <span className="text-sm text-ink">{k}</span>
            <span className={cn('text-sm', tone)}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
