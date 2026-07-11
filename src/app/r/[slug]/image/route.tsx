import { ImageResponse } from 'next/og';
import { getStore } from '@/lib/store';
import { DIMENSION_KEYS, DIMENSION_LABELS } from '@/lib/constants';
import { scoreBand } from '@/lib/utils';
import type { QuickReadResult } from '@/lib/ai/schemas';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const store = getStore();
  const link = await store.getShareBySlug(slug);
  if (!link || !link.isActive) {
    return new Response('Not found', { status: 404 });
  }
  const analysis = await store.getAnalysisById(link.analysisId);
  if (!analysis || analysis.analysisType !== 'quick_read') {
    return new Response('Not found', { status: 404 });
  }
  const result = analysis.result as QuickReadResult;
  const band = scoreBand(result.roomScore);

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(135deg, #F8F7FC 0%, #E9E4FF 45%, #FCE8F3 100%)',
          padding: '64px',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: 'linear-gradient(135deg,#111111,#111111)',
                display: 'flex',
              }}
            />
            <span style={{ fontSize: 34, fontWeight: 700, color: '#101014' }}>readroom</span>
          </div>
          <span style={{ fontSize: 22, color: '#686572' }}>Room read</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '48px', marginTop: '56px' }}>
          <div
            style={{
              width: 220,
              height: 220,
              borderRadius: '50%',
              background: 'white',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 20px 60px rgba(16,16,20,0.12)',
            }}
          >
            <span style={{ fontSize: 96, fontWeight: 700, color: '#101014' }}>{result.roomScore}</span>
            <span style={{ fontSize: 24, color: '#111111' }}>{band.label}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 700 }}>
            <span style={{ fontSize: 44, fontWeight: 600, color: '#101014', lineHeight: 1.15 }}>
              {result.firstImpression}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '18px 40px', marginTop: '56px' }}>
          {DIMENSION_KEYS.slice(0, 6).map((k) => (
            <div key={k} style={{ display: 'flex', flexDirection: 'column', width: 320 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 22 }}>
                <span style={{ color: '#686572' }}>{DIMENSION_LABELS[k]}</span>
                <span style={{ color: '#101014', fontWeight: 600 }}>{result.dimensions[k].score}</span>
              </div>
              <div style={{ display: 'flex', height: 8, background: 'rgba(16,16,20,0.08)', borderRadius: 999, marginTop: 6 }}>
                <div
                  style={{
                    width: `${result.dimensions[k].score}%`,
                    background: 'linear-gradient(90deg,#111111,#111111)',
                    borderRadius: 999,
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        <span style={{ marginTop: 'auto', fontSize: 22, color: '#686572' }}>
          Read the room before you post — readroom
        </span>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
