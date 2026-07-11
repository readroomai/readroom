import { cn } from '@/lib/utils';

/**
 * Product Hunt "Featured" badge. Uses Product Hunt's own hosted SVG so it stays
 * current (theme + daily rank). Plain <img> is what Product Hunt provides.
 */
export function ProductHuntBadge({
  className,
  eager = false,
}: {
  className?: string;
  eager?: boolean;
}) {
  return (
    <a
      href="https://www.producthunt.com/products/readroom?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-readroom"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="ReadRoom on Product Hunt"
      className={cn('inline-block', className)}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        alt="ReadRoom - Read the room before you post. | Product Hunt"
        width={250}
        height={54}
        loading={eager ? 'eager' : 'lazy'}
        src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1193982&theme=light&t=1783810133026"
      />
    </a>
  );
}
