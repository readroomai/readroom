import { cn } from '@/lib/utils';

/**
 * ReadRoom mark — two quotation strokes set inside an aperture. The gap between
 * the quotes reads as an eye / a room opening formed by language. Flat, single
 * colour (currentColor), legible at 24px, and equally strong in pure black or
 * white. No gradient, no sparkle.
 */
export function Logomark({
  className,
  title = 'ReadRoom',
}: {
  className?: string;
  title?: string;
}) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      role="img"
      aria-label={title}
      className={cn('h-7 w-7', className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* aperture / room opening — an eye formed by two arcs */}
      <path
        d="M2 16 Q16 5 30 16 Q16 27 2 16 Z"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinejoin="round"
        fill="none"
      />
      {/* pupil */}
      <circle cx="16" cy="16" r="3.4" fill="currentColor" />
      {/* two quotation ticks above — language entering the room */}
      <path
        d="M12.4 9.4c-.9.3-1.5 1-1.5 1.9h1.5V9.4Z"
        fill="currentColor"
      />
      <path
        d="M20.6 9.4c-.9.3-1.5 1-1.5 1.9h1.5V9.4Z"
        fill="currentColor"
      />
    </svg>
  );
}

/** Founder's public X (Twitter) profile. */
export const FOUNDER_X_URL = 'https://x.com/GiaMMacool';

/** The X (formerly Twitter) glyph. Flat, single colour. */
export function XIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={cn('h-4 w-4', className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.657l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
    </svg>
  );
}

export function Wordmark({
  className,
  withMark = true,
  markClassName,
}: {
  className?: string;
  withMark?: boolean;
  markClassName?: string;
}) {
  return (
    <span className={cn('inline-flex items-center gap-2 text-ink', className)}>
      {withMark && <Logomark className={cn('h-6 w-6', markClassName)} />}
      <span className="text-[1.05rem] font-medium tracking-[-0.01em]">ReadRoom</span>
    </span>
  );
}
