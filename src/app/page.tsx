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

  // Points où les lignes touchent le corps (en % du viewBox 390x500)
  const CX = 195 // centre X
  const bodyPoints = [
    { y: 148, colorL: '#C8FF00', colorR: '#C8FF00' }, // épaules
    { y: 235, colorL: '#00F5FF', colorR: '#FF6B35' }, // torse
    { y: 318, colorL: '#A78BFA', colorR: '#00F5FF' }, // hanches
  ]

  const metricsL = [
    { label: 'Training', val: '9.1', color: '#C8FF00', pct: 91 },
    { label: 'Eau',      val: '7.4', color: '#00F5FF', pct: 74 },
    { label: 'Sommeil',  val: '6.2', color: '#A78BFA', pct: 62 },
  ]
  const metricsR = [
    { label: 'Nutrition', val: '8.5', color: '#C8FF00', pct: 85 },
    { label: 'Skincare',  val: '5.0', color: '#FF6B35', pct: 50 },
    { label: 'Pas/jour',  val: '9.2', color: '#00F5FF', pct: 92 },
  ]

  return (
    <main style={{ height: '100dvh', background: '#06060F', fontFamily: "'JetBrains Mono',monospace", overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

      {/* NAV */}
      <nav style={{ flexShrink: 0, padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(200,255,0,0.08)' }}>
        <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 22, fontWeight: 800, color: '#C8FF00', letterSpacing: 3 }}>GLOWUP</span>
        <Link href="/onboarding" style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 12, color: '#000', background: '#C8FF00', padding: '7px 14px', borderRadius: 20, textDecoration: 'none', letterSpacing: 1 }}>Commencer →</Link>
      </nav>

      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>

        {/* Grid */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.04, backgroundImage: 'linear-gradient(rgba(200,255,0,1) 1px,transparent 1px),linear-gradient(90deg,rgba(200,255,0,1) 1px,transparent 1px)', backgroundSize: '30px 30px' }} />

        {/* Three.js */}
        <HoloBody score={score} />

        {/* TOUT EN SVG — métriques + lignes parfaitement alignées */}
        <svg
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 10, pointerEvents: 'none' }}
          viewBox="0 0 390 500"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <style>{`
              @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@800&family=JetBrains+Mono:wght@500&display=swap');
              .val { font-family: 'Barlow Condensed', sans-serif; font-size: 22px; font-weight: 800; }
              .lbl { font-family: 'JetBrains Mono', monospace; font-size: 8px; fill: rgba(255,255,255,0.45); letter-spacing: 1px; }
            `}</style>
          </defs>

          {/* SCAN ACTIF badge */}
          <rect x="140" y="8" width="110" height="20" rx="10" fill="rgba(200,255,0,0.06)" stroke="rgba(200,255,0,0.2)" strokeWidth="0.8"/>
          <circle cx="153" cy="18" r="3" fill="#C8FF00"><animate attributeName="opacity" values="1;0.1;1" dur="1s" repeatCount="indefinite"/></circle>
          <text x="162" y="22" fill="#C8FF00" fontSize="8" fontFamily="JetBrains Mono, monospace" letterSpacing="2">SCAN ACTIF</text>

          {bodyPoints.map((bp, i) => {
            const mL = metricsL[i]
            const mR = metricsR[i]
            const lx = 68  // fin ligne gauche (début texte)
            const rx = 322 // fin ligne droite (début texte)
            const bpL = CX - 52 // point sur le corps gauche
            const bpR = CX + 52 // point sur le corps droite

            return (
              <g key={i}>
                {/* Ligne gauche */}
                <line x1={lx} y1={bp.y} x2={bpL} y2={bp.y} stroke={mL.color} strokeWidth="0.8" strokeOpacity="0.5" strokeDasharray="4 3"/>
                {/* Point corps gauche */}
                <circle cx={bpL} cy={bp.y} r="3" fill={mL.color} opacity="0.9"/>

                {/* Ligne droite */}
                <line x1={bpR} y1={bp.y} x2={rx} y2={bp.y} stroke={mR.color} strokeWidth="0.8" strokeOpacity="0.5" strokeDasharray="4 3"/>
                {/* Point corps droite */}
                <circle cx={bpR} cy={bp.y} r="3" fill={mR.color} opacity="0.9"/>

                {/* MÉTRIQUE GAUCHE */}
                <text x={lx - 4} y={bp.y - 6} textAnchor="end" className="val" fill={mL.color}>{mL.val}</text>
                <text x={lx - 4} y={bp.y + 8} textAnchor="end" className="lbl">{mL.label.toUpperCase()}</text>
                {/* Barre gauche */}
                <rect x={lx - 42} y={bp.y + 12} width="38" height="2" rx="1" fill="rgba(255,255,255,0.1)"/>
                <rect x={lx - 42} y={bp.y + 12} width={38 * mL.pct / 100} height="2" rx="1" fill={mL.color}/>

                {/* MÉTRIQUE DROITE */}
                <text x={rx + 4} y={bp.y - 6} textAnchor="start" className="val" fill={mR.color}>{mR.val}</text>
                <text x={rx + 4} y={bp.y + 8} textAnchor="start" className="lbl">{mR.label.toUpperCase()}</text>
                {/* Barre droite */}
                <rect x={rx + 4} y={bp.y + 12} width="38" height="2" rx="1" fill="rgba(255,255,255,0.1)"/>
                <rect x={rx + 4} y={bp.y + 12} width={38 * mR.pct / 100} height="2" rx="1" fill={mR.color}/>
              </g>
            )
          })}
        </svg>

        {/* SCORE + CTA */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 20, textAlign: 'center', padding: '0 20px 14px', background: 'linear-gradient(transparent, rgba(6,6,15,0.98) 35%)' }}>
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
        * { box-sizing:border-box; margin:0; padding:0; }
      `}</style>
    </main>
  )
}
