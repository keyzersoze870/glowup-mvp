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

  const metricsL = [
    { label: 'Training', val: '9.1', color: '#C8FF00', pct: 91, y: 160 },
    { label: 'Eau',      val: '7.4', color: '#00F5FF', pct: 74, y: 250 },
    { label: 'Sommeil',  val: '6.2', color: '#A78BFA', pct: 62, y: 340 },
  ]
  const metricsR = [
    { label: 'Nutrition', val: '8.5', color: '#C8FF00', pct: 85, y: 160 },
    { label: 'Skincare',  val: '5.0', color: '#FF6B35', pct: 50, y: 250 },
    { label: 'Pas/jour',  val: '9.2', color: '#00F5FF', pct: 92, y: 340 },
  ]

  // Corps centré à x=195, lignes qui partent de x=110 (gauche) et x=280 (droite)
  const BPL = 118 // point sur corps gauche
  const BPR = 272 // point sur corps droite
  const TXL = 108 // fin du texte gauche (right-aligned)
  const TXR = 282 // début texte droite (left-aligned)

  return (
    <main style={{ height: '100dvh', background: '#06060F', fontFamily: "'JetBrains Mono',monospace", overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

      <nav style={{ flexShrink: 0, padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(200,255,0,0.08)' }}>
        <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 22, fontWeight: 800, color: '#C8FF00', letterSpacing: 3 }}>GLOWUP</span>
        <Link href="/onboarding" style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 12, color: '#000', background: '#C8FF00', padding: '7px 14px', borderRadius: 20, textDecoration: 'none', letterSpacing: 1 }}>Commencer →</Link>
      </nav>

      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.04, backgroundImage: 'linear-gradient(rgba(200,255,0,1) 1px,transparent 1px),linear-gradient(90deg,rgba(200,255,0,1) 1px,transparent 1px)', backgroundSize: '30px 30px' }} />

        <HoloBody score={score} />

        {/* SVG overlay — viewBox calé sur 390x500, même ratio que le canvas Three.js */}
        <svg
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 10, pointerEvents: 'none' }}
          viewBox="0 0 390 500"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* SCAN badge */}
          <rect x="140" y="10" width="110" height="20" rx="10" fill="rgba(200,255,0,0.06)" stroke="rgba(200,255,0,0.2)" strokeWidth="0.8"/>
          <circle cx="153" cy="20" r="3" fill="#C8FF00">
            <animate attributeName="opacity" values="1;0.1;1" dur="1s" repeatCount="indefinite"/>
          </circle>
          <text x="161" y="24" fill="#C8FF00" fontSize="8" fontFamily="JetBrains Mono,monospace" letterSpacing="2">SCAN ACTIF</text>

          {metricsL.map((m, i) => (
            <g key={m.label}>
              {/* Ligne horizontale gauche */}
              <line x1={TXL} y1={m.y} x2={BPL} y2={m.y} stroke={m.color} strokeWidth="0.8" strokeOpacity="0.5" strokeDasharray="4 3"/>
              <circle cx={BPL} cy={m.y} r="3" fill={m.color} opacity="0.9"/>
              {/* Valeur */}
              <text x={TXL - 4} y={m.y - 5} textAnchor="end" fill={m.color} fontSize="22" fontFamily="Barlow Condensed,sans-serif" fontWeight="800">{m.val}</text>
              {/* Label */}
              <text x={TXL - 4} y={m.y + 9} textAnchor="end" fill="rgba(255,255,255,0.45)" fontSize="8" fontFamily="JetBrains Mono,monospace" letterSpacing="0.5">{m.label.toUpperCase()}</text>
              {/* Barre */}
              <rect x={TXL - 42} y={m.y + 13} width="38" height="2" rx="1" fill="rgba(255,255,255,0.1)"/>
              <rect x={TXL - 42} y={m.y + 13} width={38 * m.pct / 100} height="2" rx="1" fill={m.color}/>
            </g>
          ))}

          {metricsR.map((m, i) => (
            <g key={m.label}>
              {/* Ligne horizontale droite */}
              <line x1={BPR} y1={m.y} x2={TXR} y2={m.y} stroke={m.color} strokeWidth="0.8" strokeOpacity="0.5" strokeDasharray="4 3"/>
              <circle cx={BPR} cy={m.y} r="3" fill={m.color} opacity="0.9"/>
              {/* Valeur */}
              <text x={TXR + 4} y={m.y - 5} textAnchor="start" fill={m.color} fontSize="22" fontFamily="Barlow Condensed,sans-serif" fontWeight="800">{m.val}</text>
              {/* Label */}
              <text x={TXR + 4} y={m.y + 9} textAnchor="start" fill="rgba(255,255,255,0.45)" fontSize="8" fontFamily="JetBrains Mono,monospace" letterSpacing="0.5">{m.label.toUpperCase()}</text>
              {/* Barre */}
              <rect x={TXR + 4} y={m.y + 13} width="38" height="2" rx="1" fill="rgba(255,255,255,0.1)"/>
              <rect x={TXR + 4} y={m.y + 13} width={38 * m.pct / 100} height="2" rx="1" fill={m.color}/>
            </g>
          ))}
        </svg>

        {/* SCORE + CTA */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 20, textAlign: 'center', padding: '0 20px 14px', background: 'linear-gradient(transparent, rgba(6,6,15,0.98) 30%)' }}>
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
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@800&family=JetBrains+Mono:wght@500&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
      `}</style>
    </main>
  )
}
