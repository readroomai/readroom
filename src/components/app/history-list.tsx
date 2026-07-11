'use client';

import { useMemo, useState } from 'react';
import { Search, Star, Clock } from 'lucide-react';
import { Input, Select, Card } from '@/components/ui';
import { AnalysisRow } from './analysis-row';
import { PLATFORMS } from '@/lib/constants';
import type { AnalysisRecord } from '@/lib/store/types';

export function HistoryList({ analyses }: { analyses: AnalysisRecord[] }) {
  const [q, setQ] = useState('');
  const [platform, setPlatform] = useState('');
  const [type, setType] = useState('');
  const [favOnly, setFavOnly] = useState(false);

  const filtered = useMemo(() => {
    const query = q.toLowerCase().trim();
    return analyses.filter((a) => {
      if (platform && a.platform !== platform) return false;
      if (type && a.analysisType !== type) return false;
      if (favOnly && !a.isFavourite) return false;
      if (query && !a.title.toLowerCase().includes(query) && !a.originalText.toLowerCase().includes(query))
        return false;
      return true;
    });
  }, [analyses, q, platform, type, favOnly]);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative min-w-[12rem] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search reads…"
            className="pl-9"
            aria-label="Search history"
          />
        </div>
        <Select value={platform} onChange={(e) => setPlatform(e.target.value)} className="w-auto min-w-[8rem]" aria-label="Filter by platform">
          <option value="">All platforms</option>
          {PLATFORMS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </Select>
        <Select value={type} onChange={(e) => setType(e.target.value)} className="w-auto min-w-[8rem]" aria-label="Filter by type">
          <option value="">All types</option>
          <option value="quick_read">Quick Read</option>
          <option value="compare">Compare</option>
        </Select>
        <button
          type="button"
          onClick={() => setFavOnly((f) => !f)}
          className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm transition ${
            favOnly ? 'border-amber-300 bg-amber-50 text-amber-700' : 'border-rule bg-white text-ink-soft hover:text-ink'
          }`}
          aria-pressed={favOnly}
        >
          <Star className={`h-3.5 w-3.5 ${favOnly ? 'fill-amber-400 text-amber-400' : ''}`} /> Favourites
        </button>
      </div>

      {filtered.length === 0 ? (
        <Card className="p-10 text-center">
          <Clock className="mx-auto h-8 w-8 text-ink-soft" />
          <p className="mt-3 text-sm text-ink-soft">
            {analyses.length === 0 ? 'No reads yet. Your history will appear here.' : 'No reads match these filters.'}
          </p>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((a) => (
            <AnalysisRow key={a.id} analysis={a} showActions />
          ))}
        </div>
      )}
    </div>
  );
}
