'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const sf = `-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif`
const BLUE = '#0A84FF'

// ─── ALL MISSIONS BY CATEGORY ───
const FOCUS_MISSIONS: Record<string, Array<Array<{id: string, text: string, icon: string}>>> = {
  fitness: [
    [
      { id:'f1a', text:'30 min workout — any type', icon:'🏋️' },
      { id:'f1b', text:'10,000 steps today', icon:'🚶' },
      { id:'f1c', text:'5 min stretching morning + evening', icon:'🧘' },
      { id:'f1d', text:'Take the stairs all day', icon:'🦵' },
      { id:'f1e', text:'15 min walk after dinner', icon:'🌤️' },
    ],
    [
      { id:'f2a', text:'20 min HIIT or cardio session', icon:'🏃' },
      { id:'f2b', text:'50 squats throughout the day', icon:'🦵' },
      { id:'f2c', text:'10 min yoga flow', icon:'🧘' },
      { id:'f2d', text:'Walk or bike instead of driving', icon:'🚴' },
      { id:'f2e', text:'30 sec plank x 5 sets', icon:'💪' },
    ],
  ],
  sleep: [
    [
      { id:'s1a', text:'In bed by 10:30pm tonight', icon:'🛏️' },
      { id:'s1b', text:'No screen 30 min before bed', icon:'📵' },
      { id:'s1c', text:'No caffeine after 2pm', icon:'☕' },
      { id:'s1d', text:'7+ hours of sleep tonight', icon:'🌙' },
      { id:'s1e', text:'5 min breathing exercise before bed', icon:'🫁' },
    ],
    [
      { id:'s2a', text:'Wake up at the same time as yesterday', icon:'⏰' },
      { id:'s2b', text:'Dim all lights 1 hour before bed', icon:'💡' },
      { id:'s2c', text:'No heavy meal after 8pm', icon:'🍽️' },
      { id:'s2d', text:'Read 10 pages instead of scrolling', icon:'📖' },
      { id:'s2e', text:'Bedroom temperature below 70°F', icon:'❄️' },
    ],
  ],
  nutrition: [
    [
      { id:'n1a', text:'Eat a balanced meal with protein + veggies', icon:'🥗' },
      { id:'n1b', text:'No processed food today', icon:'🚫' },
      { id:'n1c', text:'Eat a fruit or vegetable snack', icon:'🍎' },
      { id:'n1d', text:'Cook one meal from scratch', icon:'👩‍🍳' },
      { id:'n1e', text:'No sugary drinks today', icon:'🥤' },
    ],
    [
      { id:'n2a', text:'Eat 3 different colored vegetables', icon:'🥦' },
      { id:'n2b', text:'30g+ of protein at breakfast', icon:'🍳' },
      { id:'n2c', text:'Replace one snack with nuts or fruit', icon:'🥜' },
      { id:'n2d', text:'No added sugar today', icon:'🍬' },
      { id:'n2e', text:'Drink a green smoothie or juice', icon:'🥬' },
    ],
  ],
  water: [
    [
      { id:'w1a', text:'Drink 8 cups of water today', icon:'💧' },
      { id:'w1b', text:'Start the morning with a full glass', icon:'🌅' },
      { id:'w1c', text:'Carry a water bottle all day', icon:'🫗' },
      { id:'w1d', text:'Drink a glass before each meal', icon:'🥛' },
      { id:'w1e', text:'Replace one soda or coffee with water', icon:'♻️' },
    ],
    [
      { id:'w2a', text:'Finish 1 liter before noon', icon:'⏳' },
      { id:'w2b', text:'Set a water reminder every 2 hours', icon:'⏰' },
      { id:'w2c', text:'Drink herbal tea instead of coffee', icon:'🍵' },
      { id:'w2d', text:'Add lemon or cucumber to your water', icon:'🍋' },
      { id:'w2e', text:'No alcohol today — hydrate only', icon:'🚫' },
    ],
  ],
  stress: [
    [
      { id:'st1a', text:'5 min meditation or deep breathing', icon:'🧘' },
      { id:'st1b', text:'Write 3 things you are grateful for', icon:'📝' },
      { id:'st1c', text:'10 min break with no phone', icon:'📵' },
      { id:'st1d', text:'Go outside for fresh air for 15 min', icon:'🌿' },
      { id:'st1e', text:'Listen to calming music for 10 min', icon:'🎵' },
    ],
    [
      { id:'st2a', text:'Journal for 5 minutes about your day', icon:'📓' },
      { id:'st2b', text:'Say no to one thing that drains you', icon:'🙅' },
      { id:'st2c', text:'Take 3 deep breaths before each meal', icon:'🫁' },
      { id:'st2d', text:'Stretch for 5 min during a break', icon:'🤸' },
      { id:'st2e', text:'Put your phone on Do Not Disturb for 1h', icon:'🔇' },
    ],
  ],
  skincare: [
    [
      { id:'sk1a', text:'Morning routine: cleanse + moisturize', icon:'🧴' },
      { id:'sk1b', text:'Apply SPF before going outside', icon:'☀️' },
      { id:'sk1c', text:'Evening routine: cleanse + treat', icon:'✨' },
      { id:'sk1d', text:'Don\'t touch your face today', icon:'🙅' },
      { id:'sk1e', text:'Change your pillowcase', icon:'🛏️' },
    ],
    [
      { id:'sk2a', text:'Double cleanse tonight (oil + foam)', icon:'🫧' },
      { id:'sk2b', text:'Apply a hydrating face mask', icon:'🎭' },
      { id:'sk2c', text:'Moisturize within 60 sec after shower', icon:'⏱️' },
      { id:'sk2d', text:'Clean your makeup brushes', icon:'🖌️' },
      { id:'sk2e', text:'Drink extra water for skin hydration', icon:'💧' },
    ],
  ],
}

// ─── BONUS ACTIONS (3 general ones that rotate) ───
const BONUS_SETS = [
  [
    { id:'b1a', text:'30 min of movement — walk, run, or dance', icon:'🏃', cat:'Fitness' },
    { id:'b1b', text:'Drink 8 cups of water', icon:'💧', cat:'Hydration' },
    { id:'b1c', text:'Morning + evening skincare routine', icon:'✨', cat:'Skincare' },
  ],
  [
    { id:'b2a', text:'10 min stretching or yoga', icon:'🧘', cat:'Fitness' },
    { id:'b2b', text:'Eat at least 2 servings of vegetables', icon:'🥦', cat:'Nutrition' },
    { id:'b2c', text:'Apply SPF before going outside', icon:'☀️', cat:'Skincare' },
  ],
  [
    { id:'b3a', text:'Take 10,000 steps today', icon:'🚶', cat:'Fitness' },
    { id:'b3b', text:'No sugary drinks — water only', icon:'🥤', cat:'Hydration' },
    { id:'b3c', text:'5 min gratitude journaling', icon:'📝', cat:'Mindset' },
  ],
  [
    { id:'b4a', text:'20 min workout of your choice', icon:'💪', cat:'Fitness' },
    { id:'b4b', text:'Start the day with a full glass of water', icon:'🌅', cat:'Hydration' },
    { id:'b4c', text:'Don\'t touch your face today', icon:'🙅', cat:'Skincare' },
  ],
  [
    { id:'b5a', text:'Walk or bike instead of driving', icon:'🚴', cat:'Fitness' },
    { id:'b5b', text:'Cook a healthy meal from scratch', icon:'👩‍🍳', cat:'Nutrition' },
    { id:'b5c', text:'10 min phone-free break outside', icon:'🌿', cat:'Wellness' },
  ],
  [
    { id:'b6a', text:'50 bodyweight squats throughout the day', icon:'🦵', cat:'Fitness' },
    { id:'b6b', text:'Finish 1 liter of water before noon', icon:'⏳', cat:'Hydration' },
    { id:'b6c', text:'Read 10 pages of a book before bed', icon:'📖', cat:'Mindset' },
  ],
  [
    { id:'b7a', text:'Active rest day — gentle walk or yoga', icon:'🧘', cat:'Fitness' },
    { id:'b7b', text:'Eat 3 different colored vegetables', icon:'🥗', cat:'Nutrition' },
    { id:'b7c', text:'Apply a face mask or deep treatment', icon:'🎭', cat:'Skincare' },
  ],
]

// ─── HELPERS ───
function getDayOfYear(): number {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 0)
  return Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
}

function getStoredScore(): { score: number, lastDate: string } {
  const raw = localStorage.getItem('glowup_live_score')
  if (raw) return JSON.parse(raw)
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
  const last = new Date(stored.lastDate)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24))
  const penalty = Math.min(diffDays * 2, 15)
  const newScore = Math.max(0, stored.score - penalty)
  saveScore(newScore)
  return newScore
}

export default function TodayPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [focusCat, setFocusCat] = useState('')
  const [focusMissions, setFocusMissions] = useState<Array<{id:string, text:string, icon:string}>>([])
  const [bonusMissions, setBonusMissions] = useState<Array<{id:string, text:string, icon:string, cat:string}>>([])
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const [liveScore, setLiveScore] = useState(50)
  const [streak, setStreak] = useState(0)
  const [scoreVariation, setScoreVariation] = useState(0)

  useEffect(() => {
    const p = localStorage.getItem('glowup_profile')
    if (!p) { router.push('/onboarding'); return }
    setProfile(JSON.parse(p))

    // Rotate focus category daily
    const cats = ['fitness', 'sleep', 'nutrition', 'water', 'stress', 'skincare']
    const dayIdx = getDayOfYear()
    const todayCat = cats[dayIdx % cats.length]
    setFocusCat(todayCat)

    // Pick mission set (alternates between set 0 and 1)
    const setIdx = Math.floor(dayIdx / cats.length) % 2
    const missions = FOCUS_MISSIONS[todayCat]?.[setIdx] || FOCUS_MISSIONS[todayCat]?.[0] || []
    setFocusMissions(missions)

    // Pick bonus set
    const bonusIdx = dayIdx % BONUS_SETS.length
    setBonusMissions(BONUS_SETS[bonusIdx])

    // Load score
    const stored = getStoredScore()
    const currentScore = applyDayPenalty(stored)
    setLiveScore(currentScore)

    // Load streak
    const st = localStorage.getItem('glowup_streak')
    setStreak(st ? Number(st) : 0)

    // Restore today's checked
    const savedChecked = localStorage.getItem('glowup_checked_today')
    const savedDate = localStorage.getItem('glowup_checked_date')
    if (savedChecked && savedDate === new Date().toDateString()) {
      setChecked(JSON.parse(savedChecked))
    } else {
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

    // Check if all done (focus + bonus)
    const totalMissions = focusMissions.length + bonusMissions.length
    const doneCount = Object.values(newChecked).filter(Boolean).length
    if (doneCount === totalMissions) {
      const newStreak = streak + 1
      setStreak(newStreak)
      localStorage.setItem('glowup_streak', String(newStreak))
    }
  }

  const focusDone = focusMissions.filter(m => checked[m.id]).length
  const bonusDone = bonusMissions.filter(m => checked[m.id]).length
  const totalDone = focusDone + bonusDone
  const totalMissions = focusMissions.length + bonusMissions.length
  const allDone = totalDone === totalMissions && totalMissions > 0

  const catLabels: Record<string, string> = {
    fitness:'Fitness', sleep:'Sleep', nutrition:'Nutrition',
    water:'Hydration', stress:'Stress Management', skincare:'Skincare'
  }
  const catColors: Record<string, string> = {
    fitness:'#FF9F0A', sleep:'#BF5AF2', nutrition:'#30D158',
    water:BLUE, stress:'#FF453A', skincare:'#64D2FF'
  }

  if (!profile) return (
    <div style={{ height:'100svh', background:'#FFFFFF', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ width:24, height:24, border:'2px solid rgba(0,0,0,0.08)', borderTopColor:BLUE, borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  const scoreColor = liveScore >= 70 ? '#30D158' : liveScore >= 45 ? '#FF9F0A' : '#FF453A'
  const circumference = 2 * Math.PI * 38
  const focusColor = catColors[focusCat] || BLUE

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
              {allDone ? 'All missions complete 🎉' : `${totalDone}/${totalMissions} missions done`}
            </p>
          </div>
        </div>

        {/* TODAY'S FOCUS */}
        <div style={{ padding:'12px 16px', background:`${focusColor}10`, border:`0.5px solid ${focusColor}25`, borderRadius:12, marginBottom:12 }}>
          <p style={{ fontSize:11, color:focusColor, fontWeight:600, letterSpacing:0.3, textTransform:'uppercase', marginBottom:4 }}>Today's focus</p>
          <p style={{ fontSize:14, color:'#1A1A1A', fontWeight:600, letterSpacing:-0.2 }}>
            {catLabels[focusCat]}
          </p>
        </div>

        <p style={{ fontSize:11, color:'rgba(0,0,0,0.3)', letterSpacing:0.5, textTransform:'uppercase', marginBottom:10 }}>
          Focus missions · {focusDone}/{focusMissions.length}
        </p>

        <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:24 }}>
          {focusMissions.map(m => {
            const done = checked[m.id]
            return (
              <button key={m.id} onClick={() => toggleMission(m.id)}
                style={{
                  width:'100%', background: done ? 'rgba(48,209,88,0.08)' : 'rgba(0,0,0,0.04)',
                  border:`0.5px solid ${done ? 'rgba(48,209,88,0.2)' : 'rgba(0,0,0,0.07)'}`,
                  borderRadius:14, padding:'14px 16px', display:'flex', alignItems:'center', gap:12,
                  cursor:'pointer', fontFamily:sf, transition:'all 0.15s', textAlign:'left',
                }}>
                <span style={{ fontSize:20, flexShrink:0 }}>{m.icon}</span>
                <div style={{ flex:1 }}>
                  <p style={{ fontSize:14, fontWeight:600, color: done ? 'rgba(0,0,0,0.35)' : '#1A1A1A', letterSpacing:-0.3, textDecoration: done ? 'line-through' : 'none' }}>{m.text}</p>
                  <p style={{ fontSize:11, color:'rgba(0,0,0,0.3)', marginTop:2 }}>+1 pt</p>
                </div>
                <div style={{
                  width:24, height:24, borderRadius:'50%',
                  background: done ? '#30D158' : 'rgba(0,0,0,0.07)',
                  border:`0.5px solid ${done ? '#30D158' : 'rgba(0,0,0,0.12)'}`,
                  display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
                }}>
                  {done && <span style={{ fontSize:13, color:'#fff', fontWeight:700 }}>✓</span>}
                </div>
              </button>
            )
          })}
        </div>

        {/* BONUS ACTIONS */}
        <p style={{ fontSize:11, color:'rgba(0,0,0,0.3)', letterSpacing:0.5, textTransform:'uppercase', marginBottom:10 }}>
          Bonus actions · {bonusDone}/{bonusMissions.length}
        </p>

        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {bonusMissions.map(m => {
            const done = checked[m.id]
            return (
              <button key={m.id} onClick={() => toggleMission(m.id)}
                style={{
                  width:'100%', background: done ? 'rgba(48,209,88,0.08)' : 'rgba(0,0,0,0.04)',
                  border:`0.5px solid ${done ? 'rgba(48,209,88,0.2)' : 'rgba(0,0,0,0.07)'}`,
                  borderRadius:14, padding:'14px 16px', display:'flex', alignItems:'center', gap:12,
                  cursor:'pointer', fontFamily:sf, transition:'all 0.15s', textAlign:'left',
                }}>
                <span style={{ fontSize:20, flexShrink:0 }}>{m.icon}</span>
                <div style={{ flex:1 }}>
                  <p style={{ fontSize:14, fontWeight:600, color: done ? 'rgba(0,0,0,0.35)' : '#1A1A1A', letterSpacing:-0.3, textDecoration: done ? 'line-through' : 'none' }}>{m.text}</p>
                  <p style={{ fontSize:11, color:'rgba(0,0,0,0.3)', marginTop:2 }}>{m.cat} · +1 pt</p>
                </div>
                <div style={{
                  width:24, height:24, borderRadius:'50%',
                  background: done ? '#30D158' : 'rgba(0,0,0,0.07)',
                  border:`0.5px solid ${done ? '#30D158' : 'rgba(0,0,0,0.12)'}`,
                  display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
                }}>
                  {done && <span style={{ fontSize:13, color:'#fff', fontWeight:700 }}>✓</span>}
                </div>
              </button>
            )
          })}
        </div>

        {/* ALL DONE */}
        {allDone && (
          <div style={{ marginTop:16, padding:'16px', background:'rgba(48,209,88,0.08)', border:'0.5px solid rgba(48,209,88,0.2)', borderRadius:16, textAlign:'center' }}>
            <p style={{ fontSize:24, marginBottom:8 }}>🎉</p>
            <p style={{ fontSize:14, fontWeight:600, color:'#30D158', letterSpacing:-0.3, marginBottom:4 }}>Perfect day!</p>
            <p style={{ fontSize:13, color:'rgba(0,0,0,0.55)', lineHeight:1.5 }}>Come back tomorrow for new missions. Missing a day costs you -2 points.</p>
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
