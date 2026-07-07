'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const sf = `-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif`
const BLUE = '#0A84FF'
const RED = '#FF453A'
const TOTAL_STEPS = 7

function OptionCard({ label, icon, selected, onClick, sub }: { label: string, icon: string, selected: boolean, onClick: () => void, sub?: string }) {
  return (
    <button onClick={onClick} style={{
      width:'100%', padding:'14px 16px', background: selected ? RED : 'rgba(0,0,0,0.04)',
      border:`0.5px solid ${selected ? RED : 'rgba(0,0,0,0.08)'}`,
      borderRadius:12, cursor:'pointer', display:'flex', alignItems:'center', gap:12,
      transition:'all 0.15s ease', fontFamily:sf, textAlign:'left',
    }}>
      <span style={{ fontSize:20, flexShrink:0 }}>{icon}</span>
      <div style={{ flex:1 }}>
        <span style={{ fontSize:15, fontWeight:500, color: selected ? '#fff' : '#1A1A1A', letterSpacing:-0.2 }}>{label}</span>
        {sub && <p style={{ fontSize:11, color: selected ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.3)', marginTop:1 }}>{sub}</p>}
      </div>
      {selected && <span style={{ color:'#fff', fontSize:16 }}>✓</span>}
    </button>
  )
}

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const [photo, setPhoto] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [prenom, setPrenom] = useState('')
  const [age, setAge] = useState('')
  const [sleepHours, setSleepHours] = useState('')
  const [bedtime, setBedtime] = useState('')
  const [stressLevel, setStressLevel] = useState('')
  const [relaxation, setRelaxation] = useState('')
  const [exercise, setExercise] = useState('')
  const [outdoor, setOutdoor] = useState('')
  const [diet, setDiet] = useState('')
  const [water, setWater] = useState('')
  const [sugar, setSugar] = useState('')
  const [caffeine, setCaffeine] = useState('')
  const [authError, setAuthError] = useState('')

  const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)
  const next = () => setStep(s => s + 1)
  const back = () => setStep(s => s - 1)

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => { setPhoto(reader.result as string); setTimeout(() => next(), 400) }
    reader.readAsDataURL(file)
  }

  const submit = async () => {
    setLoading(true)
    setAuthError('')
    try {
      const data = { prenom, age: Number(age), sleepHours, bedtime, stressLevel, relaxation, exercise, outdoor, diet, water, sugar, caffeine }
      localStorage.setItem('glowup_profile', JSON.stringify(data))
      try {
        await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: `${window.location.origin}/auth/callback` } })
      } catch (err) { console.error('Email error:', err) }
      router.push('/paywall')
    } catch(e: any) {
      console.error(e)
      setAuthError("Something went wrong. Please try again.")
    } finally { setLoading(false) }
  }

  const Btn = ({ label, onClick, disabled }: { label: string, onClick: () => void, disabled?: boolean }) => (
    <button onClick={onClick} disabled={disabled} style={{
      width:'100%', padding:'16px', background: disabled ? 'rgba(0,0,0,0.07)' : RED,
      border:'none', borderRadius:14, color: disabled ? 'rgba(0,0,0,0.3)' : '#fff',
      fontSize:16, fontWeight:600, cursor: disabled ? 'default' : 'pointer',
      fontFamily:sf, letterSpacing:-0.3, transition:'all 0.2s ease',
    }}>{label}</button>
  )

  const StepHeader = ({ num, title, sub }: { num: number, title: string, sub?: string }) => (
    <div style={{ marginBottom:20 }}>
      <div style={{ fontSize:13, color:RED, fontWeight:500, marginBottom:8, letterSpacing:-0.2 }}>Step {num} / {TOTAL_STEPS}</div>
      <h1 style={{ fontSize:26, fontWeight:700, color:'#1A1A1A', letterSpacing:-0.8, lineHeight:1.15, marginBottom: sub ? 8 : 0 }}>{title}</h1>
      {sub && <p style={{ fontSize:13, color:'rgba(0,0,0,0.45)', letterSpacing:-0.2, lineHeight:1.5 }}>{sub}</p>}
    </div>
  )

  return (
    <main style={{ height:'100svh', background:'#FFFFFF', fontFamily:sf, overflow:'hidden', display:'flex', flexDirection:'column' }}>

      <nav style={{ flexShrink:0, padding:'16px 20px 12px', display:'flex', justifyContent:'space-between', alignItems:'center', position:'sticky', top:0, zIndex:10, background:'#FFFFFF' }}>
        <span style={{ fontSize:20, fontWeight:700, color:'#1A1A1A', letterSpacing:-0.5 }}>GlowApp</span>
        {step > 0 && <button onClick={back} style={{ background:'none', border:'none', color:'rgba(0,0,0,0.55)', fontSize:14, cursor:'pointer', fontFamily:sf }}>← Back</button>}
      </nav>

      <div style={{ flexShrink:0, padding:'0 20px 16px', display:'flex', gap:5 }}>
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <div key={i} style={{ flex:1, height:3, borderRadius:2, background: i <= step ? RED : 'rgba(0,0,0,0.1)', transition:'background 0.3s ease' }} />
        ))}
      </div>

      <div style={{ flex:1, padding:'0 24px', paddingBottom:'40px', overflowY:'auto', display:'flex', flexDirection:'column' }}>

        {/* STEP 0 — Selfie */}
        {step === 0 && (
          <div style={{ flex:1, display:'flex', flexDirection:'column', paddingTop:20, gap:16 }}>
            <StepHeader num={1} title="Let's scan your face" sub="AI detects visible signs of high cortisol: puffiness, dark circles, skin texture, and stress lines." />
            <input ref={fileRef} type="file" accept="image/*" capture="user" onChange={handlePhoto} style={{ display:'none' }} />
            <button onClick={() => fileRef.current?.click()} style={{
              width:'100%', height:200, background: photo ? 'transparent' : 'rgba(0,0,0,0.03)',
              border:`0.5px dashed ${photo ? RED : 'rgba(0,0,0,0.12)'}`, borderRadius:20, cursor:'pointer', overflow:'hidden', padding:0, position:'relative',
            }}>
              {photo ? (
                <>
                  <img src={photo} alt="selfie" style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'center top' }} />
                  <div style={{ position:'absolute', inset:0, background:'rgba(255,69,58,0.15)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <div style={{ background:'rgba(255,255,255,0.9)', borderRadius:12, padding:'8px 16px', fontSize:13, color:'#1A1A1A', fontWeight:500 }}>✓ Photo captured</div>
                  </div>
                </>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100%', gap:10 }}>
                  <div style={{ width:56, height:56, borderRadius:'50%', background:'rgba(255,69,58,0.1)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <span style={{ fontSize:24 }}>🔬</span>
                  </div>
                  <p style={{ fontSize:15, fontWeight:600, color:'#1A1A1A', letterSpacing:-0.3 }}>Scan my face</p>
                  <p style={{ fontSize:12, color:'rgba(0,0,0,0.3)' }}>or import from gallery</p>
                </div>
              )}
            </button>
            <Btn label="Continue" onClick={next} disabled={!photo} />
            <p style={{ fontSize:11, color:'rgba(0,0,0,0.2)', textAlign:'center' }}>Photo not stored · Local analysis only</p>
          </div>
        )}

        {/* STEP 1 — Name + Age */}
        {step === 1 && (
          <div style={{ flex:1, display:'flex', flexDirection:'column', paddingTop:20, gap:16 }}>
            <StepHeader num={2} title="About you" sub="Cortisol impacts differ by age. This helps us calibrate your score." />
            <input type="text" placeholder="Your first name" value={prenom} onChange={e => setPrenom(e.target.value)} autoFocus
              style={{ width:'100%', padding:'16px', background:'rgba(0,0,0,0.05)', border:`0.5px solid ${prenom ? RED : 'rgba(0,0,0,0.1)'}`, borderRadius:14, color:'#1A1A1A', fontSize:18, fontWeight:500, fontFamily:sf, outline:'none', letterSpacing:-0.3 }} />
            <input type="number" placeholder="Age" value={age} onChange={e => setAge(e.target.value)}
              style={{ width:'100%', padding:'16px', background:'rgba(0,0,0,0.05)', border:`0.5px solid ${age ? RED : 'rgba(0,0,0,0.1)'}`, borderRadius:14, color:'#1A1A1A', fontSize:18, fontWeight:500, fontFamily:sf, outline:'none', letterSpacing:-0.3 }} />
            <Btn label="Continue" onClick={next} disabled={!prenom.trim() || !age} />
          </div>
        )}

        {/* STEP 2 — Sleep */}
        {step === 2 && (
          <div style={{ flex:1, display:'flex', flexDirection:'column', paddingTop:20, gap:10 }}>
            <StepHeader num={3} title="Your sleep" sub="Cortisol resets while you sleep. Bad sleep = cortisol stays elevated 24/7." />
            <p style={{ fontSize:11, color:'rgba(0,0,0,0.4)', fontWeight:500, letterSpacing:0.5, textTransform:'uppercase', marginBottom:4 }}>Hours per night</p>
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              {[
                { val:'<5', label:'Less than 5 hours', icon:'😵', sub:'Cortisol stays dangerously high' },
                { val:'5-6', label:'5 to 6 hours', icon:'😴', sub:'Not enough for cortisol reset' },
                { val:'7-8', label:'7 to 8 hours', icon:'😊', sub:'Optimal cortisol recovery window' },
                { val:'8+', label:'More than 8 hours', icon:'😇', sub:'Good, if sleep quality is high' },
              ].map(o => <OptionCard key={o.val} label={o.label} icon={o.icon} sub={o.sub} selected={sleepHours === o.val} onClick={() => setSleepHours(o.val)} />)}
            </div>
            <p style={{ fontSize:11, color:'rgba(0,0,0,0.4)', fontWeight:500, letterSpacing:0.5, textTransform:'uppercase', marginTop:8, marginBottom:4 }}>Usual bedtime</p>
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              {[
                { val:'before10', label:'Before 10pm', icon:'🌙' },
                { val:'10-11', label:'10pm — 11pm', icon:'🕙' },
                { val:'11-12', label:'11pm — midnight', icon:'🕚' },
                { val:'after12', label:'After midnight', icon:'⚠️', sub:'Cortisol spike zone' },
              ].map(o => <OptionCard key={o.val} label={o.label} icon={o.icon} sub={o.sub} selected={bedtime === o.val} onClick={() => setBedtime(o.val)} />)}
            </div>
            <Btn label="Continue" onClick={next} disabled={!sleepHours || !bedtime} />
          </div>
        )}

        {/* STEP 3 — Stress + Relaxation */}
        {step === 3 && (
          <div style={{ flex:1, display:'flex', flexDirection:'column', paddingTop:20, gap:10 }}>
            <StepHeader num={4} title="Stress & relaxation" sub="Chronic stress is the #1 driver of elevated cortisol." />
            <p style={{ fontSize:11, color:'rgba(0,0,0,0.4)', fontWeight:500, letterSpacing:0.5, textTransform:'uppercase', marginBottom:4 }}>Daily stress level</p>
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              {[
                { val:'low', label:'Low — I feel calm most days', icon:'😌' },
                { val:'moderate', label:'Moderate — some tension', icon:'😐' },
                { val:'high', label:'High — often anxious or overwhelmed', icon:'😰' },
                { val:'extreme', label:'Extreme — constant burnout', icon:'🔥', sub:'Cortisol is likely very elevated' },
              ].map(o => <OptionCard key={o.val} label={o.label} icon={o.icon} sub={o.sub} selected={stressLevel === o.val} onClick={() => setStressLevel(o.val)} />)}
            </div>
            <p style={{ fontSize:11, color:'rgba(0,0,0,0.4)', fontWeight:500, letterSpacing:0.5, textTransform:'uppercase', marginTop:8, marginBottom:4 }}>Do you practice any relaxation?</p>
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              {[
                { val:'none', label:'Nothing', icon:'🚫', sub:'No cortisol regulation' },
                { val:'sometimes', label:'Sometimes — walks, music', icon:'🎵' },
                { val:'regular', label:'Regular — meditation, yoga, journaling', icon:'🧘', sub:'Proven to reduce cortisol by 25%' },
              ].map(o => <OptionCard key={o.val} label={o.label} icon={o.icon} sub={o.sub} selected={relaxation === o.val} onClick={() => setRelaxation(o.val)} />)}
            </div>
            <Btn label="Continue" onClick={next} disabled={!stressLevel || !relaxation} />
          </div>
        )}

        {/* STEP 4 — Exercise + Outdoor */}
        {step === 4 && (
          <div style={{ flex:1, display:'flex', flexDirection:'column', paddingTop:20, gap:10 }}>
            <StepHeader num={5} title="Movement & nature" sub="Regular moderate exercise lowers baseline cortisol. Nature reduces it even further." />
            <p style={{ fontSize:11, color:'rgba(0,0,0,0.4)', fontWeight:500, letterSpacing:0.5, textTransform:'uppercase', marginBottom:4 }}>Exercise per week</p>
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              {[
                { val:'0', label:'Never', icon:'🛋️', sub:'Cortisol has no physical outlet' },
                { val:'1-2', label:'1 to 2 times', icon:'🚶' },
                { val:'3-4', label:'3 to 4 times', icon:'🏃', sub:'Optimal for cortisol regulation' },
                { val:'5+', label:'5+ times', icon:'🏋️', sub:'Great — if not overtraining' },
              ].map(o => <OptionCard key={o.val} label={o.label} icon={o.icon} sub={o.sub} selected={exercise === o.val} onClick={() => setExercise(o.val)} />)}
            </div>
            <p style={{ fontSize:11, color:'rgba(0,0,0,0.4)', fontWeight:500, letterSpacing:0.5, textTransform:'uppercase', marginTop:8, marginBottom:4 }}>Time spent outside daily</p>
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              {[
                { val:'<15', label:'Less than 15 minutes', icon:'🏠', sub:'Almost no nature exposure' },
                { val:'15-30', label:'15 to 30 minutes', icon:'🌤️' },
                { val:'30-60', label:'30 to 60 minutes', icon:'🌿', sub:'Proven cortisol reduction' },
                { val:'60+', label:'More than 1 hour', icon:'☀️' },
              ].map(o => <OptionCard key={o.val} label={o.label} icon={o.icon} sub={o.sub} selected={outdoor === o.val} onClick={() => setOutdoor(o.val)} />)}
            </div>
            <Btn label="Continue" onClick={next} disabled={!exercise || !outdoor} />
          </div>
        )}

        {/* STEP 5 — Nutrition + Water + Sugar + Caffeine */}
        {step === 5 && (
          <div style={{ flex:1, display:'flex', flexDirection:'column', paddingTop:20, gap:10 }}>
            <StepHeader num={6} title="What you consume" sub="Sugar and caffeine spike cortisol. Water and clean food lower it." />
            <p style={{ fontSize:11, color:'rgba(0,0,0,0.4)', fontWeight:500, letterSpacing:0.5, textTransform:'uppercase', marginBottom:4 }}>Your diet</p>
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              {[
                { val:'poor', label:'Mostly fast food & processed', icon:'🍔', sub:'High cortisol trigger' },
                { val:'average', label:'Mixed — some healthy, some not', icon:'🍕' },
                { val:'good', label:'Mostly balanced & clean', icon:'🥗' },
              ].map(o => <OptionCard key={o.val} label={o.label} icon={o.icon} sub={o.sub} selected={diet === o.val} onClick={() => setDiet(o.val)} />)}
            </div>
            <p style={{ fontSize:11, color:'rgba(0,0,0,0.4)', fontWeight:500, letterSpacing:0.5, textTransform:'uppercase', marginTop:8, marginBottom:4 }}>Water per day</p>
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              {[
                { val:'<4', label:'Less than 4 cups', icon:'🏜️' },
                { val:'4-6', label:'4 to 6 cups', icon:'💧' },
                { val:'6-8', label:'6 to 8 cups', icon:'💧💧' },
                { val:'8+', label:'8+ cups', icon:'🌊' },
              ].map(o => <OptionCard key={o.val} label={o.label} icon={o.icon} selected={water === o.val} onClick={() => setWater(o.val)} />)}
            </div>
            <p style={{ fontSize:11, color:'rgba(0,0,0,0.4)', fontWeight:500, letterSpacing:0.5, textTransform:'uppercase', marginTop:8, marginBottom:4 }}>Daily sugar intake</p>
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              {[
                { val:'high', label:'A lot — sodas, candy, pastries', icon:'🍭', sub:'Major cortisol spiker' },
                { val:'moderate', label:'Some — occasional treats', icon:'🍫' },
                { val:'low', label:'Very little — mostly natural', icon:'🍎' },
              ].map(o => <OptionCard key={o.val} label={o.label} icon={o.icon} sub={o.sub} selected={sugar === o.val} onClick={() => setSugar(o.val)} />)}
            </div>
            <p style={{ fontSize:11, color:'rgba(0,0,0,0.4)', fontWeight:500, letterSpacing:0.5, textTransform:'uppercase', marginTop:8, marginBottom:4 }}>Caffeine</p>
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              {[
                { val:'heavy', label:'3+ cups of coffee daily', icon:'☕', sub:'Cortisol stays elevated for hours' },
                { val:'moderate', label:'1-2 cups', icon:'☕' },
                { val:'low', label:'Rarely or none', icon:'🍵' },
              ].map(o => <OptionCard key={o.val} label={o.label} icon={o.icon} sub={o.sub} selected={caffeine === o.val} onClick={() => setCaffeine(o.val)} />)}
            </div>
            <Btn label="Continue" onClick={next} disabled={!diet || !water || !sugar || !caffeine} />
          </div>
        )}

        {/* STEP 6 — Auth gate */}
        {step === 6 && (
          <div style={{ flex:1, display:'flex', flexDirection:'column', paddingTop:20, gap:10 }}>

            {/* BLURRED SCORE PREVIEW */}
            <div style={{ position:'relative', marginBottom:12 }}>
              <div style={{ filter:'blur(8px)', pointerEvents:'none', userSelect:'none', opacity:0.7 }}>
                <div style={{ display:'flex', justifyContent:'center', marginBottom:8, position:'relative' }}>
                  <svg width={120} height={120} viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="7"/>
                    <circle cx="60" cy="60" r="54" fill="none" stroke={RED} strokeWidth="7" strokeLinecap="round" strokeDasharray={2 * Math.PI * 54} strokeDashoffset={2 * Math.PI * 54 * 0.35} transform="rotate(-90 60 60)"/>
                    <text x="60" y="57" textAnchor="middle" dominantBaseline="middle" style={{ fontFamily:sf, fontWeight:700, fontSize:28, fill:'#1A1A1A' }}>68</text>
                    <text x="60" y="72" textAnchor="middle" dominantBaseline="middle" style={{ fontFamily:sf, fontSize:8, fill:'rgba(0,0,0,0.3)' }}>/ 100</text>
                  </svg>
                </div>
                <div style={{ position:'relative', height:40, marginBottom:4 }}>
                  <div style={{ position:'absolute', left:8, top:-90, display:'flex', flexDirection:'column', gap:6 }}>
                    <div style={{ background:'rgba(255,69,58,0.12)', borderRadius:8, padding:'4px 8px', fontSize:11, fontWeight:600, color:RED }}>😴 Sleep · 4/20</div>
                    <div style={{ background:'rgba(255,159,10,0.12)', borderRadius:8, padding:'4px 8px', fontSize:11, fontWeight:600, color:'#FF9F0A' }}>😰 Stress · 6/18</div>
                    <div style={{ background:'rgba(10,132,255,0.12)', borderRadius:8, padding:'4px 8px', fontSize:11, fontWeight:600, color:BLUE }}>💧 Water · 4/10</div>
                  </div>
                  <div style={{ position:'absolute', right:8, top:-90, display:'flex', flexDirection:'column', gap:6 }}>
                    <div style={{ background:'rgba(191,90,242,0.12)', borderRadius:8, padding:'4px 8px', fontSize:11, fontWeight:600, color:'#BF5AF2' }}>🏃 Exercise · 8/16</div>
                    <div style={{ background:'rgba(48,209,88,0.12)', borderRadius:8, padding:'4px 8px', fontSize:11, fontWeight:600, color:'#30D158' }}>🥗 Diet · 7/16</div>
                    <div style={{ background:'rgba(100,210,255,0.12)', borderRadius:8, padding:'4px 8px', fontSize:11, fontWeight:600, color:'#64D2FF' }}>🌿 Nature · 3/10</div>
                  </div>
                </div>
              </div>
              <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <div style={{ background:'rgba(255,255,255,0.85)', borderRadius:16, padding:'10px 20px', display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ fontSize:18 }}>🔒</span>
                  <span style={{ fontSize:14, fontWeight:600, color:'#1A1A1A', letterSpacing:-0.3 }}>Enter email to reveal</span>
                </div>
              </div>
            </div>

            <p style={{ fontSize:12, color:RED, fontWeight:500, textAlign:'center', marginBottom:2, letterSpacing:-0.2 }}>
              ⚠️ Your cortisol report expires in 10 minutes
            </p>
            <p style={{ fontSize:11, color:'rgba(0,0,0,0.3)', textAlign:'center', marginBottom:10 }}>
              🔒 No spam. Unsubscribe anytime.
            </p>

            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              <button onClick={async () => {
                const data = { prenom, age: Number(age), sleepHours, bedtime, stressLevel, relaxation, exercise, outdoor, diet, water, sugar, caffeine }
                localStorage.setItem('glowup_profile', JSON.stringify(data))
                await supabase.auth.signInWithOAuth({ provider:'google', options:{ redirectTo:`${window.location.origin}/auth/callback` } })
              }} style={{ width:'100%', padding:'14px', background:'#F5F5F7', border:'none', borderRadius:14, color:'#000', fontSize:15, fontWeight:600, cursor:'pointer', fontFamily:sf, display:'flex', alignItems:'center', justifyContent:'center', gap:10 }}>
                <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/><path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/><path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z"/><path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.31z"/></svg>
                Continue with Google
              </button>
              <div style={{ display:'flex', alignItems:'center', gap:12 }}><div style={{ flex:1, height:'0.5px', background:'rgba(0,0,0,0.08)' }} /><span style={{ fontSize:12, color:'rgba(0,0,0,0.3)' }}>or</span><div style={{ flex:1, height:'0.5px', background:'rgba(0,0,0,0.08)' }} /></div>
              {authError && <p style={{ fontSize:12, color:RED, textAlign:'center', background:'rgba(255,69,58,0.1)', padding:'10px 14px', borderRadius:10 }}>{authError}</p>}
              <input type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)}
                style={{ width:'100%', padding:'14px 16px', background:'rgba(0,0,0,0.05)', border:`0.5px solid ${isValidEmail(email) ? RED : 'rgba(0,0,0,0.1)'}`, borderRadius:14, color:'#1A1A1A', fontSize:16, fontFamily:sf, outline:'none', letterSpacing:-0.2 }} />
              <button onClick={submit} disabled={loading || !isValidEmail(email)}
                style={{ width:'100%', padding:'16px', background:(!isValidEmail(email) || loading) ? 'rgba(0,0,0,0.07)' : RED, border:'none', borderRadius:14, color:(!isValidEmail(email) || loading) ? 'rgba(0,0,0,0.3)' : '#fff', fontSize:16, fontWeight:600, cursor:(!isValidEmail(email) || loading) ? 'default' : 'pointer', fontFamily:sf, letterSpacing:-0.3, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                {loading ? <><span style={{ width:16,height:16,border:'2px solid rgba(255,255,255,0.3)',borderTopColor:'#fff',borderRadius:'50%',display:'inline-block',animation:'spin 0.8s linear infinite' }} />Analyzing...</> : '🔬 Reveal my Cortisol Score'}
              </button>
              <p style={{ fontSize:11, color:'rgba(0,0,0,0.2)', textAlign:'center' }}>By continuing, you agree to our terms of use</p>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none }
        * { box-sizing:border-box; margin:0; padding:0; }
        input::placeholder { color: rgba(0,0,0,0.2); }
        ::-webkit-scrollbar { display: none; }
      `}</style>
    </main>
  )
}
