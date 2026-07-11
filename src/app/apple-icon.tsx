import { ImageResponse } from 'next/og';

export const runtime = 'nodejs';
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '180px',
          height: '180px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#F8F7FC',
          borderRadius: 40,
        }}
      >
        <div
          style={{
            width: 108,
            height: 108,
            borderRadius: '50%',
            background: 'linear-gradient(135deg,#111111,#111111)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#F8F7FC', display: 'flex' }} />
        </div>
      </div>
    ),
    { ...size },
  );
}
