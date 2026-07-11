import { cn } from '@/lib/utils';

/**
 * Atmospheric warm light — a soft peach/ivory light source used as environment,
 * not decoration. Purely presentational; hidden from assistive tech and honours
 * reduced-motion. (Named Aurora for historical import stability.)
 */
export function Aurora({
  className,
  intensity = 'default',
}: {
  className?: string;
  intensity?: 'default' | 'subtle';
}) {
  return (
    <div
      className={cn('warm-light', intensity === 'subtle' && 'opacity-70', className)}
      aria-hidden="true"
    />
  );
}
