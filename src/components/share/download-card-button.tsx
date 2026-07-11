'use client';

import { useState } from 'react';
import { Download } from 'lucide-react';
import { Button, Spinner } from '@/components/ui';

export function DownloadCardButton({ slug }: { slug: string }) {
  const [busy, setBusy] = useState(false);
  return (
    <Button
      variant="outline"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        try {
          const res = await fetch(`/r/${slug}/image`);
          const blob = await res.blob();
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `readroom-${slug}.png`;
          a.click();
          URL.revokeObjectURL(url);
        } finally {
          setBusy(false);
        }
      }}
    >
      {busy ? <Spinner /> : <Download className="h-4 w-4" />}
      Download PNG
    </Button>
  );
}
