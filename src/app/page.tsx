'use client'
import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'

// Mesh calibré sur les vraies photos
// Photo femme : visage légèrement penché à droite, cheveux blonds
// Dans le cadre 260x300 avec objectPosition center 20%
// Le visage occupe environ x:25%-75%, y:8%-75%
const MESH_F = {
  jaw:   [[30,62],[29,68],[29,75],[31,81],[34,87],[38,91],[43,94],[50,96],[57,94],[62,91],[66,87],[69,81],[71,75],[71,68],[70,62]],
  browL: [[30,34],[34,31],[39,29],[44,30],[48,32]],
  browR: [[53,31],[58,29],[63,30],[67,32],[70,34]],
  eyeL:  [[31,38],[36,35],[41,35],[45,38],[41,41],[36,41]],
  eyeR:  [[55,37],[59,34],[64,34],[68,37],[64,40],[59,40]],
  nose:  [[50,37],[49,43],[49,49],[49,54],[45,57],[47,58],[50,59],[53,58],[55,57]],
  mouth: [[39,64],[44,61],[48,60],[52,60],[57,61],[62,64],[57,68],[52,69],[48,69],[44,68]],
}

// Photo homme : visage légèrement penché à gauche, cheveux noirs
// Visage occupe environ x:22%-75%, y:18%-80%
const MESH_M = {
  jaw:   [[28,68],[27,74],[27,80],[29,86],[32,91],[37,95],[43,98],[50,99],[57,98],[63,95],[68,91],[71,86],[73,80],[73,74],[72,68]],
  browL: [[28,42],[32,38],[37,36],[42,37],[46,39]],
  browR: [[54,38],[58,36],[63,37],[68,39],[71,42]],
  eyeL:  [[29,47],[34,44],[39,44],[44,47],[39,50],[34,50]],
  eyeR:  [[56,46],[61,43],[66,43],[71,46],[66,49],[61,49]],
  nose:  [[50,46],[50,52],[50,57],[50,62],[46,65],[48,66],[50,67],[52,66],[54,65]],
  mouth: [[38,73],[43,70],[47,69],[53,69],[57,70],[62,73],[57,77],[52,78],[48,78],[43,77]],
}

function MeshSVG({ mesh, visible, W, H }: { mesh: typeof MESH_F, visible: boolean, W: number, H: number }) {
  const p = (pt: number[]) => ({ x: pt[0]/100*W, y: pt[1]/100*H })
  const path = (pts: number[][], closed = false) => {
    const c = pts.map(p)
    return c.map((pt, i) => `${i===0?'M':'L'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`).join(' ') + (closed?' Z':'')
  }
  const allPts = [...mesh.jaw,...mesh.browL,...mesh.browR,...mesh.eyeL,...mesh.eyeR,...mesh.nose,...mesh.mouth]

  return (
    <svg style={{ position:'absolute',inset:0,width:'100%',height:'100%',zIndex:12,pointerEvents:'none',
      opacity:visible?1:0, transition:'opacity 0.6s ease' }} viewBox={`0 0 ${W} ${H}`}>
      <defs>
        <filter id="cglow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.2" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <g filter="url(#cglow)" stroke="#00F5FF" strokeWidth="0.8" strokeOpacity="0.65" fill="none">
        <path d={path(mesh.jaw)}/>
        <path d={path(mesh.browL)}/>
        <path d={path(mesh.browR)}/>
        <path d={path(mesh.eyeL, true)}/>
        <path d={path(mesh.eyeR, true)}/>
        <path d={path(mesh.nose)}/>
        <path d={path(mesh.mouth, true)}/>
        {/* Pont nez-sourcils */}
        <line x1={p(mesh.browL[2]).x} y1={p(mesh.browL[2]).y} x2={p(mesh.eyeL[0]).x} y2={p(mesh.eyeL[0]).y}/>
        <line x1={p(mesh.browR[2]).x} y1={p(mesh.browR[2]).y} x2={p(mesh.eyeR[2]).x} y2={p(mesh.eyeR[2]).y}/>
        {/* Nez vers bouche */}
        <line x1={p(mesh.nose[8]).x} y1={p(mesh.nose[8]).y} x2={p(mesh.mouth[0]).x} y2={p(mesh.mouth[0]).y} strokeOpacity="0.3"/>
        <line x1={p(mesh.nose[6]).x} y1={p(mesh.nose[6]).y} x2={p(mesh.mouth[4]).x} y2={p(mesh.mouth[4]).y} strokeOpacity="0.3"/>
      </g>
      {/* Points lumineux */}
      <g fill="#00F5FF" filter="url(#cglow)">
        {allPts.map((pt,i) => <circle key={i} cx={p(pt).x} cy={p(pt).y} r="2" opacity="0.95"/>)}
      </g>
    </svg>
  )
}

const PROFILES = [
  {
    img: '/selfie1.png',
    mesh: MESH_F,
    metrics: [
      { x: 22, y: 32, label: 'Hydratation', val: '92', color: '#C8FF00', side: 'left' },
      { x: 20, y: 52, label: 'Sommeil',     val: '61', color: '#A78BFA', side: 'left' },
      { x: 22, y: 72, label: 'Training',    val: '85', color: '#FF6B35', side: 'left' },
      { x: 78, y: 32, label: 'Énergie',     val: '88', color: '#FF6B35', side: 'right' },
      { x: 80, y: 52, label: 'Skincare',    val: '74', color: '#00F5FF', side: 'right' },
      { x: 78, y: 72, label: 'Nutrition',   val: '79', color: '#C8FF00', side: 'right' },
    ],
    score: 78,
    rank: '47% des utilisateurs ont un meilleur score que toi.',
  },
  {
    img: '/selfie2.png',
    mesh: MESH_M,
    metrics: [
      { x: 20, y: 38, label: 'Hydratation', val: '65', color: '#C8FF00', side: 'left' },
      { x: 18, y: 56, label: 'Sommeil',     val: '80', color: '#A78BFA', side: 'left' },
      { x: 20, y: 74, label: 'Training',    val: '91', color: '#FF6B35', side: 'left' },
      { x: 80, y: 38, label: 'Énergie',     val: '77', color: '#FF6B35', side: 'right' },
      { x: 82, y: 56, label: 'Skincare',    val: '42', color: '#00F5FF', side: 'right' },
      { x: 80, y: 74, label: 'Nutrition',   val: '55', color: '#C8FF00', side: 'right' },
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
          {[{top:-3,left:-3,borderWidth:'2px 0 0 2px'},{top:-3,right:-3,borderWidth:'2px 2px 0 0'},{bottom:-3,left:-3,borderWidth:'0 0 2px 2px'},{bottom:-3,right:-3,borderWidth:'0 2px 2px 0'}].map((s,i) => (
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
