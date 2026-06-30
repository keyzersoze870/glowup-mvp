'use client'
import { useEffect, useState } from 'react'

const sf = `-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif`
const BLUE = '#0A84FF'

function isStandalone() {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true
}

function isIOS() {
  if (typeof window === 'undefined') return false
  return /iPad|iPhone|iPod/.test(window.navigator.userAgent)
}

export default function InstallPrompt({ onDismiss }: { onDismiss: () => void }) {
  const [platform, setPlatform] = useState<'ios' | 'android' | 'other'>('other')

  useEffect(() => {
    if (isIOS()) setPlatform('ios')
    else if (/Android/.test(navigator.userAgent)) setPlatform('android')
  }, [])

  const handleDismiss = () => {
    localStorage.setItem('glowup_install_prompt_seen', '1')
    onDismiss()
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'flex-end',
    }}>
      <div style={{
        width: '100%', background: '#0A0A0A', borderTopLeftRadius: 24, borderTopRightRadius: 24,
        padding: '28px 24px calc(24px + env(safe-area-inset-bottom))',
        fontFamily: sf, border: '0.5px solid rgba(255,255,255,0.1)', borderBottom: 'none',
      }}>
        <div style={{ width: 40, height: 4, background: 'rgba(255,255,255,0.2)', borderRadius: 2, margin: '0 auto 20px' }} />

        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 16, background: BLUE,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 14px', fontSize: 28, fontWeight: 800, color: '#fff',
          }}>G</div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#fff', letterSpacing: -0.5, marginBottom: 6 }}>
            Garde ton score à portée de main
          </h2>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.5, letterSpacing: -0.1, maxWidth: 280, margin: '0 auto' }}>
            Installe GlowApp sur ton écran d'accueil pour suivre ton évolution chaque jour, comme une vraie app.
          </p>
        </div>

        {platform === 'ios' && (
          <div style={{ background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 16, marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ width: 24, height: 24, borderRadius: 8, background: BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0 }}>1</div>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', letterSpacing: -0.1 }}>
                Touche l'icône <span style={{ fontWeight: 700 }}>Partager</span> ⬆️ en bas de Safari
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 24, height: 24, borderRadius: 8, background: BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0 }}>2</div>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', letterSpacing: -0.1 }}>
                Sélectionne <span style={{ fontWeight: 700 }}>"Sur l'écran d'accueil"</span>
              </p>
            </div>
          </div>
        )}

        {platform === 'android' && (
          <div style={{ background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 16, marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ width: 24, height: 24, borderRadius: 8, background: BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0 }}>1</div>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', letterSpacing: -0.1 }}>
                Touche le menu <span style={{ fontWeight: 700 }}>⋮</span> en haut à droite
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 24, height: 24, borderRadius: 8, background: BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0 }}>2</div>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', letterSpacing: -0.1 }}>
                Sélectionne <span style={{ fontWeight: 700 }}>"Installer l'application"</span>
              </p>
            </div>
          </div>
        )}

        <button onClick={handleDismiss} style={{
          width: '100%', padding: 14, background: BLUE, border: 'none', borderRadius: 14,
          color: '#fff', fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: sf,
          letterSpacing: -0.3, marginBottom: 8,
        }}>
          C'est noté
        </button>
        <button onClick={handleDismiss} style={{
          width: '100%', padding: 10, background: 'none', border: 'none',
          color: 'rgba(255,255,255,0.3)', fontSize: 13, cursor: 'pointer', fontFamily: sf,
        }}>
          Plus tard
        </button>
      </div>
    </div>
  )
}

export { isStandalone }
