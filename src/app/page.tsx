'use client'
import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'

const PROFILES = [
  {
    img: '/selfie-f.png',
    points: [
      { x: 52, y: 28, label: 'Hydratation', val: '92', color: '#C8FF00' },
      { x: 62, y: 52, label: 'Skincare',    val: '74', color: '#00F5FF' },
      { x: 38, y: 65, label: 'Sommeil',     val: '61', color: '#A78BFA' },
      { x: 68, y: 38, label: 'Énergie',     val: '88', color: '#FF6B35' },
    ],
    score: 78,
  },
  {
    img: '/selfie-m.png',
    points: [
      { x: 48, y: 25, label: 'Hydratation', val: '65', color: '#C8FF00' },
      { x: 65, y: 48, label: 'Skincare',    val: '42', color: '#FF6B35' },
      { x: 35, y: 60, label: 'Sommeil',     val: '80', color: '#A78BFA' },
      { x: 70, y: 35, label: 'Énergie',     val: '91', color: '#00F5FF' },
    ],
    score: 69,
  },
]

type Phase = 'scan' | 'reveal' | 'hold'

export default function LandingPage() {
  const [profileIdx, setProfileIdx] = useState(0)
  const [phase, setPhase] = useState<Phase>('scan')
  const [scanY, setScanY] = useState(0)
  const [visiblePoints, setVisiblePoints] = useState<number[]>([])
  const [displayScore, setDisplayScore] = useState(0)
  const scanRef = useRef<number | null>(null)
  const profile = PROFILES[profileIdx]

  // Séquence complète
  useEffect(() => {
    setPhase('scan')
    setVisiblePoints([])
    setDisplayScore(0)
    setScanY(0)

    // Phase 1 — scan line descend en 1.8s
    let start: number
    const scanDuration = 1800
    const animate = (ts: number) => {
      if (!start) start = ts
      const progress = Math.min((ts - start) / scanDuration, 1)
      setScanY(progress * 100)
      if (progress < 1) {
        scanRef.current = requestAnimationFrame(animate)
      } else {
        // Phase 2 — révéler les points un par un
        setPhase('reveal')
        profile.points.forEach((_, i) => {
          setTimeout(() => {
            setVisiblePoints(prev => [...prev, i])
          }, i * 300)
        })
        // Phase 3 — score compte
        setTimeout(() => {
          let s = 0
          const target = profile.score
          const counter = setInterval(() => {
            s += 2
            setDisplayScore(Math.min(s, target))
            if (s >= target) clearInterval(counter)
          }, 25)
        }, profile.points.length * 300 + 200)

        // Phase 4 — hold puis switch
        setTimeout(() => {
          setProfileIdx(idx => (idx + 1) % PROFILES.length)
        }, profile.points.length * 300 + 2800)
      }
    }
    scanRef.current = requestAnimationFrame(animate)
    return () => { if (scanRef.current) cancelAnimationFrame(scanRef.current) }
  }, [profileIdx])

  return (
    <main style={{ height: '100dvh', background: '#06060F', fontFamily: "'JetBrains Mono',monospace", overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

      {/* NAV */}
      <nav style={{ flexShrink: 0, padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(200,255,0,0.08)' }}>
        <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 22, fontWeight: 800, color: '#C8FF00', letterSpacing: 3 }}>GLOWUP</span>
        <Link href="/onboarding" style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 12, color: '#000', background: '#C8FF00', padding: '7px 14px', borderRadius: 20, textDecoration: 'none', letterSpacing: 1 }}>Commencer →</Link>
      </nav>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px 14px', overflow: 'hidden' }}>

        {/* TITRE */}
        <div style={{ textAlign: 'center', flexShrink: 0 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(200,255,0,0.06)', border: '1px solid rgba(200,255,0,0.15)', padding: '4px 12px', borderRadius: 20, marginBottom: 8 }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#C8FF00', animation: 'blink 1s infinite' }} />
            <span style={{ fontSize: 9, color: '#C8FF00', letterSpacing: 2 }}>ANALYSE EN COURS</span>
          </div>
          <h1 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 28, fontWeight: 800, color: '#fff', letterSpacing: 1, lineHeight: 1.1, textTransform: 'uppercase' }}>
            Ton <span style={{ color: '#C8FF00' }}>Glow Up Score</span><br/>en 2 minutes
          </h1>
        </div>

        {/* PHOTO SCANNER */}
        <div style={{ position: 'relative', width: '100%', maxWidth: 320, flex: 1, margin: '12px 0', maxHeight: 400 }}>

          {/* Cadre coins */}
          {[
            { top: 0, left: 0, borderWidth: '2px 0 0 2px' },
            { top: 0, right: 0, borderWidth: '2px 2px 0 0' },
            { bottom: 0, left: 0, borderWidth: '0 0 2px 2px' },
            { bottom: 0, right: 0, borderWidth: '0 2px 2px 0' },
          ].map((s, i) => (
            <div key={i} style={{ position: 'absolute', ...s, width: 20, height: 20, borderColor: '#C8FF00', borderStyle: 'solid', zIndex: 20, opacity: 0.8 }} />
          ))}

          {/* Photo */}
          <img
            src={profile.img}
            alt="scan"
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', borderRadius: 12, display: 'block', filter: 'brightness(0.85) contrast(1.1)' }}
          />

          {/* Overlay sombre sur les côtés */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(6,6,15,0.3), transparent 20%, transparent 80%, rgba(6,6,15,0.3))', borderRadius: 12, pointerEvents: 'none' }} />

          {/* SCAN LINE */}
          {phase === 'scan' && (
            <div style={{
              position: 'absolute', left: 0, right: 0, top: `${scanY}%`,
              height: 2, zIndex: 15, pointerEvents: 'none',
              background: 'linear-gradient(to right, transparent, #00F5FF, #C8FF00, #00F5FF, transparent)',
              boxShadow: '0 0 12px #00F5FF, 0 0 24px rgba(0,245,255,0.4)',
              transition: 'top 0.05s linear',
            }}>
              {/* Glow sous la ligne */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 40, background: 'linear-gradient(to bottom, rgba(0,245,255,0.08), transparent)', transform: 'translateY(-50%)' }} />
            </div>
          )}

          {/* POINTS + LIGNES + MÉTRIQUES */}
          {profile.points.map((pt, i) => {
            const visible = visiblePoints.includes(i)
            const isLeft = pt.x > 50
            return (
              <div key={i} style={{ position: 'absolute', left: `${pt.x}%`, top: `${pt.y}%`, zIndex: 16, opacity: visible ? 1 : 0, transition: 'opacity 0.3s ease', pointerEvents: 'none' }}>
                {/* Point sur le visage */}
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: pt.color, boxShadow: `0 0 8px ${pt.color}`, transform: 'translate(-50%, -50%)', position: 'absolute' }} />

                {/* Ligne + métrique */}
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  [isLeft ? 'right' : 'left']: '100%',
                  transform: 'translateY(-50%)',
                  display: 'flex',
                  flexDirection: isLeft ? 'row-reverse' : 'row',
                  alignItems: 'center',
                  gap: 6,
                  paddingLeft: isLeft ? 0 : 4,
                  paddingRight: isLeft ? 4 : 0,
                }}>
                  {/* Ligne */}
                  <div style={{ width: 30, height: 1, background: pt.color, opacity: 0.7, flexShrink: 0 }} />
                  {/* Texte */}
                  <div style={{ textAlign: isLeft ? 'right' : 'left', whiteSpace: 'nowrap' }}>
                    <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 16, fontWeight: 800, color: pt.color, lineHeight: 1 }}>
                      {visible ? pt.val : '0'}<span style={{ fontSize: 10, opacity: 0.6 }}>/100</span>
                    </div>
                    <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.5)', letterSpacing: 0.5, marginTop: 1 }}>{pt.label}</div>
                  </div>
                </div>
              </div>
            )
          })}

          {/* Grid overlay futuriste */}
          <div style={{ position: 'absolute', inset: 0, borderRadius: 12, opacity: 0.06, backgroundImage: 'linear-gradient(rgba(200,255,0,1) 1px,transparent 1px),linear-gradient(90deg,rgba(200,255,0,1) 1px,transparent 1px)', backgroundSize: '20px 20px', pointerEvents: 'none' }} />
        </div>

        {/* SCORE + CTA */}
        <div style={{ flexShrink: 0, width: '100%', textAlign: 'center' }}>
          <div style={{ fontSize: 8, color: 'rgba(200,255,0,0.5)', letterSpacing: 3, marginBottom: 2 }}>GLOW UP SCORE</div>
          <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 64, fontWeight: 800, color: '#C8FF00', lineHeight: 1 }}>
            {displayScore}<span style={{ fontSize: 20, opacity: 0.5 }}>/100</span>
          </div>
          <Link href="/onboarding" style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 15, color: '#000', background: '#C8FF00', padding: '13px 0', borderRadius: 28, textDecoration: 'none', letterSpacing: 1, display: 'block', marginTop: 10 }}>
            CALCULER MON SCORE — GRATUIT
          </Link>
          <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', marginTop: 6, letterSpacing: 1 }}>2 MIN · AUCUNE CB REQUISE</div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@800&family=JetBrains+Mono:wght@500&display=swap');
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.1} }
        * { box-sizing:border-box; margin:0; padding:0; }
      `}</style>
    </main>
  )
}
