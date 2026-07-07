'use client'
import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

const sf = `-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif`
const BLUE = '#0A84FF'
const ACCENT = '#90D5FF'
const RED = '#FF453A'

function BeforeAfterSlider() {
  const [sliderPos, setSliderPos] = useState(50)
  const containerRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)

  const handleMove = (clientX: number) => {
    if (!containerRef.current || !dragging.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = clientX - rect.left
    const pct = Math.max(2, Math.min(98, (x / rect.width) * 100))
    setSliderPos(pct)
  }

  const onMouseDown = () => { dragging.current = true }
  const onMouseUp = () => { dragging.current = false }
  const onMouseMove = (e: React.MouseEvent) => handleMove(e.clientX)
  const onTouchMove = (e: React.TouchEvent) => { handleMove(e.touches[0].clientX) }
  const onTouchStart = () => { dragging.current = true }
  const onTouchEnd = () => { dragging.current = false }

  return (
    <div
      ref={containerRef}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseUp}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onTouchMove={onTouchMove}
      style={{
        position: 'relative', width: '100%', aspectRatio: '1/1',
        borderRadius: 20, overflow: 'hidden', cursor: 'ew-resize',
        userSelect: 'none', touchAction: 'none',
        border: '0.5px solid rgba(0,0,0,0.08)',
      }}
    >
      {/* After (low cortisol) — full background */}
      <img src="/before-low.jpg" alt="Low cortisol" style={{
        position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
      }} />

      {/* Before (high cortisol) — clipped */}
      <div style={{
        position: 'absolute', inset: 0, width: `${sliderPos}%`, overflow: 'hidden',
      }}>
        <img src="/before-high.jpg" alt="High cortisol" style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
          minWidth: `${100 / (sliderPos / 100)}%`, maxWidth: `${100 / (sliderPos / 100)}%`,
        }} />
      </div>

      {/* Labels */}
      <div style={{
        position: 'absolute', top: 12, left: 12, background: 'rgba(255,69,58,0.9)',
        borderRadius: 8, padding: '4px 10px', fontSize: 11, fontWeight: 600,
        color: '#fff', letterSpacing: 0.3, fontFamily: sf,
      }}>HIGH CORTISOL</div>
      <div style={{
        position: 'absolute', top: 12, right: 12, background: 'rgba(48,209,88,0.9)',
        borderRadius: 8, padding: '4px 10px', fontSize: 11, fontWeight: 600,
        color: '#fff', letterSpacing: 0.3, fontFamily: sf,
      }}>LOW CORTISOL</div>

      {/* Slider line + handle */}
      <div style={{
        position: 'absolute', top: 0, bottom: 0, left: `${sliderPos}%`,
        transform: 'translateX(-50%)', width: 3, background: '#FFFFFF',
        boxShadow: '0 0 8px rgba(0,0,0,0.3)',
      }} />
      <div style={{
        position: 'absolute', top: '50%', left: `${sliderPos}%`,
        transform: 'translate(-50%, -50%)', width: 40, height: 40,
        borderRadius: '50%', background: '#FFFFFF',
        boxShadow: '0 2px 10px rgba(0,0,0,0.25)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 10,
      }}>
        <span style={{ fontSize: 16, color: '#1A1A1A', fontWeight: 300 }}>⟨⟩</span>
      </div>
    </div>
  )
}

export default function LandingPage() {
  const router = useRouter()

  useEffect(() => {
    const p = localStorage.getItem('glowup_profile')
    if (p) { router.push('/today'); return }
  }, [])

  return (
    <main style={{ minHeight: '100svh', background: '#FFFFFF', fontFamily: sf, display: 'flex', flexDirection: 'column' }}>

      {/* NAV */}
      <nav style={{ flexShrink: 0, padding: '56px 20px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 20, fontWeight: 700, color: '#1A1A1A', letterSpacing: -0.5 }}>GlowApp</span>
        <Link href="/onboarding" style={{ background: ACCENT, color: '#fff', border: 'none', borderRadius: 20, padding: '7px 16px', fontSize: 12, fontWeight: 600, textDecoration: 'none', letterSpacing: -0.2 }}>
          Start now
        </Link>
      </nav>

      {/* HERO TEXT */}
      <div style={{ padding: '4px 20px 12px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,69,58,0.08)', border: '0.5px solid rgba(255,69,58,0.2)', borderRadius: 20, padding: '4px 12px', marginBottom: 10 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: RED, animation: 'blink 1.5s infinite' }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: RED, letterSpacing: 0.2 }}>CORTISOL FACE IS REAL</span>
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1A1A1A', letterSpacing: -0.8, lineHeight: 1.2, marginBottom: 6 }}>
          High cortisol is puffing<br />your face <span style={{ color: RED }}>right now</span>
        </h1>
        <p style={{ fontSize: 13, color: 'rgba(0,0,0,0.45)', letterSpacing: -0.2, lineHeight: 1.5 }}>
          Slide to see the difference ↓
        </p>
      </div>

      {/* BEFORE/AFTER SLIDER */}
      <div style={{ padding: '0 20px', marginBottom: 12 }}>
        <BeforeAfterSlider />
        <p style={{ fontSize: 11, color: 'rgba(0,0,0,0.3)', textAlign: 'center', marginTop: 6, letterSpacing: -0.1 }}>
          Same person. Same lighting. Only difference: cortisol levels.
        </p>
      </div>

      {/* STATS ROW */}
      <div style={{ padding: '0 20px', display: 'flex', gap: 8, marginBottom: 12 }}>
        <div style={{ flex: 1, background: 'rgba(255,69,58,0.06)', border: '0.5px solid rgba(255,69,58,0.15)', borderRadius: 12, padding: '10px', textAlign: 'center' }}>
          <p style={{ fontSize: 20, fontWeight: 700, color: RED, letterSpacing: -1 }}>78%</p>
          <p style={{ fontSize: 10, color: 'rgba(0,0,0,0.45)', marginTop: 2 }}>of women have elevated cortisol</p>
        </div>
        <div style={{ flex: 1, background: 'rgba(48,209,88,0.06)', border: '0.5px solid rgba(48,209,88,0.15)', borderRadius: 12, padding: '10px', textAlign: 'center' }}>
          <p style={{ fontSize: 20, fontWeight: 700, color: '#30D158', letterSpacing: -1 }}>21 days</p>
          <p style={{ fontSize: 10, color: 'rgba(0,0,0,0.45)', marginTop: 2 }}>to see visible face changes</p>
        </div>
      </div>

      {/* CTA */}
      <div style={{ padding: '0 20px 24px' }}>
        <Link href="/onboarding" style={{
          fontSize: 15, fontWeight: 600, color: '#FFFFFF', background: ACCENT, padding: '14px 0', borderRadius: 14,
          textDecoration: 'none', letterSpacing: -0.3, display: 'block', textAlign: 'center',
        }}>
          Check my cortisol level — Free
        </Link>
        <p style={{ fontSize: 11, color: 'rgba(0,0,0,0.2)', marginTop: 6, letterSpacing: -0.1, textAlign: 'center' }}>2 min · No credit card required</p>
      </div>

      <style>{`
        @keyframes blink { 0%,100% { opacity:1 } 50% { opacity:0.3 } }
        * { box-sizing:border-box; margin:0; padding:0; }
      `}</style>
    </main>
  )
}
