'use client'
import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'

const BLUE = '#0A84FF'
const PURPLE = '#BF5AF2'
const ORANGE = '#FF9F0A'
const CYAN = '#64D2FF'
const GREEN = '#30D158'

const PROFILES = [
  {
    img: '/selfie1.png',
    metrics: [
      { x: 46, y: 9,  label: 'Hydratation', val: '92', color: BLUE,   side: 'left' },
      { x: 68, y: 33, label: 'Sommeil',     val: '61', color: PURPLE, side: 'right' },
      { x: 22, y: 72, label: 'Sport',       val: '85', color: ORANGE, side: 'left' },
      { x: 78, y: 28, label: 'Stress',      val: '88', color: ORANGE, side: 'right' },
      { x: 24, y: 33, label: 'Skincare',    val: '74', color: CYAN,   side: 'left' },
      { x: 46, y: 53, label: 'Nutrition',   val: '79', color: GREEN,  side: 'right' },
    ],
    score: 78,
    rank: '47% des utilisateurs ont un meilleur score que toi.',
  },
]

export default function LandingPage() {
  const [profileIdx, setProfileIdx] = useState(0)
  const [phase, setPhase] = useState<'scan' | 'reveal'>('scan')
  const [scanY, setScanY] = useState(0)
  const [visiblePoints, setVisiblePoints] = useState<number[]>([])
  const [displayScore, setDisplayScore] = useState(0)
  const [showRank, setShowRank] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)
  const rafRef = useRef<number | null>(null)
  const profile = PROFILES[profileIdx]

  // Vérifie si l'image est déjà chargée (cache) au montage
  useEffect(() => {
    if (imgRef.current?.complete) setImageLoaded(true)
  }, [])

  useEffect(() => {
    if (!imageLoaded) return
    setPhase('scan'); setVisiblePoints([]); setDisplayScore(0); setScanY(0); setShowRank(false)
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    let start: number
    const animateScan = (ts: number) => {
      if (!start) start = ts
      const p = Math.min((ts - start) / 800, 1)
      setScanY(p * 100)
      if (p < 1) {
        rafRef.current = requestAnimationFrame(animateScan)
      } else {
        setPhase('reveal')
        profile.metrics.forEach((_, i) => setTimeout(() => setVisiblePoints(prev => [...prev, i]), i * 150))
        setTimeout(() => {
          let s = 0
          const iv = setInterval(() => { s += 4; setDisplayScore(Math.min(s, profile.score)); if (s >= profile.score) clearInterval(iv) }, 20)
        }, profile.metrics.length * 150 + 80)
        setTimeout(() => setShowRank(true), profile.metrics.length * 150 + 500)
        setTimeout(() => setProfileIdx(idx => (idx + 1) % PROFILES.length), profile.metrics.length * 150 + 2500)
      }
    }
    rafRef.current = requestAnimationFrame(animateScan)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [profileIdx, imageLoaded])

  const sf = `-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif`

  return (
    <main style={{ height:'100svh', background:'#000', fontFamily:sf, overflow:'hidden', display:'flex', flexDirection:'column' }}>

      {/* NAV */}
      <nav style={{ flexShrink:0, padding:'12px 20px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <span style={{ fontSize:20, fontWeight:700, color:'#fff', letterSpacing:-0.5 }}>GlowApp</span>
        <Link href="/onboarding" style={{ fontSize:12, fontWeight:600, color:'#fff', background:BLUE, padding:'7px 16px', borderRadius:20, textDecoration:'none', letterSpacing:-0.2 }}>
          Commencer
        </Link>
      </nav>

      {/* TITRE */}
      <div style={{ flexShrink:0, textAlign:'center', padding:'0 20px 8px' }}>
        <div style={{ display:'inline-flex', alignItems:'center', gap:6, background:'rgba(10,132,255,0.12)', border:'0.5px solid rgba(10,132,255,0.25)', padding:'4px 12px', borderRadius:20, marginBottom:10 }}>
          <div style={{ width:5, height:5, borderRadius:'50%', background:BLUE, animation:'blink 1.2s infinite' }} />
          <span style={{ fontSize:10, color:BLUE, letterSpacing:0.2 }}>Analyse en cours</span>
        </div>
        <h1 style={{ fontSize:24, fontWeight:700, color:'#fff', lineHeight:1.15, letterSpacing:-0.5, marginBottom:8 }}>
          Calcule ton <span style={{ color:BLUE }}>Glow Up Score</span><br/>en 2 minutes
        </h1>
        <p style={{ fontSize:12, color:'rgba(255,255,255,0.4)', lineHeight:1.5, letterSpacing:-0.1 }}>
          Rejoins les 7 000 personnes qui ont déjà amélioré leur physique grâce à l'IA.
        </p>
      </div>

      {/* PHOTO */}
      <div style={{ flexShrink:0, position:'relative', height:340, margin:'10px 16px 0', borderRadius:16, overflow:'hidden', background:'#111', border:'0.5px solid rgba(255,255,255,0.08)' }}>
        {/* Coins */}
        {[{top:8,left:8,borderWidth:'1.5px 0 0 1.5px',borderRadius:'4px 0 0 0'},{top:8,right:8,borderWidth:'1.5px 1.5px 0 0',borderRadius:'0 4px 0 0'},{bottom:8,left:8,borderWidth:'0 0 1.5px 1.5px',borderRadius:'0 0 0 4px'},{bottom:8,right:8,borderWidth:'0 1.5px 1.5px 0',borderRadius:'0 0 4px 0'}].map((s,i) => (
          <div key={i} style={{ position:'absolute',...s,width:16,height:16,borderColor:'rgba(10,132,255,0.5)',borderStyle:'solid',zIndex:20 }} />
        ))}

        <img ref={imgRef} src={profile.img} alt="scan" onLoad={() => setImageLoaded(true)}
          style={{ width:'100%',height:'100%',objectFit:'cover',objectPosition:'center 15%',display:'block',filter:'brightness(0.9)' }}
        />
        <div style={{ position:'absolute',inset:0,background:'radial-gradient(ellipse at center, transparent 50%, #000 95%)',pointerEvents:'none' }} />

        {/* Scan line */}
        {phase === 'scan' && imageLoaded && (
          <div style={{ position:'absolute',left:0,right:0,top:`${scanY}%`,height:1.5,zIndex:15,
            background:`linear-gradient(to right, transparent, ${BLUE}, ${BLUE}, transparent)`,
            pointerEvents:'none' }} />
        )}

        {/* Métriques */}
        {profile.metrics.map((pt, i) => {
          const visible = visiblePoints.includes(i)
          const isRight = pt.side === 'right'
          return (
            <div key={i} style={{ position:'absolute',left:`${pt.x}%`,top:`${pt.y}%`,zIndex:16,
              opacity:visible?1:0,transition:'opacity 0.3s ease',pointerEvents:'none' }}>
              <div style={{ width:6,height:6,borderRadius:'50%',background:pt.color,
                transform:'translate(-50%,-50%)',position:'absolute',boxShadow:`0 0 6px ${pt.color}` }} />
              <div style={{ position:'absolute',top:'50%',[isRight?'left':'right']:8,
                transform:'translateY(-50%)',display:'flex',flexDirection:isRight?'row':'row-reverse',alignItems:'center' }}>
                <div style={{ width:18,height:0.5,background:pt.color,opacity:0.55,flexShrink:0 }} />
                <div style={{ background:'rgba(0,0,0,0.85)',border:`0.5px solid rgba(255,255,255,0.08)`,borderRadius:7,padding:'2px 6px' }}>
                  <div style={{ fontSize:12,fontWeight:700,color:pt.color,lineHeight:1,textAlign:isRight?'left':'right',letterSpacing:-0.3 }}>
                    {pt.val}<span style={{ fontSize:8,opacity:0.4,fontWeight:400 }}>/100</span>
                  </div>
                  <div style={{ fontSize:8,fontWeight:500,color:'rgba(255,255,255,0.4)',marginTop:0,whiteSpace:'nowrap',textAlign:isRight?'left':'right' }}>{pt.label}</div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* SCORE + CTA */}
      <div style={{ flexShrink:0, padding:'10px 20px 14px', textAlign:'center' }}>
        <div style={{ fontSize:10,color:'rgba(255,255,255,0.3)',letterSpacing:1,marginBottom:2,textTransform:'uppercase' }}>Glow Up Score</div>
        <div style={{ fontSize:50,fontWeight:700,color:'#fff',lineHeight:1,letterSpacing:-2 }}>
          {displayScore}<span style={{ fontSize:20,fontWeight:400,color:'rgba(255,255,255,0.3)',letterSpacing:-0.5 }}>/100</span>
        </div>
        <div style={{ minHeight:20,marginTop:4,marginBottom:10 }}>
          {showRank && (
            <p style={{ fontSize:11,color:'#FF453A',fontWeight:500,animation:'fadeIn 0.4s ease',letterSpacing:-0.2 }}>
              ⚠ {profile.rank}
            </p>
          )}
        </div>
        <Link href="/onboarding" style={{ fontSize:15,fontWeight:600,color:'#fff',background:BLUE,padding:'14px 0',borderRadius:14,
          textDecoration:'none',letterSpacing:-0.3,display:'block',textAlign:'center' }}>
          Calculer mon score — Gratuit
        </Link>
        <div style={{ fontSize:11,color:'rgba(255,255,255,0.2)',marginTop:6,letterSpacing:-0.1 }}>2 min · Aucune CB requise</div>
      </div>

      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.15} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:translateY(0)} }
        * { box-sizing:border-box; margin:0; padding:0; }
      `}</style>
    </main>
  )
}
