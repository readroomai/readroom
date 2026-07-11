'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/* ---------------- Button ---------------- */
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[10px] font-medium transition-all duration-200 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-45 active:translate-y-px',
  {
    variants: {
      variant: {
        // primary editorial ink button — the main CTA
        primary: 'bg-ink text-paper hover:bg-[#2a2a2a]',
        // solid ink alias kept for existing CTAs (no gradient)
        accent: 'bg-ink text-paper hover:bg-[#2a2a2a]',
        // clay — a warm, restrained alternative used sparingly
        clay: 'bg-clay text-white hover:brightness-[1.04]',
        outline: 'border border-ink/15 bg-transparent text-ink hover:border-ink/30 hover:bg-ink/[0.03]',
        ghost: 'text-ink hover:bg-ink/[0.05]',
        subtle: 'bg-sand text-ink hover:bg-parchment',
        onDark: 'bg-paper text-ink hover:bg-white',
        outlineDark: 'border border-white/20 bg-transparent text-paper hover:bg-white/10',
      },
      size: {
        sm: 'h-8 px-3.5 text-[0.82rem]',
        md: 'h-10 px-5 text-sm',
        lg: 'h-12 px-6 text-[0.95rem]',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
    );
  },
);
Button.displayName = 'Button';

/* ---------------- Badge / label chip ---------------- */
export function Badge({
  className,
  tone = 'neutral',
  children,
}: {
  className?: string;
  tone?:
    | 'neutral'
    | 'ink'
    | 'peach'
    | 'blush'
    | 'sky'
    | 'clay'
    | 'warn'
    | 'danger'
    | 'good'
    // retained aliases, remapped to the editorial palette
    | 'iris'
    | 'mint'
    | 'ice';
  children: React.ReactNode;
}) {
  const tones: Record<string, string> = {
    neutral: 'bg-ink/[0.05] text-ink-soft',
    ink: 'bg-ink text-paper',
    peach: 'bg-peach/50 text-[#8a4b28]',
    blush: 'bg-blush/60 text-[#9c4747]',
    sky: 'bg-sky/50 text-cobalt',
    clay: 'bg-clay/15 text-clay',
    good: 'bg-[#e4ede0] text-[#3f6b3a]',
    warn: 'bg-[#f6ecd4] text-[#8a6d1f]',
    danger: 'bg-[#f5dcd8] text-[#9c3d33]',
    iris: 'bg-sky/40 text-cobalt',
    mint: 'bg-[#e4ede0] text-[#3f6b3a]',
    ice: 'bg-sky/40 text-cobalt',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[0.7rem] font-medium tracking-wide',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/* ---------------- Surface (used sparingly, flatter than a card) ---------------- */
export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('rounded-frame border border-rule bg-ivory shadow-object-sm', className)}
      {...props}
    />
  );
}

/* ---------------- Field primitives ---------------- */
export function Label({
  className,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn(
        'mb-1.5 block text-xs font-medium uppercase tracking-[0.08em] text-ink-soft',
        className,
      )}
      {...props}
    />
  );
}

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      'h-10 w-full rounded-[10px] border border-ink/12 bg-ivory px-3.5 text-sm text-ink outline-none transition placeholder:text-ink-muted focus:border-ink/35',
      className,
    )}
    {...props}
  />
));
Input.displayName = 'Input';

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      'w-full rounded-[12px] border border-ink/12 bg-ivory px-4 py-3 text-[0.95rem] leading-relaxed text-ink outline-none transition placeholder:text-ink-muted focus:border-ink/35 rr-scroll',
      className,
    )}
    {...props}
  />
));
Textarea.displayName = 'Textarea';

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
  <div className="relative">
    <select
      ref={ref}
      className={cn(
        'h-10 w-full appearance-none rounded-[10px] border border-ink/12 bg-ivory px-3.5 pr-9 text-sm text-ink outline-none transition focus:border-ink/35',
        className,
      )}
      {...props}
    >
      {children}
    </select>
    <svg
      className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  </div>
));
Select.displayName = 'Select';

/* ---------------- Segmented control (editorial, not pill) ---------------- */
export function PillGroup<T extends string>({
  options,
  value,
  onChange,
  className,
  size = 'md',
}: {
  options: { id: T; label: string; hint?: string }[];
  value: T;
  onChange: (v: T) => void;
  className?: string;
  size?: 'sm' | 'md';
}) {
  return (
    <div className={cn('flex flex-wrap gap-1.5', className)} role="radiogroup">
      {options.map((o) => {
        const active = o.id === value;
        return (
          <button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={active}
            title={o.hint}
            onClick={() => onChange(o.id)}
            className={cn(
              'rounded-[8px] border transition-all',
              size === 'sm' ? 'px-3 py-1 text-[0.78rem]' : 'px-3.5 py-1.5 text-sm',
              active
                ? 'border-ink bg-ink text-paper'
                : 'border-ink/12 bg-transparent text-ink-soft hover:border-ink/25 hover:text-ink',
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/* ---------------- Spinner ---------------- */
export function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={cn('h-4 w-4 animate-spin', className)}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" />
      <path
        className="opacity-90"
        d="M22 12a10 10 0 0 1-10 10"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
