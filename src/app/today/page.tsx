'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const sf = `-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif`
const BLUE = '#0A84FF'

const CAT_ICONS: Record<string, string> = {
  training: '🏋️', nutrition: '🥗', hydratation: '💧',
  sommeil: '🌙', skincare: '✨', stress: '🧘'
}
const CAT_COLORS: Record<string, string> = {
  training: '#FF9F0A', nutrition: '#30D158', hydratation: BLUE,
  sommeil: '#BF5AF2', skincare: '#64D2FF', stress: '#FF453A'
}

function getHour() { return new Date().getHours() }
function isMorning() { return getHour() < 14 }
function isEvening() { return getHour() >= 18 }

export default function TodayPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [score, setScore] = useState<any>(null)
  const [missions, setMissions] = useState<any[]>([])
  const [messageMatin, setMessageMatin] = useState('')
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const [liveScore, setLiveScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [loading, setLoading] = useState(true)
  const [scoreVariation, setScoreVariation] = useState(0)
  const [eveningMessage, setEveningMessage] = useState('')

  useEffect(() => {
    const p = localStorage.getItem('glowup_profile')
    const s = localStorage.getItem('glowup_score')
    const st = localStorage.getItem('glowup_streak')
    const todayMissions = localStorage.getItem('glowup_missions_today')
    const todayDate = localStorage.getItem('glowup_missions_date')
    const today = new Date().toDateString()
    const yesterdayCompleted = Number(localStorage.getItem('glowup_completed_yesterday') || 0)

    if (!p || !s) { router.push('/onboarding'); return }

    const parsedProfile = JSON.parse(p)
    const parsedScore = JSON.parse(s)
    setProfile(parsedProfile)
    setScore(parsedScore)
    setLiveScore(parsedScore.total)
    setStreak(st ? Number(st) : 0)

    // Charger missions du jour ou en générer de nouvelles
    if (todayMissions && todayDate === today) {
      setMissions(JSON.parse(todayMissions))
      setMessageMatin(localStorage.getItem('glowup_message_matin') || '')
      setLoading(false)
    } else {
      // Générer nouvelles missions
      fetch('/api/daily-missions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile: parsedProfile, score: parsedScore, completedYesterday: yesterdayCompleted })
      }).then(r => r.json()).then(data => {
        if (data.success) {
          setMissions(data.missions)
          setMessageMatin(data.message_matin)
          localStorage.setItem('glowup_missions_today', JSON.stringify(data.missions))
          localStorage.setItem('glowup_missions_date', today)
          localStorage.setItem('glowup_message_matin', data.message_matin)
        }
        setLoading(false)
      }).catch(() => setLoading(false))
    }

    // Restaurer état des cases cochées
    const savedChecked = localStorage.getItem('glowup_checked_today')
    if (savedChecked && todayDate === today) {
      setChecked(JSON.parse(savedChecked))
    }
  }, [])

  const toggleMission = (id: string, points: number) => {
    const newChecked = { ...checked, [id]: !checked[id] }
    setChecked(newChecked)
    localStorage.setItem('glowup_checked_today', JSON.stringify(newChecked))

    // Score monte/descend en temps réel
    const delta = newChecked[id] ? points : -points
    setLiveScore(s => Math.max(0, Math.min(100, s + delta)))
    setScoreVariation(v => v + delta)

    // Message du soir après avoir tout coché
    const doneCount = Object.values(newChecked).filter(Boolean).length
    if (doneCount === missions.length) {
      setEveningMessage('Toutes tes missions complétées 🎉 Ton score a progressé aujourd\'hui.')
      // Sauvegarder streak
      const newStreak = streak + 1
      setStreak(newStreak)
      localStorage.setItem('glowup_streak', String(newStreak))
      localStorage.setItem('glowup_completed_yesterday', String(doneCount))
    }
  }

  const doneCount = Object.values(checked).filter(Boolean).length
  const totalPoints = missions.reduce((acc, m) => acc + (checked[m.id] ? m.points : 0), 0)

  if (!profile || !score) return (
    <div style={{ height:'100svh', background:'#000', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ width:24, height:24, border:`2px solid rgba(255,255,255,0.1)`, borderTopColor:BLUE, borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  const scoreColor = liveScore >= 70 ? '#30D158' : liveScore >= 45 ? '#FF9F0A' : '#FF453A'
  const circumference = 2 * Math.PI * 38

  return (
    <main style={{ height:'100svh', background:'#000', fontFamily:sf, overflow:'hidden', display:'flex', flexDirection:'column' }}>

      {/* NAV */}
      <nav style={{ flexShrink:0, padding:'12px 20px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <button onClick={() => router.push('/dashboard')}
          style={{ background:'none', border:'none', color:'rgba(255,255,255,0.5)', fontSize:14, cursor:'pointer', fontFamily:sf }}>
          ← Score
        </button>
        <span style={{ fontSize:16, fontWeight:700, color:'#fff', letterSpacing:-0.5 }}>Aujourd'hui</span>
        <div style={{ display:'flex', alignItems:'center', gap:6, background:'rgba(255,149,10,0.12)', border:'0.5px solid rgba(255,149,10,0.25)', padding:'4px 10px', borderRadius:20 }}>
          <span style={{ fontSize:12 }}>🔥</span>
          <span style={{ fontSize:12, fontWeight:600, color:'#FF9F0A' }}>{streak}j</span>
        </div>
      </nav>

      <div style={{ flex:1, overflowY:'auto', padding:'0 20px 40px' }}>

        {/* DATE */}
        <p style={{ fontSize:12, color:'rgba(255,255,255,0.35)', textAlign:'center', letterSpacing:0.3, marginBottom:8, textTransform:'capitalize' }}>
          {new Date().toLocaleDateString('fr-FR', { weekday:'long', day:'numeric', month:'long' })}
        </p>

        {/* SCORE CENTRAL GROS */}
        <div style={{ textAlign:'center', marginBottom:20 }}>
          {(() => {
            const circumference = 2 * Math.PI * 54
            const scoreColor = liveScore >= 70 ? '#30D158' : liveScore >= 45 ? '#FF9F0A' : '#FF453A'
            return (
              <svg width={160} height={160} viewBox="0 0 120 120" style={{ display:'block', margin:'0 auto' }}>
                <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="7"/>
                <circle cx="60" cy="60" r="54" fill="none" stroke={scoreColor} strokeWidth="7"
                  strokeLinecap="round" strokeDasharray={circumference}
                  strokeDashoffset={circumference - (liveScore / 100) * circumference}
                  transform="rotate(-90 60 60)" style={{ transition:'stroke-dashoffset 0.3s ease' }}/>
                <text x="60" y="55" textAnchor="middle" dominantBaseline="middle"
                  style={{ fontFamily:sf, fontWeight:700, fontSize:30, fill:'#fff', letterSpacing:-1 }}>{liveScore}</text>
                <text x="60" y="72" textAnchor="middle" dominantBaseline="middle"
                  style={{ fontFamily:sf, fontSize:9, fill:'rgba(255,255,255,0.3)' }}>/ 100</text>
              </svg>
            )
          })()}

          {/* Variation */}
          {scoreVariation !== 0 && (
            <div style={{ display:'inline-flex', alignItems:'center', gap:4, background: scoreVariation > 0 ? 'rgba(48,209,88,0.12)' : 'rgba(255,69,58,0.12)', border:`0.5px solid ${scoreVariation > 0 ? 'rgba(48,209,88,0.3)' : 'rgba(255,69,58,0.3)'}`, borderRadius:20, padding:'4px 12px', marginTop:8 }}>
              <span style={{ fontSize:13, fontWeight:700, color: scoreVariation > 0 ? '#30D158' : '#FF453A' }}>
                {scoreVariation > 0 ? '+' : ''}{scoreVariation} pts aujourd'hui
              </span>
            </div>
          )}

          {/* Message matin */}
          {messageMatin && (
            <p style={{ fontSize:13, color:'rgba(255,255,255,0.5)', lineHeight:1.5, letterSpacing:-0.2, marginTop:10, maxWidth:280, margin:'10px auto 0' }}>
              {messageMatin}
            </p>
          )}
        </div>

        {/* MISSIONS DU JOUR */}
        <p style={{ fontSize:11, color:'rgba(255,255,255,0.3)', letterSpacing:0.5, textTransform:'uppercase', marginBottom:10 }}>
          Missions du jour · {doneCount}/{missions.length}
        </p>

        {loading ? (
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {[1,2,3].map(i => (
              <div key={i} style={{ height:72, background:'rgba(255,255,255,0.04)', borderRadius:14, animation:'pulse 1.5s ease-in-out infinite' }} />
            ))}
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {missions.map((m: any) => {
              const done = checked[m.id]
              const color = CAT_COLORS[m.categorie] || BLUE
              return (
                <button key={m.id} onClick={() => toggleMission(m.id, m.points)}
                  style={{ width:'100%', background: done ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.05)', border:`0.5px solid ${done ? color + '44' : 'rgba(255,255,255,0.08)'}`, borderRadius:14, padding:'14px 16px', display:'flex', alignItems:'center', gap:12, cursor:'pointer', fontFamily:sf, transition:'all 0.15s', textAlign:'left' }}>
                  <span style={{ fontSize:22, flexShrink:0 }}>{CAT_ICONS[m.categorie] || '⚡'}</span>
                  <div style={{ flex:1 }}>
                    <p style={{ fontSize:14, fontWeight:600, color: done ? 'rgba(255,255,255,0.4)' : '#fff', letterSpacing:-0.3, textDecoration: done ? 'line-through' : 'none', marginBottom:2 }}>{m.texte}</p>
                    <p style={{ fontSize:11, color: done ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.35)' }}>+{m.points} pts</p>
                  </div>
                  <div style={{ width:24, height:24, borderRadius:'50%', background: done ? color : 'rgba(255,255,255,0.08)', border:`0.5px solid ${done ? color : 'rgba(255,255,255,0.15)'}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'all 0.15s' }}>
                    {done && <span style={{ fontSize:13, color:'#000', fontWeight:700 }}>✓</span>}
                  </div>
                </button>
              )
            })}
          </div>
        )}

        {/* FÉLICITATIONS */}
        {eveningMessage && (
          <div style={{ marginTop:16, padding:'16px', background:'rgba(48,209,88,0.08)', border:'0.5px solid rgba(48,209,88,0.2)', borderRadius:16, textAlign:'center' }}>
            <p style={{ fontSize:24, marginBottom:8 }}>🎉</p>
            <p style={{ fontSize:14, fontWeight:600, color:'#30D158', marginBottom:4 }}>Journée parfaite !</p>
            <p style={{ fontSize:13, color:'rgba(255,255,255,0.5)', lineHeight:1.5 }}>{eveningMessage}</p>
          </div>
        )}

        {/* GRAPHE 7 JOURS */}
        <div style={{ marginTop:20 }}>
          <p style={{ fontSize:11, color:'rgba(255,255,255,0.3)', letterSpacing:0.5, textTransform:'uppercase', marginBottom:10 }}>Progression</p>
          <div style={{ background:'rgba(255,255,255,0.04)', border:'0.5px solid rgba(255,255,255,0.08)', borderRadius:14, padding:'16px', display:'flex', alignItems:'flex-end', gap:6, height:80 }}>
            {[score.total-8,score.total-5,score.total-6,score.total-3,score.total-4,score.total-1,liveScore].map((s,i) => {
              const h = Math.max(4, (Math.max(0,s)/100)*48)
              const isToday = i === 6
              const scoreColor = liveScore >= 70 ? '#30D158' : liveScore >= 45 ? '#FF9F0A' : '#FF453A'
              return (
                <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
                  <div style={{ width:'100%', height:h, background: isToday ? scoreColor : 'rgba(255,255,255,0.15)', borderRadius:4 }} />
                  <span style={{ fontSize:8, color: isToday ? scoreColor : 'rgba(255,255,255,0.25)' }}>
                    {isToday ? 'auj' : ['L','M','M','J','V','S'][i]}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes pulse { 0%,100%{opacity:0.4} 50%{opacity:0.8} }
        ::-webkit-scrollbar { display: none; }
        * { box-sizing:border-box; margin:0; padding:0; }
      `}</style>
    </main>
  )
}
