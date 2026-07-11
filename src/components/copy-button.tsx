'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { Button, type ButtonProps } from '@/components/ui';
import { cn } from '@/lib/utils';

export function CopyButton({
  text,
  label = 'Copy',
  copiedLabel = 'Copied',
  className,
  variant = 'outline',
  size = 'sm',
}: {
  text: string;
  label?: string;
  copiedLabel?: string;
  className?: string;
  variant?: ButtonProps['variant'];
  size?: ButtonProps['size'];
}) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={cn(className)}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1600);
        } catch {
          /* clipboard unavailable — no-op */
        }
      }}
      aria-live="polite"
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? copiedLabel : label}
    </Button>
  );
}
