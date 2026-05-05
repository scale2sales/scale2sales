import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Scale2Sales — AI Chatbot for Your Website'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)',
          fontFamily: 'Arial, sans-serif',
          position: 'relative',
        }}
      >
        {/* Background dots pattern */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          display: 'flex',
        }}/>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            background: '#6366f1',
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <div style={{
              width: '24px',
              height: '24px',
              borderLeft: '10px solid transparent',
              borderRight: '0px solid transparent',
              borderTop: '14px solid white',
              borderBottom: '14px solid transparent',
              marginLeft: '4px',
            }}/>
          </div>
          <span style={{ fontSize: '36px', fontWeight: '700', color: 'white' }}>
            Scale2Sales
          </span>
        </div>

        {/* Main headline */}
        <h1 style={{
          fontSize: '64px',
          fontWeight: '800',
          color: 'white',
          textAlign: 'center',
          margin: '0 0 16px',
          lineHeight: '1.1',
          maxWidth: '900px',
        }}>
          AI Chatbot for Your Website
        </h1>

        {/* Subheadline */}
        <p style={{
          fontSize: '28px',
          color: 'rgba(199, 210, 254, 0.9)',
          textAlign: 'center',
          margin: '0 0 40px',
          maxWidth: '700px',
          lineHeight: '1.4',
        }}>
          Trained on your content. Live in 5 minutes. No coding required.
        </p>

        {/* Feature pills */}
        <div style={{ display: 'flex', gap: '16px' }}>
          {['24/7 AI Support', 'Lead Capture', 'Free Plan Available'].map((text) => (
            <div key={text} style={{
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '50px',
              padding: '10px 24px',
              color: 'white',
              fontSize: '18px',
              fontWeight: '500',
            }}>
              {text}
            </div>
          ))}
        </div>

        {/* URL badge */}
        <div style={{
          position: 'absolute',
          bottom: '32px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '50px',
          padding: '8px 20px',
        }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4ade80' }}/>
          <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '16px' }}>scale2sales.com</span>
        </div>
      </div>
    ),
    { ...size }
  )
}
