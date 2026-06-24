'use client'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useState, useEffect } from 'react'

const HoloBody = dynamic(() => import('@/components/HoloBody'), { ssr: false })

const METRICS_LEFT = [
  { label: 'Training',  val: '9.1', color: '#C8FF00', pct: 91 },
  { label: 'Eau',       val: '7.4', color: '#00F5FF', pct: 74 },
  { label: 'Sommeil',   val: '6.2', color: '#A78BFA', pct: 62 },
]
const METRICS_RIGHT = [
  { label: 'Nutrition', val: '8.5', color: '#C8FF00', pct: 85 },
  { label: 'Skincare',  val: '5.0', color: '#FF6B35', pct: 50 },
  { label: 'Pas/jour',  val: '9.2', color: '#00F5FF', pct: 92 },
]

export default function LandingPage() {
  const [score, setScore] = useState(0)

  useEffect(() => {
    let s = 0
    const t = setInterval(() => { s++; setScore(s); if (s >= 72) clearInterval(t) }, 22)
    return () => clearInterval(t)
  }, [])

  return (
    <main style={{ height: '100dvh', background: '#06060F', fontFamily: "'JetBrains Mono',monospace", overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

      {/* NAV */}
      <nav style={{ flexShrink: 0, padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(200,255,0,0.08)', background: 'rgba(6,6,15,0.95)', zIndex: 100 }}>
        <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 20, fontWeight: 800, color: '#C8FF00', letterSpacing: 3 }}>GLOWUP</span>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Link href="/login" style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', textDecoration: 'none', letterSpacing: 1 }}>Connexion</Link>
          <Link href="/onboarding" style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 11, color: '#000', background: '#C8FF00', padding: '6px 12px', borderRadius: 20, textDecoration: 'none', letterSpacing: 1 }}>Commencer →</Link>
        </div>
      </nav>

      {/* HERO */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>

        {/* Grid bg */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.04, backgroundImage: 'linear-gradient(rgba(200,255,0,1) 1px,transparent 1px),linear-gradient(90deg,rgba(200,255,0,1) 1px,transparent 1px)', backgroundSize: '30px 30px' }} />

        {/* Three.js */}
        <HoloBody score={score} />

        {/* SCAN ACTIF badge */}
        <div style={{ position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(200,255,0,0.06)', border: '1px solid rgba(200,255,0,0.15)', padding: '4px 10px', borderRadius: 20, zIndex: 10, whiteSpace: 'nowrap' }}>
          <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#C8FF00', animation: 'blink 1s infinite' }} />
          <span style={{ fontSize: 8, color: '#C8FF00', letterSpacing: 2 }}>SCAN ACTIF</span>
        </div>

        {/* SVG LIGNES + MÉTRIQUES superposés */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 9, pointerEvents: 'none' }} viewBox="0 0 390 580" preserveAspectRatio="none">
          {/* Lignes gauche → centre */}
          <line x1="88" y1="130" x2="185" y2="200" stroke="#C8FF00" strokeWidth="0.5" strokeOpacity="0.4" strokeDasharray="3 3"/>
          <line x1="88" y1="240" x2="185" y2="280" stroke="#00F5FF" strokeWidth="0.5" strokeOpacity="0.4" strokeDasharray="3 3"/>
          <line x1="88" y1="350" x2="185" y2="340" stroke="#A78BFA" strokeWidth="0.5" strokeOpacity="0.4" strokeDasharray="3 3"/>
          {/* Lignes droite → centre */}
          <line x1="302" y1="130" x2="205" y2="200" stroke="#C8FF00" strokeWidth="0.5" strokeOpacity="0.4" strokeDasharray="3 3"/>
          <line x1="302" y1="240" x2="205" y2="280" stroke="#FF6B35" strokeWidth="0.5" strokeOpacity="0.4" strokeDasharray="3 3"/>
          <line x1="302" y1="350" x2="205" y2="340" stroke="#00F5FF" strokeWidth="0.5" strokeOpacity="0.4" strokeDasharray="3 3"/>
          {/* Points terminaux sur le corps */}
          <circle cx="185" cy="200" r="2.5" fill="#C8FF00" opacity="0.8"/>
          <circle cx="185" cy="280" r="2.5" fill="#00F5FF" opacity="0.8"/>
          <circle cx="185" cy="340" r="2.5" fill="#A78BFA" opacity="0.8"/>
          <circle cx="205" cy="200" r="2.5" fill="#C8FF00" opacity="0.8"/>
          <circle cx="205" cy="280" r="2.5" fill="#FF6B35" opacity="0.8"/>
          <circle cx="205" cy="340" r="2.5" fill="#00F5FF" opacity="0.8"/>
        </svg>

        {/* MÉTRIQUES GAUCHE */}
        <div style={{ position: 'absolute', left: 0, top: '18%', zIndex: 10, display: 'flex', flexDirection: 'column', gap: 0 }}>
          {METRICS_LEFT.map((m, i) => (
            <div key={m.label} style={{ padding: '10px 8px 10px 10px', marginBottom: i < 2 ? 24 : 0 }}>
              <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 18, fontWeight: 800, color: m.color, lineHeight: 1 }}>{m.val}</div>
              <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.4)', letterSpacing: 0.5, marginTop: 2, textTransform: 'uppercase' }}>{m.label}</div>
              <div style={{ width: 34, height: 2, background: 'rgba(255,255,255,0.08)', borderRadius: 1, marginTop: 3 }}>
                <div style={{ width: `${m.pct}%`, height: '100%', background: m.color, borderRadius: 1 }} />
              </div>
            </div>
          ))}
        </div>

        {/* MÉTRIQUES DROITE */}
        <div style={{ position: 'absolute', right: 0, top: '18%', zIndex: 10, display: 'flex', flexDirection: 'column', gap: 0 }}>
          {METRICS_RIGHT.map((m, i) => (
            <div key={m.label} style={{ padding: '10px 10px 10px 8px', marginBottom: i < 2 ? 24 : 0, textAlign: 'right' }}>
              <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 18, fontWeight: 800, color: m.color, lineHeight: 1 }}>{m.val}</div>
              <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.4)', letterSpacing: 0.5, marginTop: 2, textTransform: 'uppercase' }}>{m.label}</div>
              <div style={{ width: 34, height: 2, background: 'rgba(255,255,255,0.08)', borderRadius: 1, marginTop: 3, marginLeft: 'auto' }}>
                <div style={{ width: `${m.pct}%`, height: '100%', background: m.color, borderRadius: 1 }} />
              </div>
            </div>
          ))}
        </div>

        {/* SCORE + CTA en bas */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 10, textAlign: 'center', padding: '0 20px 16px' }}>
          <div style={{ fontSize: 7, color: 'rgba(200,255,0,0.5)', letterSpacing: 3, marginBottom: 2 }}>GLOW UP SCORE</div>
          <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 56, fontWeight: 800, color: '#C8FF00', lineHeight: 1 }}>{score}</div>
          <div style={{ fontSize: 7, color: 'rgba(200,255,0,0.4)', letterSpacing: 2, marginBottom: 10 }}>/ 100</div>
          <Link href="/onboarding" style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 14, color: '#000', background: '#C8FF00', padding: '12px 0', borderRadius: 28, textDecoration: 'none', letterSpacing: 1, display: 'block', textAlign: 'center' }}>
            CALCULER MON SCORE — GRATUIT
          </Link>
          <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', marginTop: 5, letterSpacing: 1 }}>2 MIN · AUCUNE CB</div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800&family=JetBrains+Mono:wght@500&display=swap');
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.1} }
        * { box-sizing:border-box; margin:0; padding:0; }
      `}</style>
    </main>
  )
}
