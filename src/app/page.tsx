'use client'
import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'

// Points calibrés sur le visage — x/y en % de la photo
// Le visage occupe environ le haut 60% de la photo portrait
const PROFILES = [
  {
    img: '/selfie-f.png',
    points: [
      // front gauche → texte à gauche
      { x: 38, y: 22, label: 'Hydratation', val: '92', color: '#C8FF00', side: 'left' },
      // joue droite → texte à droite  
      { x: 62, y: 48, label: 'Skincare',    val: '74', color: '#00F5FF', side: 'right' },
      // menton gauche → texte à gauche
      { x: 40, y: 68, label: 'Sommeil',     val: '61', color: '#A78BFA', side: 'left' },
      // tempe droite → texte à droite
      { x: 65, y: 30, label: 'Énergie',     val: '88', color: '#FF6B35', side: 'right' },
    ],
    score: 78,
  },
  {
    img: '/selfie-m.png',
    points: [
      { x: 36, y: 20, label: 'Hydratation', val: '65', color: '#C8FF00', side: 'left' },
      { x: 63, y: 45, label: 'Skincare',    val: '42', color: '#FF6B35', side: 'right' },
      { x: 38, y: 65, label: 'Sommeil',     val: '80', color: '#A78BFA', side: 'left' },
      { x: 66, y: 28, label: 'Énergie',     val: '91', color: '#00F5FF', side: 'right' },
    ],
    score: 69,
  },
]

type Phase = 'scan' | 'reveal'

export default function LandingPage() {
  const [profileIdx, setProfileIdx] = useState(0)
  const [phase, setPhase] = useState<Phase>('scan')
  const [scanY, setScanY] = useState(0)
  const [visiblePoints, setVisiblePoints] = useState<number[]>([])
  const [displayScore, setDisplayScore] = useState(0)
  const rafRef = useRef<number | null>(null)
  const profile = PROFILES[profileIdx]

  useEffect(() => {
    setPhase('scan')
    setVisiblePoints([])
    setDisplayScore(0)
    setScanY(0)
    if (rafRef.current) cancelAnimationFrame(rafRef.current)

    let start: number
    const scanDuration = 1600

    const animateScan = (ts: number) => {
      if (!start) start = ts
      const progress = Math.min((ts - start) / scanDuration, 1)
      setScanY(progress * 100)
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animateScan)
      } else {
        setPhase('reveal')
        // Points apparaissent un par un
        profile.points.forEach((_, i) => {
          setTimeout(() => setVisiblePoints(prev => [...prev, i]), i * 350)
        })
        // Score compte
        setTimeout(() => {
          let s = 0
          const target = profile.score
          const iv = setInterval(() => {
            s += 2; setDisplayScore(Math.min(s, target))
            if (s >= target) clearInterval(iv)
          }, 25)
        }, profile.points.length * 350 + 100)
        // Switch profil
        setTimeout(() => {
          setProfileIdx(idx => (idx + 1) % PROFILES.length)
        }, profile.points.length * 350 + 3000)
      }
    }
    rafRef.current = requestAnimationFrame(animateScan)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [profileIdx])

  return (
    <main style={{ height: '100dvh', background: '#06060F', fontFamily: "'JetBrains Mono',monospace", overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

      {/* NAV */}
      <nav style={{ flexShrink: 0, padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(200,255,0,0.08)' }}>
        <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 22, fontWeight: 800, color: '#C8FF00', letterSpacing: 3 }}>GLOWUP</span>
        <Link href="/onboarding" style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 12, color: '#000', background: '#C8FF00', padding: '7px 14px', borderRadius: 20, textDecoration: 'none', letterSpacing: 1 }}>Commencer →</Link>
      </nav>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px 12px', overflow: 'hidden' }}>

        {/* TITRE */}
        <div style={{ textAlign: 'center', flexShrink: 0 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(200,255,0,0.06)', border: '1px solid rgba(200,255,0,0.15)', padding: '4px 12px', borderRadius: 20, marginBottom: 8 }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#C8FF00', animation: 'blink 1s infinite' }} />
            <span style={{ fontSize: 9, color: '#C8FF00', letterSpacing: 2 }}>ANALYSE EN COURS</span>
          </div>
          <h1 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 26, fontWeight: 800, color: '#fff', letterSpacing: 1, lineHeight: 1.1, textTransform: 'uppercase' }}>
            Ton <span style={{ color: '#C8FF00' }}>Glow Up Score</span><br/>en 2 minutes
          </h1>
        </div>

        {/* PHOTO SCANNER */}
        <div style={{
          position: 'relative',
          width: '100%',
          maxWidth: 300,
          aspectRatio: '3/4',
          flexShrink: 0,
          margin: '10px auto',
        }}>
          {/* Coins futuristes */}
          {[
            { top: -4, left: -4, borderWidth: '2px 0 0 2px' },
            { top: -4, right: -4, borderWidth: '2px 2px 0 0' },
            { bottom: -4, left: -4, borderWidth: '0 0 2px 2px' },
            { bottom: -4, right: -4, borderWidth: '0 2px 2px 0' },
          ].map((s, i) => (
            <div key={i} style={{ position: 'absolute', ...s, width: 22, height: 22, borderColor: '#C8FF00', borderStyle: 'solid', zIndex: 20, opacity: 0.9 }} />
          ))}

          {/* Photo — centrée sur le visage */}
          <img
            key={profile.img}
            src={profile.img}
            alt="scan"
            style={{
              width: '100%', height: '100%',
              objectFit: 'cover',
              objectPosition: 'center 15%', // zoom sur le haut = visage
              borderRadius: 10,
              display: 'block',
              filter: 'brightness(0.9) contrast(1.05)',
            }}
          />

          {/* Scan line */}
          {phase === 'scan' && (
            <div style={{
              position: 'absolute', left: 0, right: 0,
              top: `${scanY}%`, height: 2, zIndex: 15,
              background: 'linear-gradient(to right, transparent, #00F5FF 20%, #C8FF00 50%, #00F5FF 80%, transparent)',
              boxShadow: '0 0 10px #00F5FF, 0 0 20px rgba(0,245,255,0.3)',
              pointerEvents: 'none',
            }}>
              <div style={{ position: 'absolute', inset: 0, height: 50, top: -24, background: 'linear-gradient(to bottom, transparent, rgba(0,245,255,0.06), transparent)', pointerEvents: 'none' }} />
            </div>
          )}

          {/* Points + lignes + métriques */}
          {profile.points.map((pt, i) => {
            const visible = visiblePoints.includes(i)
            const isRight = pt.side === 'right'
            return (
              <div key={i} style={{
                position: 'absolute',
                left: `${pt.x}%`, top: `${pt.y}%`,
                zIndex: 16,
                opacity: visible ? 1 : 0,
                transition: 'opacity 0.4s ease',
                pointerEvents: 'none',
              }}>
                {/* Point sur le visage */}
                <div style={{
                  width: 9, height: 9, borderRadius: '50%',
                  background: pt.color,
                  border: `1px solid ${pt.color}`,
                  boxShadow: `0 0 8px ${pt.color}, 0 0 16px ${pt.color}44`,
                  transform: 'translate(-50%, -50%)',
                  position: 'absolute',
                }} />

                {/* Ligne + texte */}
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  [isRight ? 'left' : 'right']: 6,
                  transform: 'translateY(-50%)',
                  display: 'flex',
                  flexDirection: isRight ? 'row' : 'row-reverse',
                  alignItems: 'center',
                  gap: 0,
                }}>
                  {/* Ligne */}
                  <div style={{ width: 28, height: 1, background: `linear-gradient(${isRight ? 'to right' : 'to left'}, ${pt.color}80, ${pt.color})`, flexShrink: 0 }} />
                  {/* Texte */}
                  <div style={{
                    background: 'rgba(6,6,15,0.85)',
                    border: `1px solid ${pt.color}44`,
                    borderRadius: 6,
                    padding: '3px 7px',
                    textAlign: isRight ? 'left' : 'right',
                    backdropFilter: 'blur(4px)',
                  }}>
                    <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 15, fontWeight: 800, color: pt.color, lineHeight: 1 }}>
                      {pt.val}<span style={{ fontSize: 9, opacity: 0.5 }}>/100</span>
                    </div>
                    <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.5)', letterSpacing: 0.3, marginTop: 1, whiteSpace: 'nowrap' }}>{pt.label}</div>
                  </div>
                </div>
              </div>
            )
          })}

          {/* Grid overlay */}
          <div style={{ position: 'absolute', inset: 0, borderRadius: 10, opacity: 0.05, backgroundImage: 'linear-gradient(rgba(200,255,0,1) 1px,transparent 1px),linear-gradient(90deg,rgba(200,255,0,1) 1px,transparent 1px)', backgroundSize: '18px 18px', pointerEvents: 'none' }} />
        </div>

        {/* SCORE + CTA */}
        <div style={{ flexShrink: 0, width: '100%', textAlign: 'center' }}>
          <div style={{ fontSize: 8, color: 'rgba(200,255,0,0.5)', letterSpacing: 3, marginBottom: 2 }}>GLOW UP SCORE</div>
          <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 58, fontWeight: 800, color: '#C8FF00', lineHeight: 1 }}>
            {displayScore}<span style={{ fontSize: 18, opacity: 0.5 }}>/100</span>
          </div>
          <Link href="/onboarding" style={{
            fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 15,
            color: '#000', background: '#C8FF00', padding: '13px 0', borderRadius: 28,
            textDecoration: 'none', letterSpacing: 1, display: 'block', marginTop: 10,
          }}>
            CALCULER MON SCORE — GRATUIT
          </Link>
          <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', marginTop: 5, letterSpacing: 1 }}>2 MIN · AUCUNE CB REQUISE</div>
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
