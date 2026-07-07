'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const sf = `-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif`
const BLUE = '#0A84FF'

// ─── MISSION TEMPLATES BY WEAK CATEGORY ───
const MISSION_BANK: Record<string, Array<{id: string, text: string, icon: string, cat: string}>> = {
  fitness: [
    { id:'f1', text:'30 min workout — any type', icon:'🏋️', cat:'fitness' },
    { id:'f2', text:'10,000 steps today', icon:'🚶', cat:'fitness' },
    { id:'f3', text:'5 min stretching before bed', icon:'🧘', cat:'fitness' },
    { id:'f4', text:'Take the stairs instead of elevator', icon:'🦵', cat:'fitness' },
    { id:'f5', text:'10 min walk after lunch', icon:'🌤️', cat:'fitness' },
  ],
  sleep: [
    { id:'s1', text:'In bed by 10:30pm tonight', icon:'🛏️', cat:'sleep' },
    { id:'s2', text:'No screen 30 min before bed', icon:'📵', cat:'sleep' },
    { id:'s3', text:'No caffeine after 2pm', icon:'☕', cat:'sleep' },
    { id:'s4', text:'7+ hours of sleep tonight', icon:'🌙', cat:'sleep' },
    { id:'s5', text:'5 min breathing exercise before bed', icon:'🫁', cat:'sleep' },
  ],
  nutrition: [
    { id:'n1', text:'Eat a balanced meal with protein + veggies', icon:'🥗', cat:'nutrition' },
    { id:'n2', text:'No processed food today', icon:'🚫', cat:'nutrition' },
    { id:'n3', text:'Eat a fruit or vegetable snack', icon:'🍎', cat:'nutrition' },
    { id:'n4', text:'Cook one meal from scratch', icon:'👩‍🍳', cat:'nutrition' },
    { id:'n5', text:'No sugary drinks today', icon:'🥤', cat:'nutrition' },
  ],
  water: [
    { id:'w1', text:'Drink 8 cups of water today', icon:'💧', cat:'water' },
    { id:'w2', text:'Start the morning with a full glass', icon:'🌅', cat:'water' },
    { id:'w3', text:'Carry a water bottle all day', icon:'🫗', cat:'water' },
    { id:'w4', text:'Drink a glass before each meal', icon:'🥛', cat:'water' },
    { id:'w5', text:'Replace one soda or coffee with water', icon:'♻️', cat:'water' },
  ],
  stress: [
    { id:'st1', text:'5 min meditation or deep breathing', icon:'🧘', cat:'stress' },
    { id:'st2', text:'Write 3 things you are grateful for', icon:'📝', cat:'stress' },
    { id:'st3', text:'Take a 10 min break with no phone', icon:'📵', cat:'stress' },
    { id:'st4', text:'Go outside for fresh air for 15 min', icon:'🌿', cat:'stress' },
    { id:'st5', text:'Listen to calming music for 10 min', icon:'🎵', cat:'stress' },
  ],
  skincare: [
    { id:'sk1', text:'Morning skincare routine (cleanse + moisturize)', icon:'🧴', cat:'skincare' },
    { id:'sk2', text:'Apply SPF before going outside', icon:'☀️', cat:'skincare' },
    { id:'sk3', text:'Evening skincare routine (cleanse + treat)', icon:'✨', cat:'skincare' },
    { id:'sk4', text:'Don\'t touch your face today', icon:'🙅', cat:'skincare' },
    { id:'sk5', text:'Change your pillowcase', icon:'🛏️', cat:'skincare' },
  ],
  bmi: [
    { id:'b1', text:'30 min of cardio (walk, run, bike)', icon:'🏃', cat:'bmi' },
    { id:'b2', text:'Eat a high-protein meal', icon:'🍗', cat:'bmi' },
    { id:'b3', text:'No snacking after 8pm', icon:'🕗', cat:'bmi' },
    { id:'b4', text:'Track your meals today', icon:'📋', cat:'bmi' },
    { id:'b5', text:'Drink water instead of snacking', icon:'💧', cat:'bmi' },
  ],
}

// ─── SCORE PERSISTENCE ───
function getStoredScore(): { score: number, lastDate: string } {
  const raw = localStorage.getItem('glowup_live_score')
  if (raw) return JSON.parse(raw)
  // First time: use onboarding score
  const onboardingScore = localStorage.getItem('glowup_score')
  if (onboardingScore) {
    const parsed = JSON.parse(onboardingScore)
    return { score: parsed.total || 50, lastDate: new Date().toDateString() }
  }
  return { score: 50, lastDate: new Date().toDateString() }
}

function saveScore(score: number) {
  localStorage.setItem('glowup_live_score', JSON.stringify({
    score: Math.max(0, Math.min(100, score)),
    lastDate: new Date().toDateString(),
  }))
}

function applyDayPenalty(stored: { score: number, lastDate: string }): number {
  const today = new Date().toDateString()
  if (stored.lastDate === today) return stored.score
  // Days missed = penalty
  const last = new Date(stored.lastDate)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24))
  const penalty = Math.min(diffDays * 2, 15) // Max -15 for missing days
  const newScore = Math.max(0, stored.score - penalty)
  saveScore(newScore)
  return newScore
}

export default function TodayPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [weakest, setWeakest] = useState('fitness')
  const [missions, setMissions] = useState<typeof MISSION_BANK['fitness']>([])
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const [liveScore, setLiveScore] = useState(50)
  const [streak, setStreak] = useState(0)
  const [scoreVariation, setScoreVariation] = useState(0)

  useEffect(() => {
    const p = localStorage.getItem('glowup_profile')
    if (!p) { router.push('/onboarding'); return }
    const parsed = JSON.parse(p)
    setProfile(parsed)

    // Calculate weakest from profile
    const calculateWeakest = () => {
      const scores: Record<string, number> = {
        fitness: parsed.sport === '5+' ? 20 : parsed.sport === '3-4' ? 15 : parsed.sport === '1-2' ? 8 : 0,
        sleep: parsed.sleep === '7-8' ? 18 : parsed.sleep === '8+' ? 14 : parsed.sleep === '5-6' ? 6 : 0,
        nutrition: parsed.nutrition === 'excellent' ? 18 : parsed.nutrition === 'good' ? 14 : parsed.nutrition === 'average' ? 7 : 0,
        water: parsed.eau === '2+' ? 12 : parsed.eau === '1.5-2' ? 9 : parsed.eau === '1-1.5' ? 4 : 0,
        stress: parsed.stress === 'low' ? 14 : parsed.stress === 'moderate' ? 10 : parsed.stress === 'high' ? 4 : 0,
        skincare: parsed.skincare === 'complete' ? 10 : parsed.skincare === 'basic' ? 5 : 0,
      }
      const maxes: Record<string, number> = { fitness:20, sleep:18, nutrition:18, water:12, stress:14, skincare:10 }
      let w = 'fitness', wr = 1
      for (const [k, v] of Object.entries(scores)) {
        const r = v / maxes[k]
        if (r < wr) { wr = r; w = k }
      }
      return w
    }

    const weak = calculateWeakest()
    setWeakest(weak)

    // Load missions for weakest category
    const todayMissions = MISSION_BANK[weak] || MISSION_BANK.fitness
    setMissions(todayMissions)

    // Load score with day penalty
    const stored = getStoredScore()
    const currentScore = applyDayPenalty(stored)
    setLiveScore(currentScore)

    // Load streak
    const st = localStorage.getItem('glowup_streak')
    setStreak(st ? Number(st) : 0)

    // Restore today's checked missions
    const savedChecked = localStorage.getItem('glowup_checked_today')
    const savedDate = localStorage.getItem('glowup_checked_date')
    if (savedChecked && savedDate === new Date().toDateString()) {
      setChecked(JSON.parse(savedChecked))
    } else {
      // New day, reset checks
      localStorage.removeItem('glowup_checked_today')
    }
  }, [])

  const toggleMission = (id: string) => {
    const newChecked = { ...checked, [id]: !checked[id] }
    setChecked(newChecked)
    localStorage.setItem('glowup_checked_today', JSON.stringify(newChecked))
    localStorage.setItem('glowup_checked_date', new Date().toDateString())

    const delta = newChecked[id] ? 1 : -1
    const newScore = Math.max(0, Math.min(100, liveScore + delta))
    setLiveScore(newScore)
    setScoreVariation(v => v + delta)
    saveScore(newScore)

    // Check if all done
    const doneCount = Object.values(newChecked).filter(Boolean).length
    if (doneCount === missions.length) {
      const newStreak = streak + 1
      setStreak(newStreak)
      localStorage.setItem('glowup_streak', String(newStreak))
    }
  }

  const doneCount = Object.values(checked).filter(Boolean).length
  const allDone = doneCount === missions.length && missions.length > 0

  if (!profile) return (
    <div style={{ height:'100svh', background:'#FFFFFF', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ width:24, height:24, border:'2px solid rgba(0,0,0,0.08)', borderTopColor:BLUE, borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  const scoreColor = liveScore >= 70 ? '#30D158' : liveScore >= 45 ? '#FF9F0A' : '#FF453A'
  const circumference = 2 * Math.PI * 38
  const weakLabels: Record<string, string> = {
    fitness: 'Fitness', sleep: 'Sleep', nutrition: 'Nutrition',
    water: 'Hydration', stress: 'Stress', skincare: 'Skincare', bmi: 'BMI'
  }

  return (
    <main style={{ height:'100svh', background:'#FFFFFF', fontFamily:sf, overflow:'hidden', display:'flex', flexDirection:'column' }}>

      {/* NAV */}
      <nav style={{ flexShrink:0, padding:'56px 20px 12px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <button onClick={() => router.push('/dashboard')}
          style={{ background:'none', border:'none', color:'rgba(0,0,0,0.55)', fontSize:14, cursor:'pointer', fontFamily:sf }}>
          ← Score
        </button>
        <span style={{ fontSize:16, fontWeight:700, color:'#1A1A1A', letterSpacing:-0.5 }}>Today</span>
        <div style={{ display:'flex', alignItems:'center', gap:6, background:'rgba(255,149,10,0.12)', border:'0.5px solid rgba(255,149,10,0.25)', padding:'4px 10px', borderRadius:20 }}>
          <span style={{ fontSize:12 }}>🔥</span>
          <span style={{ fontSize:12, fontWeight:600, color:'#FF9F0A' }}>{streak}d</span>
        </div>
      </nav>

      <div style={{ flex:1, overflowY:'auto', padding:'0 20px 40px' }}>

        {/* SCORE + DATE */}
        <div style={{ display:'flex', alignItems:'center', gap:16, padding:'12px 16px', background:'rgba(0,0,0,0.03)', border:'0.5px solid rgba(0,0,0,0.07)', borderRadius:16, marginBottom:16 }}>
          <svg width={90} height={90} viewBox="0 0 90 90">
            <circle cx="45" cy="45" r="38" fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="6"/>
            <circle cx="45" cy="45" r="38" fill="none" stroke={scoreColor} strokeWidth="6"
              strokeLinecap="round" strokeDasharray={circumference}
              strokeDashoffset={circumference - (liveScore / 100) * circumference}
              transform="rotate(-90 45 45)" style={{ transition:'stroke-dashoffset 0.3s ease' }}/>
            <text x="45" y="41" textAnchor="middle" dominantBaseline="middle"
              style={{ fontFamily:sf, fontWeight:700, fontSize:20, fill:'#1A1A1A', letterSpacing:-1 }}>{liveScore}</text>
            <text x="45" y="55" textAnchor="middle" dominantBaseline="middle"
              style={{ fontFamily:sf, fontSize:7, fill:'rgba(0,0,0,0.3)' }}>/ 100</text>
          </svg>
          <div style={{ flex:1 }}>
            <p style={{ fontSize:12, color:'rgba(0,0,0,0.45)', marginBottom:4 }}>
              {new Date().toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric' })}
            </p>
            {scoreVariation !== 0 && (
              <div style={{ display:'inline-flex', alignItems:'center', gap:4, background: scoreVariation > 0 ? 'rgba(48,209,88,0.12)' : 'rgba(255,69,58,0.12)', border:`0.5px solid ${scoreVariation > 0 ? 'rgba(48,209,88,0.3)' : 'rgba(255,69,58,0.3)'}`, borderRadius:20, padding:'3px 10px', marginBottom:6 }}>
                <span style={{ fontSize:12, fontWeight:700, color: scoreVariation > 0 ? '#30D158' : '#FF453A' }}>
                  {scoreVariation > 0 ? '+' : ''}{scoreVariation} pts
                </span>
              </div>
            )}
            <p style={{ fontSize:13, color:'rgba(0,0,0,0.65)', lineHeight:1.4, letterSpacing:-0.2 }}>
              {allDone
                ? 'All missions complete 🎉 Great job today!'
                : `${doneCount}/${missions.length} missions done. Focus: ${weakLabels[weakest]}.`}
            </p>
          </div>
        </div>

        {/* FOCUS AREA */}
        <div style={{ padding:'12px 16px', background:'rgba(10,132,255,0.06)', border:'0.5px solid rgba(10,132,255,0.15)', borderRadius:12, marginBottom:16 }}>
          <p style={{ fontSize:11, color:BLUE, fontWeight:600, letterSpacing:0.3, textTransform:'uppercase', marginBottom:4 }}>Today's focus</p>
          <p style={{ fontSize:13, color:'#1A1A1A', fontWeight:500, letterSpacing:-0.2 }}>
            Your weakest area is <span style={{ color:BLUE, fontWeight:700 }}>{weakLabels[weakest]}</span>. Complete these missions to improve it.
          </p>
        </div>

        {/* MISSIONS */}
        <p style={{ fontSize:11, color:'rgba(0,0,0,0.3)', letterSpacing:0.5, textTransform:'uppercase', marginBottom:10 }}>
          Daily missions · {doneCount}/{missions.length}
        </p>

        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {missions.map(m => {
            const done = checked[m.id]
            return (
              <button key={m.id} onClick={() => toggleMission(m.id)}
                style={{
                  width:'100%', background: done ? 'rgba(48,209,88,0.08)' : 'rgba(0,0,0,0.04)',
                  border:`0.5px solid ${done ? 'rgba(48,209,88,0.2)' : 'rgba(0,0,0,0.07)'}`,
                  borderRadius:14, padding:'14px 16px', display:'flex', alignItems:'center', gap:12,
                  cursor:'pointer', fontFamily:sf, transition:'all 0.15s', textAlign:'left',
                }}>
                <span style={{ fontSize:22, flexShrink:0 }}>{m.icon}</span>
                <div style={{ flex:1 }}>
                  <p style={{ fontSize:14, fontWeight:600, color: done ? 'rgba(0,0,0,0.35)' : '#1A1A1A', letterSpacing:-0.3, textDecoration: done ? 'line-through' : 'none' }}>{m.text}</p>
                  <p style={{ fontSize:11, color:'rgba(0,0,0,0.3)', marginTop:2 }}>+1 pt</p>
                </div>
                <div style={{
                  width:24, height:24, borderRadius:'50%',
                  background: done ? '#30D158' : 'rgba(0,0,0,0.07)',
                  border:`0.5px solid ${done ? '#30D158' : 'rgba(0,0,0,0.12)'}`,
                  display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
                  transition:'all 0.15s',
                }}>
                  {done && <span style={{ fontSize:13, color:'#fff', fontWeight:700 }}>✓</span>}
                </div>
              </button>
            )
          })}
        </div>

        {/* ALL DONE MESSAGE */}
        {allDone && (
          <div style={{ marginTop:16, padding:'16px', background:'rgba(48,209,88,0.08)', border:'0.5px solid rgba(48,209,88,0.2)', borderRadius:16, textAlign:'center' }}>
            <p style={{ fontSize:24, marginBottom:8 }}>🎉</p>
            <p style={{ fontSize:14, fontWeight:600, color:'#30D158', letterSpacing:-0.3, marginBottom:4 }}>Perfect day!</p>
            <p style={{ fontSize:13, color:'rgba(0,0,0,0.55)', lineHeight:1.5 }}>Come back tomorrow to keep your streak going. Missing a day costs you -2 points.</p>
          </div>
        )}

        {/* SCORE TIP */}
        <div style={{ marginTop:16, padding:'12px 16px', background:'rgba(0,0,0,0.03)', borderRadius:12 }}>
          <p style={{ fontSize:11, color:'rgba(0,0,0,0.35)', lineHeight:1.5, textAlign:'center' }}>
            Each mission = +1 point · Missing a day = -2 points · 3-day streak = +1 bonus/day
          </p>
        </div>

      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        ::-webkit-scrollbar { display: none; }
        * { box-sizing:border-box; margin:0; padding:0; }
      `}</style>
    </main>
  )
}
