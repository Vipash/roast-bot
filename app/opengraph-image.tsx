import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Roast My Profile — AI Critic';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0a0a0a',
          color: '#ffffff',
          fontFamily: 'sans-serif',
          border: '16px solid #171717',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-10%',
            right: '-10%',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(239, 68, 68, 0.3) 0%, transparent 70%)',
          }}
        />

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '8px 24px',
            borderRadius: '999px',
            backgroundColor: '#450a0a',
            border: '2px solid #ef4444',
            color: '#f87171',
            fontSize: '24px',
            fontWeight: 'bold',
            marginBottom: '32px',
          }}
        >
          🔥 SAVAGE AI CAREER CRITIC
        </div>

        <div
          style={{
            fontSize: '64px',
            fontWeight: 900,
            letterSpacing: '-2px',
            textAlign: 'center',
            marginBottom: '20px',
            background: 'linear-gradient(to right, #f87171, #fb923c, #fde68a)',
            backgroundClip: 'text',
            color: 'transparent',
          }}
        >
          Roast My Profile
        </div>

        <div
          style={{
            fontSize: '28px',
            color: '#a3a3a3',
            textAlign: 'center',
            maxWidth: '850px',
            lineHeight: 1.4,
          }}
        >
          Brutally honest critiques of your Resume, LinkedIn headline, or GitHub.
          With instant exportable share cards.
        </div>

        <div
          style={{
            position: 'absolute',
            bottom: '36px',
            fontSize: '20px',
            color: '#737373',
            fontFamily: 'monospace',
          }}
        >
          roast-bot-plum.vercel.app
        </div>
      </div>
    ),
    { ...size }
  );
}