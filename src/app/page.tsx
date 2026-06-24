'use client'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useState, useEffect } from 'react'

const HoloBody = dynamic(() => import('@/components/HoloBody'), { ssr: false })

const METRICS = [
  { label: 'TRAINING', val: '9.1', color: '#C8FF00', pct: 91, side: 'left', top: '22%' },
  { label: 'EAU',      val: '7.4', color: '#00F5FF', pct: 74, side: 'left', top: '40%' },
  { label: 'SOMMEIL',  val: '6.2', color: '#A78BFA', pct: 62, side: 'left', top: '58%' },
  { label: 'NUTRITION',val: '8.5', color: '#C8FF00', pct: 85, side: 'right', top: '22%' },
  { label: 'SKINCARE', val: '5.0', color: '#FF6B35', pct: 50, side: 'right', top: '40%' },
  { label: 'STEPS',    val: '9.2', color: '#00F5FF', pct: 92, side: 'right', top: '58%' },
]

export default function LandingPage() {
  const [score, setScore] = useState(0)

  useEffect(() => {
    let s = 0
    const t = setInterval(() => {
      s += 1
      setScore(s)
      if (s >= 72) clearInterval(t)
    }, 22)
    return () => clearInterval(t)
  }, [])

  return (
    <main style={{ minHeight: '100vh', background: '#06060F', fontFamily: "'JetBrains Mono', monospace", overflow: 'hidden' }}>

      {/* NAV */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(200,255,0,0.08)', background: 'rgba(6,6,15,0.85)', backdropFilter: 'blur(8px)' }}>
        <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 22, fontWeight: 800, color: '#C8FF00', letterSpacing: 3 }}>GLOWUP</span>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Link href="/login" style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', textDecoration: 'none', letterSpacing: 1 }}>CONNEXION</Link>
          <Link href="/onboarding" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 13, color: '#000', background: '#C8FF00', padding: '8px 18px', borderRadius: 20, textDecoration: 'none', letterSpacing: 1 }}>
            COMMENCER →
          </Link>
        </div>
      </nav>

      {/* HERO — HOLOGRAPHIC SCANNER */}
      <div style={{ position: 'relative', height: '100vh', width: '100%' }}>

        {/* Grid background */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.04, backgroundImage: 'linear-gradient(rgba(200,255,0,1) 1px,transparent 1px),linear-gradient(90deg,rgba(200,255,0,1) 1px,transparent 1px)', backgroundSize: '36px 36px' }} />

        {/* Corner brackets */}
        {[['top:60px;left:16px', '1.5px 0 0 1.5px'], ['top:60px;right:16px', '1.5px 1.5px 0 0'], ['bottom:16px;left:16px', '0 0 1.5px 1.5px'], ['bottom:16px;right:16px', '0 1.5px 1.5px 0']].map(([pos, bw], i) => (
          <div key={i} style={{ position: 'absolute', ...Object.fromEntries(pos.split(';').map(s => s.split(':'))), width: 20, height: 20, borderColor: 'rgba(200,255,0,0.4)', borderStyle: 'solid', borderWidth: bw }} />
        ))}

        {/* Three.js canvas */}
        <HoloBody score={score} />

        {/* METRICS — superposés sur le canvas */}
        {METRICS.map((m) => (
          <div key={m.label} style={{
            position: 'absolute',
            [m.side]: 14,
            top: m.top,
            zIndex: 10,
            textAlign: m.side === 'right' ? 'right' : 'left',
          }}>
            {/* Ligne leader */}
            <div style={{ width: 32, height: 1, background: m.color, opacity: 0.3, marginBottom: 4, marginLeft: m.side === 'right' ? 'auto' : 0 }} />
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 22, fontWeight: 800, color: m.color, lineHeight: 1 }}>{m.val}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.35)', letterSpacing: 1, marginTop: 2 }}>{m.label}</div>
            <div style={{ width: 36, height: 2, background: 'rgba(255,255,255,0.08)', borderRadius: 1, marginTop: 4, marginLeft: m.side === 'right' ? 'auto' : 0 }}>
              <div style={{ width: `${m.pct}%`, height: '100%', background: m.color, borderRadius: 1 }} />
            </div>
          </div>
        ))}

        {/* SCORE CENTRAL — en bas */}
        <div style={{ position: 'absolute', bottom: 100, left: '50%', transform: 'translateX(-50%)', textAlign: 'center', zIndex: 10 }}>
          <div style={{ fontSize: 9, color: 'rgba(200,255,0,0.5)', letterSpacing: 3, marginBottom: 4 }}>GLOW UP SCORE</div>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 72, fontWeight: 800, color: '#C8FF00', lineHeight: 1 }}>{score}</div>
          <div style={{ fontSize: 9, color: 'rgba(200,255,0,0.4)', letterSpacing: 2, marginTop: 2 }}>/ 100</div>
        </div>

        {/* LIVE badge */}
        <div style={{ position: 'absolute', top: 76, left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(200,255,0,0.06)', border: '1px solid rgba(200,255,0,0.15)', padding: '5px 14px', borderRadius: 20, zIndex: 10 }}>
          <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#C8FF00', animation: 'blink 1s infinite' }} />
          <span style={{ fontSize: 9, color: '#C8FF00', letterSpacing: 2 }}>SCAN ACTIF</span>
        </div>

        {/* CTA bottom */}
        <div style={{ position: 'absolute', bottom: 28, left: '50%', transform: 'translateX(-50%)', zIndex: 10, textAlign: 'center' }}>
          <Link href="/onboarding" style={{
            fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 16,
            color: '#000', background: '#C8FF00', padding: '14px 36px', borderRadius: 30,
            textDecoration: 'none', letterSpacing: 2, display: 'inline-block',
          }}>
            CALCULER MON SCORE — GRATUIT
          </Link>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', marginTop: 8, letterSpacing: 1 }}>2 MIN · AUCUNE CB</div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800&family=JetBrains+Mono:wght@500&display=swap');
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.1} }
        * { box-sizing: border-box; margin: 0; padding: 0; }
      `}</style>
    </main>
  )
}
