import { ImageResponse } from 'next/og';

export const runtime = 'nodejs';
export const alt = 'ReadRoom — Read the room before you post';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #F8F7FC 0%, #E9E4FF 40%, #FCE8F3 75%, #E7F7FA 100%)',
          padding: '72px',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              background: 'linear-gradient(135deg,#111111,#111111)',
              display: 'flex',
            }}
          />
          <span style={{ fontSize: 36, fontWeight: 700, color: '#101014' }}>readroom</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: 84, fontWeight: 600, color: '#101014', lineHeight: 1.05, letterSpacing: '-0.03em' }}>
            Read the room
          </span>
          <span style={{ fontSize: 84, fontWeight: 600, color: '#101014', lineHeight: 1.05, letterSpacing: '-0.03em', fontStyle: 'italic' }}>
            before you post.
          </span>
          <span style={{ fontSize: 30, color: '#686572', marginTop: 24, maxWidth: 900 }}>
            AI audience simulation for people whose words carry weight.
          </span>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          {['Supporters', 'Skeptics', 'Investors', 'Neutral', 'Experts'].map((s, i) => (
            <div
              key={s}
              style={{
                display: 'flex',
                padding: '10px 20px',
                borderRadius: 999,
                fontSize: 24,
                color: '#101014',
                background: ['#E9E4FF', '#FCE8F3', '#E7F7FA', '#E9F8F2', '#E9E4FF'][i],
              }}
            >
              {s}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size },
  );
}
