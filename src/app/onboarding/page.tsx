'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const sf = `-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif`
const BLUE = '#0A84FF'
const TOTAL_STEPS = 9

const GOALS = [
  { val:'weight_loss', label:'Lose weight', icon:'⚖️' },
  { val:'muscle',      label:'Build muscle', icon:'💪' },
  { val:'energy',      label:'Get more energy', icon:'⚡' },
  { val:'skin',        label:'Improve my skin', icon:'✨' },
  { val:'sleep',       label:'Sleep better', icon:'🌙' },
  { val:'stress',      label:'Reduce stress', icon:'🧘' },
]

function OptionCard({ label, icon, selected, onClick }: { label: string, icon: string, selected: boolean, onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      width:'100%', padding:'14px 16px', background: selected ? BLUE : 'rgba(0,0,0,0.04)',
      border:`0.5px solid ${selected ? BLUE : 'rgba(0,0,0,0.08)'}`,
      borderRadius:12, cursor:'pointer', display:'flex', alignItems:'center', gap:12,
      transition:'all 0.15s ease', fontFamily:sf,
    }}>
      <span style={{ fontSize:20 }}>{icon}</span>
      <span style={{ fontSize:15, fontWeight:500, color: selected ? '#fff' : '#1A1A1A', letterSpacing:-0.2 }}>{label}</span>
      {selected && <span style={{ marginLeft:'auto', color:BLUE, fontSize:16 }}>✓</span>}
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
  const [objectifs, setObjectifs] = useState<string[]>([])
  const [poids, setPoids] = useState('')
  const [taille, setTaille] = useState('')
  const [age, setAge] = useState('')
  const [sport, setSport] = useState('')
  const [eau, setEau] = useState('')
  const [skincare, setSkincare] = useState('')
  const [sleep, setSleep] = useState('')
  const [nutrition, setNutrition] = useState('')
  const [stress, setStress] = useState('')
  const [authError, setAuthError] = useState('')

  // BMI: lbs & inches -> kg & m
  const bmi = poids && taille ? ((Number(poids) * 703) / (Number(taille) ** 2)).toFixed(1) : null

  const next = () => setStep(s => s + 1)
  const back = () => setStep(s => s - 1)

  const toggleGoal = (val: string) => {
    setObjectifs(prev => prev.includes(val) ? prev.filter(o => o !== val) : [...prev, val])
  }

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => { setPhoto(reader.result as string); setTimeout(() => next(), 400) }
    reader.readAsDataURL(file)
  }

  const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)

  const submit = async () => {
    setLoading(true)
    setAuthError('')
    try {
      const data = { prenom, objectifs, poids: Number(poids), taille: Number(taille), age: Number(age), sport, eau, skincare, sleep, nutrition, stress }
      localStorage.setItem('glowup_profile', JSON.stringify(data))
      localStorage.setItem('glowup_profile_pending', JSON.stringify(data))

      // Send magic link in background (non-blocking)
      try {
        await supabase.auth.signInWithOtp({
          email,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback` }
        })
      } catch (emailErr) {
        console.error('Email send error:', emailErr)
      }

      // Go to paywall instead of dashboard
      router.push('/paywall')
    } catch(e: any) {
      console.error(e)
      setAuthError("Something went wrong. Please try again.")
    } finally { setLoading(false) }
  }

  const Btn = ({ label, onClick, disabled }: { label: string, onClick: () => void, disabled?: boolean }) => (
    <button onClick={onClick} disabled={disabled} style={{
      width:'100%', padding:'16px', background: disabled ? 'rgba(0,0,0,0.07)' : BLUE,
      border:'none', borderRadius:14, color: disabled ? 'rgba(0,0,0,0.3)' : '#fff',
      fontSize:16, fontWeight:600, cursor: disabled ? 'default' : 'pointer',
      fontFamily:sf, letterSpacing:-0.3, transition:'all 0.2s ease',
    }}>{label}</button>
  )

  const StepHeader = ({ num, title, sub }: { num: number, title: string, sub?: string }) => (
    <div style={{ marginBottom:24 }}>
      <div style={{ fontSize:13, color:BLUE, fontWeight:500, marginBottom:8, letterSpacing:-0.2 }}>Step {num} / {TOTAL_STEPS}</div>
      <h1 style={{ fontSize:28, fontWeight:700, color:'#1A1A1A', letterSpacing:-0.8, lineHeight:1.15, marginBottom: sub ? 8 : 0 }}>{title}</h1>
      {sub && <p style={{ fontSize:13, color:'rgba(0,0,0,0.45)', letterSpacing:-0.2, lineHeight:1.5 }}>{sub}</p>}
    </div>
  )

  return (
    <main style={{ height:'100svh', background:'#FFFFFF', fontFamily:sf, overflow:'hidden', display:'flex', flexDirection:'column' }} onFocus={() => window.scrollTo(0,0)}>

      <nav style={{ flexShrink:0, padding:'16px 20px 12px', display:'flex', justifyContent:'space-between', alignItems:'center', position:'sticky', top:0, zIndex:10, background:'#FFFFFF' }}>
        <span style={{ fontSize:20, fontWeight:700, color:'#1A1A1A', letterSpacing:-0.5 }}>GlowApp</span>
        {step > 0 && (
          <button onClick={back} style={{ background:'none', border:'none', color:'rgba(0,0,0,0.55)', fontSize:14, cursor:'pointer', fontFamily:sf }}>
            ← Back
          </button>
        )}
      </nav>

      <div style={{ flexShrink:0, padding:'0 20px 16px', display:'flex', gap:5 }}>
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <div key={i} style={{ flex:1, height:3, borderRadius:2, background: i <= step ? BLUE : 'rgba(0,0,0,0.1)', transition:'background 0.3s ease' }} />
        ))}
      </div>

      <div style={{ flex:1, padding:'0 24px', paddingBottom:'40px', overflowY:'auto', display:'flex', flexDirection:'column' }}>

        {/* STEP 0 — Selfie */}
        {step === 0 && (
          <div style={{ flex:1, display:'flex', flexDirection:'column', paddingTop:40, gap:20 }}>
            <StepHeader num={1} title="Start with your selfie" sub="AI scans your face to analyze your skin, stress and hydration levels." />
            <input ref={fileRef} type="file" accept="image/*" capture="user" onChange={handlePhoto} style={{ display:'none' }} />
            <button onClick={() => fileRef.current?.click()} style={{
              width:'100%', height:220, background: photo ? 'transparent' : 'rgba(0,0,0,0.03)',
              border:`0.5px dashed ${photo ? BLUE : 'rgba(0,0,0,0.12)'}`,
              borderRadius:20, cursor:'pointer', overflow:'hidden', padding:0, position:'relative',
            }}>
              {photo ? (
                <>
                  <img src={photo} alt="selfie" style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'center top' }} />
                  <div style={{ position:'absolute', inset:0, background:'rgba(10,132,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <div style={{ background:'rgba(255,255,255,0.9)', borderRadius:12, padding:'8px 16px', fontSize:13, color:'#1A1A1A', fontWeight:500 }}>✓ Photo selected</div>
                  </div>
                </>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100%', gap:12 }}>
                  <div style={{ width:64, height:64, borderRadius:'50%', background:'rgba(10,132,255,0.12)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <span style={{ fontSize:28 }}>📷</span>
                  </div>
                  <div style={{ textAlign:'center' }}>
                    <p style={{ fontSize:15, fontWeight:600, color:'#1A1A1A', letterSpacing:-0.3, marginBottom:4 }}>Take a selfie</p>
                    <p style={{ fontSize:12, color:'rgba(0,0,0,0.3)' }}>or import from gallery</p>
                  </div>
                </div>
              )}
            </button>
            {photo && (
              <button onClick={() => fileRef.current?.click()} style={{ background:'none', border:'none', color:BLUE, fontSize:13, fontWeight:500, cursor:'pointer', fontFamily:sf }}>
                Change photo
              </button>
            )}
            <Btn label="Continue" onClick={next} disabled={!photo} />
            <p style={{ fontSize:11, color:'rgba(0,0,0,0.2)', textAlign:'center' }}>Photo not stored · Local analysis only</p>
          </div>
        )}

        {/* STEP 1 — Name */}
        {step === 1 && (
          <div style={{ flex:1, display:'flex', flexDirection:'column', paddingTop:40, gap:24 }}>
            <StepHeader num={2} title="What's your name?" sub="To personalize your score." />
            <input type="text" placeholder="Your first name" value={prenom} onChange={e => setPrenom(e.target.value)} autoFocus
              style={{ width:'100%', padding:'16px', background:'rgba(0,0,0,0.05)', border:`0.5px solid ${prenom ? BLUE : 'rgba(0,0,0,0.1)'}`, borderRadius:14, color:'#1A1A1A', fontSize:18, fontWeight:500, fontFamily:sf, outline:'none', letterSpacing:-0.3 }}
            />
            <Btn label="Continue" onClick={next} disabled={!prenom.trim()} />
          </div>
        )}

        {/* STEP 2 — Goals */}
        {step === 2 && (
          <div style={{ flex:1, display:'flex', flexDirection:'column', paddingTop:40, gap:12 }}>
            <StepHeader num={3} title="What are your goals?" sub="Select everything that applies." />
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {GOALS.map(o => (
                <OptionCard key={o.val} label={o.label} icon={o.icon} selected={objectifs.includes(o.val)} onClick={() => toggleGoal(o.val)} />
              ))}
            </div>
            <Btn label="Continue" onClick={next} disabled={objectifs.length === 0} />
          </div>
        )}

        {/* STEP 3 — Measurements (US: lbs, inches) */}
        {step === 3 && (
          <div style={{ flex:1, display:'flex', flexDirection:'column', paddingTop:40, gap:16 }}>
            <StepHeader num={4} title="Your measurements" sub="To calculate your BMI." />
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {[
                { label:'Age', placeholder:'25', value:age, set:setAge, unit:'yrs' },
                { label:'Weight', placeholder:'150', value:poids, set:setPoids, unit:'lbs' },
                { label:'Height', placeholder:'65', value:taille, set:setTaille, unit:'in' },
              ].map(f => (
                <div key={f.label}>
                  <label style={{ fontSize:11, color:'rgba(0,0,0,0.45)', fontWeight:500, letterSpacing:0.5, textTransform:'uppercase', display:'block', marginBottom:5 }}>{f.label}</label>
                  <div style={{ position:'relative' }}>
                    <input type="number" placeholder={f.placeholder} value={f.value} onChange={e => f.set(e.target.value)}
                      style={{ width:'100%', padding:'14px 44px 14px 16px', background:'rgba(0,0,0,0.05)', border:`0.5px solid ${f.value ? BLUE : 'rgba(0,0,0,0.1)'}`, borderRadius:12, color:'#1A1A1A', fontSize:16, fontWeight:500, fontFamily:sf, outline:'none', letterSpacing:-0.2 }}
                    />
                    <span style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', fontSize:13, color:'rgba(0,0,0,0.3)' }}>{f.unit}</span>
                  </div>
                </div>
              ))}
              {bmi && (
                <div style={{ padding:'12px 16px', background:'rgba(10,132,255,0.1)', border:'0.5px solid rgba(10,132,255,0.2)', borderRadius:12, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <span style={{ fontSize:13, color:'rgba(0,0,0,0.55)' }}>BMI calculated</span>
                  <span style={{ fontSize:18, fontWeight:700, color:BLUE, letterSpacing:-0.5 }}>{bmi}</span>
                </div>
              )}
            </div>
            <Btn label="Continue" onClick={next} disabled={!poids || !taille || !age} />
          </div>
        )}

        {/* STEP 4 — Fitness */}
        {step === 4 && (
          <div style={{ flex:1, display:'flex', flexDirection:'column', paddingTop:40, gap:12 }}>
            <StepHeader num={5} title="Your fitness activity" sub="How many times per week?" />
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {[
                { val:'0', label:'Never', icon:'🛋️' },
                { val:'1-2', label:'1 to 2 times', icon:'🚶' },
                { val:'3-4', label:'3 to 4 times', icon:'🏃' },
                { val:'5+', label:'5 times or more', icon:'🏋️' },
              ].map(o => <OptionCard key={o.val} label={o.label} icon={o.icon} selected={sport === o.val} onClick={() => setSport(o.val)} />)}
            </div>
            <Btn label="Continue" onClick={next} disabled={!sport} />
          </div>
        )}

        {/* STEP 5 — Sleep */}
        {step === 5 && (
          <div style={{ flex:1, display:'flex', flexDirection:'column', paddingTop:40, gap:12 }}>
            <StepHeader num={6} title="Your sleep" sub="How many hours per night on average?" />
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {[
                { val:'<5', label:'Less than 5 hours', icon:'😵' },
                { val:'5-6', label:'5 to 6 hours', icon:'😴' },
                { val:'7-8', label:'7 to 8 hours', icon:'😊' },
                { val:'8+', label:'More than 8 hours', icon:'😇' },
              ].map(o => <OptionCard key={o.val} label={o.label} icon={o.icon} selected={sleep === o.val} onClick={() => setSleep(o.val)} />)}
            </div>
            <Btn label="Continue" onClick={next} disabled={!sleep} />
          </div>
        )}

        {/* STEP 6 — Nutrition */}
        {step === 6 && (
          <div style={{ flex:1, display:'flex', flexDirection:'column', paddingTop:40, gap:12 }}>
            <StepHeader num={7} title="Your nutrition" sub="How would you describe your diet?" />
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {[
                { val:'poor', label:'Mostly fast food & snacks', icon:'🍔' },
                { val:'average', label:'Mixed — some healthy, some not', icon:'🍕' },
                { val:'good', label:'Mostly healthy & balanced', icon:'🥗' },
                { val:'excellent', label:'Very clean & structured', icon:'🥑' },
              ].map(o => <OptionCard key={o.val} label={o.label} icon={o.icon} selected={nutrition === o.val} onClick={() => setNutrition(o.val)} />)}
            </div>
            <Btn label="Continue" onClick={next} disabled={!nutrition} />
          </div>
        )}

        {/* STEP 7 — Water + Skincare */}
        {step === 7 && (
          <div style={{ flex:1, display:'flex', flexDirection:'column', paddingTop:40, gap:16 }}>
            <StepHeader num={8} title="Water & Skincare" />
            <div>
              <label style={{ fontSize:11, color:'rgba(0,0,0,0.45)', fontWeight:500, letterSpacing:0.5, textTransform:'uppercase', display:'block', marginBottom:8 }}>Water per day</label>
              <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                {[
                  { val:'<1', label:'Less than 4 cups', icon:'🏜️' },
                  { val:'1-1.5', label:'4 to 6 cups', icon:'💧' },
                  { val:'1.5-2', label:'6 to 8 cups', icon:'💧💧' },
                  { val:'2+', label:'More than 8 cups', icon:'🌊' },
                ].map(o => <OptionCard key={o.val} label={o.label} icon={o.icon} selected={eau === o.val} onClick={() => setEau(o.val)} />)}
              </div>
            </div>
            <div>
              <label style={{ fontSize:11, color:'rgba(0,0,0,0.45)', fontWeight:500, letterSpacing:0.5, textTransform:'uppercase', display:'block', marginBottom:8 }}>Skincare routine</label>
              <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                {[
                  { val:'none', label:'None', icon:'🤷' },
                  { val:'basic', label:'Basic', icon:'🧴' },
                  { val:'complete', label:'Complete', icon:'✨' },
                ].map(o => <OptionCard key={o.val} label={o.label} icon={o.icon} selected={skincare === o.val} onClick={() => setSkincare(o.val)} />)}
              </div>
            </div>
            <Btn label="Continue" onClick={next} disabled={!eau || !skincare} />
          </div>
        )}

        {/* STEP 8 — Stress + Auth gate */}
        {step === 8 && (
          <div style={{ flex:1, display:'flex', flexDirection:'column', paddingTop:40, gap:12 }}>
            {!stress ? (
              <>
                <StepHeader num={9} title="Your stress level" sub="How do you feel on a daily basis?" />
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {[
                    { val:'low', label:'Low — I feel calm', icon:'😌' },
                    { val:'moderate', label:'Moderate — some tension', icon:'😐' },
                    { val:'high', label:'High — often stressed', icon:'😰' },
                    { val:'extreme', label:'Extreme — exhausted', icon:'🔥' },
                  ].map(o => <OptionCard key={o.val} label={o.label} icon={o.icon} selected={stress === o.val} onClick={() => setStress(o.val)} />)}
                </div>
              </>
            ) : (
              <>
                {/* BLURRED SCORE PREVIEW */}
                <div style={{ position:'relative', marginBottom:16 }}>
                  <div style={{ filter:'blur(8px)', pointerEvents:'none', userSelect:'none', opacity:0.7 }}>
                    {/* Fake score ring */}
                    <div style={{ display:'flex', justifyContent:'center', marginBottom:8, position:'relative' }}>
                      <svg width={120} height={120} viewBox="0 0 120 120">
                        <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="7"/>
                        <circle cx="60" cy="60" r="54" fill="none" stroke="#FF9F0A" strokeWidth="7"
                          strokeLinecap="round" strokeDasharray={2 * Math.PI * 54} strokeDashoffset={2 * Math.PI * 54 * 0.48}
                          transform="rotate(-90 60 60)"/>
                        <text x="60" y="57" textAnchor="middle" dominantBaseline="middle"
                          style={{ fontFamily:sf, fontWeight:700, fontSize:28, fill:'#1A1A1A' }}>52</text>
                        <text x="60" y="72" textAnchor="middle" dominantBaseline="middle"
                          style={{ fontFamily:sf, fontSize:8, fill:'rgba(0,0,0,0.3)' }}>/ 100</text>
                      </svg>
                    </div>

                    {/* Category badges floating around */}
                    <div style={{ position:'relative', height:40, marginBottom:4 }}>
                      {/* Left side badges */}
                      <div style={{ position:'absolute', left:8, top:-90, display:'flex', flexDirection:'column', gap:6 }}>
                        <div style={{ background:'rgba(10,132,255,0.12)', borderRadius:8, padding:'4px 8px', fontSize:11, fontWeight:600, color:BLUE }}>💧 Water · 4/12</div>
                        <div style={{ background:'rgba(191,90,242,0.12)', borderRadius:8, padding:'4px 8px', fontSize:11, fontWeight:600, color:'#BF5AF2' }}>🌙 Sleep · 6/18</div>
                        <div style={{ background:'rgba(255,69,58,0.12)', borderRadius:8, padding:'4px 8px', fontSize:11, fontWeight:600, color:'#FF453A' }}>🧘 Stress · 4/14</div>
                      </div>
                      {/* Right side badges */}
                      <div style={{ position:'absolute', right:8, top:-90, display:'flex', flexDirection:'column', gap:6 }}>
                        <div style={{ background:'rgba(255,159,10,0.12)', borderRadius:8, padding:'4px 8px', fontSize:11, fontWeight:600, color:'#FF9F0A' }}>🏋️ Fitness · 8/20</div>
                        <div style={{ background:'rgba(48,209,88,0.12)', borderRadius:8, padding:'4px 8px', fontSize:11, fontWeight:600, color:'#30D158' }}>🥗 Nutrition · 7/18</div>
                        <div style={{ background:'rgba(100,210,255,0.12)', borderRadius:8, padding:'4px 8px', fontSize:11, fontWeight:600, color:'#64D2FF' }}>✨ Skincare · 5/10</div>
                      </div>
                    </div>

                    {/* Fake bell curve */}
                    <svg viewBox="0 0 300 130" style={{ width:'100%', maxWidth:280, display:'block', margin:'0 auto' }}>
                      <defs>
                        <linearGradient id="fakeGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#FF9F0A" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#FF9F0A" stopOpacity="0.03" />
                        </linearGradient>
                      </defs>
                      {(() => {
                        const pts: string[] = []
                        for (let i = 0; i <= 300; i++) {
                          const x = (i / 300) * 6 - 3
                          const y = Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI)
                          pts.push(`${i},${100 - y * 220}`)
                        }
                        return <>
                          <polygon points={`0,100 ${pts.join(' ')} 300,100`} fill="url(#fakeGrad)" />
                          <polyline points={pts.join(' ')} fill="none" stroke="#FF9F0A" strokeWidth="2" />
                        </>
                      })()}
                      <polygon points="150,104 156,104 153,98" fill="#1A1A1A" />
                      <text x="153" y="120" textAnchor="middle" style={{ fontSize:10, fontWeight:600, fill:'#1A1A1A', fontFamily:sf }}>You're here</text>
                    </svg>
                  </div>
                  {/* Lock overlay */}
                  <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <div style={{ background:'rgba(255,255,255,0.85)', borderRadius:16, padding:'10px 20px', display:'flex', alignItems:'center', gap:8 }}>
                      <span style={{ fontSize:18 }}>🔒</span>
                      <span style={{ fontSize:14, fontWeight:600, color:'#1A1A1A', letterSpacing:-0.3 }}>Enter email to reveal</span>
                    </div>
                  </div>
                </div>

                <p style={{ fontSize:12, color:'#FF453A', fontWeight:500, textAlign:'center', marginBottom:4, letterSpacing:-0.2 }}>
                  ⚠️ Your score will be deleted if you don't save it
                </p>
                <p style={{ fontSize:11, color:'rgba(0,0,0,0.3)', textAlign:'center', marginBottom:12 }}>
                  🔒 No spam, ever. Unsubscribe anytime.
                </p>

                <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                  <button onClick={async () => {
                    const data = { prenom, objectifs, poids: Number(poids), taille: Number(taille), age: Number(age), sport, eau, skincare, sleep, nutrition, stress }
                    localStorage.setItem('glowup_profile_pending', JSON.stringify(data))
                    await supabase.auth.signInWithOAuth({
                      provider: 'google',
                      options: { redirectTo: `${window.location.origin}/auth/callback` }
                    })
                  }} style={{ width:'100%', padding:'14px', background:'#F5F5F7', border:'none', borderRadius:14, color:'#000', fontSize:15, fontWeight:600, cursor:'pointer', fontFamily:sf, display:'flex', alignItems:'center', justifyContent:'center', gap:10 }}>
                    <svg width="18" height="18" viewBox="0 0 18 18">
                      <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
                      <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/>
                      <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z"/>
                      <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.31z"/>
                    </svg>
                    Continue with Google
                  </button>

                  <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                    <div style={{ flex:1, height:'0.5px', background:'rgba(0,0,0,0.08)' }} />
                    <span style={{ fontSize:12, color:'rgba(0,0,0,0.3)' }}>or</span>
                    <div style={{ flex:1, height:'0.5px', background:'rgba(0,0,0,0.08)' }} />
                  </div>

                  {authError && (
                    <p style={{ fontSize:12, color:'#FF453A', textAlign:'center', background:'rgba(255,69,58,0.1)', padding:'10px 14px', borderRadius:10, letterSpacing:-0.1 }}>
                      {authError}
                    </p>
                  )}

                  <input type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)}
                    style={{ width:'100%', padding:'14px 16px', background:'rgba(0,0,0,0.05)', border:`0.5px solid ${email ? BLUE : 'rgba(0,0,0,0.1)'}`, borderRadius:14, color:'#1A1A1A', fontSize:16, fontFamily:sf, outline:'none', letterSpacing:-0.2 }}
                  />

                  <button onClick={submit} disabled={loading || !isValidEmail(email)}
                    style={{ width:'100%', padding:'16px', background:(!isValidEmail(email) || loading) ? 'rgba(0,0,0,0.07)' : BLUE, border:'none', borderRadius:14, color:(!isValidEmail(email) || loading) ? 'rgba(0,0,0,0.3)' : '#fff', fontSize:16, fontWeight:600, cursor:(!isValidEmail(email) || loading) ? 'default' : 'pointer', fontFamily:sf, letterSpacing:-0.3, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                    {loading
                      ? <><span style={{ width:16,height:16,border:'2px solid rgba(0,0,0,0.3)',borderTopColor:'#1A1A1A',borderRadius:'50%',display:'inline-block',animation:'spin 0.8s linear infinite' }} />Generating your score...</>
                      : '⚡ Discover my Glow Up Score'}
                  </button>

                  <p style={{ fontSize:11, color:'rgba(0,0,0,0.2)', textAlign:'center' }}>
                    By continuing, you agree to our terms of use
                  </p>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none }
        * { box-sizing:border-box; margin:0; padding:0; }
        input::placeholder { color: rgba(0,0,0,0.2); }
        ::-webkit-scrollbar { display: none; }
        html, body { height: 100%; overflow: hidden; position: fixed; width: 100%; }
      `}</style>
    </main>
  )
}
