'use client'
import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

const sf = `-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif`
const BLUE = '#0A84FF'
const RED = '#FF453A'
const ORANGE = '#FF9F0A'
const GREEN = '#30D158'
const PURPLE = '#BF5AF2'
const CYAN = '#64D2FF'

export default function LandingPage() {
  const router = useRouter()
  const [phase, setPhase] = useState<'scan' | 'reveal'>('scan')
  const [scanY, setScanY] = useState(0)
  const [visiblePoints, setVisiblePoints] = useState<number[]>([])
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const p = localStorage.getItem('glowup_profile')
    if (p) { router.push('/today'); return }
  }, [])

  useEffect(() => {
    const animateScan = () => {
      setScanY(prev => {
        if (prev >= 100) return 100
        return prev + 0.5
      })
      if (scanY < 100) {
        rafRef.current = requestAnimationFrame(animateScan)
      } else {
        setPhase('reveal');
        [0,1,2,3,4,5].forEach((_, i) => setTimeout(() => setVisiblePoints(prev => [...prev, i]), i * 150))
      }
    }
    setTimeout(() => { rafRef.current = requestAnimationFrame(animateScan) }, 600)
    return () => cancelAnimationFrame(rafRef.current)
  }, [scanY])

  const leftMetrics = [
    { label: 'Sleep', val: '38', color: RED },
    { label: 'Stress', val: '72', color: ORANGE },
    { label: 'Hydration', val: '45', color: BLUE },
  ]
  const rightMetrics = [
    { label: 'Nutrition', val: '56', color: GREEN },
    { label: 'Exercise', val: '61', color: PURPLE },
    { label: 'Outdoor', val: '29', color: CYAN },
  ]

  return (
    <main style={{ height:'100svh', background:'#FFFFFF', fontFamily:sf, overflow:'hidden', display:'flex', flexDirection:'column' }}>

      <nav style={{ flexShrink:0, padding:'56px 20px 12px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <span style={{ fontSize:20, fontWeight:700, color:'#1A1A1A', letterSpacing:-0.5 }}>GlowApp</span>
        <Link href="/onboarding" style={{ background:BLUE, color:'#fff', border:'none', borderRadius:20, padding:'7px 16px', fontSize:12, fontWeight:600, textDecoration:'none', letterSpacing:-0.2 }}>
          Start now
        </Link>
      </nav>

      <div style={{ flexShrink:0, padding:'4px 20px 0', textAlign:'center' }}>
        <div style={{ display:'inline-flex', alignItems:'center', gap:6, background:'rgba(255,69,58,0.08)', border:'0.5px solid rgba(255,69,58,0.2)', borderRadius:20, padding:'4px 12px', marginBottom:10 }}>
          <div style={{ width:6, height:6, borderRadius:'50%', background:RED, animation:'blink 1.5s infinite' }} />
          <span style={{ fontSize:11, fontWeight:600, color:RED, letterSpacing:0.2 }}>HIGH CORTISOL DETECTED</span>
        </div>
        <h1 style={{ fontSize:26, fontWeight:700, color:'#1A1A1A', letterSpacing:-0.8, lineHeight:1.15, marginBottom:6 }}>
          Your cortisol is aging<br/>your face <span style={{ color:RED }}>right now</span>
        </h1>
        <p style={{ fontSize:13, color:'rgba(0,0,0,0.45)', letterSpacing:-0.2, lineHeight:1.5, maxWidth:300, margin:'0 auto' }}>
          Discover your Cortisol Score in 2 minutes. Join 14,000+ women who already reduced theirs.
        </p>
      </div>

      <div style={{ flex:1, position:'relative', margin:'12px 20px', borderRadius:20, overflow:'hidden', border:'0.5px solid rgba(0,0,0,0.08)' }}>
        <img src="/selfie1.png" alt="analysis" style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'center top' }} />

        {phase === 'reveal' && (
          <>
            <div style={{ position:'absolute', left:8, top:'50%', transform:'translateY(-50%)', display:'flex', flexDirection:'column', gap:8, zIndex:16 }}>
              {leftMetrics.map((m, i) => (
                <div key={i} style={{ background:'rgba(255,255,255,0.92)', border:'0.5px solid rgba(0,0,0,0.07)', borderRadius:8, padding:'4px 8px', opacity: visiblePoints.includes(i) ? 1 : 0, transition:'opacity 0.4s ease', transitionDelay:`${i * 0.15}s` }}>
                  <div style={{ fontSize:13, fontWeight:700, color:m.color, letterSpacing:-0.3, lineHeight:1 }}>
                    {m.val}<span style={{ fontSize:8, opacity:0.4, fontWeight:400 }}>/100</span>
                  </div>
                  <div style={{ fontSize:8, fontWeight:500, color:'rgba(0,0,0,0.45)', marginTop:1 }}>{m.label}</div>
                </div>
              ))}
            </div>
            <div style={{ position:'absolute', right:8, top:'50%', transform:'translateY(-50%)', display:'flex', flexDirection:'column', gap:8, zIndex:16 }}>
              {rightMetrics.map((m, i) => (
                <div key={i} style={{ background:'rgba(255,255,255,0.92)', border:'0.5px solid rgba(0,0,0,0.07)', borderRadius:8, padding:'4px 8px', textAlign:'right', opacity: visiblePoints.includes(i + 3) ? 1 : 0, transition:'opacity 0.4s ease', transitionDelay:`${(i + 3) * 0.15}s` }}>
                  <div style={{ fontSize:13, fontWeight:700, color:m.color, letterSpacing:-0.3, lineHeight:1 }}>
                    {m.val}<span style={{ fontSize:8, opacity:0.4, fontWeight:400 }}>/100</span>
                  </div>
                  <div style={{ fontSize:8, fontWeight:500, color:'rgba(0,0,0,0.45)', marginTop:1 }}>{m.label}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {phase === 'scan' && (
          <div style={{ position:'absolute', left:0, right:0, top:`${scanY}%`, height:1.5, zIndex:15,
            background:`linear-gradient(90deg, transparent, ${RED}, transparent)`, opacity:0.6 }} />
        )}

        <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse at center, transparent 50%, #FFFFFF 95%)', pointerEvents:'none' }} />
      </div>

      <div style={{ flexShrink:0, padding:'10px 20px 14px', textAlign:'center' }}>
        <div style={{ fontSize:11, color:'rgba(0,0,0,0.3)', letterSpacing:0.5, textTransform:'uppercase', marginBottom:4 }}>Cortisol Score</div>
        <div style={{ fontSize:42, fontWeight:800, color:RED, letterSpacing:-2, lineHeight:1 }}>
          72<span style={{ fontSize:16, color:'rgba(0,0,0,0.2)', fontWeight:400 }}>/100</span>
        </div>
        <p style={{ fontSize:11, color:RED, letterSpacing:-0.1, marginTop:4, fontWeight:500 }}>
          ⚠ High — 68% of women your age scored lower
        </p>
        <Link href="/onboarding" style={{ fontSize:15, fontWeight:600, color:'#FFFFFF', background:RED, padding:'14px 0', borderRadius:14,
          textDecoration:'none', letterSpacing:-0.3, display:'block', textAlign:'center', marginTop:10 }}>
          Check my cortisol — Free
        </Link>
        <div style={{ fontSize:11, color:'rgba(0,0,0,0.2)', marginTop:6, letterSpacing:-0.1 }}>2 min · No credit card required</div>
      </div>

      <style>{`
        @keyframes blink { 0%,100% { opacity:1 } 50% { opacity:0.3 } }
        * { box-sizing:border-box; margin:0; padding:0; }
      `}</style>
    </main>
  )
}
