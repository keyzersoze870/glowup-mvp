'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import BottomNav from '@/components/BottomNav'

const sf = `-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif`
const BLUE = '#0A84FF'

const CATEGORIES = [
  { key: 'training',    label: 'Sport',      icon: '🏋️', color: '#FF9F0A' },
  { key: 'nutrition',   label: 'Nutrition',  icon: '🥗',  color: '#30D158' },
  { key: 'hydratation', label: 'Eau',        icon: '💧',  color: BLUE },
  { key: 'sommeil',     label: 'Sommeil',    icon: '🌙',  color: '#BF5AF2' },
  { key: 'skincare',    label: 'Skincare',   icon: '✨',  color: '#64D2FF' },
  { key: 'steps',       label: 'Stress',     icon: '🧘',  color: '#FF453A' },
]

const CHECK_ITEMS = [
  { key: 'sport',      icon: '🏋️', label: 'Séance de sport',   sub: '30 min minimum' },
  { key: 'eau',        icon: '💧', label: '2L d\'eau',          sub: 'Répartis dans la journée' },
  { key: 'nutrition',  icon: '🥗', label: 'Manger équilibré',   sub: 'Protéines + légumes' },
  { key: 'sommeil',    icon: '🌙', label: 'Dormir 7-8h',        sub: 'Coucher avant 23h' },
  { key: 'skincare',   icon: '✨', label: 'Routine skincare',   sub: 'Matin + soir' },
]

function ScoreRing({ score, size = 160 }: { score: number, size?: number }) {
  const [displayed, setDisplayed] = useState(0)
  const r = 54; const c = 2 * Math.PI * r
  const offset = c - (displayed / 100) * c
  const color = displayed >= 70 ? '#30D158' : displayed >= 45 ? '#FF9F0A' : '#FF453A'

  useEffect(() => {
    let frame: number; let cur = 0
    const go = () => {
      cur += Math.ceil((score - cur) / 8)
      setDisplayed(Math.min(cur, score))
      if (cur < score) frame = requestAnimationFrame(go)
    }
    const t = setTimeout(() => { frame = requestAnimationFrame(go) }, 300)
    return () => { clearTimeout(t); cancelAnimationFrame(frame) }
  }, [score])

  return (
    <svg width={size} height={size} viewBox="0 0 120 120">
      <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="7"/>
      <circle cx="60" cy="60" r={r} fill="none" stroke={color} strokeWidth="7"
        strokeLinecap="round" strokeDasharray={c} strokeDashoffset={offset}
        transform="rotate(-90 60 60)" style={{ transition:'stroke-dashoffset 0.03s' }}/>
      <text x="60" y="57" textAnchor="middle" dominantBaseline="middle"
        style={{ fontFamily:sf, fontWeight:700, fontSize:28, fill:'#fff', letterSpacing:-1 }}>{displayed}</text>
      <text x="60" y="72" textAnchor="middle" dominantBaseline="middle"
        style={{ fontFamily:sf, fontSize:8, fill:'rgba(255,255,255,0.3)', letterSpacing:0.5 }}>/ 100</text>
    </svg>
  )
}

function CheckItem({ icon, label, sub, onCheck }: { icon: string, label: string, sub: string, onCheck: (done: boolean) => void }) {
  const [done, setDone] = useState(false)
  const toggle = () => { const next = !done; setDone(next); onCheck(next) }
  return (
    <button onClick={toggle} style={{ width:'100%', background: done ? 'rgba(48,209,88,0.08)' : 'rgba(255,255,255,0.05)', border:`0.5px solid ${done ? 'rgba(48,209,88,0.2)' : 'rgba(255,255,255,0.08)'}`, borderRadius:14, padding:'14px 16px', display:'flex', alignItems:'center', gap:12, cursor:'pointer', fontFamily:sf, transition:'all 0.15s' }}>
      <span style={{ fontSize:20 }}>{icon}</span>
      <div style={{ flex:1, textAlign:'left' }}>
        <p style={{ fontSize:14, fontWeight:600, color: done ? 'rgba(255,255,255,0.35)' : '#fff', letterSpacing:-0.3, textDecoration: done ? 'line-through' : 'none' }}>{label}</p>
        <p style={{ fontSize:11, color:'rgba(255,255,255,0.3)', marginTop:1 }}>{sub}</p>
      </div>
      <div style={{ width:22, height:22, borderRadius:'50%', background: done ? '#30D158' : 'rgba(255,255,255,0.08)', border:`0.5px solid ${done ? '#30D158' : 'rgba(255,255,255,0.15)'}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'all 0.15s' }}>
        {done && <span style={{ fontSize:12, color:'#000', fontWeight:700 }}>✓</span>}
      </div>
    </button>
  )
}

export default function Dashboard() {
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [score, setScore] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'score'|'plan'|'today'>('score')
  const [streak, setStreak] = useState(0)
  const [checkedCount, setCheckedCount] = useState(0)
  const [showPaywall, setShowPaywall] = useState(false)
  const [liveScore, setLiveScore] = useState(0)

  useEffect(() => {
    const p = localStorage.getItem('glowup_profile')
    const s = localStorage.getItem('glowup_score')
    const st = localStorage.getItem('glowup_streak')
    const liveS = localStorage.getItem('glowup_live_score')
    if (!p || !s) { router.push('/onboarding'); return }
    const parsedScore = JSON.parse(s)
    setProfile(JSON.parse(p))
    setScore(parsedScore)
    // Utiliser le score live s'il existe (mis à jour par la page Aujourd'hui)
    setLiveScore(liveS ? Number(liveS) : parsedScore.total)
    setStreak(st ? Number(st) : 0)
  }, [])

  const handleCheck = (done: boolean) => {
    const next = checkedCount + (done ? 1 : -1)
    setCheckedCount(next)
    // Score monte en temps réel avec chaque item coché
    setLiveScore(s => Math.min(100, s + (done ? 2 : -2)))
    // Paywall après 3 items cochés
    if (next === 3) setTimeout(() => setShowPaywall(true), 800)
  }

  const handlePremium = async () => {
    try {
      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prenom: profile?.prenom }),
      })
      const json = await res.json()
      if (json.url) window.location.href = json.url
    } catch (e) { console.error(e) }
  }

  const handleStreakUpdate = async () => {
    const newStreak = streak + 1
    setStreak(newStreak)
    localStorage.setItem('glowup_streak', String(newStreak))

    // Sauvegarder dans Supabase
    try {
      const userId = localStorage.getItem('glowup_user_id')
      if (userId) {
        await supabase.from('daily_checklist').upsert({
          user_id: userId,
          date: new Date().toISOString().split('T')[0],
          sport: true, eau: true, nutrition: true, sommeil: true, skincare: true,
          streak: newStreak,
        }, { onConflict: 'user_id,date' })
      }
    } catch (e) { console.log('Streak save error:', e) }
  }

  if (!score || !profile) return (
    <div style={{ minHeight:'100svh', background:'#000', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ width:24, height:24, border:'2px solid rgba(255,255,255,0.1)', borderTopColor:BLUE, borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
      <BottomNav />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  const segment = liveScore < 45 ? 'faible' : liveScore < 70 ? 'moyen' : 'eleve'
  const scoreColor = liveScore >= 70 ? '#30D158' : liveScore >= 45 ? '#FF9F0A' : '#FF453A'
  const scoreLabel = liveScore >= 70 ? 'Pas encore Elite 👀' : liveScore >= 55 ? 'Potentiel gâché 😤' : liveScore >= 40 ? 'À améliorer ⚡' : 'Faible ⚠️'

  const segmentMsg = segment === 'faible' ? score.message_faible
    : segment === 'moyen' ? score.message_moyen
    : score.message_eleve

  const paywallMsg = segment === 'faible'
    ? `Ton plan personnalisé peut faire monter ton score de +30 points en 4 semaines.`
    : segment === 'moyen'
    ? `Tu es à 2-3 semaines d'un score Elite. Les Premium progressent 3x plus vite.`
    : `Débloque le programme avancé pour atteindre le score Elite (90+).`

  return (
    <main style={{ height:'100svh', background:'#000', fontFamily:sf, display:'flex', flexDirection:'column', position:'relative' }}>

      {/* PAYWALL OVERLAY */}
      {showPaywall && (
        <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.85)', zIndex:100, display:'flex', alignItems:'flex-end', padding:20 }}
          onClick={() => setShowPaywall(false)}>
          <div onClick={e => e.stopPropagation()} style={{ width:'100%', background:'#111', border:'0.5px solid rgba(255,255,255,0.1)', borderRadius:24, padding:24 }}>
            <div style={{ width:40, height:4, background:'rgba(255,255,255,0.2)', borderRadius:2, margin:'0 auto 20px' }} />
            <div style={{ fontSize:28, textAlign:'center', marginBottom:8 }}>🔒</div>
            <h2 style={{ fontSize:22, fontWeight:700, color:'#fff', letterSpacing:-0.8, textAlign:'center', marginBottom:8 }}>
              Passe au niveau supérieur
            </h2>
            <p style={{ fontSize:14, color:'rgba(255,255,255,0.5)', textAlign:'center', lineHeight:1.5, marginBottom:20, letterSpacing:-0.2 }}>
              {paywallMsg}
            </p>
            <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:16 }}>
              {['Programme 8 semaines personnalisé', 'Historique & évolution du score', 'Coach IA disponible 24h/24', 'Alertes & rappels intelligents'].map(f => (
                <div key={f} style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <span style={{ color:'#30D158', fontSize:14 }}>✓</span>
                  <span style={{ fontSize:13, color:'rgba(255,255,255,0.7)', letterSpacing:-0.2 }}>{f}</span>
                </div>
              ))}
            </div>
            <button style={{ width:'100%', padding:'16px', background:BLUE, border:'none', borderRadius:14, color:'#fff', fontSize:16, fontWeight:600, cursor:'pointer', fontFamily:sf, letterSpacing:-0.3, marginBottom:10 }} onClick={handlePremium}>
              Commencer — 9€/mois
            </button>
            <button onClick={() => setShowPaywall(false)} style={{ width:'100%', padding:'12px', background:'none', border:'none', color:'rgba(255,255,255,0.3)', fontSize:14, cursor:'pointer', fontFamily:sf }}>
              Continuer gratuitement
            </button>
          </div>
        </div>
      )}

      {/* NAV */}
      <nav style={{ flexShrink:0, padding:'12px 20px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <span style={{ fontSize:20, fontWeight:700, color:'#fff', letterSpacing:-0.5 }}>GlowApp</span>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          {streak > 0 && (
            <div style={{ display:'flex', alignItems:'center', gap:4, background:'rgba(255,149,10,0.12)', border:'0.5px solid rgba(255,149,10,0.25)', padding:'4px 10px', borderRadius:20 }}>
              <span style={{ fontSize:12 }}>🔥</span>
              <span style={{ fontSize:12, fontWeight:600, color:'#FF9F0A', letterSpacing:-0.2 }}>{streak} jours</span>
            </div>
          )}
          <button onClick={() => router.push('/share')}
            style={{ background:'rgba(10,132,255,0.12)', border:'0.5px solid rgba(10,132,255,0.25)', borderRadius:20, padding:'6px 12px', color:'#0A84FF', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:sf, letterSpacing:-0.2 }}>
            ⬆ Partager
          </button>
        </div>
      </nav>

      {/* HERO */}
      <div style={{ flexShrink:0, display:'flex', flexDirection:'column', alignItems:'center', padding:'4px 20px 12px' }}>
        <p style={{ fontSize:13, color:'rgba(255,255,255,0.4)', letterSpacing:-0.2, marginBottom:4 }}>Bonjour {profile.prenom} 👋</p>
        <ScoreRing score={liveScore} />
        <div style={{ marginTop:4, textAlign:'center', width:'100%' }}>
          <span style={{ fontSize:22, fontWeight:800, color:scoreColor, letterSpacing:-0.5, display:'block', marginBottom:4 }}>{scoreLabel}</span>
          <p style={{ fontSize:12, fontStyle:'italic', fontWeight:300, color:'rgba(255,255,255,0.4)', letterSpacing:-0.1, marginBottom:10 }}>
            {liveScore < 45 ? (
              <><span style={{ color:'#FF453A' }}>87%</span>{' '}des utilisateurs ont un meilleur score que toi, <span style={{ fontWeight:700, color:'#fff' }}>ne laisse pas ton corps se dégrader davantage.</span></>
            ) : liveScore < 70 ? (
              <><span style={{ color:'#FF453A' }}>52%</span>{' '}des utilisateurs ont un meilleur score que toi, <span style={{ fontWeight:700, color:'#fff' }}>ne gâche pas ton potentiel avant qu'il soit trop tard.</span></>
            ) : (
              <><span style={{ color:'#FF453A' }}>18%</span>{' '}des utilisateurs ont un meilleur score que toi, <span style={{ fontWeight:700, color:'#fff' }}>ne t'arrête pas si près du sommet.</span></>
            )}
          </p>
          <p style={{ fontSize:13, fontWeight:600, color:'rgba(255,255,255,0.75)', letterSpacing:-0.1, lineHeight:1.5, maxWidth:280, textAlign:'center', margin:'0 auto 12px' }}>
            <span style={{ color:'#fff', fontWeight:700 }}>{profile.prenom}</span>, <span style={{ color:'#0A84FF' }}>après analyse complète des 68 points de données de ton visage et tes réponses</span>, {segmentMsg?.replace(new RegExp(`^${profile.prenom}[,.]?\\s*`, 'i'), '')}
          </p>
          <p style={{ fontSize:13, color:'rgba(255,255,255,0.5)', letterSpacing:-0.2, lineHeight:1.5, maxWidth:280, textAlign:'center', margin:'0 auto 14px' }}>
            Tu peux dès aujourd'hui commencer à faire monter ce score en suivant le plan personnalisé que j'ai créé pour toi ⬇️
          </p>
          <button onClick={() => router.push('/today')}
            style={{ padding:'11px 24px', background:BLUE, border:'none', borderRadius:12, color:'#fff', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:sf, letterSpacing:-0.2 }}>
            Voir mon plan →
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <div style={{ flex:1, overflowY:'auto', padding:'0 20px 100px' }}>

        {/* SCORE TAB */}
        {activeTab === 'score' && (
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            <p style={{ fontSize:11, color:'rgba(255,255,255,0.3)', letterSpacing:0.5, textTransform:'uppercase', marginBottom:4 }}>Détail par catégorie</p>
            {CATEGORIES.map(cat => {
              const val = score[cat.key] as number
              const isWeak = score.point_faible === cat.key
              return (
                <div key={cat.key} style={{ background: isWeak ? 'rgba(255,69,58,0.06)' : 'rgba(255,255,255,0.05)', border:`0.5px solid ${isWeak ? 'rgba(255,69,58,0.2)' : 'rgba(255,255,255,0.08)'}`, borderRadius:14, padding:'14px 16px' }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <span style={{ fontSize:18 }}>{cat.icon}</span>
                      <div>
                        <span style={{ fontSize:14, fontWeight:600, color:'#fff', letterSpacing:-0.3 }}>{cat.label}</span>
                        {isWeak && <span style={{ display:'block', fontSize:10, color:'#FF453A', marginTop:1 }}>⚠ Point faible</span>}
                      </div>
                    </div>
                    <span style={{ fontSize:18, fontWeight:700, color:cat.color, letterSpacing:-0.5 }}>
                      {val}<span style={{ fontSize:11, fontWeight:400, color:'rgba(255,255,255,0.3)' }}>/10</span>
                    </span>
                  </div>
                  <div style={{ height:4, background:'rgba(255,255,255,0.08)', borderRadius:2, overflow:'hidden' }}>
                    <div style={{ height:'100%', width:`${(val/10)*100}%`, background:cat.color, borderRadius:2 }} />
                  </div>
                </div>
              )
            })}

            {/* À remplir + CTA bas */}
            <p style={{ fontSize:12, color:'rgba(255,255,255,0.35)', letterSpacing:-0.1, lineHeight:1.5, textAlign:'center', margin:'8px 0' }}>À remplir</p>
            <button onClick={() => router.push('/today')}
              style={{ width:'100%', padding:'14px', background:BLUE, border:'none', borderRadius:14, color:'#fff', fontSize:15, fontWeight:600, cursor:'pointer', fontFamily:sf, letterSpacing:-0.3 }}>
              Voir mon plan →
            </button>
          </div>
        )}
      </div>

      <BottomNav />
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        ::-webkit-scrollbar { display: none; }
        * { box-sizing:border-box; margin:0; padding:0; }
      `}</style>
    </main>
  )
}
