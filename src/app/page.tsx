'use client'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useState, useEffect } from 'react'

const HoloBody = dynamic(() => import('@/components/HoloBody'), { ssr: false })

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
      <nav style={{ flexShrink: 0, padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(200,255,0,0.08)' }}>
        <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 22, fontWeight: 800, color: '#C8FF00', letterSpacing: 3 }}>GLOWUP</span>
        <Link href="/onboarding" style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 12, color: '#000', background: '#C8FF00', padding: '7px 14px', borderRadius: 20, textDecoration: 'none', letterSpacing: 1 }}>Commencer →</Link>
      </nav>

      {/* SCANNER ZONE — prend tout l'espace restant */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>

        {/* Grid */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.04, backgroundImage: 'linear-gradient(rgba(200,255,0,1) 1px,transparent 1px),linear-gradient(90deg,rgba(200,255,0,1) 1px,transparent 1px)', backgroundSize: '30px 30px' }} />

        {/* Three.js canvas */}
        <HoloBody score={score} />

        {/* SCAN ACTIF */}
        <div style={{ position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(200,255,0,0.06)', border: '1px solid rgba(200,255,0,0.15)', padding: '4px 12px', borderRadius: 20, zIndex: 10, whiteSpace: 'nowrap' }}>
          <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#C8FF00', animation: 'blink 1s infinite' }} />
          <span style={{ fontSize: 9, color: '#C8FF00', letterSpacing: 2 }}>SCAN ACTIF</span>
        </div>

        {/* SVG lignes — calibrées pour pointer vers le milieu du canvas */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 9, pointerEvents: 'none' }} viewBox="0 0 390 500" preserveAspectRatio="xMidYMid slice">
          {/* GAUCHE → corps (centre autour de 195, 200) */}
          <line x1="75"  y1="105" x2="170" y2="155" stroke="#C8FF00" strokeWidth="0.7" strokeOpacity="0.45" strokeDasharray="4 3"/>
          <line x1="75"  y1="215" x2="170" y2="230" stroke="#00F5FF" strokeWidth="0.7" strokeOpacity="0.45" strokeDasharray="4 3"/>
          <line x1="75"  y1="325" x2="170" y2="310" stroke="#A78BFA" strokeWidth="0.7" strokeOpacity="0.45" strokeDasharray="4 3"/>
          {/* DROITE → corps */}
          <line x1="315" y1="105" x2="220" y2="155" stroke="#C8FF00" strokeWidth="0.7" strokeOpacity="0.45" strokeDasharray="4 3"/>
          <line x1="315" y1="215" x2="220" y2="230" stroke="#FF6B35" strokeWidth="0.7" strokeOpacity="0.45" strokeDasharray="4 3"/>
          <line x1="315" y1="325" x2="220" y2="310" stroke="#00F5FF" strokeWidth="0.7" strokeOpacity="0.45" strokeDasharray="4 3"/>
          {/* Points sur le corps */}
          <circle cx="170" cy="155" r="3" fill="#C8FF00" opacity="0.9"/>
          <circle cx="170" cy="230" r="3" fill="#00F5FF" opacity="0.9"/>
          <circle cx="170" cy="310" r="3" fill="#A78BFA" opacity="0.9"/>
          <circle cx="220" cy="155" r="3" fill="#C8FF00" opacity="0.9"/>
          <circle cx="220" cy="230" r="3" fill="#FF6B35" opacity="0.9"/>
          <circle cx="220" cy="310" r="3" fill="#00F5FF" opacity="0.9"/>
        </svg>

        {/* MÉTRIQUES GAUCHE */}
        <div style={{ position: 'absolute', left: 8, top: '12%', zIndex: 10, display: 'flex', flexDirection: 'column', gap: 28 }}>
          {[
            { label: 'Training', val: '9.1', color: '#C8FF00', pct: 91 },
            { label: 'Eau',      val: '7.4', color: '#00F5FF', pct: 74 },
            { label: 'Sommeil',  val: '6.2', color: '#A78BFA', pct: 62 },
          ].map(m => (
            <div key={m.label}>
              <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 22, fontWeight: 800, color: m.color, lineHeight: 1 }}>{m.val}</div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.45)', letterSpacing: 0.5, marginTop: 2, textTransform: 'uppercase' }}>{m.label}</div>
              <div style={{ width: 38, height: 2, background: 'rgba(255,255,255,0.1)', borderRadius: 1, marginTop: 4 }}>
                <div style={{ width: `${m.pct}%`, height: '100%', background: m.color, borderRadius: 1 }} />
              </div>
            </div>
          ))}
        </div>

        {/* MÉTRIQUES DROITE */}
        <div style={{ position: 'absolute', right: 8, top: '12%', zIndex: 10, display: 'flex', flexDirection: 'column', gap: 28, textAlign: 'right' }}>
          {[
            { label: 'Nutrition', val: '8.5', color: '#C8FF00', pct: 85 },
            { label: 'Skincare',  val: '5.0', color: '#FF6B35', pct: 50 },
            { label: 'Pas/jour',  val: '9.2', color: '#00F5FF', pct: 92 },
          ].map(m => (
            <div key={m.label}>
              <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 22, fontWeight: 800, color: m.color, lineHeight: 1 }}>{m.val}</div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.45)', letterSpacing: 0.5, marginTop: 2, textTransform: 'uppercase' }}>{m.label}</div>
              <div style={{ width: 38, height: 2, background: 'rgba(255,255,255,0.1)', borderRadius: 1, marginTop: 4, marginLeft: 'auto' }}>
                <div style={{ width: `${m.pct}%`, height: '100%', background: m.color, borderRadius: 1 }} />
              </div>
            </div>
          ))}
        </div>

        {/* SCORE + CTA */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 10, textAlign: 'center', padding: '0 20px 14px', background: 'linear-gradient(transparent, rgba(6,6,15,0.95) 40%)' }}>
          <div style={{ fontSize: 8, color: 'rgba(200,255,0,0.5)', letterSpacing: 3, marginBottom: 2 }}>GLOW UP SCORE</div>
          <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 60, fontWeight: 800, color: '#C8FF00', lineHeight: 1 }}>{score}</div>
          <div style={{ fontSize: 8, color: 'rgba(200,255,0,0.4)', letterSpacing: 2, marginBottom: 10 }}>/ 100</div>
          <Link href="/onboarding" style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 15, color: '#000', background: '#C8FF00', padding: '13px 0', borderRadius: 28, textDecoration: 'none', letterSpacing: 1, display: 'block' }}>
            CALCULER MON SCORE — GRATUIT
          </Link>
          <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', marginTop: 6, letterSpacing: 1 }}>2 MIN · AUCUNE CB</div>
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
