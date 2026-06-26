'use client'
import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'

// Mesh calibré manuellement pour chaque photo
// Coordonnées en % (x, y) de la zone photo 260x300
// Photo 1 : femme blonde, visage centré légèrement en haut
const MESH_F = {
  // Contour visage
  jaw: [[28,42],[27,50],[28,58],[30,65],[33,72],[38,78],[43,83],[50,86],[57,83],[62,78],[67,72],[70,65],[72,58],[73,50],[72,42]],
  // Sourcil gauche
  browL: [[30,34],[34,32],[39,31],[44,32],[48,33]],
  // Sourcil droit  
  browR: [[52,33],[56,32],[61,31],[66,32],[70,34]],
  // Oeil gauche
  eyeL: [[32,39],[36,37],[40,37],[44,39],[40,41],[36,41]],
  // Oeil droit
  eyeR: [[56,39],[60,37],[64,37],[68,39],[64,41],[60,41]],
  // Nez
  nose: [[50,40],[50,44],[50,48],[50,52],[46,55],[48,56],[50,57],[52,56],[54,55]],
  // Bouche
  mouth: [[42,62],[46,60],[50,59],[54,60],[58,62],[54,65],[50,66],[46,65]],
}

// Photo 2 : homme, visage centré
const MESH_M = {
  jaw: [[27,40],[26,48],[27,56],[29,63],[32,70],[37,76],[42,81],[50,84],[58,81],[63,76],[68,70],[71,63],[73,56],[74,48],[73,40]],
  browL: [[29,32],[33,30],[38,29],[43,30],[47,31]],
  browR: [[53,31],[57,30],[62,29],[67,30],[71,32]],
  eyeL: [[31,37],[35,35],[39,35],[43,37],[39,39],[35,39]],
  eyeR: [[57,37],[61,35],[65,35],[69,37],[65,39],[61,39]],
  nose: [[50,38],[50,42],[50,46],[50,50],[46,53],[48,54],[50,55],[52,54],[54,53]],
  mouth: [[41,60],[45,58],[50,57],[55,58],[59,60],[55,63],[50,64],[45,63]],
}

function MeshSVG({ mesh, visible, W, H }: { mesh: typeof MESH_F, visible: boolean, W: number, H: number }) {
  const toXY = (p: number[]) => ({ x: p[0]/100*W, y: p[1]/100*H })

  const drawLine = (points: number[][], closed = false) => {
    const pts = points.map(toXY)
    let d = `M ${pts[0].x} ${pts[0].y}`
    for (let i = 1; i < pts.length; i++) d += ` L ${pts[i].x} ${pts[i].y}`
    if (closed) d += ' Z'
    return d
  }

  return (
    <svg style={{ position:'absolute',inset:0,width:'100%',height:'100%',zIndex:12,pointerEvents:'none',
      opacity:visible?1:0, transition:'opacity 0.6s ease' }}
      viewBox={`0 0 ${W} ${H}`}>
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="1" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <g filter="url(#glow)" stroke="#00F5FF" strokeWidth="0.7" strokeOpacity="0.6" fill="none">
        <path d={drawLine(mesh.jaw)}/>
        <path d={drawLine(mesh.browL)}/>
        <path d={drawLine(mesh.browR)}/>
        <path d={drawLine(mesh.eyeL, true)}/>
        <path d={drawLine(mesh.eyeR, true)}/>
        <path d={drawLine(mesh.nose)}/>
        <path d={drawLine(mesh.mouth, true)}/>
        {/* Lignes verticales nez-sourcil */}
        <line x1={toXY(mesh.browL[2]).x} y1={toXY(mesh.browL[2]).y} x2={toXY(mesh.eyeL[0]).x} y2={toXY(mesh.eyeL[0]).y}/>
        <line x1={toXY(mesh.browR[2]).x} y1={toXY(mesh.browR[2]).y} x2={toXY(mesh.eyeR[2]).x} y2={toXY(mesh.eyeR[2]).y}/>
      </g>
      {/* Points */}
      <g fill="#00F5FF" opacity="0.9">
        {[...mesh.jaw, ...mesh.browL, ...mesh.browR, ...mesh.eyeL, ...mesh.eyeR, ...mesh.nose, ...mesh.mouth].map((p,i) => (
          <circle key={i} cx={toXY(p).x} cy={toXY(p).y} r="1.8"/>
        ))}
      </g>
    </svg>
  )
}

const PROFILES = [
  {
    img: '/selfie1.png',
    mesh: MESH_F,
    metrics: [
      { x: 24, y: 30, label: 'Hydratation', val: '92', color: '#C8FF00', side: 'left' },
      { x: 22, y: 50, label: 'Sommeil',     val: '61', color: '#A78BFA', side: 'left' },
      { x: 24, y: 70, label: 'Training',    val: '85', color: '#FF6B35', side: 'left' },
      { x: 76, y: 30, label: 'Énergie',     val: '88', color: '#FF6B35', side: 'right' },
      { x: 78, y: 50, label: 'Skincare',    val: '74', color: '#00F5FF', side: 'right' },
      { x: 76, y: 70, label: 'Nutrition',   val: '79', color: '#C8FF00', side: 'right' },
    ],
    score: 78,
    rank: '47% des utilisateurs ont un meilleur score que toi.',
  },
  {
    img: '/selfie2.png',
    mesh: MESH_M,
    metrics: [
      { x: 24, y: 28, label: 'Hydratation', val: '65', color: '#C8FF00', side: 'left' },
      { x: 22, y: 48, label: 'Sommeil',     val: '80', color: '#A78BFA', side: 'left' },
      { x: 24, y: 68, label: 'Training',    val: '91', color: '#FF6B35', side: 'left' },
      { x: 76, y: 28, label: 'Énergie',     val: '77', color: '#FF6B35', side: 'right' },
      { x: 78, y: 48, label: 'Skincare',    val: '42', color: '#00F5FF', side: 'right' },
      { x: 76, y: 68, label: 'Nutrition',   val: '55', color: '#C8FF00', side: 'right' },
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

          <MeshSVG mesh={profile.mesh} visible={meshVisible} W={W} H={H} />

          {phase === 'scan' && (
            <div style={{ position:'absolute',left:0,right:0,top:`${scanY}%`,height:2,zIndex:15,
              background:'linear-gradient(to right, transparent, #00F5FF 20%, #C8FF00 50%, #00F5FF 80%, transparent)',
              boxShadow:'0 0 10px #00F5FF',pointerEvents:'none' }} />
          )}

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
