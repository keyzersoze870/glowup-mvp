'use client'
import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'

const FaceMesh = dynamic(() => import('@/components/FaceMesh'), { ssr: false })

const PROFILES = [
  {
    img: '/selfie1.png',
    metrics: [
      { x: 26, y: 25, label: 'Hydratation', val: '92', color: '#C8FF00', side: 'left' },
      { x: 23, y: 48, label: 'Sommeil',     val: '61', color: '#A78BFA', side: 'left' },
      { x: 25, y: 68, label: 'Training',    val: '85', color: '#FF6B35', side: 'left' },
      { x: 74, y: 25, label: 'Énergie',     val: '88', color: '#FF6B35', side: 'right' },
      { x: 77, y: 48, label: 'Skincare',    val: '74', color: '#00F5FF', side: 'right' },
      { x: 75, y: 68, label: 'Nutrition',   val: '79', color: '#C8FF00', side: 'right' },
    ],
    score: 78,
    rank: '47% des utilisateurs ont un meilleur score que toi.',
  },
  {
    img: '/selfie2.png',
    metrics: [
      { x: 26, y: 22, label: 'Hydratation', val: '65', color: '#C8FF00', side: 'left' },
      { x: 23, y: 46, label: 'Sommeil',     val: '80', color: '#A78BFA', side: 'left' },
      { x: 25, y: 66, label: 'Training',    val: '91', color: '#FF6B35', side: 'left' },
      { x: 74, y: 22, label: 'Énergie',     val: '77', color: '#FF6B35', side: 'right' },
      { x: 77, y: 46, label: 'Skincare',    val: '42', color: '#00F5FF', side: 'right' },
      { x: 75, y: 66, label: 'Nutrition',   val: '55', color: '#C8FF00', side: 'right' },
    ],
    score: 69,
    rank: '32% des utilisateurs ont un meilleur score que toi.',
  },
]

const W = 260, H = 300

export default function LandingPage() {
  const [profileIdx, setProfileIdx] = useState(0)
  const [phase, setPhase] = useState<'scan' | 'reveal'>('scan')
  const [scanY, setScanY] = useState(0)
  const [visiblePoints, setVisiblePoints] = useState<number[]>([])
  const [meshVisible, setMeshVisible] = useState(false)
  const [displayScore, setDisplayScore] = useState(0)
  const [showRank, setShowRank] = useState(false)
  const rafRef = useRef<number | null>(null)
  const profile = PROFILES[profileIdx]

  useEffect(() => {
    setPhase('scan'); setVisiblePoints([]); setDisplayScore(0); setScanY(0); setShowRank(false); setMeshVisible(false)
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
        setTimeout(() => setMeshVisible(true), 100)
        profile.metrics.forEach((_, i) => setTimeout(() => setVisiblePoints(prev => [...prev, i]), 300 + i * 120))
        setTimeout(() => {
          let s = 0
          const iv = setInterval(() => { s += 4; setDisplayScore(Math.min(s, profile.score)); if (s >= profile.score) clearInterval(iv) }, 20)
        }, 300 + profile.metrics.length * 120 + 80)
        setTimeout(() => setShowRank(true), 300 + profile.metrics.length * 120 + 500)
        setTimeout(() => setProfileIdx(idx => (idx + 1) % PROFILES.length), 300 + profile.metrics.length * 120 + 2800)
      }
    }
    rafRef.current = requestAnimationFrame(animateScan)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [profileIdx])

  return (
    <main style={{ height: '100dvh', background: '#06060F', fontFamily: "'JetBrains Mono',monospace", overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <nav style={{ flexShrink: 0, padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(200,255,0,0.08)' }}>
        <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 22, fontWeight: 800, color: '#C8FF00', letterSpacing: 3 }}>GLOWAPP</span>
        <Link href="/onboarding" style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 12, color: '#000', background: '#C8FF00', padding: '7px 14px', borderRadius: 20, textDecoration: 'none', letterSpacing: 1 }}>Commencer →</Link>
      </nav>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px 12px 12px', overflow: 'hidden' }}>

        <div style={{ textAlign: 'center', flexShrink: 0, marginBottom: 10 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(200,255,0,0.06)', border: '1px solid rgba(200,255,0,0.15)', padding: '4px 12px', borderRadius: 20, marginBottom: 6 }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#C8FF00', animation: 'blink 1s infinite' }} />
            <span style={{ fontSize: 9, color: '#C8FF00', letterSpacing: 2 }}>ANALYSE EN COURS</span>
          </div>
          <h1 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 24, fontWeight: 800, color: '#fff', letterSpacing: 1, lineHeight: 1.1, textTransform: 'uppercase', marginBottom: 5 }}>
            Ton <span style={{ color: '#C8FF00' }}>Glow Up Score</span><br/>en 2 minutes
          </h1>
          <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', lineHeight: 1.4 }}>
            Rejoins les 7 000 personnes qui ont déjà<br/>amélioré leur score grâce à l'IA.
          </p>
        </div>

        {/* PHOTO SCANNER */}
        <div style={{ position: 'relative', width: W, height: H, flexShrink: 0 }}>
          {[{ top:-3,left:-3,borderWidth:'2px 0 0 2px' },{ top:-3,right:-3,borderWidth:'2px 2px 0 0' },{ bottom:-3,left:-3,borderWidth:'0 0 2px 2px' },{ bottom:-3,right:-3,borderWidth:'0 2px 2px 0' }].map((s,i) => (
            <div key={i} style={{ position:'absolute',...s,width:20,height:20,borderColor:'#C8FF00',borderStyle:'solid',zIndex:20,opacity:0.9 }} />
          ))}

          <div style={{ position:'absolute',inset:0,borderRadius:10,overflow:'hidden',background:'#06060F' }}>
            <img key={profile.img} src={profile.img} alt="scan"
              style={{ width:'100%',height:'100%',objectFit:'cover',objectPosition:'center 20%',display:'block',filter:'brightness(0.95)' }}
            />
            <div style={{ position:'absolute',inset:0,background:'radial-gradient(ellipse at center, transparent 55%, #06060F 100%)',pointerEvents:'none' }} />
          </div>

          {/* Face detection mesh */}
          <FaceMesh imgSrc={profile.img} visible={meshVisible} width={W} height={H} />

          {/* Scan line */}
          {phase === 'scan' && (
            <div style={{ position:'absolute',left:0,right:0,top:`${scanY}%`,height:2,zIndex:15,
              background:'linear-gradient(to right, transparent, #00F5FF 20%, #C8FF00 50%, #00F5FF 80%, transparent)',
              boxShadow:'0 0 10px #00F5FF',pointerEvents:'none' }} />
          )}

          {/* Métriques */}
          {profile.metrics.map((pt, i) => {
            const visible = visiblePoints.includes(i)
            const isRight = pt.side === 'right'
            return (
              <div key={i} style={{ position:'absolute',left:`${pt.x}%`,top:`${pt.y}%`,zIndex:16,opacity:visible?1:0,transition:'opacity 0.3s ease',pointerEvents:'none' }}>
                <div style={{ width:7,height:7,borderRadius:'50%',background:pt.color,boxShadow:`0 0 8px ${pt.color}`,transform:'translate(-50%,-50%)',position:'absolute' }} />
                <div style={{ position:'absolute',top:'50%',[isRight?'left':'right']:6,transform:'translateY(-50%)',display:'flex',flexDirection:isRight?'row':'row-reverse',alignItems:'center' }}>
                  <div style={{ width:29,height:1,background:pt.color,opacity:0.7,flexShrink:0 }} />
                  <div style={{ background:'rgba(6,6,15,0.9)',border:`1px solid ${pt.color}44`,borderRadius:5,padding:'3px 6px',backdropFilter:'blur(4px)' }}>
                    <div style={{ fontFamily:"'Barlow Condensed',sans-serif",fontSize:14,fontWeight:800,color:pt.color,lineHeight:1,textAlign:isRight?'left':'right' }}>
                      {pt.val}<span style={{ fontSize:8,opacity:0.5 }}>/100</span>
                    </div>
                    <div style={{ fontSize:7,color:'rgba(255,255,255,0.5)',letterSpacing:0.3,marginTop:1,whiteSpace:'nowrap',textAlign:isRight?'left':'right' }}>{pt.label}</div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* SCORE + RANG + CTA */}
        <div style={{ flexShrink:0,width:'100%',textAlign:'center',marginTop:10 }}>
          <div style={{ fontSize:8,color:'rgba(200,255,0,0.5)',letterSpacing:3,marginBottom:1 }}>GLOW UP SCORE</div>
          <div style={{ fontFamily:"'Barlow Condensed',sans-serif",fontSize:50,fontWeight:800,color:'#C8FF00',lineHeight:1 }}>
            {displayScore}<span style={{ fontSize:16,opacity:0.5 }}>/100</span>
          </div>
          <div style={{ height:18,marginTop:3,marginBottom:8 }}>
            {showRank && (
              <p style={{ fontSize:10,color:'#FF6B35',fontWeight:600,animation:'fadeIn 0.4s ease' }}>
                ⚠️ {profile.rank}
              </p>
            )}
          </div>
          <Link href="/onboarding" style={{ fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:14,color:'#000',background:'#C8FF00',padding:'12px 0',borderRadius:28,textDecoration:'none',letterSpacing:1,display:'block' }}>
            CALCULER MON SCORE — GRATUIT
          </Link>
          <div style={{ fontSize:8,color:'rgba(255,255,255,0.2)',marginTop:5,letterSpacing:1 }}>2 MIN · AUCUNE CB REQUISE</div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@800&family=JetBrains+Mono:wght@500&display=swap');
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.1} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:translateY(0)} }
        * { box-sizing:border-box; margin:0; padding:0; }
      `}</style>
    </main>
  )
}
