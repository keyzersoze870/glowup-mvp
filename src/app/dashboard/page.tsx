'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { GlowUpScore, OnboardingData } from '@/lib/types'

const sf = `-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif`
const BLUE = '#0A84FF'

const CATEGORIES = [
  { key: 'training', label: 'Sport',       icon: '🏋️', color: '#FF9F0A' },
  { key: 'nutrition', label: 'Nutrition',  icon: '🥗',  color: '#30D158' },
  { key: 'hydratation', label: 'Eau',      icon: '💧',  color: BLUE },
  { key: 'sommeil', label: 'Sommeil',      icon: '🌙',  color: '#BF5AF2' },
  { key: 'skincare', label: 'Skincare',    icon: '✨',  color: '#64D2FF' },
  { key: 'steps', label: 'Stress',         icon: '🧘',  color: '#FF453A' },
]

function ScoreRing({ score }: { score: number }) {
  const [displayed, setDisplayed] = useState(0)
  const r = 54
  const c = 2 * Math.PI * r
  const offset = c - (displayed / 100) * c
  const color = displayed >= 70 ? '#30D158' : displayed >= 45 ? '#FF9F0A' : '#FF453A'

  useEffect(() => {
    let frame: number
    let cur = 0
    const animate = () => {
      cur += Math.ceil((score - cur) / 8)
      setDisplayed(Math.min(cur, score))
      if (cur < score) frame = requestAnimationFrame(animate)
    }
    const t = setTimeout(() => { frame = requestAnimationFrame(animate) }, 400)
    return () => { clearTimeout(t); cancelAnimationFrame(frame) }
  }, [score])

  return (
    <svg width={160} height={160} viewBox="0 0 120 120">
      <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="7"/>
      <circle cx="60" cy="60" r={r} fill="none" stroke={color} strokeWidth="7"
        strokeLinecap="round" strokeDasharray={c} strokeDashoffset={offset}
        transform="rotate(-90 60 60)" style={{ transition:'stroke-dashoffset 0.03s ease' }}/>
      <text x="60" y="52" textAnchor="middle" dominantBaseline="middle"
        style={{ fontFamily:'-apple-system, BlinkMacSystemFont', fontWeight:700, fontSize:28, fill:'#fff', letterSpacing:-1 }}>
        {displayed}
      </text>
      <text x="60" y="70" textAnchor="middle" dominantBaseline="middle"
        style={{ fontFamily:'-apple-system', fontSize:8, fill:'rgba(255,255,255,0.35)', letterSpacing:0.5 }}>
        / 100
      </text>
    </svg>
  )
}

export default function Dashboard() {
  const router = useRouter()
  const [profile, setProfile] = useState<Partial<OnboardingData> | null>(null)
  const [score, setScore] = useState<GlowUpScore | null>(null)
  const [activeTab, setActiveTab] = useState<'score' | 'plan' | 'today'>('score')

  useEffect(() => {
    const p = localStorage.getItem('glowup_profile')
    const s = localStorage.getItem('glowup_score')
    if (!p || !s) { router.push('/onboarding'); return }
    setProfile(JSON.parse(p))
    setScore(JSON.parse(s))
  }, [])

  if (!score || !profile) {
    return (
      <div style={{ height:'100dvh', background:'#000', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div style={{ width:24, height:24, border:`2px solid rgba(255,255,255,0.1)`, borderTopColor:BLUE, borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  const scoreColor = score.total >= 70 ? '#30D158' : score.total >= 45 ? '#FF9F0A' : '#FF453A'
  const scoreLabel = score.total >= 70 ? 'Excellent' : score.total >= 55 ? 'Bien' : score.total >= 40 ? 'À améliorer' : 'Faible'

  return (
    <main style={{ height:'100dvh', background:'#000', fontFamily:sf, overflow:'hidden', display:'flex', flexDirection:'column' }}>

      {/* NAV */}
      <nav style={{ flexShrink:0, padding:'12px 20px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <span style={{ fontSize:20, fontWeight:700, color:'#fff', letterSpacing:-0.5 }}>GlowApp</span>
        <button onClick={() => { localStorage.clear(); router.push('/') }}
          style={{ background:'none', border:'none', color:'rgba(255,255,255,0.35)', fontSize:13, cursor:'pointer', fontFamily:sf }}>
          Recommencer
        </button>
      </nav>

      {/* HERO SCORE */}
      <div style={{ flexShrink:0, display:'flex', flexDirection:'column', alignItems:'center', padding:'8px 20px 16px' }}>
        {/* Greeting */}
        <p style={{ fontSize:13, color:'rgba(255,255,255,0.4)', letterSpacing:-0.2, marginBottom:4 }}>
          Bonjour {profile.prenom} 👋
        </p>

        {/* Ring */}
        <ScoreRing score={score.total} />

        {/* Score label */}
        <div style={{ marginTop:4, display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
          <span style={{ fontSize:13, fontWeight:600, color:scoreColor, letterSpacing:-0.2 }}>{scoreLabel}</span>
          <p style={{ fontSize:11, color:'rgba(255,255,255,0.3)', letterSpacing:-0.1, textAlign:'center', maxWidth:240, lineHeight:1.4 }}>
            {score.analyse}
          </p>
        </div>
      </div>

      {/* TABS */}
      <div style={{ flexShrink:0, padding:'0 20px 12px', display:'flex', gap:6 }}>
        {[['score','Mon score'],['plan','Plan S1'],['today',"Aujourd'hui"]].map(([k,l]) => (
          <button key={k} onClick={() => setActiveTab(k as any)}
            style={{ flex:1, padding:'9px 4px', borderRadius:10, border:'none', cursor:'pointer', fontFamily:sf,
              background: activeTab === k ? BLUE : 'rgba(255,255,255,0.07)',
              color: activeTab === k ? '#fff' : 'rgba(255,255,255,0.45)',
              fontSize:12, fontWeight:600, letterSpacing:-0.2, transition:'all 0.15s' }}>
            {l}
          </button>
        ))}
      </div>

      {/* CONTENT */}
      <div style={{ flex:1, overflowY:'auto', padding:'0 20px 24px' }}>

        {/* TAB SCORE */}
        {activeTab === 'score' && (
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            <p style={{ fontSize:11, color:'rgba(255,255,255,0.3)', letterSpacing:0.5, textTransform:'uppercase', marginBottom:4 }}>Détail par catégorie</p>
            {CATEGORIES.map(cat => {
              const val = score[cat.key as keyof GlowUpScore] as number
              const pct = (val / 10) * 100
              return (
                <div key={cat.key} style={{ background:'rgba(255,255,255,0.05)', border:'0.5px solid rgba(255,255,255,0.08)', borderRadius:14, padding:'14px 16px' }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <span style={{ fontSize:18 }}>{cat.icon}</span>
                      <span style={{ fontSize:14, fontWeight:600, color:'#fff', letterSpacing:-0.3 }}>{cat.label}</span>
                    </div>
                    <span style={{ fontSize:18, fontWeight:700, color:cat.color, letterSpacing:-0.5 }}>{val}<span style={{ fontSize:11, fontWeight:400, color:'rgba(255,255,255,0.3)' }}>/10</span></span>
                  </div>
                  <div style={{ height:4, background:'rgba(255,255,255,0.08)', borderRadius:2, overflow:'hidden' }}>
                    <div style={{ height:'100%', width:`${pct}%`, background:cat.color, borderRadius:2, transition:'width 0.8s ease' }} />
                  </div>
                </div>
              )
            })}

            {/* Paywall */}
            <div style={{ marginTop:8, padding:'16px', background:'rgba(10,132,255,0.08)', border:'0.5px solid rgba(10,132,255,0.2)', borderRadius:16 }}>
              <p style={{ fontSize:12, color:BLUE, fontWeight:600, marginBottom:4, letterSpacing:-0.2 }}>🔒 Premium</p>
              <p style={{ fontSize:13, color:'rgba(255,255,255,0.5)', marginBottom:12, letterSpacing:-0.2, lineHeight:1.5 }}>
                Débloque l'historique complet, le programme personnalisé et le suivi semaine par semaine.
              </p>
              <button style={{ width:'100%', padding:'12px', background:BLUE, border:'none', borderRadius:12, color:'#fff', fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:sf, letterSpacing:-0.3 }}>
                Passer Premium — 9,99€/mois
              </button>
            </div>
          </div>
        )}

        {/* TAB PLAN */}
        {activeTab === 'plan' && (
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            <p style={{ fontSize:11, color:'rgba(255,255,255,0.3)', letterSpacing:0.5, textTransform:'uppercase', marginBottom:4 }}>Ton plan — Semaine 1</p>
            {score.plan_semaine1?.map((action, i) => (
              <div key={i} style={{ background:'rgba(255,255,255,0.05)', border:'0.5px solid rgba(255,255,255,0.08)', borderRadius:14, padding:'14px 16px', display:'flex', gap:12, alignItems:'flex-start' }}>
                <div style={{ width:24, height:24, borderRadius:'50%', background:BLUE, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:11, fontWeight:700, color:'#fff' }}>{i+1}</div>
                <p style={{ fontSize:14, color:'rgba(255,255,255,0.8)', lineHeight:1.5, letterSpacing:-0.2 }}>{action}</p>
              </div>
            ))}
            {score.quick_wins?.length > 0 && (
              <>
                <p style={{ fontSize:11, color:'rgba(255,255,255,0.3)', letterSpacing:0.5, textTransform:'uppercase', marginTop:8, marginBottom:4 }}>Quick wins — 7 jours</p>
                {score.quick_wins.map((win, i) => (
                  <div key={i} style={{ background:'rgba(48,209,88,0.06)', border:'0.5px solid rgba(48,209,88,0.15)', borderRadius:14, padding:'12px 16px', display:'flex', gap:10, alignItems:'flex-start' }}>
                    <span style={{ color:'#30D158', fontSize:14 }}>✦</span>
                    <p style={{ fontSize:13, color:'rgba(255,255,255,0.65)', lineHeight:1.5, letterSpacing:-0.2 }}>{win}</p>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {/* TAB TODAY */}
        {activeTab === 'today' && (
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            <p style={{ fontSize:11, color:'rgba(255,255,255,0.3)', letterSpacing:0.5, textTransform:'uppercase', marginBottom:4 }}>Checklist du jour</p>
            {[
              { icon:'🏋️', label:'Séance de sport', sub:'30 min minimum' },
              { icon:'💧', label:'2L d\'eau', sub:'Répartis dans la journée' },
              { icon:'🥗', label:'Manger équilibré', sub:'Protéines + légumes' },
              { icon:'🌙', label:'Dormir 7-8h', sub:'Coucher avant 23h' },
              { icon:'✨', label:'Routine skincare', sub:'Matin + soir' },
            ].map((item, i) => (
              <CheckItem key={i} icon={item.icon} label={item.label} sub={item.sub} />
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        ::-webkit-scrollbar { display: none; }
        * { box-sizing:border-box; margin:0; padding:0; }
      `}</style>
    </main>
  )
}

function CheckItem({ icon, label, sub }: { icon: string, label: string, sub: string }) {
  const [done, setDone] = useState(false)
  return (
    <button onClick={() => setDone(d => !d)}
      style={{ width:'100%', background: done ? 'rgba(48,209,88,0.08)' : 'rgba(255,255,255,0.05)', border:`0.5px solid ${done ? 'rgba(48,209,88,0.2)' : 'rgba(255,255,255,0.08)'}`, borderRadius:14, padding:'14px 16px', display:'flex', alignItems:'center', gap:12, cursor:'pointer', fontFamily:`-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif`, transition:'all 0.15s' }}>
      <span style={{ fontSize:20 }}>{icon}</span>
      <div style={{ flex:1, textAlign:'left' }}>
        <p style={{ fontSize:14, fontWeight:600, color: done ? 'rgba(255,255,255,0.4)' : '#fff', letterSpacing:-0.3, textDecoration: done ? 'line-through' : 'none' }}>{label}</p>
        <p style={{ fontSize:11, color:'rgba(255,255,255,0.3)', letterSpacing:-0.1, marginTop:1 }}>{sub}</p>
      </div>
      <div style={{ width:22, height:22, borderRadius:'50%', background: done ? '#30D158' : 'rgba(255,255,255,0.08)', border:`0.5px solid ${done ? '#30D158' : 'rgba(255,255,255,0.15)'}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'all 0.15s' }}>
        {done && <span style={{ fontSize:12, color:'#000', fontWeight:700 }}>✓</span>}
      </div>
    </button>
  )
}
