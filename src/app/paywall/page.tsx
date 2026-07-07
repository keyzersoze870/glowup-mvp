'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const sf = `-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif`
const BLUE = '#0A84FF'

// Same scoring logic as dashboard
function calculateScore(profile: any) {
  let fitness = 0, sleep = 0, nutrition = 0, water = 0, stress = 0, skincare = 0, bmiScore = 0

  if (profile.sport === '5+') fitness = 20
  else if (profile.sport === '3-4') fitness = 15
  else if (profile.sport === '1-2') fitness = 8

  if (profile.sleep === '7-8') sleep = 18
  else if (profile.sleep === '8+') sleep = 14
  else if (profile.sleep === '5-6') sleep = 6

  if (profile.nutrition === 'excellent') nutrition = 18
  else if (profile.nutrition === 'good') nutrition = 14
  else if (profile.nutrition === 'average') nutrition = 7

  if (profile.eau === '2+') water = 12
  else if (profile.eau === '1.5-2') water = 9
  else if (profile.eau === '1-1.5') water = 4

  if (profile.stress === 'low') stress = 14
  else if (profile.stress === 'moderate') stress = 10
  else if (profile.stress === 'high') stress = 4

  if (profile.skincare === 'complete') skincare = 10
  else if (profile.skincare === 'basic') skincare = 5

  const bmi = profile.poids && profile.taille ? (profile.poids * 703) / (profile.taille ** 2) : 22
  if (bmi >= 18.5 && bmi < 25) bmiScore = 8
  else if ((bmi >= 25 && bmi < 30) || bmi < 18.5) bmiScore = 4
  else bmiScore = 1

  const total = fitness + sleep + nutrition + water + stress + skincare + bmiScore
  return total
}

function getPercentileAbove(score: number): number {
  if (score <= 0) return 99
  if (score >= 100) return 1
  return Math.round(100 - (score * 0.88 + (score / 100) * 12))
}

export default function PaywallPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [score, setScore] = useState(0)
  const [displayed, setDisplayed] = useState(0)
  const [showPlans, setShowPlans] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<'weekly'|'monthly'|'yearly'>('weekly')

  useEffect(() => {
    const p = localStorage.getItem('glowup_profile')
    if (!p) { router.push('/onboarding'); return }
    const parsed = JSON.parse(p)
    setProfile(parsed)
    const s = calculateScore(parsed)
    setScore(s)

    // Save score
    localStorage.setItem('glowup_live_score', JSON.stringify({
      score: s,
      lastDate: new Date().toDateString(),
    }))
    localStorage.setItem('glowup_score', JSON.stringify({ total: s }))

    // Animate score reveal
    let cur = 0
    const go = () => {
      cur += Math.ceil((s - cur) / 8)
      setDisplayed(Math.min(cur, s))
      if (cur < s) requestAnimationFrame(go)
      else setTimeout(() => setShowPlans(true), 600)
    }
    setTimeout(() => requestAnimationFrame(go), 800)
  }, [])

  if (!profile) return (
    <div style={{ height:'100svh', background:'#FFFFFF', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ width:24, height:24, border:'2px solid rgba(0,0,0,0.08)', borderTopColor:BLUE, borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  const pctAbove = Math.max(getPercentileAbove(score), score >= 76 ? 15 : 0)
  const scoreColor = score >= 70 ? '#30D158' : score >= 45 ? '#FF9F0A' : '#FF453A'
  const r = 54
  const c = 2 * Math.PI * r
  const offset = c - (displayed / 100) * c

  // Bell curve points
  const w = 300, h = 100
  const bellPts: string[] = []
  for (let i = 0; i <= w; i++) {
    const x = (i / w) * 6 - 3
    const y = Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI)
    bellPts.push(`${i},${h - y * h * 2.2}`)
  }
  const markerPos = Math.min(Math.max(score, 5), 95)
  const markerX = (markerPos / 100) * w
  const mx = (markerPos / 100) * 6 - 3
  const markerY = h - (Math.exp(-0.5 * mx * mx) / Math.sqrt(2 * Math.PI)) * h * 2.2

  const plans = {
    weekly: { price: '$3.99', per: '/week', total: '$3.99 billed weekly', savings: '' },
    monthly: { price: '$9.99', per: '/month', total: '$9.99 billed monthly', savings: 'Save 38%' },
    yearly: { price: '$39.99', per: '/year', total: '$39.99 billed yearly', savings: 'Save 81%' },
  }

  return (
    <main style={{ minHeight:'100svh', background:'#FFFFFF', fontFamily:sf, display:'flex', flexDirection:'column', alignItems:'center', padding:'60px 24px 40px', overflow:'auto' }}>

      {/* SCORE REVEAL */}
      <p style={{ fontSize:13, color:'rgba(0,0,0,0.45)', letterSpacing:-0.2, marginBottom:8 }}>
        {profile.prenom}, your Glow Up Score is
      </p>

      <svg width={160} height={160} viewBox="0 0 120 120" style={{ marginBottom:4 }}>
        <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="7"/>
        <circle cx="60" cy="60" r={r} fill="none" stroke={scoreColor} strokeWidth="7"
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={offset}
          transform="rotate(-90 60 60)" style={{ transition:'stroke-dashoffset 0.03s' }}/>
        <text x="60" y="57" textAnchor="middle" dominantBaseline="middle"
          style={{ fontFamily:sf, fontWeight:700, fontSize:28, fill:'#1A1A1A', letterSpacing:-1 }}>{displayed}</text>
        <text x="60" y="72" textAnchor="middle" dominantBaseline="middle"
          style={{ fontFamily:sf, fontSize:8, fill:'rgba(0,0,0,0.3)', letterSpacing:0.5 }}>/ 100</text>
      </svg>

      {/* BELL CURVE */}
      <div style={{ width:'100%', maxWidth:300, marginBottom:8 }}>
        <svg viewBox={`0 0 ${w} ${h + 30}`} style={{ width:'100%', height:'auto' }}>
          <defs>
            <linearGradient id="payGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={scoreColor} stopOpacity="0.3" />
              <stop offset="100%" stopColor={scoreColor} stopOpacity="0.03" />
            </linearGradient>
          </defs>
          <polygon points={`0,${h} ${bellPts.join(' ')} ${w},${h}`} fill="url(#payGrad)" />
          <polyline points={bellPts.join(' ')} fill="none" stroke={scoreColor} strokeWidth="2" strokeLinecap="round" />
          <line x1={markerX} y1={markerY} x2={markerX} y2={h} stroke="#1A1A1A" strokeWidth="1.5" strokeDasharray="3,3" />
          <polygon points={`${markerX-6},${h+4} ${markerX+6},${h+4} ${markerX},${h-2}`} fill="#1A1A1A" />
          <text x={markerX} y={h+20} textAnchor="middle" style={{ fontSize:10, fontWeight:600, fill:'#1A1A1A', fontFamily:sf }}>You're here</text>
        </svg>
      </div>

      <p style={{ fontSize:13, color:'#FF453A', fontWeight:600, letterSpacing:-0.2, marginBottom:4 }}>
        {pctAbove}% of users scored higher than you.
      </p>
      <p style={{ fontSize:12, color:'rgba(0,0,0,0.45)', marginBottom:24, textAlign:'center', lineHeight:1.5, maxWidth:280 }}>
        Unlock your personalized plan to improve your score and track your progress daily.
      </p>

      {/* BLURRED BREAKDOWN PREVIEW */}
      <div style={{ width:'100%', maxWidth:340, marginBottom:20, position:'relative' }}>
        <div style={{ filter:'blur(6px)', pointerEvents:'none', userSelect:'none', opacity:0.6 }}>
          {[
            { icon:'🏋️', label:'Fitness', val:'8', max:'20', color:'#FF9F0A' },
            { icon:'🌙', label:'Sleep', val:'6', max:'18', color:'#BF5AF2' },
            { icon:'🥗', label:'Nutrition', val:'7', max:'18', color:'#30D158' },
          ].map(c => (
            <div key={c.label} style={{ background:'rgba(0,0,0,0.04)', borderRadius:12, padding:'12px 14px', marginBottom:6, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ fontSize:16 }}>{c.icon}</span>
                <span style={{ fontSize:13, fontWeight:600, color:'#1A1A1A' }}>{c.label}</span>
              </div>
              <span style={{ fontSize:16, fontWeight:700, color:c.color }}>{c.val}<span style={{ fontSize:10, color:'rgba(0,0,0,0.3)' }}>/{c.max}</span></span>
            </div>
          ))}
        </div>
        <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div style={{ background:'rgba(255,255,255,0.9)', borderRadius:12, padding:'8px 16px', display:'flex', alignItems:'center', gap:6 }}>
            <span style={{ fontSize:14 }}>🔒</span>
            <span style={{ fontSize:12, fontWeight:600, color:'#1A1A1A' }}>Subscribe to reveal full breakdown</span>
          </div>
        </div>
      </div>

      {/* PRICING PLANS */}
      {showPlans && (
        <div style={{ width:'100%', maxWidth:340, animation:'fadeIn 0.5s ease' }}>
          <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:16 }}>
            {(['weekly', 'monthly', 'yearly'] as const).map(plan => (
              <button key={plan} onClick={() => setSelectedPlan(plan)}
                style={{
                  width:'100%', padding:'14px 16px', background: selectedPlan === plan ? 'rgba(10,132,255,0.08)' : 'rgba(0,0,0,0.04)',
                  border:`1.5px solid ${selectedPlan === plan ? BLUE : 'rgba(0,0,0,0.08)'}`,
                  borderRadius:14, cursor:'pointer', fontFamily:sf, display:'flex', alignItems:'center', justifyContent:'space-between',
                  transition:'all 0.15s',
                }}>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{
                    width:20, height:20, borderRadius:'50%',
                    border:`2px solid ${selectedPlan === plan ? BLUE : 'rgba(0,0,0,0.15)'}`,
                    background: selectedPlan === plan ? BLUE : 'transparent',
                    display:'flex', alignItems:'center', justifyContent:'center',
                  }}>
                    {selectedPlan === plan && <div style={{ width:6, height:6, borderRadius:'50%', background:'#fff' }} />}
                  </div>
                  <div style={{ textAlign:'left' }}>
                    <p style={{ fontSize:15, fontWeight:600, color:'#1A1A1A', letterSpacing:-0.3, textTransform:'capitalize' }}>{plan}</p>
                    <p style={{ fontSize:11, color:'rgba(0,0,0,0.35)' }}>{plans[plan].total}</p>
                  </div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <p style={{ fontSize:17, fontWeight:700, color: selectedPlan === plan ? BLUE : '#1A1A1A', letterSpacing:-0.5 }}>{plans[plan].price}</p>
                  {plans[plan].savings && <p style={{ fontSize:10, fontWeight:600, color:'#30D158' }}>{plans[plan].savings}</p>}
                </div>
              </button>
            ))}
          </div>

          {/* CTA */}
          <button
            style={{ width:'100%', padding:'16px', background:BLUE, border:'none', borderRadius:14, color:'#FFFFFF', fontSize:16, fontWeight:600, cursor:'pointer', fontFamily:sf, letterSpacing:-0.3, marginBottom:8 }}>
            Start free trial — then {plans[selectedPlan].price}{plans[selectedPlan].per}
          </button>

          <p style={{ fontSize:10, color:'rgba(0,0,0,0.2)', textAlign:'center', marginTop:8, lineHeight:1.5 }}>
            Cancel anytime. No commitment. Recurring billing until canceled.
          </p>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(10px) } to { opacity:1; transform:translateY(0) } }
        ::-webkit-scrollbar { display: none; }
        * { box-sizing:border-box; margin:0; padding:0; }
      `}</style>
    </main>
  )
}
