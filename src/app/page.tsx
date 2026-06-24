'use client'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useState, useEffect } from 'react'

const HoloBody = dynamic(() => import('@/components/HoloBody'), { ssr: false })

const METRICS = [
  { label: 'Training',    val: '9.1', color: '#C8FF00', pct: 91, side: 'left',  top: '24%' },
  { label: 'Eau',         val: '7.4', color: '#00F5FF', pct: 74, side: 'left',  top: '40%' },
  { label: 'Sommeil',     val: '6.2', color: '#A78BFA', pct: 62, side: 'left',  top: '56%' },
  { label: 'Nutrition',   val: '8.5', color: '#C8FF00', pct: 85, side: 'right', top: '24%' },
  { label: 'Skincare',    val: '5.0', color: '#FF6B35', pct: 50, side: 'right', top: '40%' },
  { label: 'Pas / jour',  val: '9.2', color: '#00F5FF', pct: 92, side: 'right', top: '56%' },
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
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(200,255,0,0.08)', background: 'rgba(6,6,15,0.9)' }}>
        <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 20, fontWeight: 800, color: '#C8FF00', letterSpacing: 3 }}>GLOWUP</span>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <Link href="/login" style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', textDecoration: 'none', letterSpacing: 1 }}>Connexion</Link>
          <Link href="/onboarding" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 12, color: '#000', background: '#C8FF00', padding: '7px 14px', borderRadius: 20, textDecoration: 'none', letterSpacing: 1 }}>
            Commencer →
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <div style={{ position: 'relative', height: '100vh', width: '100%' }}>

        {/* Grid */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.04, backgroundImage: 'linear-gradient(rgba(200,255,0,1) 1px,transparent 1px),linear-gradient(90deg,rgba(200,255,0,1) 1px,transparent 1px)', backgroundSize: '32px 32px' }} />

        {/* Coin brackets */}
        {[
          { top: '58px', left: '10px', borderWidth: '1.5px 0 0 1.5px' },
          { top: '58px', right: '10px', borderWidth: '1.5px 1.5px 0 0' },
          { bottom: '10px', left: '10px', borderWidth: '0 0 1.5px 1.5px' },
          { bottom: '10px', right: '10px', borderWidth: '0 1.5px 1.5px 0' },
        ].map((s, i) => (
          <div key={i} style={{ position: 'absolute', ...s, width: 18, height: 18, borderColor: 'rgba(200,255,0,0.4)', borderStyle: 'solid' }} />
        ))}

        {/* Three.js */}
        <HoloBody score={score} />

        {/* MÉTRIQUES avec lignes */}
        {METRICS.map((m) => {
          const isLeft = m.side === 'left'
          return (
            <div key={m.label} style={{
              position: 'absolute',
              [m.side]: 0,
              top: m.top,
              zIndex: 10,
              display: 'flex',
              alignItems: 'center',
              flexDirection: isLeft ? 'row' : 'row-reverse',
              gap: 0,
            }}>
              {/* Bloc texte */}
              <div style={{ padding: isLeft ? '0 0 0 10px' : '0 10px 0 0', textAlign: isLeft ? 'left' : 'right', minWidth: 72 }}>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 20, fontWeight: 800, color: m.color, lineHeight: 1 }}>{m.val}</div>
                <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.4)', letterSpacing: 0.5, marginTop: 2, textTransform: 'uppercase' }}>{m.label}</div>
                <div style={{ width: 40, height: 2, background: 'rgba(255,255,255,0.08)', borderRadius: 1, marginTop: 4, marginLeft: isLeft ? 0 : 'auto' }}>
                  <div style={{ width: `${m.pct}%`, height: '100%', background: m.color, borderRadius: 1 }} />
                </div>
              </div>

              {/* Ligne qui pointe vers le centre */}
              <div style={{
                width: 40,
                height: 1,
                background: `linear-gradient(${isLeft ? 'to right' : 'to left'}, transparent, ${m.color})`,
                opacity: 0.5,
                flexShrink: 0,
              }} />

              {/* Point terminal */}
              <div style={{
                width: 5, height: 5, borderRadius: '50%',
                background: m.color, flexShrink: 0,
                boxShadow: `0 0 6px ${m.color}`,
              }} />
            </div>
          )
        })}

        {/* LIVE badge */}
        <div style={{ position: 'absolute', top: 68, left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(200,255,0,0.06)', border: '1px solid rgba(200,255,0,0.15)', padding: '5px 12px', borderRadius: 20, zIndex: 10, whiteSpace: 'nowrap' }}>
          <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#C8FF00', animation: 'blink 1s infinite' }} />
          <span style={{ fontSize: 9, color: '#C8FF00', letterSpacing: 2 }}>SCAN ACTIF</span>
        </div>

        {/* SCORE */}
        <div style={{ position: 'absolute', bottom: 90, left: '50%', transform: 'translateX(-50%)', textAlign: 'center', zIndex: 10, whiteSpace: 'nowrap' }}>
          <div style={{ fontSize: 8, color: 'rgba(200,255,0,0.5)', letterSpacing: 3, marginBottom: 4 }}>GLOW UP SCORE</div>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 68, fontWeight: 800, color: '#C8FF00', lineHeight: 1 }}>{score}</div>
          <div style={{ fontSize: 8, color: 'rgba(200,255,0,0.4)', letterSpacing: 2, marginTop: 2 }}>/ 100</div>
        </div>

        {/* CTA */}
        <div style={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 10, textAlign: 'center', width: '100%', padding: '0 24px' }}>
          <Link href="/onboarding" style={{
            fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 15,
            color: '#000', background: '#C8FF00', padding: '13px 0', borderRadius: 30,
            textDecoration: 'none', letterSpacing: 1.5, display: 'block', textAlign: 'center',
          }}>
            CALCULER MON SCORE — GRATUIT
          </Link>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', marginTop: 6, letterSpacing: 1 }}>2 MIN · AUCUNE CB REQUISE</div>
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
