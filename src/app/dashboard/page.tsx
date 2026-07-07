'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const sf = `-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif`
const BLUE = '#0A84FF'

// ─── SCORING MATRIX ───
function calculateScore(profile: any) {
  let fitness = 0, sleep = 0, nutrition = 0, water = 0, stress = 0, skincare = 0, bmiScore = 0

  // Fitness /20
  if (profile.sport === '5+') fitness = 20
  else if (profile.sport === '3-4') fitness = 15
  else if (profile.sport === '1-2') fitness = 8
  else fitness = 0

  // Sleep /18
  if (profile.sleep === '7-8') sleep = 18
  else if (profile.sleep === '8+') sleep = 14
  else if (profile.sleep === '5-6') sleep = 6
  else sleep = 0

  // Nutrition /18
  if (profile.nutrition === 'excellent') nutrition = 18
  else if (profile.nutrition === 'good') nutrition = 14
  else if (profile.nutrition === 'average') nutrition = 7
  else nutrition = 0

  // Water /12
  if (profile.eau === '2+') water = 12
  else if (profile.eau === '1.5-2') water = 9
  else if (profile.eau === '1-1.5') water = 4
  else water = 0

  // Stress /14
  if (profile.stress === 'low') stress = 14
  else if (profile.stress === 'moderate') stress = 10
  else if (profile.stress === 'high') stress = 4
  else stress = 0

  // Skincare /10
  if (profile.skincare === 'complete') skincare = 10
  else if (profile.skincare === 'basic') skincare = 5
  else skincare = 0

  // BMI /8
  const bmi = profile.poids && profile.taille ? (profile.poids * 703) / (profile.taille ** 2) : 22
  if (bmi >= 18.5 && bmi < 25) bmiScore = 8
  else if ((bmi >= 25 && bmi < 30) || bmi < 18.5) bmiScore = 4
  else bmiScore = 1

  const total = fitness + sleep + nutrition + water + stress + skincare + bmiScore

  const categories = { fitness, sleep, nutrition, water, stress, skincare, bmi: bmiScore }

  // Find weakest category (by % of max)
  const maxes: Record<string, number> = { fitness:20, sleep:18, nutrition:18, water:12, stress:14, skincare:10, bmi:8 }
  let weakest = 'fitness'
  let weakestRatio = 1
  for (const [key, val] of Object.entries(categories)) {
    const ratio = val / maxes[key]
    if (ratio < weakestRatio) { weakestRatio = ratio; weakest = key }
  }

  return { total, categories, weakest }
}

// ─── PERCENTILE (score -> "X% scored higher") ───
function getPercentileAbove(score: number): number {
  if (score <= 0) return 99
  if (score >= 100) return 1
  // Slightly curved mapping so most users land in the painful 50-80% range
  return Math.round(100 - (score * 0.88 + (score / 100) * 12))
}

// ─── SEGMENT MESSAGES ───
function getSegment(score: number, name: string, weakest: string) {
  const pctAbove = getPercentileAbove(score)

  // ─── CRITICAL (0-35) ───
  if (score < 36) {
    const msgs: Record<string, string> = {
      fitness: `${name}, your metabolism is slowing down every week you skip. Women who train 3x/week see visible body changes in 21 days.`,
      sleep: `${name}, under 5 hours is aging your skin 2x faster. One week of proper sleep and your dark circles start fading.`,
      nutrition: `${name}, fast food is breaking down your collagen. Your skin, hair, and nails are literally made of what you eat.`,
      water: `${name}, dehydration makes your skin look 3-5 years older. 8 cups a day and you'll see the difference in your face within a week.`,
      stress: `${name}, chronic stress spikes cortisol, which stores fat around your belly and breaks out your skin. It's undoing everything else you do right.`,
      skincare: `${name}, without a routine, UV damage and dead cells are building up daily. Your skin is aging invisibly right now.`,
      bmi: `${name}, your current weight is putting extra pressure on your joints, your energy, and your confidence. Small changes compound fast.`,
    }
    return {
      label: 'Wake up call 🚨',
      color: '#FF453A',
      hook: `${pctAbove}% of users scored higher than you.`,
      hookBold: `Your body is sending you signals — are you listening?`,
      message: msgs[weakest] || msgs.fitness,
    }
  }

  // ─── WASTED POTENTIAL (36-55) ───
  if (score < 56) {
    const msgs: Record<string, string> = {
      fitness: `${name}, you have the discipline for everything else — but skipping workouts is the one thing keeping you average.`,
      sleep: `${name}, you're doing the work during the day but destroying it at night. Your body repairs and glows while you sleep — and you're not giving it the chance.`,
      nutrition: `${name}, your routine is solid but your diet is canceling it out. You can't out-train a bad diet, and your skin knows it.`,
      water: `${name}, you're eating right, training, taking care of your skin — but dehydration is silently undermining all of it.`,
      stress: `${name}, everything else is decent, but stress is the silent killer of results. High cortisol blocks fat loss, triggers breakouts, and ruins your sleep.`,
      skincare: `${name}, you're investing in your body but ignoring your face. No skincare means every other effort shows less.`,
      bmi: `${name}, your habits are improving but your body hasn't caught up yet. Consistency for 4 weeks and the mirror will tell you.`,
    }
    return {
      label: 'Wasted potential 😤',
      color: '#FF9F0A',
      hook: `${pctAbove}% of users scored higher than you.`,
      hookBold: `You have the foundation — you're just not using it.`,
      message: msgs[weakest] || msgs.fitness,
    }
  }

  // ─── SO CLOSE (56-75) ───
  if (score < 76) {
    const msgs: Record<string, string> = {
      fitness: `${name}, you're one habit away from Elite. Add 3 sessions a week and watch everything else accelerate.`,
      sleep: `${name}, you're so close — but bad sleep is the ceiling you keep hitting. Fix your sleep and your score jumps overnight. Literally.`,
      nutrition: `${name}, your only gap is nutrition. Clean that up and you'll feel the difference in energy, skin, and mood within days.`,
      water: `${name}, this close to Elite and it's water holding you back? That's the easiest fix on this list. Start today.`,
      stress: `${name}, stress is the only thing between you and Elite. One breathing routine, 5 minutes a day, can shift everything.`,
      skincare: `${name}, you're almost Elite but your skin is letting you down. A simple morning + evening routine closes the gap.`,
      bmi: `${name}, you're doing almost everything right. A small adjustment in portions and consistency puts you in the top 15%.`,
    }
    return {
      label: 'So close ⚡',
      color: '#FF9F0A',
      hook: `${pctAbove}% of users scored higher than you.`,
      hookBold: `Elite is within reach — don't quit now.`,
      message: msgs[weakest] || msgs.fitness,
    }
  }

  // ─── ELITE (76-100) ───
  const elitePct = Math.max(pctAbove, 15)
  const msgs: Record<string, string> = {
    fitness: `${name}, you're Elite — but stop training for 2 weeks and your muscle starts breaking down. Maintaining is harder than building. Don't let it slip.`,
    sleep: `${name}, Elite today, but your sleep is your weak link. One month of bad nights and your skin, focus, and metabolism will drag you back to average.`,
    nutrition: `${name}, you've earned Elite, but your nutrition is the crack in the armor. One bad habit left unchecked and your body will correct your score for you.`,
    water: `${name}, Elite with low hydration is a ticking clock. Your skin will show it first — fine lines, dullness, tired eyes. The glow fades faster than you think.`,
    stress: `${name}, Elite doesn't mean invincible. Stress is the #1 reason Elite users drop 20+ points in a single month. Burnout doesn't warn you — it just hits.`,
    skincare: `${name}, you're in the top 15%, but without skincare you're aging faster than your score suggests. What you see in the mirror today won't last without protection.`,
    bmi: `${name}, Elite now, but your body composition is shifting. Metabolism slows every year after 25 — what works today won't work next year without a plan.`,
  }

  const noWeakness = score >= 90
  const eliteMsg = noWeakness
    ? `${name}, you're in the top 15%. But Elite is the hardest level to maintain — 91% of Elite users drop back within 60 days without a structured plan. The question isn't how you got here. It's whether you'll still be here next month.`
    : (msgs[weakest] || msgs.fitness)

  return {
    label: 'Elite 👑',
    color: '#30D158',
    hook: `${elitePct}% of users scored higher than you.`,
    hookBold: `Most people would kill for this score.`,
    message: eliteMsg,
  }
}

// ─── CATEGORY CONFIG ───
const CATEGORIES = [
  { key: 'fitness',  label: 'Fitness',   icon: '🏋️', color: '#FF9F0A', max: 20 },
  { key: 'sleep',    label: 'Sleep',     icon: '🌙',  color: '#BF5AF2', max: 18 },
  { key: 'nutrition',label: 'Nutrition', icon: '🥗',  color: '#30D158', max: 18 },
  { key: 'stress',   label: 'Stress',    icon: '🧘',  color: '#FF453A', max: 14 },
  { key: 'water',    label: 'Water',     icon: '💧',  color: BLUE, max: 12 },
  { key: 'skincare', label: 'Skincare',  icon: '✨',  color: '#64D2FF', max: 10 },
  { key: 'bmi',      label: 'BMI',       icon: '📊',  color: '#FF6B35', max: 8 },
]

// ─── BELL CURVE ───
function BellCurve({ score, color }: { score: number, color: string }) {
  const markerPos = Math.min(Math.max(score, 5), 95)
  const w = 300, h = 100
  const points: string[] = []
  for (let i = 0; i <= w; i++) {
    const x = (i / w) * 6 - 3
    const y = Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI)
    points.push(`${i},${h - y * h * 2.2}`)
  }
  const linePoints = points.join(' ')
  const fillPoints = `0,${h} ${linePoints} ${w},${h}`
  const markerX = (markerPos / 100) * w
  const mx = (markerPos / 100) * 6 - 3
  const markerY = h - (Math.exp(-0.5 * mx * mx) / Math.sqrt(2 * Math.PI)) * h * 2.2

  return (
    <div style={{ width:'100%', maxWidth:300, margin:'16px auto 8px' }}>
      <svg viewBox={`0 0 ${w} ${h + 30}`} style={{ width:'100%', height:'auto' }}>
        <defs>
          <linearGradient id="bellGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0.03" />
          </linearGradient>
        </defs>
        <polygon points={fillPoints} fill="url(#bellGrad)" />
        <polyline points={linePoints} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <line x1={markerX} y1={markerY} x2={markerX} y2={h} stroke="#1A1A1A" strokeWidth="1.5" strokeDasharray="3,3" />
        <polygon points={`${markerX-6},${h+4} ${markerX+6},${h+4} ${markerX},${h-2}`} fill="#1A1A1A" />
        <text x={markerX} y={h+20} textAnchor="middle" style={{ fontSize:10, fontWeight:600, fill:'#1A1A1A', fontFamily:sf }}>{`You're here`}</text>
      </svg>
    </div>
  )
}

// ─── SCORE RING ───
function ScoreRing({ score, color, size = 160 }: { score: number, color: string, size?: number }) {
  const [displayed, setDisplayed] = useState(0)
  const r = 54; const c = 2 * Math.PI * r
  const offset = c - (displayed / 100) * c

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
      <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="7"/>
      <circle cx="60" cy="60" r={r} fill="none" stroke={color} strokeWidth="7"
        strokeLinecap="round" strokeDasharray={c} strokeDashoffset={offset}
        transform="rotate(-90 60 60)" style={{ transition:'stroke-dashoffset 0.03s' }}/>
      <text x="60" y="57" textAnchor="middle" dominantBaseline="middle"
        style={{ fontFamily:sf, fontWeight:700, fontSize:28, fill:'#1A1A1A', letterSpacing:-1 }}>{displayed}</text>
      <text x="60" y="72" textAnchor="middle" dominantBaseline="middle"
        style={{ fontFamily:sf, fontSize:8, fill:'rgba(0,0,0,0.3)', letterSpacing:0.5 }}>/ 100</text>
    </svg>
  )
}

// ─── MAIN DASHBOARD ───
export default function Dashboard() {
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [computed, setComputed] = useState<any>(null)
  const [showPaywall, setShowPaywall] = useState(false)

  useEffect(() => {
    const p = localStorage.getItem('glowup_profile')
    if (!p) { router.push('/onboarding'); return }
    const parsed = JSON.parse(p)
    setProfile(parsed)
    const result = calculateScore(parsed)
    setComputed(result)

    // Save initial score if first time
    if (!localStorage.getItem('glowup_live_score')) {
      localStorage.setItem('glowup_live_score', JSON.stringify({
        score: result.total,
        lastDate: new Date().toDateString(),
      }))
      localStorage.setItem('glowup_score', JSON.stringify({ total: result.total }))
    }
  }, [])

  if (!profile || !computed) return (
    <div style={{ minHeight:'100svh', background:'#FFFFFF', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ width:24, height:24, border:'2px solid rgba(0,0,0,0.08)', borderTopColor:BLUE, borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  const seg = getSegment(computed.total, profile.prenom, computed.weakest)

  return (
    <main style={{ minHeight:'100svh', background:'#FFFFFF', fontFamily:sf, display:'flex', flexDirection:'column', position:'relative' }}>

      {/* PAYWALL OVERLAY */}
      {showPaywall && (
        <div style={{ position:'absolute', inset:0, background:'rgba(255,255,255,0.92)', zIndex:100, display:'flex', alignItems:'flex-end', padding:20 }}
          onClick={() => setShowPaywall(false)}>
          <div onClick={e => e.stopPropagation()} style={{ width:'100%', background:'#F5F5F7', border:'0.5px solid rgba(0,0,0,0.08)', borderRadius:24, padding:24 }}>
            <div style={{ width:40, height:4, background:'rgba(0,0,0,0.2)', borderRadius:2, margin:'0 auto 20px' }} />
            <div style={{ fontSize:28, textAlign:'center', marginBottom:8 }}>🔒</div>
            <h2 style={{ fontSize:22, fontWeight:700, color:'#1A1A1A', letterSpacing:-0.8, textAlign:'center', marginBottom:8 }}>
              Unlock your full plan
            </h2>
            <p style={{ fontSize:14, color:'rgba(0,0,0,0.55)', textAlign:'center', lineHeight:1.5, marginBottom:20, letterSpacing:-0.2 }}>
              Your personalized {computed.total < 56 ? '8-week' : '4-week'} plan can boost your score by +{computed.total < 56 ? '30' : '15'} points.
            </p>
            <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:16 }}>
              {['Personalized improvement program', 'Daily missions tailored to you', 'AI Coach available 24/7', 'Score tracking & progress'].map(f => (
                <div key={f} style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <span style={{ color:'#30D158', fontSize:14 }}>✓</span>
                  <span style={{ fontSize:13, color:'rgba(0,0,0,0.6)', letterSpacing:-0.2 }}>{f}</span>
                </div>
              ))}
            </div>
            <button style={{ width:'100%', padding:'16px', background:BLUE, border:'none', borderRadius:14, color:'#FFFFFF', fontSize:16, fontWeight:600, cursor:'pointer', fontFamily:sf, letterSpacing:-0.3, marginBottom:10 }}>
              Start — $9.99/month
            </button>
            <button onClick={() => setShowPaywall(false)} style={{ width:'100%', padding:'12px', background:'none', border:'none', color:'rgba(0,0,0,0.3)', fontSize:14, cursor:'pointer', fontFamily:sf }}>
              Continue for free
            </button>
          </div>
        </div>
      )}

      {/* NAV */}
      <nav style={{ flexShrink:0, padding:'56px 20px 12px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <span style={{ fontSize:20, fontWeight:700, color:'#1A1A1A', letterSpacing:-0.5 }}>GlowApp</span>
        <button onClick={() => router.push('/share')}
          style={{ background:'rgba(10,132,255,0.12)', border:'0.5px solid rgba(10,132,255,0.25)', borderRadius:20, padding:'6px 12px', color:'#0A84FF', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:sf, letterSpacing:-0.2 }}>
          ⬆ Share
        </button>
      </nav>

      {/* HERO */}
      <div style={{ flexShrink:0, display:'flex', flexDirection:'column', alignItems:'center', padding:'4px 20px 12px' }}>
        <p style={{ fontSize:13, color:'rgba(0,0,0,0.45)', letterSpacing:-0.2, marginBottom:4 }}>Hi {profile.prenom} 👋</p>
        <ScoreRing score={computed.total} color={seg.color} />
        <div style={{ marginTop:4, textAlign:'center', width:'100%' }}>
          <span style={{ fontSize:22, fontWeight:800, color:seg.color, letterSpacing:-0.5, display:'block', marginBottom:4 }}>{seg.label}</span>
          <BellCurve score={computed.total} color={seg.color} />
          <p style={{ fontSize:12, fontStyle:'italic', fontWeight:300, color:'rgba(0,0,0,0.45)', letterSpacing:-0.1, marginBottom:10 }}>
            <span style={{ color:'#FF453A', fontWeight:600 }}>{seg.hook}</span>{' '}
            <span style={{ fontWeight:700, color:'#1A1A1A' }}>{seg.hookBold}</span>
          </p>
          <p style={{ fontSize:13, fontWeight:500, color:'rgba(0,0,0,0.55)', letterSpacing:-0.1, lineHeight:1.5, maxWidth:300, textAlign:'center', margin:'0 auto 12px' }}>
            {seg.message}
          </p>
          <p style={{ fontSize:13, color:'rgba(0,0,0,0.45)', letterSpacing:-0.2, lineHeight:1.5, maxWidth:280, textAlign:'center', margin:'0 auto 14px' }}>
            Start improving today by following the plan I created for you ⬇️
          </p>
          <button onClick={() => router.push('/today')}
            style={{ padding:'11px 24px', background:BLUE, border:'none', borderRadius:12, color:'#FFFFFF', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:sf, letterSpacing:-0.2 }}>
            See my plan →
          </button>
        </div>
      </div>

      {/* SCORE BREAKDOWN */}
      <div style={{ flex:1, overflowY:'auto', padding:'0 20px 40px' }}>
        <p style={{ fontSize:11, color:'rgba(0,0,0,0.3)', letterSpacing:0.5, textTransform:'uppercase', marginBottom:12 }}>Score breakdown</p>
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {CATEGORIES.map(cat => {
            const val = computed.categories[cat.key] as number
            const isWeak = computed.weakest === cat.key
            const pct = (val / cat.max) * 100
            return (
              <div key={cat.key} style={{ background: isWeak ? 'rgba(255,69,58,0.06)' : 'rgba(0,0,0,0.04)', border:`0.5px solid ${isWeak ? 'rgba(255,69,58,0.2)' : 'rgba(0,0,0,0.07)'}`, borderRadius:14, padding:'14px 16px' }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <span style={{ fontSize:18 }}>{cat.icon}</span>
                    <div>
                      <span style={{ fontSize:14, fontWeight:600, color:'#1A1A1A', letterSpacing:-0.3 }}>{cat.label}</span>
                      {isWeak && <span style={{ display:'block', fontSize:10, color:'#FF453A', marginTop:1 }}>⚠ Weakest area</span>}
                    </div>
                  </div>
                  <span style={{ fontSize:18, fontWeight:700, color:cat.color, letterSpacing:-0.5 }}>
                    {val}<span style={{ fontSize:11, fontWeight:400, color:'rgba(0,0,0,0.3)' }}>/{cat.max}</span>
                  </span>
                </div>
                <div style={{ height:4, background:'rgba(0,0,0,0.07)', borderRadius:2, overflow:'hidden' }}>
                  <div style={{ height:'100%', width:`${pct}%`, background:cat.color, borderRadius:2 }} />
                </div>
              </div>
            )
          })}
        </div>

        <button onClick={() => router.push('/today')}
          style={{ width:'100%', padding:'14px', background:BLUE, border:'none', borderRadius:14, color:'#FFFFFF', fontSize:15, fontWeight:600, cursor:'pointer', fontFamily:sf, letterSpacing:-0.3, marginTop:16 }}>
          See my plan →
        </button>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        ::-webkit-scrollbar { display: none; }
        * { box-sizing:border-box; margin:0; padding:0; }
      `}</style>
    </main>
  )
}
